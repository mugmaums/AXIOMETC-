import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Using standard procedural-style web audio or base64 data for sounds
// Since we are strictly zero-404, we will use frequencies for simple sounds
// or noise for scratches.

export function useRoyalAudio() {
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioCtx.current?.close();
    };
  }, []);

  const playWoodClick = () => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.current.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.1);
  };

  const playSlide = (duration = 0.5) => {
    if (!audioCtx.current) return;
    const noise = audioCtx.current.createBufferSource();
    const bufferSize = audioCtx.current.sampleRate * duration;
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioCtx.current.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioCtx.current.currentTime + duration);
    
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    noise.start();
  };

  const playScratch = (velocity: number) => {
    if (!audioCtx.current || velocity < 0.1) return;
    const noise = audioCtx.current.createBufferSource();
    const duration = 0.1;
    const bufferSize = audioCtx.current.sampleRate * duration;
    const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    const filter = audioCtx.current.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000 + velocity * 1000, audioCtx.current.currentTime);
    
    const gain = audioCtx.current.createGain();
    gain.gain.setValueAtTime(Math.min(0.02 * velocity, 0.05), audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    noise.start();
  };

  return { playWoodClick, playSlide, playScratch };
}
