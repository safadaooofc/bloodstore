import React from 'react';

export const CleanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#090d16]">
      {/* Subtle modern dot/grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0'
        }}
      />

      {/* Top right soft indigo glow blob */}
      <div 
        className="absolute -top-48 -right-48 w-[650px] h-[650px] rounded-full opacity-[0.16] filter blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #4f46e5 0%, #3b82f6 50%, transparent 100%)'
        }}
      />

      {/* Bottom left soft slate/blue ambient glow */}
      <div 
        className="absolute -bottom-64 -left-64 w-[750px] h-[750px] rounded-full opacity-[0.14] filter blur-[160px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, #1d4ed8 50%, transparent 100%)'
        }}
      />

      {/* Subtle center ambient light */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.08] filter blur-[150px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 80%)'
        }}
      />
    </div>
  );
};
