import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCw,
  FileDown, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Trash2, 
  Undo2, 
  Redo2, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  FileCode, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { compileLaTeX, CompilerResult } from './utils/latexCompiler';
import { LATEX_TEMPLATES } from './data/templates';
import { SAMPLE_STY_PACKAGES } from './utils/styParser';
import { downloadLatexPdf } from './utils/pdfExporter';

export default function App() {
  const defaultExamCode = LATEX_TEMPLATES[0]?.code || '';

  // Core state: Code & History
  const [code, setCode] = useState<string>(defaultExamCode);
  const [history, setHistory] = useState<string[]>([defaultExamCode]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Compiler state: Fast compilation
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);
  const [lastCompileTime, setLastCompileTime] = useState<number>(0);

  // PDF Viewer state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfStatus, setPdfStatus] = useState<{
    loading: boolean;
    message: string;
    type?: 'info' | 'success' | 'error';
  }>({ loading: false, message: '' });
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Editor refs & cursor
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const pdfScrollContainerRef = useRef<HTMLDivElement>(null);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });

  // Update code with undo/redo stack
  const updateCodeWithHistory = (newCode: string) => {
    setCode(newCode);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCode(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCode(next);
    }
  };

  // Blazing fast LaTeX compilation with cached KaTeX formulas and SVG TikZ
  const handleCompile = useCallback((codeToCompile: string = code) => {
    const t0 = performance.now();
    setIsCompiling(true);
    // Instant execution without blocking overhead
    try {
      const res = compileLaTeX(codeToCompile, SAMPLE_STY_PACKAGES);
      const elapsed = Math.round(performance.now() - t0);
      setLastCompileTime(elapsed);
      setCompilerResult(res);
    } finally {
      setIsCompiling(false);
    }
  }, [code]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile(defaultExamCode);
  }, []);

  // Fast auto-compile with optimal debounce (250ms)
  useEffect(() => {
    if (!autoCompile) return;
    const timer = setTimeout(() => {
      handleCompile(code);
    }, 250);
    return () => clearTimeout(timer);
  }, [code, autoCompile, handleCompile]);

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
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      updateCodeWithHistory(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  // Insert helper text at cursor
  const insertTextAtCursor = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = code.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const newCode = code.substring(0, start) + replacement + code.substring(end);

    updateCodeWithHistory(newCode);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + prefix.length + selected.length;
      textarea.setSelectionRange(newCursor, newCursor);
      updateCursorPosition();
    });
  };

  // Jump cursor to specific line
  const jumpToLine = (lineNumber: number) => {
    if (!textareaRef.current) return;
    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(lineNumber - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineNumber - 1]?.length || 0));
    const lineHeight = 24;
    textareaRef.current.scrollTop = Math.max(0, (lineNumber - 4) * lineHeight);
  };

  // Export PDF on demand (only when user clicks button)
  const handleExportPdf = async () => {
    try {
      setPdfStatus({ loading: true, message: 'Đang xuất tệp PDF in A4 chuẩn...', type: 'info' });
      await downloadLatexPdf('latex-printable-document', {
        filename: 'De_thi_Toan_12.pdf',
        onProgress: (msg: string) => {
          setPdfStatus({ loading: true, message: msg, type: 'info' });
        }
      });
      setPdfStatus({ loading: false, message: 'Đã tải tệp PDF về máy thành công!', type: 'success' });
      setTimeout(() => setPdfStatus({ loading: false, message: '' }), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xuất PDF';
      setPdfStatus({ loading: false, message: `Lỗi: ${msg}`, type: 'error' });
      setTimeout(() => setPdfStatus({ loading: false, message: '' }), 4000);
    }
  };

  // Reset to default exam
  const handleResetExam = () => {
    updateCodeWithHistory(defaultExamCode);
    handleCompile(defaultExamCode);
  };

  // Clear code
  const handleClearCode = () => {
    const blankLatex = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amsmath,amssymb}\n\n\\begin{document}\n\nNhập nội dung tài liệu tại đây...\n\n\\end{document}\n`;
    updateCodeWithHistory(blankLatex);
    handleCompile(blankLatex);
  };

  const lines = code.split('\n');
  const lineCount = lines.length;
  const pagesList = compilerResult?.pages && compilerResult.pages.length > 0
    ? compilerResult.pages
    : [compilerResult?.html || ''];
  const totalPages = pagesList.length;

  const errorLogs = compilerResult?.logs.filter(l => l.type === 'error') || [];
  const warningLogs = compilerResult?.logs.filter(l => l.type === 'warning') || [];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-sans select-none">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: MINIMAL & FOCUSED (LaTeX Code Editor + PDF Preview)            */}
      {/* ========================================================================= */}
      <header className="h-11 bg-[#181818] border-b border-[#2d2d2d] px-4 flex items-center justify-between shrink-0 select-none z-20">
        {/* Brand & File Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#138a36] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">LaTeX Studio</span>
          </div>

          <div className="h-4 w-px bg-[#333333] mx-1" />

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242424] border border-[#383838] rounded text-xs font-mono text-neutral-200">
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>main.tex</span>
          </div>

          {/* Compilation Speed Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>⚡ Tốc độ: {lastCompileTime}ms</span>
          </div>
        </div>

        {/* Action Controls: Fast Compile, Auto-compile switch, Download PDF */}
        <div className="flex items-center gap-2.5">
          {/* Auto-compile switch */}
          <label className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#242424] hover:bg-[#2b2b2b] border border-[#383838] cursor-pointer text-xs transition-colors">
            <input 
              type="checkbox" 
              checked={autoCompile}
              onChange={(e) => setAutoCompile(e.target.checked)}
              className="accent-[#138a36] w-3.5 h-3.5 cursor-pointer rounded"
            />
            <span className="text-neutral-300 font-medium text-[11px]">Tự động biên dịch</span>
          </label>

          {/* The Primary High-Speed Compile Button */}
          <button
            onClick={() => handleCompile()}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#138a36] hover:bg-[#10782f] active:bg-[#0c6527] text-white rounded text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Biên dịch ngay lập tức (Phím tắt: Ctrl + Enter)"
          >
            {isCompiling ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isCompiling ? 'Đang biên dịch...' : 'Biên dịch (Ctrl+Enter)'}</span>
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleExportPdf}
            disabled={pdfStatus.loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#353535] border border-[#444444] text-white rounded text-xs font-medium transition-colors cursor-pointer"
            title="Tải tệp PDF in ấn về máy tính"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải PDF</span>
          </button>

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="p-1.5 text-neutral-300 hover:text-white bg-[#2a2a2a] hover:bg-[#353535] border border-[#444444] rounded transition-colors"
            title="In ấn tài liệu trực tiếp"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2-PANE WORKSPACE: LEFT = LATEX CODE PANE, RIGHT = PDF PREVIEW PANE         */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ======================================================================= */}
        {/* KHUNG CODE LATEX (LEFT PANE)                                            */}
        {/* ======================================================================= */}
        <section className="w-1/2 h-full flex flex-col border-r border-[#2d2d2d] bg-[#1e1e1e] overflow-hidden">
          
          {/* Code Editor Header & Quick Formatting Bar */}
          <div className="h-9 bg-[#252526] border-b border-[#2d2d2d] px-3 flex items-center justify-between text-xs shrink-0 select-none">
            {/* Quick Math & Exam Insert Tools */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {/* Undo / Redo */}
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1 hover:text-white hover:bg-[#333333] rounded disabled:opacity-30 transition-colors"
                title="Hoàn tác (Undo)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1 hover:text-white hover:bg-[#333333] rounded disabled:opacity-30 transition-colors"
                title="Làm lại (Redo)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="h-3 w-px bg-[#3a3a3a] mx-1" />

              {/* Quick Math Shortcuts */}
              <button
                onClick={() => insertTextAtCursor('$', '$', 'x^2')}
                className="px-2 py-0.5 bg-[#313131] hover:bg-[#3d3d3d] text-amber-300 font-serif font-bold rounded text-[11px] transition-colors"
                title="Chèn công thức nội dòng: $...$"
              >
                $x$
              </button>

              <button
                onClick={() => insertTextAtCursor('\\[\n  ', '\n\\]\n', 'f(x) = ax^2 + bx + c')}
                className="px-2 py-0.5 bg-[#313131] hover:bg-[#3d3d3d] text-amber-200 font-mono rounded text-[11px] transition-colors"
                title="Chèn công thức riêng dòng: \[...\]"
              >
                \[ \]
              </button>

              <button
                onClick={() => insertTextAtCursor('\\textbf{', '}', 'in đậm')}
                className="px-2 py-0.5 bg-[#313131] hover:bg-[#3d3d3d] text-neutral-200 font-bold rounded text-[11px] transition-colors"
                title="In đậm \textbf{...}"
              >
                B
              </button>

              <button
                onClick={() => insertTextAtCursor('\\textit{', '}', 'in nghiêng')}
                className="px-2 py-0.5 bg-[#313131] hover:bg-[#3d3d3d] text-neutral-200 italic rounded text-[11px] transition-colors"
                title="In nghiêng \textit{...}"
              >
                I
              </button>

              {/* Insert ex question snippet */}
              <button
                onClick={() => {
                  const snippet = `\\begin{ex}[2D1-1]\nNội dung câu hỏi mới tại đây?\n\\choice\n{$Phương án A$}\n{\\True $Phương án B (Đúng)$}\n{$Phương án C$}\n{$Phương án D$}\n\\loigiai{\nLời giải chi tiết.\n}\n\\end{ex}\n\n`;
                  insertTextAtCursor('', '', snippet);
                }}
                className="px-2 py-0.5 bg-[#25382b] hover:bg-[#2d4534] text-emerald-300 border border-emerald-800/60 rounded text-[11px] font-medium transition-colors"
                title="Thêm câu hỏi trắc nghiệm (ex)"
              >
                + Câu hỏi (ex)
              </button>

              {/* Insert TikZ snippet */}
              <button
                onClick={() => {
                  const tikzSnippet = `\\begin{center}\n\\begin{tikzpicture}[>=stealth,scale=1.0]\n  \\draw[->] (-2,0) -- (2,0) node[below]{$x$};\n  \\draw[->] (0,-1) -- (0,2) node[left]{$y$};\n  \\node[below left] at (0,0) {$O$};\n  \\draw[blue,thick] plot[domain=-1.5:1.5] (\\x,{(\\x)^2});\n\\end{tikzpicture}\n\\end{center}\n\n`;
                  insertTextAtCursor('', '', tikzSnippet);
                }}
                className="px-2 py-0.5 bg-[#223548] hover:bg-[#2b445c] text-sky-300 border border-sky-800/60 rounded text-[11px] font-medium transition-colors"
                title="Thêm đồ thị TikZ"
              >
                + Đồ thị (TikZ)
              </button>

              <button
                onClick={() => insertTextAtCursor('\n\\newpage\n\n', '', '')}
                className="px-2 py-0.5 bg-[#313131] hover:bg-[#3d3d3d] text-neutral-300 font-mono rounded text-[11px] transition-colors"
                title="Ngắt trang mới: \newpage"
              >
                \newpage
              </button>
            </div>

            {/* Right: Actions (Copy code, Reset Exam, Clear) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopyFeedback(true);
                  setTimeout(() => setCopyFeedback(false), 2000);
                }}
                className="flex items-center gap-1 px-2 py-0.5 text-neutral-300 hover:text-white bg-[#313131] hover:bg-[#3d3d3d] rounded text-[11px] transition-colors"
                title="Sao chép toàn bộ mã LaTeX"
              >
                {copyFeedback ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copyFeedback ? 'Đã chép' : 'Sao chép'}</span>
              </button>

              <button
                onClick={handleResetExam}
                className="flex items-center gap-1 px-2 py-0.5 text-neutral-300 hover:text-white bg-[#313131] hover:bg-[#3d3d3d] rounded text-[11px] transition-colors"
                title="Nạp lại đề thi mẫu chuẩn"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Nạp mẫu đề</span>
              </button>

              <button
                onClick={handleClearCode}
                className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-[#333333] rounded transition-colors"
                title="Xóa trắng mã lệnh"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Editor Body: Line Numbers + Fast Textarea */}
          <div className="flex-1 flex overflow-hidden relative font-mono text-xs bg-[#1e1e1e]">
            {/* Line numbers gutter with error markers */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#1e1e1e] text-[#858585] border-r border-[#2d2d2d] select-none overflow-hidden text-right pr-2 text-xs font-mono shrink-0 leading-[1.5rem]"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => {
                const lineNum = i + 1;
                const hasError = errorLogs.some(l => l.line === lineNum);
                const hasWarning = warningLogs.some(l => l.line === lineNum);
                return (
                  <div key={i} className="h-[1.5rem] relative flex items-center justify-end">
                    {hasError && (
                      <span className="absolute left-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`Lỗi tại dòng ${lineNum}`} />
                    )}
                    {!hasError && hasWarning && (
                      <span className="absolute left-1 w-2 h-2 rounded-full bg-amber-500" title={`Cảnh báo tại dòng ${lineNum}`} />
                    )}
                    <span>{lineNum}</span>
                  </div>
                );
              })}
            </div>

            {/* LaTeX Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => updateCodeWithHistory(e.target.value)}
              onScroll={handleTextareaScroll}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="flex-1 h-full py-3 px-3 bg-transparent text-[#d4d4d4] resize-none outline-none font-mono text-xs leading-[1.5rem] whitespace-pre overflow-auto tab-size-2 selection:bg-[#264f78]"
              placeholder="Nhập mã LaTeX của bạn tại đây..."
            />
          </div>

          {/* Code Editor Status Bar */}
          <div className="h-6 bg-[#181818] border-t border-[#2d2d2d] px-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 select-none shrink-0">
            <div className="flex items-center gap-3">
              <span>Dòng {cursorInfo.line}, Cột {cursorInfo.col}</span>
              <span className="opacity-50">|</span>
              <span>{lineCount} dòng</span>
              <span className="opacity-50">|</span>
              <span>{code.length} ký tự</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">Ctrl + Enter: Biên dịch</span>
              <span className="opacity-50">|</span>
              <span>UTF-8</span>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* KHUNG PDF KHI BIÊN DỊCH THÀNH CÔNG (RIGHT PANE)                         */}
        {/* ======================================================================= */}
        <section className="w-1/2 h-full flex flex-col bg-[#525659] overflow-hidden">
          
          {/* PDF Viewer Header Toolbar */}
          <div className="h-9 bg-[#323639] border-b border-[#222222] px-3 flex items-center justify-between text-xs select-none shrink-0 shadow-sm">
            {/* Left: Compile Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-wide text-xs uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bản in PDF</span>
              </span>

              {errorLogs.length > 0 ? (
                <span className="px-2 py-0.5 rounded bg-rose-900/70 border border-rose-700 text-rose-200 text-[10px] font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span>{errorLogs.length} lỗi</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-mono">
                  Biên dịch thành công ({compilerResult?.metrics.compileTimeMs || lastCompileTime}ms)
                </span>
              )}
            </div>

            {/* Center: Page Navigation (Trang 1 / 2) */}
            <div className="flex items-center gap-1 text-neutral-300">
              <button
                onClick={() => {
                  const targetPage = Math.max(1, currentPage - 1);
                  setCurrentPage(targetPage);
                  const el = document.getElementById(`pdf-page-${targetPage}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage <= 1}
                className="p-1 hover:text-white hover:bg-[#444444] rounded disabled:opacity-30 transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs flex items-center gap-1">
                <span>Trang</span>
                <span className="font-bold text-white px-1.5 py-0.5 bg-[#222222] rounded border border-[#444444]">
                  {currentPage}
                </span>
                <span>/ {totalPages}</span>
              </span>

              <button
                onClick={() => {
                  const targetPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(targetPage);
                  const el = document.getElementById(`pdf-page-${targetPage}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-white hover:bg-[#444444] rounded disabled:opacity-30 transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-[#222222] border border-[#444444] rounded px-1 py-0.5">
                <button
                  onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                  className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#333333] transition-colors"
                  title="Thu nhỏ (-10%)"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>

                <span className="w-10 text-center font-mono text-[11px] text-neutral-200">
                  {zoomLevel}%
                </span>

                <button
                  onClick={() => setZoomLevel(z => Math.min(160, z + 10))}
                  className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#333333] transition-colors"
                  title="Phóng to (+10%)"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#333333] transition-colors ml-0.5"
                  title="Khôi phục 100%"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner if any */}
          {errorLogs.length > 0 && (
            <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-3 py-1.5 text-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 truncate">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold truncate">
                  {errorLogs[0].line ? `Dòng ${errorLogs[0].line}: ` : ''}{errorLogs[0].message}
                </span>
              </div>
              {errorLogs[0].line && (
                <button
                  onClick={() => jumpToLine(errorLogs[0].line!)}
                  className="text-white underline hover:text-rose-100 text-[11px] shrink-0 font-medium ml-2"
                >
                  Đến dòng lỗi
                </button>
              )}
            </div>
          )}

          {/* PDF Viewer Body: Canvas with #525659 Background */}
          <div 
            ref={pdfScrollContainerRef}
            className="flex-1 overflow-auto pdf-viewer-canvas relative flex justify-center py-6 px-4"
          >
            {isCompiling && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-[#252526] border border-[#444444] rounded text-xs text-white shadow-xl">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang kết xuất...</span>
                </div>
              </div>
            )}

            {compilerResult ? (
              <div
                id="latex-printable-document"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.08s ease-out',
                }}
                className="flex flex-col items-center gap-8 w-full max-w-[850px] shrink-0"
              >
                {pagesList.map((pageHtml, idx) => (
                  <article
                    key={idx}
                    id={`pdf-page-${idx + 1}`}
                    className="a4-page-sheet pdf-a4-sheet p-12 sm:p-16 flex flex-col justify-between relative box-border"
                  >
                    {/* Top Paper Header (Academic LaTeX Style) */}
                    <div className="text-[11px] text-neutral-500 border-b border-neutral-300 pb-1.5 mb-5 flex justify-between font-serif select-none">
                      <span>{compilerResult.metadata.title || 'ĐỀ THI KHẢO SÁT CHẤT LƯỢNG MÔN TOÁN'}</span>
                      <span>Trang {idx + 1}/{totalPages}</span>
                    </div>

                    {/* Paper Content: True academic LaTeX serif typesetting */}
                    <div
                      className="latex-font-serif text-[14px] leading-relaxed text-justify flex-1 space-y-2 text-[#111827]"
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />

                    {/* Paper Bottom Footer with Standard Centered LaTeX Page Numbering */}
                    <div className="pt-4 mt-6 border-t border-neutral-200 text-center text-xs text-neutral-600 font-serif select-none">
                      - {idx + 1} -
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 text-xs">
                <RotateCw className="w-8 h-8 text-neutral-400 animate-spin mb-3" />
                <p>Đang chuẩn bị trang in PDF...</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Status Notification for PDF export */}
      {pdfStatus.message && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded shadow-2xl border text-xs font-medium bg-[#252526] border-[#444444] text-white max-w-sm pointer-events-auto">
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
