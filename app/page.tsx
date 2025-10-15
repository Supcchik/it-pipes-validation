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
  Minimize,
  Link
} from 'lucide-react';
import type { Observation, QuickCode, EditingCell, ContextMenuState, ToastState, PipeSegmentInfo, Inspection, ComparisonLayout, ComparisonState } from '@/types/inspection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const [sliderPosition, setSliderPosition] = useState(50); // 0-100%
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
  const [viewMode, setViewMode] = useState<'video' | 'image'>('video');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Resizable columns state
  const [leftColumnWidth, setLeftColumnWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);

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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedObservation, editingCell, isPlaying, contextMenu, videoTime, observations, isFullscreen]);

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
      selectedInspection: !prev.isActive ? previousInspection : null
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

  const changeComparisonLayout = (layout: ComparisonLayout) => {
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
        {/* Row 1: LOGO + Action Buttons */}
        <div className="flex items-center justify-between mb-2">
          {/* LOGO */}
          <div className="text-lg font-bold text-gray-900">
            LOGO
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Delete */}
            <button 
              onClick={deleteInspection}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Inspection"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            
            {/* Separator */}
            <div className="h-6 w-px bg-gray-300"></div>
            
            {/* Share (Copy Link) */}
            <button 
              onClick={copyInspectionLink}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy Inspection Link"
            >
              <Link className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Send for Review */}
            <button 
              onClick={submitForReview}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Send for Review
            </button>
            
            {/* Export/Upload Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={exportReport}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
              <button 
                onClick={uploadVideo}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Video</span>
              </button>
            </div>
            
            {/* Save and Exit */}
            <button className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
              Save and Exit
            </button>
          </div>
        </div>
        
        {/* Row 2: Inspection Details + Edit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
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
          
          {/* Edit Button */}
          <Button variant="outline" size="sm" onClick={() => setShowEditSidebar(true)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-y-auto">
        <div 
          className="border-r border-gray-200 bg-white p-6 flex flex-col min-h-0 flex-shrink-0"
          style={{ width: `${leftColumnWidth}%` }}
        >
          {/* Video Comparison Layout */}
          {comparisonState.isActive && comparisonState.selectedInspection ? (
            <div className="flex flex-col gap-4">
              {/* Layout Controls with Version Chips */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border border-gray-200 bg-white p-3 rounded-lg">
                <div className="flex flex-wrap items-center gap-3 min-w-0">
                  {/* Version 1 (Current) */}
                  <div className="flex items-center gap-2 bg-white/80 rounded-full px-3 py-1.5 shadow-sm flex-shrink-0">
                    <span className="text-xs text-gray-600">📅</span>
                    <span className="text-xs font-medium text-gray-800">{currentInspection.date}</span>
                  </div>
                  
                  {/* Compare Button */}
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
                      {(['vertical', 'slider'] as ComparisonLayout[]).map((layout) => (
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
              {comparisonState.layout === 'vertical' && (
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
                      📅 Previous {comparisonState.selectedInspection.date}
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

              {comparisonState.layout === 'slider' && (
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
                    📅 Previous {comparisonState.selectedInspection.date}
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

              {/* Video Container with 16:9 aspect ratio */}
              {viewMode === 'video' ? (
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
            </div>
          ) : (
            // Image mode
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {selectedObservation ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">📸</div>
                    <div className="text-lg font-semibold">Screenshot View</div>
                    <div className="text-sm text-gray-300 mt-2">
                      Observation #{selectedObservation} - {observations.find(o => o.id === selectedObservation)?.timestamp}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Distance: {observations.find(o => o.id === selectedObservation)?.distance}ft
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">👆</div>
                    <div className="text-lg font-semibold">Select an observation</div>
                    <div className="text-sm text-gray-300 mt-2">to view screenshot</div>
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
              <button 
                onClick={addNewObservation}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Observation
              </button>
            </div>

            {comparisonState.isActive && comparisonState.selectedInspection && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-semibold text-blue-900 mb-2">Comparison Legend:</div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
                    <span>+New</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-100 border border-red-300"></div>
                    <span>-Removed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300"></div>
                    <span>Modified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white border border-gray-300"></div>
                    <span>Same</span>
                  </div>
                </div>
              </div>
            )}

            {observations.length === 0 ? (
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
    </div>
  );
}
