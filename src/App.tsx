import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  RotateCw,
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
  BookOpen,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  History,
  MessageSquare,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Quote,
  Table,
  Image as ImageIcon,
  Search,
  Undo2,
  Redo2,
  FileCode,
  Maximize2,
  Minimize2,
  X,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Split,
  Eye,
  Terminal,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { compileLaTeX, CompilerResult, CompilationLog } from './utils/latexCompiler';
import { LATEX_TEMPLATES, LatexTemplate } from './data/templates';
import { SAMPLE_STY_PACKAGES } from './utils/styParser';
import { downloadLatexPdf, generateLatexPdfBlob } from './utils/pdfExporter';

export default function App() {
  const defaultExamCode = LATEX_TEMPLATES[0]?.code || '';

  // Project state
  const [projectTitle, setProjectTitle] = useState<string>('De_thi_Toan_12');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [code, setCode] = useState<string>(defaultExamCode);
  const [history, setHistory] = useState<string[]>([defaultExamCode]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Compiler state
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [autoCompile, setAutoCompile] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>('Đã lưu');

  // PDF Viewer & Viewport state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'pages' | 'pdf'>('pages'); // 'pages': authentic A4 canvas, 'pdf': embedded native PDF
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Modals & Drawers
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [selectedLogLine, setSelectedLogLine] = useState<number | null>(null);

  // Search in editor
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Cursor & Status
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // PDF Download feedback
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
  const pdfScrollContainerRef = useRef<HTMLDivElement>(null);

  // Code change with undo/redo stack
  const updateCodeWithHistory = (newCode: string) => {
    setCode(newCode);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newCode);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLastSaved('Đã lưu');
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

  // Auto-compile with debounce if enabled
  useEffect(() => {
    if (!autoCompile) return;
    const timer = setTimeout(() => {
      handleCompile(code);
    }, 1500);
    return () => clearTimeout(timer);
  }, [code, autoCompile, handleCompile]);

  // Generate native PDF Blob when compilation changes
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
        console.warn('Đang chờ phần tử trang in để tạo PDF Blob...', err);
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
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = code.substring(0, start) + '  ' + code.substring(end);
      updateCodeWithHistory(newText);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  // Insert helper text at cursor
  const insertTextAtCursor = (prefix: string, suffix: string = '', defaultInside: string = '') => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const selected = code.substring(start, end) || defaultInside;
    const replacement = prefix + selected + suffix;
    const newCode = code.substring(0, start) + replacement + code.substring(end);
    updateCodeWithHistory(newCode);

    requestAnimationFrame(() => {
      target.focus();
      target.selectionStart = start + prefix.length;
      target.selectionEnd = start + prefix.length + selected.length;
    });
  };

  // Jump cursor to line
  const jumpToLine = (lineNumber: number) => {
    if (!textareaRef.current) return;
    setSelectedLogLine(lineNumber);
    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(lineNumber - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineNumber - 1]?.length || 0));
    const lineHeight = 25.6; // 1.6rem
    textareaRef.current.scrollTop = Math.max(0, (lineNumber - 4) * lineHeight);
  };

  // Export PDF directly
  const handleExportPdf = async () => {
    try {
      setPdfStatus({ loading: true, message: 'Đang kết xuất các trang A4 sang tệp PDF...', type: 'info' });
      await downloadLatexPdf('latex-printable-document', {
        filename: `${projectTitle || 'tai_lieu_latex'}.pdf`,
        onProgress: (msg: string) => {
          setPdfStatus({ loading: true, message: msg, type: 'info' });
        }
      });
      setPdfStatus({ loading: false, message: 'Đã tải thành công tệp PDF chuẩn in A4!', type: 'success' });
      setTimeout(() => setPdfStatus({ loading: false, message: '' }), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xuất PDF';
      setPdfStatus({ loading: false, message: `Lỗi: ${msg}`, type: 'error' });
      setTimeout(() => setPdfStatus({ loading: false, message: '' }), 5000);
    }
  };

  // Download .tex file
  const handleDownloadTex = () => {
    const blob = new Blob([code], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'document'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import .tex
  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        updateCodeWithHistory(content);
        handleCompile(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load template
  const handleLoadTemplate = (tpl: LatexTemplate) => {
    updateCodeWithHistory(tpl.code);
    setProjectTitle(tpl.name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase());
    handleCompile(tpl.code);
    setIsTemplateModalOpen(false);
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
      {/* 1. OVERLEAF ICONIC TOP HEADER (Deep Green #4c7336 / #3a6939) */}
      {/* ========================================================================= */}
      <header className="h-10 bg-[#4c7336] text-white px-3 flex items-center justify-between shrink-0 shadow-sm z-30 select-none">
        {/* Left Side: Overleaf Menu & Project Name */}
        <div className="flex items-center gap-3">
          {/* Overleaf Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#3a5829] hover:bg-[#2e4720] border border-[#65944b] rounded text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
            title="Mở menu dự án Overleaf"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          {/* Project Title with inline edit */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">/</span>
            {isEditingTitle ? (
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-[#3a5829] text-white px-2 py-0.5 rounded text-xs font-medium outline-none border border-[#65944b]"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-xs text-white hover:bg-black/15 px-2 py-0.5 rounded cursor-pointer transition-colors"
                title="Nhấn để đổi tên dự án"
              >
                {projectTitle}
              </span>
            )}
            <span className="text-[11px] text-white/70 flex items-center gap-1 font-normal">
              <Check className="w-3 h-3 text-emerald-300" />
              {lastSaved}
            </span>
          </div>
        </div>

        {/* Right Side: Overleaf Actions & User Badge */}
        <div className="flex items-center gap-2">
          {/* Templates Modal button */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white hover:bg-black/20 rounded transition-colors font-medium cursor-pointer"
            title="Chọn mẫu đề thi hoặc tài liệu LaTeX mẫu"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mẫu đề thi</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopyFeedback('Đã sao chép liên kết dự án!');
              setTimeout(() => setCopyFeedback(null), 2500);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white hover:bg-black/20 rounded transition-colors font-medium cursor-pointer"
            title="Chia sẻ dự án"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Chia sẻ</span>
          </button>

          {/* History */}
          <button
            onClick={() => {
              setCopyFeedback('Lịch sử phiên bản đang được lưu cục bộ');
              setTimeout(() => setCopyFeedback(null), 2500);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white hover:bg-black/20 rounded transition-colors font-medium cursor-pointer"
            title="Lịch sử biên soạn"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Lịch sử</span>
          </button>

          {/* User Avatar Circle */}
          <div 
            className="w-7 h-7 rounded-full bg-[#3a5829] border border-[#65944b] text-white flex items-center justify-center font-bold text-xs ml-1 shadow-inner cursor-pointer"
            title="Tài khoản cá nhân"
          >
            L
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: TWO PANES (LEFT: LATEX CODE EDITOR, RIGHT: REAL PDF)   */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ========================================================================= */}
        {/* LEFT PANE: CODE EDITOR (Overleaf Dark Theme #1e1e1e)                      */}
        {/* ========================================================================= */}
        <section className="w-1/2 h-full flex flex-col border-r border-[#2d2d2d] bg-[#1e1e1e] overflow-hidden">
          {/* Editor Header: File Tab Row */}
          <div className="h-8 bg-[#252526] border-b border-[#2d2d2d] flex items-center justify-between px-2 text-xs shrink-0 select-none">
            <div className="flex items-center h-full">
              {/* File tree toggle icon */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#333333] mr-1.5 transition-colors"
                title="Cây tệp tin dự án"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>

              {/* Active Tab: main.tex */}
              <div className="h-full flex items-center gap-2 px-3 bg-[#1e1e1e] text-white border-t-2 border-[#4c7336] text-xs font-mono font-medium">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>main.tex</span>
                <span className="text-[10px] text-neutral-500 hover:text-neutral-300 cursor-pointer ml-1">×</span>
              </div>
            </div>

            {/* Source / Rich Text Toggle Pills */}
            <div className="flex items-center bg-[#1e1e1e] border border-[#333333] rounded p-0.5 text-[11px]">
              <button
                className="px-2 py-0.5 rounded bg-[#333333] text-white font-medium shadow-xs"
                title="Chế độ Mã nguồn LaTeX (Source)"
              >
                Mã nguồn
              </button>
              <button
                onClick={() => {
                  setCopyFeedback('Trực quan hoá trực tiếp tại khung PDF bên phải');
                  setTimeout(() => setCopyFeedback(null), 2500);
                }}
                className="px-2 py-0.5 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Chế độ trực quan"
              >
                Trực quan
              </button>
            </div>
          </div>

          {/* Editor Subtoolbar: Quick Formatting Bar (Bold, Italic, Math, Lists, etc.) */}
          <div className="h-8 bg-[#222222] border-b border-[#2d2d2d] px-2 flex items-center justify-between text-neutral-400 text-xs shrink-0 select-none overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
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

              <div className="h-3 w-px bg-[#333333] mx-1" />

              {/* Bold */}
              <button
                onClick={() => insertTextAtCursor('\\textbf{', '}', 'in đậm')}
                className="p-1 hover:text-white hover:bg-[#333333] rounded font-bold transition-colors"
                title="Chữ in đậm (\textbf{})"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                onClick={() => insertTextAtCursor('\\textit{', '}', 'in nghiêng')}
                className="p-1 hover:text-white hover:bg-[#333333] rounded italic transition-colors"
                title="Chữ in nghiêng (\textit{})"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Math $x$ */}
              <button
                onClick={() => insertTextAtCursor('$', '$', 'x^2 + y^2 = 1')}
                className="px-1.5 py-0.5 hover:text-white hover:bg-[#333333] rounded font-serif font-bold text-amber-400 transition-colors"
                title="Công thức toán nội dòng ($...$)"
              >
                $x$
              </button>

              {/* Display Math $$ */}
              <button
                onClick={() => insertTextAtCursor('\\[\n  ', '\n\\]\n', 'V = B \\cdot h')}
                className="px-1 py-0.5 hover:text-white hover:bg-[#333333] rounded font-mono text-[11px] text-amber-300 transition-colors"
                title="Công thức toán riêng dòng (\[...\])"
              >
                \[ \]
              </button>

              <div className="h-3 w-px bg-[#333333] mx-1" />

              {/* Bullet List */}
              <button
                onClick={() => insertTextAtCursor('\\begin{itemize}\n  \\item ', '\n\\end{itemize}\n', 'Ý thứ nhất')}
                className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
                title="Danh sách gạch đầu dòng (\begin{itemize})"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              {/* Numbered List */}
              <button
                onClick={() => insertTextAtCursor('\\begin{enumerate}\n  \\item ', '\n\\end{enumerate}\n', 'Ý thứ nhất')}
                className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
                title="Danh sách đánh số (\begin{enumerate})"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              {/* Code */}
              <button
                onClick={() => insertTextAtCursor('\\begin{verbatim}\n', '\n\\end{verbatim}\n', 'console.log("LaTeX");')}
                className="p-1 hover:text-white hover:bg-[#333333] rounded transition-colors"
                title="Khối mã lệnh (\begin{verbatim})"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="h-3 w-px bg-[#333333] mx-1" />

              {/* Insert ex_test Question Button */}
              <button
                onClick={() => {
                  const snippet = `\\begin{ex}[2D1-1]\nNội dung câu hỏi mới tại đây?\n\\choice\n{$Phương án A$}\n{\\True $Phương án B (Đúng)$}\n{$Phương án C$}\n{$Phương án D$}\n\\loigiai{\nLời giải chi tiết cho câu hỏi.\n}\n\\end{ex}\n\n`;
                  insertTextAtCursor('', '', snippet);
                }}
                className="px-2 py-0.5 bg-[#2d3748] hover:bg-[#3b475a] text-sky-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                title="Thêm nhanh một câu hỏi chuẩn gói ex_test"
              >
                + Câu hỏi (ex)
              </button>

              {/* Insert TikZ center graph */}
              <button
                onClick={() => {
                  const tikzSnippet = `\\begin{center}\n\\begin{tikzpicture}[>=stealth,scale=1.0]\n  \\draw[->] (-2,0) -- (2,0) node[below]{$x$};\n  \\draw[->] (0,-1) -- (0,2) node[left]{$y$};\n  \\node[below left] at (0,0) {$O$};\n  \\draw[blue,thick] plot[domain=-1.5:1.5] (\\x,{(\\x)^2});\n\\end{tikzpicture}\n\\end{center}\n\n`;
                  insertTextAtCursor('', '', tikzSnippet);
                }}
                className="px-2 py-0.5 bg-[#2d3748] hover:bg-[#3b475a] text-emerald-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                title="Thêm nhanh đồ thị tọa độ TikZ"
              >
                + Đồ thị (TikZ)
              </button>

              {/* Insert Page Break */}
              <button
                onClick={() => insertTextAtCursor('\n\\newpage\n\n', '', '')}
                className="px-2 py-0.5 bg-[#333333] hover:bg-[#444444] text-neutral-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                title="Chèn lệnh sang trang mới (\newpage)"
              >
                \newpage
              </button>
            </div>

            {/* Right: Search / Find Toggle */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1 rounded transition-colors ${showSearch ? 'bg-[#4c7336] text-white' : 'hover:text-white hover:bg-[#333333]'}`}
                title="Tìm kiếm văn bản (Ctrl+F)"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Search Bar */}
          {showSearch && (
            <div className="h-8 bg-[#252526] border-b border-[#333333] px-3 flex items-center gap-2 text-xs">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Tìm kiếm trong mã LaTeX..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-[#1e1e1e] text-white px-2 py-0.5 rounded outline-none border border-[#3c3c3c] text-xs flex-1"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Text Area with Line Numbers & Error Gutter Marker */}
          <div className="flex-1 flex overflow-hidden relative font-mono text-xs bg-[#1e1e1e]">
            {/* Line numbers gutter */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 bg-[#1e1e1e] text-[#858585] border-r border-[#2d2d2d] select-none overflow-hidden text-right pr-2 text-xs font-mono shrink-0 leading-[1.6rem]"
              aria-hidden="true"
            >
              {Array.from({ length: lineCount }).map((_, i) => {
                const lineNum = i + 1;
                const hasError = errorLogs.some(l => l.line === lineNum);
                const hasWarning = warningLogs.some(l => l.line === lineNum);
                return (
                  <div 
                    key={i} 
                    className={`h-[1.6rem] relative flex items-center justify-end ${
                      selectedLogLine === lineNum ? 'bg-indigo-900/50 text-indigo-300 font-bold' : ''
                    }`}
                  >
                    {hasError && (
                      <span className="absolute left-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Lỗi cú pháp tại dòng này" />
                    )}
                    {!hasError && hasWarning && (
                      <span className="absolute left-1 w-2 h-2 rounded-full bg-amber-500" title="Cảnh báo tại dòng này" />
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
              className="flex-1 h-full py-3 px-3 bg-transparent text-[#d4d4d4] resize-none outline-none font-mono text-xs leading-[1.6rem] whitespace-pre overflow-auto tab-size-2 selection:bg-[#264f78]"
              placeholder="Nhập mã LaTeX của bạn tại đây..."
            />
          </div>

          {/* Editor Status Bar */}
          <div className="h-6 bg-[#007acc] text-white px-3 flex items-center justify-between text-[11px] font-mono select-none shrink-0">
            <div className="flex items-center gap-3">
              <span>Dòng {cursorInfo.line}, Cột {cursorInfo.col}</span>
              <span className="opacity-70">|</span>
              <span>{lineCount} dòng</span>
              <span className="opacity-70">|</span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans font-medium">Ctrl + Enter: Biên dịch</span>
              <span className="opacity-70">|</span>
              <span>LaTeX</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT PANE: REAL PDF DOCUMENT VIEWER (Overleaf Style with Canvas Background #525659) */}
        {/* ========================================================================= */}
        <section className="w-1/2 h-full flex flex-col bg-[#525659] overflow-hidden">
          {/* PDF Viewer Header Toolbar (Includes the Iconic Overleaf Recompile Button) */}
          <div className="h-10 bg-[#323639] border-b border-[#222222] px-3 flex items-center justify-between text-xs select-none shrink-0 shadow-md">
            {/* Left: THE FAMOUS OVERLEAF GREEN "RECOMPILE" (Biên dịch lại) BUTTON */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCompile()}
                disabled={isCompiling}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#138a36] hover:bg-[#0f7d30] active:bg-[#0c6b29] text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                title="Biên dịch lại tài liệu LaTeX (Ctrl + Enter)"
              >
                {isCompiling ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RotateCw className="w-3.5 h-3.5" />
                )}
                <span>{isCompiling ? 'Đang biên dịch...' : 'Biên dịch lại'}</span>
              </button>

              {/* Logs & Warnings Button */}
              <button
                onClick={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer border ${
                  errorLogs.length > 0
                    ? 'bg-rose-950/80 border-rose-800 text-rose-300 hover:bg-rose-900'
                    : warningLogs.length > 0
                    ? 'bg-amber-950/80 border-amber-800 text-amber-300 hover:bg-amber-900'
                    : 'bg-[#2b2e31] border-[#444444] text-neutral-300 hover:bg-[#3c4043]'
                }`}
                title="Xem nhật ký biên dịch và lỗi"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] font-semibold">
                  {errorLogs.length > 0 ? `${errorLogs.length} lỗi` : `${warningLogs.length} cảnh báo`}
                </span>
              </button>
            </div>

            {/* Center: Page Navigation (◂ Trang 1 / 2 ▸) */}
            <div className="flex items-center gap-1 text-neutral-300">
              <button
                onClick={() => {
                  const targetPage = Math.max(1, currentPage - 1);
                  setCurrentPage(targetPage);
                  const el = document.getElementById(`page-${targetPage}`);
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
                  const el = document.getElementById(`page-${targetPage}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
                className="p-1 hover:text-white hover:bg-[#444444] rounded disabled:opacity-30 transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Zoom Controls, View Mode Switch, Download & Print */}
            <div className="flex items-center gap-1.5">
              {/* Zoom Controls */}
              <div className="flex items-center bg-[#222222] border border-[#444444] rounded px-1 py-0.5">
                <button
                  onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                  className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#333333] transition-colors"
                  title="Thu nhỏ (-10%)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="w-10 text-center font-mono text-[11px] text-neutral-200">
                  {zoomLevel}%
                </span>

                <button
                  onClick={() => setZoomLevel(z => Math.min(160, z + 10))}
                  className="p-1 text-neutral-300 hover:text-white rounded hover:bg-[#333333] transition-colors"
                  title="Phóng to (+10%)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#333333] transition-colors ml-0.5"
                  title="Khôi phục 100%"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <div className="h-4 w-px bg-[#444444] mx-0.5" />

              {/* View Mode Toggle: Trang in A4 vs Tệp PDF nhúng */}
              <div className="flex items-center bg-[#222222] p-0.5 rounded border border-[#444444] text-[11px]">
                <button
                  onClick={() => setViewMode('pages')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'pages'
                      ? 'bg-[#4c7336] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Hiển thị tờ giấy in A4 chuẩn LaTeX"
                >
                  Trang in A4
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    viewMode === 'pdf'
                      ? 'bg-[#4c7336] text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Trình đọc PDF nhúng của trình duyệt"
                >
                  Tệp PDF nhúng
                </button>
              </div>

              <div className="h-4 w-px bg-[#444444] mx-0.5" />

              {/* Print */}
              <button
                onClick={() => window.print()}
                className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-[#444444] transition-colors"
                title="In trang tài liệu (Print)"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Download PDF File */}
              <button
                onClick={handleExportPdf}
                disabled={pdfStatus.loading}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#2b2e31] hover:bg-[#3c4043] border border-[#555555] text-white rounded text-xs font-medium transition-colors cursor-pointer"
                title="Tải tệp .pdf về máy tính"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải PDF</span>
              </button>
            </div>
          </div>

          {/* PDF Viewer Body: Canvas with #525659 Background */}
          <div 
            ref={pdfScrollContainerRef}
            className="flex-1 overflow-auto pdf-viewer-canvas relative flex justify-center py-6 px-4"
          >
            {isCompiling && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30 pointer-events-none">
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#252526] border border-[#444444] rounded text-xs text-white shadow-2xl">
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang biên dịch trang giấy LaTeX...</span>
                </div>
              </div>
            )}

            {compilerResult ? (
              <>
                {/* 1. VIEW MODE: PAGINATED A4 SHEETS */}
                <div
                  id="latex-printable-document"
                  style={{
                    display: viewMode === 'pages' ? 'flex' : 'none',
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.1s ease-out',
                  }}
                  className="flex-col items-center gap-8 w-full max-w-[850px] shrink-0"
                >
                  {pagesList.map((pageHtml, idx) => (
                    <article
                      key={idx}
                      id={`page-${idx + 1}`}
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

                {/* 2. VIEW MODE: EMBEDDED NATIVE PDF VIEWER */}
                {viewMode === 'pdf' && (
                  <div className="w-full h-full flex flex-col bg-[#525659]">
                    {pdfBlobUrl ? (
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                        className="w-full h-full border-0 bg-[#525659]"
                        title="Tệp PDF LaTeX thật"
                      />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 text-xs">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
                        <span>Đang tạo tệp PDF nhúng ({isGeneratingPdf ? 'đang kết xuất...' : 'chờ biên dịch'})...</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-300 text-xs">
                <BookOpen className="w-10 h-10 text-neutral-400 mb-3" />
                <p>Nhấn nút "Biên dịch lại" (Ctrl + Enter) để tạo trang PDF.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOGS & CONSOLE DRAWER (Overleaf Style Bottom Panel)                      */}
      {/* ========================================================================= */}
      {isLogDrawerOpen && (
        <div className="h-56 bg-[#252526] border-t-2 border-[#4c7336] flex flex-col z-40 shrink-0 shadow-2xl">
          {/* Drawer Title Bar */}
          <div className="h-8 bg-[#2d2d2d] px-3 flex items-center justify-between text-xs font-semibold text-white select-none border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nhật ký biên dịch (Logs and output files)</span>
              <span className="text-neutral-400 text-[11px] font-mono">
                · {errorLogs.length} lỗi · {warningLogs.length} cảnh báo · {compilerResult?.metrics.compileTimeMs || 0}ms
              </span>
            </div>
            <button
              onClick={() => setIsLogDrawerOpen(false)}
              className="p-1 text-neutral-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-auto p-3 font-mono text-xs space-y-2 bg-[#1e1e1e]">
            {compilerResult?.logs && compilerResult.logs.length > 0 ? (
              compilerResult.logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => log.line && jumpToLine(log.line)}
                  className={`p-2 rounded border flex items-start gap-2.5 transition-colors cursor-pointer ${
                    log.type === 'error'
                      ? 'bg-rose-950/40 border-rose-900/60 text-rose-200 hover:bg-rose-950/70'
                      : log.type === 'warning'
                      ? 'bg-amber-950/40 border-amber-900/60 text-amber-200 hover:bg-amber-950/70'
                      : 'bg-[#252526] border-[#333333] text-neutral-300 hover:bg-[#2e2e2e]'
                  }`}
                >
                  {log.type === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : log.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {log.line && (
                        <span className="px-1.5 py-0.2 rounded bg-black/40 text-emerald-400 font-bold text-[10px]">
                          Dòng {log.line}
                        </span>
                      )}
                      <span className="font-semibold">{log.message}</span>
                    </div>
                    {log.detail && (
                      <div className="text-[11px] text-neutral-400 mt-1">{log.detail}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 text-xs italic p-4 text-center">
                Không có lỗi nào. Quá trình biên dịch thành công tốt đẹp!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OVERLEAF PROJECT MENU DRAWER (When clicking [ ☰ Menu ])                  */}
      {/* ========================================================================= */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-out Menu Panel */}
          <div className="relative w-80 h-full bg-[#252526] text-white shadow-2xl flex flex-col z-10 border-r border-[#3c3c3c]">
            {/* Header */}
            <div className="h-12 bg-[#4c7336] px-4 flex items-center justify-between font-semibold text-sm">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4" />
                <span>Menu Dự án</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="flex-1 overflow-auto p-4 space-y-5 text-xs">
              {/* Download Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Tải về máy tính
                </div>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      handleDownloadTex();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded bg-[#333333] hover:bg-[#3e3e3e] text-left transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-sky-400" />
                      <span>Mã nguồn (.tex)</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Tệp .tex</span>
                  </button>

                  <button
                    onClick={() => {
                      handleExportPdf();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded bg-[#333333] hover:bg-[#3e3e3e] text-left transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-emerald-400" />
                      <span>Tài liệu (.pdf)</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">PDF chuẩn in</span>
                  </button>
                </div>
              </div>

              {/* Import Section */}
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Tải lên tệp
                </div>
                <label className="w-full flex items-center justify-between p-2 rounded bg-[#333333] hover:bg-[#3e3e3e] cursor-pointer transition-colors">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span>Mở tệp .tex từ máy...</span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".tex,.txt"
                    onChange={(e) => {
                      handleOpenFile(e);
                      setIsMenuOpen(false);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Compiler Settings */}
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Thiết lập biên dịch
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded border border-[#333333] space-y-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Trình biên dịch (Compiler)</label>
                    <div className="px-2 py-1 bg-[#2d2d2d] rounded text-white font-mono text-xs border border-[#444444]">
                      pdfLaTeX (Hỗ trợ ex_test.sty, TikZ)
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Tệp chính (Main document)</label>
                    <div className="px-2 py-1 bg-[#2d2d2d] rounded text-white font-mono text-xs border border-[#444444]">
                      main.tex
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-300">Tự động biên dịch</span>
                    <button
                      onClick={() => setAutoCompile(!autoCompile)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        autoCompile ? 'bg-[#4c7336]' : 'bg-[#444444]'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          autoCompile ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div>
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Thống kê tài liệu
                </div>
                <div className="bg-[#1e1e1e] p-3 rounded border border-[#333333] space-y-1.5 font-mono text-[11px] text-neutral-300">
                  <div className="flex justify-between">
                    <span>Số trang in A4:</span>
                    <span className="text-white font-bold">{totalPages} trang</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số câu hỏi (ex):</span>
                    <span className="text-white font-bold">{compilerResult?.metrics.exCount || 0} câu</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số công thức toán:</span>
                    <span className="text-white font-bold">{compilerResult?.metrics.equationCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian biên dịch:</span>
                    <span className="text-emerald-400 font-bold">{compilerResult?.metrics.compileTimeMs || 0}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TEMPLATES MODAL (Chọn mẫu đề thi chuẩn)                                  */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsTemplateModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-2xl bg-[#252526] text-white rounded-lg shadow-2xl border border-[#3c3c3c] overflow-hidden z-10 flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-[#4c7336] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold text-sm">Kho Mẫu Tài liệu & Đề thi LaTeX</span>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 hover:bg-black/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-auto space-y-3 flex-1">
              {LATEX_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleLoadTemplate(tpl)}
                  className="p-4 rounded border border-[#3c3c3c] bg-[#1e1e1e] hover:border-[#4c7336] hover:bg-[#283824]/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white group-hover:text-emerald-300">
                      {tpl.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#333333] text-neutral-300 uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification for PDF Generation / Copy feedback */}
      {(pdfStatus.message || copyFeedback) && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded shadow-2xl border text-xs font-medium bg-[#252526] border-[#444444] text-white max-w-sm pointer-events-auto">
          {pdfStatus.loading && (
            <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {(pdfStatus.type === 'success' || copyFeedback) && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          {pdfStatus.type === 'error' && (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span className="leading-snug">{pdfStatus.message || copyFeedback}</span>
        </div>
      )}
    </div>
  );
}
