import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import { useSocketContext } from "../context/SocketContext";
import { 
  IoCall, 
  IoMic, 
  IoMicOff, 
  IoVideocam, 
  IoVideocamOff, 
  IoCloseCircleOutline 
} from "react-icons/io5";
import { BiPhoneOff } from "react-icons/bi";
import profilePic from "../../public/user.jpg";

function CallInterface() {
  const { onlineUsers } = useSocketContext();
  const {
    callState,

    callType,
    caller,
    receiver,
    localStream,
    remoteStream,
    isMuted,
    isCamOff,
    callDuration,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === "idle") return null;

  // Format call duration to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const remoteUser = caller || receiver || { fullname: "Unknown User" };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl text-white font-sans transition-all duration-300">
      
      {/* 1. OUTGOING DIALING STATE */}
      {callState === "calling" && (
        <div className="flex flex-col items-center justify-between h-[80vh] w-full max-w-md p-8 text-center">
          <div className="mt-16 space-y-6">
            {/* Avatar Pulse */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-indigo-500/30 animate-pulse" />
              <img
                src={profilePic}
                alt="profile"
                className="relative z-10 w-28 h-28 rounded-full border-4 border-indigo-500/30 object-cover shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{remoteUser.fullname}</h2>
              <p className="text-white/40 text-sm mt-2 font-medium uppercase tracking-widest animate-pulse">
                {remoteUser._id && onlineUsers.includes(remoteUser._id) ? "Ringing" : "Calling"} ({callType === "video" ? "Video" : "Audio"})...
              </p>
            </div>
          </div>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 transition-all flex items-center justify-center shadow-xl shadow-rose-900/50 hover:scale-105"
          >
            <BiPhoneOff className="text-3xl text-white transform rotate-[135deg]" />
          </button>
        </div>
      )}

      {/* 2. INCOMING CALL PROMPT STATE */}
      {callState === "incoming" && (
        <div className="flex flex-col items-center justify-between h-[80vh] w-full max-w-md p-8 text-center">
          <div className="mt-16 space-y-6">
            {/* Pulsing Ringing Avatar */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
              <img
                src={profilePic}
                alt="profile"
                className="relative z-10 w-28 h-28 rounded-full border-4 border-emerald-500/30 object-cover shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{remoteUser.fullname}</h2>
              <p className="text-white/40 text-sm mt-2 font-medium uppercase tracking-widest animate-pulse">
                Incoming {callType === "video" ? "Video" : "Audio"} Call...
              </p>
            </div>
          </div>

          {/* Accept / Decline Buttons */}
          <div className="flex gap-12 mb-8">
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 transition-all flex items-center justify-center shadow-xl shadow-rose-900/50 hover:scale-105"
            >
              <BiPhoneOff className="text-3xl text-white transform rotate-[135deg]" />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center shadow-xl shadow-emerald-900/50 hover:scale-105 animate-bounce"
              title={callType === "video" ? "Accept Video Call" : "Accept Audio Call"}
            >
              {callType === "video" ? (
                <IoVideocam className="text-3xl text-white" />
              ) : (
                <IoCall className="text-3xl text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. CONNECTING STATE */}
      {callState === "connecting" && (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md p-8 text-center space-y-6">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <div>
            <h3 className="text-xl font-bold">Connecting</h3>
            <p className="text-white/30 text-xs mt-2 uppercase tracking-widest font-bold">Establishing WebRTC Peer Connection</p>
          </div>
        </div>
      )}

      {/* 4. CONNECTED ACTIVE CALL STATE */}
      {callState === "connected" && (
        <div className="relative w-full h-full flex flex-col items-center justify-between">
          {/* Header overlay */}
          <div className="absolute top-8 left-8 z-50 flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-xl">
            <div className="leading-tight">
              <h4 className="text-sm font-black tracking-tight">{remoteUser.fullname}</h4>
              <p className="text-[10px] text-indigo-400 font-black tracking-wider mt-0.5 uppercase">
                {formatTime(callDuration)}
              </p>
            </div>
          </div>

          {/* Call Viewports */}
          {callType === "video" ? (
            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
              {/* Remote stream */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950">
                  <div className="text-center space-y-4">
                    <img
                      src={profilePic}
                      alt="profile"
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white/10"
                    />
                    <p className="text-white/30 text-xs font-bold uppercase tracking-wider animate-pulse">Waiting for Video feed...</p>
                  </div>
                </div>
              )}

              {/* Local stream (floating thumbnail) */}
              <div className="absolute top-8 right-8 z-40 w-32 h-44 rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl transition-all duration-300">
                {localStream && !isCamOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <IoVideocamOff className="text-2xl text-white/35" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Audio Call UI
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-10">
                {/* Simulated Waveform Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 scale-[1.6] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10 scale-[1.3] animate-pulse [animation-delay:0.3s]" />
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/5 scale-[2.0] animate-pulse [animation-delay:0.6s]" />
                
                <img
                  src={profilePic}
                  alt="profile"
                  className="relative z-10 w-28 h-28 rounded-full border-4 border-indigo-500 object-cover shadow-2xl"
                />
              </div>
              <h2 className="text-2xl font-black">{remoteUser.fullname}</h2>
              <div className="flex items-center gap-1.5 mt-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                 <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Audio Call Connected</p>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-10 z-50 flex items-center gap-6 bg-slate-900/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/5 shadow-2xl">
            {/* Toggle Mic */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isMuted
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-900/40"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isMuted ? <IoMicOff className="text-xl" /> : <IoMic className="text-xl" />}
            </button>

            {/* End Call */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 transition-all flex items-center justify-center shadow-xl shadow-rose-900/50 hover:scale-105"
            >
              <BiPhoneOff className="text-2xl text-white transform rotate-[135deg]" />
            </button>

            {/* Toggle Camera (Only for Video Call) */}
            {callType === "video" && (
              <button
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isCamOff
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-900/40"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {isCamOff ? <IoVideocamOff className="text-xl" /> : <IoVideocam className="text-xl" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. CALL ENDED STATE */}
      {callState === "ended" && (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-500 animate-pulse">
            <BiPhoneOff className="text-3xl transform rotate-[135deg]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Call Ended</h3>
            <p className="text-white/20 text-xs font-semibold uppercase tracking-widest mt-1">Connection Disconnected</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallInterface;
