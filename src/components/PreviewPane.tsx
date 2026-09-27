import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Printer, 
  FileDown,
  Sun, 
  Moon, 
  Copy, 
  Check, 
  FileCheck
} from 'lucide-react';
import { CompilerResult } from '../utils/latexCompiler';

interface PreviewPaneProps {
  compilerResult: CompilerResult | null;
  isCompiling: boolean;
  onExportPdf: () => void;
  onSystemPrint?: () => void;
  isExportingPdf?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  compilerResult,
  isCompiling,
  onExportPdf,
  onSystemPrint,
  isExportingPdf,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [paperTheme, setPaperTheme] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    if (!compilerResult?.html) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = compilerResult.html;
    navigator.clipboard.writeText(tempDiv.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-900 overflow-hidden relative">
      {/* Preview Toolbar */}
      <div className="h-9 border-b border-neutral-800 bg-neutral-950 px-3 flex items-center justify-between gap-2 select-none shrink-0 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="font-medium text-neutral-200">Trang xem trước</span>
          {compilerResult && (
            <>
              <span className="text-neutral-600">·</span>
              <span className="font-mono text-[11px]">
                Ước tính: ~{compilerResult.metrics.estimatedPages} trang A4
              </span>
              <span className="text-neutral-600">·</span>
              <span className="font-mono text-[11px]">
                {compilerResult.metrics.wordCount} từ
              </span>
            </>
          )}
        </div>

        {/* Zoom & Theme Controls */}
        <div className="flex items-center gap-1.5">
          {/* Paper theme toggle */}
          <button
            onClick={() => setPaperTheme(t => t === 'light' ? 'dark' : 'light')}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title={paperTheme === 'light' ? 'Chuyển sang nền tối bảo vệ mắt' : 'Chuyển sang nền giấy trắng A4'}
          >
            {paperTheme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Copy formatted text */}
          <button
            onClick={handleCopyText}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Sao chép nội dung văn bản"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Direct PDF Download */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-2 py-1 text-emerald-400 hover:text-white rounded hover:bg-emerald-950/80 border border-emerald-900/60 transition-colors disabled:opacity-50"
            title="Tải ngay file PDF (.pdf) chuẩn A4 chất lượng cao"
          >
            {isExportingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] font-medium hidden sm:inline">
              {isExportingPdf ? 'Đang tạo...' : 'Tải PDF'}
            </span>
          </button>

          {/* System Print */}
          {onSystemPrint && (
            <button
              onClick={onSystemPrint}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
              title="Mở hộp thoại in hệ thống (Print dialog)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-3 w-px bg-neutral-800 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center font-mono text-[11px] text-neutral-400">
            {zoomLevel}%
          </span>

          <button
            onClick={() => setZoomLevel(z => Math.min(160, z + 10))}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel(100)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            title="Đặt lại 100%"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Document Paper Scroll View */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-neutral-900/90 relative">
        {isCompiling && (
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-xs text-neutral-200 shadow-lg">
              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Đang biên dịch LaTeX...</span>
            </div>
          </div>
        )}

        {compilerResult ? (
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-[850px] shrink-0"
          >
            {/* The A4 Simulation Sheet */}
            <article
              id="latex-printable-document"
              className={`latex-paper transition-colors duration-200 min-h-[1100px] w-full p-8 sm:p-14 md:p-16 rounded-sm shadow-2xl ${
                paperTheme === 'light'
                  ? 'bg-white text-neutral-900 border border-neutral-300'
                  : 'bg-neutral-950 text-neutral-100 border border-neutral-800'
              }`}
            >
              {compilerResult.html ? (
                <div
                  className="latex-font-serif text-[15px] leading-relaxed text-justify space-y-4"
                  dangerouslySetInnerHTML={{ __html: compilerResult.html }}
                />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                  <FileCheck className="w-8 h-8 mb-2 opacity-40" />
                  <span>Tài liệu chưa có nội dung hiển thị</span>
                </div>
              )}
            </article>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs">
            <p>Nhấn "Biên dịch" (Ctrl + Enter) để tạo trang xem trước.</p>
          </div>
        )}
      </div>
    </div>
  );
};
