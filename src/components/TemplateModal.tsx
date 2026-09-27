import React, { useState } from 'react';
import { X, LayoutTemplate, Check, FileText } from 'lucide-react';
import { LATEX_TEMPLATES, LatexTemplate } from '../data/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: LatexTemplate, asNewDoc: boolean) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates = LATEX_TEMPLATES.filter(tpl => {
    if (selectedCategory === 'all') return true;
    return tpl.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Thư viện Mẫu tài liệu LaTeX chuẩn</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Chọn mẫu văn bản phù hợp để bắt đầu soạn thảo nhanh chóng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-2.5 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto bg-neutral-950/40">
          {[
            { id: 'all', label: 'Tất cả mẫu' },
            { id: 'academic', label: 'Bài báo & Luận văn' },
            { id: 'notes', label: 'Toán học & Ghi chép' },
            { id: 'career', label: 'Sơ yếu lý lịch / CV' },
            { id: 'exam', label: 'Đề thi & Kiểm tra' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="p-4 rounded-lg border border-neutral-800 hover:border-indigo-500/60 bg-neutral-950/50 hover:bg-neutral-950 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {tpl.name}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-3">
                  {tpl.description}
                </p>

                {/* Code snippet preview */}
                <div className="p-2 rounded bg-neutral-900/90 border border-neutral-800/80 font-mono text-[11px] text-neutral-400 h-16 overflow-hidden select-none line-clamp-3">
                  {tpl.code.substring(0, 180)}...
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => onSelectTemplate(tpl, true)}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                  title="Tạo tài liệu mới từ mẫu này"
                >
                  Tạo tài liệu mới
                </button>
                <button
                  onClick={() => onSelectTemplate(tpl, false)}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                  title="Áp dụng vào tài liệu hiện tại"
                >
                  Áp dụng mẫu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
