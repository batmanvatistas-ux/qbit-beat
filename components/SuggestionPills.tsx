import React from 'react';

interface SuggestionPillsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestionPills: React.FC<SuggestionPillsProps> = ({ suggestions, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 animate-fade-in">
      <div className="flex items-center gap-2 whitespace-nowrap">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .overflow-x-auto {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
