import React from "react";

const RequestQueue = ({ requests }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        📊 Request History
        <span className="text-sm bg-blue-500/30 px-3 py-1 rounded-full">
          Last {Math.min(requests.length, 20)}
        </span>
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {requests
          .slice(-20)
          .reverse()
          .map((request, index) => (
            <div
              key={request.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300
                     transform hover:scale-[1.02] border ${
                       request.status === "success"
                         ? "bg-green-500/20 border-green-400/30 hover:bg-green-500/30"
                         : "bg-red-500/20 border-red-400/30 hover:bg-red-500/30"
                     } ${
                index === 0 ? "ring-2 ring-white/50 animate-pulse" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`text-2xl ${
                    request.status === "success"
                      ? "animate-bounce"
                      : "animate-pulse"
                  }`}
                >
                  {request.status === "success" ? "✅" : "❌"}
                </div>

                <div>
                  <div className="text-white font-medium">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-gray-300 text-sm capitalize">
                    {request.algorithm.replace("-", " ")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === "success"
                      ? "bg-green-400 text-green-900"
                      : "bg-red-400 text-red-900"
                  }`}
                >
                  {request.status === "success" ? "SUCCESS" : "BLOCKED"}
                </div>

                <div className="text-blue-300 text-sm font-mono">
                  {request.responseTime}ms
                </div>
              </div>
            </div>
          ))}
        {requests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🎯</div>
            <p>No requests yet. Try making some requests!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestQueue;
