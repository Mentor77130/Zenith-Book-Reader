import JSZip from 'jszip';
import { ComicPage } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configurer le worker PDF.js avec la même version que la dépendance principale
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs`;

/**
 * Validates if a file entry is an image
 */
const isImage = (filename: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
};

/**
 * Natural sort for filenames (e.g., page1.jpg, page2.jpg, page10.jpg)
 */
const naturalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

export class ComicProcessor {
  /**
   * Processes CBZ, Zip, EPUB, or PDF files.
   */
  static async processFile(file: File): Promise<ComicPage[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      return this.processPdf(file);
    } else {
      // Handles CBZ, ZIP, and EPUB (treating EPUB as a zip container for images)
      return this.processZipBasedFile(file);
    }
  }

  /**
   * Processes ZIP-based formats (CBZ, ZIP, EPUB)
   */
  private static async processZipBasedFile(file: File): Promise<ComicPage[]> {
    const zip = new JSZip();
    
    try {
      const loadedZip = await zip.loadAsync(file);
      const imageFiles: { name: string; zipObject: JSZip.JSZipObject }[] = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        // Filter out MacOS artifacts and ensure it's an image
        if (!zipEntry.dir && isImage(zipEntry.name) && !zipEntry.name.startsWith('__MACOSX')) {
          imageFiles.push({
            name: zipEntry.name,
            zipObject: zipEntry,
          });
        }
      });

      // Sort images naturally
      imageFiles.sort((a, b) => naturalSort(a.name, b.name));

      const pages: ComicPage[] = await Promise.all(
        imageFiles.map(async (entry, index) => {
          const blob = await entry.zipObject.async('blob');
          const url = URL.createObjectURL(blob);
          return {
            name: entry.name,
            url,
            index,
          };
        })
      );

      return pages;

    } catch (error) {
      console.error("Error processing zip/epub file:", error);
      throw new Error("Impossible de traiter le fichier. Assurez-vous qu'il s'agit d'une archive valide (CBZ, EPUB, ZIP). Les fichiers CBR (RAR) ne sont pas supportés s'ils ne sont pas au format ZIP.");
    }
  }

  /**
   * Processes PDF files by rendering pages to images
   */
  private static async processPdf(file: File): Promise<ComicPage[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pages: ComicPage[] = [];

      // Loop through all pages
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        
        // Scale 1.5 for better quality on standard screens without being too heavy
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert canvas to blob URL
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', 0.85);
        });

        if (blob) {
          const url = URL.createObjectURL(blob);
          pages.push({
            name: `page-${i}.jpg`,
            url,
            index: i - 1
          });
        }
      }

      return pages;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error("Impossible de lire le fichier PDF. Il est peut-être corrompu ou protégé par un mot de passe.");
    }
  }

  static revokePages(pages: ComicPage[]) {
    pages.forEach(page => URL.revokeObjectURL(page.url));
  }
}