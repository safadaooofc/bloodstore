import React from 'react';

export const CleanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090a0f]">
      {/* Sleek corporate dark background with subtle ambient ruby glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#ff003c]/10 via-[#ff003c]/5 to-transparent filter blur-[140px] opacity-60 pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-[#141522] via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[#090a0f]/90 pointer-events-none" />
    </div>
  );
};
