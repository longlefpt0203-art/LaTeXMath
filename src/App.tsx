import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  FileDown, 
  FolderOpen, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Trash2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { compileLaTeX, CompilerResult } from './utils/latexCompiler';
import { LATEX_TEMPLATES } from './data/templates';
import { SAMPLE_STY_PACKAGES } from './utils/styParser';
import { downloadLatexPdf, generateLatexPdfBlob } from './utils/pdfExporter';

export default function App() {
  // Default code: Đề thi Toán Chuẩn (ex_test.sty & TikZ)
  const defaultExamCode = LATEX_TEMPLATES[0]?.code || '';

  const [code, setCode] = useState<string>(defaultExamCode);
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [viewMode, setViewMode] = useState<'pages' | 'pdf'>('pages');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // PDF export state
  const [pdfStatus, setPdfStatus] = useState<{
    loading: boolean;
    message: string;
    type?: 'info' | 'success' | 'error';
  }>({
    loading: false,
    message: '',
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compile LaTeX code
  const handleCompile = useCallback((codeToCompile: string = code) => {
    setIsCompiling(true);
    requestAnimationFrame(() => {
      const res = compileLaTeX(codeToCompile, SAMPLE_STY_PACKAGES);
      setCompilerResult(res);
      setIsCompiling(false);
    });
  }, [code]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile(defaultExamCode);
  }, []);

  // Whenever compilation completes, generate the actual PDF Blob for native preview
  useEffect(() => {
    if (!compilerResult) return;
    const timer = setTimeout(async () => {
      try {
        setIsGeneratingPdf(true);
        const { url } = await generateLatexPdfBlob('latex-printable-document');
        setPdfBlobUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        console.warn('Tự động tạo PDF nhúng đang chờ phần tử tài liệu...', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [compilerResult]);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  // Sync scrolling between line numbers and textarea
  const handleTextareaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Track cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const { selectionStart } = textareaRef.current;
    const textBefore = code.substring(0, selectionStart);
    const line = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const col = selectionStart - lastNewline;
    setCursorInfo({ line, col });
  };

  // Keyboard shortcut: Ctrl+Enter (Compile) & Tab indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompile();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      }, 0);
      return;
    }

    // Auto-close pairs: { } ( ) [ ]
    const pairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
    };

    if (pairs[e.key]) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const closeChar = pairs[e.key];

      e.preventDefault();
      const selected = code.substring(start, end);
      const newCode = code.substring(0, start) + e.key + selected + closeChar + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        updateCursorPosition();
      }, 0);
    }
  };

  // Direct PDF Export & Download
  const handleExportPdf = async () => {
    if (pdfStatus.loading) return;

    if (!compilerResult) {
      handleCompile();
      await new Promise(r => setTimeout(r, 200));
    }

    setPdfStatus({
      loading: true,
      message: 'Đang kết xuất tệp PDF in chuẩn A4...',
      type: 'info',
    });

    try {
      const result = await downloadLatexPdf('latex-printable-document', {
        filename: 'De_thi_Toan_LaTeX.pdf',
        onProgress: (msg) => {
          setPdfStatus({ loading: true, message: msg, type: 'info' });
        },
      });

      setPdfStatus({
        loading: false,
        message: result.message,
        type: 'success',
      });

      setTimeout(() => {
        setPdfStatus(prev => ({ ...prev, message: '' }));
      }, 3500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setPdfStatus({
        loading: false,
        message: `Lỗi xuất PDF: ${errorMsg}`,
        type: 'error',
      });
      setTimeout(() => {
        setPdfStatus(prev => ({ ...prev, message: '' }));
      }, 5000);
    }
  };

  // Open .tex file from user computer
  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCode(content);
        handleCompile(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download .tex source file
  const handleDownloadTex = () => {
    const blob = new Blob([code], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.tex';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset to default exam template
  const handleLoadExamTemplate = () => {
    setCode(defaultExamCode);
    handleCompile(defaultExamCode);
  };

  // Clear code
  const handleClearCode = () => {
    const blankDoc = `\\documentclass[a4paper,12pt]{article}\n\\usepackage{amsmath,amssymb}\n\\usepackage{tikz}\n\\usepackage{ex_test}\n\n\\begin{document}\n\n\\begin{center}\n{\\bf TIÊU ĐỀ TÀI LIỆU}\n\\end{center}\n\n\\begin{ex}\nNội dung câu hỏi trắc nghiệm.\n\\choice\n{Phương án A}\n{\\True Phương án B đúng}\n{Phương án C}\n{Phương án D}\n\\loigiai{Nội dung lời giải chi tiết.}\n\\end{ex}\n\n\\end{document}`;
    setCode(blankDoc);
    handleCompile(blankDoc);
  };

  const lines = code.split('\n');
  const lineCount = lines.length;
  const firstError = compilerResult?.logs?.find(l => l.type === 'error');
  const pagesList = compilerResult?.pages || [];
  const totalPages = pagesList.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Top Header Bar - Direct & Focused */}
      <header className="h-12 border-b border-neutral-800 bg-neutral-950 px-4 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Biên dịch LaTeX sang PDF
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                ex_test.sty · TikZ · Trang in thật
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Load Sample Exam Button */}
          <button
            onClick={handleLoadExamTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors"
            title="Nạp lại mẫu Đề thi Toán chuẩn (ex_test.sty & TikZ)"
          >
            <span>Mẫu đề thi (ex_test)</span>
          </button>

          {/* Import .tex */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded cursor-pointer transition-colors">
            <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Mở .tex</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".tex,.txt"
              onChange={handleOpenFile}
              className="hidden"
            />
          </label>

          {/* Download .tex */}
          <button
            onClick={handleDownloadTex}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors"
            title="Tải mã nguồn .tex về máy"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Tải .tex</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClearCode}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 rounded transition-colors"
            title="Xóa trắng mã nguồn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Compile Button */}
          <button
            onClick={() => handleCompile()}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow-xs transition-colors disabled:opacity-50"
            title="Biên dịch LaTeX sang trang PDF thật (Ctrl + Enter)"
          >
            {isCompiling ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isCompiling ? 'Đang biên dịch...' : 'Biên dịch (Ctrl+Enter)'}</span>
          </button>

          {/* Direct PDF Export Button */}
          <button
            onClick={handleExportPdf}
            disabled={pdfStatus.loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded shadow-xs transition-colors disabled:opacity-50"
            title="Xuất và tải ngay file PDF chuẩn A4 về máy tính"
          >
            {pdfStatus.loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{pdfStatus.loading ? 'Đang xuất PDF...' : 'Xuất file PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Content: Exactly 2 Frames (Left: Code LaTeX, Right: Real PDF Output) */}
      <main className="flex-1 flex overflow-hidden">
        {/* FRAME 1 (LEFT): KHUNG CODE LATEX */}
        <section className="w-1/2 h-full flex flex-col border-r border-neutral-800 bg-neutral-950 overflow-hidden">
          {/* Frame 1 Header */}
          <div className="h-8 border-b border-neutral-800 bg-neutral-900/80 px-3 flex items-center justify-between text-xs text-neutral-400 select-none shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-200">1. Khung mã nguồn LaTeX</span>
              <span className="text-neutral-600">|</span>
              <span className="font-mono text-[11px] text-neutral-400">{lineCount} dòng</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
              <span>Dòng {cursorInfo.line}, Cột {cursorInfo.col}</span>
              <span className="text-indigo-400 font-sans hidden md:inline">Ctrl + Enter: Biên dịch</span>
            </div>
          </div>

          {/* Text Editor Area with Line Numbers */}
          <div className="flex-1 flex overflow-hidden relative font-mono text-sm bg-neutral-950">
            {/* Line numbers gutter */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 bg-neutral-950 text-neutral-600 border-r border-neutral-900 select-none overflow-hidden text-right pr-2 text-xs font-mono shrink-0 leading-[1.6rem]"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="h-[1.6rem]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={handleTextareaScroll}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="flex-1 h-full py-3 px-3 bg-transparent text-neutral-100 resize-none outline-none font-mono text-xs leading-[1.6rem] whitespace-pre overflow-auto tab-size-2 selection:bg-indigo-600/40"
              placeholder="Nhập mã LaTeX của bạn tại đây..."
            />
          </div>

          {/* Frame 1 Footer: Error indicator if compilation has issues */}
          {firstError && (
            <div className="px-3 py-2 bg-rose-950/60 border-t border-rose-900/80 text-rose-200 text-xs flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-mono text-[11px] font-semibold text-rose-300">
                {firstError.line ? `Dòng ${firstError.line}: ` : ''}
              </span>
              <span className="truncate">{firstError.message}</span>
            </div>
          )}
        </section>

        {/* FRAME 2 (RIGHT): KHUNG TRANG GIẤY PDF BIÊN DỊCH THẬT */}
        <section className="w-1/2 h-full flex flex-col bg-neutral-900 overflow-hidden">
          {/* Frame 2 Header */}
          <div className="h-8 border-b border-neutral-800 bg-neutral-950 px-3 flex items-center justify-between text-xs select-none shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-200">2. Trang giấy PDF biên dịch thật</span>
              {compilerResult && (
                <>
                  <span className="text-neutral-600">|</span>
                  <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Khổ A4 ({totalPages} trang)
                  </span>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* View Mode Toggle: Trang in A4 vs Trình xem PDF nhúng */}
              <div className="flex items-center bg-neutral-900 p-0.5 rounded border border-neutral-800 text-[11px]">
                <button
                  onClick={() => setViewMode('pages')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'pages'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Hiển thị từng trang giấy in A4 chuẩn LaTeX"
                >
                  Trang in A4
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'pdf'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Xem file PDF thật bằng trình xem nhúng"
                >
                  Tệp PDF nhúng
                </button>
              </div>

              <div className="h-3 w-px bg-neutral-800 mx-0.5" />

              {/* Zoom Controls (Active in Pages Mode) */}
              {viewMode === 'pages' && (
                <>
                  <button
                    onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                    title="Thu nhỏ (-10%)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-9 text-center font-mono text-[11px] text-neutral-400">
                    {zoomLevel}%
                  </span>

                  <button
                    onClick={() => setZoomLevel(z => Math.min(160, z + 10))}
                    className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                    title="Phóng to (+10%)"
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
                  <div className="h-3 w-px bg-neutral-800 mx-0.5" />
                </>
              )}

              {/* Open in new tab if PDF Blob ready */}
              {pdfBlobUrl && (
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors flex items-center"
                  title="Mở file PDF thật trong tab riêng"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {/* Print */}
              <button
                onClick={() => window.print()}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                title="In tài liệu"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Direct PDF Download button in toolbar */}
              <button
                onClick={handleExportPdf}
                disabled={pdfStatus.loading}
                className="flex items-center gap-1 px-2 py-0.5 text-emerald-400 hover:text-white rounded hover:bg-emerald-950 border border-emerald-800/80 transition-colors text-[11px]"
                title="Tải tệp .pdf về máy"
              >
                <FileDown className="w-3 h-3" />
                <span>Tải PDF</span>
              </button>
            </div>
          </div>

          {/* Viewport: Either Discrete A4 Sheets or Native PDF Viewer */}
          <div className="flex-1 overflow-auto bg-neutral-900/95 relative flex justify-center">
            {isCompiling && (
              <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200 shadow-xl">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang biên dịch tài liệu LaTeX...</span>
                </div>
              </div>
            )}

            {compilerResult ? (
              <>
                {/* 1. VIEW MODE: PAGINATED REAL A4 PAPER SHEETS */}
                <div
                  id="latex-printable-document"
                  style={{
                    display: viewMode === 'pages' ? 'flex' : 'none',
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.1s ease-out',
                  }}
                  className="flex-col items-center gap-8 py-8 w-full max-w-[850px] shrink-0"
                >
                  {pagesList.map((pageHtml, idx) => (
                    <article
                      key={idx}
                      className="a4-page-sheet w-full max-w-[794px] min-h-[1123px] bg-white text-neutral-900 border border-neutral-300 shadow-2xl p-10 sm:p-14 md:p-16 flex flex-col justify-between relative box-border"
                    >
                      {/* Paper Top Header (True LaTeX paper header) */}
                      <div className="text-[11px] text-neutral-500 border-b border-neutral-300 pb-1 mb-5 flex justify-between font-serif select-none">
                        <span>{compilerResult.metadata.title || 'ĐỀ THI KHẢO SÁT CHẤT LƯỢNG MÔN TOÁN'}</span>
                        <span>Khổ giấy in A4</span>
                      </div>

                      {/* Paper Body Content (Academic LaTeX serif typesetting) */}
                      <div
                        className="latex-font-serif text-[14px] leading-relaxed text-justify flex-1 space-y-2"
                        dangerouslySetInnerHTML={{ __html: pageHtml }}
                      />

                      {/* Paper Bottom Footer with Standard LaTeX Page Numbering */}
                      <div className="pt-4 mt-6 border-t border-neutral-200 text-center text-xs text-neutral-600 font-serif select-none">
                        - Trang {idx + 1}/{totalPages} -
                      </div>
                    </article>
                  ))}
                </div>

                {/* 2. VIEW MODE: EMBEDDED NATIVE PDF VIEWER */}
                {viewMode === 'pdf' && (
                  <div className="w-full h-full flex flex-col bg-neutral-900">
                    {pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                        className="w-full h-full border-0 bg-neutral-900"
                        title="Tệp PDF LaTeX thật"
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 text-xs">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <span>Đang xuất tệp PDF nhúng ({isGeneratingPdf ? 'đang tạo trang in...' : 'chờ biên dịch'})...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs">
                <BookOpen className="w-8 h-8 text-neutral-600 mb-2" />
                <p>Nhấn "Biên dịch" (Ctrl + Enter) để tạo bản PDF thật.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Status Notification for PDF Generation */}
      {pdfStatus.message && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded shadow-xl border text-xs font-medium bg-neutral-900 border-neutral-700 text-neutral-100 max-w-sm pointer-events-auto">
          {pdfStatus.loading && (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {pdfStatus.type === 'success' && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          {pdfStatus.type === 'error' && (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="leading-snug">{pdfStatus.message}</span>
        </div>
      )}
    </div>
  );
}
