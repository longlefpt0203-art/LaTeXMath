import React from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronUp, 
  ChevronDown,
  Info
} from 'lucide-react';
import { CompilationLog, CompilerResult } from '../utils/latexCompiler';

interface CompilationConsoleProps {
  result: CompilerResult | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectLine: (line: number) => void;
}

export const CompilationConsole: React.FC<CompilationConsoleProps> = ({
  result,
  isOpen,
  onToggle,
  onSelectLine,
}) => {
  if (!result) return null;

  const errorCount = result.logs.filter(l => l.type === 'error').length;
  const warningCount = result.logs.filter(l => l.type === 'warning').length;

  return (
    <div className="border-t border-neutral-800 bg-neutral-950 flex flex-col z-20 shrink-0">
      {/* Console Header Bar */}
      <div 
        onClick={onToggle}
        className="h-8 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-900/50 transition-colors select-none text-xs"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-medium text-neutral-300">Nhật ký biên dịch</span>
          <span className="text-neutral-600">·</span>

          {result.status === 'success' && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Thành công ({result.metrics.compileTimeMs}ms)</span>
            </div>
          )}

          {result.status === 'warning' && (
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount} cảnh báo ({result.metrics.compileTimeMs}ms)</span>
            </div>
          )}

          {result.status === 'error' && (
            <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
              <XCircle className="w-3.5 h-3.5" />
              <span>{errorCount} lỗi cú pháp</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] font-mono hidden sm:inline">
            {result.metrics.equationCount} công thức · ~{result.metrics.estimatedPages} trang
          </span>
          <button className="p-0.5 hover:text-white">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Logs Details */}
      {isOpen && (
        <div className="max-h-52 overflow-y-auto p-3 space-y-2 border-t border-neutral-800/80 bg-neutral-950 font-mono text-xs">
          {result.logs.length === 0 ? (
            <div className="text-neutral-500 py-2">Không có ghi nhận nào.</div>
          ) : (
            result.logs.map(log => {
              const isError = log.type === 'error';
              const isWarning = log.type === 'warning';

              return (
                <div
                  key={log.id}
                  onClick={() => log.line && onSelectLine(log.line)}
                  className={`p-2 rounded border transition-colors ${
                    log.line ? 'cursor-pointer' : ''
                  } ${
                    isError
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300 hover:bg-rose-950/40'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-900/50 text-amber-300 hover:bg-amber-950/40'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isError && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    {!isError && !isWarning && <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.line && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[10px] font-bold">
                            Dòng {log.line}
                          </span>
                        )}
                        <span className="font-sans font-medium">{log.message}</span>
                      </div>
                      {log.detail && (
                        <div className="text-[11px] text-neutral-400 mt-1 opacity-90 truncate">
                          {log.detail}
                        </div>
                      )}
                    </div>

                    {log.line && (
                      <span className="text-[10px] text-neutral-500 underline shrink-0">
                        Nhảy đến dòng
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
