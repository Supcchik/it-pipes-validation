'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Square, X, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers } from 'lucide-react';
import type { Asset, FilterConfig, PlotPoint } from '@/lib/types/asset-list';
import { MOCK_MANHOLES, MOCK_PIPE_SEGMENTS, getPipeSegmentByAssetId } from '@/lib/mock-data/mockMapData';
import { calculatePlotPosition, calculatePipeLength } from '@/lib/utils/map-utils';
import MapSearch, { type NetworkAsset } from './MapSearch';
import LayersPopOutWindow from './LayersPopOutWindow';
import ManholePopup from './ManholePopup';
import PipeSegmentPopup from './PipeSegmentPopup';

interface MapPanelProps {
  assets: Asset[];
  selectedAssetIds?: string[];
  filteredAssetIds?: string[];
  onAssetSelect: (assetIds: string[]) => void;
  onMapClick?: () => void;
  filters?: FilterConfig[];
}

// Style constants
const PIPE_STYLES = {
  default: { stroke: '#2563EB', strokeWidth: 3, opacity: 0.8 },
  hover: { stroke: '#1D4ED8', strokeWidth: 4, opacity: 1 },
  selected: { stroke: '#E86F25', strokeWidth: 5, opacity: 1 },
  filtered: { stroke: '#94A3B8', strokeWidth: 2, opacity: 0.3 },
};

const MANHOLE_STYLES = {
  default: { fill: '#DC2626', radius: 6, stroke: '#FFFFFF', strokeWidth: 2 },
  hover: { fill: '#B91C1C', radius: 8, stroke: '#FFFFFF', strokeWidth: 2 },
  selected: { fill: '#E86F25', radius: 10, stroke: '#FFFFFF', strokeWidth: 3 },
  filtered: { fill: '#94A3B8', radius: 4, opacity: 0.3 },
};

export default function MapPanel({
  assets,
  selectedAssetIds = [],
  filteredAssetIds,
  onAssetSelect,
  onMapClick
}: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ lat: 40.7580, lng: -73.9860 });
  const [basemap, setBasemap] = useState('streets');
  
  // Pan/drag state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Selection state
  const [selectionTool, setSelectionTool] = useState<'box' | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Hover/click state
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'manhole' | 'pipe';
    id: string;
  } | null>(null);
  const [clickedItem, setClickedItem] = useState<{
    type: 'manhole' | 'pipe';
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  
  // Layer toggles
  const [layers, setLayers] = useState({
    sewerLines: true,
    manholes: true,
  });
  const [layersPanelCollapsed, setLayersPanelCollapsed] = useState(false);
  const [layersPopOutOpen, setLayersPopOutOpen] = useState(false);

  // Plot points state
  const [plotPoints, setPlotPoints] = useState<PlotPoint[]>([]);
  const [hoveredPlotPoint, setHoveredPlotPoint] = useState<string | null>(null);
  const [visibleGrades, setVisibleGrades] = useState<number[]>([0, 1, 2, 3, 4, 5]);

  // Get filtered asset IDs (if not provided, use all assets)
  const effectiveFilteredAssetIds = filteredAssetIds || assets.map(a => a.id);

  // Auto-zoom helper function
  const autoZoomToAssets = useCallback((assetIds: string[]) => {
    if (assetIds.length === 0) return;

    // Get all coordinates for these assets
    const coordinates: { lat: number; lng: number }[] = [];

    // Get pipes for these assets
    assetIds.forEach(assetId => {
      const pipe = getPipeSegmentByAssetId(assetId);
      if (pipe) {
        coordinates.push(...pipe.coordinates);
      }
    });

    // Get manholes for these assets
    assetIds.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        const upstreamMH = MOCK_MANHOLES.find(m => m.name === asset.upstreamMH);
        const downstreamMH = MOCK_MANHOLES.find(m => m.name === asset.downstreamMH);
        if (upstreamMH) coordinates.push(upstreamMH.coordinates);
        if (downstreamMH) coordinates.push(downstreamMH.coordinates);
      }
    });

    if (coordinates.length === 0) return;

    // Calculate bounds
    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate appropriate zoom level
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let newZoom = 15;
    if (maxDiff > 0.01) newZoom = 13;
    else if (maxDiff > 0.005) newZoom = 14;
    else if (maxDiff > 0.002) newZoom = 15;
    else if (maxDiff > 0.001) newZoom = 16;
    else newZoom = 17;

    setCenter({ lat: centerLat, lng: centerLng });
    setZoom(newZoom);
  }, [assets]);

  // Track previous values to avoid unnecessary zooms
  const prevFilteredRef = useRef<string>('');
  const prevSelectedRef = useRef<string>('');

  // AUTO-ZOOM: When filtered assets change
  useEffect(() => {
    const filteredKey = [...effectiveFilteredAssetIds].sort().join(',');
    if (filteredKey === prevFilteredRef.current) return;
    if (effectiveFilteredAssetIds.length === 0) return;
    
    prevFilteredRef.current = filteredKey;
    autoZoomToAssets(effectiveFilteredAssetIds);
  }, [effectiveFilteredAssetIds, autoZoomToAssets]);

  // AUTO-ZOOM: When selection changes (if user selected something)
  useEffect(() => {
    const selectedKey = [...selectedAssetIds].sort().join(',');
    if (selectedKey === prevSelectedRef.current) return;
    if (selectedAssetIds.length === 0) return;
    if (selectedAssetIds.length === effectiveFilteredAssetIds.length) return; // Don't zoom if all selected
    
    prevSelectedRef.current = selectedKey;
    autoZoomToAssets(selectedAssetIds);
  }, [selectedAssetIds, effectiveFilteredAssetIds.length, autoZoomToAssets]);

  // Generate plot points for selected assets
  useEffect(() => {
    if (selectedAssetIds.length === 0) {
      setPlotPoints([]);
      return;
    }

    const points: PlotPoint[] = [];
    
    selectedAssetIds.forEach(assetId => {
      const asset = assets.find(a => a.id === assetId);
      if (!asset || !asset.latestInspection) return;

      const pipe = getPipeSegmentByAssetId(assetId);
      if (!pipe || pipe.coordinates.length < 2) return;

      // Calculate pipe length
      const pipeLength = calculatePipeLength(
        pipe.coordinates.map(c => [c.lat, c.lng] as [number, number])
      );

      // Generate mock observations (based on observationCount)
      for (let i = 0; i < asset.observationCount; i++) {
        const distance = (i + 1) * 12; // 12', 24', 36', etc.
        const grade = Math.min(5, Math.max(0, Math.floor(Math.random() * 6))) as 0 | 1 | 2 | 3 | 4 | 5;
        
        // Calculate position along pipe
        const startCoords = pipe.coordinates[0];
        const endCoords = pipe.coordinates[pipe.coordinates.length - 1];
        const position = calculatePlotPosition(
          startCoords,
          endCoords,
          pipeLength,
          distance
        );

        points.push({
          id: `plot-${assetId}-${i}`,
          distance,
          code: ['TBD', 'CRK', 'ROOT', 'SAGG', 'DEP'][i % 5],
          grade,
          lat: position.lat,
          lng: position.lng,
          observationId: `obs-${assetId}-${i}`
        });
      }
    });

    setPlotPoints(points);
  }, [selectedAssetIds, assets]);

  // Convert lat/lng to canvas x/y
  const latLngToXY = useCallback((lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const width = canvas.width;
    const height = canvas.height;
    
    const x = ((lng - center.lng) * 10000 * zoom) + (width / 2) + panOffset.x;
    const y = ((center.lat - lat) * 10000 * zoom) + (height / 2) + panOffset.y;
    
    return { x, y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, panOffset]);

  // Draw map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw pipe segments
    if (layers.sewerLines) {
      MOCK_PIPE_SEGMENTS.forEach(pipe => {
        const isSelected = selectedAssetIds.includes(pipe.assetId);
        const isFiltered = !effectiveFilteredAssetIds.includes(pipe.assetId);
        const isHovered = hoveredItem?.type === 'pipe' && hoveredItem.id === pipe.id;

        if (isFiltered) return; // Don't draw filtered out items

        ctx.strokeStyle = isSelected ? PIPE_STYLES.selected.stroke : isHovered ? PIPE_STYLES.hover.stroke : PIPE_STYLES.default.stroke;
        ctx.lineWidth = isSelected ? PIPE_STYLES.selected.strokeWidth : isHovered ? PIPE_STYLES.hover.strokeWidth : PIPE_STYLES.default.strokeWidth;
        ctx.globalAlpha = PIPE_STYLES.default.opacity;

        ctx.beginPath();
        pipe.coordinates.forEach((coord, index) => {
          const { x, y } = latLngToXY(coord.lat, coord.lng);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // Draw manholes
    if (layers.manholes) {
      MOCK_MANHOLES.forEach(manhole => {
        // Check if any asset using this manhole is selected/filtered
        const relatedAssets = assets.filter(a => 
          a.upstreamMH === manhole.name || a.downstreamMH === manhole.name
        );
        const isInFiltered = relatedAssets.some(a => effectiveFilteredAssetIds.includes(a.id));
        const isSelected = relatedAssets.some(a => selectedAssetIds.includes(a.id));
        const isHovered = hoveredItem?.type === 'manhole' && hoveredItem.id === manhole.id;

        if (!isInFiltered) return;

        const { x, y } = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
        const style = isSelected ? MANHOLE_STYLES.selected : isHovered ? MANHOLE_STYLES.hover : MANHOLE_STYLES.default;
        const radius = style.radius;
        const opacity = 'opacity' in style ? (style.opacity as number) : 1;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = style.fill;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.strokeWidth;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // Draw plot points for selected assets
    const filteredPlotPoints = plotPoints.filter(p => visibleGrades.includes(p.grade));
    filteredPlotPoints.forEach(point => {
      const { x, y } = latLngToXY(point.lat, point.lng);
      const isHovered = hoveredPlotPoint === point.id;

      // Get color based on grade
      let color: string;
      if (point.grade <= 1) color = '#10b981'; // Green
      else if (point.grade === 2) color = '#fbbf24'; // Yellow
      else if (point.grade === 3) color = '#f97316'; // Orange
      else color = '#ef4444'; // Red

      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, isHovered ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw selection box
    if (selectionTool === 'box' && selectionStart && selectionEnd) {
      ctx.strokeStyle = '#3B82F6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const width = selectionEnd.x - selectionStart.x;
      const height = selectionEnd.y - selectionStart.y;

      ctx.fillRect(selectionStart.x, selectionStart.y, width, height);
      ctx.strokeRect(selectionStart.x, selectionStart.y, width, height);
      ctx.setLineDash([]);
    }
  }, [zoom, center, hoveredItem, selectedAssetIds, effectiveFilteredAssetIds, layers, selectionTool, selectionStart, selectionEnd, panOffset, latLngToXY, assets, plotPoints, visibleGrades, hoveredPlotPoint]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Box select mode
    if (selectionTool === 'box') {
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
      return;
    }

    // Check for plot point click
    const filteredPlotPoints = plotPoints.filter(p => visibleGrades.includes(p.grade));
    for (const point of filteredPlotPoints) {
      const pos = latLngToXY(point.lat, point.lng);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance <= 6) {
        // Navigate to inspection at this observation
        const asset = assets.find(a => selectedAssetIds.includes(a.id));
        if (asset?.latestInspection) {
          window.location.href = `/inspection/${asset.id}?observation=${point.observationId}`;
        }
        return;
      }
    }

    // Check for feature click
    const clickedFeature = detectFeatureAtPoint(x, y);
    if (clickedFeature) {
      setClickedItem({
        type: clickedFeature.type,
        id: clickedFeature.id,
        position: { x: e.clientX, y: e.clientY },
      });
      return;
    }

    // Start panning
    setIsPanning(true);
    setPanStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Panning
    if (isPanning && panStart) {
      const deltaX = x - panStart.x;
      const deltaY = y - panStart.y;
      
      setPanOffset({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY,
      });
      
      setPanStart({ x, y });
      return;
    }

    // Box select preview
    if (selectionTool === 'box' && selectionStart) {
      setSelectionEnd({ x, y });
      return;
    }

    // Hover detection for plot points
    const filteredPlotPoints = plotPoints.filter(p => visibleGrades.includes(p.grade));
    let hoveredPlot: string | null = null;
    for (const point of filteredPlotPoints) {
      const pos = latLngToXY(point.lat, point.lng);
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance <= 6) { // 6px radius for hover
        hoveredPlot = point.id;
        break;
      }
    }
    setHoveredPlotPoint(hoveredPlot);

    // Hover detection for features
    const hoveredFeature = detectFeatureAtPoint(x, y);
    setHoveredItem(hoveredFeature);
  };

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      
      // Convert pan offset to lat/lng offset and update center
      const latOffset = -panOffset.y / (10000 * zoom);
      const lngOffset = panOffset.x / (10000 * zoom);
      
      setCenter({
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      });
      
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    // Complete box selection
    if (selectionTool === 'box' && selectionStart && selectionEnd) {
      completeBoxSelection();
      return;
    }

    // If clicked on empty space (not panning, not selecting), call onMapClick
    if (e && !clickedItem) {
      onMapClick?.();
    }
  };

  // Feature detection
  const detectFeatureAtPoint = (x: number, y: number): { type: 'manhole' | 'pipe'; id: string } | null => {
    // Check manholes
    for (const manhole of MOCK_MANHOLES) {
      const relatedAssets = assets.filter(a => 
        a.upstreamMH === manhole.name || a.downstreamMH === manhole.name
      );
      if (!relatedAssets.some(a => effectiveFilteredAssetIds.includes(a.id))) continue;
      
      const pos = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 10) {
        return { type: 'manhole', id: manhole.id };
      }
    }

    // Check pipes
    for (const pipe of MOCK_PIPE_SEGMENTS) {
      if (!effectiveFilteredAssetIds.includes(pipe.assetId)) continue;
      
      const midPoint = pipe.coordinates[Math.floor(pipe.coordinates.length / 2)];
      const pos = latLngToXY(midPoint.lat, midPoint.lng);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 50) {
        return { type: 'pipe', id: pipe.id };
      }
    }

    return null;
  };

  // Complete box selection
  const completeBoxSelection = () => {
    if (!selectionStart || !selectionEnd) return;

    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const maxX = Math.max(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const maxY = Math.max(selectionStart.y, selectionEnd.y);

    const selectedIds: string[] = [];

    // Check manholes in box
    MOCK_MANHOLES.forEach(manhole => {
      const relatedAssets = assets.filter(a => 
        a.upstreamMH === manhole.name || a.downstreamMH === manhole.name
      );
      if (!relatedAssets.some(a => effectiveFilteredAssetIds.includes(a.id))) return;
      
      const pos = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
      if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
        relatedAssets.forEach(asset => {
          if (!selectedIds.includes(asset.id) && effectiveFilteredAssetIds.includes(asset.id)) {
            selectedIds.push(asset.id);
          }
        });
      }
    });

    // Check pipes in box
    MOCK_PIPE_SEGMENTS.forEach(pipe => {
      if (!effectiveFilteredAssetIds.includes(pipe.assetId)) return;
      
      const inBox = pipe.coordinates.some(coord => {
        const pos = latLngToXY(coord.lat, coord.lng);
        return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
      });
      
      if (inBox && !selectedIds.includes(pipe.assetId)) {
        selectedIds.push(pipe.assetId);
      }
    });

    onAssetSelect(selectedIds);
    setSelectionTool(null);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 10));

  // Clear selection
  const handleClearSelection = () => {
    setSelectionTool(null);
    setSelectionStart(null);
    setSelectionEnd(null);
    onAssetSelect([]);
  };

  // Cursor style
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (selectionTool === 'box') return 'crosshair';
    if (hoveredItem) return 'pointer';
    return 'grab';
  };

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawMap();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawMap]);

  // Redraw on changes
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Get clicked manhole or pipe for popup
  const clickedManhole = clickedItem?.type === 'manhole' 
    ? MOCK_MANHOLES.find(m => m.id === clickedItem.id)
    : null;
  const clickedPipe = clickedItem?.type === 'pipe'
    ? MOCK_PIPE_SEGMENTS.find(p => p.id === clickedItem.id)
    : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-neutral-100"
      role="application"
      aria-label="Asset map view"
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full"
        style={{ cursor: getCursorStyle() }}
      />

      {/* Map Search - top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <MapSearch
          onAssetSelect={(asset) => {
            // Navigate map to asset location
            setCenter({ lat: asset.lat, lng: asset.lng });
            setZoom(17);
            
            // Check if asset exists in current table
            const existingAsset = assets.find(a => 
              a.pipeSegment === asset.name || 
              a.upstreamMH === asset.name || 
              a.downstreamMH === asset.name
            );
            
            if (existingAsset) {
              // Highlight row in table
              onAssetSelect([existingAsset.id]);
            } else {
              // Show "Create Work Order" option (could be a toast or modal)
              console.log(`Asset ${asset.name} not in current table. Create Work Order?`);
            }
          }}
        />
        
        {/* Basemap Selector */}
        <Select value={basemap} onValueChange={setBasemap}>
          <SelectTrigger className="w-36 bg-white shadow-md">
            <Layers className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="streets">Streets</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="topo">Topographic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Layer Controls */}
      {!layersPanelCollapsed ? (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-md border border-neutral-200 z-10">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200">
            <Label className="text-sm font-semibold text-neutral-700">Layers</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setLayersPopOutOpen(true)}
                title="Pop out layers panel"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setLayersPanelCollapsed(true)}
                title="Collapse layers panel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="px-3 py-2.5 space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="layer-sewer"
                checked={layers.sewerLines}
                onCheckedChange={(checked) =>
                  setLayers({ ...layers, sewerLines: checked as boolean })
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              <Label htmlFor="layer-sewer" className="text-sm font-medium cursor-pointer select-none">
                SewerLines_All
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="layer-manholes"
                checked={layers.manholes}
                onCheckedChange={(checked) =>
                  setLayers({ ...layers, manholes: checked as boolean })
                }
                className="h-4 w-4 rounded border-neutral-300"
              />
              <Label htmlFor="layer-manholes" className="text-sm font-medium cursor-pointer select-none">
                Manholes_All
              </Label>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-20 right-4 bg-white shadow-md z-10 h-9 w-9"
          onClick={() => setLayersPanelCollapsed(false)}
          title="Expand layers panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Pop-out Layers Window */}
      {layersPopOutOpen && typeof window !== 'undefined' && (
        <LayersPopOutWindow
          layers={layers}
          onLayersChange={setLayers}
          onClose={() => setLayersPopOutOpen(false)}
        />
      )}

      {/* Integrated Map Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 px-2 py-2 flex items-center gap-2">
          {/* Zoom Controls Section */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-7 h-7 flex items-center justify-center bg-white rounded border border-neutral-200 hover:bg-neutral-50 transition-colors"
              aria-label="Zoom in"
            >
              <span className="text-base font-medium text-neutral-700">+</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="w-7 h-7 flex items-center justify-center bg-white rounded border border-neutral-200 hover:bg-neutral-50 transition-colors"
              aria-label="Zoom out"
            >
              <span className="text-base font-medium text-neutral-700">−</span>
            </button>
            <div className="px-2 text-xs font-medium text-neutral-600">
              Zoom: {zoom}
            </div>
          </div>

          <div className="w-px h-6 bg-neutral-200" />

          {/* Box Select */}
          <Button
            variant={selectionTool === 'box' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setSelectionTool(selectionTool === 'box' ? null : 'box');
              setSelectionStart(null);
              setSelectionEnd(null);
            }}
            className={`h-8 px-3 ${selectionTool === 'box' ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}`}
          >
            <Square className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Box Select</span>
          </Button>

          {/* Clear (conditional) */}
          {(selectionTool || selectedAssetIds.length > 0) && (
            <>
              <div className="w-px h-6 bg-neutral-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-8 px-3 hover:bg-red-50 text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Clear</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Map Info */}
      <div className="absolute bottom-8 right-4 bg-white rounded-lg shadow-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 z-10">
        <span>{effectiveFilteredAssetIds.length} assets loaded</span>
        {selectedAssetIds.length > 0 && (
          <span className="text-neutral-500"> • {selectedAssetIds.length} selected</span>
        )}
      </div>

      {/* Popups */}
      {clickedManhole && clickedItem && (
        <ManholePopup
          manhole={clickedManhole}
          position={clickedItem.position}
          onClose={() => setClickedItem(null)}
        />
      )}
      
      {clickedPipe && clickedItem && (
        <PipeSegmentPopup
          pipe={clickedPipe}
          position={clickedItem.position}
          onClose={() => setClickedItem(null)}
        />
      )}
    </div>
  );
}
