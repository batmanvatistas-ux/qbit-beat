import React, { useState, useCallback } from 'react';
import { InputBar } from './components/InputBar';
import { generateBeat } from './services/geminiService';
import type { ChatMessage, BeatData, ModelContent, Attachment } from './types';
import { Logo } from './components/Logo';
import { ChatHistory } from './components/ChatHistory';
import { SuggestionPills } from './components/SuggestionPills';

const suggestions = [
  'A classic boom-bap hip hop beat',
  'Energetic house music drum loop',
  'Slow and moody lo-fi beat',
  'Fast-paced trap beat with triplet hi-hats',
  'A simple, funky disco drum pattern',
  'Industrial techno rhythm',
];


export default function App(): React.ReactElement {
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = useCallback(async (currentPrompt: string, attachmentFile?: File) => {
    if ((!currentPrompt.trim() && !attachmentFile) || isLoading) return;

    let allNewMessages: ChatMessage[] = [];
    let attachment: Attachment | undefined = undefined;

    if (attachmentFile) {
        attachment = {
            url: URL.createObjectURL(attachmentFile),
            name: attachmentFile.name,
            type: 'audio',
        };
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          role: 'system',
          content: "Note: The AI can't listen to audio yet, but it will respond to your text prompt to create or modify a beat.",
        };
        allNewMessages.push(systemMessage);
    }
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentPrompt,
      attachment,
    };
    allNewMessages.push(userMessage);
    
    setMessages(prev => [...prev, ...allNewMessages]);

    if (!currentPrompt.trim()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Find the last beat from the conversation to allow for modification
      const lastModelMessage = [...messages, ...allNewMessages].reverse().find(m => m.role === 'model' && (m.content as ModelContent)?.beatData);
      const baseBeat = lastModelMessage ? (lastModelMessage.content as ModelContent).beatData : undefined;

      const modelContent = await generateBeat(currentPrompt, baseBeat);
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: modelContent,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        role: 'system',
        content: err instanceof Error ? err.message : 'An unknown error occurred.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);
  
  const handleRegenerate = useCallback(async () => {
    if (isLoading) return;

    const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMessageIndex > -1) {
        const lastUserMessage = messages[lastUserMessageIndex];
        const lastUserPrompt = lastUserMessage.content as string;
        
        // Find the attachment associated with the last user message to resubmit
        const lastAttachmentUrl = lastUserMessage.attachment?.url;
        let lastAttachmentFile: File | undefined;
        if (lastAttachmentUrl) {
            const response = await fetch(lastAttachmentUrl);
            const blob = await response.blob();
            lastAttachmentFile = new File([blob], lastUserMessage.attachment!.name);
        }

        const conversationToRetry = messages.slice(0, lastUserMessageIndex);
        setMessages(conversationToRetry);
        await handleSubmit(lastUserPrompt, lastAttachmentFile);
    }
  }, [messages, isLoading, handleSubmit]);

  const handleFormSubmit = (text: string, file?: File) => {
    handleSubmit(text, file);
    setPrompt('');
  }

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (isLoading) return;
    handleSubmit(suggestion);
  }, [handleSubmit, isLoading]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-4 selection:bg-black selection:text-white">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-center z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200">
          <Logo />
          <h1 className="text-xl font-bold tracking-tighter text-gray-900">qbit</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full max-w-4xl px-4 pt-24 pb-56 overflow-hidden">
        <div className="w-full h-full flex flex-col">
            <ChatHistory
                messages={messages}
                isLoading={isLoading}
                onRegenerate={handleRegenerate}
            />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/50 backdrop-blur-lg border-t border-gray-100 px-4 py-4">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
            {messages.length === 0 && !isLoading && (
              <SuggestionPills suggestions={suggestions} onSelect={handleSuggestionSelect} />
            )}
            <InputBar
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
        </div>
      </footer>
    </div>
  );
}