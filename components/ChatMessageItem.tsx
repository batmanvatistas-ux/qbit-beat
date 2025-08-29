
import React from 'react';
import type { ChatMessage, ModelContent, BeatData } from '../types';
import { BeatVisualizer } from './BeatVisualizer';
import { LoadingSpinner } from './LoadingSpinner';
import { RegenerateIcon } from './Icons';

interface ChatMessageItemProps {
    message: ChatMessage;
    onRegenerate?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onRegenerate }) => {
    switch (message.role) {
        case 'user':
            const textContent = message.content as string;
            return (
                <div className="self-end max-w-2xl w-full flex flex-col items-end gap-2">
                    <div className="bg-gray-100 rounded-2xl rounded-br-md px-5 py-3">
                        {textContent && <p className="text-gray-800 whitespace-pre-wrap">{textContent}</p>}
                        {message.attachment && (
                            <div className={`pt-2 ${textContent ? 'mt-2 border-t border-gray-200' : ''}`}>
                                <audio controls src={message.attachment.url} className="w-full h-10"></audio>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'model':
            const { beatData, text } = message.content as ModelContent;
            if (!beatData) {
                return (
                    <div className="self-start w-full max-w-4xl">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                            <LoadingSpinner />
                        </div>
                    </div>
                );
            }
            return (
                <div className="self-start w-full max-w-4xl animate-fade-in flex flex-col gap-4">
                    <h2 className="text-base font-semibold text-gray-800">Composed track</h2>
                    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <BeatVisualizer beatData={beatData} />
                    </div>
                    <div className="flex flex-col gap-2">
                        {text && <p className="text-gray-700">{text}</p>}
                        {onRegenerate && (
                            <div className="flex items-center gap-1 -ml-2">
                                <button onClick={onRegenerate} className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Regenerate">
                                    <RegenerateIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                     <style>
                        {`
                            @keyframes fade-in {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                            .animate-fade-in {
                                animation: fade-in 0.5s ease-out forwards;
                            }
                        `}
                    </style>
                </div>
            );

        case 'system':
            const isError = (message.content as string).toLowerCase().includes('failed');
            return (
                 <div className="self-center w-full max-w-4xl">
                    <div className={`p-4 rounded-2xl text-center ${
                        isError 
                            ? 'bg-red-50 border border-red-200' 
                            : 'bg-blue-50 border border-blue-200'
                    }`}>
                        <p className={`text-sm ${
                            isError 
                                ? 'text-red-700' 
                                : 'text-blue-700'
                        }`}>
                            {message.content as string}
                        </p>
                    </div>
                 </div>
            );
        default:
            return null;
    }
}
