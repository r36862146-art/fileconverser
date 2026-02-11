
import React from 'react';
// Fix: Added RotateCw to imports from lucide-react
import { Merge, Scissors, Minimize2, ArrowDownUp, Edit3, RotateCw } from 'lucide-react';
import { ToolConfig, ToolType } from './types';

// Fix: Added Rotate PDF configuration to the TOOLS array
export const TOOLS: ToolConfig[] = [
  {
    id: ToolType.EDITOR,
    title: 'PDF Editor',
    description: 'Annotate, add text, watermarks, and manage pages in your PDF.',
    icon: <Edit3 className="w-6 h-6" />,
    path: '/pdf-editor',
    seoTitle: 'Full Online PDF Editor - Free & Private',
    keywords: ['edit pdf', 'annotate pdf', 'online pdf editor']
  },
  {
    id: ToolType.MERGE,
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document in seconds.',
    icon: <Merge className="w-6 h-6" />,
    path: '/merge-pdf',
    seoTitle: 'Merge PDF Online Free - 100% Private',
    keywords: ['merge pdf', 'combine pdf', 'pdf joiner']
  },
  {
    id: ToolType.SPLIT,
    title: 'Split PDF',
    description: 'Extract specific pages or ranges from your PDF into new files.',
    icon: <Scissors className="w-6 h-6" />,
    path: '/split-pdf',
    seoTitle: 'Split PDF by Pages - Extract PDF Pages Online',
    keywords: ['split pdf', 'extract pages', 'separate pdf']
  },
  {
    id: ToolType.COMPRESS,
    title: 'Compress PDF',
    description: 'Reduce PDF file size without losing quality.',
    icon: <Minimize2 className="w-6 h-6" />,
    path: '/compress-pdf',
    seoTitle: 'Compress PDF File - Reduce PDF Size Local',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf optimizer']
  },
  {
    id: ToolType.REORDER,
    title: 'Reorder Pages',
    description: 'Rearrange pages in your PDF document exactly how you want them.',
    icon: <ArrowDownUp className="w-6 h-6" />,
    path: '/reorder-pdf',
    seoTitle: 'Reorder PDF Pages Online - Move PDF Pages',
    keywords: ['reorder pdf', 'move pdf pages', 'rearrange pdf']
  },
  {
    id: ToolType.ROTATE,
    title: 'Rotate PDF',
    description: 'Rotate PDF pages clockwise and save the changes.',
    icon: <RotateCw className="w-6 h-6" />,
    path: '/rotate-pdf',
    seoTitle: 'Rotate PDF Pages Online - Free & Private',
    keywords: ['rotate pdf', 'turn pdf', 'pdf orientation']
  }
];

export const APP_NAME = "LocalPDFly";
export const TRUST_CLAIM = "Your documents never leave your browser. All processing is executed locally on your hardware for maximum security and performance.";
