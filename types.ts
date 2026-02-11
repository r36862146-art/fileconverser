
import React from 'react';

export enum ToolType {
  MERGE = 'merge',
  SPLIT = 'split',
  COMPRESS = 'compress',
  REORDER = 'reorder',
  EDITOR = 'editor',
  ROTATE = 'rotate'
}

export type ToolStep = 'upload' | 'configure' | 'complete';

export type AnnotationType = 'text' | 'draw' | 'highlight' | 'image' | 'textBlock';

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string; 
  color: string;
  fontSize?: number;
  fontFamily?: string;
  strokeWidth?: number;
  rotation?: number;
  opacity?: number;
  align?: 'left' | 'center' | 'right';
  isBold?: boolean;
  points?: { x: number; y: number }[]; 
  rects?: { x: number; y: number; width: number; height: number }[]; // For multi-line highlights
  src?: string; // Base64 for images
  isHeadline?: boolean; // Heuristic for smart editing
  originalText?: string; // To track if content changed
}

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BackgroundConfig {
  color?: string;
  image?: string; // base64
}

export interface PageOp {
  id: string; 
  index: number; 
  rotation: number;
  deleted: boolean;
  crop?: CropBox;
  background?: BackgroundConfig;
}

export interface PDFFile {
  id: string;
  file: File;
  previewUrl?: string;
  pageCount?: number;
}

export interface ToolConfig {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  seoTitle: string;
  keywords: string[];
}

export interface RecentTool {
  id: ToolType;
  timestamp: number;
}

export interface SessionState {
  toolId: ToolType;
  fileName: string;
  fileSize: number;
  state: any;
  updatedAt: number;
}
