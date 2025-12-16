'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Square, X, Search, MapPin, ChevronDownIcon, Settings, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Asset, FilterConfig, PlotPoint } from '@/lib/types/asset-list';
import { MOCK_MANHOLES, MOCK_PIPE_SEGMENTS, getPipeSegmentByAssetId } from '@/lib/mock-data/mockMapData';
import { calculatePlotPosition, calculatePipeLength } from '@/lib/utils/map-utils';
import { type NetworkAsset } from './MapSearch';
import ManholePopup from './ManholePopup';
import PipeSegmentPopup from './PipeSegmentPopup';

interface MapPanelProps {
  assets: Asset[];
  selectedAssetIds?: string[];
  filteredAssetIds?: string[];
  onAssetSelect: (assetIds: string[]) => void;
  onMapClick?: () => void;
  filters?: FilterConfig[];
  onPlotPointClick?: (observationId: string) => void;
  onPipeClick?: (assetId: string) => void;
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
  onMapClick,
  onPlotPointClick,
  onPipeClick
}: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const lastCanvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const resizeTimeoutRef = useRef<number | null>(null);
  const [mapAreaBounds, setMapAreaBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ lat: 40.7580, lng: -73.9860 });
  const [basemap, setBasemap] = useState('streets');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<NetworkAsset[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [displayOptions, setDisplayOptions] = useState({
    showLabels: true,
    showAssetIds: false,
  });
  
  // Pan/drag state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  // Sync panOffset ref with state
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);
  const [clickedOnFeature, setClickedOnFeature] = useState(false); // Track if we clicked on a feature
  
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
    heatMap: true, // Heat map overlay for selected assets
  });

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

      // Generate mock observations with random distribution along pipe segment
      // Create random distances with minimum spacing to avoid clustering
      const minSpacing = Math.max(10, pipeLength / (asset.observationCount * 2)); // Minimum 10 feet or pipeLength / (count * 2)
      const distances: number[] = [];
      
      // Generate random distances ensuring minimum spacing
      for (let i = 0; i < asset.observationCount; i++) {
        let distance: number;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
          // Random position along pipe, but avoid very start/end (first and last 5%)
          const startBuffer = pipeLength * 0.05;
          const endBuffer = pipeLength * 0.05;
          const availableLength = pipeLength - startBuffer - endBuffer;
          distance = startBuffer + Math.random() * availableLength;
          attempts++;
        } while (
          attempts < maxAttempts &&
          distances.some(d => Math.abs(d - distance) < minSpacing)
        );
        
        distances.push(distance);
      }
      
      // Sort distances to maintain order along pipe
      distances.sort((a, b) => a - b);
      
      // Generate points at these random distances
      distances.forEach((distance, i) => {
        const grade = Math.min(5, Math.max(0, Math.floor(Math.random() * 6))) as 0 | 1 | 2 | 3 | 4 | 5;
        
        // Calculate position along pipe using all coordinates
        const position = calculatePlotPosition(
          pipe.coordinates,
          pipeLength,
          distance
        );

        points.push({
          id: `plot-${assetId}-${i}`,
          distance: Math.round(distance),
          code: ['TBD', 'CRK', 'ROOT', 'SAGG', 'DEP'][i % 5],
          grade,
          lat: position.lat,
          lng: position.lng,
          observationId: `obs-${assetId}-${i}`
        });
      });
    });

    setPlotPoints(points);
  }, [selectedAssetIds, assets]);

  // Convert lat/lng to canvas x/y
  const latLngToXY = useCallback((lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Use ref to get current panOffset (updated during resize) or fallback to state
    const currentPanOffset = panOffsetRef.current;
    
    const x = ((lng - center.lng) * 10000 * zoom) + (width / 2) + currentPanOffset.x;
    const y = ((center.lat - lat) * 10000 * zoom) + (height / 2) + currentPanOffset.y;
    
    return { x, y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom]);

  // Draw heat map overlay for pipe segments with plot points
  const drawHeatMapOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!layers.heatMap) {
      console.log('Heat map disabled');
      return;
    }
    if (plotPoints.length === 0) {
      console.log('No plot points');
      return;
    }

    // Use all plot points (not just selected) for heat map
    // This shows heat map for all assets that have observations
    const allPlotPoints = plotPoints.filter(p => visibleGrades.includes(p.grade));
    
    console.log('Heat map - plot points:', plotPoints.length, 'filtered:', allPlotPoints.length);
    
    if (allPlotPoints.length === 0) {
      console.log('No plot points after filtering');
      return;
    }

    // Group plot points by pipe segment
    const pointsByPipe = new Map<string, typeof plotPoints>();
    allPlotPoints.forEach(point => {
      const assetIdMatch = point.observationId.match(/^obs-(.+?)-/);
      if (!assetIdMatch) return;
      const assetId = assetIdMatch[1];
      
      if (!pointsByPipe.has(assetId)) {
        pointsByPipe.set(assetId, []);
      }
      pointsByPipe.get(assetId)!.push(point);
    });

    // Draw heat map for each selected pipe segment
    pointsByPipe.forEach((points, assetId) => {
      const pipe = getPipeSegmentByAssetId(assetId);
      if (!pipe || pipe.coordinates.length < 2) {
        console.log('No pipe found for asset:', assetId);
        return;
      }
      
      console.log('Drawing heat map for asset:', assetId, 'points:', points.length);

      // Calculate pipe length
      const pipeLength = calculatePipeLength(
        pipe.coordinates.map(c => [c.lat, c.lng] as [number, number])
      );

      // Create heat map segments along pipe
      // Use more segments for smoother gradient
      const segmentCount = Math.max(20, Math.min(100, Math.floor(pipeLength / 5))); // At least 20, max 100, or one per 5 feet
      const segmentLength = pipeLength / segmentCount;

      console.log('Pipe length:', pipeLength, 'Segment count:', segmentCount, 'Segment length:', segmentLength);
      console.log('Plot points distances:', points.map(p => p.distance));

      // Calculate heat intensity for each segment
      const heatSegments: Array<{ distance: number; intensity: number; maxGrade: number }> = [];
      
      for (let i = 0; i < segmentCount; i++) {
        const segmentStart = i * segmentLength;
        const segmentEnd = (i + 1) * segmentLength;
        const segmentCenter = (segmentStart + segmentEnd) / 2;

        // Find points in this segment (with larger overlap for smooth transition)
        const nearbyPoints = points.filter(p => {
          const distance = Math.abs(p.distance - segmentCenter);
          return distance < segmentLength * 2; // Larger overlap
        });

        if (nearbyPoints.length > 0) {
          // Calculate weighted intensity based on distance and grade
          let totalIntensity = 0;
          let totalWeight = 0;
          let maxGrade = 0;

          nearbyPoints.forEach(point => {
            const distance = Math.abs(point.distance - segmentCenter);
            const weight = Math.max(0, 1 - (distance / (segmentLength * 2)));
            // Higher grade = higher intensity
            const intensity = (point.grade / 5) * weight;
            totalIntensity += intensity;
            totalWeight += weight;
            maxGrade = Math.max(maxGrade, point.grade);
          });

          const avgIntensity = totalWeight > 0 ? totalIntensity / totalWeight : 0;
          heatSegments.push({
            distance: segmentCenter,
            intensity: Math.min(1, avgIntensity),
            maxGrade
          });
        } else if (i === 0 || i === segmentCount - 1) {
          // Always add segments at start and end, even if no points nearby
          // This ensures heat map covers the entire pipe
          heatSegments.push({
            distance: segmentCenter,
            intensity: 0.1, // Low intensity for empty segments
            maxGrade: 0
          });
        }
      }
      
      console.log('Generated heat segments:', heatSegments.length);

      // Draw heat map as a thick overlay along the entire pipe segment
      console.log('Heat segments for asset', assetId, ':', heatSegments.length);
      if (heatSegments.length > 0) {
        console.log('Drawing heat map for', assetId, 'with', heatSegments.length, 'segments');
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw heat map along the entire pipe path with gradient
        const heatMapWidth = 30; // Very thick to be clearly visible - increased from 25
        
        // Build the pipe path
        const pipePath: { x: number; y: number; distance: number }[] = [];
        let cumulativeDist = 0;
        
        pipe.coordinates.forEach((coord, index) => {
          const xy = latLngToXY(coord.lat, coord.lng);
          if (index > 0) {
            const prevCoord = pipe.coordinates[index - 1];
            const segmentDist = calculatePipeLength([
              [prevCoord.lat, prevCoord.lng],
              [coord.lat, coord.lng]
            ]);
            cumulativeDist += segmentDist;
          }
          pipePath.push({ x: xy.x, y: xy.y, distance: cumulativeDist });
        });

        // Draw heat map segments along the path
        for (let i = 0; i < pipePath.length - 1; i++) {
          const startPoint = pipePath[i];
          const endPoint = pipePath[i + 1];
          const segmentCenterDist = (startPoint.distance + endPoint.distance) / 2;
          
          // Find the dominant grade/color for this segment
          let maxGrade = 0;
          let maxIntensity = 0;
          
          heatSegments.forEach(segment => {
            const distDiff = Math.abs(segment.distance - segmentCenterDist);
            const influenceRadius = pipeLength * 0.15; // 15% of pipe length
            if (distDiff < influenceRadius) {
              const weight = 1 - (distDiff / influenceRadius);
              if (segment.maxGrade > maxGrade || (segment.maxGrade === maxGrade && segment.intensity * weight > maxIntensity)) {
                maxGrade = segment.maxGrade;
                maxIntensity = segment.intensity * weight;
              }
            }
          });
          
          // Get color based on max grade
          let color: string;
          if (maxGrade <= 1) color = '#10b981'; // Green
          else if (maxGrade === 2) color = '#fbbf24'; // Yellow
          else if (maxGrade === 3) color = '#f97316'; // Orange
          else color = '#ef4444'; // Red
          
          // Calculate opacity based on intensity - make it very visible
          const opacity = Math.max(0.9, 0.7 + (maxIntensity * 0.2));
          
          ctx.strokeStyle = color;
          ctx.lineWidth = heatMapWidth;
          ctx.globalAlpha = opacity;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();
          
          // Debug: draw a test line to verify drawing works
          if (i === 0) {
            console.log('First heat map segment:', startPoint, endPoint, color, opacity);
          }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
        console.log('Finished drawing heat map for', assetId);
      } else {
        console.log('No heat segments to draw for', assetId);
      }
    });
    
    console.log('Heat map overlay complete, processed', pointsByPipe.size, 'pipes');
  }, [layers.heatMap, plotPoints, visibleGrades, latLngToXY]);

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

    // Draw pipe segments first
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

        // Draw labels and asset IDs if enabled
        if (displayOptions.showLabels || displayOptions.showAssetIds) {
          // Find midpoint of pipe for label placement
          const midIndex = Math.floor(pipe.coordinates.length / 2);
          const midCoord = pipe.coordinates[midIndex];
          const { x, y } = latLngToXY(midCoord.lat, midCoord.lng);
          
          ctx.save();
          ctx.fillStyle = '#1F2937';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          let labelText = '';
          if (displayOptions.showLabels) {
            const asset = assets.find(a => a.id === pipe.assetId);
            if (asset?.pipeSegment) {
              labelText = asset.pipeSegment;
            }
          }
          if (displayOptions.showAssetIds) {
            if (labelText) labelText += ` (${pipe.assetId})`;
            else labelText = pipe.assetId;
          }
          
          if (labelText) {
            // Draw text with white background for readability
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - ctx.measureText(labelText).width / 2 - 4, y - 8, ctx.measureText(labelText).width + 8, 16);
            ctx.fillStyle = '#1F2937';
            ctx.fillText(labelText, x, y);
          }
          ctx.restore();
        }
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

        // Draw labels if enabled
        if (displayOptions.showLabels) {
          ctx.save();
          ctx.fillStyle = '#1F2937';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(manhole.name, x, y + radius + 4);
          ctx.restore();
        }
      });
    }

    // Draw heat map overlay (after pipe segments, before plot points)
    drawHeatMapOverlay(ctx);

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
  }, [zoom, center, hoveredItem, selectedAssetIds, effectiveFilteredAssetIds, layers, selectionTool, selectionStart, selectionEnd, panOffset, latLngToXY, assets, plotPoints, visibleGrades, hoveredPlotPoint, drawHeatMapOverlay, displayOptions]);

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
        // Mark that we clicked on a feature to prevent onMapClick
        setClickedOnFeature(true);
        // Highlight snapshot in snapshots panel instead of navigating
        if (onPlotPointClick) {
          onPlotPointClick(point.observationId);
        }
        // Reset flag after a short delay
        setTimeout(() => setClickedOnFeature(false), 100);
        return;
      }
    }

    // Check for feature click
    const clickedFeature = detectFeatureAtPoint(x, y);
    if (clickedFeature) {
      // Mark that we clicked on a feature to prevent onMapClick in handleMouseUp
      setClickedOnFeature(true);
      
      // If clicked on pipe segment, trigger pipe click callback
      if (clickedFeature.type === 'pipe' && onPipeClick) {
        // Find assetId for this pipe
        const pipe = MOCK_PIPE_SEGMENTS.find(p => p.id === clickedFeature.id);
        if (pipe && pipe.assetId) {
          onPipeClick(pipe.assetId);
          // Reset flag after a short delay to allow state updates
          setTimeout(() => setClickedOnFeature(false), 100);
          return;
        }
      }
      
      // For manholes, show popup as before
      setClickedItem({
        type: clickedFeature.type,
        id: clickedFeature.id,
        position: { x: e.clientX, y: e.clientY },
      });
      // Reset flag after a short delay
      setTimeout(() => setClickedOnFeature(false), 100);
      return;
    }

    // Not a feature click, reset flag
    setClickedOnFeature(false);

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
      // Invert signs: when dragging right, center moves left (negative lng)
      // When dragging down, center moves up (positive lat)
      const latOffset = panOffset.y / (10000 * zoom);
      const lngOffset = -panOffset.x / (10000 * zoom);
      
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

    // If clicked on empty space (not panning, not selecting, not a feature), call onMapClick
    // But only for actual mouseup events, not mouseLeave
    if (e && e.type === 'mouseup' && !clickedItem && !clickedOnFeature) {
      onMapClick?.();
    }
    
    // Reset feature click flag
    if (!isPanning) {
      setClickedOnFeature(false);
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

    // Check pipes - check distance to entire pipe line, not just midpoint
    for (const pipe of MOCK_PIPE_SEGMENTS) {
      if (!effectiveFilteredAssetIds.includes(pipe.assetId)) continue;
      
      // Check distance to each segment of the pipe
      for (let i = 0; i < pipe.coordinates.length - 1; i++) {
        const startCoord = pipe.coordinates[i];
        const endCoord = pipe.coordinates[i + 1];
        const startXY = latLngToXY(startCoord.lat, startCoord.lng);
        const endXY = latLngToXY(endCoord.lat, endCoord.lng);
        
        // Calculate distance from point to line segment
        const A = x - startXY.x;
        const B = y - startXY.y;
        const C = endXY.x - startXY.x;
        const D = endXY.y - startXY.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx: number, yy: number;
        
        if (param < 0) {
          xx = startXY.x;
          yy = startXY.y;
        } else if (param > 1) {
          xx = endXY.x;
          yy = endXY.y;
        } else {
          xx = startXY.x + param * C;
          yy = startXY.y + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Clickable area: 15 pixels from the line
        if (distance <= 15) {
        return { type: 'pipe', id: pipe.id };
        }
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

  // Resize canvas to match map area container
  useEffect(() => {
    const canvas = canvasRef.current;
    const mapArea = mapAreaRef.current;
    if (!canvas || !mapArea) return;

    const resizeCanvas = () => {
      const rect = mapArea.getBoundingClientRect();
      // Ensure canvas never exceeds container width
      const maxWidth = rect.width;
      const maxHeight = rect.height;
      const newWidth = Math.floor(Math.min(maxWidth, mapArea.clientWidth || maxWidth));
      const newHeight = Math.floor(Math.min(maxHeight, mapArea.clientHeight || maxHeight));
      const oldWidth = lastCanvasSizeRef.current.width;
      const oldHeight = lastCanvasSizeRef.current.height;
      
      // Only resize if dimensions actually changed (with threshold to avoid tiny changes)
      if (Math.abs(newWidth - oldWidth) > 1 || Math.abs(newHeight - oldHeight) > 1) {
        // Update canvas size first - ensure it never exceeds container
        canvas.width = newWidth;
        canvas.height = newHeight;
        // Also set CSS width/height to ensure it doesn't scale
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
        
        // Compensate panOffset to keep the same view when resizing
        // This prevents the map from "jumping" when the container resizes
        if (oldWidth > 0 && oldHeight > 0) {
          const widthRatio = newWidth / oldWidth;
          const heightRatio = newHeight / oldHeight;
          
          // Only update panOffset if ratio is significantly different from 1
          if (Math.abs(widthRatio - 1) > 0.01 || Math.abs(heightRatio - 1) > 0.01) {
            // Update ref immediately for use in drawMap
            panOffsetRef.current = {
              x: panOffsetRef.current.x * widthRatio,
              y: panOffsetRef.current.y * heightRatio
            };
            
            // Update state asynchronously to avoid infinite loop
            setTimeout(() => {
              setPanOffset(panOffsetRef.current);
            }, 0);
          }
        }
        
        // Update ref to track current size
        lastCanvasSizeRef.current = { width: newWidth, height: newHeight };
        
        // Redraw after a small delay to let panOffset update settle
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
      drawMap();
          });
        });
      }
    };

    // Update map area bounds for floating controls positioning
    const updateMapAreaBounds = () => {
      if (mapAreaRef.current) {
        const rect = mapAreaRef.current.getBoundingClientRect();
        setMapAreaBounds({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    resizeCanvas();
    updateMapAreaBounds();
    
    // Use ResizeObserver for better performance with debouncing
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize to avoid too many redraws and infinite loops
      if (resizeTimeoutRef.current !== null) {
        cancelAnimationFrame(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = requestAnimationFrame(() => {
        resizeCanvas();
        updateMapAreaBounds();
        resizeTimeoutRef.current = null;
      });
    });
    resizeObserver.observe(mapArea);
    
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('resize', updateMapAreaBounds);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', updateMapAreaBounds);
      if (resizeTimeoutRef.current !== null) {
        cancelAnimationFrame(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [drawMap]);

  // Redraw on changes - use requestAnimationFrame to avoid issues during hover
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
    drawMap();
    });
    return () => cancelAnimationFrame(rafId);
  }, [drawMap]);

  // Get clicked manhole or pipe for popup
  const clickedManhole = clickedItem?.type === 'manhole' 
    ? MOCK_MANHOLES.find(m => m.id === clickedItem.id)
    : null;
  const clickedPipe = clickedItem?.type === 'pipe'
    ? MOCK_PIPE_SEGMENTS.find(p => p.id === clickedItem.id)
    : null;

  // Handle map search
  const handleMapSearch = (query: string) => {
    setMapSearchQuery(query);
    if (!query.trim()) {
      setMapSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Mock search - in real app this would query ESRI database
    const q = query.toLowerCase();
    const mockResults: NetworkAsset[] = [
      { id: 'net-1', name: 'S-104', type: 'pipe' as const, address: 'Main St', lat: 40.7580, lng: -73.9860 },
      { id: 'net-2', name: 'S-105', type: 'pipe' as const, address: 'Main St', lat: 40.7585, lng: -73.9865 },
      { id: 'net-3', name: 'MH-234', type: 'manhole' as const, address: 'Oak Ave', lat: 40.7590, lng: -73.9870 },
    ].filter(asset => 
      asset.name.toLowerCase().includes(q) ||
      asset.address?.toLowerCase().includes(q)
    );
    
    setMapSearchResults(mockResults);
    setShowSearchResults(mockResults.length > 0);
  };

  const handleMapSearchSelect = (asset: NetworkAsset) => {
            // Navigate map to asset location
            setCenter({ lat: asset.lat, lng: asset.lng });
            setZoom(17);
    setMapSearchQuery('');
    setShowSearchResults(false);
            
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
  };

  // Calculate active layers count
  const activeLayersCount = Object.values(layers).filter(Boolean).length;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-neutral-100 flex flex-col overflow-visible"
      role="application"
      aria-label="Asset map view"
      style={{ minWidth: 0, maxWidth: '100%' }}
    >
      {/* Map Area - Canvas with floating controls */}
      <div ref={mapAreaRef} className="flex-1 relative min-h-0 min-w-0" style={{ maxWidth: '100%', overflow: 'visible' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          // Only handle mouse leave for panning/selection, don't trigger onMapClick
          if (isPanning) {
            handleMouseUp(e);
          } else if (selectionTool === 'box' && selectionStart && selectionEnd) {
            handleMouseUp(e);
          }
          // Don't call onMapClick on mouseLeave - it causes deselection when hovering over snapshots panel
        }}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: getCursorStyle(), maxWidth: '100%', display: 'block', zIndex: 1 }}
        />

        {/* Floating Controls Layer - Overlay on top of canvas */}
        <div className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
          {/* Floating Search Pill - Top Left */}
          <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="relative w-[280px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              value={mapSearchQuery}
              onChange={(e) => handleMapSearch(e.target.value)}
              onFocus={() => setShowSearchResults(mapSearchResults.length > 0)}
              placeholder="Search city network..."
              className="h-11 pl-11 pr-10 rounded-full bg-white shadow-md border-0 focus:border-2 focus:border-blue-600 focus:shadow-[0_4px_12px_rgba(59,130,246,0.25)] transition-all"
            />
            {mapSearchQuery && (
              <button
                onClick={() => {
                  setMapSearchQuery('');
                  setMapSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchResults && mapSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                {mapSearchResults.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => handleMapSearchSelect(asset)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {asset.name}
                      </div>
                      {asset.address && (
                        <div className="text-xs text-neutral-500 truncate">
                          {asset.address}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
      </div>

          {/* Floating Settings Button - Top Right */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="absolute top-4 right-4 pointer-events-auto w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="Map settings"
            >
              <Settings className="h-5 w-5 text-neutral-700" />
            </button>
          </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 space-y-4">
            {/* Base Map Section - Google Maps style buttons */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Base Map</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setBasemap('streets');
                  }}
                  className={`h-20 px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    basemap === 'streets'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                    🗺️
            </div>
                  <span className="text-xs font-medium text-neutral-700">Streets</span>
                </button>
                <button
                  onClick={() => {
                    setBasemap('satellite');
                  }}
                  className={`h-20 px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    basemap === 'satellite'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                    🛰️
          </div>
                  <span className="text-xs font-medium text-neutral-700">Satellite</span>
                </button>
                <button
                  onClick={() => {
                    setBasemap('hybrid');
                  }}
                  className={`h-20 px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    basemap === 'hybrid'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                    🗺️🛰️
                  </div>
                  <span className="text-xs font-medium text-neutral-700">Hybrid</span>
                </button>
                <button
                  onClick={() => {
                    setBasemap('topo');
                  }}
                  className={`h-20 px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    basemap === 'topo'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center text-xs font-semibold">
                    ⛰️
                  </div>
                  <span className="text-xs font-medium text-neutral-700">Terrain</span>
                </button>
              </div>
            </div>

            {/* Layers Section */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Layers</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
              <Checkbox
                    id="settings-layer-sewer"
                checked={layers.sewerLines}
                onCheckedChange={(checked) =>
                  setLayers({ ...layers, sewerLines: checked as boolean })
                }
                    className="h-5 w-5"
              />
                  <Label htmlFor="settings-layer-sewer" className="text-sm font-normal cursor-pointer">
                SewerLines_All
              </Label>
            </div>
                <div className="flex items-center space-x-2">
              <Checkbox
                    id="settings-layer-manholes"
                checked={layers.manholes}
                onCheckedChange={(checked) =>
                  setLayers({ ...layers, manholes: checked as boolean })
                }
                    className="h-5 w-5"
              />
                  <Label htmlFor="settings-layer-manholes" className="text-sm font-normal cursor-pointer">
                Manholes_All
              </Label>
            </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-layer-heatmap"
                    checked={layers.heatMap}
                    onCheckedChange={(checked) =>
                      setLayers({ ...layers, heatMap: checked as boolean })
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor="settings-layer-heatmap" className="text-sm font-normal cursor-pointer">
                    Heat Map (Grades)
                  </Label>
          </div>
        </div>
        <Button
                variant="ghost"
                className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  // TODO: Open add layer dialog
                  console.log('Add layer clicked');
                }}
              >
                + Add Layer
        </Button>
            </div>

            {/* Display Section */}
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-3">Display</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="display-labels"
                    checked={displayOptions.showLabels}
                    onCheckedChange={(checked) =>
                      setDisplayOptions({ ...displayOptions, showLabels: checked as boolean })
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor="display-labels" className="text-sm font-normal cursor-pointer">
                    Show labels
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="display-asset-ids"
                    checked={displayOptions.showAssetIds}
                    onCheckedChange={(checked) =>
                      setDisplayOptions({ ...displayOptions, showAssetIds: checked as boolean })
                    }
                    className="h-5 w-5"
                  />
                  <Label htmlFor="display-asset-ids" className="text-sm font-normal cursor-pointer">
                    Show asset IDs
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

          {/* Floating Zoom + Box Select Stack - Right Side */}
          <div className="absolute right-4 top-[76px] pointer-events-auto w-11 bg-white rounded-lg shadow-md overflow-hidden">
          {/* Zoom In */}
            <button
              onClick={handleZoomIn}
            className="w-11 h-11 flex items-center justify-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
              aria-label="Zoom in"
            >
            <span className="text-lg font-medium text-neutral-700">+</span>
            </button>
          
          {/* Zoom Level Display */}
          <div className="w-11 h-11 flex items-center justify-center border-b border-neutral-200 text-sm font-medium text-neutral-700">
            {zoom}
          </div>
          
          {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
            className="w-11 h-11 flex items-center justify-center border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
              aria-label="Zoom out"
            >
            <span className="text-lg font-medium text-neutral-700">−</span>
            </button>

          {/* Box Select */}
          <button
            onClick={() => {
              setSelectionTool(selectionTool === 'box' ? null : 'box');
              setSelectionStart(null);
              setSelectionEnd(null);
            }}
            className={`w-11 h-11 flex items-center justify-center border-b border-neutral-200 transition-colors ${
              selectionTool === 'box'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'hover:bg-neutral-50 text-neutral-700'
            }`}
            aria-label="Box select"
          >
            <Square className="h-5 w-5" />
          </button>
          
          {/* Cancel Button - Only visible when Box Select is active */}
          {selectionTool === 'box' && (
            <button
              onClick={() => {
                setSelectionTool(null);
                setSelectionStart(null);
                setSelectionEnd(null);
              }}
              className="w-11 h-11 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Cancel box select"
            >
              <X className="h-5 w-5" />
            </button>
          )}
      </div>

          {/* Status Chip - Bottom Left (Floating) */}
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <div className="px-3 py-1.5 rounded-md bg-black/50 text-white text-[13px] font-medium shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
              {selectionTool === 'box' && (selectionStart || selectionEnd) ? (
                'Selecting...'
              ) : selectedAssetIds.length > 0 ? (
                `${selectedAssetIds.length} selected`
              ) : (
                `${effectiveFilteredAssetIds.length} assets`
              )}
            </div>
          </div>
        </div>
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
