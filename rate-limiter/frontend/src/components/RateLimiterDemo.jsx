import React, { useState, useCallback } from "react";
import { useRateLimit } from "../hooks/useRateLimit";
import RequestQueue from "./RequestQueue";

const RateLimiterDemo = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("token-bucket");
  const { makeRequest, requestQueue, stats, isLoading } = useRateLimit();

  const handleRequest = useCallback(() => {
    makeRequest(selectedAlgorithm);
  }, [selectedAlgorithm, makeRequest]);

  const handleBurstRequests = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => makeRequest(selectedAlgorithm), i * 100);
    }
  }, [selectedAlgorithm, makeRequest]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ⚡ Rate Limiter Demo
          </h1>
          <p className="text-blue-100 text-lg">
            Test different rate limiting algorithms in real-time
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl mb-8">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Choose Algorithm
              </label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value)}
                className="w-full px-4 py-3 bg-white/90 border-2 border-transparent rounded-xl 
                text-gray-800 font-medium focus:border-blue-400 focus:outline-none 
                focus:ring-4 focus:ring-blue-400/30 transition-all duration-200
                backdrop-blur-sm shadow-lg"
              >
                <option value="token-bucket">🪣 Token Bucket</option>
                <option value="sliding-window">📊 Sliding Window</option>
                <option value="fixed-window">⏰ Fixed Window</option>
                <option value="leaky-bucket">💧 Leaky Bucket</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRequest}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 
                hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl
                transform hover:scale-105 active:scale-95 transition-all duration-200
                shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                disabled:transform-none relative overflow-hidden"
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isLoading ? "opacity-50" : ""}>
                  🚀 Single Request
                </span>
              </button>
              <button
                onClick={handleBurstRequests}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 
                         hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl
                         transform hover:scale-105 active:scale-95 transition-all duration-200
                         shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                         disabled:transform-none relative overflow-hidden"
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isLoading ? "opacity-50" : ""}>
                  💥 Burst (10 requests)
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 
                        shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-green-300 text-sm font-semibold uppercase tracking-wide mb-2">
                Successful
              </div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats.successful}
              </div>
              <div className="w-full bg-green-900/30 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.successful /
                        (stats.successful + stats.rateLimited)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-red-400/30 
                        shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-red-300 text-sm font-semibold uppercase tracking-wide mb-2">
                Rate Limited
              </div>
              <div className="text-4xl font-bold text-red-400 mb-2">
                {stats.rateLimited}
              </div>
              <div className="w-full bg-red-900/30 rounded-full h-2">
                <div
                  className="bg-red-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (stats.rateLimited /
                        (stats.successful + stats.rateLimited)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/30 
                        shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-blue-300 text-sm font-semibold uppercase tracking-wide mb-2">
                Remaining
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {stats.remaining}
              </div>
              <div className="w-full bg-blue-900/30 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500 animate-pulse"
                  style={{
                    width: `${Math.min(100, (stats.remaining / 10) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <RequestQueue requests={requestQueue} />
      </div>
    </div>
  );
};

export default RateLimiterDemo;
