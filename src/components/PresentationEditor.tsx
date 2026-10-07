import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layout,
  Plus,
  Trash2,
  Copy,
  Play,
  Download,
  X,
  Type,
  Image as ImageIcon,
  Shapes,
  Smile,
  Table as TableIcon,
  BarChart2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Upload,
  Layers,
  Check,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Eye,
  Save,
  Square,
  Circle as CircleIcon,
  Triangle as TriangleIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ArrowRight as ArrowRightIcon,
  Minus,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SlideDeck, Slide, CanvasElement, CanvasElementType } from '../types';
import { ThemeConfig } from '../utils/theme';

// Standard 16:9 Canvas Internal Coordinates (16:9 = 960 / 540)
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

interface PresentationEditorProps {
  deck: SlideDeck;
  onUpdateDeck: (updated: SlideDeck) => void;
  theme: ThemeConfig;
  projectName: string;
}

// Preset Fonts
const FONT_OPTIONS = [
  { label: 'Inter (Hiện đại)', value: 'Inter, sans-serif' },
  { label: 'Roboto (Chuẩn)', value: 'Roboto, sans-serif' },
  { label: 'Montserrat (Đậm nét)', value: 'Montserrat, sans-serif' },
  { label: 'Playfair Display (Sang trọng)', value: 'Playfair Display, serif' },
  { label: 'Oswald (Mạnh mẽ)', value: 'Oswald, sans-serif' },
  { label: 'Dancing Script (Viết tay)', value: 'Dancing Script, cursive' },
  { label: 'Merriweather (Báo chí)', value: 'Merriweather, serif' },
  { label: 'Courier New (Code/Monospace)', value: 'Courier New, monospace' },
];

// Curated Color Palettes
const COLOR_PALETTE = [
  '#000000',
  '#1e293b',
  '#475569',
  '#94a3b8',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
];

// Curated Background Colors & Gradients
const BACKGROUND_PRESETS = [
  { label: 'Trắng tinh', value: '#ffffff' },
  { label: 'Xám sáng', value: '#f8fafc' },
  { label: 'Kem nhã', value: '#fefce8' },
  { label: 'Hồng phấn pastel', value: '#fff1f2' },
  { label: 'Tím pastel', value: '#faf5ff' },
  { label: 'Xanh pastel', value: '#eff6ff' },
  { label: 'Xanh ngọc pastel', value: '#f0fdf4' },
  { label: 'Đen sang trọng', value: '#0f172a' },
  { label: 'Xám than', value: '#18181b' },
  { label: 'Gradient Tím Indigo', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  { label: 'Gradient Hoàng hôn', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { label: 'Gradient Đại dương', value: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' },
];

// Curated Stock Photos (Unsplash)
const STOCK_PHOTOS = [
  {
    name: 'Công nghệ & AI',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Học tập & Nhóm',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Không gian sáng tạo',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tối giản & Trừu tượng',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Biểu đồ tăng trưởng',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Thuyết trình bài giảng',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
  },
];

// Helper to ensure slide has canvas elements array
const getSlideCanvasElements = (slide: Slide): CanvasElement[] => {
  if (slide.canvasElements && Array.isArray(slide.canvasElements)) {
    return slide.canvasElements;
  }
  // Convert legacy slides if needed
  const elements: CanvasElement[] = [];
  if (slide.title) {
    elements.push({
      id: `el_title_${slide.id}`,
      type: 'text',
      x: 80,
      y: 80,
      width: 800,
      height: 70,
      text: slide.title,
      fontSize: 36,
      fontWeight: 'bold',
      fontFamily: 'Inter, sans-serif',
      color: '#0f172a',
      textAlign: 'left',
      zIndex: 1,
    });
  }
  if (slide.subtitle) {
    elements.push({
      id: `el_sub_${slide.id}`,
      type: 'text',
      x: 80,
      y: 160,
      width: 800,
      height: 40,
      text: slide.subtitle,
      fontSize: 20,
      fontWeight: 'normal',
      fontFamily: 'Inter, sans-serif',
      color: '#64748b',
      textAlign: 'left',
      zIndex: 2,
    });
  }
  if (slide.bullets && slide.bullets.length > 0) {
    slide.bullets.forEach((bullet, idx) => {
      elements.push({
        id: `el_bullet_${slide.id}_${idx}`,
        type: 'text',
        x: 80,
        y: 220 + idx * 55,
        width: 800,
        height: 45,
        text: `• ${bullet}`,
        fontSize: 16,
        fontWeight: 'normal',
        fontFamily: 'Inter, sans-serif',
        color: '#334155',
        textAlign: 'left',
        zIndex: 3 + idx,
      });
    });
  }
  return elements;
};

export const PresentationEditor: React.FC<PresentationEditorProps> = ({
  deck,
  onUpdateDeck,
  theme,
  projectName,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Zoom level for canvas (1 = 100%, 0.75, 1.25, etc.)
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Fullscreen Presentation state
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [presentingSlideIndex, setPresentingSlideIndex] = useState<number>(0);

  // Modals & Popovers
  const [showShapeMenu, setShowShapeMenu] = useState<boolean>(false);
  const [showImageMenu, setShowImageMenu] = useState<boolean>(false);
  const [showBgMenu, setShowBgMenu] = useState<boolean>(false);
  const [showIconMenu, setShowIconMenu] = useState<boolean>(false);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  // Mobile responsive view tab: 'canvas' | 'slides' | 'props'
  const [mobileTab, setMobileTab] = useState<'canvas' | 'slides' | 'props'>('canvas');

  // Dragging & Resizing Canvas State
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceImgInputRef = useRef<HTMLInputElement | null>(null);

  const [interactionState, setInteractionState] = useState<{
    mode: 'none' | 'move' | 'resize' | 'rotate';
    handle?: string;
    startX: number;
    startY: number;
    elementStart: { x: number; y: number; width: number; height: number; rotation: number };
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    elementStart: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
  });

  // Undo / Redo history
  const [history, setHistory] = useState<SlideDeck[]>([deck]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active slide
  const currentSlide: Slide = deck.slides[activeSlideIndex] || deck.slides[0] || {
    id: 'slide_default',
    title: 'Slide 1',
    layout: 'blank',
    backgroundColor: '#ffffff',
    canvasElements: [],
  };

  const canvasElements = getSlideCanvasElements(currentSlide);
  const selectedElement = canvasElements.find((el) => el.id === selectedElementId) || null;

  // Push new state to undo/redo history
  const pushHistory = useCallback(
    (newDeck: SlideDeck) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newDeck);
      if (newHistory.length > 30) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onUpdateDeck(newDeck);
    },
    [history, historyIndex, onUpdateDeck]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateDeck(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateDeck(next);
    }
  };

  // Update current slide elements
  const updateCurrentSlideElements = (newElements: CanvasElement[]) => {
    const newSlides = [...deck.slides];
    newSlides[activeSlideIndex] = {
      ...currentSlide,
      canvasElements: newElements,
    };
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
  };

  // Update a property of current slide (e.g. background)
  const updateCurrentSlideProperty = (field: keyof Slide, value: any) => {
    const newSlides = [...deck.slides];
    newSlides[activeSlideIndex] = {
      ...currentSlide,
      [field]: value,
    };
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
  };

  // Update properties of the selected element
  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    const newElements = canvasElements.map((el) =>
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    updateCurrentSlideElements(newElements);
  };

  // Add 1 New Blank Slide (Default 16:9, Pure White)
  const handleAddBlankSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      title: `Slide ${deck.slides.length + 1}`,
      layout: 'blank',
      backgroundColor: '#ffffff',
      canvasElements: [],
      notes: '',
    };
    const newSlides = [...deck.slides, newSlide];
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
    setActiveSlideIndex(newSlides.length - 1);
    setSelectedElementId(null);
  };

  // Duplicate slide
  const handleDuplicateSlide = (index: number) => {
    const target = deck.slides[index];
    const duplicatedElements = getSlideCanvasElements(target).map((el) => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    const duplicated: Slide = {
      ...target,
      id: `slide_${Date.now()}`,
      title: `${target.title || 'Slide'} (Bản sao)`,
      canvasElements: duplicatedElements,
    };
    const newSlides = [...deck.slides];
    newSlides.splice(index + 1, 0, duplicated);
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
    setActiveSlideIndex(index + 1);
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (deck.slides.length <= 1) {
      // Clear current slide to blank instead of deleting the only slide
      const resetSlide: Slide = {
        id: `slide_${Date.now()}`,
        title: 'Slide 1',
        layout: 'blank',
        backgroundColor: '#ffffff',
        canvasElements: [],
        notes: '',
      };
      const updatedDeck = { ...deck, slides: [resetSlide], lastModified: 'Vừa xong' };
      pushHistory(updatedDeck);
      setSelectedElementId(null);
      return;
    }
    const newSlides = deck.slides.filter((_, i) => i !== index);
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
    setActiveSlideIndex(Math.max(0, index - 1));
    setSelectedElementId(null);
  };

  // Move slide up / down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= deck.slides.length) return;
    const newSlides = [...deck.slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;
    const updatedDeck: SlideDeck = {
      ...deck,
      slides: newSlides,
      lastModified: 'Vừa xong',
    };
    pushHistory(updatedDeck);
    setActiveSlideIndex(targetIdx);
  };

  // ADD TEXT ELEMENT (Default: "Google AI Studio" as requested!)
  const handleAddText = (presetType: 'heading' | 'subheading' | 'body' = 'heading') => {
    const id = `text_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'text',
      x: 180,
      y: presetType === 'heading' ? 180 : presetType === 'subheading' ? 220 : 250,
      width: presetType === 'heading' ? 600 : presetType === 'subheading' ? 500 : 450,
      height: presetType === 'heading' ? 80 : presetType === 'subheading' ? 60 : 50,
      rotation: 0,
      text:
        presetType === 'heading'
          ? 'Google AI Studio'
          : presetType === 'subheading'
          ? 'Ý tưởng bài thuyết trình chuyên nghiệp'
          : 'Nhập nội dung chi tiết tại đây...',
      fontFamily: 'Inter, sans-serif',
      fontSize: presetType === 'heading' ? 44 : presetType === 'subheading' ? 24 : 18,
      fontWeight: presetType === 'heading' ? 'bold' : presetType === 'subheading' ? '600' : 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#0f172a',
      textAlign: presetType === 'heading' ? 'center' : 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      opacity: 1,
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
  };

  // ADD IMAGE ELEMENT
  const handleAddImage = (imageUrl: string) => {
    const id = `img_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'image',
      src: imageUrl,
      alt: 'Slide Image',
      x: 230,
      y: 95,
      width: 500,
      height: 350,
      rotation: 0,
      objectFit: 'cover',
      borderRadius: 12,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      shadow: true,
      opacity: 1,
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
    setShowImageMenu(false);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleAddImage(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle replace image
  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateSelectedElement({ src: result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Drag & drop image directly onto canvas
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            handleAddImage(result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // ADD SHAPE ELEMENT
  const handleAddShape = (shapeType: CanvasElement['shapeType']) => {
    const id = `shape_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'shape',
      shapeType: shapeType || 'rectangle',
      x: 330,
      y: 170,
      width: shapeType === 'line' ? 300 : 300,
      height: shapeType === 'line' ? 6 : 200,
      rotation: 0,
      fillColor: shapeType === 'line' ? '#4f46e5' : '#6366f1',
      borderColor: '#4f46e5',
      borderWidth: 0,
      borderRadius: shapeType === 'rounded-rect' ? 16 : 0,
      shadow: false,
      opacity: 1,
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
    setShowShapeMenu(false);
  };

  // ADD ICON ELEMENT
  const handleAddIcon = (iconName: string) => {
    const id = `icon_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'icon',
      iconName,
      x: 430,
      y: 220,
      width: 100,
      height: 100,
      rotation: 0,
      color: '#4f46e5',
      opacity: 1,
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
    setShowIconMenu(false);
  };

  // ADD TABLE ELEMENT
  const handleAddTable = () => {
    const id = `table_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'table',
      x: 180,
      y: 140,
      width: 600,
      height: 250,
      tableRows: 3,
      tableCols: 3,
      tableData: [
        ['Tiêu chí', 'Nhóm 1', 'Nhóm 2'],
        ['Tiến độ', 'Hoàn thành 85%', 'Hoàn thành 90%'],
        ['Đánh giá', 'Tốt', 'Xuất sắc'],
      ],
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
  };

  // ADD CHART ELEMENT
  const handleAddChart = () => {
    const id = `chart_${Date.now()}`;
    const newElement: CanvasElement = {
      id,
      type: 'chart',
      chartType: 'bar',
      chartTitle: 'Biểu đồ khảo sát thực tế',
      chartLabels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
      chartValues: [45, 70, 85, 95],
      x: 230,
      y: 120,
      width: 500,
      height: 300,
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, newElement]);
    setSelectedElementId(id);
  };

  // DELETE SELECTED ELEMENT
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    updateCurrentSlideElements(canvasElements.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  }, [selectedElementId, canvasElements]);

  // DUPLICATE SELECTED ELEMENT
  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const cloned: CanvasElement = {
      ...selectedElement,
      id: `el_${Date.now()}`,
      x: Math.min(CANVAS_WIDTH - selectedElement.width, selectedElement.x + 30),
      y: Math.min(CANVAS_HEIGHT - selectedElement.height, selectedElement.y + 30),
      zIndex: canvasElements.length + 1,
    };
    updateCurrentSlideElements([...canvasElements, cloned]);
    setSelectedElementId(cloned.id);
  }, [selectedElement, canvasElements]);

  // BRING FORWARD / SEND BACKWARD
  const handleLayerOrder = (direction: 'front' | 'back') => {
    if (!selectedElement) return;
    const newZ =
      direction === 'front'
        ? Math.max(...canvasElements.map((e) => e.zIndex || 1), 1) + 1
        : Math.max(1, Math.min(...canvasElements.map((e) => e.zIndex || 1), 1) - 1);
    updateSelectedElement({ zIndex: newZ });
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input or textarea, don't trigger global shortcuts
      if (
        ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
        setEditingTextId(null);
      } else if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        updateSelectedElement({
          x: Math.round(selectedElement.x + dx),
          y: Math.round(selectedElement.y + dy),
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, handleDeleteSelected, handleDuplicateSelected]);

  // FULLSCREEN PRESENTATION KEYBOARD
  useEffect(() => {
    const handlePresentKeyDown = (e: KeyboardEvent) => {
      if (!isPresenting) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setPresentingSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setPresentingSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };
    window.addEventListener('keydown', handlePresentKeyDown);
    return () => window.removeEventListener('keydown', handlePresentKeyDown);
  }, [isPresenting, deck.slides.length]);

  // MOUSE DOWN HANDLER FOR DRAGGING ELEMENT
  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(element.id);

    setInteractionState({
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      elementStart: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
      },
    });
  };

  // TOUCH START HANDLER FOR DRAGGING ON PHONES
  const handleElementTouchStart = (e: React.TouchEvent, element: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
    const touch = e.touches[0];
    if (!touch) return;

    setInteractionState({
      mode: 'move',
      startX: touch.clientX,
      startY: touch.clientY,
      elementStart: {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
      },
    });
  };

  // MOUSE DOWN HANDLER FOR RESIZING HANDLE
  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;

    setInteractionState({
      mode: 'resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elementStart: {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
        rotation: selectedElement.rotation || 0,
      },
    });
  };

  // TOUCH START HANDLER FOR RESIZING ON PHONES
  const handleResizeTouchStart = (e: React.TouchEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement) return;
    const touch = e.touches[0];
    if (!touch) return;

    setInteractionState({
      mode: 'resize',
      handle,
      startX: touch.clientX,
      startY: touch.clientY,
      elementStart: {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
        rotation: selectedElement.rotation || 0,
      },
    });
  };

  // MOUSE DOWN HANDLER FOR ROTATION HANDLE
  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement) return;

    setInteractionState({
      mode: 'rotate',
      startX: e.clientX,
      startY: e.clientY,
      elementStart: {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
        rotation: selectedElement.rotation || 0,
      },
    });
  };

  // TOUCH START HANDLER FOR ROTATION ON PHONES
  const handleRotateTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!selectedElement) return;
    const touch = e.touches[0];
    if (!touch) return;

    setInteractionState({
      mode: 'rotate',
      startX: touch.clientX,
      startY: touch.clientY,
      elementStart: {
        x: selectedElement.x,
        y: selectedElement.y,
        width: selectedElement.width,
        height: selectedElement.height,
        rotation: selectedElement.rotation || 0,
      },
    });
  };

  // GLOBAL POINTER (MOUSE + TOUCH) MOVE & UP HANDLERS FOR DRAG, RESIZE, ROTATE
  useEffect(() => {
    if (interactionState.mode === 'none') return;

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!canvasRef.current || !selectedElement) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const scale = rect.width / CANVAS_WIDTH;
      const dx = (clientX - interactionState.startX) / scale;
      const dy = (clientY - interactionState.startY) / scale;
      const { x, y, width, height, rotation } = interactionState.elementStart;

      if (interactionState.mode === 'move') {
        updateSelectedElement({
          x: Math.round(x + dx),
          y: Math.round(y + dy),
        });
      } else if (interactionState.mode === 'resize') {
        const handle = interactionState.handle;
        let newX = x;
        let newY = y;
        let newW = width;
        let newH = height;

        if (handle?.includes('e')) newW = Math.max(20, width + dx);
        if (handle?.includes('s')) newH = Math.max(20, height + dy);
        if (handle?.includes('w')) {
          newW = Math.max(20, width - dx);
          newX = x + (width - newW);
        }
        if (handle?.includes('n')) {
          newH = Math.max(20, height - dy);
          newY = y + (height - newH);
        }

        updateSelectedElement({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      } else if (interactionState.mode === 'rotate') {
        // Calculate center of element on screen
        const centerX = rect.left + (x + width / 2) * scale;
        const centerY = rect.top + (y + height / 2) * scale;
        const rad = Math.atan2(clientY - centerY, clientX - centerX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        // Snap to cardinal angles within 5 degrees
        if (Math.abs(deg - 0) < 5 || Math.abs(deg - 360) < 5) deg = 0;
        if (Math.abs(deg - 90) < 5) deg = 90;
        if (Math.abs(deg - 180) < 5) deg = 180;
        if (Math.abs(deg - 270) < 5) deg = 270;

        updateSelectedElement({ rotation: deg });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      if (interactionState.mode !== 'none') {
        e.preventDefault(); // Prevent page scrolling during manipulation on mobile
      }
      handlePointerMove(touch.clientX, touch.clientY);
    };

    const handlePointerUp = () => {
      setInteractionState({
        mode: 'none',
        startX: 0,
        startY: 0,
        elementStart: { x: 0, y: 0, width: 0, height: 0, rotation: 0 },
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [interactionState, selectedElement]);

  // SAVE SLIDE
  const handleSaveDeck = () => {
    onUpdateDeck({
      ...deck,
      lastModified: 'Vừa xong',
    });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  // EXPORT SLIDE AS PNG / PRINT
  const handleExportSlide = () => {
    window.print();
  };

  // RENDER CANVAS ELEMENT
  const renderElement = (el: CanvasElement, isMiniature = false) => {
    const isSelected = !isMiniature && selectedElementId === el.id;
    const isEditingText = !isMiniature && editingTextId === el.id;

    // Outer container style
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      zIndex: el.zIndex || 1,
      opacity: el.opacity !== undefined ? el.opacity : 1,
      cursor: isMiniature ? 'default' : 'move',
      userSelect: isEditingText ? 'text' : 'none',
    };

    return (
      <div
        key={el.id}
        style={containerStyle}
        onMouseDown={(e) => !isMiniature && handleElementMouseDown(e, el)}
        onDoubleClick={() => {
          if (!isMiniature && el.type === 'text') {
            setEditingTextId(el.id);
          }
        }}
        className={`group transition-shadow ${
          isSelected
            ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-md'
            : isMiniature
            ? ''
            : 'hover:ring-1 hover:ring-indigo-300'
        }`}
      >
        {/* TEXT ELEMENT */}
        {el.type === 'text' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              fontFamily: el.fontFamily || 'Inter, sans-serif',
              fontSize: `${el.fontSize || 20}px`,
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textDecoration: el.textDecoration || 'none',
              color: el.color || '#000000',
              backgroundColor: el.backgroundColor || 'transparent',
              textAlign: el.textAlign || 'left',
              lineHeight: el.lineHeight || 1.3,
              letterSpacing: `${el.letterSpacing || 0}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              wordBreak: 'break-word',
              padding: '4px',
              outline: 'none',
            }}
            contentEditable={isEditingText}
            suppressContentEditableWarning
            onBlur={(e) => {
              setEditingTextId(null);
              updateSelectedElement({ text: e.currentTarget.innerText });
            }}
          >
            {el.text || 'Nhập văn bản...'}
          </div>
        )}

        {/* IMAGE ELEMENT */}
        {el.type === 'image' && (
          <img
            src={el.src}
            alt={el.alt || 'Slide asset'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: el.objectFit || 'cover',
              borderRadius: `${el.borderRadius || 0}px`,
              border: el.borderWidth ? `${el.borderWidth}px ${el.borderStyle || 'solid'} ${el.borderColor || '#cbd5e1'}` : 'none',
              boxShadow: el.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
            }}
            draggable={false}
          />
        )}

        {/* SHAPE ELEMENT */}
        {el.type === 'shape' && (
          <div style={{ width: '100%', height: '100%' }}>
            {(!el.shapeType || el.shapeType === 'rectangle' || el.shapeType === 'rounded-rect') && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: el.fillColor || '#6366f1',
                  borderRadius: el.shapeType === 'rounded-rect' ? `${el.borderRadius || 16}px` : '0px',
                  border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#4f46e5'}` : 'none',
                  boxShadow: el.shadow ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'none',
                }}
              />
            )}
            {el.shapeType === 'circle' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: el.fillColor || '#6366f1',
                  borderRadius: '50%',
                  border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#4f46e5'}` : 'none',
                  boxShadow: el.shadow ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'none',
                }}
              />
            )}
            {el.shapeType === 'triangle' && (
              <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <polygon
                  points="50,5 95,95 5,95"
                  fill={el.fillColor || '#6366f1'}
                  stroke={el.borderColor || '#4f46e5'}
                  strokeWidth={el.borderWidth || 0}
                />
              </svg>
            )}
            {el.shapeType === 'star' && (
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <polygon
                  points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36"
                  fill={el.fillColor || '#f59e0b'}
                  stroke={el.borderColor || '#d97706'}
                  strokeWidth={el.borderWidth || 0}
                />
              </svg>
            )}
            {el.shapeType === 'heart' && (
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <path
                  d="M50,85 C50,85 10,55 10,30 C10,15 25,10 35,15 C45,20 50,30 50,30 C50,30 55,20 65,15 C75,10 90,15 90,30 C90,55 50,85 50,85 Z"
                  fill={el.fillColor || '#ec4899'}
                  stroke={el.borderColor || '#db2777'}
                  strokeWidth={el.borderWidth || 0}
                />
              </svg>
            )}
            {el.shapeType === 'arrow' && (
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <polygon
                  points="5,35 60,35 60,15 95,50 60,85 60,65 5,65"
                  fill={el.fillColor || '#10b981'}
                  stroke={el.borderColor || '#059669'}
                  strokeWidth={el.borderWidth || 0}
                />
              </svg>
            )}
            {el.shapeType === 'line' && (
              <div
                style={{
                  width: '100%',
                  height: `${el.height || 4}px`,
                  backgroundColor: el.fillColor || '#4f46e5',
                  borderRadius: '2px',
                }}
              />
            )}
          </div>
        )}

        {/* ICON ELEMENT */}
        {el.type === 'icon' && (
          <div className="w-full h-full flex items-center justify-center" style={{ color: el.color || '#4f46e5' }}>
            {el.iconName === 'star' && <StarIcon className="w-full h-full fill-current" />}
            {el.iconName === 'heart' && <HeartIcon className="w-full h-full fill-current" />}
            {el.iconName === 'sparkles' && <Sparkles className="w-full h-full" />}
            {el.iconName === 'lightbulb' && <Smile className="w-full h-full" />}
            {el.iconName === 'check' && <Check className="w-full h-full" />}
            {(!el.iconName || el.iconName === 'smile') && <Smile className="w-full h-full" />}
          </div>
        )}

        {/* TABLE ELEMENT */}
        {el.type === 'table' && (
          <div className="w-full h-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm p-2 flex flex-col justify-center">
            <table className="w-full h-full text-xs text-slate-700 border-collapse">
              <tbody>
                {el.tableData?.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx === 0 ? 'bg-indigo-50 font-bold text-indigo-950' : 'border-t border-slate-200'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 border-r border-slate-200 last:border-r-0">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CHART ELEMENT */}
        {el.type === 'chart' && (
          <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700">{el.chartTitle || 'Thống Kê Dự Án'}</span>
            <div className="flex items-end justify-between h-3/4 gap-3 pt-2">
              {el.chartValues?.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-indigo-600">{val}%</span>
                  <div
                    style={{ height: `${Math.max(10, val)}%` }}
                    className="w-full bg-linear-to-t from-indigo-600 to-violet-500 rounded-t-md"
                  />
                  <span className="text-[9px] text-slate-500 truncate w-full text-center">
                    {el.chartLabels?.[idx] || `Mục ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8 RESIZE HANDLES & 1 ROTATION HANDLE WHEN SELECTED (Canva / PowerPoint style) */}
        {isSelected && (
          <>
            {/* Rotation Handle (above top center) */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center cursor-grab hover:scale-110 shadow-md transition-transform"
              onMouseDown={handleRotateMouseDown}
              title="Kéo để xoay đối tượng"
            >
              <RotateCw className="w-2.5 h-2.5 text-indigo-600" />
            </div>
            {/* Connecting line to rotation handle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-indigo-500 pointer-events-none" />

            {/* 4 Corner Handles */}
            <div
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-nwse-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            />
            <div
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-nesw-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            />
            <div
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-nesw-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            />
            <div
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-nwse-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            />

            {/* 4 Edge Handles */}
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-ns-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            />
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-ns-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            />
            <div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-ew-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            />
            <div
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-xs cursor-ew-resize shadow-xs"
              onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={replaceImgInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImage}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR (PowerPoint / Canva Style Toolbar)                         */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-2.5 space-y-2">
        {/* Row 1: Deck Title + Quick Save / Presentation / Undo / Redo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={deck.title}
              onChange={(e) => onUpdateDeck({ ...deck, title: e.target.value })}
              className="text-sm sm:text-base font-black text-slate-900 dark:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 truncate"
              title="Bấm để đổi tên bài thuyết trình"
            />
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              16:9 Canvas
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            {/* Undo / Redo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 shrink-0"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 shrink-0"
              title="Làm lại (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                className="hover:text-indigo-600 p-0.5"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-9 sm:w-11 text-center font-mono text-[10px] sm:text-[11px]">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                className="hover:text-indigo-600 p-0.5"
                title="Phóng to"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="text-[10px] text-slate-400 hover:text-indigo-500 ml-0.5"
                title="Vừa màn hình (100%)"
              >
                Fit
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

            {/* Save Button */}
            <button
              id="btn-save-slide"
              type="button"
              onClick={handleSaveDeck}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <Save className="w-4 h-4 text-emerald-500" />
              <span>{showSaveToast ? 'Đã lưu!' : 'Lưu'}</span>
            </button>

            {/* Export / Print */}
            <button
              type="button"
              onClick={handleExportSlide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Xuất slide thành bản in / file PDF"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Xuất File</span>
            </button>

            {/* Fullscreen Present Button */}
            <button
              id="btn-present-mode"
              type="button"
              onClick={() => {
                setPresentingSlideIndex(activeSlideIndex);
                setIsPresenting(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold ${theme.primary} shadow-sm hover:opacity-95 transition-all shrink-0 cursor-pointer`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Trình Chiếu</span>
            </button>
          </div>
        </div>

        {/* Row 2: Insertion Palette (Text, Image, Shape, Icon, Table, Chart, Background) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs font-semibold">
          <span className="text-slate-400 text-[11px] mr-1 uppercase font-bold tracking-wider">
            Chèn:
          </span>

          {/* 1. TEXT TOOL */}
          <div className="relative">
            <button
              id="btn-tool-text"
              type="button"
              onClick={() => handleAddText('heading')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
              title="Thêm hộp văn bản vào slide"
            >
              <Type className="w-4 h-4 text-indigo-500" />
              <span>Text</span>
            </button>
          </div>

          {/* 2. IMAGE TOOL */}
          <div className="relative">
            <button
              id="btn-tool-image"
              type="button"
              onClick={() => setShowImageMenu(!showImageMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>Image</span>
            </button>

            {/* Image Source Dropdown Popover */}
            {showImageMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Thêm hình ảnh</span>
                  <button type="button" onClick={() => setShowImageMenu(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowImageMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors"
                  >
                    <Upload className="w-4 h-4 text-indigo-600" />
                    Tải ảnh lên từ máy tính
                  </button>

                  <p className="text-[10px] text-slate-400 italic">
                    💡 Mẹo: Bạn cũng có thể kéo thả file ảnh trực tiếp từ máy tính vào canvas!
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-slate-500 block mb-2">
                      Thư viện ảnh gợi ý:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {STOCK_PHOTOS.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => handleAddImage(photo.url)}
                          className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500"
                        >
                          <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. SHAPE TOOL */}
          <div className="relative">
            <button
              id="btn-tool-shape"
              type="button"
              onClick={() => setShowShapeMenu(!showShapeMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            >
              <Shapes className="w-4 h-4 text-amber-500" />
              <span>Shape</span>
            </button>

            {/* Shape Menu Dropdown */}
            {showShapeMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Chọn hình khối:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddShape('rectangle')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Hình chữ nhật"
                  >
                    <Square className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('rounded-rect')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Chữ nhật bo tròn"
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('circle')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Hình tròn"
                  >
                    <CircleIcon className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('triangle')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Hình tam giác"
                  >
                    <TriangleIcon className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('star')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Ngôi sao"
                  >
                    <StarIcon className="w-5 h-5 fill-current text-amber-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('heart')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Trái tim"
                  >
                    <HeartIcon className="w-5 h-5 fill-current text-rose-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('arrow')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Mũi tên"
                  >
                    <ArrowRightIcon className="w-5 h-5 text-emerald-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddShape('line')}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center"
                    title="Đường kẻ ngang"
                  >
                    <Minus className="w-5 h-5 text-indigo-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. ICON TOOL */}
          <div className="relative">
            <button
              id="btn-tool-icon"
              type="button"
              onClick={() => setShowIconMenu(!showIconMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            >
              <Smile className="w-4 h-4 text-purple-500" />
              <span>Icon</span>
            </button>

            {/* Icon Popover */}
            {showIconMenu && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Biểu tượng:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddIcon('star')}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 text-amber-500"
                  >
                    <StarIcon className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIcon('heart')}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 text-rose-500"
                  >
                    <HeartIcon className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIcon('sparkles')}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 text-indigo-500"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddIcon('check')}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 text-emerald-500"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. TABLE TOOL */}
          <button
            id="btn-tool-table"
            type="button"
            onClick={handleAddTable}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            title="Thêm bảng số liệu"
          >
            <TableIcon className="w-4 h-4 text-sky-500" />
            <span>Table</span>
          </button>

          {/* 6. CHART TOOL */}
          <button
            id="btn-tool-chart"
            type="button"
            onClick={handleAddChart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            title="Thêm biểu đồ cột"
          >
            <BarChart2 className="w-4 h-4 text-orange-500" />
            <span>Chart</span>
          </button>

          {/* 7. BACKGROUND TOOL */}
          <div className="relative">
            <button
              id="btn-tool-background"
              type="button"
              onClick={() => setShowBgMenu(!showBgMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors text-slate-800 dark:text-slate-200"
            >
              <Palette className="w-4 h-4 text-rose-500" />
              <span>Background</span>
            </button>

            {/* Background Color Menu */}
            {showBgMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Màu nền trang slide:
                </span>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {BACKGROUND_PRESETS.map((preset, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => {
                        updateCurrentSlideProperty('backgroundColor', preset.value);
                        setShowBgMenu(false);
                      }}
                      style={{ background: preset.value }}
                      className="w-full h-9 rounded-xl border border-slate-300 dark:border-slate-600 hover:scale-105 shadow-xs transition-transform"
                      title={preset.label}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300">Chọn mã màu riêng:</span>
                  <input
                    type="color"
                    value={currentSlide.backgroundColor?.startsWith('#') ? currentSlide.backgroundColor : '#ffffff'}
                    onChange={(e) => updateCurrentSlideProperty('backgroundColor', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions for Selected Element */}
          {selectedElement && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={handleDuplicateSelected}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 hover:text-indigo-600"
                title="Nhân bản đối tượng (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleLayerOrder('front')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300"
                title="Đưa lên lớp trên"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleLayerOrder('back')}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-300"
                title="Đưa xuống lớp dưới"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400"
                title="Xóa đối tượng (Delete / Backspace)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3-COLUMN WORKSPACE: THUMBNAILS (LEFT) + CANVAS (CENTER) + PROPS   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: SLIDE THUMBNAIL FILMSTRIP (3 Cols on lg, order-2 on mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 flex flex-col max-h-[720px]">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh Sách Slide ({deck.slides.length})
            </span>
            <button
              id="btn-add-blank-slide"
              type="button"
              onClick={handleAddBlankSlide}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="Tạo slide trắng mới"
            >
              <Plus className="w-4 h-4" />
              <span>Slide Mới</span>
            </button>
          </div>

          {/* Thumbnails Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {deck.slides.map((slide, idx) => {
              const isSelected = idx === activeSlideIndex;
              const slideElements = getSlideCanvasElements(slide);

              return (
                <div
                  key={slide.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setSelectedElementId(null);
                  }}
                  className={`cursor-pointer group relative rounded-xl border p-2 transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 px-0.5">
                    <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : ''}>
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {slideElements.length} đối tượng
                    </span>
                  </div>

                  {/* 16:9 Miniature Slide Preview */}
                  <div
                    style={{ background: slide.backgroundColor || '#ffffff' }}
                    className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700 shadow-2xs pointer-events-none"
                  >
                    {/* Scaled Miniature View */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${180 / CANVAS_WIDTH})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      {slideElements.map((el) => renderElement(el, true))}
                    </div>
                  </div>

                  {/* Slide Title Label */}
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1.5 truncate px-0.5">
                    {slide.title || `Slide ${idx + 1}`}
                  </p>

                  {/* Touch-Friendly Slide Actions: Duplicate, Delete, Move Up, Move Down */}
                  <div className="absolute right-2 top-2 flex lg:hidden lg:group-hover:flex items-center gap-0.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs rounded-lg p-0.5 shadow-md border border-slate-200 dark:border-slate-700 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(idx, 'up');
                      }}
                      disabled={idx === 0}
                      title="Di chuyển lên"
                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSlide(idx, 'down');
                      }}
                      disabled={idx === deck.slides.length - 1}
                      title="Di chuyển xuống"
                      className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlide(idx);
                      }}
                      title="Nhân bản slide"
                      className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      title="Xóa slide"
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddBlankSlide}
            className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Slide Trắng 16:9</span>
          </button>
        </div>

        {/* CENTER COLUMN: 16:9 INTERACTIVE SLIDE CANVAS (6 Cols on lg, order-1 on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-6 space-y-3">
          {/* Mobile Slide Quick Navigator Bar (< lg screens) */}
          <div className="lg:hidden flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveSlideIndex((i) => Math.max(0, i - 1));
                  setSelectedElementId(null);
                }}
                disabled={activeSlideIndex === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Slide trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-1 min-w-[70px] text-center">
                {activeSlideIndex + 1} / {deck.slides.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveSlideIndex((i) => Math.min(deck.slides.length - 1, i + 1));
                  setSelectedElementId(null);
                }}
                disabled={activeSlideIndex === deck.slides.length - 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Slide tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDuplicateSlide(activeSlideIndex)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                title="Nhân bản slide hiện tại"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlide(activeSlideIndex)}
                disabled={deck.slides.length <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                title="Xóa slide hiện tại"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAddBlankSlide}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${theme.primary} shadow-xs cursor-pointer`}
                title="Thêm slide mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Slide</span>
              </button>
            </div>
          </div>
          <div className="bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 flex flex-col items-center justify-center min-h-[460px] overflow-hidden">
            {/* The 16:9 Canvas Frame */}
            <div
              style={{
                width: '100%',
                maxWidth: `${CANVAS_WIDTH * zoomLevel}px`,
                aspectRatio: '16 / 9',
              }}
              className="relative rounded-2xl shadow-xl transition-all"
            >
              {/* Actual Internal Coordinate Canvas */}
              <div
                ref={canvasRef}
                onClick={() => {
                  setSelectedElementId(null);
                  setEditingTextId(null);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
                style={{
                  background: currentSlide.backgroundColor || '#ffffff',
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                {/* Scaled Render Layer */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${CANVAS_WIDTH}px`,
                    height: `${CANVAS_HEIGHT}px`,
                    transform: canvasRef.current
                      ? `scale(${canvasRef.current.clientWidth / CANVAS_WIDTH})`
                      : 'scale(1)',
                    transformOrigin: 'top left',
                  }}
                >
                  {canvasElements.map((el) => renderElement(el, false))}
                </div>

                {/* Empty Canvas Helpful Guidance */}
                {canvasElements.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center text-slate-300 dark:text-slate-600">
                    <Layout className="w-12 h-12 mb-2 stroke-1" />
                    <p className="text-sm font-bold">Trang Slide Trắng</p>
                    <p className="text-xs max-w-sm mt-1">
                      Bấm vào <strong>"Text"</strong>, <strong>"Image"</strong> hoặc <strong>"Shape"</strong> ở thanh trên để bắt đầu tự do sáng tạo nội dung của bạn.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="w-full flex items-center justify-between mt-3 text-[11px] text-slate-400 px-2 font-mono">
              <span>
                Slide {activeSlideIndex + 1} / {deck.slides.length} • 16:9 (960×540px)
              </span>
              <span>
                {selectedElement ? `Đang chọn: ${selectedElement.type.toUpperCase()}` : 'Chưa chọn đối tượng'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROPERTY INSPECTOR PANEL (3 Cols on lg, order-3 on mobile) */}
        <div className="order-3 lg:order-3 lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 max-h-[720px] overflow-y-auto">
          {/* 1. IF A TEXT ELEMENT IS SELECTED */}
          {selectedElement && selectedElement.type === 'text' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Thuộc tính Văn Bản
                </span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold px-1.5 py-0.5 rounded">
                  TEXT
                </span>
              </div>

              {/* Text Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung chữ
                </label>
                <textarea
                  rows={3}
                  value={selectedElement.text || ''}
                  onChange={(e) => updateSelectedElement({ text: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Nhập nội dung slide..."
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phông chữ (Font)
                </label>
                <select
                  value={selectedElement.fontFamily || 'Inter, sans-serif'}
                  onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {FONT_OPTIONS.map((f, i) => (
                    <option key={i} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Cỡ chữ: {selectedElement.fontSize || 20}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={96}
                  value={selectedElement.fontSize || 20}
                  onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Bold, Italic, Underline, Strikethrough */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Định dạng chữ
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedElement({
                        fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                      selectedElement.fontWeight === 'bold'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="In đậm"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedElement({
                        fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                      selectedElement.fontStyle === 'italic'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="In nghiêng"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedElement({
                        textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline',
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                      selectedElement.textDecoration === 'underline'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Gạch chân"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedElement({
                        textDecoration: selectedElement.textDecoration === 'line-through' ? 'none' : 'line-through',
                      })
                    }
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                      selectedElement.textDecoration === 'line-through'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Gạch ngang"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Căn lề
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateSelectedElement({ textAlign: align })}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center ${
                        selectedElement.textAlign === align
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                      title={`Căn ${align}`}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Màu chữ
                  </label>
                  <input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => updateSelectedElement({ color: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateSelectedElement({ color: c })}
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Độ trong suốt (Opacity): {Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round((selectedElement.opacity ?? 1) * 100)}
                  onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) / 100 })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* 2. IF AN IMAGE ELEMENT IS SELECTED */}
          {selectedElement && selectedElement.type === 'image' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Thuộc tính Hình Ảnh
                </span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                  IMAGE
                </span>
              </div>

              {/* Image Preview & Replace */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh đang chọn
                </label>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-2">
                  <img src={selectedElement.src} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => replaceImgInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Thay thế ảnh từ máy tính</span>
                </button>
              </div>

              {/* Object Fit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kiểu hiển thị (Fit)
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  {(['cover', 'contain', 'fill'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updateSelectedElement({ objectFit: fit })}
                      className={`py-1 rounded-lg font-semibold uppercase text-[10px] ${
                        selectedElement.objectFit === fit
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Bo góc: {selectedElement.borderRadius || 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={selectedElement.borderRadius || 0}
                  onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Shadow toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Đổ bóng (Shadow)</span>
                <button
                  type="button"
                  onClick={() => updateSelectedElement({ shadow: !selectedElement.shadow })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    selectedElement.shadow ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      selectedElement.shadow ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Độ trong suốt: {Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round((selectedElement.opacity ?? 1) * 100)}
                  onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) / 100 })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* 3. IF A SHAPE ELEMENT IS SELECTED */}
          {selectedElement && selectedElement.type === 'shape' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Thuộc tính Hình Khối
                </span>
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 font-bold px-1.5 py-0.5 rounded">
                  SHAPE
                </span>
              </div>

              {/* Fill Color */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Màu tô (Fill)
                  </label>
                  <input
                    type="color"
                    value={selectedElement.fillColor || '#6366f1'}
                    onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateSelectedElement({ fillColor: c })}
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>

              {/* Border Color & Width */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Viền (Border): {selectedElement.borderWidth || 0}px
                  </label>
                  <input
                    type="color"
                    value={selectedElement.borderColor || '#4f46e5'}
                    onChange={(e) => updateSelectedElement({ borderColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={selectedElement.borderWidth || 0}
                  onChange={(e) => updateSelectedElement({ borderWidth: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Border Radius for rect */}
              {selectedElement.shapeType === 'rounded-rect' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Bo góc: {selectedElement.borderRadius || 16}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={selectedElement.borderRadius || 16}
                    onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              )}

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Độ trong suốt: {Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round((selectedElement.opacity ?? 1) * 100)}
                  onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) / 100 })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          )}

          {/* 4. IF NO ELEMENT IS SELECTED: CANVAS & SLIDE SETTINGS */}
          {!selectedElement && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Cài Đặt Trang Slide #{activeSlideIndex + 1}
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded">
                  SLIDE
                </span>
              </div>

              {/* Slide Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên / Nhãn slide
                </label>
                <input
                  type="text"
                  value={currentSlide.title || ''}
                  onChange={(e) => updateCurrentSlideProperty('title', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Ví dụ: Giới thiệu dự án..."
                />
              </div>

              {/* Slide Background Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Màu nền trang
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {BACKGROUND_PRESETS.slice(0, 8).map((preset, bIdx) => (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={() => updateCurrentSlideProperty('backgroundColor', preset.value)}
                      style={{ background: preset.value }}
                      className="w-full h-8 rounded-lg border border-slate-300 dark:border-slate-600 hover:scale-105 transition-transform"
                      title={preset.label}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Mã màu tùy chỉnh:</span>
                  <input
                    type="color"
                    value={currentSlide.backgroundColor?.startsWith('#') ? currentSlide.backgroundColor : '#ffffff'}
                    onChange={(e) => updateCurrentSlideProperty('backgroundColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0"
                  />
                </div>
              </div>

              {/* Speaker Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú cho người thuyết trình (Speaker Notes)
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.notes || ''}
                  onChange={(e) => updateCurrentSlideProperty('notes', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Lời dẫn: Chào thầy cô và các bạn, ở slide này nhóm xin phép trình bày về..."
                />
              </div>

              {/* Clear slide elements */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => updateCurrentSlideElements([])}
                  className="w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/60 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hết đối tượng trên slide</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FULL PRESENTATION MODE OVERLAY (F5 / Trình Chiếu Toàn Màn Hình)         */}
      {/* ========================================================================= */}
      {isPresenting && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 sm:p-8 animate-in fade-in select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Đang trình chiếu • Dùng phím [← / → / Khoảng trắng] để chuyển slide • [ESC] để thoát
            </span>
            <button
              type="button"
              onClick={() => setIsPresenting(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Thoát trình chiếu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Scaled 16:9 Canvas */}
          <div className="max-w-6xl w-full mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl my-auto relative border border-slate-800">
            <div
              style={{
                background: deck.slides[presentingSlideIndex]?.backgroundColor || '#ffffff',
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${CANVAS_WIDTH}px`,
                  height: `${CANVAS_HEIGHT}px`,
                  transform: `scale(${1152 / CANVAS_WIDTH})`,
                  transformOrigin: 'top left',
                }}
              >
                {getSlideCanvasElements(deck.slides[presentingSlideIndex] || currentSlide).map((el) =>
                  renderElement(el, true)
                )}
              </div>
            </div>
          </div>

          {/* Bottom Navigator */}
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto pt-2">
            <button
              type="button"
              disabled={presentingSlideIndex === 0}
              onClick={() => setPresentingSlideIndex((p) => Math.max(0, p - 1))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center gap-2 text-sm font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              Slide Trước
            </button>

            <span className="text-sm font-bold font-mono">
              {presentingSlideIndex + 1} / {deck.slides.length}
            </span>

            <button
              type="button"
              disabled={presentingSlideIndex === deck.slides.length - 1}
              onClick={() => setPresentingSlideIndex((p) => Math.min(deck.slides.length - 1, p + 1))}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-20 flex items-center gap-2 text-sm font-semibold"
            >
              Slide Kế Tiếp
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
