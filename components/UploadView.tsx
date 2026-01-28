import React, { useState, useEffect } from 'react';
import { Upload, BookOpen, AlertCircle } from 'lucide-react';

interface UploadViewProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const UploadView: React.FC<UploadViewProps> = ({ onFileSelect, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);

  // Chargement du script AdSense
  useEffect(() => {
    const scriptId = "adsense-script";
    // Empêche le chargement multiple du script
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8451580063826204";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-4 bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
             <div className="p-3 bg-brand-500/20 rounded-xl">
               <BookOpen className="w-10 h-10 text-brand-500" />
             </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-4">
            Lecteur Zenith
          </h1>
          <p className="text-gray-400 text-lg">
            Un lecteur de bandes dessinées universel.
          </p>
        </div>

        <div 
          className={`relative group border-2 border-dashed rounded-3xl p-10 transition-all duration-300 ease-out
            ${dragActive 
              ? 'border-brand-500 bg-brand-500/10 scale-[1.02]' 
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            accept=".cbz,.cbr,.zip,.rar,.pdf,.epub,.pub,application/vnd.comicbook+zip,application/vnd.comicbook-rar,application/zip,application/x-zip-compressed,application/x-zip,application/x-cbr,application/x-rar-compressed,application/x-rar,application/pdf,application/epub+zip,application/octet-stream"
            onChange={handleChange}
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center text-center gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-300 font-medium">Traitement du fichier...</p>
                <p className="text-xs text-gray-500 mt-2">Conversion et extraction locale</p>
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-full transition-colors duration-300 ${dragActive ? 'bg-brand-500/20' : 'bg-gray-800'}`}>
                  <Upload className={`w-8 h-8 ${dragActive ? 'text-brand-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-200">
                    Glissez-déposez votre ebook ici
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supporte CBZ, ZIP, PDF, EPUB et CBR
                  </p>
                </div>
                <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-brand-400 text-sm font-medium rounded-lg transition-colors border border-gray-700">
                  Sélectionner un fichier
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 animate-slide-up">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <meta name="google-adsense-account" content="ca-pub-8451580063826204" />
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <p className="text-xs font-medium text-gray-700 tracking-widest uppercase opacity-60 select-none">
          100% gratuit
        </p>
      </div>
    </div>
  );
};

export default UploadView;