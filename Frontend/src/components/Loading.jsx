import React from "react";

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100">
      {/* Glass Card */}
      <div className="w-72 rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-5">
        {/* Avatar Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 animate-pulse" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3 w-24 rounded-full bg-purple-200 animate-pulse" />
            <div className="h-3 w-16 rounded-full bg-pink-200 animate-pulse" />
          </div>
        </div>

        {/* Chat Bubble Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded-xl bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse" />
          <div className="h-4 w-5/6 rounded-xl bg-gradient-to-r from-pink-200 to-orange-200 animate-pulse" />
          <div className="h-4 w-3/4 rounded-xl bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse" />
        </div>

        {/* Input Skeleton */}
        <div className="h-10 w-full rounded-full bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 animate-pulse" />
      </div>
    </div>
  );
}

export default Loading;
