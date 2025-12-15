# 🗺️ MAP PANEL - Final Simplified Version

**Task:** Implement clean map panel with auto-zoom, integrated zoom controls in toolbar, and minimal UI

---

## 🎯 KEY CHANGES

### Removed Features:
- ❌ "Fit" button (replaced with auto-zoom)
- ❌ "Center" button (replaced with auto-zoom)
- ❌ Polygon Select (not needed for MVP)
- ❌ Separate zoom controls (moved to toolbar)

### New Features:
- ✅ **Auto-zoom on filter change** - map automatically zooms to filtered assets
- ✅ **Auto-zoom on selection** - map automatically centers on selected assets
- ✅ **Integrated toolbar** - zoom controls + box select + clear in one place
- ✅ **Simplified UX** - fewer buttons, clearer purpose

---

## 📐 FINAL LAYOUT

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│ BASEMAP SELECTOR (top-right)                          │
│ [Streets ▾]                                            │
│                                                        │
│ LAYER CONTROLS (top-right, below basemap)             │
│ ☑ SewerLines_All   ☑ Manholes_All                     │
│                                                        │
│                                                        │
│ MAP CANVAS                                             │
│ [Placeholder: ESRI Map Integration]                   │
│ [Grid background with sewer lines and manholes]       │
│                                                        │
│                                                        │
│ MAP TOOLBAR (bottom-center, floating style)           │
│ ┌────────────────────────────────────────────────┐    │
│ │ [+][-] Zoom: 14 | [Box Select] | [Clear]      │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ MAP INFO (bottom-right)                               │
│ 30 assets loaded • 12 selected                        │
└────────────────────────────────────────────────────────┘
```

---

## 💻 IMPLEMENTATION

### Main Component Structure

**File:** `components/asset-list/MapPanel.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MOCK_MANHOLES, MOCK_PIPE_SEGMENTS } from '@/data/mockMapData';

interface MapPanelProps {
  selectedAssetIds: string[];
  filteredAssetIds: string[];
  onAssetSelect: (assetIds: string[]) => void;
}

export default function MapPanel({
  selectedAssetIds,
  filteredAssetIds,
  onAssetSelect
}: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Map state
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ lat: 40.7580, lng: -73.9860 });
  
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

  // AUTO-ZOOM: When filtered assets change
  useEffect(() => {
    if (filteredAssetIds.length === 0) return;
    
    autoZoomToAssets(filteredAssetIds);
  }, [filteredAssetIds]);

  // AUTO-ZOOM: When selection changes (if user selected something)
  useEffect(() => {
    if (selectedAssetIds.length === 0) return;
    if (selectedAssetIds.length === filteredAssetIds.length) return; // Don't zoom if all selected
    
    autoZoomToAssets(selectedAssetIds);
  }, [selectedAssetIds]);

  // Auto-zoom helper function
  const autoZoomToAssets = (assetIds: string[]) => {
    if (assetIds.length === 0) return;

    // Get all coordinates for these assets
    const coordinates: { lat: number; lng: number }[] = [];

    // Get manholes
    assetIds.forEach(id => {
      const manhole = MOCK_MANHOLES.find(m => m.id === id);
      if (manhole) {
        coordinates.push(manhole.coordinates);
      }

      const pipe = MOCK_PIPE_SEGMENTS.find(p => p.id === id);
      if (pipe) {
        coordinates.push(...pipe.coordinates);
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
  };

  // Convert lat/lng to canvas x/y
  const latLngToXY = (lat: number, lng: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const width = canvas.width;
    const height = canvas.height;
    
    const x = ((lng - center.lng) * 10000 * zoom) + (width / 2) + panOffset.x;
    const y = ((center.lat - lat) * 10000 * zoom) + (height / 2) + panOffset.y;
    
    return { x, y };
  };

  // Draw map
  const drawMap = () => {
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
        const isSelected = selectedAssetIds.includes(pipe.id);
        const isFiltered = !filteredAssetIds.includes(pipe.id);
        const isHovered = hoveredItem?.type === 'pipe' && hoveredItem.id === pipe.id;

        if (isFiltered) return; // Don't draw filtered out items

        ctx.strokeStyle = isSelected ? '#E86F25' : isHovered ? '#1D4ED8' : '#2563EB';
        ctx.lineWidth = isSelected ? 5 : isHovered ? 4 : 3;
        ctx.globalAlpha = 0.8;

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
        const isSelected = selectedAssetIds.includes(manhole.id);
        const isFiltered = !filteredAssetIds.includes(manhole.id);
        const isHovered = hoveredItem?.type === 'manhole' && hoveredItem.id === manhole.id;

        if (isFiltered) return;

        const { x, y } = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
        const radius = isSelected ? 10 : isHovered ? 8 : 6;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#E86F25' : isHovered ? '#B91C1C' : '#DC2626';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

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
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Box select mode
    if (selectionTool === 'box') {
      if (!selectionStart) {
        setSelectionStart({ x, y });
        setSelectionEnd(null);
      } else {
        setSelectionEnd({ x, y });
        completeBoxSelection({ x, y });
      }
      return;
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

    // Hover detection
    const hoveredFeature = detectFeatureAtPoint(x, y);
    setHoveredItem(hoveredFeature);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      
      const latOffset = -panOffset.y / (10000 * zoom);
      const lngOffset = panOffset.x / (10000 * zoom);
      
      setCenter({
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      });
      
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Feature detection
  const detectFeatureAtPoint = (x: number, y: number): { type: 'manhole' | 'pipe'; id: string } | null => {
    // Check manholes
    for (const manhole of MOCK_MANHOLES) {
      if (!filteredAssetIds.includes(manhole.id)) continue;
      
      const pos = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 10) {
        return { type: 'manhole', id: manhole.id };
      }
    }

    return null;
  };

  // Complete box selection
  const completeBoxSelection = (endPoint: { x: number; y: number }) => {
    if (!selectionStart) return;

    const minX = Math.min(selectionStart.x, endPoint.x);
    const maxX = Math.max(selectionStart.x, endPoint.x);
    const minY = Math.min(selectionStart.y, endPoint.y);
    const maxY = Math.max(selectionStart.y, endPoint.y);

    const selectedIds: string[] = [];

    MOCK_MANHOLES.forEach(manhole => {
      if (!filteredAssetIds.includes(manhole.id)) return;
      
      const pos = latLngToXY(manhole.coordinates.lat, manhole.coordinates.lng);
      if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
        selectedIds.push(manhole.id);
      }
    });

    MOCK_PIPE_SEGMENTS.forEach(pipe => {
      if (!filteredAssetIds.includes(pipe.id)) return;
      
      const inBox = pipe.coordinates.some(coord => {
        const pos = latLngToXY(coord.lat, coord.lng);
        return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
      });
      
      if (inBox) selectedIds.push(pipe.id);
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

  // Redraw on changes
  useEffect(() => {
    drawMap();
  }, [zoom, center, hoveredItem, selectedAssetIds, filteredAssetIds, layers, selectionTool, selectionStart, selectionEnd, panOffset]);

  return (
    <div className="relative h-full bg-neutral-100">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full"
        style={{ cursor: getCursorStyle() }}
      />

      {/* Basemap Selector */}
      <div className="absolute top-4 right-4">
        <select className="px-3 py-2 bg-white rounded-lg shadow-md border border-neutral-200 text-sm font-medium">
          <option>Streets</option>
          <option>Satellite</option>
          <option>Hybrid</option>
        </select>
      </div>

      {/* Layer Controls */}
      <div className="absolute top-16 right-4 bg-white rounded-lg shadow-md border border-neutral-200 px-3 py-2.5">
        <div className="flex items-center gap-4">
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
          
          <div className="w-px h-5 bg-neutral-200" />
          
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
      <div className="absolute bottom-8 right-4 bg-white rounded-lg shadow-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700">
        <span>{filteredAssetIds.length} assets loaded</span>
        {selectedAssetIds.length > 0 && (
          <span className="text-neutral-500"> • {selectedAssetIds.length} selected</span>
        )}
      </div>

      {/* Popups would go here */}
    </div>
  );
}
```

---

## ✅ KEY FEATURES

### 1. Auto-Zoom
```typescript
// Auto-zoom when filter changes
useEffect(() => {
  if (filteredAssetIds.length === 0) return;
  autoZoomToAssets(filteredAssetIds);
}, [filteredAssetIds]);

// Auto-zoom when selection changes
useEffect(() => {
  if (selectedAssetIds.length === 0) return;
  autoZoomToAssets(selectedAssetIds);
}, [selectedAssetIds]);
```

### 2. Integrated Toolbar
```
┌─────────────────────────────────────────────────┐
│ [+][-] Zoom: 14 | [Box Select] | [Clear]       │
└─────────────────────────────────────────────────┘
```

**Three sections with separators:**
- Zoom controls (compact buttons + level display)
- Selection tool (Box Select with active state)
- Clear action (only when needed)

### 3. Simplified UX
- No confusing "Fit" or "Center" buttons
- Map automatically follows your workflow
- Fewer clicks, clearer purpose

---

## 🎨 STYLING DETAILS

### Toolbar Sections
```typescript
// Zoom buttons - compact, native style
className="w-7 h-7 bg-white rounded border border-neutral-200 hover:bg-neutral-50"

// Zoom level - simple text
className="px-2 text-xs font-medium text-neutral-600"

// Separator
className="w-px h-6 bg-neutral-200"

// Box Select - active state
className={selectionTool === 'box' 
  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
  : ''
}

// Clear - red on hover
className="hover:bg-red-50 text-red-600"
```

---

## ✅ TESTING CHECKLIST

**Auto-Zoom:**
- [ ] Filter assets in table → map zooms to show filtered assets
- [ ] Select assets in table → map zooms to show selected assets
- [ ] Select all → map doesn't zoom (already showing all)
- [ ] Clear filter → map zooms to show all assets

**Map Controls:**
- [ ] Can pan map with drag
- [ ] Zoom +/- buttons work
- [ ] Zoom level displays correctly
- [ ] Box Select activates/deactivates
- [ ] Clear button shows when needed
- [ ] Clear button removes selection

**Visual:**
- [ ] Toolbar sections clearly separated
- [ ] Zoom buttons compact and aligned
- [ ] Active states visible
- [ ] Smooth transitions

---

## 🎯 BENEFITS

✅ **Simpler UI** - 2-3 buttons instead of 4-5
✅ **Less clicks** - Auto-zoom removes manual action
✅ **Clearer purpose** - Each button has obvious function
✅ **Professional** - Clean, integrated toolbar
✅ **User-friendly** - No technical jargon ("Fit", "Center")

**Perfect for non-tech users!** 🎉