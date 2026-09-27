import React from 'react';
import { 
  Play, 
  FileDown, 
  Printer, 
  LayoutTemplate, 
  Upload, 
  Columns, 
  Code, 
  Eye,
  FolderOpen,
  ShieldAlert,
  Package,
  Shapes
} from 'lucide-react';

interface HeaderProps {
  documentTitle: string;
  onUpdateTitle: (title: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  onChangeViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  onOpenTemplates: () => void;
  onOpenTikz?: () => void;
  onOpenStyles?: () => void;
  activeStylesCount?: number;
  onRequestDownloadTex: () => void;
  onExportPdf: () => void;
  onSystemPrint?: () => void;
  isExportingPdf?: boolean;
  onImportTex: (file: File) => void;
  autoCompile: boolean;
  onToggleAutoCompile: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  metrics: {
    compileTimeMs: number;
    equationCount: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  documentTitle,
  onUpdateTitle,
  onCompile,
  isCompiling,
  viewMode,
  onChangeViewMode,
  onOpenTemplates,
  onOpenTikz,
  onOpenStyles,
  activeStylesCount,
  onRequestDownloadTex,
  onExportPdf,
  onSystemPrint,
  isExportingPdf,
  onImportTex,
  autoCompile,
  onToggleAutoCompile,
  onToggleSidebar,
  isSidebarOpen,
  metrics,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportTex(file);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950 px-3 sm:px-4 flex items-center justify-between gap-2 select-none z-20 shrink-0">
      {/* Zone 1: Brand & Project Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          title="Mở thanh quản lý tài liệu & ký hiệu"
          className={`p-1.5 rounded text-neutral-400 hover:text-white transition-colors ${
            isSidebarOpen ? 'bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-white latex-font-serif">
            LaTeX Studio
          </span>
          <span className="text-xs text-neutral-400 hidden lg:inline font-mono">v1.0</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-neutral-800 mx-1" />

        {/* Document Title input */}
        <div className="relative flex items-center max-w-[150px] sm:max-w-[210px]">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full text-xs font-medium text-neutral-200 bg-neutral-900/80 hover:bg-neutral-900 focus:bg-neutral-900 border border-transparent hover:border-neutral-700 focus:border-indigo-500 rounded px-2.5 py-1 outline-none transition-colors truncate"
            title="Đổi tên tài liệu cá nhân"
            placeholder="Tên tài liệu..."
          />
        </div>

        {/* Ephemeral Session Status Badge */}
        <div 
          className="hidden md:flex items-center text-[11px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded gap-1.5 font-mono"
          title="Phiên làm việc tạm thời: Không lưu vào trình duyệt hay bộ nhớ máy chủ"
        >
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Không lưu phiên</span>
        </div>
      </div>

      {/* Zone 2: Workspace View Modes & Metrics */}
      <div className="flex items-center gap-2">
        {/* Layout segmented control */}
        <div className="hidden sm:flex items-center p-0.5 bg-neutral-900 rounded-md border border-neutral-800">
          <button
            onClick={() => onChangeViewMode('editor')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'editor'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Chỉ mở khung soạn thảo"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Soạn thảo</span>
          </button>
          <button
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Chia đôi màn hình soạn thảo và xem trước"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Chia đôi</span>
          </button>
          <button
            onClick={() => onChangeViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Chỉ mở trang xem trước kết quả"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Xem trước</span>
          </button>
        </div>

        {/* Quick compile latency metric */}
        {metrics.compileTimeMs > 0 && (
          <div className="hidden xl:flex items-center text-xs text-neutral-400 gap-1 font-mono">
            <span>{metrics.compileTimeMs}ms</span>
            <span>·</span>
            <span>{metrics.equationCount} công thức</span>
          </div>
        )}
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Templates Modal button */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
          title="Chọn mẫu tài liệu LaTeX chuẩn"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Mẫu tài liệu</span>
        </button>

        {/* TikZ Library button */}
        {onOpenTikz && (
          <button
            onClick={onOpenTikz}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-200 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/80 rounded-md transition-colors shadow-xs"
            title="Thư viện các khối lệnh TikZ & Bảng biến thiên (Giáo trình)"
          >
            <Shapes className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Khối TikZ</span>
            <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
              TikZ
            </span>
          </button>
        )}

        {/* Styles Packages button */}
        {onOpenStyles && (
          <button
            onClick={onOpenStyles}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
            title="Quản lý thư viện gói .sty mở rộng"
          >
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Gói .sty</span>
            {activeStylesCount !== undefined && (
              <span className="text-[10px] bg-neutral-800 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                {activeStylesCount}
              </span>
            )}
          </button>
        )}

        {/* Import .tex input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".tex,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
          title="Mở tệp .tex từ máy tính"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Download / Export .tex with confirmation */}
        <button
          onClick={onRequestDownloadTex}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md transition-colors"
          title="Xác nhận tải tệp mã nguồn .tex về máy"
        >
          <FileDown className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Tải .tex</span>
        </button>

        {/* Print / Export to PDF Direct */}
        <div className="flex items-center">
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 transition-colors shadow-xs ${
              onSystemPrint ? 'rounded-l-md border-r-0' : 'rounded-md'
            } disabled:opacity-60`}
            title="Xuất và tải ngay file PDF (.pdf) chuẩn A4 chất lượng cao"
          >
            {isExportingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{isExportingPdf ? 'Đang tạo PDF...' : 'Xuất PDF'}</span>
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1 py-0.2 rounded font-mono font-semibold">
              PDF
            </span>
          </button>
          {onSystemPrint && (
            <button
              onClick={onSystemPrint}
              className="p-1.5 text-emerald-300 hover:text-white bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 rounded-r-md transition-colors"
              title="Mở hộp thoại in hệ thống (Print dialog)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Auto compile toggle */}
        <button
          onClick={onToggleAutoCompile}
          className={`hidden lg:flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-md border transition-colors ${
            autoCompile
              ? 'text-indigo-300 bg-indigo-950/60 border-indigo-800'
              : 'text-neutral-400 bg-neutral-900 border-neutral-800 hover:text-neutral-200'
          }`}
          title="Tự động biên dịch khi gõ phím"
        >
          <span>Tự động: {autoCompile ? 'Bật' : 'Tắt'}</span>
        </button>

        {/* Primary Compile Action */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          title="Biên dịch tài liệu (Phím tắt: Ctrl + Enter hoặc F5)"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Đang dịch...' : 'Biên dịch'}</span>
          <span className="hidden xl:inline text-[10px] opacity-75 font-mono ml-0.5">Ctrl+↵</span>
        </button>
      </div>
    </header>
  );
};

