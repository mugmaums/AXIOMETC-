import React, { useEffect, useRef } from 'react';

export const AmbientAudio: React.FC = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const isStarted = useRef(false);
  const intervals = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const initAudio = () => {
      if (isStarted.current) return;
      
      const Context = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Context) return;
      
      audioCtx.current = new Context();
      isStarted.current = true;

      // 1. Distant Clock (Deep, resonant tick)
      const playTick = () => {
        if (!audioCtx.current || audioCtx.current.state === 'suspended') return;
        const now = audioCtx.current.currentTime;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
        
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      };

      // 2. Faint Whispers (Spectral noise)
      const playWhisper = () => {
        if (!audioCtx.current || audioCtx.current.state === 'suspended') return;
        const now = audioCtx.current.currentTime;
        const duration = 2 + Math.random() * 3;
        const bufferSize = audioCtx.current.sampleRate * duration;
        const buffer = audioCtx.current.createBuffer(1, bufferSize, audioCtx.current.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const source = audioCtx.current.createBufferSource();
        source.buffer = buffer;
        
        const filter = audioCtx.current.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);
        filter.Q.value = 5;
        
        const gain = audioCtx.current.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.0015, now + duration * 0.4);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.current.destination);
        
        source.start(now);
      };

      // 3. Paper Rustle
      const playPaper = () => {
        if (!audioCtx.current || audioCtx.current.state === 'suspended') return;
        const now = audioCtx.current.currentTime;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2000 + Math.random() * 1000, now);
        gain.gain.setValueAtTime(0.002, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      };

      // Intervals
      intervals.current.push(setInterval(playTick, 1000));
      intervals.current.push(setInterval(() => {
        if (Math.random() > 0.5) playWhisper();
      }, 6000));
      intervals.current.push(setInterval(() => {
        if (Math.random() > 0.7) playPaper();
      }, 4000));

      // Handle suspended state
      if (audioCtx.current && audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
    };

    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      intervals.current.forEach(id => clearInterval(id));
      const ctx = audioCtx.current;
      if (ctx) {
        ctx.close().catch(() => {});
      }
    };
  }, []);

  return null;
};
