import React from 'react';

export const Ticker: React.FC = () => {
  const tickerText =
    "Please keep your token slip ready · Carry all previous prescriptions · Maintain silence in the waiting area · Queue Cure '26 by Antigravity";

  return (
    <div className="h-[5vh] bg-blue-950 text-blue-200 border-t border-blue-900/50 flex items-center overflow-hidden select-none font-bold text-xs uppercase tracking-wider">
      <div className="relative w-full overflow-hidden flex whitespace-nowrap">
        {/* We double the text to create a seamless scrolling loop */}
        <div className="animate-marquee flex space-x-12 shrink-0">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-25%, 0, 0);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
