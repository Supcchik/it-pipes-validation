'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Camera, 
  Download,
  Upload, 
  Plus, 
  Star, 
  X, 
  Check, 
  Copy, 
  Trash2, 
  Zap, 
  Eye,
  Volume2,
  Maximize,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Minimize,
  Maximize2,
  Link,
  MoreVertical,
  Edit,
  ExternalLink,
  Pin,
  PinOff,
  GripVertical
} from 'lucide-react';
import type { Observation, QuickCode, EditingCell, ContextMenuState, ToastState, PipeSegmentInfo, Inspection, ComparisonLayout, ComparisonState, Screenshot, ScreenshotComparisonState, ScreenshotComparisonLayout } from '@/types/inspection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function InspectionPage() {
  const [selectedObservation, setSelectedObservation] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    isActive: false,
    selectedInspection: null,
    layout: 'vertical',
    syncedPlayback: true,
    currentVideoTime: 15,
    previousVideoTime: 15,
    currentVideoPlaying: false,
    previousVideoPlaying: false
  });
  // sliderPosition moved to Screenshot Comparison section
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showQuickCodeDialog, setShowQuickCodeDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [videoTime, setVideoTime] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showQuickCreateDialog, setShowQuickCreateDialog] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Resizable columns state
  const [leftColumnWidth, setLeftColumnWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [previousColumnWidth, setPreviousColumnWidth] = useState(50); // for pop-out restoration

  // Handle column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / containerWidth) * 100;
    
    // Set minimum width constraints (20% min, 80% max)
    const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
    setLeftColumnWidth(constrainedWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  const [hoveredObservation, setHoveredObservation] = useState<number | null>(null);
  const [newQuickCodeName, setNewQuickCodeName] = useState('');
  const [tabOrder, setTabOrder] = useState([
    'code', 'distance', 'description', 'grade', 'value1', 'value2', 
    'percent', 'continuous', 'joint', 'clock1', 'clock2', 'remarks'
  ]);
  const [showNotes, setShowNotes] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [isNotesPinned, setIsNotesPinned] = useState(false);
  const [notesPosition, setNotesPosition] = useState({ x: 100, y: 100 });
  const [notesSize, setNotesSize] = useState({ width: 400, height: 300 });
  const [isNotesDragging, setIsNotesDragging] = useState(false);
  const [, setIsNotesResizing] = useState(false);
  const [viewMode, setViewMode] = useState<'video' | 'image'>('video');
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);
  const [isVideoPopedOut, setIsVideoPopedOut] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState(false);
  const [acceptRejectAction, setAcceptRejectAction] = useState<'accept' | 'reject' | null>(null);
  const [acceptRejectComment, setAcceptRejectComment] = useState('');
  
  // Screenshot Comparison State
  const [screenshotComparisonState, setScreenshotComparisonState] = useState<ScreenshotComparisonState>({
    isActive: false,
    layout: 'horizontal',
    selectedScreenshots: {
      current: null,
      previous: null
    },
    zoomLevel: 100,
    panPosition: { x: 0, y: 0 },
    synchronizedPan: true
  });
  
  // Additional state for special layouts
  const [sliderPosition, setSliderPosition] = useState(50);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  
  // Mock data for previous inspection comparison
  const [comparisonPreviousInspection] = useState<Inspection>({
    id: 2,
    date: '2023-10-15',
    observations: [
      { 
        id: 101, 
        timestamp: '1:45.000', 
        distance: 11, 
        code: 'MLWE', 
        description: 'Minor leak', 
        grade: 2, 
        status: 'same', 
        continuous: 'No', 
        value1: '-', 
        value2: '-', 
        percent: '5%', 
        joint: false, 
        clock1: '3 o\'clock', 
        clock2: '9 o\'clock', 
        remarks: 'Small leak' 
      },
      { 
        id: 102, 
        timestamp: '3:00.000', 
        distance: 14, 
        code: 'OBR', 
        description: 'Tree roots', 
        grade: 2, 
        status: 'same', 
        continuous: 'Yes', 
        value1: '2', 
        value2: '4', 
        percent: '15%', 
        joint: false, 
        clock1: '12 o\'clock', 
        clock2: '6 o\'clock', 
        remarks: 'Root intrusion' 
      },
    ]
  });

  // Mock data for screenshots
  const mockScreenshots: Screenshot[] = [
    {
      id: 1,
      observationId: 1,
      timestamp: "2024-01-15T10:30:00Z",
      imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=150&fit=crop",
      metadata: { width: 800, height: 600, size: 245760, format: "JPEG" }
    },
    {
      id: 2,
      observationId: 2,
      timestamp: "2024-01-15T10:35:00Z",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=150&fit=crop",
      metadata: { width: 800, height: 600, size: 198432, format: "JPEG" }
    },
    {
      id: 3,
      observationId: 3,
      timestamp: "2024-01-15T10:40:00Z",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop",
      metadata: { width: 800, height: 600, size: 312456, format: "JPEG" }
    },
    {
      id: 4,
      observationId: 4,
      timestamp: "2024-01-15T10:45:00Z",
      imageUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=200&h=150&fit=crop",
      metadata: { width: 800, height: 600, size: 267890, format: "JPEG" }
    },
    {
      id: 5,
      observationId: 5,
      timestamp: "2024-01-15T10:50:00Z",
      imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      thumbnailUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=150&fit=crop",
      metadata: { width: 800, height: 600, size: 223456, format: "JPEG" }
    }
  ];
  
  const [pipeInfo, setPipeInfo] = useState<PipeSegmentInfo>({
    reference: 'GM-MH-E23_MH-E22',
    material: 'Clay Tile',
    diameter: '12',
    upstreamManhole: 'MH-E231',
    downstreamManhole: 'MH-22'
  });

  // Mock data for previous inspection
  const previousInspection: Inspection = {
    id: 2,
    date: '2023-11-15',
    observations: [
      {
        id: 101,
        timestamp: '1:30.000',
        distance: 10.5,
        code: 'MLWE',
        description: 'Minor lateral water entry',
        grade: 4,
        status: 'same',
        continuous: 'No',
        value1: '-',
        value2: '-',
        percent: '-',
        joint: false,
        clock1: '-',
        clock2: '-',
        remarks: 'Previous observation'
      },
      {
        id: 102,
        timestamp: '2:45.000',
        distance: 16.8,
        code: 'OBR',
        description: 'Obstruction by roots',
        grade: 2,
        status: 'modified',
        continuous: 'Yes',
        value1: '3.2',
        value2: '2.1',
        percent: '65',
        joint: true,
        clock1: '12:00',
        clock2: '2:30',
        remarks: 'Root intrusion increased'
      }
    ]
  };
  
  
  const [observations, setObservations] = useState<Observation[]>([
    { 
      id: 1, 
      timestamp: '1:45.000', 
      distance: 11, 
      code: 'MLWE', 
      description: 'Access Manhole', 
      grade: 5, 
      status: 'same',
      continuous: 'No',
      value1: '-',
      value2: '-',
      percent: '-',
      joint: false,
      clock1: '-',
      clock2: '-',
      remarks: ''
    },
    { 
      id: 2, 
      timestamp: '3:00.000', 
      distance: 14.2, 
      code: 'OBR', 
      description: 'Obstacle - Roots', 
      grade: 3, 
      status: 'new',
      continuous: 'Yes',
      value1: '2.5',
      value2: '1.8',
      percent: '75',
      joint: true,
      clock1: '12:00',
      clock2: '3:00',
      remarks: 'Root intrusion detected'
    },
    { 
      id: 3, 
      timestamp: '3:00.000', 
      distance: 14.2, 
      code: 'OBZ', 
      description: 'Obstacle - Settled Deposits', 
      grade: 3, 
      status: 'same',
      continuous: 'No',
      value1: '-',
      value2: '-',
      percent: '-',
      joint: false,
      clock1: '-',
      clock2: '-',
      remarks: ''
    },
  ]);

  const [currentInspection, setCurrentInspection] = useState<Inspection>({
    id: 0,
    date: '2024-11-15',
    observations: observations
  });

  const [previousInspections] = useState<Inspection[]>([
    {
      id: 1,
      date: '2024-01-15',
      observations: [
        { 
          id: 101, 
          timestamp: '1:45.000', 
          distance: 11, 
          code: 'MLWE', 
          description: 'Access Manhole', 
          grade: 4, 
          status: 'same',
          continuous: 'No',
          value1: '-',
          value2: '-',
          percent: '-',
          joint: false,
          clock1: '-',
          clock2: '-',
          remarks: ''
        },
        { 
          id: 102, 
          timestamp: '2:30.000', 
          distance: 12.5, 
          code: 'CRK', 
          description: 'Small crack', 
          grade: 2, 
          status: 'same',
          continuous: 'Yes',
          value1: '1.2',
          value2: '0.8',
          percent: '40',
          joint: false,
          clock1: '6:00',
          clock2: '9:00',
          remarks: 'Minor crack'
        },
      ]
    },
    {
      id: 2,
      date: '2023-11-20',
      observations: [
        { 
          id: 201, 
          timestamp: '1:45.000', 
          distance: 11, 
          code: 'MLWE', 
          description: 'Access Manhole', 
          grade: 3, 
          status: 'same',
          continuous: 'No',
          value1: '-',
          value2: '-',
          percent: '-',
          joint: false,
          clock1: '-',
          clock2: '-',
          remarks: ''
        },
        { 
          id: 202, 
          timestamp: '3:00.000', 
          distance: 14.2, 
          code: 'OBR', 
          description: 'Obstacle - Roots', 
          grade: 2, 
          status: 'same',
          continuous: 'Yes',
          value1: '1.5',
          value2: '1.0',
          percent: '50',
          joint: true,
          clock1: '12:00',
          clock2: '3:00',
          remarks: 'Root growth'
        },
      ]
    }
  ]);
  
  const [quickCodes, setQuickCodes] = useState<QuickCode[]>([
    { id: 1, name: 'Broken Pipe', code: 'BRK', icon: '🔨', description: 'Broken pipe section', grade: 5, usageCount: 12 },
    { id: 2, name: 'Roots', code: 'OBR', icon: '🌿', description: 'Tree roots intrusion', grade: 3, usageCount: 8 },
    { id: 3, name: 'Crack', code: 'CRK', icon: '⚡', description: 'Structural crack', grade: 4, usageCount: 5 },
  ]);

  // Update currentInspection when observations change
  useEffect(() => {
    setCurrentInspection(prev => ({
      ...prev,
      observations: observations
    }));
  }, [observations]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !editingCell) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        showToast(isPlaying ? 'Paused' : 'Playing', 'info');
      }
      
      if (e.key === 'Delete' && selectedObservation && !editingCell) {
        setShowDeleteConfirm(selectedObservation);
      }
      
      if (e.key === 'Escape') {
        if (editingCell) {
          setEditingCell(null);
        } else if (selectedObservation) {
          setSelectedObservation(null);
        } else if (contextMenu) {
          setContextMenu(null);
        }
      }
      
      // Arrow keys - Navigate video time
      if (e.code === 'ArrowLeft' && !editingCell) {
        e.preventDefault();
        setVideoTime(Math.max(0, videoTime - 5));
        showToast(`Rewind 5s - ${Math.floor(videoTime / 60)}:${String(videoTime % 60).padStart(2, '0')}`, 'info');
      }
      if (e.code === 'ArrowRight' && !editingCell) {
        e.preventDefault();
        setVideoTime(Math.min(151, videoTime + 5));
        showToast(`Forward 5s - ${Math.floor(videoTime / 60)}:${String(videoTime % 60).padStart(2, '0')}`, 'info');
      }
      
      // Number keys - Jump to observations
      if (e.code.startsWith('Digit') && !editingCell) {
        const digit = parseInt(e.code.replace('Digit', ''));
        if (digit >= 1 && digit <= observations.length) {
          const obs = observations[digit - 1];
          setSelectedObservation(obs.id);
          // Sync video to observation timestamp
          const timestamp = obs.timestamp.split(':');
          const minutes = parseInt(timestamp[0]);
          const seconds = parseFloat(timestamp[1]);
          setVideoTime(minutes * 60 + seconds);
          showToast(`Jumped to observation ${digit}`, 'info');
        }
      }
      
      // F key - Toggle fullscreen
      if (e.key === 'f' && !editingCell) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
        showToast(isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen', 'info');
      }
      
      // Screenshot Comparison shortcuts
      if (screenshotComparisonState.isActive) {
        switch (e.key) {
          case '1':
            setScreenshotComparisonState(prev => ({ ...prev, layout: 'horizontal' }));
            showToast('Layout: Horizontal', 'info');
            break;
          case '2':
            setScreenshotComparisonState(prev => ({ ...prev, layout: 'vertical' }));
            showToast('Layout: Vertical', 'info');
            break;
          case '3':
            setScreenshotComparisonState(prev => ({ ...prev, layout: 'slider' }));
            showToast('Layout: Slider', 'info');
            break;
          case '4':
            setScreenshotComparisonState(prev => ({ ...prev, layout: 'overlay' }));
            showToast('Layout: Overlay', 'info');
            break;
          case '=':
          case '+':
            setScreenshotComparisonState(prev => ({ 
              ...prev, 
              zoomLevel: Math.min(400, prev.zoomLevel + 25) 
            }));
            showToast(`Zoom: ${screenshotComparisonState.zoomLevel + 25}%`, 'info');
            break;
          case '-':
            setScreenshotComparisonState(prev => ({ 
              ...prev, 
              zoomLevel: Math.max(25, prev.zoomLevel - 25) 
            }));
            showToast(`Zoom: ${screenshotComparisonState.zoomLevel - 25}%`, 'info');
            break;
          case '0':
            setScreenshotComparisonState(prev => ({ 
              ...prev, 
              zoomLevel: 100,
              panPosition: { x: 0, y: 0 }
            }));
            showToast('Reset zoom and pan', 'info');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedObservation, editingCell, isPlaying, contextMenu, videoTime, observations, isFullscreen, screenshotComparisonState]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleObservationClick = (obs: Observation) => {
    setSelectedObservation(obs.id === selectedObservation ? null : obs.id);
    
    const timeParts = obs.timestamp.split(':');
    const minutes = parseInt(timeParts[0]);
    const secondsParts = timeParts[1].split('.');
    const seconds = parseInt(secondsParts[0]);
    const totalSeconds = minutes * 60 + seconds;
    setVideoTime(totalSeconds);
    showToast('Video synced to observation', 'info');
  };

  const handleContextMenu = (e: React.MouseEvent, obs: Observation) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, observation: obs });
  };

  const handleCellEdit = (obsId: number, field: string, value: string | number | boolean) => {
    setObservations(observations.map(obs => 
      obs.id === obsId ? { ...obs, [field]: value } : obs
    ));
    showToast('Updated', 'success');
  };

  const handleCellChange = (obsId: number, field: string, value: string | number | boolean) => {
    setObservations(observations.map(obs => 
      obs.id === obsId ? { ...obs, [field]: value } : obs
    ));
  };

  const handleCellBlur = (obsId: number, field: string, value: string | number | boolean) => {
    handleCellEdit(obsId, field, value);
    setEditingCell(null);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, obsId: number, field: string, value: string | number | boolean) => {
    if (e.key === 'Enter') {
      handleCellEdit(obsId, field, value);
      // Перехід до наступного поля
      const currentIndex = tabOrder.indexOf(field);
      if (currentIndex < tabOrder.length - 1) {
        const nextField = tabOrder[currentIndex + 1];
        setEditingCell({ id: obsId, field: nextField });
      } else {
        setEditingCell(null);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellEdit(obsId, field, value);
      const currentIndex = tabOrder.indexOf(field);
      const nextField = tabOrder[currentIndex + 1];
      if (nextField) {
        setEditingCell({ id: obsId, field: nextField });
      } else {
        setEditingCell(null);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // New action functions
  const saveScreenshot = () => {
    // Simulate screenshot save
    showToast('Screenshot saved successfully', 'success');
  };

  const downloadVideo = () => {
    // Simulate video download
    showToast('Video download started', 'info');
  };

  const exportReport = () => {
    showToast('Report export started - this would generate a PDF', 'info');
  };

  const uploadVideo = () => {
    showToast('Video upload started - this would upload to cloud storage', 'info');
  };

  const saveNotes = () => {
    showToast('Notes saved', 'success');
    setShowNotes(false);
  };

  // Floating Notes Functions
  const toggleNotesPin = () => {
    setIsNotesPinned(!isNotesPinned);
    if (!isNotesPinned) {
      setShowNotes(true);
    }
  };

  const handleNotesMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    setIsNotesDragging(true);
    const startX = e.clientX - notesPosition.x;
    const startY = e.clientY - notesPosition.y;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - notesSize.width, e.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - notesSize.height, e.clientY - startY));
      setNotesPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setIsNotesDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleNotesResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsNotesResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = notesSize.width;
    const startHeight = notesSize.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction.includes('right')) newWidth = Math.max(300, Math.min(800, startWidth + deltaX));
      if (direction.includes('bottom')) newHeight = Math.max(200, Math.min(600, startHeight + deltaY));
      
      setNotesSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsNotesResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const openVideoPopout = () => {
    const newWindow = window.open('', 'videoPopout', 'width=800,height=600');
    if (newWindow) {
      // Save current column width and minimize video column
      setPreviousColumnWidth(leftColumnWidth);
      setLeftColumnWidth(20); // Minimize to 20% (minimum allowed)
      
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ITpipes - Video Player</title>
            <style>
              body { margin: 0; padding: 20px; background: #000; color: white; font-family: system-ui; }
              .video-container { width: 100%; max-width: 800px; margin: 0 auto; }
              .controls { display: flex; gap: 10px; margin-top: 10px; justify-content: center; }
              button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
              .play-btn { background: #f97316; color: white; }
              .info { text-align: center; margin-top: 10px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="video-container">
              <div style="width: 100%; aspect-ratio: 16/9; background: #333; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <div style="text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">🎥</div>
                  <div>Video Player</div>
                  <div style="font-size: 14px; margin-top: 5px;">Time: ${Math.floor(videoTime / 60)}:${String(videoTime % 60).padStart(2, '0')}</div>
                </div>
              </div>
              <div class="controls">
                <button class="play-btn" onclick="parent.togglePlay()">${isPlaying ? '⏸️ Pause' : '▶️ Play'}</button>
                <button onclick="parent.seekVideo(-5)">⏮️ -5s</button>
                <button onclick="parent.seekVideo(5)">⏭️ +5s</button>
              </div>
              <div class="info">
                ${selectedObservation ? `Current: Observation #${selectedObservation}` : 'No observation selected'}
              </div>
            </div>
          </body>
        </html>
      `);
      setPopoutWindow(newWindow);
      setIsVideoPopedOut(true);
      showToast('Video opened in pop-out window', 'info');
    }
  };

  const closeVideoPopout = () => {
    if (popoutWindow) {
      popoutWindow.close();
      setPopoutWindow(null);
      setIsVideoPopedOut(false);
      // Restore previous column width
      setLeftColumnWidth(previousColumnWidth);
      showToast('Video returned to main window', 'info');
    }
  };

  const openComparisonModal = () => {
    if (selectedObservation) {
      setShowComparisonModal(true);
    } else {
      showToast('Please select an observation first', 'warning');
    }
  };

  // Screenshot Comparison Functions
  const toggleScreenshotComparisonMode = () => {
    setScreenshotComparisonState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      selectedScreenshots: {
        current: !prev.isActive ? getCurrentScreenshot() : null,
        previous: !prev.isActive ? getPreviousScreenshot() : null
      }
    }));
    showToast(
      screenshotComparisonState.isActive 
        ? 'Screenshot comparison disabled' 
        : 'Screenshot comparison enabled', 
      'info'
    );
  };

  const getCurrentScreenshot = (): Screenshot | null => {
    if (!selectedObservation) return null;
    return mockScreenshots.find(s => s.observationId === selectedObservation) || null;
  };

  const getPreviousScreenshot = (): Screenshot | null => {
    if (!selectedObservation) return null;
    // For prototype, return a different screenshot from mock data
    const currentScreenshot = getCurrentScreenshot();
    if (!currentScreenshot) return null;
    return mockScreenshots.find(s => s.id !== currentScreenshot.id) || null;
  };

  const selectScreenshotForComparison = (screenshot: Screenshot, type: 'current' | 'previous') => {
    setScreenshotComparisonState(prev => ({
      ...prev,
      selectedScreenshots: {
        ...prev.selectedScreenshots,
        [type]: screenshot
      }
    }));
    showToast(`Selected ${type} screenshot`, 'info');
  };

  // Comparison Video Player Component
  const ComparisonVideoPlayer = () => (
    <div className={`${comparisonState.layout === 'vertical' ? 'grid grid-rows-2' : 'grid grid-cols-2'} gap-4`}>
      {/* Current Video */}
      <div className="relative">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Current</span>
          <span>Inspection ({currentInspection.date})</span>
        </div>
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img 
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
            alt="Current inspection"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
            ▶️ {Math.floor(comparisonState.currentVideoTime / 60)}:{String(comparisonState.currentVideoTime % 60).padStart(2, '0')} / 2:31
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleCurrentVideoPlay}
              className="w-8 h-8 text-white/80 hover:text-white"
              title={comparisonState.currentVideoPlaying ? "Pause current video" : "Play current video"}
            >
              {comparisonState.currentVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Previous Video */}
      <div className="relative">
        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Previous</span>
          <span>Inspection ({comparisonPreviousInspection.date})</span>
        </div>
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img 
            src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
            alt="Previous inspection"
            className="w-full h-full object-cover"
            style={{
              filter: 'sepia(100%) hue-rotate(200deg) saturate(1.5) contrast(1.2)',
              opacity: 0.9
            }}
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
            ▶️ {Math.floor(comparisonState.previousVideoTime / 60)}:{String(comparisonState.previousVideoTime % 60).padStart(2, '0')} / 2:45
          </div>
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => setComparisonState(prev => ({
                ...prev,
                previousVideoPlaying: !prev.previousVideoPlaying
              }))}
              className="w-8 h-8 text-white/80 hover:text-white"
              title={comparisonState.previousVideoPlaying ? "Pause previous video" : "Play previous video"}
            >
              {comparisonState.previousVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Screenshot Comparison Modal Component
  const ScreenshotComparisonModal = () => {
    if (!showComparisonModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowComparisonModal(false)}>
        <div className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Screenshot Comparison</h3>
            <button 
              onClick={() => setShowComparisonModal(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="relative" style={{ aspectRatio: '16/9' }}>
              {/* Previous Screenshot */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center text-blue-800">
                    <div className="text-4xl mb-2">📸</div>
                    <div className="font-semibold">Previous (2023)</div>
                    <div className="text-sm">Grade: 2</div>
                  </div>
                </div>
              </div>
              
              {/* Current Screenshot */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-center text-orange-800">
                    <div className="text-4xl mb-2">📸</div>
                    <div className="font-semibold">Current (2024)</div>
                    <div className="text-sm">Grade: 3 🔺+1</div>
                  </div>
                </div>
              </div>
              
              {/* Slider */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Distance: {observations.find(o => o.id === selectedObservation)?.distance}ft
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Previous</span>
                <span className="text-sm font-medium">{sliderPosition}%</span>
                <span className="text-sm text-gray-600">Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Comparison Tables Component
  const ComparisonTables = () => {
    const [showPreviousTable, setShowPreviousTable] = useState(false);
    
    return (
      <div className="space-y-6">
        {/* Current Observations Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Current</span>
              <span>Inspection ({currentInspection.date})</span>
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={addNewObservation}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Observation
              </button>
            </div>
          </div>
          {/* Current table - full version */}
          {observations.length === 0 ? (
            <div className="text-center py-8 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-2">🔍</div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">No observations yet</h4>
              <p className="text-xs text-gray-600">Start by using a Quick Action</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">TIMESTAMP</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">DISTANCE (FT)</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CODE</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CONTINUOUS</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">VALUE 1</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">VALUE 2</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">PERCENT</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">JOINT</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CLOCK 1</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CLOCK 2</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">GRADE</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {observations.map((obs) => (
                      <tr 
                        key={obs.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedObservation === obs.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedObservation(obs.id)}
                      >
                        {/* TIMESTAMP - Read only */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">
                          {obs.timestamp}
                        </td>
                        
                        {/* DISTANCE - Read only */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-600">
                          {obs.distance}ft
                        </td>
                        
                        {/* CODE - Read only */}
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                            {obs.code}
                          </span>
                        </td>
                        
                        {/* CONTINUOUS - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.continuous}
                        </td>
                        
                        {/* VALUE 1 - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.value1}
                        </td>
                        
                        {/* VALUE 2 - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.value2}
                        </td>
                        
                        {/* PERCENT - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.percent}
                        </td>
                        
                        {/* JOINT - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.joint ? 'Yes' : 'No'}
                        </td>
                        
                        {/* CLOCK 1 - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.clock1}
                        </td>
                        
                        {/* CLOCK 2 - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {obs.clock2}
                        </td>
                        
                        {/* GRADE - Read only */}
                        <td className="px-3 py-3 text-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: obs.grade >= 4 ? '#ef4444' : obs.grade >= 3 ? '#f59e0b' : '#10b981' }}
                          >
                            {obs.grade}
                          </div>
                        </td>
                        
                        {/* REMARKS - Read only */}
                        <td className="px-3 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                          {obs.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Previous Observations Table - Collapsible */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setShowPreviousTable(!showPreviousTable)}
            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <span className="font-medium flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Previous</span>
                <span>Inspection ({comparisonPreviousInspection.date})</span>
              </span>
              <span className="text-sm text-gray-500">
                ({comparisonPreviousInspection.observations.length} observations)
              </span>
            </div>
            {showPreviousTable ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {showPreviousTable && (
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">TIMESTAMP</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">DISTANCE (FT)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">CODE</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">CONTINUOUS</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">VALUE 1</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">VALUE 2</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">PERCENT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">JOINT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">CLOCK 1</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">CLOCK 2</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">GRADE</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {comparisonPreviousInspection.observations.map((obs) => (
                      <tr 
                        key={obs.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // Sync previous video to this observation
                          const timeParts = obs.timestamp.split(':');
                          const minutes = parseInt(timeParts[0]);
                          const seconds = parseFloat(timeParts[1]);
                          setComparisonState(prev => ({
                            ...prev,
                            previousVideoTime: minutes * 60 + seconds
                          }));
                          showToast('Previous video synced to observation', 'info');
                        }}
                      >
                        <td className="px-3 py-2 font-mono text-xs text-gray-600">{obs.timestamp}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.distance}ft</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {obs.code}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.continuous}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.value1}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.value2}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.percent}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.joint ? 'Yes' : 'No'}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.clock1}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{obs.clock2}</td>
                        <td className="px-3 py-2 text-center">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: obs.grade >= 4 ? '#ef4444' : obs.grade >= 3 ? '#f59e0b' : '#10b981' }}
                          >
                            {obs.grade}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-[200px] truncate">{obs.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Expose functions to pop-out window
  useEffect(() => {
    (window as unknown as { togglePlay: () => void; seekVideo: (seconds: number) => void }).togglePlay = () => {
      setIsPlaying(!isPlaying);
    };
    (window as unknown as { togglePlay: () => void; seekVideo: (seconds: number) => void }).seekVideo = (seconds: number) => {
      setVideoTime(Math.max(0, Math.min(151, videoTime + seconds))); // 0-151 seconds (2:31)
    };
    
    return () => {
      delete (window as unknown as { togglePlay?: () => void; seekVideo?: (seconds: number) => void }).togglePlay;
      delete (window as unknown as { togglePlay?: () => void; seekVideo?: (seconds: number) => void }).seekVideo;
    };
  }, [isPlaying, videoTime]);

  const deleteInspection = () => {
    setShowDeleteConfirm('inspection');
  };

  const copyInspectionLink = () => {
    const link = `${window.location.origin}/inspection/${currentInspection.id}`;
    navigator.clipboard.writeText(link);
    showToast('Inspection link copied to clipboard', 'success');
  };

  const submitForReview = () => {
    showToast('Inspection submitted for review', 'success');
  };

  const addObservationFromQuickCode = (quickCode: QuickCode) => {
    const newObs: Observation = {
      id: Date.now(),
      timestamp: '0:00.000',
      distance: 0,
      code: quickCode.code,
      description: quickCode.description || quickCode.name,
      grade: quickCode.grade || 3,
      status: 'new',
      continuous: 'No',
      value1: '-',
      value2: '-',
      percent: '-',
      joint: false,
      clock1: '-',
      clock2: '-',
      remarks: ''
    };
    setObservations([...observations, newObs]);
    setSelectedObservation(newObs.id);
    
    // Збільшуємо лічильник використання
    setQuickCodes(prev => prev.map(btn => 
      btn.id === quickCode.id 
        ? { ...btn, usageCount: (btn.usageCount || 0) + 1 }
        : btn
    ));
    
    showToast('Added from template', 'success');
  };

  const addNewObservation = () => {
    const newObs: Observation = {
      id: Date.now(),
      timestamp: '0:00.000',
      distance: 0,
      code: '',
      description: '',
      grade: 3,
      status: 'new',
      continuous: 'No',
      value1: '-',
      value2: '-',
      percent: '-',
      joint: false,
      clock1: '-',
      clock2: '-',
      remarks: ''
    };
    setObservations([...observations, newObs]);
    setSelectedObservation(newObs.id);
    setEditingCell({ id: newObs.id, field: 'code' });
  };

  const duplicateObservation = (obs: Observation) => {
    const newObs: Observation = { 
      ...obs, 
      id: Date.now(), 
      status: 'new',
      continuous: obs.continuous || 'No',
      value1: obs.value1 || '-',
      value2: obs.value2 || '-',
      percent: obs.percent || '-',
      joint: obs.joint || false,
      clock1: obs.clock1 || '-',
      clock2: obs.clock2 || '-',
      remarks: obs.remarks || ''
    };
    setObservations([...observations, newObs]);
    showToast('Observation duplicated', 'success');
    setContextMenu(null);
  };

  const deleteObservation = (obsId: number) => {
    setObservations(observations.filter(obs => obs.id !== obsId));
    showToast('Observation deleted', 'info');
    setShowDeleteConfirm(null);
  };

  const saveAsQuickCode = (obs: Observation) => {
    setNewQuickCodeName(obs.description);
    setShowQuickCreateDialog(true);
    setContextMenu(null);
  };

  const createQuickCodeFromObservation = (obs: Observation, customName?: string) => {
    const name = customName || obs.description || `Template ${obs.code}`;
    const newQuickCode: QuickCode = {
      id: Date.now(),
      name: name,
      code: obs.code,
      icon: '⭐',
      description: obs.description,
      grade: obs.grade,
      usageCount: 0
    };
    setQuickCodes([...quickCodes, newQuickCode]);
    showToast('Hot button created and ready to use!', 'success');
    setShowQuickCreateDialog(false);
    setNewQuickCodeName('');
  };

  const createQuickCodeFromScratch = () => {
    const newQuickCode: QuickCode = {
      id: Date.now(),
      name: 'New Template',
      code: 'NEW',
      icon: '⭐',
      description: 'Custom template',
      grade: 3,
      usageCount: 0
    };
    setQuickCodes([...quickCodes, newQuickCode]);
    showToast('New hot button created', 'success');
  };

  const removeQuickCode = (buttonId: number) => {
    setQuickCodes(quickCodes.filter(b => b.id !== buttonId));
    showToast('Hot button removed', 'info');
  };

  const toggleComparisonMode = () => {
    setComparisonState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      selectedInspection: !prev.isActive ? comparisonPreviousInspection : null
    }));
    showToast(comparisonState.isActive ? 'Comparison mode disabled' : 'Comparison mode enabled', 'info');
  };

  // Functions for dual video control
  const handleCurrentVideoPlay = () => {
    setComparisonState(prev => ({
      ...prev,
      currentVideoPlaying: !prev.currentVideoPlaying
    }));
  };

  const handlePreviousVideoPlay = () => {
    setComparisonState(prev => ({
      ...prev,
      previousVideoPlaying: !prev.previousVideoPlaying
    }));
  };

  const seekCurrentVideo = (time: number) => {
    setComparisonState(prev => ({
      ...prev,
      currentVideoTime: time
    }));
  };

  const seekPreviousVideo = (time: number) => {
    setComparisonState(prev => ({
      ...prev,
      previousVideoTime: time
    }));
  };

  const selectInspectionForComparison = (inspection: Inspection) => {
    setComparisonState(prev => ({
      ...prev,
      selectedInspection: inspection
    }));
    showToast(`Comparing with ${inspection.date}`, 'info');
  };

  const selectCurrentInspection = (inspection: Inspection) => {
    setCurrentInspection(inspection);
    setObservations(inspection.observations);
    showToast(`Switched to ${inspection.date}`, 'info');
  };

  const changeComparisonLayout = (layout: 'vertical' | 'horizontal') => {
    setComparisonState(prev => ({
      ...prev,
      layout
    }));
    showToast(`Switched to ${layout} layout`, 'info');
  };

  const toggleSyncedPlayback = () => {
    setComparisonState(prev => ({
      ...prev,
      syncedPlayback: !prev.syncedPlayback
    }));
    showToast(comparisonState.syncedPlayback ? 'Independent playback' : 'Synced playback', 'info');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(parseInt(e.target.value));
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!e.currentTarget) return;
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handlePipeInfoChange = (field: keyof PipeSegmentInfo, value: string) => {
    setPipeInfo(prev => ({ ...prev, [field]: value }));
  };

  const savePipeInfo = () => {
    // Тут можна додати логіку збереження
    showToast('Pipe information saved', 'success');
    setShowEditSidebar(false);
  };

  // Gallery functions
  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
  };

  const nextImage = () => {
    setSelectedImageIndex(prev => (prev + 1) % observations.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(prev => (prev - 1 + observations.length) % observations.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with Pipe Information - Sticky */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-lg">
        {/* Row 1: Back Button + LOGO + Action Buttons */}
        <div className="flex items-center justify-between mb-2">
          {/* Left Side: Back Button + LOGO */}
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to inspections list"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* LOGO */}
            <div className="text-lg font-bold text-gray-900">
              ITpipes
            </div>
          </div>
          
          {/* Right Side: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Kebab Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="More actions"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={copyInspectionLink} className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Copy inspection link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportReport} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={deleteInspection} 
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete inspection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Submit for Evaluation - Secondary Action */}
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Submit for Evaluation
            </button>
            
            {/* Review Inspection - Primary Action */}
            <button 
              onClick={() => setShowAcceptRejectModal(true)}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Review Inspection
            </button>
          </div>
        </div>
        
        {/* Row 2: Inspection Details + Edit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            {/* Pipe Information */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Pipe Segment:</span>
              <span className="text-base font-semibold text-gray-900">{pipeInfo.reference}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Material:</span>
              <span className="text-sm text-gray-900">{pipeInfo.material}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Diameter:</span>
              <span className="text-sm text-gray-900">{pipeInfo.diameter} inches</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Upstream:</span>
              <span className="text-sm text-gray-900">{pipeInfo.upstreamManhole}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Downstream:</span>
              <span className="text-sm text-gray-900">{pipeInfo.downstreamManhole}</span>
            </div>
          </div>
          
          {/* Edit Button - Icon only */}
          <button 
            onClick={() => setShowEditSidebar(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            title="Edit inspection"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-y-auto">
        <div 
          className="border-r border-gray-200 bg-white p-6 flex flex-col min-h-0 flex-shrink-0"
          style={{ width: `${leftColumnWidth}%` }}
        >
          {/* Screenshot Comparison Layout */}
          {screenshotComparisonState.isActive ? (
            <div className="flex flex-col h-full">
              {/* Screenshot Comparison Controls */}
              <div className="p-4 border-b border-gray-200">
                {/* Row 1: Screenshot Selection + Exit + Sync */}
                <div className="flex items-center justify-between mb-3">
                  {/* Left: Screenshot Selection + Exit */}
                  <div className="flex items-center gap-3">
                    <Select 
                      value={screenshotComparisonState.selectedScreenshots.current?.id.toString() || ""} 
                      onValueChange={(value) => {
                        const screenshot = mockScreenshots.find(s => s.id.toString() === value);
                        if (screenshot) {
                          selectScreenshotForComparison(screenshot, 'current');
                        }
                      }}
                    >
                      <SelectTrigger className="w-48 h-8 bg-white/80 rounded-full shadow-sm border-0">
                        <SelectValue placeholder="Select current screenshot" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockScreenshots.map((screenshot) => (
                          <SelectItem key={screenshot.id} value={screenshot.id.toString()}>
                            📸 Screenshot #{screenshot.id} - {screenshot.timestamp.split('T')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <button
                      onClick={toggleScreenshotComparisonMode}
                      className="h-8 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-2 px-3 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span className="text-xs font-medium">Exit Compare</span>
                    </button>
                    
                    <Select 
                      value={screenshotComparisonState.selectedScreenshots.previous?.id.toString() || ""} 
                      onValueChange={(value) => {
                        const screenshot = mockScreenshots.find(s => s.id.toString() === value);
                        if (screenshot) {
                          selectScreenshotForComparison(screenshot, 'previous');
                        }
                      }}
                    >
                      <SelectTrigger className="w-48 h-8 bg-white/80 rounded-full shadow-sm border-0">
                        <SelectValue placeholder="Select previous screenshot" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockScreenshots.map((screenshot) => (
                          <SelectItem key={screenshot.id} value={screenshot.id.toString()}>
                            📸 Screenshot #{screenshot.id} - {screenshot.timestamp.split('T')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Right: Reset View Control */}
                  <button
                    onClick={() => setScreenshotComparisonState(prev => ({ 
                      ...prev, 
                      zoomLevel: 100,
                      panPosition: { x: 0, y: 0 }
                    }))}
                    className="h-8 rounded-full bg-white/80 text-gray-700 hover:bg-gray-100 flex items-center gap-2 px-3 transition-colors"
                  >
                    <span className="text-xs">🔄</span>
                    <span className="text-xs font-medium">Reset View</span>
                  </button>
                </div>
                
                {/* Row 2: Layout + Zoom */}
                <div className="flex items-center justify-between">
                  {/* Left: Layout Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Layout:</span>
                    <button
                      onClick={() => setScreenshotComparisonState(prev => ({ ...prev, layout: 'horizontal' }))}
                      className={`h-8 rounded-full flex items-center gap-2 px-3 transition-colors ${
                        screenshotComparisonState.layout === 'horizontal' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">↔️</span>
                      <span className="text-xs font-medium">Horizontal</span>
                    </button>
                    
                    <button
                      onClick={() => setScreenshotComparisonState(prev => ({ ...prev, layout: 'vertical' }))}
                      className={`h-8 rounded-full flex items-center gap-2 px-3 transition-colors ${
                        screenshotComparisonState.layout === 'vertical' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">↕️</span>
                      <span className="text-xs font-medium">Vertical</span>
                    </button>
                    
                    <button
                      onClick={() => setScreenshotComparisonState(prev => ({ ...prev, layout: 'slider' }))}
                      className={`h-8 rounded-full flex items-center gap-2 px-3 transition-colors ${
                        screenshotComparisonState.layout === 'slider' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">🎚️</span>
                      <span className="text-xs font-medium">Slider</span>
                    </button>
                    
                    <button
                      onClick={() => setScreenshotComparisonState(prev => ({ ...prev, layout: 'overlay' }))}
                      className={`h-8 rounded-full flex items-center gap-2 px-3 transition-colors ${
                        screenshotComparisonState.layout === 'overlay' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">🔄</span>
                      <span className="text-xs font-medium">Overlay</span>
                    </button>
                  </div>
                  
                  {/* Right: Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Zoom:</span>
                    <div className="flex items-center gap-1 bg-white/80 rounded-full px-2 py-1 shadow-sm">
                      <button
                        onClick={() => setScreenshotComparisonState(prev => ({ 
                          ...prev, 
                          zoomLevel: Math.max(25, prev.zoomLevel - 25) 
                        }))}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">-</span>
                      </button>
                      <span className="text-xs font-mono w-8 text-center">
                        {screenshotComparisonState.zoomLevel}%
                      </span>
                      <button
                        onClick={() => setScreenshotComparisonState(prev => ({ 
                          ...prev, 
                          zoomLevel: Math.min(400, prev.zoomLevel + 25) 
                        }))}
                        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              

              {/* Screenshot Comparison Viewer */}
              <div className="flex-1 p-4">
                {screenshotComparisonState.layout === 'slider' ? (
                  /* Slider Layout */
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-full" style={{ aspectRatio: '16/9' }}>
                    {/* Previous Screenshot (Background) */}
                    <div className="absolute inset-0">
                      {screenshotComparisonState.selectedScreenshots.previous ? (
                        <img
                          src={screenshotComparisonState.selectedScreenshots.previous.imageUrl}
                          alt="Previous"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <div className="text-4xl mb-2">📸</div>
                            <div>Previous Screenshot</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Current Screenshot (Clipped) */}
                    <div 
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      {screenshotComparisonState.selectedScreenshots.current ? (
                        <img
                          src={screenshotComparisonState.selectedScreenshots.current.imageUrl}
                          alt="Current"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                          <div className="text-center text-blue-800">
                            <div className="text-4xl mb-2">📸</div>
                            <div>Current Screenshot</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Slider Handle */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={(e) => {
                          const handleMouseMove = (e: MouseEvent) => {
                            const target = e.currentTarget as HTMLElement;
                            const rect = target?.getBoundingClientRect();
                            if (rect) {
                              const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                              setSliderPosition(Math.max(0, Math.min(100, percentage)));
                            }
                          };
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                          });
                        }}
                      />
                    </div>
                    
                    {/* Slider Control */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-center text-white text-sm mt-1">
                        Position: {sliderPosition}%
                      </div>
                    </div>
                  </div>
                ) : screenshotComparisonState.layout === 'overlay' ? (
                  /* Overlay Layout */
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden h-full" style={{ aspectRatio: '16/9' }}>
                    {/* Previous Screenshot (Background) */}
                    <div className="absolute inset-0">
                      {screenshotComparisonState.selectedScreenshots.previous ? (
                        <img
                          src={screenshotComparisonState.selectedScreenshots.previous.imageUrl}
                          alt="Previous"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <div className="text-4xl mb-2">📸</div>
                            <div>Previous Screenshot</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Current Screenshot (Overlay) */}
                    <div 
                      className="absolute inset-0"
                      style={{ opacity: overlayOpacity / 100 }}
                    >
                      {screenshotComparisonState.selectedScreenshots.current ? (
                        <img
                          src={screenshotComparisonState.selectedScreenshots.current.imageUrl}
                          alt="Current"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center">
                          <div className="text-center text-orange-800">
                            <div className="text-4xl mb-2">📸</div>
                            <div>Current Screenshot</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Opacity Control */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-center text-white text-sm mt-1">
                        Overlay: {overlayOpacity}%
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Grid Layout (Horizontal/Vertical) */
                  <div className={`${screenshotComparisonState.layout === 'vertical' ? 'grid grid-rows-2' : 'grid grid-cols-2'} gap-4 h-full`}>
                  {/* Current Screenshot */}
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Current
                    </div>
                    {screenshotComparisonState.selectedScreenshots.current ? (
                      <img
                        src={screenshotComparisonState.selectedScreenshots.current.imageUrl}
                        alt="Current screenshot"
                        className="w-full h-full object-contain"
                        style={{
                          transform: `scale(${screenshotComparisonState.zoomLevel / 100}) translate(${screenshotComparisonState.panPosition.x}px, ${screenshotComparisonState.panPosition.y}px)`,
                          transformOrigin: 'top left'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📸</div>
                          <div>No current screenshot</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Previous Screenshot */}
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute top-2 left-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Previous
                    </div>
                    {screenshotComparisonState.selectedScreenshots.previous ? (
                      <img
                        src={screenshotComparisonState.selectedScreenshots.previous.imageUrl}
                        alt="Previous screenshot"
                        className="w-full h-full object-contain opacity-80"
                        style={{
                          transform: `scale(${screenshotComparisonState.zoomLevel / 100}) translate(${screenshotComparisonState.panPosition.x}px, ${screenshotComparisonState.panPosition.y}px)`,
                          transformOrigin: 'top left'
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📸</div>
                          <div>No previous screenshot</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>
            </div>
          ) : comparisonState.isActive && comparisonState.selectedInspection ? (
            <div className="flex flex-col gap-4">
              {/* Layout Controls with Version Chips */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border border-gray-200 bg-white p-3 rounded-lg">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  {/* Version 1 (Current) */}
                  <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow-sm flex-shrink-0">
                    <span className="text-xs text-gray-600">📅</span>
                    <span className="text-xs font-medium text-gray-800">{currentInspection.date}</span>
                  </div>
                  
                  {/* Compare Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Video Compare Button */}
                    <button 
                      onClick={toggleComparisonMode}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0 ${
                        comparisonState.isActive 
                          ? 'bg-orange-500 text-white hover:bg-orange-600' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{comparisonState.isActive ? 'Exit Compare' : 'Compare'}</span>
                    </button>
                    
                  </div>
                  
                  {/* Version 2 (Selected) */}
                  <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow-sm flex-shrink-0">
                    <span className="text-xs text-gray-600">🔄</span>
                    <span className="text-xs font-medium text-gray-800">
                      {comparisonState.selectedInspection 
                        ? comparisonState.selectedInspection.date 
                        : 'Select inspection'
                      }
                    </span>
                  </div>
                  
                  {/* Layout Options */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">Layout:</span>
                    <div className="flex gap-1">
                      {(['vertical', 'horizontal'] as const).map((layout) => (
                        <button
                          key={layout}
                          onClick={() => changeComparisonLayout(layout)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors ${
                            comparisonState.layout === layout 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <span>{layout === 'vertical' ? '📐' : '🔄'}</span>
                          <span className="hidden sm:inline">{layout.replace('-', ' ')}</span>
                          <span className="sm:hidden">{layout === 'vertical' ? 'V' : 'S'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={toggleSyncedPlayback}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors self-start lg:self-auto ${
                    comparisonState.syncedPlayback 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>🔗</span>
                  <span>{comparisonState.syncedPlayback ? 'Synced' : 'Independent'}</span>
                </button>
              </div>

              {/* Video Comparison Views */}
              <ComparisonVideoPlayer />
              {false && comparisonState.layout === 'vertical' && (
                <div className="flex flex-col gap-2 items-center">
                  {/* Current Video - Top */}
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full" style={{ aspectRatio: '16/9', maxWidth: '533px' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
                      alt="Current inspection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      📅 Current {currentInspection.date}
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="text-white text-xs font-mono">
                          {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 02:31
                        </div>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${(videoTime / 151) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Previous Video - Bottom */}
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full" style={{ aspectRatio: '16/9', maxWidth: '533px' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
                      alt="Previous inspection"
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'sepia(100%) hue-rotate(200deg) saturate(1.5) contrast(1.2)',
                        opacity: 0.9
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      📅 Previous {comparisonState.selectedInspection?.date || 'N/A'}
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="text-white text-xs font-mono">
                          {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 02:31
        </div>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${(videoTime / 151) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {false && (
                <div className="flex justify-center">
                  <div 
                    className="relative bg-gray-900 rounded-lg overflow-hidden cursor-ew-resize"
                    style={{ aspectRatio: '16/9' }}
                  onMouseDown={(e) => {
                    if (!e.currentTarget) return;
                    const target = e.currentTarget as HTMLElement;
                    const rect = target.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    setSliderPosition(Math.max(0, Math.min(100, percentage)));
                  }}
                >
                  {/* Current Image */}
                  <img 
                    src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
                    alt="Current inspection"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Previous Image with clip-path */}
                  <div 
                    className="absolute inset-0 bg-gray-900"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
                    }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
                      alt="Previous inspection"
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'sepia(100%) hue-rotate(200deg) saturate(1.5) contrast(1.2)',
                        opacity: 0.9
                      }}
                    />
                  </div>
                  
                  {/* Slider Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-10"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleSliderMouseDown}
                  >
                    <div className="w-4 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                      <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                    📅 Current Nov 2024
                  </div>
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                    📅 Previous {comparisonState.selectedInspection?.date || 'N/A'}
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 z-10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        )}
                      </button>
                      <div className="text-white text-xs font-mono">
                        {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 02:31
                      </div>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${(videoTime / 151) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Slider Input (hidden) */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col">
              {/* Video/Image Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('video')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'video' 
                        ? 'bg-orange-500 text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📹 Video
                  </button>
                  <button
                    onClick={() => setViewMode('image')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'image' 
                        ? 'bg-orange-500 text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🖼️ Image
                  </button>
                </div>
              </div>

              {/* Video/Image Container with 16:9 aspect ratio */}
              {isVideoPopedOut ? (
                <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🪟</div>
                    <div className="text-lg font-semibold">Video is in pop-out window</div>
                    <div className="text-sm text-gray-300 mt-2">
                      Current time: {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 2:31
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Playing: {selectedObservation ? `Observation #${selectedObservation}` : 'No observation'}
                    </div>
                    <button
                      onClick={closeVideoPopout}
                      className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Return Video to Main Window
                    </button>
                  </div>
                </div>
              ) : viewMode === 'image' ? (
                <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  {selectedObservation ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📸</div>
                        <div className="text-lg font-semibold text-gray-900 mb-2">Observation #{selectedObservation}</div>
                        <div className="text-sm text-gray-600">
                          Distance: {observations.find(obs => obs.id === selectedObservation)?.distance || 'N/A'}m
                        </div>
                        <div className="text-sm text-gray-600">
                          Grade: {observations.find(obs => obs.id === selectedObservation)?.grade || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Code: {observations.find(obs => obs.id === selectedObservation)?.code || 'N/A'}
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                            📸 Screenshot Preview
                          </div>
                          <button 
                            onClick={toggleScreenshotComparisonMode}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              screenshotComparisonState.isActive 
                                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                          >
                            📸 {screenshotComparisonState.isActive ? 'Exit Screenshot Compare' : 'Screenshot Compare'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      <div className="text-6xl mb-4">🖼️</div>
                      <div className="text-lg font-semibold mb-2">Select an observation to view image</div>
                      <div className="text-sm mb-4">Click on any observation in the table below</div>
                      <button 
                        onClick={toggleScreenshotComparisonMode}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          screenshotComparisonState.isActive 
                            ? 'bg-purple-500 text-white hover:bg-purple-600' 
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                      >
                        📸 {screenshotComparisonState.isActive ? 'Exit Screenshot Compare' : 'Screenshot Compare'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <img 
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop" 
                  alt="Pipe inspection"
                  className="w-full h-full object-cover"
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                    
                    {/* Time Display */}
                    <div className="text-white text-sm font-mono">
                      {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')} / 02:31
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300" 
                        style={{ width: `${(videoTime / 151) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Volume */}
                    <button className="w-8 h-8 text-white/80 hover:text-white">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    
                    {/* Fullscreen */}
                    <button 
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="w-8 h-8 text-white/80 hover:text-white"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Pop-out Video */}
                    <button 
                      onClick={isVideoPopedOut ? closeVideoPopout : openVideoPopout}
                      className="w-8 h-8 text-white/80 hover:text-white"
                      title={isVideoPopedOut ? "Return video to main window" : "Open video in separate window"}
                    >
                      {isVideoPopedOut ? <Minimize className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  {/* Current Inspection Selector */}
                  <div className="relative">
                    <Select 
                      value={currentInspection.id.toString()} 
                      onValueChange={(value) => {
                        const inspection = [currentInspection, ...previousInspections].find(i => i.id.toString() === value);
                        if (inspection) selectCurrentInspection(inspection);
                      }}
                    >
                      <SelectTrigger className="h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center gap-2 px-3 transition-colors border-0 text-white text-xs font-medium">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{currentInspection.date}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={currentInspection.id.toString()}>
                          📅 {currentInspection.date}
                        </SelectItem>
                        {previousInspections.map((inspection) => (
                          <SelectItem key={inspection.id} value={inspection.id.toString()}>
                            📅 {inspection.date}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                        <SelectItem 
                          value="upload-new" 
                          onSelect={(e) => {
                            e.preventDefault();
                            uploadVideo();
                          }}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload new video
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Compare Mode */}
                  <button 
                    onClick={toggleComparisonMode}
                    className={`h-8 rounded-full flex items-center gap-2 px-3 transition-colors ${
                      comparisonState.isActive 
                        ? 'bg-blue-500/90 text-white hover:bg-blue-500' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title={comparisonState.isActive ? 'Exit Compare Mode' : 'Enter Compare Mode'}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {comparisonState.isActive ? 'Exit Compare' : 'Compare'}
                    </span>
                  </button>
                  
                  {/* Version Selector (only when Compare Mode is active) */}
                  {comparisonState.isActive && (
                    <div className="relative">
                      <Select 
                        value={comparisonState.selectedInspection?.id.toString() || ''} 
                        onValueChange={(value) => {
                          const inspection = previousInspections.find(i => i.id.toString() === value);
                          if (inspection) selectInspectionForComparison(inspection);
                        }}
                      >
                        <SelectTrigger className="h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center gap-2 px-3 transition-colors border-0 text-white text-xs font-medium [&>span]:text-white">
                          <SelectValue placeholder="Select inspection" className="text-white">
                            {comparisonState.selectedInspection && (
                              <div className="flex items-center gap-2">
                                <span>🔄</span>
                                <span>{comparisonState.selectedInspection.date}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {previousInspections.map((inspection) => (
                            <SelectItem key={inspection.id} value={inspection.id.toString()}>
                              📅 {inspection.date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                </div>
                
                {/* Action Buttons - Right Side */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {/* Save Screenshot */}
                  <button 
                    onClick={saveScreenshot}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    title="Save Screenshot"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  
                  {/* Download Video */}
                  <button 
                    onClick={downloadVideo}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    title="Download Video"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              )}
              
            </div>
          )}
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">🏗️ Pipe Segment Overview (Physical Distance)</div>
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="text-xs font-medium text-gray-700">MH-E231</div>
              <div className="text-xs font-medium text-gray-700">MH-22</div>
            </div>
            <div className="relative h-12 bg-gradient-to-r from-green-50 via-yellow-50 to-orange-50 rounded-lg border-2 border-gray-200">
              {observations.map((obs) => {
                const position = (obs.distance / 35) * 100;
                return (
                  <div 
                    key={obs.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                    style={{ left: `${position}%` }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full cursor-pointer border-2 border-white shadow-md ${
                        selectedObservation === obs.id ? 'w-5 h-5 ring-4 ring-orange-300' : ''
                      }`}
                      style={{ backgroundColor: obs.grade >= 4 ? '#ef4444' : obs.grade >= 3 ? '#f59e0b' : '#10b981' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleObservationClick(obs);
                      }}
                    ></div>
    </div>
  );
              })}
            </div>
          </div>

          {/* Screenshot Gallery */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">📸 Screenshot Gallery</div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {observations.map((obs, index) => (
                <div 
                  key={obs.id}
                  className="flex-shrink-0 cursor-pointer group"
                  onClick={() => {
                    // Jump to video time
                    const timestamp = obs.timestamp.split(':');
                    const minutes = parseInt(timestamp[0]);
                    const seconds = parseFloat(timestamp[1]);
                    setVideoTime(minutes * 60 + seconds);
                    showToast(`Jumped to ${obs.timestamp}`, 'info');
                  }}
                >
                  <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-orange-500 transition-colors">
                    <img 
                      src={`https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=150&fit=crop&t=${index}`}
                      alt={`Screenshot at ${obs.timestamp}`}
                      className="w-full h-full object-cover"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGallery(index);
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                      {obs.timestamp}
                    </div>
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white"
                         style={{ backgroundColor: obs.grade >= 4 ? '#ef4444' : obs.grade >= 3 ? '#f59e0b' : '#10b981' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 text-center truncate w-24">
                    {obs.code}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Click any screenshot to jump to that time in the video
            </div>
          </div>

          {/* Notes Section */}
          {!isNotesPinned && (
            <div className="mt-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span className="font-medium text-sm">Notes</span>
                    {inspectionNotes && (
                      <span className="text-xs text-gray-500">
                        ({inspectionNotes.split('\n').length} lines)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotesPin();
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Pin notes as floating window"
                    >
                      <Pin className="w-3 h-3 text-gray-400" />
                    </button>
                    {showNotes ? (
                      <ChevronUp className="w-3 h-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {showNotes && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <textarea
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      onBlur={saveNotes}
                      placeholder="Add general notes about this inspection..."
                      className="w-full h-28 px-2.5 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-xs text-gray-500">
                        {inspectionNotes.length}/5000 characters
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setInspectionNotes('')}
                          className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={saveNotes}
                          className="px-2.5 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resizable Separator */}
        <div 
          className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 transition-colors duration-200"
          onMouseDown={handleMouseDown}
        >
        </div>

        <div 
          className="bg-white flex flex-col overflow-hidden flex-shrink-0"
          style={{ width: `${100 - leftColumnWidth}%` }}
        >

          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Observations</h3>
              {!comparisonState.isActive && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={addNewObservation}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Observation
                  </button>
                </div>
              )}
            </div>


            {comparisonState.isActive ? (
              <ComparisonTables />
            ) : observations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No observations yet</h3>
                <p className="text-sm text-gray-600 mb-4">Start by using a Quick Action</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[1200px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">TIMESTAMP</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">DISTANCE (FT)</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CODE</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CONTINUOUS</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">VALUE 1</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">VALUE 2</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">PERCENT</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">JOINT</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CLOCK 1</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">CLOCK 2</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">GRADE (FT)</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">REMARKS</th>
                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 w-12"></th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-200">
                    {observations.map((obs) => (
                      <tr 
                        key={obs.id}
                        className={`hover:bg-gray-50 cursor-pointer relative ${
                          selectedObservation === obs.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                        } ${
                          comparisonState.isActive && comparisonState.selectedInspection ? 
                            (obs.status === 'new' ? 'bg-green-50' : 
                             obs.status === 'modified' ? 'bg-orange-50' : 
                             'bg-white') : ''
                        }`}
                        onClick={() => handleObservationClick(obs)}
                        onContextMenu={(e) => handleContextMenu(e, obs)}
                        onMouseEnter={() => setHoveredObservation(obs.id)}
                        onMouseLeave={() => setHoveredObservation(null)}
                      >
                        {/* TIMESTAMP - Read only */}
                        <td className="px-3 py-3 text-gray-900 font-mono text-xs">{obs.timestamp}</td>
                        
                        {/* DISTANCE (FT) - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'distance' ? (
                            <input
                              type="number"
                              value={isNaN(obs.distance) ? '' : obs.distance.toString()}
                              onChange={(e) => handleCellChange(obs.id, 'distance', parseFloat(e.target.value) || 0)}
                              onBlur={() => handleCellBlur(obs.id, 'distance', obs.distance || 0)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'distance', obs.distance || 0)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'distance' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.distance}
                            </span>
                          )}
                        </td>
                        
                        {/* CODE - Dropdown */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'code' ? (
                            <select
                              value={obs.code}
                              onChange={(e) => handleCellChange(obs.id, 'code', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'code', obs.code)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">Select option</option>
                              <option value="MLWE">MLWE</option>
                              <option value="OBR">OBR</option>
                              <option value="OBZ">OBZ</option>
                              <option value="CRK">CRK</option>
                              <option value="BRK">BRK</option>
                              <option value="INF">INF</option>
                              <option value="SED">SED</option>
                            </select>
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'code' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                            >
                              {obs.code || 'Select option'}
                            </span>
                          )}
                        </td>
                        
                        {/* CONTINUOUS - Dropdown */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'continuous' ? (
                            <select
                              value={obs.continuous}
                              onChange={(e) => handleCellChange(obs.id, 'continuous', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'continuous', obs.continuous)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="No">No</option>
                              <option value="Yes">Yes</option>
                            </select>
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'continuous' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {obs.continuous}
                            </span>
                          )}
                        </td>
                        
                        {/* VALUE 1 - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'value1' ? (
                            <input
                              type="text"
                              value={obs.value1}
                              onChange={(e) => handleCellChange(obs.id, 'value1', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'value1', obs.value1)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'value1', obs.value1)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'value1' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.value1}
                            </span>
                          )}
                        </td>
                        
                        {/* VALUE 2 - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'value2' ? (
                            <input
                              type="text"
                              value={obs.value2}
                              onChange={(e) => handleCellChange(obs.id, 'value2', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'value2', obs.value2)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'value2', obs.value2)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'value2' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.value2}
                            </span>
                          )}
                        </td>
                        
                        {/* PERCENT - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'percent' ? (
                            <input
                              type="text"
                              value={obs.percent}
                              onChange={(e) => handleCellChange(obs.id, 'percent', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'percent', obs.percent)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'percent', obs.percent)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'percent' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.percent}
                            </span>
                          )}
                        </td>
                        
                        {/* JOINT - Checkbox */}
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={obs.joint}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCellEdit(obs.id, 'joint', e.target.checked);
                            }}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                        </td>
                        
                        {/* CLOCK 1 - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'clock1' ? (
                            <input
                              type="text"
                              value={obs.clock1}
                              onChange={(e) => handleCellChange(obs.id, 'clock1', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'clock1', obs.clock1)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'clock1', obs.clock1)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'clock1' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.clock1}
                            </span>
                          )}
                        </td>
                        
                        {/* CLOCK 2 - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'clock2' ? (
                            <input
                              type="text"
                              value={obs.clock2}
                              onChange={(e) => handleCellChange(obs.id, 'clock2', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'clock2', obs.clock2)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'clock2', obs.clock2)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'clock2' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded"
                            >
                              {obs.clock2}
                            </span>
                          )}
                        </td>
                        
                        {/* GRADE (FT) - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'grade' ? (
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={isNaN(obs.grade) ? '' : obs.grade.toString()}
                              onChange={(e) => handleCellChange(obs.id, 'grade', parseInt(e.target.value) || 1)}
                              onBlur={() => handleCellBlur(obs.id, 'grade', obs.grade || 1)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'grade', obs.grade || 1)}
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'grade' });
                              }}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white cursor-text hover:bg-gray-100 ${
                                obs.grade >= 4 ? 'bg-red-500' : obs.grade >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            >
                              {obs.grade}
                            </span>
                          )}
                        </td>
                        
                        {/* REMARKS - Editable */}
                        <td className="px-3 py-3">
                          {editingCell?.id === obs.id && editingCell?.field === 'remarks' ? (
                            <input
                              type="text"
                              value={obs.remarks}
                              onChange={(e) => handleCellChange(obs.id, 'remarks', e.target.value)}
                              onBlur={() => handleCellBlur(obs.id, 'remarks', obs.remarks)}
                              onKeyDown={(e) => handleCellKeyDown(e, obs.id, 'remarks', obs.remarks)}
                              placeholder="Enter remarks"
                              className="w-full px-2 py-1 border border-orange-300 rounded text-xs"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingCell({ id: obs.id, field: 'remarks' });
                              }}
                              className="cursor-text hover:bg-gray-100 px-1 rounded text-gray-500"
                            >
                              {obs.remarks || 'Enter remarks'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {/* Hover Menu - Save as Hot Button */}
                            {hoveredObservation === obs.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveAsQuickCode(obs);
                                }}
                                className="p-1.5 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                                title="Save as Quick Code"
                              >
                                <Star className="w-3 h-3" />
                              </button>
                            )}
                            
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
            )
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          <Check className="w-5 h-5" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {contextMenu && (
        <div 
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[200px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => duplicateObservation(contextMenu.observation)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => saveAsQuickCode(contextMenu.observation)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
          >
            <Star className="w-4 h-4 text-orange-500" />
            <span>Save as Quick Code</span>
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button
            onClick={() => {
              setShowDeleteConfirm(contextMenu.observation.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {typeof showDeleteConfirm === 'string' ? 'Delete Inspection?' : 'Delete Observation?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {typeof showDeleteConfirm === 'string' 
                ? 'This will delete the entire inspection and all its observations. This action cannot be undone.'
                : 'This action cannot be undone.'
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (typeof showDeleteConfirm === 'string') {
                    // Delete entire inspection
                    showToast('Inspection deleted successfully', 'success');
                    setShowDeleteConfirm(null);
                  } else {
                    // Delete observation
                    deleteObservation(showDeleteConfirm);
                  }
                }}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickCodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Manage Quick Codes</h3>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={createQuickCodeFromScratch}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
                <button onClick={() => setShowQuickCodeDialog(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {quickCodes
                .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                .map(button => (
                <div key={button.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{button.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{button.name}</div>
                      <div className="text-sm text-gray-500">Code: {button.code}</div>
                      {button.description && (
                        <div className="text-xs text-gray-400 mt-1">{button.description}</div>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Used {button.usageCount || 0} times
                        </span>
                        {button.grade && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            button.grade >= 4 ? 'bg-red-100 text-red-700' : 
                            button.grade >= 3 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            Grade {button.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <button 
                      onClick={() => removeQuickCode(button.id)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Hot Button Dialog */}
      <Dialog open={showQuickCreateDialog} onOpenChange={setShowQuickCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Name this template?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Create a reusable template from this observation
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={newQuickCodeName}
                onChange={(e) => setNewQuickCodeName(e.target.value)}
                placeholder="Auto-generated if empty"
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowQuickCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const obs = observations.find(o => o.description === newQuickCodeName || o.id === hoveredObservation);
                if (obs) {
                  createQuickCodeFromObservation(obs, newQuickCodeName);
                }
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Enhanced FAB - Quick Actions */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl transition-all z-40 group"
            size="icon"
          >
            <Zap className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            {/* Usage indicator */}
            {quickCodes.some(btn => (btn.usageCount || 0) > 0) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {quickCodes.reduce((sum, btn) => sum + (btn.usageCount || 0), 0)}
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="end" side="top">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-xs text-gray-500">Templates & shortcuts</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={createQuickCodeFromScratch}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  New
                </Button>
                <Button 
                  onClick={() => setShowQuickCodeDialog(true)}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Manage
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{quickCodes.length}</div>
                <div className="text-xs text-gray-500">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">
                  {quickCodes.reduce((sum, btn) => sum + (btn.usageCount || 0), 0)}
                </div>
                <div className="text-xs text-gray-500">Uses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {quickCodes.filter(btn => (btn.usageCount || 0) > 0).length}
                </div>
                <div className="text-xs text-gray-500">Active</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Templates</div>
                <div className="text-xs text-gray-400">
                  {quickCodes.filter(btn => (btn.usageCount || 0) > 0).length} of {quickCodes.length} used
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {quickCodes
                  .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
                  .map(button => (
                  <button
                    key={button.id}
                    onClick={() => addObservationFromQuickCode(button)}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg group-hover:scale-110 transition-transform">{button.icon}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{button.name}</div>
                        <div className="text-xs text-gray-500">{button.code}</div>
                        {button.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{button.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {button.usageCount && button.usageCount > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                          {button.usageCount}
                        </span>
                      )}
                      {button.grade && (
                        <span className={`w-4 h-4 rounded-full ${
                          button.grade >= 4 ? 'bg-red-500' : 
                          button.grade >= 3 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} title={`Grade ${button.grade}`}></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Tips */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-800 font-medium mb-1">💡 Pro Tips</div>
              <div className="text-xs text-blue-700">
                • Click any template to instantly add observation<br/>
                • Most used templates appear first<br/>
                • Create new templates from existing observations
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Sidebar */}
      {showEditSidebar && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Inspection</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditSidebar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* General Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-reference">Pipe Segment Reference</Label>
                    <Input
                      id="sidebar-reference"
                      value={pipeInfo.reference}
                      onChange={(e) => handlePipeInfoChange('reference', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-operator">Operator</Label>
                    <Select value="A. Johnson" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A. Johnson">A. Johnson</SelectItem>
                        <SelectItem value="B. Smith">B. Smith</SelectItem>
                        <SelectItem value="C. Davis">C. Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-reviewer">Reviewer</Label>
                    <Select value="A. Johnson" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A. Johnson">A. Johnson</SelectItem>
                        <SelectItem value="B. Smith">B. Smith</SelectItem>
                        <SelectItem value="C. Davis">C. Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-cert">Certificate Number</Label>
                    <Input
                      id="sidebar-cert"
                      value="CERT-8439"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-date">Date</Label>
                    <Input
                      id="sidebar-date"
                      value="10/11/2023 11:38:00"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Inspection Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pre-Cleaning</Label>
                    <div className="flex gap-4 w-full">
                      <Button variant="outline" size="sm" className="flex-1">Yes</Button>
                      <Button variant="outline" size="sm" className="flex-1">No</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Direction of Survey</Label>
                    <div className="flex gap-4 w-full">
                      <Button variant="outline" size="sm" className="flex-1">Upstream</Button>
                      <Button variant="default" size="sm" className="flex-1">Downstream</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-inspection-date">Date of Inspection</Label>
                    <Input
                      id="sidebar-inspection-date"
                      value="April 20, 2025"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-inspection-time">Time of Inspection Start</Label>
                    <Input
                      id="sidebar-inspection-time"
                      value="11:30pm"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-status">Inspection Status</Label>
                    <Select value="Complete" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Complete">Complete</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-cleaned-date">Date Cleaned</Label>
                    <Input
                      id="sidebar-cleaned-date"
                      value="April 12, 2025"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-street">Street</Label>
                    <Input
                      id="sidebar-street"
                      value="Main St."
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-city">City</Label>
                    <Input
                      id="sidebar-city"
                      value="Springfield"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-upstream">Upstream Manhole</Label>
                    <Input
                      id="sidebar-upstream"
                      value={pipeInfo.upstreamManhole}
                      onChange={(e) => handlePipeInfoChange('upstreamManhole', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-downstream">Downstream Manhole</Label>
                    <Input
                      id="sidebar-downstream"
                      value={pipeInfo.downstreamManhole}
                      onChange={(e) => handlePipeInfoChange('downstreamManhole', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Pipe Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipe Info</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-pipe-use">Pipe Use</Label>
                    <Select value="Stormwater Pipe" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stormwater Pipe">Stormwater Pipe</SelectItem>
                        <SelectItem value="Sanitary Sewer">Sanitary Sewer</SelectItem>
                        <SelectItem value="Combined">Combined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-shape">Shape</Label>
                    <Select value="Circular" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Circular">Circular</SelectItem>
                        <SelectItem value="Rectangular">Rectangular</SelectItem>
                        <SelectItem value="Oval">Oval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-material">Material</Label>
                    <Select value={pipeInfo.material} onValueChange={(value) => handlePipeInfoChange('material', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PolyVinyl Chloride">PolyVinyl Chloride</SelectItem>
                        <SelectItem value="Clay Tile">Clay Tile</SelectItem>
                        <SelectItem value="Concrete">Concrete</SelectItem>
                        <SelectItem value="PVC">PVC</SelectItem>
                        <SelectItem value="Cast Iron">Cast Iron</SelectItem>
                        <SelectItem value="Steel">Steel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-height">Height (mm)</Label>
                    <Input
                      id="sidebar-height"
                      value="400"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-width">Width (mm)</Label>
                    <Input
                      id="sidebar-width"
                      value="400"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-diameter">Diameter</Label>
                    <Input
                      id="sidebar-diameter"
                      value={pipeInfo.diameter}
                      onChange={(e) => handlePipeInfoChange('diameter', e.target.value)}
                      placeholder="12"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Fields */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-weather">Weather</Label>
                    <Select value="Sunny" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sunny">Sunny</SelectItem>
                        <SelectItem value="Cloudy">Cloudy</SelectItem>
                        <SelectItem value="Rainy">Rainy</SelectItem>
                        <SelectItem value="Snowy">Snowy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-sheet">Sheet Number</Label>
                    <Input
                      id="sidebar-sheet"
                      value="copy"
                      onChange={() => {}}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sidebar-purpose">Purpose</Label>
                    <Select value="copy" onValueChange={() => {}}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copy">copy</SelectItem>
                        <SelectItem value="Routine Inspection">Routine Inspection</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 mt-6">
              <Button variant="outline" onClick={() => setShowEditSidebar(false)}>
                Cancel
              </Button>
              <Button onClick={savePipeInfo} className="bg-orange-500 hover:bg-orange-600">
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeGallery}>
          <div className="relative max-w-6xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={`https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&h=800&fit=crop&t=${selectedImageIndex}`}
                alt={`Screenshot ${selectedImageIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Image Info */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Screenshot {selectedImageIndex + 1} of {observations.length}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Timestamp: {observations[selectedImageIndex]?.timestamp} | 
                      Code: {observations[selectedImageIndex]?.code} | 
                      Distance: {observations[selectedImageIndex]?.distance}ft
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Grade:</span>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        observations[selectedImageIndex]?.grade >= 4 
                          ? 'bg-red-100 text-red-800' 
                          : observations[selectedImageIndex]?.grade >= 3 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {observations[selectedImageIndex]?.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {observations.map((obs, index) => (
                <button
                  key={obs.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex 
                      ? 'border-orange-500' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={`https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=100&h=80&fit=crop&t=${index}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Notes Window */}
      {isNotesPinned && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col"
          style={{
            left: notesPosition.x,
            top: notesPosition.y,
            width: notesSize.width,
            height: notesSize.height
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0 cursor-grab hover:bg-gray-100 transition-colors"
            style={{ cursor: isNotesDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleNotesMouseDown}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400 drag-handle" />
              <span className="text-sm font-medium">📝 Notes</span>
              {inspectionNotes && (
                <span className="text-xs text-gray-500">
                  ({inspectionNotes.split('\n').length} lines)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleNotesPin}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Unpin notes"
              >
                <PinOff className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => setIsNotesPinned(false)}
                onMouseDown={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex flex-col h-full">
            <div className="flex-1 p-3">
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Add general notes about this inspection..."
                className="w-full h-full px-2.5 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-between items-center p-3 pt-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {inspectionNotes.length}/5000 characters
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setInspectionNotes('')}
                  className="px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={saveNotes}
                  className="px-2.5 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          
          {/* Resize Handles */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-gray-300 hover:bg-gray-400"
            onMouseDown={(e) => handleNotesResizeMouseDown(e, 'bottom-right')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize"
            onMouseDown={(e) => handleNotesResizeMouseDown(e, 'bottom')}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize"
            onMouseDown={(e) => handleNotesResizeMouseDown(e, 'right')}
          />
        </div>
      )}

      {/* Screenshot Comparison Modal */}
      <ScreenshotComparisonModal />

      {/* Submit for Evaluation Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit for Evaluation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to submit this inspection for evaluation? 
              Once submitted, the inspection will be sent to the review team for assessment.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle submit logic here
                  showToast('Inspection submitted for evaluation', 'success');
                  setShowSubmitModal(false);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept/Reject Inspection Modal */}
      <Dialog open={showAcceptRejectModal} onOpenChange={setShowAcceptRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Inspection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Please review this inspection and provide your decision with comments.
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setAcceptRejectAction('accept')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    acceptRejectAction === 'accept'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => setAcceptRejectAction('reject')}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    acceptRejectAction === 'reject'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ✗ Reject
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <textarea
                  value={acceptRejectComment}
                  onChange={(e) => setAcceptRejectComment(e.target.value)}
                  placeholder="Add your review comments..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAcceptRejectModal(false);
                  setAcceptRejectAction(null);
                  setAcceptRejectComment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (acceptRejectAction) {
                    const action = acceptRejectAction === 'accept' ? 'accepted' : 'rejected';
                    showToast(`Inspection ${action} successfully`, 'success');
                    setShowAcceptRejectModal(false);
                    setAcceptRejectAction(null);
                    setAcceptRejectComment('');
                  }
                }}
                disabled={!acceptRejectAction}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptRejectAction === 'accept' ? 'Accept' : acceptRejectAction === 'reject' ? 'Reject' : 'Submit'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
