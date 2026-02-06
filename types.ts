
// Import React to resolve the 'React' namespace error for React.ReactNode
import React from 'react';

export type AppView = 'home' | 'documents' | 'images' | 'compress' | 'resize' | 'help';

export enum FileCategory {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER'
}

export interface FileBase {
  id: string;
  file: File;
  name: string;
  size: number;
  mimeType: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  convertedUrl: string | null;
  compressedSize?: number; 
}

export interface DocumentFileData extends FileBase {
  category: FileCategory.DOCUMENT;
  pageCount?: number;
  previewUrl: string | null;
  targetFormat: 'PDF' | 'DOCX' | 'TXT' | 'HTML';
  compressionLevel?: 'low' | 'medium' | 'high' | 'custom';
  customCompressionValue?: number; 
}

export interface ImageFileData extends FileBase {
  category: FileCategory.IMAGE;
  previewUrl: string | null;
  originalDimensions?: { width: number; height: number };
  targetFormat: 'JPG' | 'PNG' | 'WEBP' | 'SVG' | 'AVIF' | 'BMP' | 'TIFF' | 'GIF' | 'ICO';
  settings: {
    width: number;
    height: number;
    quality: number;
    maintainAspectRatio: boolean;
    dpi: number;
    colorProfile: 'sRGB' | 'AdobeRGB' | 'DisplayP3' | 'Grayscale';
  };
}

export type FileData = DocumentFileData | ImageFileData;

export interface TourStep {
  title: string;
  content: string;
  icon: React.ReactNode;
  target?: string;
}
