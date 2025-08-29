import type { BeatData } from '../types';

// Base64 encoded WAV audio samples for different drum types
const drumSamples: Record<string, string> = {
    kick: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA',
    snare: 'data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhBgAAAPv/7f/y/9c=',
    hihat: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAAsA/v8=',
    open_hat: 'data:audio/wav;base64,UklGRlwAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhUgAAAE9iYmNgZ2JgYWdnYGBgZmBgYGFhYWBgYWBgYGBfYF9gX2BfX15dXV1dXV1dXVxcW1pZWVlZWVlYV1ZWVlZVVFRUVFRPT09OTk5OTk5NTUxLS0tLS0pKSkpKSkpKSUpJR0dHR0dGRkZGRkZFRUVFRUVFRUVERERDQkJCPz8/Pz49PT09PTw7Ozs6Ojk5OTg3Nzc3Nzc2NjY1NjU1NTU0NDQzMzMyMjExMDEwLy8uLSwrKSkoKCcmJiYlJSUkIyMjISAgHx4eHRwbGhoZGRj/+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7',
    clap: 'data:audio/wav;base64,UklGRkoAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhRgAAAE9iYmNgZ2dnYGBgYGBgX2BfYF9fXV1dXFxbW1lZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVl-g'
};

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
let decodedSamples: Record<string, AudioBuffer> = {};

// Pre-decode all samples on script load
const decodeSamples = async () => {
    const promises = Object.entries(drumSamples).map(async ([name, dataUrl]) => {
        // Decode base64 data URL directly instead of using fetch
        let base64String = dataUrl.split(',')[1];
        
        // Sanitize the base64 string:
        // 1. Replace URL-safe characters with standard characters
        base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');
        // 2. Add padding if missing
        while (base64String.length % 4) {
            base64String += '=';
        }

        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        decodedSamples[name] = audioBuffer;
    });
    await Promise.all(promises);
};
decodeSamples();

// Function to convert an AudioBuffer to a WAV Blob
function bufferToWav(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels: Float32Array[] = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    for (i = 0; i < numOfChan; i++) {
        channels.push(buffer.getChannelData(i));
    }

    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    function setUint16(data: number) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: number) {
        view.setUint32(pos, data, true);
        pos += 4;
    }

    // Write PCM data
    for (i = 0; i < buffer.length; i++) {
        for (let chan = 0; chan < numOfChan; chan++) {
            sample = Math.max(-1, Math.min(1, channels[chan][i]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
}

export const renderBeatToWav = async (beatData: BeatData): Promise<Blob> => {
    if (Object.keys(decodedSamples).length === 0) {
        await decodeSamples(); // Ensure samples are decoded
    }
    
    const totalSteps = beatData.meta.bars * 16; // 64 steps for 4 bars
    const secondsPerStep = 60.0 / beatData.meta.bpm / 4.0;
    const durationInSeconds = totalSteps * secondsPerStep;

    const offlineContext = new OfflineAudioContext(2, Math.ceil(audioContext.sampleRate * durationInSeconds), audioContext.sampleRate);

    beatData.tracks.forEach(track => {
        const sampleBuffer = decodedSamples[track.drum];
        if (!sampleBuffer) {
            console.warn(`Sample for drum type "${track.drum}" not found.`);
            return;
        }

        track.steps.forEach((step, i) => {
            if (step === 1) {
                const time = i * secondsPerStep;
                const source = offlineContext.createBufferSource();
                source.buffer = sampleBuffer;
                source.connect(offlineContext.destination);
                source.start(time);
            }
        });
    });

    const renderedBuffer = await offlineContext.startRendering();
    return bufferToWav(renderedBuffer);
};