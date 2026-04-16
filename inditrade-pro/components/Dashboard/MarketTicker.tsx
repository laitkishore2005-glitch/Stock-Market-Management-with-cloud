import React from 'react';
import { INDIAN_INDICES } from '../../constants';

interface MarketTickerProps {
    theme: string;
}

const MarketTicker: React.FC<MarketTickerProps> = ({ theme }) => {
  const isLight = theme === 'light';
  const bgClass = isLight ? 'bg-slate-50' : `bg-${theme}-950`;
  const borderClass = isLight ? 'border-slate-200' : `border-${theme}-800`;
  const labelColor = isLight ? 'text-slate-500' : `text-${theme}-400`;

  return (
    <div className={`${bgClass} border-b ${borderClass} h-10 flex items-center overflow-hidden whitespace-nowrap`}>
      <div className="animate-[scroll_30s_linear_infinite] flex items-center gap-8 px-4">
        {[...INDIAN_INDICES, ...INDIAN_INDICES, ...INDIAN_INDICES].map((index, i) => (
          <div key={`${index.name}-${i}`} className="flex items-center gap-2">
            <span className={`text-xs font-bold ${labelColor} uppercase tracking-wider`}>{index.name}</span>
            <span className={`text-sm font-mono font-medium ${index.change >= 0 ? 'text-up' : 'text-down'}`}>
              {index.value.toLocaleString('en-IN')}
            </span>
            <span className={`text-xs font-mono ${index.change >= 0 ? 'text-up' : 'text-down'}`}>
              {index.change >= 0 ? '+' : ''}{index.change} ({index.percentChange}%)
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
};

export default MarketTicker;