'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HomepageLayout,
  LayoutBlockConfig,
  HeaderMenuItem,
  SubMenuItem,
  BlockType,
} from '@duelux/shared';
import {
  LayoutTemplate,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Menu,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  FolderPlus,
  Palette,
  PhoneCall,
  Sliders,
  Type,
  Link2,
  Star,
  Check,
  Award,
  Truck,
  ShieldCheck,
  CreditCard,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react';
import { PlaceholderImage } from '../../../components/blocks/PlaceholderImage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Immutable deep setter supporting dot notation & array indices (e.g. 'tallPoster.title', 'pillars.0.title')
function setDeep(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = newObj;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const isNextNumber = !isNaN(Number(nextKey));

    if (current[key] === undefined || current[key] === null) {
      current[key] = isNextNumber ? [] : {};
    } else {
      current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
    }
    current = current[key];
  }

  current[parts[parts.length - 1]] = value;
  return newObj;
}

const luxuryPresets = [
  { label: 'Royal Panjabi', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Gold Zardozi', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mulberry Silk', url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Oxford Cotton', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Atelier Studio', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Showroom Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState<HomepageLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<HomepageLayout | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'content' | 'menu'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all layouts
  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/cms/layouts`);
      if (res.ok) {
        const json = await res.json();
        const data: HomepageLayout[] = json.data || [];
        setLayouts(data);

        // Default to active layout or first
        if (!selectedLayout) {
          const active = data.find((l) => l.isActive) || data[0];
          setSelectedLayout(active ? JSON.parse(JSON.stringify(active)) : null);
        } else {
          const updated = data.find((l) => l.id === selectedLayout.id);
          if (updated) setSelectedLayout(JSON.parse(JSON.stringify(updated)));
        }
      }
    } catch (err) {
      console.error('Failed to load layouts:', err);
      setStatusMessage({ type: 'error', text: 'Failed to connect to CMS API backend' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1-Click Activate Layout
  const handleActivateLayout = async (slug: string) => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/cms/layouts/${slug}/activate`, {
        method: 'POST',
      });
      if (res.ok) {
        showStatus('success', 'Layout activated! Storefront homepage updated live.');
        await fetchLayouts();
      } else {
        showStatus('error', 'Failed to activate layout');
      }
    } catch (err) {
      showStatus('error', 'Error activating layout');
    } finally {
      setSaving(false);
    }
  };

  // Switch Selected Layout for editing
  const handleSelectLayout = (layout: HomepageLayout) => {
    setSelectedLayout(JSON.parse(JSON.stringify(layout)));
    showStatus('success', `Editing layout: ${layout.name}`);
  };

  // Reorder Blocks
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!selectedLayout) return;
    const newBlocks = [...selectedLayout.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Re-assign order numbers
    newBlocks.forEach((blk, idx) => {
      blk.order = idx + 1;
    });

    setSelectedLayout({ ...selectedLayout, blocks: newBlocks });
  };

  // Toggle Block Visibility
  const toggleBlockVisibility = (blockId: string) => {
    if (!selectedLayout) return;
    const newBlocks = selectedLayout.blocks.map((blk) =>
      blk.id === blockId ? { ...blk, isVisible: !blk.isVisible } : blk
    );
    setSelectedLayout({ ...selectedLayout, blocks: newBlocks });
  };

  // Update Block Title in layout
  const updateBlockTitle = (blockId: string, newTitle: string) => {
    if (!selectedLayout) return;
    const newBlocks = selectedLayout.blocks.map((blk) =>
      blk.id === blockId ? { ...blk, title: newTitle } : blk
    );
    setSelectedLayout({ ...selectedLayout, blocks: newBlocks });
  };

  // Update block setting in state using deep path
  const updateBlockSetting = (blockId: string, path: string, value: any) => {
    if (!selectedLayout) return;
    const newBlocks = selectedLayout.blocks.map((blk) => {
      if (blk.id !== blockId) return blk;
      const updatedSettings = setDeep(blk.settings || {}, path, value);
      return { ...blk, settings: updatedSettings };
    });
    setSelectedLayout({ ...selectedLayout, blocks: newBlocks });
  };

  // Save Blocks
  const handleSaveBlocks = async () => {
    if (!selectedLayout) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/cms/layouts/${selectedLayout.id}/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: selectedLayout.blocks }),
      });
      if (res.ok) {
        showStatus('success', 'Layout blocks & custom content saved successfully!');
        await fetchLayouts();
      } else {
        showStatus('error', 'Failed to save layout blocks');
      }
    } catch (err) {
      showStatus('error', 'Error saving blocks');
    } finally {
      setSaving(false);
    }
  };

  // Save Menu
  const handleSaveMenu = async () => {
    if (!selectedLayout) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/cms/layouts/${selectedLayout.id}/menu`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuConfig: selectedLayout.menuConfig }),
      });
      if (res.ok) {
        showStatus('success', '2-Layer Navigation Menu saved successfully!');
        await fetchLayouts();
      } else {
        showStatus('error', 'Failed to save navigation menu');
      }
    } catch (err) {
      showStatus('error', 'Error saving menu');
    } finally {
      setSaving(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = async (blockId: string, file: File, settingKey: string) => {
    const formData = new FormData();
    formData.append('image', file);
    const uploadId = `${blockId}-${settingKey}`;
    try {
      setUploadingKey(uploadId);
      const res = await fetch(`${API_BASE_URL}/cms/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.data?.url;
        if (uploadedUrl && selectedLayout) {
          updateBlockSetting(blockId, settingKey, uploadedUrl);
          showStatus('success', 'Image uploaded & applied to section!');
        }
      } else {
        showStatus('error', 'Failed to upload image');
      }
    } catch (err) {
      showStatus('error', 'Error uploading file');
    } finally {
      setUploadingKey(null);
    }
  };

  // Navigation Menu Handlers (2-Layer)
  const addHeaderMenuItem = () => {
    if (!selectedLayout) return;
    const newItem: HeaderMenuItem = {
      id: `menu-${Date.now()}`,
      label: 'New Category',
      subItems: [],
    };
    setSelectedLayout({
      ...selectedLayout,
      menuConfig: [...selectedLayout.menuConfig, newItem],
    });
  };

  const removeHeaderMenuItem = (id: string) => {
    if (!selectedLayout) return;
    setSelectedLayout({
      ...selectedLayout,
      menuConfig: selectedLayout.menuConfig.filter((m) => m.id !== id),
    });
  };

  const updateHeaderMenuItem = (id: string, updates: Partial<HeaderMenuItem>) => {
    if (!selectedLayout) return;
    setSelectedLayout({
      ...selectedLayout,
      menuConfig: selectedLayout.menuConfig.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    });
  };

  const moveHeaderMenuItem = (index: number, direction: 'up' | 'down') => {
    if (!selectedLayout) return;
    const items = [...selectedLayout.menuConfig];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const temp = items[index];
    items[index] = items[target];
    items[target] = temp;
    setSelectedLayout({ ...selectedLayout, menuConfig: items });
  };

  const addSubMenuItem = (headerId: string) => {
    if (!selectedLayout) return;
    const newSub: SubMenuItem = {
      id: `sub-${Date.now()}`,
      label: 'New Sub-Collection',
      link: '/#products',
    };
    const updated = selectedLayout.menuConfig.map((item) => {
      if (item.id !== headerId) return item;
      return {
        ...item,
        subItems: [...item.subItems, newSub],
      };
    });
    setSelectedLayout({ ...selectedLayout, menuConfig: updated });
  };

  const updateSubMenuItem = (
    headerId: string,
    subId: string,
    updates: Partial<SubMenuItem>
  ) => {
    if (!selectedLayout) return;
    const updated = selectedLayout.menuConfig.map((item) => {
      if (item.id !== headerId) return item;
      return {
        ...item,
        subItems: item.subItems.map((sub) =>
          sub.id === subId ? { ...sub, ...updates } : sub
        ),
      };
    });
    setSelectedLayout({ ...selectedLayout, menuConfig: updated });
  };

  const removeSubMenuItem = (headerId: string, subId: string) => {
    if (!selectedLayout) return;
    const updated = selectedLayout.menuConfig.map((item) => {
      if (item.id !== headerId) return item;
      return {
        ...item,
        subItems: item.subItems.filter((sub) => sub.id !== subId),
      };
    });
    setSelectedLayout({ ...selectedLayout, menuConfig: updated });
  };

  // Reusable Image Uploader Row
  const renderMediaUploader = (
    blockId: string,
    path: string,
    currentUrl: string | null | undefined,
    label: string = 'Section Image'
  ) => {
    const isUploading = uploadingKey === `${blockId}-${path}`;

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
          {currentUrl ? (
            <button
              type="button"
              onClick={() => updateBlockSetting(blockId, path, null)}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 underline"
            >
              Reset to Default Placeholder
            </button>
          ) : (
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              Default Placeholder Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Thumbnail / Placeholder */}
          <div className="sm:col-span-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/10] bg-black">
            <PlaceholderImage src={currentUrl} alt={label} ratio="banner" label={label} />
          </div>

          {/* Upload & Presets */}
          <div className="sm:col-span-9 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-bold transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(blockId, file, path);
                  }}
                />
              </label>

              <input
                type="text"
                value={currentUrl || ''}
                placeholder="Or paste image URL (e.g. https://... or /uploads/cms/...)"
                onChange={(e) => updateBlockSetting(blockId, path, e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* 1-Click Curated Presets */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">
                Presets:
              </span>
              {luxuryPresets.map((lp, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => updateBlockSetting(blockId, path, lp.url)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition"
                >
                  {lp.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Specific content editors for each block type
  const renderBlockContentEditor = (block: LayoutBlockConfig) => {
    const s = block.settings || {};

    switch (block.type) {
      case 'HEADER_TOP':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={s.message || ''}
                onChange={(e) => updateBlockSetting(block.id, 'message', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                placeholder="✨ Complimentary Doorstep Express Delivery..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Action Button Text
                </label>
                <input
                  type="text"
                  value={s.actionText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'actionText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Explore Exclusive"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Action Button Link
                </label>
                <input
                  type="text"
                  value={s.actionLink || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'actionLink', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  placeholder="#products"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Color Theme
                </label>
                <select
                  value={s.theme || 'gold_black'}
                  onChange={(e) => updateBlockSetting(block.id, 'theme', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="gold_black">Gold & Black Luxury</option>
                  <option value="dark_minimal">Slate Minimal Monochrome</option>
                  <option value="emerald_brand">Emerald Green & Gold</option>
                  <option value="dark_red">Ruby Red Flash Sale</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Customer Hotline Number
                </label>
                <input
                  type="text"
                  value={s.hotline || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'hotline', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  placeholder="+880 1700-000000"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id={`showHotline-${block.id}`}
                  checked={s.showHotline !== false}
                  onChange={(e) => updateBlockSetting(block.id, 'showHotline', e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <label htmlFor={`showHotline-${block.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Show Hotline on Desktop Top Strip
                </label>
              </div>
            </div>
          </div>
        );

      case 'HERO_BANNER':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="✨ Royal Connoisseur Collection 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Layout Style
                </label>
                <select
                  value={s.style || 'single'}
                  onChange={(e) => updateBlockSetting(block.id, 'style', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="single">Single Full-Width Cinematic Hero</option>
                  <option value="tri_banner">Tri-Banner Hero (1 Main + 2 Stacked Side Banners)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Main Headline
              </label>
              <input
                type="text"
                value={s.headline || ''}
                onChange={(e) => updateBlockSetting(block.id, 'headline', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black"
                placeholder="TIMELESS DRAPES, RARE TREASURES"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Subheadline / Description
              </label>
              <textarea
                rows={2}
                value={s.subheadline || ''}
                onChange={(e) => updateBlockSetting(block.id, 'subheadline', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed"
                placeholder="Artisanal luxury for the discerning connoisseur..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={s.ctaPrimaryText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ctaPrimaryText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Shop The Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={s.ctaPrimaryLink || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ctaPrimaryLink', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  placeholder="#products"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={s.ctaSecondaryText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ctaSecondaryText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Visit Boutique"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={s.ctaSecondaryLink || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ctaSecondaryLink', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  placeholder="#locator"
                />
              </div>
            </div>

            {/* Main Hero Image */}
            {renderMediaUploader(block.id, 'imageUrl', s.imageUrl, 'Main Hero Banner Image')}

            {/* If Tri-Banner, allow editing side banners */}
            {s.style === 'tri_banner' && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-black uppercase text-amber-600">
                  Stacked Side Promo Banners (Modern Beauty BD Style)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Side Promo 1</span>
                    <input
                      type="text"
                      value={s.sideBanner1?.title || ''}
                      onChange={(e) => updateBlockSetting(block.id, 'sideBanner1.title', e.target.value)}
                      placeholder="Title (e.g. 31% OFF SHIRTS)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                    <input
                      type="text"
                      value={s.sideBanner1?.link || ''}
                      onChange={(e) => updateBlockSetting(block.id, 'sideBanner1.link', e.target.value)}
                      placeholder="Link (e.g. #products)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    {renderMediaUploader(block.id, 'sideBanner1.imageUrl', s.sideBanner1?.imageUrl, 'Side Banner 1 Image')}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Side Promo 2</span>
                    <input
                      type="text"
                      value={s.sideBanner2?.title || ''}
                      onChange={(e) => updateBlockSetting(block.id, 'sideBanner2.title', e.target.value)}
                      placeholder="Title (e.g. 25% OFF KURTA)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                    <input
                      type="text"
                      value={s.sideBanner2?.link || ''}
                      onChange={(e) => updateBlockSetting(block.id, 'sideBanner2.link', e.target.value)}
                      placeholder="Link (e.g. #products)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    {renderMediaUploader(block.id, 'sideBanner2.imageUrl', s.sideBanner2?.imageUrl, 'Side Banner 2 Image')}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'TRUST_BADGES':
        const defaultBadges = [
          { icon: 'Award', title: '100% Authentic Handloom', desc: 'Direct from Tangail & Rajshahi ateliers' },
          { icon: 'Truck', title: 'Express Doorstep Delivery', desc: 'Inside Dhaka in 24 hours & live tracking' },
          { icon: 'RefreshCw', title: '7-Day Easy Exchange', desc: 'Hassle-free doorstep sizing exchange' },
          { icon: 'ShieldCheck', title: 'Zero Counterfeit Guarantee', desc: 'Individually serialized & certified' },
        ];
        const badges = s.badges && s.badges.length > 0 ? s.badges : defaultBadges;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">
                Visual Theme
              </span>
              <select
                value={s.theme || 'dark'}
                onChange={(e) => updateBlockSetting(block.id, 'theme', e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              >
                <option value="dark">Dark Luxury (Black & Gold)</option>
                <option value="light">Light Minimalist (White & Grey)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((b: any, bIdx: number) => (
                <div key={bIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-600">
                      Badge 0{bIdx + 1}
                    </span>
                    <select
                      value={b.icon || 'Award'}
                      onChange={(e) => updateBlockSetting(block.id, `badges.${bIdx}.icon`, e.target.value)}
                      className="text-[11px] font-bold border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="Award">Award / Ribbon</option>
                      <option value="Truck">Truck / Delivery</option>
                      <option value="RefreshCw">Refresh / Exchange</option>
                      <option value="ShieldCheck">Shield / Guarantee</option>
                      <option value="CreditCard">CreditCard / Payment</option>
                      <option value="Clock">Clock / 24-7</option>
                      <option value="Sparkles">Sparkles / Craft</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={b.title || ''}
                    onChange={(e) => updateBlockSetting(block.id, `badges.${bIdx}.title`, e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                  <input
                    type="text"
                    value={b.desc || ''}
                    onChange={(e) => updateBlockSetting(block.id, `badges.${bIdx}.desc`, e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'CATEGORY_BENTO':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Section Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="The Sovereign Pillars / Categories"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={s.title || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="CURATED COLLECTION PILLARS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Layout Style
                </label>
                <select
                  value={s.style || 'pedestals'}
                  onChange={(e) => updateBlockSetting(block.id, 'style', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="pedestals">3 Curated Pillars (Zahab & Kholzi)</option>
                  <option value="bento_4">4 Bento Tiles (Tashrif BD)</option>
                  <option value="circle_strip">Circular Avatars Strip (Modern Beauty BD)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={s.subtitle || ''}
                onChange={(e) => updateBlockSetting(block.id, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Choose your signature aesthetic crafted by master weavers"
              />
            </div>

            {/* Pedestals 3 Pillars */}
            {s.style === 'pedestals' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-amber-600">
                  3 Pedestal Pillars
                </span>
                <div className="space-y-4">
                  {(s.pillars || [
                    { title: 'ROYAL SILK', subtitle: 'Mulberry & Rajshahi Gold', link: '#products' },
                    { title: 'FESTIVE ZARDOZI', subtitle: 'Hand-Embroidered Wedding Editions', link: '#products' },
                    { title: 'BESPOKE FORMAL', subtitle: 'Royal Oxford & Egyptian Cotton', link: '#products' },
                  ]).map((pil: any, pIdx: number) => (
                    <div key={pIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={pil.title || ''}
                          onChange={(e) => updateBlockSetting(block.id, `pillars.${pIdx}.title`, e.target.value)}
                          placeholder="Pillar Title (e.g. ROYAL SILK)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                        />
                        <input
                          type="text"
                          value={pil.subtitle || ''}
                          onChange={(e) => updateBlockSetting(block.id, `pillars.${pIdx}.subtitle`, e.target.value)}
                          placeholder="Subtitle (e.g. Mulberry & Rajshahi Gold)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                        <input
                          type="text"
                          value={pil.link || ''}
                          onChange={(e) => updateBlockSetting(block.id, `pillars.${pIdx}.link`, e.target.value)}
                          placeholder="Link (e.g. #products)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                        />
                      </div>
                      {renderMediaUploader(block.id, `pillars.${pIdx}.imageUrl`, pil.imageUrl, `Pillar 0${pIdx + 1} Portrait Image`)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bento 4 Tiles */}
            {s.style === 'bento_4' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-emerald-600">
                  4 Bento Category Tiles
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(s.tiles || [
                    { title: 'ROYAL PANJABI', link: '#products' },
                    { title: 'EGYPTIAN SHIRTS', link: '#products' },
                    { title: 'HANDLOOM KABLI', link: '#products' },
                    { title: 'PERFUME OILS & ATTAR', link: '#products' },
                  ]).map((tile: any, tIdx: number) => (
                    <div key={tIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={tile.title || ''}
                          onChange={(e) => updateBlockSetting(block.id, `tiles.${tIdx}.title`, e.target.value)}
                          placeholder="Tile Title"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                        />
                        <input
                          type="text"
                          value={tile.link || ''}
                          onChange={(e) => updateBlockSetting(block.id, `tiles.${tIdx}.link`, e.target.value)}
                          placeholder="Link (e.g. #products)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                        />
                      </div>
                      {renderMediaUploader(block.id, `tiles.${tIdx}.imageUrl`, tile.imageUrl, `Tile 0${tIdx + 1} Image`)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Circle Avatars */}
            {s.style === 'circle_strip' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-amber-600">
                  Circular Category Avatars
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(s.categories || [
                    { name: 'Panjabi', link: '#products' },
                    { name: 'Shirts', link: '#products' },
                    { name: 'Kurta', link: '#products' },
                    { name: 'Kabli', link: '#products' },
                    { name: 'Silk', link: '#products' },
                    { name: 'Footwear', link: '#products' },
                  ]).map((cat: any, cIdx: number) => (
                    <div key={cIdx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={cat.name || ''}
                          onChange={(e) => updateBlockSetting(block.id, `categories.${cIdx}.name`, e.target.value)}
                          placeholder="Category Name"
                          className="w-1/2 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                        />
                        <input
                          type="text"
                          value={cat.link || ''}
                          onChange={(e) => updateBlockSetting(block.id, `categories.${cIdx}.link`, e.target.value)}
                          placeholder="Link"
                          className="w-1/2 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                        />
                      </div>
                      {renderMediaUploader(block.id, `categories.${cIdx}.imageUrl`, cat.imageUrl, `${cat.name || 'Category'} Avatar`)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'PRODUCT_RAIL':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={s.sectionTitle || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'sectionTitle', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  placeholder="OUR BEST SELLING ATTAR & SILK"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Exclusive Collection"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={s.sectionSubtitle || ''}
                onChange={(e) => updateBlockSetting(block.id, 'sectionSubtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Hand-finished garments inspected by master weavers in Dhaka"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  View All Link Text
                </label>
                <input
                  type="text"
                  value={s.viewAllText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'viewAllText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="View Full Showcase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  View All Link URL
                </label>
                <input
                  type="text"
                  value={s.viewAllLink || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'viewAllLink', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  placeholder="/collection"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Product Query Filter
                </label>
                <select
                  value={s.queryFilter || 'ALL'}
                  onChange={(e) => updateBlockSetting(block.id, 'queryFilter', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="ALL">All Active Products</option>
                  <option value="FEATURED">Featured Products Only</option>
                  <option value="Panjabi">Panjabi Category</option>
                  <option value="Shirts">Shirts Category</option>
                  <option value="Silk">Silk Category</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Grid Columns
                </label>
                <select
                  value={s.columns || 4}
                  onChange={(e) => updateBlockSetting(block.id, 'columns', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value={3}>3 Columns (Large Cards)</option>
                  <option value={4}>4 Columns (Standard)</option>
                  <option value={5}>5 Columns (High Density)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'TALL_BANNER_ROW':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Signature Collection"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Category Showcase Name
                </label>
                <input
                  type="text"
                  value={s.categoryName || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'categoryName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="ROYAL SILK PANJABI"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Top Link Text
                </label>
                <input
                  type="text"
                  value={s.exploreAllText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'exploreAllText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Explore All"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Category Description
              </label>
              <input
                type="text"
                value={s.categoryDescription || ''}
                onChange={(e) => updateBlockSetting(block.id, 'categoryDescription', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Crafted from pure mulberry silk with gold metal buttons"
              />
            </div>

            {/* Left Tall Poster Settings */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">
                Left Tall Promotional Poster (Zahab Signature Layout)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={s.tallPoster?.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'tallPoster.badgeText', e.target.value)}
                  placeholder="Poster Badge (e.g. Featured Edit)"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={s.tallPoster?.title || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'tallPoster.title', e.target.value)}
                  placeholder="Poster Title (e.g. SWEET SILK)"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
                <input
                  type="text"
                  value={s.tallPoster?.subtitle || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'tallPoster.subtitle', e.target.value)}
                  placeholder="Subtitle (e.g. Starting from ৳3,850)"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={s.tallPoster?.buttonText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'tallPoster.buttonText', e.target.value)}
                  placeholder="Button (e.g. View All Silk)"
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              {renderMediaUploader(block.id, 'tallPoster.imageUrl', s.tallPoster?.imageUrl, 'Tall Poster Portrait Image (500 × 800 px)')}
            </div>
          </div>
        );

      case 'SPLIT_PROMO_BANNERS':
        const defaultBanners = [
          { title: 'THE WEDDING TRUNK', subtitle: 'Curated 5-piece royal ensemble in bespoke mahogany presentation box', link: '#products' },
          { title: 'THE SILK ATELIER BOX', subtitle: 'Pure mulberry silk Panjabi with hand-cast mother-of-pearl buttons', link: '#products' },
        ];
        const banners = s.banners && s.banners.length > 0 ? s.banners : defaultBanners;

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-500">
                Number of Promo Banners
              </span>
              <select
                value={s.columns || 2}
                onChange={(e) => updateBlockSetting(block.id, 'columns', Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
              >
                <option value={2}>2 Banners (Side-by-side Dual Presentation)</option>
                <option value={3}>3 Banners (Trio Ensemble)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((ban: any, bIdx: number) => (
                <div key={bIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                  <span className="text-[10px] font-black uppercase text-amber-600">
                    Promo Banner 0{bIdx + 1}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ban.badgeText || ''}
                      onChange={(e) => updateBlockSetting(block.id, `banners.${bIdx}.badgeText`, e.target.value)}
                      placeholder="Badge (e.g. Curated Ensemble)"
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      value={ban.buttonText || ''}
                      onChange={(e) => updateBlockSetting(block.id, `banners.${bIdx}.buttonText`, e.target.value)}
                      placeholder="Button (e.g. Explore Showcase)"
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                    />
                  </div>
                  <input
                    type="text"
                    value={ban.title || ''}
                    onChange={(e) => updateBlockSetting(block.id, `banners.${bIdx}.title`, e.target.value)}
                    placeholder="Banner Title"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  />
                  <textarea
                    rows={2}
                    value={ban.subtitle || ''}
                    onChange={(e) => updateBlockSetting(block.id, `banners.${bIdx}.subtitle`, e.target.value)}
                    placeholder="Banner Description"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                  <input
                    type="text"
                    value={ban.link || ''}
                    onChange={(e) => updateBlockSetting(block.id, `banners.${bIdx}.link`, e.target.value)}
                    placeholder="Link (e.g. #products)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                  {renderMediaUploader(block.id, `banners.${bIdx}.imageUrl`, ban.imageUrl, `Banner 0${bIdx + 1} Image`)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'REELS_VIDEO_GRID':
        const defaultReels = [
          { title: 'Zardozi Gold Silk Panjabi', videoDuration: '0:28', views: '14.2K', productLink: '#products' },
          { title: 'Royal Oxford High Collar', videoDuration: '0:35', views: '9.8K', productLink: '#products' },
          { title: 'Tangail Handloom Weave Drape', videoDuration: '0:42', views: '22.1K', productLink: '#products' },
        ];
        const reels = s.reels && s.reels.length > 0 ? s.reels : defaultReels;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Atelier Video Reels"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={s.title || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="WATCH BEFORE YOU BUY"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  CTA Card Footer Text
                </label>
                <input
                  type="text"
                  value={s.ctaText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ctaText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Tap to watch & shop →"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={s.subtitle || ''}
                onChange={(e) => updateBlockSetting(block.id, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Real video previews of fabric drape, texture, and master tailoring"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {reels.map((reel: any, rIdx: number) => (
                <div key={rIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                  <span className="text-[10px] font-black uppercase text-amber-600">
                    Reel Card 0{rIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={reel.title || ''}
                    onChange={(e) => updateBlockSetting(block.id, `reels.${rIdx}.title`, e.target.value)}
                    placeholder="Video Title"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={reel.videoDuration || ''}
                      onChange={(e) => updateBlockSetting(block.id, `reels.${rIdx}.videoDuration`, e.target.value)}
                      placeholder="Duration (e.g. 0:28)"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                    <input
                      type="text"
                      value={reel.views || ''}
                      onChange={(e) => updateBlockSetting(block.id, `reels.${rIdx}.views`, e.target.value)}
                      placeholder="Views (e.g. 14.2K)"
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                    />
                  </div>
                  <input
                    type="text"
                    value={reel.productLink || ''}
                    onChange={(e) => updateBlockSetting(block.id, `reels.${rIdx}.productLink`, e.target.value)}
                    placeholder="Product Link"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                  {renderMediaUploader(block.id, `reels.${rIdx}.thumbnail`, reel.thumbnail, `Reel 0${rIdx + 1} Thumbnail`)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'BRAND_STORY':
        const defaultStats = [
          '100% Pure Mulberry & Rajshahi Silk',
          'Hereditary Master Zardozi Threading',
          'Doorstep Try-On & Instant Exchange',
        ];
        const stats = s.stats && s.stats.length > 0 ? s.stats : defaultStats;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Heritage & Artistry"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={s.headline || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'headline', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="BEST LUXURY ATELIER IN DHAKA"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Photo Side Alignment
                </label>
                <select
                  value={s.imageSide || 'right'}
                  onChange={(e) => updateBlockSetting(block.id, 'imageSide', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="right">Image on Right, Text on Left</option>
                  <option value="left">Image on Left, Text on Right</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Story Paragraph Narrative
              </label>
              <textarea
                rows={3}
                value={s.paragraph || ''}
                onChange={(e) => updateBlockSetting(block.id, 'paragraph', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
                placeholder="Discover timeless tailoring where ancient Bengal handloom traditions unite..."
              />
            </div>

            {/* 3 Highlight Bullet Points */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                Key Craftsmanship Bullet Points
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={stats[idx] || ''}
                    onChange={(e) => updateBlockSetting(block.id, `stats.${idx}`, e.target.value)}
                    placeholder={`Highlight ${idx + 1}`}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                  />
                ))}
              </div>
            </div>

            {renderMediaUploader(block.id, 'imageUrl', s.imageUrl, 'Atelier Studio Story Photo')}
          </div>
        );

      case 'TESTIMONIALS':
        const defaultReviews = [
          { author: 'Tanvir Ahmed', role: 'Dhanmondi, Dhaka', quote: 'The fabric quality of the Bespoke Silk Panjabi is unmatched. Truly royal craftsmanship.' },
          { author: 'Dr. K. Rahman', role: 'Gulshan, Dhaka', quote: 'Impeccable cut and finish. The doorstep exchange was seamless within 24 hours.' },
          { author: 'S. Chowdhury', role: 'Chattogram', quote: 'Exceeded all expectations. Savile Row quality. Worth every taka.' },
        ];
        const reviews = s.reviews && s.reviews.length > 0 ? s.reviews : defaultReviews;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={s.title || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="LET'S SEE WHAT PATRONS TALK ABOUT US"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Rating Score
                </label>
                <input
                  type="text"
                  value={s.ratingScore || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ratingScore', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold font-mono"
                  placeholder="5.00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Rating Badge Text
                </label>
                <input
                  type="text"
                  value={s.ratingBadgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'ratingBadgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Rated Patron Satisfaction"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={s.subtitle || ''}
                onChange={(e) => updateBlockSetting(block.id, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Over 1,200+ Verified 5-Star Reviews across Bangladesh"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              {reviews.map((rev: any, rvIdx: number) => (
                <div key={rvIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-600">
                    Patron Review 0{rvIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={rev.author || ''}
                    onChange={(e) => updateBlockSetting(block.id, `reviews.${rvIdx}.author`, e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
                  />
                  <input
                    type="text"
                    value={rev.role || ''}
                    onChange={(e) => updateBlockSetting(block.id, `reviews.${rvIdx}.role`, e.target.value)}
                    placeholder="City / Area (e.g. Dhanmondi, Dhaka)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-500"
                  />
                  <textarea
                    rows={3}
                    value={rev.quote || ''}
                    onChange={(e) => updateBlockSetting(block.id, `reviews.${rvIdx}.quote`, e.target.value)}
                    placeholder="Review Quote"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs italic"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'STORE_LOCATOR':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={s.badgeText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Flagship Atelier"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Showroom Title
                </label>
                <input
                  type="text"
                  value={s.title || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'title', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  placeholder="VISIT OUR FLAGSHIP BOUTIQUE"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Directions Button Label
                </label>
                <input
                  type="text"
                  value={s.buttonText || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'buttonText', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Get Google Maps Directions"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Showroom Subtitle
              </label>
              <input
                type="text"
                value={s.subtitle || ''}
                onChange={(e) => updateBlockSetting(block.id, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                placeholder="Experience private styling, handloom swatches..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={s.address || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'address', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="House 42, Road 11, Dhanmondi, Dhaka 1209"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Visiting Hours
                </label>
                <input
                  type="text"
                  value={s.hours || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'hours', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Open Daily: 10:00 AM – 10:00 PM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Concierge Hotline
                </label>
                <input
                  type="text"
                  value={s.phone || ''}
                  onChange={(e) => updateBlockSetting(block.id, 'phone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                  placeholder="+880 1700-000000"
                />
              </div>
            </div>

            {renderMediaUploader(block.id, 'imageUrl', s.imageUrl, 'Flagship Showroom Exterior Photo')}
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500">
            Standard container block. Settings can be customized via JSON or layout preset.
          </div>
        );
    }
  };

  if (loading && layouts.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-600">Loading Homepage Layouts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Duelux CMS & Visual Content Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Homepage Layout, Content & Navigation Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Edit all section texts, button labels, badge tags, and uploaded media without editing a single line of code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/10 text-red-800 dark:text-red-400 border border-red-500/30'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Presets Switcher Grid (5 Layouts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-brand-600" />
            <span>5 Reference-Inspired Presets</span>
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Click to activate live or customize blocks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {layouts.map((preset) => {
            const isSelected = selectedLayout?.id === preset.id;
            const isActive = preset.isActive;

            return (
              <div
                key={preset.id}
                className={`relative rounded-2xl border p-4 flex flex-col justify-between transition-all bg-white dark:bg-slate-950 ${
                  isActive
                    ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                    : isSelected
                    ? 'border-slate-400 dark:border-slate-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Active
                    </span>
                  </div>
                )}

                {/* Preset Preview Image */}
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 mb-3 border border-slate-100 dark:border-slate-800">
                  {preset.previewImage ? (
                    <img
                      src={preset.previewImage}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                      DX Preset
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/90">
                    {preset.blocks?.length || 0} Blocks
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                    {preset.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => handleActivateLayout(preset.slug)}
                      disabled={saving}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Activate Live</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-black text-center border border-emerald-200 dark:border-emerald-800">
                      Live on Storefront
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectLayout(preset)}
                    className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Currently Editing' : 'Customize Layout'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Section */}
      {selectedLayout && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-lg">
          {/* Editor Header Bar with Tabs */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Editing Preset:
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {selectedLayout.name}
                </span>
                {selectedLayout.isActive && (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Live Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize containers sequence, section texts, buttons, images, and 2-layer menu navigation.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'content'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-amber-500" />
                <span>1. Edit Section Content & Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('blocks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'blocks'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>2. Reorder & Toggle Blocks</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'menu'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Menu className="w-3.5 h-3.5 text-indigo-500" />
                <span>3. Two-Layer Menu</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Complete Section Content & Text Editor */}
          {activeTab === 'content' && (
            <div className="p-6 space-y-6">
              {/* Guidance Notice */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
                <Type className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Complete Visual Text & Media Customizer:</strong> All section headlines, descriptions, button labels, badge texts, bullet points, and photos are directly editable below. No code changes needed!
                </div>
              </div>

              {/* Accordion List of All Blocks */}
              <div className="space-y-4">
                {selectedLayout.blocks.map((block, idx) => {
                  const isExpanded = expandedBlockId === block.id || expandedBlockId === null;

                  return (
                    <div
                      key={block.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs"
                    >
                      {/* Section Card Bar */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                {block.title}
                              </h3>
                              <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 font-mono">
                                {block.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Order #{block.order} • {block.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleBlockVisibility(block.id)}
                            className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                              block.isVisible
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                                : 'border-slate-300 bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                            title={block.isVisible ? 'Visible' : 'Hidden'}
                          >
                            {block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span className="text-[11px]">{block.isVisible ? 'Visible' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBlockId(expandedBlockId === block.id ? 'none' : block.id)
                            }
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                          >
                            <span>{expandedBlockId === block.id ? 'Collapse' : 'Expand Form'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                expandedBlockId === block.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content Form */}
                      <div className="p-6 bg-slate-50/20 dark:bg-slate-900/20">
                        {renderBlockContentEditor(block)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save All Content Changes */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveBlocks}
                  disabled={saving}
                  className="px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save All Section Texts & Content'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Step 2 - Finalize Blocks & Position */}
          {activeTab === 'blocks' && (
            <div className="p-6 space-y-6">
              {/* Guidance Notice */}
              <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4 text-xs text-brand-900 dark:text-brand-300 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Block Reordering & Visibility Manager:</strong> Move sections up and down to change the presentation flow on your homepage. Hide sections you do not want to display today.
                </div>
              </div>

              {/* Block List */}
              <div className="space-y-3">
                {selectedLayout.blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                      block.isVisible
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Order Index Pill */}
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {block.title}
                          </h4>
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {block.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {block.settings?.headline ||
                            block.settings?.sectionTitle ||
                            block.settings?.message ||
                            block.settings?.categoryName ||
                            'Standard Block Container'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Reorder Up / Down */}
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveBlock(idx, 'down')}
                        disabled={idx === selectedLayout.blocks.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleBlockVisibility(block.id)}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                          block.isVisible
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                            : 'border-slate-300 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                        title={block.isVisible ? 'Visible on storefront' : 'Hidden from storefront'}
                      >
                        {block.isVisible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {block.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </button>

                      {/* Quick jump to Section Content Tab */}
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedBlockId(block.id);
                          setActiveTab('content');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition flex items-center gap-1 border border-amber-500/20"
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit Text & Media</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Blocks Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveBlocks}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Layout...' : 'Save Blocks & Positions'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Two-Layer Navigation Menu Customizer */}
          {activeTab === 'menu' && (
            <div className="p-6 space-y-6">
              {/* Guidance Notice */}
              <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
                <Menu className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Strict Two-Layer Navigation Model:</strong> Configure Level 1 Header Menu links and Level 2 Submenus. Submenus appear in luxury dropdown flyouts on desktop and touch accordions on mobile.
                </div>
              </div>

              {/* Level 1 Menu Items List */}
              <div className="space-y-4">
                {selectedLayout.menuConfig.map((item, mIdx) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 space-y-4 shadow-xs"
                  >
                    {/* Header Item Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 text-xs font-black">
                          {mIdx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Level 1: Header Item
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {item.label}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Move Up / Down */}
                        <button
                          type="button"
                          onClick={() => moveHeaderMenuItem(mIdx, 'up')}
                          disabled={mIdx === 0}
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                          title="Move Header Item Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveHeaderMenuItem(mIdx, 'down')}
                          disabled={mIdx === selectedLayout.menuConfig.length - 1}
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                          title="Move Header Item Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Add Submenu Button */}
                        <button
                          type="button"
                          onClick={() => addSubMenuItem(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold transition flex items-center gap-1 border border-indigo-500/20"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Add Submenu</span>
                        </button>

                        {/* Remove Header Item */}
                        <button
                          type="button"
                          onClick={() => removeHeaderMenuItem(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Header Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Header Item Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Header Label
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) =>
                            updateHeaderMenuItem(item.id, { label: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Direct Link (if no submenus)
                        </label>
                        <input
                          type="text"
                          value={item.link || ''}
                          placeholder="/#products"
                          onChange={(e) =>
                            updateHeaderMenuItem(item.id, { link: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                          Badge Tag (Optional)
                        </label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          placeholder="Hot, New, Festive 2026..."
                          onChange={(e) =>
                            updateHeaderMenuItem(item.id, { badge: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Level 2 Submenus Nested Container */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="ml-4 sm:ml-8 pl-4 border-l-2 border-indigo-500/30 space-y-2 pt-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Level 2 Submenus ({item.subItems.length})
                        </span>

                        <div className="space-y-2">
                          {item.subItems.map((sub, sIdx) => (
                            <div
                              key={sub.id}
                              className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                <input
                                  type="text"
                                  value={sub.label}
                                  placeholder="Submenu Title"
                                  onChange={(e) =>
                                    updateSubMenuItem(item.id, sub.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white"
                                />
                                <input
                                  type="text"
                                  value={sub.link}
                                  placeholder="Link (e.g. /#products)"
                                  onChange={(e) =>
                                    updateSubMenuItem(item.id, sub.id, {
                                      link: e.target.value,
                                    })
                                  }
                                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono"
                                />
                                <input
                                  type="text"
                                  value={sub.badge || ''}
                                  placeholder="Badge (e.g. Luxury)"
                                  onChange={(e) =>
                                    updateSubMenuItem(item.id, sub.id, {
                                      badge: e.target.value,
                                    })
                                  }
                                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSubMenuItem(item.id, sub.id)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 self-end sm:self-center"
                                title="Delete Submenu"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Header Item Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={addHeaderMenuItem}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New Header Item</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMenu}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Menu...' : 'Save 2-Layer Navigation Menu'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
