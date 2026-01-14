'use client';

import { Button } from '@/components/ui/button';

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  'What is the current market outlook and key trends?',
  'Analyze my portfolio performance',
  'What is my risk level?',
  'What are the best investment opportunities right now?',
];

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      {/* Animated AI Visual */}
      <div className="relative lg:w-52 lg:h-52 w-40 h-40 border-2 border-[#edf9cd] rounded-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain rounded-full"
        >
          <source src="/fluid-motion.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Suggestion Questions */}
      <div className="w-full max-w-2xl">
        <div className="flex flex-row gap-4 justify-center flex-wrap">
          {SUGGESTIONS.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-fit h-auto py-4 px-0 rounded-xl border hover:bg-[#edf9cd]/50 transition-all bg-white/80 backdrop-blur-sm"
              style={{ borderColor: '#edf9cd' }}
              onClick={() => onSuggestionClick(suggestion)}
            >
              <span className="text-sm font-medium px-5" style={{ color: '#083423' }}>
                {suggestion}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
