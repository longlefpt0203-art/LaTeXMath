import React, { useState, useEffect } from 'react';
import { X, Package, Check, Code, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { StyleFile, parseStyContent } from '../utils/styParser';

interface StyleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleFile: StyleFile | null;
  onSave: (name: string, content: string) => void;
}

export const StyleEditorModal: React.FC<StyleEditorModalProps> = ({
  isOpen,
  onClose,
  styleFile,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ macros: Record<string, string>; macroList: any[] }>({
    macros: {},
    macroList: [],
  });

  useEffect(() => {
    if (styleFile) {
      setName(styleFile.name);
      setContent(styleFile.content);
    } else {
      setName('custom_package.sty');
      setContent(`% Thư viện LaTeX cá nhân
\\ProvidesPackage{custom_package}

% Định nghĩa các lệnh viết tắt và macro toán học
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\norm}[1]{\\left\\| #1 \\right\\|}
\\DeclareMathOperator{\\argmax}{arg\\,max}
`);
    }
  }, [styleFile, isOpen]);

  // Live parse macros as content changes
  useEffect(() => {
    const res = parseStyContent(name || 'package.sty', content);
    setParsedPreview(res);
  }, [name, content]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalName = name.trim();
    if (!finalName.endsWith('.sty')) {
      finalName += '.sty';
    }
    onSave(finalName, content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {styleFile ? `Chỉnh sửa thư viện: ${styleFile.name}` : 'Tạo gói thư viện .sty mới'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Định nghĩa các lệnh \\newcommand, \\DeclareMathOperator để dùng trong tài liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 mb-1.5 block">
              Tên tệp thư viện (phải có đuôi .sty):
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ví dụ: mymath.sty, physics_defs.sty"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-md text-xs font-mono text-white outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-300">
                Nội dung mã nguồn .sty:
              </label>
              <span className="text-[11px] text-neutral-500 font-mono">
                {content.split('\n').length} dòng
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              spellCheck={false}
              className="w-full p-3 bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-md text-xs font-mono text-neutral-200 outline-none resize-none leading-relaxed"
              placeholder="% Nhập các lệnh \newcommand, \DeclareMathOperator..."
            />
          </div>

          {/* Parsed macros summary badge */}
          <div className="p-3 bg-neutral-950/60 rounded-lg border border-neutral-800">
            <div className="text-xs font-medium text-neutral-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Macro nhận diện tự động ({parsedPreview.macroList.length}):</span>
              </span>
              <span className="text-[10px] text-neutral-500">Sẵn sàng dùng trong KaTeX</span>
            </div>

            {parsedPreview.macroList.length === 0 ? (
              <div className="text-xs text-neutral-500 italic">
                Chưa phát hiện macro hợp lệ (hãy dùng \newcommand, \renewcommand hoặc \DeclareMathOperator).
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {parsedPreview.macroList.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-indigo-300"
                    title={`${m.name}: ${m.definition}`}
                  >
                    {m.name}
                    {m.argsCount > 0 && <span className="text-neutral-500 ml-1">[{m.argsCount}]</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-transparent hover:bg-neutral-800 rounded-md transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-md transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{styleFile ? 'Lưu thay đổi' : 'Tạo gói .sty'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
