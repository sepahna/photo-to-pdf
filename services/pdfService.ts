
import { PDFPageImage } from '../types';

const PDFJS_VERSION = '3.11.174';

export class PDFService {
  private static isInitialized = false;

  private static async init() {
    if (this.isInitialized) return;
    
    // @ts-ignore
    if (!window.pdfjsLib) {
      await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // @ts-ignore
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    this.isInitialized = true;
  }

  static async convertPdfToImages(file: File, onProgress?: (current: number, total: number) => void): Promise<PDFPageImage[]> {
    await this.init();
    
    // @ts-ignore
    const pdfjsLib = window.pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    const images: PDFPageImage[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      images.push({
        id: i,
        fileName: file.name,
        dataUrl: canvas.toDataURL('image/png'),
        width: viewport.width,
        height: viewport.height
      });

      if (onProgress) onProgress(i, totalPages);
    }

    return images;
  }
}
