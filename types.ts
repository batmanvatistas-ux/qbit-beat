export interface ADSR {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface Track {
  id: string;
  type: 'drum';
  drum: string;
  steps: number[];
  adsr: ADSR;
}

export interface BeatData {
  meta: {
    bpm: number;
    bars: number;
  };
  tracks: Track[];
}

export interface ModelContent {
  text?: string;
  beatData?: BeatData;
}

export interface Attachment {
  url: string; // Blob URL
  name: string;
  type: 'audio';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string | ModelContent;
  attachment?: Attachment;
}