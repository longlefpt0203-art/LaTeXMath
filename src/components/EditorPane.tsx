import React, { useRef, useState, useEffect } from 'react';
import { 
  Search, 
  Replace, 
  X, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  Table, 
  Code,
  Divide,
  Superscript,
  ChevronDown,
  Shapes
} from 'lucide-react';
import { CompilationLog } from '../utils/latexCompiler';

interface EditorPaneProps {
  code: string;
  onChangeCode: (code: string) => void;
  onCompile: () => void;
  logs: CompilationLog[];
  selectedLine?: number | null;
  onClearSelectedLine?: () => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  code,
  onChangeCode,
  onCompile,
  logs,
  selectedLine,
  onClearSelectedLine,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fontSize, setFontSize] = useState<number>(13);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showTikzMenu, setShowTikzMenu] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  // Split lines for line numbers
  const lines = code.split('\n');
  const lineCount = lines.length;

  // Sync scroll between line numbers and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
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
    setCursorPos({ line, col });
  };

  // Jump to selected line if triggered externally (from compiler log)
  useEffect(() => {
    if (selectedLine && textareaRef.current) {
      const lineIndex = Math.max(0, selectedLine - 1);
      const targetLines = lines.slice(0, lineIndex);
      const charIndex = targetLines.reduce((acc, l) => acc + l.length + 1, 0);

      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(charIndex, charIndex + (lines[lineIndex]?.length || 0));

      // Scroll to that position
      const lineHeight = fontSize * 1.5;
      const targetScroll = Math.max(0, lineIndex * lineHeight - 100);
      textareaRef.current.scrollTop = targetScroll;

      setCursorPos({ line: selectedLine, col: 1 });
      onClearSelectedLine?.();
    }
  }, [selectedLine]);

  // Handle Tab key and Auto-close brackets
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter or Cmd + Enter to Compile
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onCompile();
      return;
    }

    // Ctrl + F for Find & Replace
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowFindReplace(true);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      }, 0);
      return;
    }

    // Auto-close pairs: { } ( ) [ ] $
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
      onChangeCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        updateCursorPosition();
      }, 0);
    }
  };

  // Quick insertion helpers
  const insertSnippetAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = code.substring(start, end);

    const insertion = before + (selectedText || '') + after;
    const newCode = code.substring(0, start) + insertion + code.substring(end);
    onChangeCode(newCode);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newCursor, newCursor);
      updateCursorPosition();
    }, 0);
  };

  // Find & Replace matches
  useEffect(() => {
    if (!findText) {
      setMatchCount(0);
      return;
    }
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = code.match(regex);
    setMatchCount(matches ? matches.length : 0);
  }, [findText, code]);

  const handleReplaceAll = () => {
    if (!findText) return;
    const newCode = code.split(findText).join(replaceText);
    onChangeCode(newCode);
  };

  // Map errors/warnings to line numbers for gutter markers
  const errorLines = new Set<number>();
  const warningLines = new Set<number>();
  logs.forEach(l => {
    if (l.line) {
      if (l.type === 'error') errorLines.add(l.line);
      if (l.type === 'warning') warningLines.add(l.line);
    }
  });

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden relative">
      {/* Quick Formatting Toolbar */}
      <div className="h-9 border-b border-neutral-800/80 bg-neutral-900/60 px-3 flex items-center justify-between gap-1 select-none overflow-x-auto shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertSnippetAtCursor('\\textbf{', '}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="In đậm (\textbf{})"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippetAtCursor('\\textit{', '}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="In nghiêng (\textit{})"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-neutral-800 mx-1" />
          <button
            onClick={() => insertSnippetAtCursor('\\section{', '}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Tiêu đề mục lớn (\section{})"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippetAtCursor('\\subsection{', '}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Tiêu đề mục con (\subsection{})"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-neutral-800 mx-1" />
          <button
            onClick={() => insertSnippetAtCursor('$', '$')}
            className="px-2 py-1 text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Công thức nội dòng ($...$)"
          >
            $..$
          </button>
          <button
            onClick={() => insertSnippetAtCursor('\n\\begin{equation}\n  ', '\n\\end{equation}\n')}
            className="px-2 py-1 text-xs font-mono text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Môi trường Equation (\begin{equation})"
          >
            [Eq]
          </button>
          <button
            onClick={() => insertSnippetAtCursor('\\frac{', '}{}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Phân số (\frac{a}{b})"
          >
            <Divide className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippetAtCursor('^{', '}')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Số mũ (^{x})"
          >
            <Superscript className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-px bg-neutral-800 mx-1" />
          <button
            onClick={() => insertSnippetAtCursor('\n\\begin{itemize}\n  \\item ', '\n\\end{itemize}\n')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSnippetAtCursor('\n\\begin{verbatim}\n', '\n\\end{verbatim}\n')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Đoạn mã verbatim"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-neutral-800 mx-1" />

          {/* Quick TikZ Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTikzMenu(!showTikzMenu)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/80 rounded transition-colors"
              title="Chèn nhanh khối TikZ"
            >
              <Shapes className="w-3 h-3 text-indigo-400" />
              <span>+ TikZ</span>
              <ChevronDown className="w-2.5 h-2.5 text-indigo-400" />
            </button>

            {showTikzMenu && (
              <div 
                className="absolute left-0 top-full mt-1 w-64 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-1 z-30 text-xs"
                onMouseLeave={() => setShowTikzMenu(false)}
              >
                <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/60">
                  Khối lệnh TikZ phổ biến
                </div>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\begin{tikzpicture}[>=stealth,scale=1]\n  % Lệnh vẽ TikZ\n', '\n\\end{tikzpicture}\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Môi trường \\begin&#123;tikzpicture&#125;</span>
                  <span className="text-[10px] text-neutral-500 font-mono">stealth</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\draw[->] (-3,0) -- (4,0) node[below]{$x$};\n\\draw[->] (0,-3) -- (0,4) node[left]{$y$};\n\\fill (0,0) circle (1.5pt) node[below left]{$O$};\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Trục tọa độ Oxy</span>
                  <span className="text-[10px] text-neutral-500 font-mono">Oxy</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n% Ký hiệu góc vuông tại B:\n\\def\\khvuong[size=#1](#2,#3,#4){\n  \\draw ($(#3)!#1!(#2)$) -- ($($(#3)!#1!(#2)$)+($(#3)!#1!(#4)$)-(#3)$) -- ($(#3)!#1!(#4)$);\n}\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Lệnh góc vuông \\khvuong</span>
                  <span className="text-[10px] text-neutral-500 font-mono">macro</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\begin{tikzpicture}\n  \\tkzTabInit[nocadre,lgt=1.5,espcl=2.2,deltacl=.5]\n    {$x$/0.8, $f\'(x)$/0.8, $f(x)$/2}\n    {$-\\infty$, $-1$, $1$, $2$, $+\\infty$}\n  \\tkzTabLine{,-,z,+,d,-,z,+,}\n  \\tkzTabVar{+/ $+\\infty$, -/ $-4$, +D+/ $+\\infty$, -/ $-4$, +/ $+\\infty$}\n\\end{tikzpicture}\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Bảng biến thiên tkz-tab</span>
                  <span className="text-[10px] text-purple-400 font-mono">tkz-tab</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.6];\n\\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.6];\n\\coordinate[label=above:$S$] (S) at (0,3.5);\n\\draw (-2,0) -- (S) -- (2,0);\n\\draw[dashed] (S) -- (0,0) node[below]{$O$} -- (2,0);\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Hình nón (Cone)</span>
                  <span className="text-[10px] text-amber-400 font-mono">3D</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.8];\n\\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.8];\n\\draw (-2,0) -- (-2,3.5);\n\\draw (2,0) -- (2,3.5);\n\\draw (0,3.5) ellipse ({2} and {0.8});\n\\draw[dashed] (0,0) -- (0,3.5);\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Hình trụ (Cylinder)</span>
                  <span className="text-[10px] text-amber-400 font-mono">3D</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\draw[smooth,blue,thick] plot[domain=-1.65:1.65] (\\x,{(\\x)^4 - 2*(\\x)^2 + 1});\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Đồ thị hàm số bậc 4</span>
                  <span className="text-[10px] text-blue-400 font-mono">plot</span>
                </button>
                <button
                  onClick={() => {
                    insertSnippetAtCursor('\n\\fill[blue!25,smooth] plot[domain=-1:2] (\\x,{(\\x)^2}) -- plot[domain=2:-1] (\\x,{\\x+2}) -- cycle;\n');
                    setShowTikzMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-800 text-neutral-200 hover:text-white flex items-center justify-between"
                >
                  <span>Tô miền tích phân</span>
                  <span className="text-[10px] text-cyan-400 font-mono">fill</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right tools: Search, font size */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`p-1.5 rounded transition-colors ${
              showFindReplace ? 'bg-neutral-800 text-indigo-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Tìm kiếm & Thay thế (Ctrl + F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Font size picker */}
          <div className="flex items-center text-[11px] text-neutral-400 gap-1 font-mono">
            <button
              onClick={() => setFontSize(s => Math.max(11, s - 1))}
              className="px-1.5 py-0.5 hover:bg-neutral-800 rounded"
              title="Giảm cỡ chữ"
            >
              A-
            </button>
            <span>{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => Math.min(18, s + 1))}
              className="px-1.5 py-0.5 hover:bg-neutral-800 rounded"
              title="Tăng cỡ chữ"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Find & Replace Popover Bar */}
      {showFindReplace && (
        <div className="border-b border-neutral-800 bg-neutral-900 px-3 py-2 flex flex-wrap items-center gap-2 text-xs select-none">
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Tìm kiếm..."
              className="bg-transparent text-white outline-none w-32 sm:w-44 text-xs font-mono"
            />
            {matchCount > 0 && (
              <span className="text-[10px] text-neutral-400 font-mono">
                {matchCount} kết quả
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
            <Replace className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Thay thế bằng..."
              className="bg-transparent text-white outline-none w-32 sm:w-44 text-xs font-mono"
            />
          </div>

          <button
            onClick={handleReplaceAll}
            disabled={!findText || matchCount === 0}
            className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded transition-colors"
          >
            Thay thế tất cả
          </button>

          <button
            onClick={() => setShowFindReplace(false)}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Code Editing Canvas with Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 py-3 bg-neutral-950 text-neutral-600 font-mono text-right pr-3 select-none overflow-hidden shrink-0 border-r border-neutral-800/80"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
        >
          {Array.from({ length: lineCount }).map((_, i) => {
            const lineNum = i + 1;
            const hasErr = errorLines.has(lineNum);
            const hasWarn = warningLines.has(lineNum);
            return (
              <div
                key={i}
                className={`relative ${
                  hasErr
                    ? 'text-rose-400 font-bold bg-rose-950/40'
                    : hasWarn
                    ? 'text-amber-400 font-bold bg-amber-950/40'
                    : ''
                }`}
              >
                {lineNum}
                {hasErr && <span className="absolute right-0 top-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
              </div>
            );
          })}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            onChangeCode(e.target.value);
            updateCursorPosition();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 h-full py-3 px-3 bg-neutral-950 text-neutral-100 font-mono outline-none resize-none overflow-auto whitespace-pre tab-4"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
          placeholder="Nhập mã nguồn LaTeX..."
        />
      </div>

      {/* Bottom Editor Status Bar */}
      <div className="h-6 border-t border-neutral-800/80 bg-neutral-900/60 px-3 flex items-center justify-between text-[11px] text-neutral-400 font-mono select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>Dòng {cursorPos.line}, Cột {cursorPos.col}</span>
          <span className="text-neutral-600">·</span>
          <span>{lineCount} dòng</span>
          <span className="text-neutral-600">·</span>
          <span>{code.length} ký tự</span>
        </div>
        <div className="flex items-center gap-2">
          <span>LaTeX / TeX</span>
          <span className="text-neutral-600">·</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
