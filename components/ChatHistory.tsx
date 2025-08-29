
import React, { useRef, useEffect } from 'react';
import type { ChatMessage, BeatData, ModelContent } from '../types';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRegenerate: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, onRegenerate }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-normal text-black text-center leading-tight">
          Describe the beat you want.
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          For example, "a fast-paced trap beat with a heavy kick and triplets on the hi-hats".
        </p>
      </div>
    );
  }

  const lastModelMessageId = [...messages].reverse().find(m => m.role === 'model')?.id;

  return (
    <div className="w-full h-full flex-1 flex flex-col gap-8 overflow-y-auto pt-4 pb-8">
      {messages.map((msg) => {
        const isLastModelMessage = msg.id === lastModelMessageId && !isLoading;
        const beatData = (msg.content as ModelContent)?.beatData;

        return (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onRegenerate={isLastModelMessage ? onRegenerate : undefined}
            />
        );
      })}
      {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
        <ChatMessageItem key="loading" message={{ id: 'loading', role: 'model', content: {} }} />
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};