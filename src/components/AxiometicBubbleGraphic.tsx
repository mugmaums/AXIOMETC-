import React from 'react';

interface AxiometicBubbleGraphicProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  isAnimated?: boolean;
  className?: string;
  showHalo?: boolean;
}

export const AxiometicLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="axiometic-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="30%" stopColor="#fcf29e" />
          <stop offset="70%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <filter id="axiometic-glow-filter" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z"
        fill="url(#axiometic-star-grad)"
        filter="url(#axiometic-glow-filter)"
      />
    </svg>
  );
};

export const AxiometicBubbleGraphic: React.FC<AxiometicBubbleGraphicProps> = ({
  size = 'md',
  isAnimated = true,
  className = '',
  showHalo = true,
}) => {
  const sizeMap = {
    xs: { container: 'w-6 h-6', icon: 10, halo: 'inset-[-4px]' },
    sm: { container: 'w-10 h-10', icon: 16, halo: 'inset-[-8px]' },
    md: { container: 'w-14 h-14', icon: 24, halo: 'inset-[-12px]' },
    lg: { container: 'w-20 h-20', icon: 34, halo: 'inset-[-18px]' },
    xl: { container: 'w-28 h-28', icon: 46, halo: 'inset-[-24px]' },
    hero: { container: 'w-36 h-36', icon: 60, halo: 'inset-[-32px]' },
  };

  const currentSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Circular Fading Aura with Golden Radiance */}
      {showHalo && (
        <div
          className={`absolute ${currentSize.halo} rounded-full blur-2xl pointer-events-none ${
            isAnimated ? 'animate-pulse' : ''
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(154, 52, 18, 0.25) 45%, rgba(45, 20, 11, 0.6) 75%, transparent 100%)',
          }}
        />
      )}

      {/* Orbiting Subtle Fading Wave Rings */}
      {isAnimated && (
        <>
          <div
            className={`absolute ${currentSize.container} rounded-full border border-gold-accent/25 scale-125 animate-ping pointer-events-none`}
            style={{ animationDuration: '3.8s' }}
          />
          <div
            className={`absolute ${currentSize.container} rounded-full border border-gold-accent/20 scale-150 animate-pulse pointer-events-none`}
            style={{ animationDuration: '2.5s' }}
          />
        </>
      )}

      {/* Circular Fading Polished Wood/Glass Bubble */}
      <div
        className={`relative ${currentSize.container} rounded-full border border-gold-accent/30 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all duration-300 hover:scale-105 hover:border-gold-accent/50`}
        style={{
          background:
            'radial-gradient(circle at 35% 30%, rgba(253, 250, 240, 0.25) 0%, rgba(212, 175, 55, 0.3) 35%, rgba(45, 20, 11, 0.85) 85%, #1a0f0a 100%)',
        }}
      >
        {/* Curved Glare Specular Highlight */}
        <div className="absolute top-1.5 left-2.5 w-1/3 h-1/4 rounded-full bg-white/40 blur-[1px] pointer-events-none -rotate-45" />
        
        {/* Subtle Inner Gold Rim */}
        <div className="absolute inset-0 rounded-full border border-gold-accent/20 pointer-events-none" />

        {/* Axiometic 4-Point Star Diamond Logo */}
        <AxiometicLogo size={currentSize.icon} />
      </div>
    </div>
  );
};
