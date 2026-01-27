import JSZip from 'jszip';
import { ComicPage } from '../types';

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
   * Processes a CBZ (Zip) file and returns a list of blob URLs for images.
   */
  static async processFile(file: File): Promise<ComicPage[]> {
    const zip = new JSZip();
    
    try {
      const loadedZip = await zip.loadAsync(file);
      const imageFiles: { name: string; zipObject: JSZip.JSZipObject }[] = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && isImage(zipEntry.name) && !zipEntry.name.startsWith('__MACOSX')) {
          imageFiles.push({
            name: zipEntry.name,
            zipObject: zipEntry,
          });
        }
      });

      // Sort images naturally to ensure correct page order
      imageFiles.sort((a, b) => naturalSort(a.name, b.name));

      // Extract images to Blob URLs
      // Note: For very large comics, we might want to lazy load. 
      // For this demo, we'll preload to ensure smoothness as requested.
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
      console.error("Error processing comic file:", error);
      throw new Error("Failed to process the file. Please ensure it is a valid CBZ/Zip archive.");
    }
  }

  static revokePages(pages: ComicPage[]) {
    pages.forEach(page => URL.revokeObjectURL(page.url));
  }
}