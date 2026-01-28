import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ComicPage, ReadingMode } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Columns, FileText, X, Menu, Maximize, Minimize } from 'lucide-react';
import { Button } from './Button';

interface ComicReaderProps {
  pages: ComicPage[];
  onClose: () => void;
  filename: string;
}

const ComicReader: React.FC<ComicReaderProps> = ({ pages, onClose, filename }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [mode, setMode] = useState<ReadingMode>(ReadingMode.Single);
  const [showControls, setShowControls] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'Escape') {
        if (isSidebarOpen) setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, mode, isSidebarOpen]);

  // Handle Fullscreen change events (Standard + Webkit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const totalPages = pages.length;

  const nextPage = () => {
    if (mode === ReadingMode.Double) {
      setCurrentPage(p => Math.min(p + 2, totalPages - 1));
    } else {
      setCurrentPage(p => Math.min(p + 1, totalPages - 1));
    }
    // Reset scroll to top
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const prevPage = () => {
    if (mode === ReadingMode.Double) {
      setCurrentPage(p => Math.max(p - 2, 0));
    } else {
      setCurrentPage(p => Math.max(p - 1, 0));
    }
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const toggleMode = () => setMode(m => m === ReadingMode.Single ? ReadingMode.Double : ReadingMode.Single);

  const toggleFullscreen = async () => {
    const doc = document as any;
    const elem = document.documentElement as any;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    }
  };

  // Click handler for navigation zones
  const handleContainerClick = (e: React.MouseEvent) => {
    const width = window.innerWidth;
    const clickX = e.clientX;

    // 30% Left -> Prev
    if (clickX < width * 0.3) {
      prevPage();
    } 
    // 30% Right -> Next
    else if (clickX > width * 0.7) {
      nextPage();
    } 
    // Middle 40% -> Toggle Controls
    else {
      setShowControls(!showControls);
    }
  };

  // Render Logic
  const renderSinglePage = () => (
    <div className="flex justify-center items-start min-h-full py-4">
      <img 
        src={pages[currentPage].url} 
        alt={`Page ${currentPage + 1}`} 
        className="shadow-2xl max-w-full h-auto object-contain transition-transform duration-200"
        style={{ transform: `scale(${scale})`, maxHeight: '95dvh' }}
        loading="lazy"
      />
    </div>
  );

  const renderDoublePage = () => {
    const firstPage = pages[currentPage];
    const secondPage = pages[currentPage + 1];

    return (
      <div className="flex justify-center items-center min-h-full gap-2 py-4 px-4">
        <img 
          src={firstPage.url} 
          alt={`Page ${currentPage + 1}`} 
          className="shadow-2xl max-h-[95dvh] w-auto object-contain max-w-[50%]"
          style={{ transform: `scale(${scale})` }}
          loading="lazy"
        />
        {secondPage && (
          <img 
            src={secondPage.url} 
            alt={`Page ${currentPage + 2}`} 
            className="shadow-2xl max-h-[95dvh] w-auto object-contain max-w-[50%]"
            style={{ transform: `scale(${scale})` }}
            loading="lazy"
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-50 overflow-hidden text-gray-200">
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-14 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 z-20 transition-transform duration-300 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
            <span className="ml-2 hidden sm:inline">Fermer</span>
          </Button>
          <div className="text-sm font-medium text-gray-400 truncate max-w-[200px] sm:max-w-md">
            {filename}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-500 mr-2 hidden sm:inline">
             {currentPage + 1} / {totalPages}
           </span>
           <Button variant="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Menu Pages">
             <Menu size={20} />
           </Button>
           <Button variant="icon" onClick={toggleFullscreen} title={isFullscreen ? "Quitter plein écran" : "Plein écran"}>
             {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
           </Button>
        </div>
      </div>

      {/* Main Content Area with Click Zones */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative select-none cursor-pointer"
        onClick={handleContainerClick}
      >
        {mode === ReadingMode.Single ? renderSinglePage() : renderDoublePage()}
      </div>

      {/* Bottom Floating Controls */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl border border-gray-700 rounded-2xl px-4 py-2 shadow-2xl z-20 flex items-center gap-2 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        <Button variant="icon" onClick={(e) => { e.stopPropagation(); prevPage(); }} disabled={currentPage === 0} title="Précédent">
          <ChevronLeft size={24} />
        </Button>
        
        <div className="w-px h-6 bg-gray-700 mx-1" />
        
        <Button variant="icon" onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} title="Dézoomer">
          <ZoomOut size={20} />
        </Button>
        <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
        <Button variant="icon" onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} title="Zoomer">
          <ZoomIn size={20} />
        </Button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <Button 
          variant="icon" 
          active={mode === ReadingMode.Double}
          onClick={(e) => { e.stopPropagation(); toggleMode(); }}
          title="Mode Double Page"
        >
          <Columns size={20} />
        </Button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <Button variant="icon" onClick={(e) => { e.stopPropagation(); nextPage(); }} disabled={currentPage >= totalPages - 1} title="Suivant">
          <ChevronRight size={24} />
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`absolute top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-30 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-gray-200">Pages</h3>
          <Button variant="icon" size="sm" onClick={() => setIsSidebarOpen(false)}>
            <ChevronLeft size={16} />
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] p-2 space-y-2">
          {pages.map((page, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setCurrentPage(idx);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors ${currentPage === idx ? 'bg-gray-800 ring-1 ring-brand-500' : ''}`}
            >
              <div className="w-12 h-16 bg-gray-950 rounded overflow-hidden shrink-0">
                 <img src={page.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-gray-400">Page {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComicReader;