import { useState, useEffect } from 'react';
import { Palette, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Convert hex color to HSL string "H S% L%"
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Convert HSL string back to hex for the color picker
function hslStringToHex(hslStr) {
  const parts = hslStr.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return '#800000';
  let h = parseFloat(parts[0]) / 360;
  let s = parseFloat(parts[1]) / 100;
  let l = parseFloat(parts[2]) / 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

const PRESET_COLORS = [
  { name: 'PulseCare Red', hex: '#800000' },
  { name: 'Royal Blue', hex: '#1e3a8a' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Deep Purple', hex: '#581c87' },
  { name: 'Ocean Teal', hex: '#134e4a' },
  { name: 'Burnt Orange', hex: '#9a3412' },
  { name: 'Slate Gray', hex: '#1e293b' },
  { name: 'Rose Pink', hex: '#9f1239' },
];

const DEFAULT_PRIMARY_HSL = '0 100% 25.1%';
const STORAGE_KEY = 'pulsecare_theme_primary';

function applyPrimaryColor(hslStr) {
  const root = document.documentElement;
  root.style.setProperty('--primary', hslStr);
  root.style.setProperty('--ring', hslStr);
  root.style.setProperty('--sidebar-primary', hslStr);
  root.style.setProperty('--sidebar-ring', hslStr);
  root.style.setProperty('--chart-1', hslStr);

  // Update PWA theme-color meta tag
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    // Convert HSL to hex for meta tag
    const hex = hslStringToHex(hslStr);
    meta.setAttribute('content', hex);
  }
}

export function loadSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) applyPrimaryColor(saved);
}

export default function ThemeManager() {
  const [currentHex, setCurrentHex] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? hslStringToHex(saved) : '#800000';
  });

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const applyColor = (hex) => {
    setCurrentHex(hex);
    const hsl = hexToHsl(hex);
    applyPrimaryColor(hsl);
    localStorage.setItem(STORAGE_KEY, hsl);
    toast.success('Theme color updated!');
  };

  const resetDefault = () => {
    applyPrimaryColor(DEFAULT_PRIMARY_HSL);
    localStorage.removeItem(STORAGE_KEY);
    setCurrentHex('#800000');
    toast.success('Theme reset to default.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold">Theme & PWA Color</h2>
      </div>

      {/* Custom color picker */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Custom Color</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={currentHex}
              onChange={(e) => setCurrentHex(e.target.value)}
              onBlur={(e) => applyColor(e.target.value)}
              className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer p-1 bg-card"
            />
          </div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">{currentHex.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click to pick any color</p>
          </div>
          <Button size="sm" onClick={() => applyColor(currentHex)} className="ml-auto">
            <Check className="w-4 h-4 mr-1" /> Apply
          </Button>
        </div>
      </div>

      {/* Preset swatches */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Preset Colors</p>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((preset) => {
            const isActive = currentHex.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                onClick={() => applyColor(preset.hex)}
                className={`flex flex-col items-center gap-1.5 group`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border-2 transition-all ${isActive ? 'border-foreground scale-110 shadow-lg' : 'border-transparent'}`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {isActive && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground text-center leading-tight">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Preview</p>
        <div className="flex flex-wrap gap-2">
          <div className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: currentHex }}>
            Primary Button
          </div>
          <div className="px-4 py-2 rounded-lg border-2 text-sm font-medium" style={{ borderColor: currentHex, color: currentHex }}>
            Outline
          </div>
          <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: currentHex + '20', color: currentHex }}>
            Subtle
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={resetDefault} className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" /> Reset to Default
      </Button>
    </div>
  );
}