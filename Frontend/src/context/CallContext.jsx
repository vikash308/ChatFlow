import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSocketContext } from "./SocketContext";
import { useAuth } from "./AuthProvider";
import toast from "react-hot-toast";

const CallContext = createContext();

export const useCall = () => {
  return useContext(CallContext);
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocketContext();
  const [authUser] = useAuth();

  const [callState, setCallState] = useState("idle"); // 'idle', 'calling', 'incoming', 'connecting', 'connected', 'ended'
  const [callType, setCallType] = useState("audio"); // 'audio', 'video'
  const [caller, setCaller] = useState(null); // The user calling us
  const [receiver, setReceiver] = useState(null); // The user we are calling
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const pc = useRef(null);
  const localStreamRef = useRef(null);
  const candidatesQueue = useRef([]);

  // ✅ FIX: Track callType in a ref so socket event handlers always get fresh value
  const callTypeRef = useRef("audio");
  const setCallTypeWithRef = (type) => {
    callTypeRef.current = type;
    setCallType(type);
  };

  // Ringtone / Dial tone synthesis
  const ringtoneContextRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);
  const ringTimeoutRef = useRef(null); // Timeout for "no answer"

  const clearRingTimeout = () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  };

  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (ringtoneContextRef.current) {
      try {
        ringtoneContextRef.current.close();
      } catch (e) {}
      ringtoneContextRef.current = null;
    }
  };

  const playRingtone = (type) => {
    try {
      stopRingtone();
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      ringtoneContextRef.current = ctx;

      const playSound = () => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === "incoming") {
          osc1.type = "sine";
          osc2.type = "sine";
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.setValueAtTime(480, ctx.currentTime);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 1.8);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

          osc1.start(ctx.currentTime);
          osc2.start(ctx.currentTime);
          osc1.stop(ctx.currentTime + 2.0);
          osc2.stop(ctx.currentTime + 2.0);
        } else if (type === "outgoing") {
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(425, ctx.currentTime);

          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 1.2);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.4);

          osc1.start(ctx.currentTime);
          osc1.stop(ctx.currentTime + 1.4);
        }
      };

      playSound();
      ringtoneIntervalRef.current = setInterval(playSound, 3000);
    } catch (err) {
      console.warn("Audio synthesis blocked or failed:", err);
    }
  };

  // Clean up WebRTC media and peer connection
  const cleanUpMedia = () => {
    stopRingtone();
    clearRingTimeout();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    candidatesQueue.current = [];
    setIsMuted(false);
    setIsCamOff(false);
    setIsScreenSharing(false);
  };

  // Initialize WebRTC RTCPeerConnection
  const initializePeerConnection = (targetUserId) => {
    if (pc.current) {
      pc.current.close();
    }

    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];

    const turnUrl = import.meta.env.VITE_TURN_URL;
    const turnUsername = import.meta.env.VITE_TURN_USERNAME;
    const turnCredential = import.meta.env.VITE_TURN_PASSWORD;

    if (turnUrl) {
      iceServers.push({
        urls: turnUrl,
        username: turnUsername,
        credential: turnCredential,
      });
    }

    pc.current = new RTCPeerConnection({ iceServers });

    pc.current.onicecandidate = (event) => {
      if (event.candidate && socket && authUser) {
        socket.emit("ice-candidate", {
          to: targetUserId,
          from: authUser.user._id,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      console.log("✅ Remote track received, streams:", event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // ✅ Log and handle ICE connection state changes
    pc.current.oniceconnectionstatechange = () => {
      const state = pc.current?.iceConnectionState;
      console.log("ICE connection state:", state);
      
      if (state === "disconnected" || state === "failed") {
        console.warn("Network connection lost. Ending call automatically.");
        toast.error("Network connection lost");
        endCall();
      }
    };

    pc.current.onconnectionstatechange = () => {
      console.log("Peer connection state:", pc.current?.connectionState);
    };
  };

  // Process queued ICE candidates
  const processQueuedCandidates = async () => {
    if (!pc.current) return;
    while (candidatesQueue.current.length > 0) {
      const candidate = candidatesQueue.current.shift();
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
  };

  // 1. Start Call (Caller)
  const startCall = async (targetUser, type) => {
    if (!socket || !authUser) {
      console.warn("Cannot start call: socket or authUser is missing", { socket, authUser });
      return;
    }
    
    // Guard against starting a call when already busy
    if (callState !== "idle") {
      toast.error("You are already in a call");
      return;
    }

    console.log("startCall triggered for user:", targetUser._id, "type:", type);
    setCallState("calling");
    setCallTypeWithRef(type); // ✅ use ref-tracked setter
    setReceiver(targetUser);
    playRingtone("outgoing");

    socket.emit("call-user", {
      to: targetUser._id,
      from: {
        _id: authUser.user._id,
        fullname: authUser.user.fullname,
      },
      callType: type,
    });

    // Automatically end call if not picked up in 45 seconds
    ringTimeoutRef.current = setTimeout(() => {
      toast.error("User is not answering the call");
      
      if (socket && authUser) {
        socket.emit("end-call", {
          to: targetUser._id,
          from: authUser.user._id,
        });
      }
      
      cleanUpMedia();
      setCallState("ended");
      setTimeout(() => {
        setCallState("idle");
        setCaller(null);
        setReceiver(null);
      }, 2000);
    }, 45000);
  };

  // 2. Accept Call (Receiver)
  const acceptCall = async () => {
    if (!socket || !caller || !authUser) return;

    stopRingtone();
    setCallState("connecting");

    socket.emit("call-accepted", {
      to: caller._id,
      from: authUser.user._id,
    });
  };

  // 3. Reject Call (Receiver)
  const rejectCall = () => {
    if (!socket || !caller || !authUser) return;

    stopRingtone();
    socket.emit("call-rejected", {
      to: caller._id,
      from: authUser.user._id,
    });
    setCallState("idle");
    setCaller(null);
  };

  // 4. End Call (Either party)
  const endCall = () => {
    if (!socket || !authUser) return;

    const targetId = caller?._id || receiver?._id;
    if (targetId) {
      socket.emit("end-call", {
        to: targetId,
        from: authUser.user._id,
      });
    }

    cleanUpMedia();
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
      setCaller(null);
      setReceiver(null);
    }, 2000);
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current && callTypeRef.current === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle Screen Share (WebMeet Style replaceTrack)
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in peer connection
        if (pc.current) {
          const sender = pc.current.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            await sender.replaceTrack(screenTrack);
          }
        }

        // Update local video element
        if (localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
             oldVideoTrack.stop();
             localStreamRef.current.removeTrack(oldVideoTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        // Auto revert when user stops from browser UI
        screenTrack.onended = async () => {
          await stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        await stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share failed:", err);
      toast.error("Screen sharing cancelled or not supported");
    }
  };

  const stopScreenShare = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: callTypeRef.current === "video",
        audio: true,
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];

      if (pc.current) {
        const sender = pc.current.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }
      }

      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
            oldVideoTrack.stop();
            localStreamRef.current.removeTrack(oldVideoTrack);
        }
        if (cameraTrack) {
            localStreamRef.current.addTrack(cameraTrack);
        }
        
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = !isMuted;
        
        if (cameraTrack) cameraTrack.enabled = !isCamOff;

        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error("Failed to revert screen share:", err);
    }
  };

  // Timer Effect for connected calls
  useEffect(() => {
    let timer;
    if (callState === "connected") {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  // Handle Socket Events for Calling
  useEffect(() => {
    if (!socket || !authUser) return;

    // A. Incoming Call
    const onIncomingCall = ({ from, callType: incomingType }) => {
      console.log("onIncomingCall received from caller:", from, "type:", incomingType);
      setCallState((prev) => {
        if (prev !== "idle") {
          console.log("Rejecting call as busy (state is not idle):", prev);
          socket.emit("call-rejected", {
            to: from._id,
            from: authUser.user._id,
            reason: "busy",
          });
          return prev; // keep old state unchanged
        }
        // Accepted: update caller info and type
        setCaller(from);
        setCallTypeWithRef(incomingType); // ✅ set ref too
        playRingtone("incoming");
        return "incoming";
      });
    };

    // B. Call Accepted (Caller handles WebRTC Offer initiation)
    const onCallAccepted = async ({ from }) => {
      stopRingtone();
      clearRingTimeout();
      setCallState("connecting");

      try {
        // ✅ FIX: Read callType from ref, NOT from closure state
        const currentCallType = callTypeRef.current;
        console.log("onCallAccepted: getting media for callType:", currentCallType);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: currentCallType === "video",
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        initializePeerConnection(from);

        // Add all tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        socket.emit("offer", {
          to: from,
          from: authUser.user._id,
          offer,
        });
      } catch (err) {
        console.error("Failed to access media devices:", err);
        toast.error("Camera/Microphone access denied. Please allow permissions.");
        endCall();
      }
    };

    // C. Call Rejected
    const onCallRejected = ({ from }) => {
      stopRingtone();
      cleanUpMedia();
      toast.error("Call declined or dropped");
      setCallState("ended");
      setTimeout(() => {
        setCallState("idle");
        setCaller(null);
        setReceiver(null);
      }, 2000);
    };

    // D. Offer Received (Receiver handles Offer and creates Answer)
    const onOffer = async ({ from, offer }) => {
      try {
        clearRingTimeout();
        const currentCallType = callTypeRef.current;
        console.log("onOffer received: getting media for callType:", currentCallType);

        // Only request media and initialize PC if it's the first offer
        if (!pc.current || pc.current.signalingState === "closed") {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: currentCallType === "video",
          });

          localStreamRef.current = stream;
          setLocalStream(stream);

          initializePeerConnection(from);

          // Add tracks
          stream.getTracks().forEach((track) => {
            pc.current.addTrack(track, stream);
          });
        }

        // Set remote offer description
        await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
        await processQueuedCandidates();

        // Create answer
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);

        socket.emit("answer", {
          to: from,
          from: authUser.user._id,
          answer,
        });

        setCallState("connected");
      } catch (err) {
        console.error("Failed to accept WebRTC offer:", err);
        toast.error("Failed to connect media streams. Check camera/mic permissions.");
        endCall();
      }
    };

    // E. Answer Received (Caller sets remote answer)
    const onAnswer = async ({ from, answer }) => {
      try {
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          await processQueuedCandidates();
          setCallState("connected");
        }
      } catch (err) {
        console.error("Failed to set remote answer:", err);
        toast.error("WebRTC connection handshake failed");
        endCall();
      }
    };

    // F. ICE Candidate Received
    const onIceCandidate = async ({ from, candidate }) => {
      if (pc.current && pc.current.remoteDescription && pc.current.remoteDescription.type) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding remote ICE candidate:", err);
        }
      } else {
        candidatesQueue.current.push(candidate);
      }
    };

    // G. End Call Received
    const onEndCall = () => {
      cleanUpMedia();
      setCallState("ended");
      setTimeout(() => {
        setCallState("idle");
        setCaller(null);
        setReceiver(null);
      }, 2000);
    };

    socket.on("incoming-call", onIncomingCall);
    socket.on("call-accepted", onCallAccepted);
    socket.on("call-rejected", onCallRejected);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("end-call", onEndCall);

    return () => {
      socket.off("incoming-call", onIncomingCall);
      socket.off("call-accepted", onCallAccepted);
      socket.off("call-rejected", onCallRejected);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("end-call", onEndCall);
    };
  }, [socket, authUser]); // ✅ FIX: Removed callState and callType from deps — handlers use refs now

  // Global cleanup on unmount
  useEffect(() => {
    return () => {
      cleanUpMedia();
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        caller,
        receiver,
        localStream,
        remoteStream,
        isMuted,
        isCamOff,
        callDuration,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
        isScreenSharing,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
