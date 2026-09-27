import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  X,
  Package,
  Upload,
  Download,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Code,
  Sparkles,
  Check,
  Shapes,
  Grid,
  Compass,
  Circle,
  Box,
  Table,
  Activity,
  Paintbrush,
  Spline,
  ArrowRight
} from 'lucide-react';
import { LATEX_SYMBOL_CATEGORIES } from '../data/latexSymbols';
import { TIKZ_LIBRARY_CATEGORIES, TikzSnippet } from '../data/tikzSnippets';
import { StyleFile } from '../utils/styParser';
import katex from 'katex';

export interface DocumentItem {
  id: string;
  title: string;
  code: string;
  updatedAt: number;
}

interface SidebarProps {
  documents: DocumentItem[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onCloneDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onInsertSnippet: (snippet: string) => void;
  onCloseSidebar: () => void;

  // .sty files props
  styleFiles: StyleFile[];
  onUploadStyFiles: (files: FileList | File[]) => void;
  onToggleStyFile: (id: string) => void;
  onDeleteStyFile: (id: string) => void;
  onOpenEditStyFile: (styleFile: StyleFile | null) => void;
  onDownloadStyFile: (styleFile: StyleFile) => void;

  // Active Tab external control (optional)
  activeTab?: 'docs' | 'tikz' | 'styles' | 'symbols' | 'sandbox';
  onTabChange?: (tab: 'docs' | 'tikz' | 'styles' | 'symbols' | 'sandbox') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onCloneDoc,
  onDeleteDoc,
  onInsertSnippet,
  onCloseSidebar,
  styleFiles,
  onUploadStyFiles,
  onToggleStyFile,
  onDeleteStyFile,
  onOpenEditStyFile,
  onDownloadStyFile,
  activeTab: externalActiveTab,
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'docs' | 'tikz' | 'styles' | 'symbols' | 'sandbox'>('docs');
  const activeTab = externalActiveTab || internalActiveTab;

  const handleSetActiveTab = (tab: 'docs' | 'tikz' | 'styles' | 'symbols' | 'sandbox') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Symbols tab state
  const [symbolSearch, setSymbolSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Ký tự Hy Lạp (Greek)': true,
    'Giải tích & Toán tử (Calculus)': true,
    'Khối môi trường (Environments)': true,
  });

  // Styles tab state
  const [expandedStyles, setExpandedStyles] = useState<Record<string, boolean>>({
    'sty-standard-math': true,
  });

  // TikZ tab state
  const [tikzSearch, setTikzSearch] = useState('');
  const [selectedTikzCategory, setSelectedTikzCategory] = useState<string>('all');
  const [expandedTikzCategories, setExpandedTikzCategories] = useState<Record<string, boolean>>({
    'co-ban': true,
    'he-toa-do': true,
    'diem-doan-thang': true,
    'bang-bien-thien': true,
  });
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const styFileInputRef = useRef<HTMLInputElement>(null);

  // Sandbox state
  const [sandboxLatex, setSandboxLatex] = useState('\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [sandboxError, setSandboxError] = useState('');

  // Render sandbox KaTeX
  React.useEffect(() => {
    try {
      const rendered = katex.renderToString(sandboxLatex, {
        displayMode: true,
        throwOnError: false,
      });
      setSandboxOutput(rendered);
      setSandboxError('');
    } catch (err: unknown) {
      setSandboxError(err instanceof Error ? err.message : String(err));
    }
  }, [sandboxLatex]);

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const toggleTikzCategory = (catId: string) => {
    setExpandedTikzCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleStyleExpand = (styleId: string) => {
    setExpandedStyles(prev => ({ ...prev, [styleId]: !prev[styleId] }));
  };

  const handleStyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadStyFiles(e.target.files);
      if (e.target) e.target.value = '';
    }
  };

  const handleCopySnippet = (snippet: TikzSnippet, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(snippet.code);
    setCopiedSnippetId(snippet.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Filter symbols based on search
  const filteredCategories = LATEX_SYMBOL_CATEGORIES.map(cat => {
    if (!symbolSearch.trim()) return cat;
    const query = symbolSearch.toLowerCase();
    const items = cat.items.filter(
      item =>
        item.label.toLowerCase().includes(query) ||
        item.latex.toLowerCase().includes(query) ||
        item.tooltip?.toLowerCase().includes(query)
    );
    return { ...cat, items };
  }).filter(cat => cat.items.length > 0);

  // Filter TikZ snippets based on search and category
  const filteredTikzCategories = TIKZ_LIBRARY_CATEGORIES.map(cat => {
    if (selectedTikzCategory !== 'all' && cat.id !== selectedTikzCategory) {
      return null;
    }
    if (!tikzSearch.trim()) return cat;
    const query = tikzSearch.toLowerCase();
    const snippets = cat.snippets.filter(
      snip =>
        snip.title.toLowerCase().includes(query) ||
        snip.description.toLowerCase().includes(query) ||
        snip.code.toLowerCase().includes(query) ||
        snip.pageRef?.toLowerCase().includes(query)
    );
    return { ...cat, snippets };
  }).filter((cat): cat is typeof TIKZ_LIBRARY_CATEGORIES[0] => cat !== null && cat.snippets.length > 0);

  const totalTikzSnippetsCount = TIKZ_LIBRARY_CATEGORIES.reduce((acc, cat) => acc + cat.snippets.length, 0);
  const activeStylesCount = styleFiles.filter(s => s.enabled).length;

  // Icon mapping for TikZ categories
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Grid': return <Grid className="w-3.5 h-3.5 text-sky-400" />;
      case 'Compass': return <Compass className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Circle': return <Circle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Box': return <Box className="w-3.5 h-3.5 text-amber-400" />;
      case 'Table': return <Table className="w-3.5 h-3.5 text-purple-400" />;
      case 'Activity': return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'Paintbrush': return <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Spline': return <Spline className="w-3.5 h-3.5 text-orange-400" />;
      default: return <Shapes className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <aside className="w-80 h-full border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 z-10 text-neutral-200">
      {/* Sidebar Header Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-2 py-2">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          <button
            onClick={() => handleSetActiveTab('docs')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Tài liệu ({documents.length})
          </button>

          {/* TikZ Library Tab */}
          <button
            onClick={() => handleSetActiveTab('tikz')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'tikz'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
            }`}
            title="Thư viện khối lệnh TikZ và tkz-tab (Sách hướng dẫn)"
          >
            <Shapes className="w-3.5 h-3.5 text-indigo-300" />
            <span>Khối TikZ</span>
            <span className="text-[10px] bg-indigo-950/80 text-indigo-200 px-1 rounded font-mono">
              {totalTikzSnippetsCount}
            </span>
          </button>

          <button
            onClick={() => handleSetActiveTab('styles')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'styles'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Thư viện gói .sty mở rộng"
          >
            <Package className="w-3 h-3 text-indigo-400" />
            <span>Gói .sty</span>
          </button>

          <button
            onClick={() => handleSetActiveTab('symbols')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'symbols'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ký hiệu
          </button>

          <button
            onClick={() => handleSetActiveTab('sandbox')}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'sandbox'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Thử KaTeX
          </button>
        </div>

        <button
          onClick={onCloseSidebar}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors shrink-0 ml-1"
          title="Đóng thanh bên"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Documents Management */}
      {activeTab === 'docs' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="mx-3 mt-2.5 p-2 bg-neutral-900/90 rounded border border-neutral-800 text-[11px] text-neutral-400 leading-normal flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <span>Tài liệu chỉ tồn tại trong phiên duyệt này. Hãy tải tệp <strong>.tex</strong> về máy khi cần lưu lại.</span>
          </div>

          <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Tài liệu trong phiên
            </span>
            <button
              onClick={onCreateDoc}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-colors"
              title="Tạo tài liệu LaTeX mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo mới</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {documents.map(doc => {
              const isActive = doc.id === activeDocId;
              const dateStr = new Date(doc.updatedAt).toLocaleDateString('vi-VN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors border ${
                    isActive
                      ? 'bg-neutral-900 border-indigo-500/50 text-white'
                      : 'border-transparent hover:bg-neutral-900/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    <FileText className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium truncate">{doc.title}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{dateStr}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloneDoc(doc.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                      title="Nhân bản tài liệu này"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {documents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(doc.id);
                        }}
                        className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800"
                        title="Xóa tài liệu khỏi phiên"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: TikZ Snippets & Commands Library (Requested Feature) */}
      {activeTab === 'tikz' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Search for TikZ */}
          <div className="p-2 border-b border-neutral-800 bg-neutral-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={tikzSearch}
                onChange={(e) => setTikzSearch(e.target.value)}
                placeholder="Tìm khối TikZ: khvuong, Oxy, tkz-tab, nón, trụ..."
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded outline-none focus:border-indigo-500 text-neutral-200"
              />
              {tikzSearch && (
                <button
                  onClick={() => setTikzSearch('')}
                  className="absolute right-2 top-2 text-neutral-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                onClick={() => setSelectedTikzCategory('all')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'all'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedTikzCategory('he-toa-do')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'he-toa-do'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Oxy & Lưới
              </button>
              <button
                onClick={() => setSelectedTikzCategory('diem-doan-thang')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'diem-doan-thang'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Điểm & Vuông góc
              </button>
              <button
                onClick={() => setSelectedTikzCategory('hinh-khong-gian')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'hinh-khong-gian'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Trụ/Nón/Cầu
              </button>
              <button
                onClick={() => setSelectedTikzCategory('bang-bien-thien')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'bang-bien-thien'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Bảng tkz-tab
              </button>
              <button
                onClick={() => setSelectedTikzCategory('do-thi-ham-so')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'do-thi-ham-so'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Đồ thị hàm
              </button>
              <button
                onClick={() => setSelectedTikzCategory('to-mien-dien-tich')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'to-mien-dien-tich'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Tô miền tích phân
              </button>
              <button
                onClick={() => setSelectedTikzCategory('duong-cong-controls')}
                className={`px-2 py-0.5 text-[11px] rounded whitespace-nowrap transition-colors ${
                  selectedTikzCategory === 'duong-cong-controls'
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Controls & Bezier
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="px-3 py-1.5 bg-indigo-950/40 border-b border-neutral-800/80 text-[11px] text-indigo-300 flex items-center justify-between">
            <span>Tham chiếu giáo trình TikZ (Duy Tiên)</span>
            <span className="font-mono text-[10px] text-neutral-400">{filteredTikzCategories.length} nhóm</span>
          </div>

          {/* TikZ Snippets List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
            {filteredTikzCategories.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-30 text-neutral-400" />
                <p>Không tìm thấy khối TikZ phù hợp với từ khóa.</p>
              </div>
            ) : (
              filteredTikzCategories.map(cat => {
                const isExpanded = expandedTikzCategories[cat.id] ?? true;

                return (
                  <div key={cat.id} className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/40">
                    {/* Category Title Header */}
                    <button
                      onClick={() => toggleTikzCategory(cat.id)}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900/80 transition-colors border-b border-neutral-800/60"
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat.iconName)}
                        <span>{cat.name}</span>
                        <span className="text-[10px] font-normal text-neutral-500">
                          ({cat.snippets.length})
                        </span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />}
                    </button>

                    {/* Snippets within category */}
                    {isExpanded && (
                      <div className="p-2 space-y-2 bg-neutral-950/60">
                        {cat.snippets.map(snip => {
                          const isCopied = copiedSnippetId === snip.id;

                          return (
                            <div
                              key={snip.id}
                              className="p-2.5 rounded-md border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 transition-colors flex flex-col gap-2 group"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                                    <span>{snip.title}</span>
                                    {snip.pageRef && (
                                      <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded font-mono">
                                        {snip.pageRef}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                                    {snip.description}
                                  </p>
                                </div>
                              </div>

                              {/* Code preview snippet */}
                              <div className="p-1.5 rounded bg-neutral-950 border border-neutral-800/80 font-mono text-[10px] text-neutral-300 max-h-24 overflow-x-auto whitespace-pre leading-normal">
                                {snip.code.trim()}
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                  onClick={(e) => handleCopySnippet(snip, e)}
                                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                                  title="Sao chép đoạn mã TikZ này"
                                >
                                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                                </button>
                                <button
                                  onClick={() => onInsertSnippet(snip.code)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors shadow-xs"
                                  title="Chèn mã TikZ vào tài liệu hiện tại"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Chèn vào mã</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: .STY Package Library Management */}
      {activeTab === 'styles' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between gap-1.5 bg-neutral-950">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thư viện gói (.sty)</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {activeStylesCount}/{styleFiles.length} gói đang kích hoạt
              </div>
            </div>

            <div className="flex items-center gap-1">
              <input
                ref={styFileInputRef}
                type="file"
                accept=".sty,.tex,.txt"
                multiple
                onChange={handleStyFileChange}
                className="hidden"
              />
              <button
                onClick={() => styFileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                title="Tải lên tệp .sty từ máy tính (hỗ trợ chọn nhiều file)"
              >
                <Upload className="w-3 h-3" />
                <span>Tải .sty</span>
              </button>

              <button
                onClick={() => onOpenEditStyFile(null)}
                className="p-1 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                title="Tạo tệp gói .sty mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-3 py-2 bg-neutral-900/60 border-b border-neutral-800/80 text-[11px] text-neutral-400 leading-normal flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>Các lệnh <code>\newcommand</code> trong file .sty sẽ được tự động nạp vào KaTeX để hiển thị công thức ngay lập tức!</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {styleFiles.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30 text-neutral-400" />
                <p>Chưa có gói thư viện .sty nào.</p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Nhấn "Tải .sty" ở trên để tải các tệp định nghĩa từ máy tính của bạn.
                </p>
              </div>
            ) : (
              styleFiles.map(sty => {
                const isExpanded = expandedStyles[sty.id] ?? true;
                const pkgBaseName = sty.name.replace(/\.sty$/i, '');

                return (
                  <div
                    key={sty.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      sty.enabled
                        ? 'border-neutral-800 bg-neutral-900/50'
                        : 'border-neutral-800/50 bg-neutral-950/40 opacity-75'
                    }`}
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2 border-b border-neutral-800/60">
                      <div 
                        onClick={() => toggleStyleExpand(sty.id)}
                        className="flex items-center gap-2 flex-1 overflow-hidden cursor-pointer select-none"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${sty.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            <span>{sty.name}</span>
                            <span className="text-[10px] font-normal text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded font-mono">
                              {sty.macros.length} macro
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onToggleStyFile(sty.id)}
                          className={`p-1 rounded transition-colors ${
                            sty.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-neutral-500 hover:text-neutral-400'
                          }`}
                          title={sty.enabled ? 'Đang bật (Nhấp để tạm ngắt)' : 'Đang tắt (Nhấp để kích hoạt)'}
                        >
                          {sty.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => onDownloadStyFile(sty)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          title="Tải tệp .sty này về máy tính"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenEditStyFile(sty)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                          title="Chỉnh sửa nội dung .sty"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteStyFile(sty.id)}
                          className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800"
                          title="Xóa tệp .sty khỏi phiên làm việc"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-2.5 bg-neutral-950/70 space-y-2">
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="text-neutral-400">Khai báo gói trong mã LaTeX:</span>
                          <button
                            onClick={() => onInsertSnippet(`\\usepackage{${pkgBaseName}}\n`)}
                            className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-indigo-300 font-mono text-[10px] rounded border border-neutral-700 transition-colors"
                            title="Chèn lệnh \usepackage{...} vào văn bản"
                          >
                            + \usepackage{'{'}{pkgBaseName}{'}'}
                          </button>
                        </div>

                        {sty.macros.length > 0 ? (
                          <div>
                            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1.5">
                              Nhấp để chèn macro vào văn bản:
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                              {sty.macros.map((m, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => onInsertSnippet(m.snippet)}
                                  className="px-2 py-1 bg-neutral-900 hover:bg-indigo-600 hover:text-white text-neutral-300 font-mono text-[11px] rounded border border-neutral-800 transition-colors flex items-center gap-1 group/btn"
                                  title={`${m.name} -> ${m.definition} (Nhấp để chèn)`}
                                >
                                  <span>{m.name}</span>
                                  {m.argsCount > 0 && (
                                    <span className="text-[9px] text-neutral-500 group-hover/btn:text-indigo-200">
                                      [{m.argsCount}]
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500 italic">
                            Chưa tìm thấy macro \newcommand hoặc \DeclareMathOperator trong tệp này.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Symbols Palette */}
      {activeTab === 'symbols' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-neutral-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                placeholder="Tìm ký hiệu: alpha, int, le..."
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded outline-none focus:border-indigo-500 text-neutral-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {filteredCategories.map(cat => {
              const isExpanded = expandedCategories[cat.name] ?? false;
              return (
                <div key={cat.name} className="border border-neutral-800/80 rounded-md overflow-hidden bg-neutral-900/40">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/80 transition-colors"
                  >
                    <span>{cat.name}</span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-2 grid grid-cols-4 gap-1.5 border-t border-neutral-800/80 bg-neutral-950/60">
                      {cat.items.map(item => (
                        <button
                          key={item.latex}
                          onClick={() => onInsertSnippet(item.snippet)}
                          className="h-8 flex items-center justify-center text-xs font-mono bg-neutral-900 hover:bg-indigo-600 hover:text-white rounded border border-neutral-800 text-neutral-300 transition-colors"
                          title={`${item.tooltip || item.latex} (${item.latex}) - Nhấp để chèn`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Formula Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-3">
          <div className="text-xs text-neutral-400">
            Khu vực thử nghiệm nhanh công thức toán học KaTeX trước khi chèn vào văn bản:
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-400 mb-1 block">
              Mã LaTeX:
            </label>
            <textarea
              value={sandboxLatex}
              onChange={(e) => setSandboxLatex(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono bg-neutral-900 border border-neutral-800 rounded p-2 text-neutral-200 outline-none focus:border-indigo-500"
              placeholder="Nhập mã công thức toán..."
            />
          </div>

          <div>
            <div className="text-[11px] font-medium text-neutral-400 mb-1">
              Kết quả hiển thị:
            </div>
            <div className="p-3 bg-white text-neutral-900 rounded-md min-h-[70px] flex items-center justify-center overflow-x-auto border border-neutral-700">
              {sandboxError ? (
                <span className="text-xs text-rose-600 font-mono">{sandboxError}</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: sandboxOutput }} />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onInsertSnippet(`\n\\begin{equation}\n  ${sandboxLatex.trim()}\n\\end{equation}\n`)}
              className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors text-center"
            >
              Chèn dạng Equation
            </button>
            <button
              onClick={() => onInsertSnippet(`$${sandboxLatex.trim()}$`)}
              className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded transition-colors"
              title="Chèn nội dòng ($...$)"
            >
              Chèn Inline
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
