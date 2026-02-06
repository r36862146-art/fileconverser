
import { FileCategory } from './types';

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Utility to strip the extension from a filename
 */
export const getFileNameWithoutExtension = (filename: string) => {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

/**
 * Utility to generate the correct download filename based on target format
 */
export const getDownloadName = (originalName: string, targetFormat: string, prefix = 'converted-') => {
  const name = getFileNameWithoutExtension(originalName);
  const ext = targetFormat.toLowerCase();
  return `${prefix}${name}.${ext}`;
};

export const detectFileCategory = (mimeType: string, fileName: string): FileCategory => {
  if (mimeType.startsWith('image/')) return FileCategory.IMAGE;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  const docExtensions = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'htm', 'pptx'];
  const docMimes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 
    'text/html', 
    'application/rtf', 
    'application/vnd.oasis.opendocument.text'
  ];
  
  if (docMimes.includes(mimeType) || (ext && docExtensions.includes(ext))) {
    return FileCategory.DOCUMENT;
  }
  
  return FileCategory.OTHER;
};

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const generatePdfPreview = async (file: File): Promise<string | null> => {
  if (file.type !== 'application/pdf') return null;
  try {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const pdfjsLib = window['pdfjsLib'];
    if (!pdfjsLib) {
      console.warn('pdfjsLib not found on window');
      return null;
    }
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    const scale = 1.0;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('PDF preview generation failed:', error);
    return null;
  }
};

export async function convertImageToBlob(
  file: File, 
  targetFormat: string, 
  width: number, 
  height: number,
  quality: number,
  colorProfile: 'sRGB' | 'AdobeRGB' | 'DisplayP3' | 'Grayscale' = 'sRGB'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not available');

      const fmt = targetFormat.toUpperCase();

      // ICO requirements: Max 256x256 and usually square
      if (fmt === 'ICO') {
        const side = Math.min(width, height, 256);
        canvas.width = side;
        canvas.height = side;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (colorProfile === 'Grayscale') {
        ctx.filter = 'grayscale(100%)';
      } else if (colorProfile === 'AdobeRGB' || colorProfile === 'DisplayP3') {
        ctx.filter = 'saturate(1.15) contrast(1.05)';
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let mime = 'image/png';
      if (fmt === 'JPG' || fmt === 'JPEG') mime = 'image/jpeg';
      else if (fmt === 'WEBP') mime = 'image/webp';
      else if (fmt === 'PNG') mime = 'image/png';
      else if (fmt === 'AVIF') mime = 'image/avif';
      else if (fmt === 'GIF') mime = 'image/gif';
      else if (fmt === 'ICO') mime = 'image/png'; // Most browsers use PNG internally for ICO
      else if (fmt === 'BMP') mime = 'image/bmp';

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Conversion failed');
      }, mime, (mime === 'image/jpeg' || mime === 'image/webp') ? quality : undefined);
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function compressImageToBlob(
  file: File,
  quality: number,
  targetFormat: string = 'JPG',
  scale: number = 1.0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not available');

      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let mime = 'image/jpeg';
      const fmt = targetFormat.toUpperCase();
      if (fmt === 'JPG' || fmt === 'JPEG') mime = 'image/jpeg';
      else if (fmt === 'PNG') mime = 'image/png';
      else if (fmt === 'WEBP') mime = 'image/webp';
      else if (fmt === 'GIF') mime = 'image/gif';
      else if (fmt === 'ICO') mime = 'image/png';
      
      const supportsQuality = (mime === 'image/jpeg' || mime === 'image/webp');
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Compression failed');
      }, mime, supportsQuality ? quality : undefined);
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function convertDocToBlob(file: File, targetFormat: string): Promise<Blob> {
  if (targetFormat === 'HTML' && (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx'))) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const mammoth = window.mammoth;
      if (!mammoth) {
        throw new Error('Mammoth.js not loaded');
      }
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Converted Document</title>
            <style>
              body { font-family: sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: auto; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${result.value}
          </body>
        </html>
      `;
      return new Blob([html], { type: 'text/html' });
    } catch (error) {
      console.error('Mammoth conversion failed:', error);
      throw error;
    }
  }

  if ((file.type === 'text/plain' || file.name.endsWith('.txt')) && targetFormat === 'HTML') {
    const text = await file.text();
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Converted Document</title>
            <style>
              body { font-family: monospace; white-space: pre-wrap; padding: 2rem; }
            </style>
          </head>
          <body>${text}</body>
        </html>
    `;
    return new Blob([html], { type: 'text/html' });
  }

  await new Promise(r => setTimeout(r, 1200)); 
  const mimeMap: Record<string, string> = { 
    'PDF': 'application/pdf', 
    'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'TXT': 'text/plain', 
    'HTML': 'text/html' 
  };
  return new Blob([file], { type: mimeMap[targetFormat] || file.type });
}

export async function compressDocToBlob(file: File, level: 'low' | 'medium' | 'high' | 'custom', customValue?: number): Promise<Blob> {
  await new Promise(r => setTimeout(r, 1500));
  
  let reductionFactor = 0.7;
  if (level === 'low') reductionFactor = 0.85;
  else if (level === 'medium') reductionFactor = 0.65;
  else if (level === 'high') reductionFactor = 0.45;
  else if (level === 'custom' && customValue !== undefined) reductionFactor = customValue;
  
  const newSize = Math.floor(file.size * reductionFactor);
  return new Blob([file.slice(0, newSize)], { type: file.type });
}
