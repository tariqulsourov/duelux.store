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
} from 'lucide-react';
import { PlaceholderImage } from '../../../components/blocks/PlaceholderImage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState<HomepageLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<HomepageLayout | null>(null);
  const [activeTab, setActiveTab] = useState<'blocks' | 'images' | 'menu'>('blocks');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
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
        showStatus('success', 'Blocks & Layout positions saved successfully!');
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
  const handleFileUpload = async (blockId: string, file: File, settingKey: string = 'imageUrl') => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingBlockId(blockId);
      const res = await fetch(`${API_BASE_URL}/cms/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.data?.url;
        if (uploadedUrl && selectedLayout) {
          updateBlockSetting(blockId, settingKey, uploadedUrl);
          showStatus('success', 'Image uploaded to local storage & applied to section!');
        }
      } else {
        showStatus('error', 'Failed to upload image');
      }
    } catch (err) {
      showStatus('error', 'Error uploading file');
    } finally {
      setUploadingBlockId(null);
    }
  };

  // Update block setting in state
  const updateBlockSetting = (blockId: string, path: string, value: any) => {
    if (!selectedLayout) return;
    const newBlocks = selectedLayout.blocks.map((blk) => {
      if (blk.id !== blockId) return blk;
      const settings = { ...blk.settings };

      // Handle nested keys like 'tallPoster.imageUrl'
      if (path.includes('.')) {
        const [parentKey, childKey] = path.split('.');
        settings[parentKey] = {
          ...settings[parentKey],
          [childKey]: value,
        };
      } else {
        settings[path] = value;
      }
      return { ...blk, settings };
    });
    setSelectedLayout({ ...selectedLayout, blocks: newBlocks });
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

  // Curated Luxury Photo Presets for 1-Click selection
  const luxuryPresets = [
    { label: 'Royal Panjabi', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Gold Zardozi', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Mulberry Silk', url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Oxford Cotton', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Atelier Studio', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Showroom Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80' },
  ];

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
              Duelux CMS Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Homepage Layout & Navigation Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Choose from 5 reference-inspired presets, reorder block containers, manage section-wise image uploads, and configure the 2-layer menu.
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
                Customize containers sequence, section images, and 2-layer menu items.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
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
                <span>1. Blocks & Order</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'images'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Section Media</span>
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

          {/* TAB 1: Step 1 - Finalize Blocks & Position */}
          {activeTab === 'blocks' && (
            <div className="p-6 space-y-6">
              {/* Guidance Notice */}
              <div className="rounded-2xl bg-brand-500/10 border border-brand-500/20 p-4 text-xs text-brand-900 dark:text-brand-300 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Step 1 — Finalize Layout Sequence:</strong> Reorder containers up and down to define your storefront flow. All image slots use high-fidelity default placeholders so you can finalize structure first without uploading images.
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

                      {/* Quick jump to Section Media Tab */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('images')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition flex items-center gap-1 border border-amber-500/20"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Media & Text</span>
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

          {/* TAB 2: Step 2 - Section-Wise Image Upload & Media Manager */}
          {activeTab === 'images' && (
            <div className="p-6 space-y-6">
              {/* Guidance Notice */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
                <ImageIcon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Step 2 — Section-Wise Media Manager:</strong> Upload high-resolution images directly from your computer, choose 1-click curated luxury presets, or enter URLs. If no image is uploaded, the block renders with its high-fidelity default placeholder.
                </div>
              </div>

              {/* Section-Wise Image Cards */}
              <div className="space-y-6">
                {selectedLayout.blocks
                  .filter((b) =>
                    [
                      'HERO_BANNER',
                      'CATEGORY_BENTO',
                      'TALL_BANNER_ROW',
                      'SPLIT_PROMO_BANNERS',
                      'REELS_VIDEO_GRID',
                      'BRAND_STORY',
                      'STORE_LOCATOR',
                    ].includes(b.type)
                  )
                  .map((block) => {
                    const currentImg =
                      block.settings?.imageUrl ||
                      block.settings?.tallPoster?.imageUrl ||
                      block.settings?.pillars?.[0]?.imageUrl ||
                      block.settings?.tiles?.[0]?.imageUrl ||
                      null;

                    return (
                      <div
                        key={block.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/40 dark:bg-slate-900/30 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                              Section Container
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              {block.title}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            Type: {block.type}
                          </span>
                        </div>

                        {/* Image Preview & Upload Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                          {/* Live Thumbnail / Placeholder */}
                          <div className="lg:col-span-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/10] bg-black">
                            <PlaceholderImage
                              src={currentImg}
                              alt={block.title}
                              ratio="banner"
                              label={block.title}
                            />
                          </div>

                          {/* Controls */}
                          <div className="lg:col-span-8 space-y-4">
                            {/* File Upload Trigger */}
                            <div>
                              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                Upload New Image from Computer
                              </label>
                              <div className="flex items-center gap-3">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-xs font-bold transition shadow-xs">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>
                                    {uploadingBlockId === block.id
                                      ? 'Uploading...'
                                      : 'Choose File & Upload'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const key =
                                          block.type === 'TALL_BANNER_ROW'
                                            ? 'tallPoster.imageUrl'
                                            : 'imageUrl';
                                        handleFileUpload(block.id, file, key);
                                      }
                                    }}
                                  />
                                </label>

                                {currentImg && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const key =
                                        block.type === 'TALL_BANNER_ROW'
                                          ? 'tallPoster.imageUrl'
                                          : 'imageUrl';
                                      updateBlockSetting(block.id, key, null);
                                    }}
                                    className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 text-xs font-semibold"
                                  >
                                    Revert to Default Placeholder
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Direct URL Input */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                                Or Image URL
                              </label>
                              <input
                                type="text"
                                value={currentImg || ''}
                                placeholder="https://example.com/photo.jpg or /uploads/cms/..."
                                onChange={(e) => {
                                  const key =
                                    block.type === 'TALL_BANNER_ROW'
                                      ? 'tallPoster.imageUrl'
                                      : 'imageUrl';
                                  updateBlockSetting(block.id, key, e.target.value);
                                }}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                              />
                            </div>

                            {/* 1-Click Luxury Presets */}
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                1-Click Curated Luxury Photos:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {luxuryPresets.map((lp, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      const key =
                                        block.type === 'TALL_BANNER_ROW'
                                          ? 'tallPoster.imageUrl'
                                          : 'imageUrl';
                                      updateBlockSetting(block.id, key, lp.url);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white transition"
                                  >
                                    + {lp.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Editable Headline / Text fields */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                              Headline / Section Title
                            </label>
                            <input
                              type="text"
                              value={
                                block.settings?.headline ||
                                block.settings?.title ||
                                block.settings?.categoryName ||
                                ''
                              }
                              onChange={(e) => {
                                const key =
                                  block.settings?.headline !== undefined
                                    ? 'headline'
                                    : block.settings?.categoryName !== undefined
                                    ? 'categoryName'
                                    : 'title';
                                updateBlockSetting(block.id, key, e.target.value);
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                              Subheadline / Description
                            </label>
                            <input
                              type="text"
                              value={
                                block.settings?.subheadline ||
                                block.settings?.subtitle ||
                                block.settings?.paragraph ||
                                ''
                              }
                              onChange={(e) => {
                                const key =
                                  block.settings?.subheadline !== undefined
                                    ? 'subheadline'
                                    : block.settings?.paragraph !== undefined
                                    ? 'paragraph'
                                    : 'subtitle';
                                updateBlockSetting(block.id, key, e.target.value);
                              }}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Save All Media Settings */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveBlocks}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Section Media & Text'}</span>
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
