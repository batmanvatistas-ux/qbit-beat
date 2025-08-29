
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
    <p className="text-gray-600 font-medium">Crafting your beat...</p>
    <style>
      {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}
    </style>
  </div>
);
