import React, { useRef, useState } from 'react';
import { Rental } from '../types';

interface MapBoardProps {
  rentals: Rental[];
  onMapClick: (x: number, y: number, width: number, height: number) => void;
  highlightedRentalId: string | null;
}

// SVG Placeholder that looks like a technical blueprint grid
const FALLBACK_MAP = `data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3e%3cdefs%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23cbd5e1' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='800' height='450' fill='%23f1f5f9'/%3e%3crect width='800' height='450' fill='url(%23grid)'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2364748b'%3eMapa niedost%C4%99pna - Tryb Techniczny%3c/text%3e%3c/svg%3e`;

export const MapBoard: React.FC<MapBoardProps> = ({ rentals, onMapClick, highlightedRentalId }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Start with explicit root path, fallback to base64 if fails
  const [currentSrc, setCurrentSrc] = useState("/mapa.png");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.nativeEvent.clientX - rect.left;
    const y = e.nativeEvent.clientY - rect.top;
    
    // Calculate percentage position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    onMapClick(xPercent, yPercent, rect.width, rect.height);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    // If the main image fails, switch to fallback once.
    if (!isUsingFallback) {
      console.warn("mapa.png failed to load. Switching to fallback placeholder.");
      setCurrentSrc(FALLBACK_MAP);
      setIsUsingFallback(true);
      // We do not set isLoaded to true here, we wait for the fallback to load
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-inner group cursor-crosshair">
      <div className="relative inline-block w-full min-h-[300px]" onClick={handleClick}>
        
        <img 
          ref={imgRef}
          src={currentSrc} 
          alt="Mapa Centrum" 
          className={`w-full h-auto object-cover block select-none transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* Pins - Always render on top of map (or fallback) */}
        {rentals.map(rental => (
          <div
            key={rental.id}
            style={{ 
              left: `${rental.x}%`, 
              top: `${rental.y}%`,
            }}
            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ease-in-out ${
              highlightedRentalId === rental.id ? 'z-50 scale-125' : 'z-10 hover:z-20 hover:scale-110'
            }`}
          >
            <div className="flex flex-col items-center">
              {/* Tooltip on hover */}
              <div className={`mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none ${
                  highlightedRentalId === rental.id ? 'opacity-100' : ''
                }`}>
                <div className="font-bold">{rental.tenantName}</div>
                <div>{rental.dateFrom} - {rental.dateTo}</div>
              </div>
              
              {/* Pin Icon */}
              <div className={`group/pin cursor-pointer filter drop-shadow-md`}>
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill={highlightedRentalId === rental.id ? '#f59e0b' : '#0ea5e9'} 
                  stroke="white" 
                  strokeWidth="1.5"
                  className="transition-colors duration-200"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-600 font-medium">Ładowanie mapy...</span>
          </div>
        </div>
      )}
    </div>
  );
};
