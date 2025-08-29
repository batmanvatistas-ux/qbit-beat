import React, { useRef, useEffect, useState } from 'react';
import { PlusIcon, ArrowUpIcon, MicrophoneIcon, StopIcon, XIcon } from './Icons';

interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string, file?: File) => void;
  isLoading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((value.trim() || attachedFile) && !isLoading) {
      onSubmit(value, attachedFile || undefined);
      setAttachedFile(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
            setAttachedFile(audioFile);
            stream.getTracks().forEach(track => track.stop()); // Stop microphone
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        timerIntervalRef.current = window.setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    } catch (err) {
        console.error("Microphone access denied or not available:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setRecordingTime(0);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  const isSubmitDisabled = (!value.trim() && !attachedFile) || isLoading;

  return (
    <div className={`relative flex items-center bg-white rounded-full border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:ring-2 focus-within:ring-black px-2 ${isRecording ? 'ring-2 ring-red-500' : ''}`}>
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="audio/*" className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex-shrink-0 p-2.5 ml-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-label="Add attachment" disabled={isLoading || isRecording || !!attachedFile}
      >
        <PlusIcon className="w-6 h-6 text-gray-500" />
      </button>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex-shrink-0 p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 ${isRecording ? 'text-red-500' : 'text-gray-500'}`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'} disabled={isLoading || !!attachedFile}
      >
        {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
      </button>

      {isRecording && <div className="text-sm text-red-600 font-mono flex-shrink-0">{formatTime(recordingTime)}</div>}
      
      {attachedFile && !isRecording && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-700">
              <span>{attachedFile.name}</span>
              <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-gray-200">
                  <XIcon className="w-3 h-3"/>
              </button>
          </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaInput}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? "Recording..." : "A laid back lo-fi hip hop beat..."}
        rows={1}
        className="flex-1 px-2 py-3.5 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 text-base leading-relaxed"
        style={{ maxHeight: '120px' }}
        disabled={isLoading || isRecording}
      />
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className={`flex-shrink-0 p-3 m-1.5 rounded-full transition-all duration-200 ${
          !isSubmitDisabled
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <ArrowUpIcon className="w-6 h-6" />
      </button>
    </div>
  );
};