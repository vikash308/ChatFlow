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
  const [callDuration, setCallDuration] = useState(0);

  const pc = useRef(null);
  const localStreamRef = useRef(null);
  const candidatesQueue = useRef([]);

  // Ringtone / Dial tone synthesis
  const ringtoneContextRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);

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
          // High-pitched alternating ringtone (standard telephone ring)
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
          // Dialing tone (low tut-tut sound)
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
  };

  // Initialize WebRTC RTCPeerConnection
  const initializePeerConnection = (targetUserId) => {
    if (pc.current) {
      pc.current.close();
    }

    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });

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
      console.log("Received remote track, streams:", event.streams);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
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

    console.log("startCall triggered for user:", targetUser._id, "type:", type);
    setCallState("calling");
    setCallType(type);
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
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
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
      console.log("onIncomingCall received from caller:", from, "type:", incomingType, "current callState:", callState);
      // If busy, auto reject call
      if (callState !== "idle") {
        console.log("Rejecting call as busy (state is not idle)");
        socket.emit("call-rejected", {
          to: from._id,
          from: authUser.user._id,
          reason: "busy",
        });
        return;
      }
      setCaller(from);
      setCallType(incomingType);
      setCallState("incoming");
      playRingtone("incoming");
    };

    // B. Call Accepted (Caller handles WebRTC Offer initiation)
    const onCallAccepted = async ({ from }) => {
      stopRingtone();
      setCallState("connecting");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        initializePeerConnection(from);

        // Add tracks
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
        toast.error("Could not access camera/microphone");
        endCall();
      }
    };

    // C. Call Rejected
    const onCallRejected = ({ from }) => {
      stopRingtone();
      toast.error("Call declined");
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === "video",
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        initializePeerConnection(from);

        // Add tracks
        stream.getTracks().forEach((track) => {
          pc.current.addTrack(track, stream);
        });

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
        toast.error("Failed to connect media streams");
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
  }, [socket, authUser, callState, callType]);

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
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
