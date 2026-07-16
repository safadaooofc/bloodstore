import React from 'react';

export const CleanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090a0f]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-45 filter brightness-90 contrast-125 pointer-events-none"
      >
        <source src="/fotos/videos/animation.mp4" type="video/mp4" />
      </video>
      {/* Dark red/black overlays for contrast and readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-[#090a0f]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />
    </div>
  );
};
