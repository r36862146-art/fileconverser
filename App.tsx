
import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { 
  FileText, 
  Image as ImageIcon, 
  HelpCircle, 
  Moon, 
  Sun, 
  Upload, 
  X,
  CheckCircle2,
  Zap,
  Files,
  Download,
  Settings,
  Monitor,
  Briefcase,
  Minimize2,
  Layers,
  Activity,
  Scaling,
  Printer,
  ArrowLeft,
  Menu,
  ChevronRight,
  ChevronLeft,
  Trash2,
  GripVertical,
  Play,
  ShieldCheck,
  MousePointer2,
  Keyboard,
  Info,
  ExternalLink,
  GraduationCap,
  Sliders,
  Plus,
  RotateCcw,
  Palette
} from 'lucide-react';
import { AppView, FileCategory, DocumentFileData, ImageFileData, FileData, TourStep } from './types';
import { detectFileCategory, generateId, formatBytes, getImageDimensions, convertImageToBlob, convertDocToBlob, compressImageToBlob, compressDocToBlob, generatePdfPreview, getDownloadName } from './utils';
import { TIPS, TOUR_STEPS, RESIZE_TOUR_STEPS } from './constants';

const RESIZE_PRESETS = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'HD', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: '4K Ultra HD', w: 3840, h: 2160 },
  { label: 'Website Banner', w: 1920, h: 600 }
];

const IMAGE_FORMATS: ImageFileData['targetFormat'][] = ['JPG', 'PNG', 'WEBP', 'AVIF', 'GIF', 'ICO'];
const DOC_FORMATS: DocumentFileData['targetFormat'][] = ['PDF', 'DOCX', 'TXT', 'HTML'];
const COLOR_PROFILES: ImageFileData['settings']['colorProfile'][] = ['sRGB', 'AdobeRGB', 'DisplayP3', 'Grayscale'];

const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M30 20H65L75 30V80H30V20Z" fill="white" className="dark:fill-slate-800" stroke="#1E293B" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M65 20V30H75" stroke="#1E293B" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M40 45H65M40 55H65M40 65H55" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"/>
    <rect x="42" y="35" width="45" height="35" rx="4" fill="#E2E8F0" className="dark:fill-slate-700" stroke="#1E293B" strokeWidth="3"/>
    <circle cx="50" cy="45" r="4" fill="#FBBF24"/>
    <path d="M42 60L55 48L65 58L75 45L87 60V70H42V60Z" fill="#22C55E"/>
    <path d="M55 25H85C90.5 25 95 29.5 95 35V45H85V35H55V25Z" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
    <path d="M55 75H85C90.5 75 95 70.5 95 65V55H85V65H55V75Z" fill="#3B82F6" stroke="#1E293B" strokeWidth="2"/>
    <rect x="88" y="45" width="10" height="4" fill="#94A3B8" stroke="#1E293B" strokeWidth="2"/>
    <rect x="88" y="51" width="10" height="4" fill="#94A3B8" stroke="#1E293B" strokeWidth="2"/>
  </svg>
);

const SectionDropZone: React.FC<{ 
  onFiles: (files: FileList | File[]) => void, 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string,
  accept?: string
}> = ({ onFiles, icon, title, subtitle, accept }) => {
  const [isHovered, setIsHovered] = useState(false);
  const inputId = `section-upload-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
    document.getElementById(inputId)?.click();
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-500"
      onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
      onDragLeave={() => setIsHovered(false)}
      onDrop={(e) => { e.preventDefault(); setIsHovered(false); if (e.dataTransfer.files) onFiles(e.dataTransfer.files); }}
    >
      <div 
        onClick={handleContainerClick}
        className={`w-full aspect-square md:aspect-video glass rounded-[2rem] md:rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer transition-all duration-300 group relative overflow-hidden p-6 md:p-12 text-center
          ${isHovered ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'}
        `}
      >
        <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-500
          ${isHovered ? 'bg-primary text-white scale-110 rotate-3' : 'bg-primary/10 text-primary group-hover:scale-110'}
        `}>
          {isHovered ? <Upload size={32} /> : icon}
        </div>
        <div className="z-10 space-y-1 md:space-y-3">
          <h3 className="text-xl md:text-2xl font-black tracking-tight">{title}</h3>
          <div className="hidden md:block">
            <p className="text-sm text-slate-500 font-medium mb-4">
              {isHovered ? "Drop your files now" : `Drag & drop your ${subtitle} here`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or</span>
              <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
            </div>
          </div>
          <button 
            type="button"
            className={`mt-4 px-8 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto`}
            onClick={(e) => { e.stopPropagation(); document.getElementById(inputId)?.click(); }}
          >
            <Plus size={16} />
            {window.innerWidth < 768 ? "Upload File" : "Select Files"}
          </button>
        </div>
        <input id={inputId} type="file" multiple accept={accept} className="hidden" onChange={(e) => e.target.files && onFiles(e.target.files)} />
      </div>
      <div className="mt-6 flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <ShieldCheck size={14} className="text-accent" />
        <span>Processed Locally in Browser</span>
      </div>
    </div>
  );
};

const AdPlaceholder: React.FC<{ width: string, height: string, label: string, adKey: string, className?: string }> = ({ width, height, label, adKey, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1200); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady && containerRef.current && !hasStartedLoading) {
      setHasStartedLoading(true);
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `var atOptions = { 'key' : '${adKey}', 'format' : 'iframe', 'height' : ${parseInt(height)}, 'width' : ${parseInt(width)}, 'params' : {} };`;
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      containerRef.current.appendChild(configScript);
      containerRef.current.appendChild(invokeScript);
    }
  }, [isReady, adKey, width, height, hasStartedLoading]);

  return (
    <div className={`flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-700 ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">{label} Banner</span>
      <div ref={containerRef} style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }} className={`bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center overflow-hidden shadow-sm relative transition-all duration-500 ${!isReady ? 'animate-pulse' : ''}`}>
        {!hasStartedLoading && <div className="text-center p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Secure Ad Slot</p></div>}
      </div>
    </div>
  );
};

const NativeBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const adId = '21fb0d183fdb678f1fbf5c37727484c8';
  const containerId = `container-${adId}`;
  const scriptUrl = `https://pl28628847.effectivegatecpm.com/${adId}/invoke.js`;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
      script.onload = () => setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
  }, [scriptUrl]);

  return (
    <div className={`w-full flex flex-col items-center gap-3 my-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60 flex items-center gap-2"><Info size={10} /> Verified Native Placement</span>
      <div id={containerId} className="w-full max-w-4xl min-h-[120px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden flex items-center justify-center transition-all hover:border-primary/20">
        {!isLoaded && <div className="flex flex-col items-center gap-2 text-slate-400"><Activity size={24} className="animate-spin opacity-20" /><p className="text-[10px] font-black uppercase tracking-widest opacity-30">Preparing Content...</p></div>}
      </div>
    </div>
  );
};

const HeaderAd = () => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 2500);
    return () => clearTimeout(t);
  }, []);
  if (!active) return null;
  return (
    <div className="w-full flex justify-center py-6 px-4 border-b dark:border-slate-800 bg-white/30 dark:bg-black/30 backdrop-blur-sm animate-in slide-in-from-top duration-500">
      <div className="hidden md:block"><AdPlaceholder width="728" height="90" label="Premium" adKey="b85f60088640c23471c0e45faefdd918" /></div>
      <div className="md:hidden"><AdPlaceholder width="320" height="50" label="Mobile" adKey="8fb684fbe942167b917bb4d12171810e" /></div>
    </div>
  );
};

const SidebarAd = () => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 2500);
    return () => clearTimeout(t);
  }, []);
  if (!active) return null;
  return (
    <div className="hidden xl:flex w-80 flex-col gap-6 p-6 border-l dark:border-slate-800 bg-white/30 dark:bg-black/30 sticky top-24 self-start animate-in slide-in-from-right duration-500">
      <AdPlaceholder width="300" height="250" label="Sidebar" adKey="b4d267728de9d23c568608cde9d0ce8f" />
      <div className="p-5 bg-primary/5 rounded-[2rem] flex flex-col gap-3 border border-primary/10">
        <div className="flex items-center gap-2"><div className="p-1.5 bg-primary/10 rounded-lg text-primary"><Zap size={14} /></div><p className="text-[10px] font-black uppercase tracking-widest">Privacy Workshop</p></div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Conversions happen in your RAM, not on our disk. Secure, private, and lightning fast.</p>
      </div>
      <NativeBanner className="my-0 px-0" />
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [compressTab, setCompressTab] = useState<'docs' | 'imgs'>('docs');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [docFiles, setDocFiles] = useState<DocumentFileData[]>([]);
  const [imgFiles, setImgFiles] = useState<ImageFileData[]>([]);
  const [resizeFiles, setResizeFiles] = useState<ImageFileData[]>([]);
  const [compressDocFiles, setCompressDocFiles] = useState<DocumentFileData[]>([]);
  const [compressImgFiles, setCompressImgFiles] = useState<ImageFileData[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [activeTourType, setActiveTourType] = useState<'general' | 'resize'>('general');
  const [showAdvancedImgSettings, setShowAdvancedImgSettings] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('fileconverser_tour_completed');
    if (!hasSeenTour) {
      setTimeout(() => { setActiveTourType('general'); setIsTourOpen(true); }, 1500);
    }
  }, []);

  const completeTour = () => {
    if (activeTourType === 'general') { localStorage.setItem('fileconverser_tour_completed', 'true'); }
    else { localStorage.setItem('fileconverser_resize_tour_completed', 'true'); }
    setIsTourOpen(false);
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const addedDocs: DocumentFileData[] = [];
    const addedImgs: ImageFileData[] = [];
    const addedResize: ImageFileData[] = [];
    const addedCompressDoc: DocumentFileData[] = [];
    const addedCompressImg: ImageFileData[] = [];

    for (const file of Array.from(newFiles)) {
      const category = detectFileCategory(file.type, file.name);
      const id = generateId();
      const common = { id, file, name: file.name, size: file.size, mimeType: file.type, status: 'pending' as const, progress: 0, convertedUrl: null };

      if (category === FileCategory.IMAGE) {
        const dims = await getImageDimensions(file);
        const imgFile: ImageFileData = {
          ...common, category: FileCategory.IMAGE, previewUrl: URL.createObjectURL(file), originalDimensions: dims, targetFormat: 'JPG',
          settings: { quality: 0.75, maintainAspectRatio: true, width: dims.width, height: dims.height, dpi: 72, colorProfile: 'sRGB' }
        };
        if (view === 'resize') addedResize.push(imgFile);
        else if (view === 'compress' && compressTab === 'imgs') addedCompressImg.push(imgFile);
        else addedImgs.push(imgFile);
      } else {
        const previewUrl = await generatePdfPreview(file);
        const docFile: DocumentFileData = { ...common, category: FileCategory.DOCUMENT, previewUrl, targetFormat: 'PDF', compressionLevel: 'medium', customCompressionValue: 0.7 };
        if (view === 'compress' && compressTab === 'docs') addedCompressDoc.push(docFile);
        else addedDocs.push(docFile);
      }
    }

    if (addedDocs.length > 0) setDocFiles(prev => [...prev, ...addedDocs]);
    if (addedImgs.length > 0) setImgFiles(prev => [...prev, ...addedImgs]);
    if (addedResize.length > 0) setResizeFiles(prev => [...prev, ...addedResize]);
    if (addedCompressDoc.length > 0) setCompressDocFiles(prev => [...prev, ...addedCompressDoc]);
    if (addedCompressImg.length > 0) setCompressImgFiles(prev => [...prev, ...addedCompressImg]);

    if (view === 'home' || view === 'help') {
      if (addedResize.length > 0) setView('resize');
      else if (addedImgs.length > 0) setView('images');
      else if (addedCompressDoc.length > 0) { setView('compress'); setCompressTab('docs'); }
      else if (addedCompressImg.length > 0) { setView('compress'); setCompressTab('imgs'); }
      else if (addedDocs.length > 0) setView('documents'); 
    }
  }, [view, compressTab]);

  const startImgConvert = async (id: string) => {
    const f = imgFiles.find(x => x.id === id);
    if (!f) return;
    setImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'processing', progress: 50 } : x));
    try {
      const blob = await convertImageToBlob(f.file, f.targetFormat, f.settings.width, f.settings.height, f.settings.quality);
      const url = URL.createObjectURL(blob);
      setImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'completed', progress: 100, convertedUrl: url } : x));
    } catch { setImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'error' } : x)); }
  };

  const startImgResizeAction = async (id: string) => {
    const f = resizeFiles.find(x => x.id === id);
    if (!f) return;
    setResizeFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'processing', progress: 50 } : x));
    try {
      const blob = await convertImageToBlob(f.file, f.targetFormat, f.settings.width, f.settings.height, f.settings.quality);
      const url = URL.createObjectURL(blob);
      setResizeFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'completed', progress: 100, convertedUrl: url, compressedSize: blob.size } : x));
    } catch { setResizeFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'error' } : x)); }
  };

  const startDocCompressAction = async (id: string) => {
    const f = compressDocFiles.find(x => x.id === id);
    if (!f) return;
    setCompressDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'processing', progress: 50 } : x));
    try {
      const blob = await compressDocToBlob(f.file, f.compressionLevel || 'medium', f.customCompressionValue);
      const url = URL.createObjectURL(blob);
      setCompressDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'completed', progress: 100, convertedUrl: url, compressedSize: blob.size } : x));
    } catch { setCompressDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'error' } : x)); }
  };

  const startImgCompressAction = async (id: string) => {
    const f = compressImgFiles.find(x => x.id === id);
    if (!f) return;
    setCompressImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'processing', progress: 50 } : x));
    try {
      const scaleValue = f.settings.maintainAspectRatio ? (f.settings.width / (f.originalDimensions?.width || 1)) : 1.0;
      const blob = await compressImageToBlob(f.file, f.settings.quality, f.targetFormat, scaleValue);
      const url = URL.createObjectURL(blob);
      setCompressImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'completed', progress: 100, convertedUrl: url, compressedSize: blob.size } : x));
    } catch { setCompressImgFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'error' } : x)); }
  };

  const handleResizeAll = async () => {
    const selectedFile = resizeFiles.find(f => f.id === selectedFileId);
    if (!selectedFile || isBatchProcessing) return;
    setIsBatchProcessing(true);
    for (const f of resizeFiles) {
      try {
        setResizeFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'processing', progress: 20 } : x));
        let targetWidth = selectedFile.settings.width;
        let targetHeight = selectedFile.settings.height;
        if (f.settings.maintainAspectRatio && f.originalDimensions) {
           targetHeight = Math.round(targetWidth * (f.originalDimensions.height / f.originalDimensions.width));
        }
        const blob = await convertImageToBlob(f.file, selectedFile.targetFormat, targetWidth, targetHeight, selectedFile.settings.quality);
        const url = URL.createObjectURL(blob);
        setResizeFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'completed', progress: 100, convertedUrl: url, compressedSize: blob.size } : x));
      } catch (e) { setResizeFiles(prev => prev.map(x => x.id === f.id ? { ...x, status: 'error' } : x)); }
    }
    setIsBatchProcessing(false);
  };

  const startDocConvert = async (id: string) => {
    const f = docFiles.find(x => x.id === id);
    if (!f) return;
    setDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'processing', progress: 50 } : x));
    try {
      const blob = await convertDocToBlob(f.file, f.targetFormat);
      const url = URL.createObjectURL(blob);
      setDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'completed', progress: 100, convertedUrl: url } : x));
    } catch { setDocFiles(prev => prev.map(x => x.id === id ? { ...x, status: 'error' } : x)); }
  };

  const clearQueue = (type: 'resize' | 'doc' | 'img' | 'compress') => {
    if (type === 'resize') { setResizeFiles([]); setSelectedFileId(null); }
    else if (type === 'doc') { setDocFiles([]); setSelectedFileId(null); }
    else if (type === 'img') { setImgFiles([]); setSelectedFileId(null); }
    else if (type === 'compress') { if (compressTab === 'docs') setCompressDocFiles([]); else setCompressImgFiles([]); setSelectedFileId(null); }
  };

  const handleGenericDragStart = (e: React.DragEvent, index: number) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = 'move'; };

  const handleResizeDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault(); if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newFiles = [...resizeFiles]; const [movedFile] = newFiles.splice(draggedIndex, 1); newFiles.splice(targetIndex, 0, movedFile);
    setResizeFiles(newFiles); setDraggedIndex(null);
  };

  const handleCompressDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault(); if (draggedIndex === null || draggedIndex === targetIndex) return;
    if (compressTab === 'docs') { const newFiles = [...compressDocFiles]; const [movedFile] = newFiles.splice(draggedIndex, 1); newFiles.splice(targetIndex, 0, movedFile); setCompressDocFiles(newFiles); }
    else { const newFiles = [...compressImgFiles]; const [movedFile] = newFiles.splice(draggedIndex, 1); newFiles.splice(targetIndex, 0, movedFile); setCompressImgFiles(newFiles); }
    setDraggedIndex(null);
  };

  const renderHome = () => (
    <section className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center max-w-5xl mx-auto w-full">
      <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
        <Logo size={120} className="mx-auto mb-6 animate-in zoom-in duration-700" />
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black leading-tight tracking-tighter">file<span className="text-primary italic">converser</span></h1>
        <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 font-medium px-4">Local document & image workshop.</p>
      </div>
      <div onClick={() => document.getElementById('globalFile')?.click()} className="w-full aspect-video md:aspect-[21/9] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center justify-center gap-4 md:gap-6 cursor-pointer hover:border-primary transition-all group relative overflow-hidden p-6" onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}>
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Upload size={32} /></div>
        <div className="z-10 space-y-2">
          <h3 className="text-xl md:text-3xl font-bold">Import Workshop Files</h3>
          <div className="hidden md:block"><p className="text-sm text-slate-500 font-medium mb-4">Drag & drop anywhere or use the button below</p><div className="flex items-center justify-center gap-3 mb-4"><div className="h-px w-12 bg-slate-200 dark:bg-slate-800"></div><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">or</span><div className="h-px w-12 bg-slate-200 dark:bg-slate-800"></div></div></div>
          <button type="button" className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto" onClick={(e) => { e.stopPropagation(); document.getElementById('globalFile')?.click(); }}><Plus size={18} />{window.innerWidth < 768 ? "Upload Files" : "Choose Files"}</button>
        </div>
        <input id="globalFile" type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>
      <div className="mt-8 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl">
        {[
          { id: 'documents', label: 'Document Hub', sub: 'PDF, Word, TXT', icon: <FileText size={20}/>, color: 'blue' },
          { id: 'images', label: 'Image Studio', sub: 'Convert Formats', icon: <ImageIcon size={20}/>, color: 'green' },
          { id: 'compress', label: 'Compress Files', sub: 'Reduce Size', icon: <Minimize2 size={20}/>, color: 'orange' },
          { id: 'resize', label: 'Image Resize', sub: 'DPI & Scaling', icon: <Scaling size={20}/>, color: 'purple' }
        ].map(card => {
          const colorClass = card.color === 'blue' ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500' : card.color === 'green' ? 'text-green-500 bg-green-500/10 hover:bg-green-500' : card.color === 'orange' ? 'text-orange-500 bg-orange-500/10 hover:bg-orange-500' : 'text-purple-500 bg-purple-500/10 hover:bg-purple-500';
          return (
            <button key={card.id} onClick={() => setView(card.id as AppView)} className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start gap-4 text-left hover:shadow-xl transition-all group">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-colors ${colorClass} group-hover:text-white`}>{card.icon}</div>
              <div><h4 className="text-base md:text-lg font-bold">{card.label}</h4><p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-black">{card.sub}</p></div>
            </button>
          );
        })}
      </div>
      <NativeBanner />
    </section>
  );

  const renderHelp = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-black p-4 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center space-y-4"><h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">How to <span className="text-primary italic">use</span></h2><p className="text-lg text-slate-500">Minimalist instructions for maximum productivity.</p></header>
        <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border dark:border-slate-800">
          <h3 className="text-2xl font-black mb-8">Basic Workflow</h3>
          <div className="space-y-10">{[{ t: 'Drop Files', d: 'Drag any document or image onto the Home screen.' }, { t: 'Sorted Hubs', d: 'We automatically route files to the Hub or Studio.' }, { t: 'Configure', d: 'Click a file in the queue to open settings.' }, { t: 'Export', d: 'Press Convert/Resize and download your result.' }].map((step, i) => (
              <div key={i} className="flex items-start gap-6"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div><div><h4 className="text-xl font-black">{step.t}</h4><p className="text-slate-500 text-sm md:text-base leading-relaxed">{step.d}</p></div></div>
            ))}</div>
          <div className="mt-12 flex flex-col gap-4"><button onClick={() => { setActiveTourType('general'); setTourStepIndex(0); setIsTourOpen(true); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center justify-center gap-3"><Play size={16}/> Replay UI Tour</button></div>
        </section>
        <div className="flex justify-center pt-8"><button onClick={() => setView('home')} className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] group"><ArrowLeft className="group-hover:-translate-x-2 transition-transform"/> Back Home</button></div>
      </div>
    </div>
  );

  const renderTour = () => {
    if (!isTourOpen) return null;
    const steps = activeTourType === 'general' ? TOUR_STEPS : RESIZE_TOUR_STEPS;
    const step = steps[tourStepIndex];
    if (!step) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={completeTour} />
        <div className="relative glass w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/5 animate-in zoom-in duration-300">
          <button onClick={completeTour} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X size={20} /></button>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">{step.icon}</div>
            <div><h2 className="text-2xl font-display font-black tracking-tighter mb-2">{step.title}</h2><p className="text-slate-500 text-sm font-medium leading-relaxed">{step.content}</p></div>
            <div className="w-full flex items-center justify-between gap-4 pt-4">
              <button onClick={() => setTourStepIndex(prev => Math.max(0, prev - 1))} disabled={tourStepIndex === 0} className="p-2 text-slate-400 disabled:opacity-0"><ChevronLeft size={24} /></button>
              <div className="flex gap-1.5">{steps.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all ${i === tourStepIndex ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-slate-800'}`} />))}</div>
              {tourStepIndex === steps.length - 1 ? (<button onClick={completeTour} className="px-6 py-2 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Close</button>) : (<button onClick={() => setTourStepIndex(prev => prev + 1)} className="p-2 text-primary"><ChevronRight size={24} /></button>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResize = () => {
    const selectedFile = resizeFiles.find(x => x.id === selectedFileId);
    return (
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        <div className={`w-full md:w-80 border-r dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shadow-2xl z-10 ${selectedFileId && 'hidden md:flex'}`}>
          <div className="p-4 border-b dark:border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Queue</h3><div className="flex items-center gap-2"><button onClick={() => clearQueue('resize')} className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={12}/> Clear All</button><button onClick={() => document.getElementById('resizeInput')?.click()} className="p-1.5 bg-primary text-white rounded-lg hover:scale-105 transition-transform"><Upload size={14}/></button></div></div>
            <input id="resizeInput" type="file" multiple accept="image/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)}/>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {resizeFiles.map((f, index) => (
              <div key={f.id} draggable onDragStart={(e) => handleGenericDragStart(e, index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleResizeDrop(e, index)} onClick={() => setSelectedFileId(f.id)} className={`p-3 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-3 relative group ${selectedFileId === f.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'} ${draggedIndex === index ? 'opacity-30' : ''}`}>
                <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>
                <img src={f.previewUrl!} className="w-8 h-8 rounded object-cover shadow-sm" />
                <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate">{f.name}</p>{f.originalDimensions && <p className="text-[9px] text-slate-400 font-medium">{f.settings.width}x{f.settings.height}</p>}</div>
                {f.status === 'completed' && <CheckCircle2 size={12} className="text-accent" />}
              </div>
            ))}
            {resizeFiles.length === 0 && <div className="h-40 flex flex-col items-center justify-center opacity-20 text-center px-4"><Layers size={32} /><p className="text-[10px] font-black uppercase mt-2">Workspace Empty</p></div>}
          </div>
          {resizeFiles.length > 0 && selectedFileId && <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"><button onClick={handleResizeAll} disabled={isBatchProcessing} className="w-full py-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"><Play size={14}/> Resize All</button></div>}
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-black p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
          {resizeFiles.length === 0 ? (<SectionDropZone onFiles={handleFiles} icon={<Scaling size={32} />} title="Resize Workspace" subtitle="images" accept="image/*" />) : selectedFile ? (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl flex flex-col border dark:border-slate-800">
                 <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-t-[2rem] flex justify-between items-center"><span className="text-xs font-bold truncate">{selectedFile.name}</span>{selectedFile.originalDimensions && <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Original: {selectedFile.originalDimensions.width} x {selectedFile.originalDimensions.height}</span>}</div>
                 <div className="p-8 flex items-center justify-center relative group"><img src={selectedFile.previewUrl!} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded-xl shadow-lg transition-transform duration-500" /><div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{selectedFile.settings.width} x {selectedFile.settings.height}</div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-lg border dark:border-slate-800 space-y-6">
                   <div className="flex items-center justify-between"><h4 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2"><Sliders size={14}/> Target dimensions</h4><button onClick={() => { if (selectedFile.originalDimensions) { setResizeFiles(prev => prev.map(x => x.id === selectedFile.id ? { ...x, settings: { ...x.settings, width: x.originalDimensions!.width, height: x.originalDimensions!.height, maintainAspectRatio: true, quality: 0.75 } } : x)); } }} className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border dark:border-slate-700" title="Restore original size and aspect ratio"><RotateCcw size={12} />Reset to Original</button></div>
                   <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Width (px)</p><input type="number" value={selectedFile.settings.width} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 0); setResizeFiles(p => p.map(x => { if (x.id !== selectedFile.id) return x; let h = x.settings.height; if (x.settings.maintainAspectRatio && x.originalDimensions) { h = Math.round(v * (x.originalDimensions.height / x.originalDimensions.width)); } return { ...x, settings: { ...x.settings, width: v, height: h } }; })); }} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/30 transition-all" /></div><div className="space-y-2"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height (px)</p><input type="number" value={selectedFile.settings.height} onChange={e => { const v = Math.max(1, parseInt(e.target.value) || 0); setResizeFiles(p => p.map(x => { if (x.id !== selectedFile.id) return x; let w = x.settings.width; if (x.settings.maintainAspectRatio && x.originalDimensions) { w = Math.round(v * (x.originalDimensions.width / x.originalDimensions.height)); } return { ...x, settings: { ...x.settings, height: v, width: w } }; })); }} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-primary/30 transition-all" /></div></div>
                   <div className="flex items-center gap-2 py-2"><button onClick={() => setResizeFiles(p => p.map(x => x.id === selectedFile.id ? { ...x, settings: { ...x.settings, maintainAspectRatio: !x.settings.maintainAspectRatio } } : x))} className={`p-2 rounded-lg border transition-all ${selectedFile.settings.maintainAspectRatio ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'}`}><Monitor size={14} /></button><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Maintain Aspect Ratio</span>{selectedFile.originalDimensions && <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-accent/5 rounded-full border border-accent/20"><Scaling size={10} className="text-accent" /><span className="text-[10px] font-black text-accent">Scale: {Math.round((selectedFile.settings.width / selectedFile.originalDimensions.width) * 100)}%</span></div>}</div>
                   <div className="flex flex-wrap gap-2 pt-2 border-t dark:border-slate-800">{RESIZE_PRESETS.map(p => (<button key={p.label} onClick={() => setResizeFiles(pr => pr.map(x => { if (x.id !== selectedFile.id) return x; return { ...x, settings: { ...x.settings, width: p.w, height: p.h } }; }))} className="py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-bold hover:bg-primary hover:text-white transition-all border dark:border-slate-700">{p.label}</button>))}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-lg border dark:border-slate-800 flex flex-col justify-center gap-6">
                  <div className="space-y-4"><div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span>Export Quality</span><span className="text-primary">{Math.round(selectedFile.settings.quality * 100)}%</span></div><input type="range" min="0.1" max="1.0" step="0.05" value={selectedFile.settings.quality} onChange={(e) => { const val = parseFloat(e.target.value); setResizeFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, settings: { ...f.settings, quality: val } } : f)); }} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" /></div>
                  {selectedFile.status === 'completed' ? (
                    <div className="space-y-3"><a href={selectedFile.convertedUrl!} download={getDownloadName(selectedFile.name, selectedFile.targetFormat, 'resized-')} className="w-full py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Download size={14}/> Download Result</a><p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Format: {selectedFile.targetFormat}</p></div>
                  ) : (<button onClick={() => startImgResizeAction(selectedFile.id)} disabled={selectedFile.status === 'processing'} className="w-full py-5 bg-primary text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">{selectedFile.status === 'processing' ? <Activity size={18} className="animate-spin" /> : <Scaling size={18} />}{selectedFile.status === 'processing' ? "Applying Scale..." : "Resize & Export"}</button>)}
                </div>
              </div>
            </div>
          ) : (<div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center"><Scaling size={64}/><h3 className="text-xl font-black mt-4 uppercase tracking-widest">Select File</h3></div>)}
        </div><SidebarAd />
      </div>
    );
  };

  const renderCompress = () => {
    const activeQueue = compressTab === 'docs' ? compressDocFiles : compressImgFiles;
    const selectedFile = activeQueue.find(x => x.id === selectedFileId);
    return (
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        <div className={`w-full md:w-80 border-r dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 shadow-2xl z-10 ${selectedFileId && 'hidden md:flex'}`}>
          <div className="p-4 border-b dark:border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><Minimize2 size={14}/> Queue</h3><div className="flex items-center gap-2"><button onClick={() => clearQueue('compress')} className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={12}/> Clear All</button><button onClick={() => document.getElementById('compressInput')?.click()} className="p-1.5 bg-primary text-white rounded-lg hover:scale-105 transition-transform"><Upload size={14}/></button></div></div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl"><button onClick={() => { setCompressTab('docs'); setSelectedFileId(null); }} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${compressTab === 'docs' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold' : 'text-slate-400 hover:text-slate-600'}`}>Documents</button><button onClick={() => { setCompressTab('imgs'); setSelectedFileId(null); }} className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${compressTab === 'imgs' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold' : 'text-slate-400 hover:text-slate-600'}`}>Images</button></div>
            <input id="compressInput" type="file" multiple accept={compressTab === 'docs' ? ".pdf,.docx,.doc,.txt" : "image/*"} className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)}/>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {activeQueue.map((f, index) => (
              <div key={f.id} draggable onDragStart={(e) => handleGenericDragStart(e, index)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleCompressDrop(e, index)} onClick={() => setSelectedFileId(f.id)} className={`p-3 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-3 relative group ${selectedFileId === f.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'} ${draggedIndex === index ? 'opacity-30' : ''}`}>
                <div className="text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>
                <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">{f.category === FileCategory.DOCUMENT ? (f.previewUrl ? <img src={f.previewUrl} className="w-full h-full object-cover" /> : <FileText size={16} />) : (f.previewUrl ? <img src={f.previewUrl} className="w-full h-full object-cover" /> : <ImageIcon size={16} />)}</div>
                <div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate">{f.name}</p><p className="text-[9px] text-slate-400 font-medium">{formatBytes(f.size)}</p></div>
                {f.status === 'completed' && <CheckCircle2 size={12} className="text-accent" />}{f.status === 'error' && <X size={12} className="text-red-500" />}
              </div>
            ))}
            {activeQueue.length === 0 && <div className="h-40 flex flex-col items-center justify-center text-center px-4 opacity-20"><Files size={32} /><p className="text-[10px] font-black uppercase mt-2 tracking-widest">No {compressTab === 'docs' ? 'documents' : 'images'} in queue</p></div>}
          </div>
        </div>
        <div className="flex-1 bg-slate-50 dark:bg-black p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
          {activeQueue.length === 0 ? (<SectionDropZone onFiles={handleFiles} icon={<Minimize2 size={32} />} title={`${compressTab === 'docs' ? 'Document' : 'Image'} Compression`} subtitle={compressTab === 'docs' ? "PDF/Word/Text" : "Photos/Assets"} accept={compressTab === 'docs' ? ".pdf,.docx,.doc,.txt" : "image/*"} />) : selectedFile ? (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl flex flex-col border dark:border-slate-800 overflow-hidden">
                 <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center"><span className="text-xs font-bold truncate">{selectedFile.name}</span><span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-black">{formatBytes(selectedFile.size)}</span></div>
                 <div className="p-12 flex items-center justify-center min-h-[300px] bg-slate-100/50 dark:bg-slate-800/20">{selectedFile.previewUrl ? <img src={selectedFile.previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded-xl shadow-lg border dark:border-slate-700" /> : <div className="flex flex-col items-center gap-4 opacity-20"><Files size={64} /><p className="text-xs font-bold uppercase tracking-widest">No Preview Available</p></div>}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-lg border dark:border-slate-800 space-y-6">
                   <h4 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2"><Sliders size={14}/> Compression settings</h4>
                   {selectedFile.category === FileCategory.DOCUMENT ? (
                     <><div className="grid grid-cols-2 gap-3">{['low', 'medium', 'high', 'custom'].map((lvl) => (<button key={lvl} onClick={() => setCompressDocFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, compressionLevel: lvl as any } : f))} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${selectedFile.compressionLevel === lvl ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{lvl}</button>))}</div>{selectedFile.compressionLevel === 'custom' && <div className="space-y-4 animate-in slide-in-from-top-2"><div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span>Reduction Intensity</span><span className="text-primary">{( (1 - (selectedFile.customCompressionValue || 0.7)) * 100).toFixed(0)}%</span></div><input type="range" min="0.1" max="0.95" step="0.05" value={selectedFile.customCompressionValue || 0.7} onChange={(e) => { const val = parseFloat(e.target.value); setCompressDocFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, customCompressionValue: val } : f)); }} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" /><p className="text-[9px] text-slate-400 leading-tight">Lower intensity preserves more formatting.</p></div>}</>
                   ) : (
                     <div className="space-y-6">
                        <div className="space-y-2"><p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Format</p><div className="flex gap-2">{['JPG', 'WEBP', 'PNG', 'ICO'].map(fmt => (<button key={fmt} onClick={() => setCompressImgFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, targetFormat: fmt as any } : f))} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${selectedFile.targetFormat === fmt ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{fmt}</button>))}</div></div>
                        <div className="space-y-4"><div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span>Resolution Scale</span><span className="text-primary">{Math.round((selectedFile as ImageFileData).settings.width / ((selectedFile as ImageFileData).originalDimensions?.width || 1) * 100)}%</span></div><input type="range" min="0.1" max="1.0" step="0.05" value={(selectedFile as ImageFileData).settings.width / ((selectedFile as ImageFileData).originalDimensions?.width || 1)} onChange={(e) => { const val = parseFloat(e.target.value); const orig = (selectedFile as ImageFileData).originalDimensions!; setCompressImgFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, settings: { ...f.settings, width: Math.round(orig.width * val), height: Math.round(orig.height * val), maintainAspectRatio: true } } : f)); }} className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" /></div>
                        <div className="space-y-4"><div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><span>Quality</span><span className="text-primary">{Math.round((selectedFile as ImageFileData).settings.quality * 100)}%</span></div><input type="range" min="0.1" max="1.0" step="0.05" disabled={selectedFile.targetFormat === 'PNG' || selectedFile.targetFormat === 'GIF'} value={(selectedFile as ImageFileData).settings.quality} onChange={(e) => { const val = parseFloat(e.target.value); setCompressImgFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, settings: { ...f.settings, quality: val } } : f)); }} className={`w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary ${selectedFile.targetFormat === 'PNG' ? 'opacity-30' : ''}`} /></div>
                     </div>
                   )}
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-lg border dark:border-slate-800 flex flex-col justify-center space-y-6">
                  {selectedFile.status === 'completed' ? (
                    <div className="space-y-4"><div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-accent tracking-tighter">New Size</p><p className="text-lg font-bold">{formatBytes(selectedFile.compressedSize || 0)}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Reduction</p><p className="text-lg font-bold text-accent">-{Math.round((1 - (selectedFile.compressedSize || 0) / selectedFile.size) * 100)}%</p></div></div><a href={selectedFile.convertedUrl!} download={getDownloadName(selectedFile.name, selectedFile.category === FileCategory.IMAGE ? (selectedFile as ImageFileData).targetFormat : 'pdf', 'optimized-')} className="w-full py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Download size={14}/> Download Result</a><button onClick={() => { if (compressTab === 'docs') setCompressDocFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, status: 'pending', convertedUrl: null } : f)); else setCompressImgFiles(prev => prev.map(f => f.id === selectedFile.id ? { ...f, status: 'pending', convertedUrl: null } : f)); }} className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2"><RotateCcw size={10}/> Re-compress settings</button></div>
                  ) : (<div className="space-y-4"><p className="text-xs text-slate-500 font-medium leading-relaxed">Processing happens in your browser. {selectedFile.targetFormat} output selected.</p><button onClick={() => compressTab === 'docs' ? startDocCompressAction(selectedFile.id) : startImgCompressAction(selectedFile.id)} disabled={selectedFile.status === 'processing'} className="w-full py-5 bg-primary text-white rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 transition-all">{selectedFile.status === 'processing' ? <Activity size={18} className="animate-spin" /> : <ShieldCheck size={18}/>}{selectedFile.status === 'processing' ? "Optimizing..." : "Start Optimization"}</button></div>)}
                </div>
              </div>
            </div>
          ) : (<div className="flex-1 flex flex-col items-center justify-center opacity-10 text-center"><Minimize2 size={64}/><h3 className="text-xl font-black mt-4 uppercase tracking-widest">Select a file to optimize</h3></div>)}
        </div><SidebarAd />
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}>
      <header className="sticky top-0 z-50 glass border-b dark:border-slate-800 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between"><div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}><Logo size={32} className="group-hover:scale-110 transition-transform" /><span className="hidden sm:inline text-xl font-display font-black tracking-tighter">fileconverser</span></div><nav className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400"><button onClick={() => setView('home')} className={`hover:text-primary transition-colors ${view === 'home' ? 'text-primary font-bold' : ''}`}>Home</button><button onClick={() => setView('documents')} className={`hover:text-primary transition-colors ${view === 'documents' ? 'text-primary font-bold' : ''}`}>Docs</button><button onClick={() => setView('images')} className={`hover:text-primary transition-colors ${view === 'images' ? 'text-primary font-bold' : ''}`}>Images</button><button onClick={() => setView('compress')} className={`hover:text-primary transition-colors ${view === 'compress' ? 'text-primary font-bold' : ''}`}>Compress</button><button onClick={() => setView('resize')} className={`hover:text-primary transition-colors ${view === 'resize' ? 'text-primary font-bold' : ''}`}>Resize</button><button onClick={() => setView('help')} className={`hover:text-primary transition-colors ${view === 'help' ? 'text-primary font-bold' : ''}`}>Guide</button></nav><div className="flex items-center gap-4"><button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-transform">{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl"><Menu size={16}/></button></div></header>
      {isMobileMenuOpen && (<div className="lg:hidden fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300"><div className="p-6 flex justify-between items-center border-b dark:border-slate-900"><span className="text-xl font-display font-black tracking-tighter">Menu</span><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg"><X size={24}/></button></div><div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">{[{ id: 'home', l: 'Home', i: <Zap size={18}/> }, { id: 'documents', l: 'Docs Hub', i: <FileText size={18}/> }, { id: 'images', l: 'Image Studio', i: <ImageIcon size={18}/> }, { id: 'compress', l: 'Compressor', i: <Minimize2 size={18}/> }, { id: 'resize', l: 'Resizer', i: <Scaling size={18}/> }, { id: 'help', l: 'Guide', i: <HelpCircle size={18}/> }].map(item => (<button key={item.id} onClick={() => { setView(item.id as AppView); setIsMobileMenuOpen(false); setSelectedFileId(null); }} className={`p-4 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest transition-all ${view === item.id ? 'bg-primary text-white scale-105 shadow-lg' : 'bg-slate-50 dark:bg-slate-900'}`}>{item.i} {item.l}</button>))}</div></div>)}
      <HeaderAd /><main className="flex-1 flex flex-col relative overflow-hidden">{isDragging && (<div className="absolute inset-0 z-[100] bg-primary/20 backdrop-blur-xl flex items-center justify-center border-8 border-dashed border-primary/50 pointer-events-none p-12"><div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl text-center space-y-4 animate-in zoom-in duration-300"><Upload size={48} className="mx-auto text-primary animate-bounce" /><h2 className="text-4xl font-black tracking-tighter">Release to Import</h2></div></div>)}
        {view === 'home' ? renderHome() : view === 'help' ? renderHelp() : view === 'resize' ? renderResize() : view === 'compress' ? renderCompress() : view === 'documents' ? (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className={`w-full md:w-80 border-r dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 p-4 gap-4 ${selectedFileId ? 'hidden md:flex' : ''}`}><div className="flex justify-between items-center"><h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Docs Hub</h3><button onClick={() => document.getElementById('docInput')?.click()} className="p-1.5 bg-primary text-white rounded-lg hover:scale-110 transition-transform"><Upload size={14}/></button></div><input id="docInput" type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)}/><div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">{docFiles.map(f => (<div key={f.id} onClick={() => setSelectedFileId(f.id)} className={`p-3 rounded-xl cursor-pointer border-2 transition-all text-xs font-bold truncate flex items-center gap-2 ${selectedFileId === f.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{f.status === 'completed' && <CheckCircle2 size={12}/>}{f.name}</div>))}</div></div>
            <div className="flex-1 bg-slate-50 dark:bg-black p-4 overflow-y-auto custom-scrollbar flex flex-col">
              {docFiles.length === 0 ? (<SectionDropZone onFiles={handleFiles} icon={<FileText size={32} />} title="Document Hub" subtitle="PDFs/Docs" />) : selectedFileId && docFiles.find(x => x.id === selectedFileId) ? (() => {
                  const f = docFiles.find(x => x.id === selectedFileId)!;
                  return (
                    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-xl border dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">{f.previewUrl ? (<img src={f.previewUrl} className="max-w-full max-h-[300px] shadow-lg rounded" />) : (<FileText size={64} className="opacity-10"/>)}<p className="mt-4 text-xs font-bold text-slate-400 truncate max-w-full">{f.name}</p></div>
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border dark:border-slate-800 space-y-6">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2"><Settings size={14}/> Target Format</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{DOC_FORMATS.map(fmt => (<button key={fmt} onClick={() => setDocFiles(prev => prev.map(doc => doc.id === f.id ? { ...doc, targetFormat: fmt } : doc))} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${f.targetFormat === fmt ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{fmt}</button>))}</div>
                        {f.status === 'completed' ? (
                          <div className="flex flex-col gap-3"><a href={f.convertedUrl!} download={getDownloadName(f.name, f.targetFormat)} className="w-full py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Download size={14}/> Save Result</a><button onClick={() => setDocFiles(prev => prev.map(doc => doc.id === f.id ? { ...doc, status: 'pending', convertedUrl: null } : doc))} className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center justify-center gap-2"><RotateCcw size={10}/> Change settings</button></div>
                        ) : (<button onClick={() => startDocConvert(f.id)} disabled={f.status === 'processing'} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform">{f.status === 'processing' ? <Activity size={14} className="animate-spin" /> : <Play size={14} />}{f.status === 'processing' ? "Processing..." : `Convert to ${f.targetFormat}`}</button>)}
                      </div>
                    </div>
                  );
                })() : (<div className="flex-1 flex flex-col items-center justify-center opacity-10"><Files size={64}/><h3 className="text-xl font-black mt-4 uppercase tracking-widest">Select Doc</h3></div>)}
            </div><SidebarAd />
          </div>
        ) : view === 'images' ? (
           <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            <div className={`w-full md:w-80 border-r dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 p-4 gap-4 ${selectedFileId ? 'hidden md:flex' : ''}`}><div className="flex justify-between items-center"><h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Images Studio</h3><button onClick={() => document.getElementById('imgInput')?.click()} className="p-1.5 bg-primary text-white rounded-lg hover:scale-110 transition-transform"><Upload size={14}/></button></div><input id="imgInput" type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)}/><div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">{imgFiles.map(f => (<div key={f.id} onClick={() => setSelectedFileId(f.id)} className={`p-3 rounded-xl cursor-pointer border-2 transition-all text-xs font-bold truncate flex items-center gap-2 ${selectedFileId === f.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{f.status === 'completed' && <CheckCircle2 size={12}/>}{f.name}</div>))}</div></div>
            <div className="flex-1 bg-slate-50 dark:bg-black p-4 overflow-y-auto custom-scrollbar flex flex-col">
              {imgFiles.length === 0 ? (<SectionDropZone onFiles={handleFiles} icon={<ImageIcon size={32} />} title="Image Studio" subtitle="Images" />) : selectedFileId && imgFiles.find(x => x.id === selectedFileId) ? (() => {
                  const f = imgFiles.find(x => x.id === selectedFileId)!;
                  return (
                    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border dark:border-slate-800 flex flex-col items-center justify-center min-h-[300px]"><img src={f.previewUrl!} className="max-w-full max-h-[300px] shadow-lg rounded" /></div>
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-lg border dark:border-slate-800 space-y-6">
                        <div><h4 className="font-black text-[10px] uppercase tracking-widest text-primary flex items-center gap-2 mb-4"><Monitor size={14}/> Target Format</h4><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{IMAGE_FORMATS.map(fmt => (<button key={fmt} onClick={() => setImgFiles(prev => prev.map(img => img.id === f.id ? { ...img, targetFormat: fmt } : img))} className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${f.targetFormat === fmt ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{fmt}</button>))}</div></div>
                        <div className="border-t dark:border-slate-800 pt-6">
                          <button onClick={() => setShowAdvancedImgSettings(!showAdvancedImgSettings)} className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"><span className="flex items-center gap-2"><Settings size={14}/> Advanced Workshop Settings</span>{showAdvancedImgSettings ? <ChevronLeft size={14} className="-rotate-90"/> : <ChevronRight size={14} className="rotate-90"/>}</button>
                          {showAdvancedImgSettings && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-2"><Activity size={12}/> Resolution (DPI)</label><div className="flex gap-2">{[72, 96, 150, 300].map(val => (<button key={val} onClick={() => setImgFiles(prev => prev.map(img => img.id === f.id ? { ...img, settings: { ...img.settings, dpi: val } } : img))} className={`flex-1 py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${f.settings.dpi === val ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{val}</button>))}</div></div>
                              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter flex items-center gap-2"><Palette size={12}/> Color Profile</label><select value={f.settings.colorProfile} onChange={(e) => setImgFiles(prev => prev.map(img => img.id === f.id ? { ...img, settings: { ...img.settings, colorProfile: e.target.value as any } } : img))} className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-[10px] font-bold outline-none border-2 border-transparent focus:border-primary/30 appearance-none cursor-pointer">{COLOR_PROFILES.map(profile => (<option key={profile} value={profile}>{profile}</option>))}</select></div>
                            </div>
                          )}
                        </div>
                        {f.status === 'completed' ? (
                          <div className="flex flex-col gap-3"><a href={f.convertedUrl!} download={getDownloadName(f.name, f.targetFormat)} className="w-full py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Download size={14}/> Save Result</a><button onClick={() => setImgFiles(prev => prev.map(img => img.id === f.id ? { ...img, status: 'pending', convertedUrl: null } : img))} className="text-[10px] font-bold text-slate-400 hover:text-primary flex items-center justify-center gap-2"><RotateCcw size={10}/> Change settings</button></div>
                        ) : (<button onClick={() => startImgConvert(f.id)} disabled={f.status === 'processing'} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition-transform">{f.status === 'processing' ? <Activity size={18} className="animate-spin" /> : <ShieldCheck size={18}/>}{f.status === 'processing' ? "Processing..." : `Convert to ${f.targetFormat}`}</button>)}
                      </div>
                    </div>
                  );
                })() : (<div className="flex-1 flex flex-col items-center justify-center opacity-10"><ImageIcon size={64}/><h3 className="text-xl font-black mt-4 uppercase tracking-widest">Select Image</h3></div>)}
            </div><SidebarAd />
          </div>
        ) : (<div className="flex-1 flex flex-col p-12 items-center justify-center opacity-30"><Layers size={64}/><h3 className="text-2xl font-black mt-4 uppercase tracking-widest">Work in Progress</h3><button onClick={() => setView('home')} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase">Go Home</button></div>)}
      </main>
      {renderTour()}
      <footer className="mt-20 border-t dark:border-slate-800 py-10 bg-white/30 dark:bg-black/30 backdrop-blur-sm"><div className="container mx-auto px-4 flex justify-center"><span className="font-black tracking-widest text-slate-300 uppercase text-[10px]">fileconverser v1.0.0</span></div></footer>
    </div>
  );
};

export default App;
