
import React from 'react';
import { 
  Upload, 
  Layers, 
  Settings, 
  Download, 
  Zap, 
  Scaling, 
  FileText, 
  // Fix: Lucide-react exports 'Image', aliasing to 'ImageIcon' for project-wide consistency
  Image as ImageIcon,
  Maximize,
  // Fix: AspectRatio is not available in the current lucide-react version; replaced with Monitor for screen-based presets
  Monitor,
  Activity,
  Archive
} from 'lucide-react';
import { TourStep } from './types';

export const SUPPORTED_FORMATS = [
  { name: 'PDF', icon: '📄', color: 'bg-red-100 text-red-600' },
  { name: 'DOCX', icon: '📝', color: 'bg-blue-100 text-blue-600' },
  { name: 'PNG', icon: '🖼️', color: 'bg-green-100 text-green-600' },
  { name: 'JPG', icon: '📸', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'WebP', icon: '✨', color: 'bg-purple-100 text-purple-600' },
];

export const TIPS = [
  {
    title: "Batch Processing",
    content: "Upload multiple files at once. You can apply settings to one file or convert all of them into a single ZIP archive for easy sharing."
  },
  {
    title: "Browser-Only Processing",
    content: "Your files never leave your computer. All conversions and resizing happen locally in your browser, ensuring maximum privacy and speed."
  },
  {
    title: "Image Resizing Pro-Tip",
    content: "When resizing for print, use 300 DPI. For web use, 72 DPI is sufficient and keeps file sizes small."
  },
  {
    title: "Smart Detection",
    content: "Just drop any file. fileconverser automatically routes documents to the Document Hub and images to the Image Studio."
  }
];

export const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to fileconverser",
    content: "Your all-in-one local file workshop. No servers, no uploads, just pure speed.",
    icon: <Zap className="text-primary" size={32} />
  },
  {
    title: "Universal Drop Zone",
    content: "Drag and drop any file anywhere on the home screen. We'll handle the sorting automatically.",
    icon: <Upload className="text-blue-500" size={32} />
  },
  {
    title: "Manage Your Queue",
    content: "Files appear in the sidebar queue. Click a file to customize its specific settings.",
    icon: <Layers className="text-purple-500" size={32} />
  },
  {
    title: "Precision Controls",
    content: "Adjust dimensions, formats, and quality. Changes are reflected in the preview in real-time.",
    icon: <Settings className="text-orange-500" size={32} />
  },
  {
    title: "Instant Export",
    content: "Download files individually or grab everything at once with our ZIP batch export.",
    icon: <Download className="text-accent" size={32} />
  }
];

export const RESIZE_TOUR_STEPS: TourStep[] = [
  {
    title: "Image Resize Studio",
    content: "Professional precision scaling. Perfect for social media, web assets, and print high-fidelity.",
    icon: <Scaling className="text-primary" size={32} />
  },
  {
    title: "Asset Management",
    content: "Your uploaded images appear in the left sidebar. Drag to reorder or click a specific image to modify it.",
    icon: <Layers className="text-blue-500" size={32} />
  },
  {
    title: "Custom Dimensions",
    content: "Enter exact Width and Height values. Use the 'Maintain Aspect Ratio' lock to prevent stretching.",
    icon: <Maximize className="text-purple-500" size={32} />
  },
  {
    title: "One-Click Presets",
    content: "Use our pre-defined standards for Instagram (Post/Story), HD, and 4K video frames instantly.",
    // Fix: Using Monitor icon as replacement for AspectRatio
    icon: <Monitor className="text-orange-500" size={32} />
  },
  {
    title: "The Batch Engine",
    content: "The 'Resize All' button applies your current settings to every image in your queue simultaneously.",
    icon: <Activity className="text-green-500" size={32} />
  },
  {
    title: "ZIP Batch Export",
    content: "Download your entire resized collection as a single, organized ZIP archive.",
    icon: <Archive className="text-accent" size={32} />
  }
];
