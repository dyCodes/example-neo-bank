'use client';

import React, { useEffect, useRef, useState, memo } from 'react';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  theme = 'dark'
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    
    // Configure simpler widget (Symbol Overview with chartOnly)
    const config = {
      "symbols": [
        [
          symbol,
          symbol
        ]
      ],
      "chartOnly": true,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "colorTheme": theme,
      "autosize": true,
      "showVolume": false,
      "showMA": false,
      "hideDateRanges": false,
      "hideMarketStatus": true,
      "hideSymbolLogo": true,
      "scalePosition": "right",
      "scaleMode": "Normal",
      "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      "fontSize": "10",
      "noLogoOverlay": true,
      "valuesTracking": "1",
      "changeMode": "price-and-percent",
      "chartType": "area",
      "lineColor": "#22c55e",
      "topColor": "rgba(34, 197, 94, 0.3)",
      "bottomColor": "rgba(34, 197, 94, 0)",
      "lineWidth": 2,
    };

    script.innerHTML = JSON.stringify(config);
    container.current.appendChild(script);
    
    // Periodically check if the iframe has been injected to hide the skeleton
    const checkInterval = setInterval(() => {
      if (container.current?.querySelector('iframe')) {
        setIsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-xl">
      {/* Premium Shimmer Skeleton */}
      {!isLoaded && (
        <div className={`absolute inset-0 flex items-center justify-center z-10 ${
          theme === 'dark' ? 'bg-[#083423]' : 'bg-white'
        }`}>
          <div className="w-full h-full flex flex-col p-8 gap-6 animate-pulse">
            <div className="flex-1 w-full bg-current opacity-5 rounded-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-current/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="h-10 w-full flex gap-4">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-full flex-1 bg-current opacity-5 rounded-lg" />
               ))}
            </div>
          </div>
        </div>
      )}
      <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
        <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default memo(TradingViewChart);
