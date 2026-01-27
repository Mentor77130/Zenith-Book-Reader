import React, { useState, useEffect } from 'react';
import UploadView from './components/UploadView';
import ComicReader from './components/ComicReader';
import { ComicProcessor } from './services/comicProcessor';
import { ComicPage } from './types';

function App() {
  const [pages, setPages] = useState<ComicPage[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFilename(file.name);

    try {
      // Basic check for file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'cbr') {
        // Soft warning/handling for CBR since we are using pure JS/Zip logic
        // Some users rename zip to cbr, so we try anyway, but warn if it fails.
        console.warn("Fichier CBR détecté. Tentative de traitement en tant que Zip.");
      }

      const extractedPages = await ComicProcessor.processFile(file);
      
      if (extractedPages.length === 0) {
        throw new Error("Aucune image trouvée dans cette archive. Assurez-vous que le fichier contient des images JPG ou PNG.");
      }

      setPages(extractedPages);
    } catch (err: any) {
      console.error(err);
      let msg = "Échec du chargement de la bande dessinée.";
      if (err.message) {
         if (err.message.includes("Corrupted zip")) {
            msg = "Ce fichier semble être un RAR (CBR) ou est corrompu. Ce lecteur supporte nativement les fichiers CBZ (Zip). Veuillez convertir en CBZ ou essayer un autre fichier.";
         } else {
            msg = err.message;
         }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Cleanup blob URLs to free memory
    ComicProcessor.revokePages(pages);
    setPages([]);
    setFilename('');
    setError(null);
  };

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      if (pages.length > 0) {
        ComicProcessor.revokePages(pages);
      }
    };
  }, [pages]);

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans antialiased">
      {pages.length > 0 ? (
        <ComicReader 
          pages={pages} 
          onClose={handleClose} 
          filename={filename}
        />
      ) : (
        <UploadView 
          onFileSelect={handleFileSelect} 
          isLoading={isLoading} 
          error={error}
        />
      )}
    </div>
  );
}

export default App;