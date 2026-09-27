import React, { useState } from 'react';
import { Download, AlertTriangle, FileText, ArrowRight, X } from 'lucide-react';

interface DownloadConfirmModalProps {
  isOpen: boolean;
  documentTitle: string;
  onConfirmDownload: () => void;
  onProceedWithoutDownload: () => void;
  onCancel: () => void;
  actionReason?: string;
}

export const DownloadConfirmModal: React.FC<DownloadConfirmModalProps> = ({
  isOpen,
  documentTitle,
  onConfirmDownload,
  onProceedWithoutDownload,
  onCancel,
  actionReason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Tải về tệp .tex của bạn?</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Chế độ không lưu phiên làm việc (Ephemeral)</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-3.5">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Lưu ý quan trọng: </span>
              Hệ thống không lưu dữ liệu phiên làm việc này vào trình duyệt để đảm bảo bảo mật và tính riêng tư cá nhân.
              {actionReason && (
                <div className="mt-1 text-neutral-300">
                  {actionReason}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {documentTitle || 'document'}.tex
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Mã nguồn LaTeX hiện tại
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-normal">
            Bạn có muốn tải tệp mã nguồn <strong className="text-neutral-200 font-mono">.tex</strong> về máy tính ngay bây giờ trước khi tiếp tục không?
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-transparent hover:bg-neutral-800 rounded-md transition-colors"
          >
            Hủy thao tác
          </button>
          <button
            onClick={onProceedWithoutDownload}
            className="px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
          >
            Không tải, tiếp tục
          </button>
          <button
            onClick={onConfirmDownload}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file .tex về máy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
