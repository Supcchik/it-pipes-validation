'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LayersPopOutWindowProps {
  layers: {
    sewerLines: boolean;
    manholes: boolean;
  };
  onLayersChange: (layers: { sewerLines: boolean; manholes: boolean }) => void;
  onClose: () => void;
}

export default function LayersPopOutWindow({
  layers,
  onLayersChange,
  onClose
}: LayersPopOutWindowProps) {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Open new window
    const newWindow = window.open(
      '',
      'LayersControl',
      'width=400,height=600,resizable=yes,scrollbars=yes'
    );

    if (!newWindow) {
      alert('Please allow pop-ups to open layers panel in a new window');
      onClose();
      return;
    }

    // Write HTML content
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Layers Control</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 16px;
              background: #f9fafb;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              background: white;
              border-bottom: 1px solid #e5e7eb;
              margin: -16px -16px 16px -16px;
            }
            .search {
              margin-bottom: 16px;
            }
            .search input {
              width: 100%;
              padding: 8px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
            }
            .layers {
              background: white;
              border-radius: 8px;
              padding: 12px;
            }
            .layer-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px;
              border-radius: 4px;
            }
            .layer-item:hover {
              background: #f3f4f6;
            }
            .close-btn {
              background: none;
              border: none;
              cursor: pointer;
              padding: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0; font-size: 16px; font-weight: 600;">Layers Control</h2>
            <button class="close-btn" onclick="window.close()">✕</button>
          </div>
          <div class="search">
            <input type="text" placeholder="Search layers..." id="search-input" />
          </div>
          <div class="layers">
            <div class="layer-item">
              <input type="checkbox" id="sewer" ${layers.sewerLines ? 'checked' : ''} />
              <label for="sewer" style="cursor: pointer;">SewerLines_All</label>
            </div>
            <div class="layer-item">
              <input type="checkbox" id="manholes" ${layers.manholes ? 'checked' : ''} />
              <label for="manholes" style="cursor: pointer;">Manholes_All</label>
            </div>
          </div>
          <script>
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
              cb.addEventListener('change', () => {
                const state = {
                  sewerLines: document.getElementById('sewer').checked,
                  manholes: document.getElementById('manholes').checked
                };
                window.opener.postMessage({
                  type: 'LAYERS_UPDATE',
                  layers: state
                }, '*');
              });
            });
            
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', (e) => {
              const query = e.target.value.toLowerCase();
              document.querySelectorAll('.layer-item').forEach(item => {
                const label = item.querySelector('label').textContent.toLowerCase();
                item.style.display = label.includes(query) ? 'flex' : 'none';
              });
            });
            
            window.addEventListener('beforeunload', () => {
              window.opener.postMessage({
                type: 'LAYERS_POPOUT_CLOSE'
              }, '*');
            });
          </script>
        </body>
      </html>
    `);

    newWindow.document.close();

    // Listen for messages from pop-out window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LAYERS_UPDATE') {
        onLayersChange(event.data.layers);
      } else if (event.data.type === 'LAYERS_POPOUT_CLOSE') {
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (newWindow && !newWindow.closed) {
        newWindow.close();
      }
    };
  }, [layers, onLayersChange, onClose]);

  return null; // This component doesn't render anything in the main window
}
