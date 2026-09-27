import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, DocumentItem } from './components/Sidebar';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { CompilationConsole } from './components/CompilationConsole';
import { TemplateModal } from './components/TemplateModal';
import { DownloadConfirmModal } from './components/DownloadConfirmModal';
import { StyleEditorModal } from './components/StyleEditorModal';
import { compileLaTeX, CompilerResult } from './utils/latexCompiler';
import { LATEX_TEMPLATES, LatexTemplate } from './data/templates';
import { StyleFile, SAMPLE_STY_PACKAGES, parseStyContent } from './utils/styParser';

export default function App() {
  // Clear any past session storage to guarantee completely non-persistent behavior
  useEffect(() => {
    try {
      localStorage.removeItem('latex_studio_documents_v1');
      localStorage.removeItem('latex_studio_active_id_v1');
      localStorage.removeItem('latex_studio_auto_compile_v1');
    } catch {
      // ignore
    }
  }, []);

  // 1. In-memory ephemeral documents state (NOT saved to localStorage)
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-session-academic',
      title: 'Nghiên cứu Tối ưu hóa Vector (IEEE)',
      code: LATEX_TEMPLATES[0].code,
      updatedAt: Date.now(),
    },
    {
      id: 'doc-session-physics',
      title: 'Sổ tay Vật lý & Giải tích hàm',
      code: LATEX_TEMPLATES[1].code,
      updatedAt: Date.now() - 3600000,
    },
  ]);

  const [activeDocId, setActiveDocId] = useState<string>('doc-session-academic');
  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  // 2. In-memory .sty library packages state
  const [styleFiles, setStyleFiles] = useState<StyleFile[]>(SAMPLE_STY_PACKAGES);
  const [editingStyleFile, setEditingStyleFile] = useState<StyleFile | null>(null);
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState<boolean>(false);

  // 3. Editor & Compiler State
  const [currentCode, setCurrentCode] = useState<string>(activeDoc?.code || '');
  const [currentTitle, setCurrentTitle] = useState<string>(activeDoc?.title || '');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(null);
  const [selectedErrorLine, setSelectedErrorLine] = useState<number | null>(null);

  // 4. Layout and UI Modes
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'docs' | 'tikz' | 'styles' | 'symbols' | 'sandbox'>('docs');
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);

  // 5. Download Confirmation Modal State
  const [downloadModal, setDownloadModal] = useState<{
    isOpen: boolean;
    reason?: string;
    onConfirmedAction?: () => void;
  }>({
    isOpen: false,
  });

  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Execute compilation with current code and style files
  const triggerCompilation = useCallback((codeToCompile: string, currentStyles: StyleFile[] = styleFiles) => {
    setIsCompiling(true);
    requestAnimationFrame(() => {
      const res = compileLaTeX(codeToCompile, currentStyles);
      setCompilerResult(res);
      setIsCompiling(false);
      if (res.status === 'error') {
        setIsConsoleOpen(true);
      }
    });
  }, [styleFiles]);

  // Synchronize activeDoc changes
  useEffect(() => {
    if (activeDoc) {
      setCurrentCode(activeDoc.code);
      setCurrentTitle(activeDoc.title);
      triggerCompilation(activeDoc.code, styleFiles);
    }
  }, [activeDocId]);

  // Handle Code Change in current memory
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);

    // Update in-memory document state immediately
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === activeDocId
          ? { ...doc, code: newCode, updatedAt: Date.now() }
          : doc
      )
    );

    // Auto-compile if enabled
    if (autoCompile) {
      if (compileTimeoutRef.current) clearTimeout(compileTimeoutRef.current);
      compileTimeoutRef.current = setTimeout(() => {
        triggerCompilation(newCode, styleFiles);
      }, 400);
    }
  };

  // Handle Document Title Change
  const handleTitleChange = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === activeDocId
          ? { ...doc, title: newTitle, updatedAt: Date.now() }
          : doc
      )
    );
  };

  // Core download logic for .tex
  const downloadTexFile = (codeToDownload: string = currentCode, titleToDownload: string = currentTitle) => {
    const blob = new Blob([codeToDownload], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = (titleToDownload || 'document').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF-]/g, '_');
    link.download = `${sanitizedTitle}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // User explicitly clicks "Tải .tex"
  const handleManualDownloadRequest = () => {
    setDownloadModal({
      isOpen: true,
      reason: 'Bạn đang chọn xuất và tải về tệp mã nguồn .tex của tài liệu hiện tại.',
      onConfirmedAction: () => {
        downloadTexFile();
      },
    });
  };

  // Switch document with download confirmation
  const handleSelectDoc = (targetId: string) => {
    if (targetId === activeDocId) return;

    setDownloadModal({
      isOpen: true,
      reason: `Bạn sắp chuyển từ tài liệu "${currentTitle}" sang tài liệu khác. Do hệ thống không lưu phiên làm việc, dữ liệu chưa tải về có thể thất lạc khi đóng trình duyệt.`,
      onConfirmedAction: () => {
        downloadTexFile();
        setActiveDocId(targetId);
      },
    });
  };

  // Create New Document
  const handleCreateDocument = () => {
    const performCreate = () => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: 'Tài liệu mới',
        code: `\\documentclass[a4paper,11pt]{article}\n\\usepackage{amsmath,amssymb}\n\\usepackage{math_shortcuts}\n\n\\title{Tiêu đề tài liệu mới}\n\\author{Tác giả}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\n\\section{Nội dung bắt đầu}\nSoạn thảo tài liệu LaTeX của bạn tại đây.\n\n\\end{document}`,
        updatedAt: Date.now(),
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
    };

    setDownloadModal({
      isOpen: true,
      reason: 'Bạn sắp tạo một tài liệu mới. Bạn có muốn tải tệp .tex của tài liệu hiện tại xuống máy trước không?',
      onConfirmedAction: () => {
        downloadTexFile();
        performCreate();
      },
    });
  };

  // Clone Document
  const handleCloneDocument = (docId: string) => {
    const target = documents.find(d => d.id === docId);
    if (!target) return;
    const cloned: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      code: target.code,
      updatedAt: Date.now(),
    };
    setDocuments(prev => [cloned, ...prev]);
    setActiveDocId(cloned.id);
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    const docToDelete = documents.find(d => d.id === docId);
    if (!docToDelete) return;

    setDownloadModal({
      isOpen: true,
      reason: `Bạn sắp xóa hoàn toàn tài liệu "${docToDelete.title}" khỏi phiên làm việc. Bạn có muốn tải tệp .tex xuống máy trước khi xóa không?`,
      onConfirmedAction: () => {
        downloadTexFile(docToDelete.code, docToDelete.title);
        const filtered = documents.filter(d => d.id !== docId);
        if (filtered.length > 0) {
          setDocuments(filtered);
          if (activeDocId === docId) {
            setActiveDocId(filtered[0].id);
          }
        }
      },
    });
  };

  // Select Template
  const handleSelectTemplate = (template: LatexTemplate, asNewDoc: boolean) => {
    setIsTemplateModalOpen(false);

    if (asNewDoc) {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: template.name,
        code: template.code,
        updatedAt: Date.now(),
      };
      setDocuments(prev => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
    } else {
      setDownloadModal({
        isOpen: true,
        reason: `Mẫu "${template.name}" sẽ ghi đè toàn bộ nội dung của "${currentTitle}". Bạn có muốn tải tệp .tex hiện tại xuống trước khi áp dụng mẫu không?`,
        onConfirmedAction: () => {
          downloadTexFile();
          handleCodeChange(template.code);
          handleTitleChange(template.name);
          triggerCompilation(template.code, styleFiles);
        },
      });
    }
  };

  // Insert Snippet into Editor
  const handleInsertSnippet = (snippet: string) => {
    const newCode = currentCode + '\n' + snippet;
    handleCodeChange(newCode);
    if (autoCompile) {
      triggerCompilation(newCode, styleFiles);
    }
  };

  // Export to PDF via window.print
  const handleExportPdf = () => {
    if (!compilerResult) {
      triggerCompilation(currentCode, styleFiles);
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Import .tex file
  const handleImportTex = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const newDoc: DocumentItem = {
          id: `doc-${Date.now()}`,
          title: titleWithoutExt,
          code: content,
          updatedAt: Date.now(),
        };
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);
      }
    };
    reader.readAsText(file);
  };

  // --- .STY Package Handling Methods ---
  const handleUploadStyFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        let fileName = file.name;
        if (!fileName.endsWith('.sty') && !fileName.endsWith('.tex')) {
          fileName += '.sty';
        }
        const { macroList } = parseStyContent(fileName, content);
        const newStyleFile: StyleFile = {
          id: `sty-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: fileName,
          content,
          enabled: true,
          updatedAt: Date.now(),
          macros: macroList,
        };

        setStyleFiles(prev => {
          const existingIdx = prev.findIndex(s => s.name.toLowerCase() === fileName.toLowerCase());
          let updated: StyleFile[];
          if (existingIdx >= 0) {
            updated = [...prev];
            updated[existingIdx] = newStyleFile;
          } else {
            updated = [newStyleFile, ...prev];
          }
          triggerCompilation(currentCode, updated);
          return updated;
        });
      };
      reader.readAsText(file);
    });
  };

  const handleToggleStyFile = (id: string) => {
    setStyleFiles(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
      triggerCompilation(currentCode, updated);
      return updated;
    });
  };

  const handleDeleteStyFile = (id: string) => {
    setStyleFiles(prev => {
      const updated = prev.filter(s => s.id !== id);
      triggerCompilation(currentCode, updated);
      return updated;
    });
  };

  const handleSaveStyFile = (name: string, content: string) => {
    const { macroList } = parseStyContent(name, content);
    setStyleFiles(prev => {
      let updated: StyleFile[];
      if (editingStyleFile) {
        updated = prev.map(s =>
          s.id === editingStyleFile.id
            ? { ...s, name, content, macros: macroList, updatedAt: Date.now() }
            : s
        );
      } else {
        const newSty: StyleFile = {
          id: `sty-${Date.now()}`,
          name,
          content,
          enabled: true,
          updatedAt: Date.now(),
          macros: macroList,
        };
        updated = [newSty, ...prev];
      }
      triggerCompilation(currentCode, updated);
      return updated;
    });
    setEditingStyleFile(null);
  };

  const handleDownloadStyFile = (sty: StyleFile) => {
    const blob = new Blob([sty.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sty.name.endsWith('.sty') ? sty.name : `${sty.name}.sty`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut listener for Ctrl+S -> Prompt user to download .tex
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualDownloadRequest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentCode, currentTitle]);

  // Window beforeunload warning for non-persistent session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Phiên làm việc không được lưu. Bạn có chắc muốn đóng trang web không?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const activeStylesCount = styleFiles.filter(s => s.enabled).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Header Bar */}
      <div className="no-print">
        <Header
          documentTitle={currentTitle}
          onUpdateTitle={handleTitleChange}
          onCompile={() => triggerCompilation(currentCode, styleFiles)}
          isCompiling={isCompiling}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onOpenTemplates={() => setIsTemplateModalOpen(true)}
          onOpenTikz={() => {
            setIsSidebarOpen(true);
            setSidebarActiveTab('tikz');
          }}
          onOpenStyles={() => {
            setIsSidebarOpen(true);
            setSidebarActiveTab('styles');
          }}
          activeStylesCount={activeStylesCount}
          onRequestDownloadTex={handleManualDownloadRequest}
          onExportPdf={handleExportPdf}
          onImportTex={handleImportTex}
          autoCompile={autoCompile}
          onToggleAutoCompile={() => setAutoCompile(v => !v)}
          onToggleSidebar={() => setIsSidebarOpen(v => !v)}
          isSidebarOpen={isSidebarOpen}
          metrics={{
            compileTimeMs: compilerResult?.metrics.compileTimeMs || 0,
            equationCount: compilerResult?.metrics.equationCount || 0,
          }}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Sidebar */}
        {isSidebarOpen && (
          <div className="no-print h-full">
            <Sidebar
              documents={documents}
              activeDocId={activeDocId}
              onSelectDoc={handleSelectDoc}
              onCreateDoc={handleCreateDocument}
              onCloneDoc={handleCloneDocument}
              onDeleteDoc={handleDeleteDocument}
              onInsertSnippet={handleInsertSnippet}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              styleFiles={styleFiles}
              onUploadStyFiles={handleUploadStyFiles}
              onToggleStyFile={handleToggleStyFile}
              onDeleteStyFile={handleDeleteStyFile}
              onOpenEditStyFile={(sty) => {
                setEditingStyleFile(sty);
                setIsStyleEditorOpen(true);
              }}
              onDownloadStyFile={handleDownloadStyFile}
              activeTab={sidebarActiveTab}
              onTabChange={setSidebarActiveTab}
            />
          </div>
        )}

        {/* Editor & Preview Split View */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Pane (Hidden in preview mode) */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div
                className={`no-print h-full flex flex-col ${
                  viewMode === 'split' ? 'w-1/2 border-r border-neutral-800' : 'w-full'
                }`}
              >
                <EditorPane
                  code={currentCode}
                  onChangeCode={handleCodeChange}
                  onCompile={() => triggerCompilation(currentCode, styleFiles)}
                  logs={compilerResult?.logs || []}
                  selectedLine={selectedErrorLine}
                  onClearSelectedLine={() => setSelectedErrorLine(null)}
                />
              </div>
            )}

            {/* Preview Pane (Hidden in editor mode) */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                <PreviewPane
                  compilerResult={compilerResult}
                  isCompiling={isCompiling}
                  onExportPdf={handleExportPdf}
                />
              </div>
            )}
          </div>

          {/* Compilation Console Drawer */}
          <div className="no-print">
            <CompilationConsole
              result={compilerResult}
              isOpen={isConsoleOpen}
              onToggle={() => setIsConsoleOpen(v => !v)}
              onSelectLine={(line) => {
                setSelectedErrorLine(line);
                if (viewMode === 'preview') {
                  setViewMode('split');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Template Chooser Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Style File Editor Modal */}
      <StyleEditorModal
        isOpen={isStyleEditorOpen}
        onClose={() => {
          setIsStyleEditorOpen(false);
          setEditingStyleFile(null);
        }}
        styleFile={editingStyleFile}
        onSave={handleSaveStyFile}
      />

      {/* Confirmation Modal to Download .tex before leaving/changing */}
      <DownloadConfirmModal
        isOpen={downloadModal.isOpen}
        documentTitle={currentTitle}
        actionReason={downloadModal.reason}
        onConfirmDownload={() => {
          downloadModal.onConfirmedAction?.();
          setDownloadModal({ isOpen: false });
        }}
        onProceedWithoutDownload={() => {
          if (downloadModal.reason?.includes('xuất và tải về tệp')) {
            setDownloadModal({ isOpen: false });
            return;
          }
          if (downloadModal.onConfirmedAction) {
            const reason = downloadModal.reason || '';
            if (reason.includes('tạo một tài liệu mới')) {
              const newDoc: DocumentItem = {
                id: `doc-${Date.now()}`,
                title: 'Tài liệu mới',
                code: `\\documentclass[a4paper,11pt]{article}\n\\usepackage{amsmath,amssymb}\n\\usepackage{math_shortcuts}\n\n\\title{Tiêu đề tài liệu mới}\n\\author{Tác giả}\n\\date{\\today}\n\n\\begin{document}\n\\maketitle\n\n\\section{Nội dung bắt đầu}\nSoạn thảo tài liệu LaTeX của bạn tại đây.\n\n\\end{document}`,
                updatedAt: Date.now(),
              };
              setDocuments(prev => [newDoc, ...prev]);
              setActiveDocId(newDoc.id);
            } else if (reason.includes('chuyển từ tài liệu')) {
              const targetDocMatch = documents.find(d => reason.includes(d.title) === false);
              if (targetDocMatch) {
                setActiveDocId(targetDocMatch.id);
              }
            } else if (reason.includes('xóa hoàn toàn tài liệu')) {
              const match = reason.match(/"([^"]+)"/);
              if (match) {
                const docToDelete = documents.find(d => d.title === match[1]);
                if (docToDelete) {
                  const filtered = documents.filter(d => d.id !== docToDelete.id);
                  setDocuments(filtered);
                  if (activeDocId === docToDelete.id && filtered.length > 0) {
                    setActiveDocId(filtered[0].id);
                  }
                }
              }
            } else if (reason.includes('ghi đè toàn bộ nội dung')) {
              const tplNameMatch = reason.match(/Mẫu "([^"]+)"/);
              if (tplNameMatch) {
                const tpl = LATEX_TEMPLATES.find(t => t.name === tplNameMatch[1]);
                if (tpl) {
                  handleCodeChange(tpl.code);
                  handleTitleChange(tpl.name);
                  triggerCompilation(tpl.code, styleFiles);
                }
              }
            }
          }
          setDownloadModal({ isOpen: false });
        }}
        onCancel={() => {
          setDownloadModal({ isOpen: false });
        }}
      />
    </div>
  );
}
