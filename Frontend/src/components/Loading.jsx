import React from "react";

function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {/* Glass Loading Card */}
      <div className="w-full max-w-sm glass-card rounded-[2.5rem] p-8 flex flex-col gap-8 animate-in fade-in duration-700">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/[0.05] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-24 rounded-full bg-white/[0.05] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer" />
            </div>
            <div className="h-2 w-16 rounded-full bg-white/[0.03] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Chat Bubbles Skeletons */}
        <div className="space-y-4">
          <div className="h-4 w-full rounded-2xl bg-white/[0.03] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer" />
          </div>
          <div className="h-4 w-[90%] rounded-2xl bg-white/[0.03] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer" />
          </div>
          <div className="h-4 w-[75%] rounded-2xl bg-white/[0.03] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="h-12 w-full rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default Loading;
