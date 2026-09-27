import katex from 'katex';
import { StyleFile, parseStyContent } from './styParser';
import { renderTikzToHtml } from './tikzRenderer';

export interface CompilationLog {
  id: string;
  type: 'error' | 'warning' | 'info';
  line?: number;
  message: string;
  detail?: string;
}

export interface CompilerResult {
  html: string;
  status: 'success' | 'warning' | 'error';
  logs: CompilationLog[];
  metrics: {
    compileTimeMs: number;
    equationCount: number;
    wordCount: number;
    charCount: number;
    estimatedPages: number;
    sectionCount: number;
    activePackagesCount: number;
    tikzCount: number;
  };
  metadata: {
    title: string;
    author: string;
    date: string;
    documentClass: string;
  };
}

/**
 * Robust LaTeX document parser and compiler with .sty package support
 */
export function compileLaTeX(latexCode: string, styleFiles: StyleFile[] = []): CompilerResult {
  const startTime = performance.now();
  const logs: CompilationLog[] = [];
  let equationCount = 0;
  let sectionCount = 0;
  let tikzCount = 0;

  // Custom KaTeX macros storage
  const macros: Record<string, string> = {
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\C': '\\mathbb{C}',
    '\\Q': '\\mathbb{Q}',
    '\\eps': '\\varepsilon',
  };

  // Extract \usepackage declarations in code
  const packageMatches = [...latexCode.matchAll(/\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g)];
  const requestedPackages = new Set<string>();
  packageMatches.forEach(m => {
    m[1].split(',').forEach(p => requestedPackages.add(p.trim()));
  });

  // Inject macros from active .sty files
  let totalStyMacrosCount = 0;
  const activeStyleFiles = styleFiles.filter(sf => sf.enabled);

  activeStyleFiles.forEach(sty => {
    const parsed = parseStyContent(sty.name, sty.content);
    const macroKeys = Object.keys(parsed.macros);
    totalStyMacrosCount += macroKeys.length;
    Object.assign(macros, parsed.macros);

    const baseName = sty.name.replace(/\.sty$/i, '');
    const isExplicitlyUsed = requestedPackages.has(baseName) || requestedPackages.has(sty.name);

    logs.push({
      id: `sty-loaded-${sty.id}`,
      type: 'info',
      message: `Đã nạp gói thư viện "${sty.name}" (${macroKeys.length} macro)${isExplicitlyUsed ? ' theo \\usepackage' : ''}.`,
      detail: macroKeys.slice(0, 6).join(', ') + (macroKeys.length > 6 ? ` và ${macroKeys.length - 6} macro khác...` : ''),
    });
  });

  // Check if requested packages have an uploaded .sty file
  const standardPackages = new Set([
    'amsmath', 'amssymb', 'amsfonts', 'mathtools', 'graphicx', 'xcolor', 
    'geometry', 'hyperref', 'array', 'tabularx', 'booktabs', 'cite', 
    'algorithm', 'algorithmic', 'listings', 'inputenc', 'fontenc', 'babel'
  ]);

  requestedPackages.forEach(pkg => {
    if (!standardPackages.has(pkg)) {
      const foundInSty = activeStyleFiles.some(s => s.name.replace(/\.sty$/i, '') === pkg || s.name === pkg);
      if (!foundInSty) {
        logs.push({
          id: `pkg-notice-${pkg}`,
          type: 'info',
          message: `Gói \\usepackage{${pkg}} được khai báo.`,
          detail: `Bạn có thể tải lên tệp "${pkg}.sty" vào tab "Gói .sty" để ứng dụng tự động nhận diện các macro và lệnh riêng.`,
        });
      }
    }
  });

  // 1. Pre-validation: check syntax errors and unbalanced delimiters
  const lines = latexCode.split('\n');
  const envStack: { name: string; line: number }[] = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('%')) return; // ignore full comment lines

    // Extract custom newcommand
    const newCmdMatch = line.match(/\\newcommand\{\\([a-zA-Z]+)\}(?:\[\d+\])?\{([^}]+)\}/);
    if (newCmdMatch) {
      macros[`\\${newCmdMatch[1]}`] = newCmdMatch[2];
    }

    // Check environment pairs
    const beginMatches = [...line.matchAll(/\\begin\{([a-zA-Z0-9*]+)\}/g)];
    const endMatches = [...line.matchAll(/\\end\{([a-zA-Z0-9*]+)\}/g)];

    for (const b of beginMatches) {
      envStack.push({ name: b[1], line: lineNum });
    }
    for (const e of endMatches) {
      const envName = e[1];
      if (envStack.length === 0) {
        logs.push({
          id: `unmatched-end-${lineNum}`,
          type: 'error',
          line: lineNum,
          message: `Lệnh \\end{${envName}} không có \\begin tương ứng.`,
        });
      } else {
        const last = envStack.pop()!;
        if (last.name !== envName) {
          logs.push({
            id: `mismatched-env-${lineNum}`,
            type: 'warning',
            line: lineNum,
            message: `Môi trường đóng \\end{${envName}} không khớp với \\begin{${last.name}} ở dòng ${last.line}.`,
          });
        }
      }
    }

    // Check unbalanced curly braces
    let braceCount = 0;
    let inEscape = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '%' && !inEscape) break; // rest is comment
      if (char === '\\') {
        inEscape = !inEscape;
        continue;
      }
      if (!inEscape) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      inEscape = false;
    }
    if (braceCount !== 0 && !line.includes('\\begin') && !line.includes('\\end')) {
      // Small notice on lines with possible unclosed braces
      if (Math.abs(braceCount) > 2) {
        logs.push({
          id: `brace-warning-${lineNum}`,
          type: 'warning',
          line: lineNum,
          message: `Dấu ngoặc nhọn { } có thể chưa được đóng cân bằng ở dòng này.`,
        });
      }
    }
  });

  if (envStack.length > 0) {
    envStack.forEach((unclosed) => {
      logs.push({
        id: `unclosed-env-${unclosed.line}`,
        type: 'error',
        line: unclosed.line,
        message: `Môi trường \\begin{${unclosed.name}} chưa được đóng bằng \\end{${unclosed.name}}.`,
      });
    });
  }

  // 2. Extract metadata from preamble
  const docClassMatch = latexCode.match(/\\documentclass(?:\[[^\]]*\])?\{([a-zA-Z0-9]+)\}/);
  const titleMatch = latexCode.match(/\\title\{([\s\S]*?)\}(?=\s*\\author|\s*\\date|\s*\\begin|\s*\n\n|$)/);
  const authorMatch = latexCode.match(/\\author\{([\s\S]*?)\}(?=\s*\\title|\s*\\date|\s*\\begin|\s*\n\n|$)/);
  const dateMatch = latexCode.match(/\\date\{([\s\S]*?)\}(?=\s*\\title|\s*\\author|\s*\\begin|\s*\n\n|$)/);

  const metadata = {
    documentClass: docClassMatch ? docClassMatch[1] : 'article',
    title: titleMatch ? cleanLatexArg(titleMatch[1]) : '',
    author: authorMatch ? cleanLatexArg(authorMatch[1]) : '',
    date: dateMatch ? cleanLatexArg(dateMatch[1]) : 'Ngày ' + new Date().toLocaleDateString('vi-VN'),
  };

  // 3. Extract Document Body
  let bodyContent = latexCode;
  const docBodyMatch = latexCode.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docBodyMatch) {
    bodyContent = docBodyMatch[1];
  } else {
    // If no document environment, strip common preamble lines
    bodyContent = latexCode
      .replace(/\\documentclass[\s\S]*?\n/, '')
      .replace(/\\usepackage[\s\S]*?\n/g, '')
      .replace(/\\title\{[\s\S]*?\}\n?/g, '')
      .replace(/\\author\{[\s\S]*?\}\n?/g, '')
      .replace(/\\date\{[\s\S]*?\}\n?/g, '')
      .replace(/\\newcommand[\s\S]*?\n/g, '');
  }

  // 4. Transform LaTeX document into structured HTML
  let parsedHtml = '';
  let eqNumber = 1;
  const footnotes: string[] = [];
  const citations: Record<string, number> = {};
  let citationIndex = 1;

  // Clean comments (preserve escaped \%)
  let processed = bodyContent
    .split('\n')
    .map(line => {
      let out = '';
      let isEscaped = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '%' && !isEscaped) {
          break;
        }
        if (line[i] === '\\') {
          isEscaped = !isEscaped;
        } else {
          isEscaped = false;
        }
        out += line[i];
      }
      return out;
    })
    .join('\n');

  // Handle \maketitle
  const makeTitleHtml = (metadata.title || metadata.author)
    ? `<header class="text-center pb-8 mb-8 border-b border-neutral-300">
        ${metadata.title ? `<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-3 latex-font-serif leading-tight">${renderInlineMath(metadata.title, macros, logs)}</h1>` : ''}
        ${metadata.author ? `<div class="text-base text-neutral-700 font-medium mb-1">${renderInlineMath(metadata.author.replace(/\\\\/g, ' · '), macros, logs)}</div>` : ''}
        ${metadata.date ? `<div class="text-xs text-neutral-500 italic">${metadata.date}</div>` : ''}
      </header>`
    : '';

  processed = processed.replace(/\\maketitle/g, '###MAKETITLE_PLACEHOLDER###');

  // Handle Table of contents placeholder
  processed = processed.replace(/\\tableofcontents/g, '###TOC_PLACEHOLDER###');

  // Handle Abstract
  processed = processed.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (_, content) => {
    return `<div class="my-6 px-6 sm:px-10 py-4 bg-neutral-50/70 border-y border-neutral-200 text-sm leading-relaxed text-neutral-800">
      <div class="text-center font-bold text-xs uppercase tracking-wider text-neutral-700 mb-2">Tóm tắt (Abstract)</div>
      <div class="italic text-justify">${content.trim()}</div>
    </div>`;
  });

  // Handle Theorems, Definitions, Proofs, Lemmas
  const academicEnvs = [
    { name: 'theorem', title: 'Định lý', border: 'border-l-4 border-indigo-600 bg-indigo-50/30' },
    { name: 'lemma', title: 'Bổ đề', border: 'border-l-4 border-sky-600 bg-sky-50/30' },
    { name: 'definition', title: 'Định nghĩa', border: 'border-l-4 border-emerald-600 bg-emerald-50/30' },
    { name: 'proof', title: 'Chứng minh', border: 'border-l-2 border-neutral-400 bg-neutral-50/40' },
    { name: 'example', title: 'Ví dụ', border: 'border-l-4 border-amber-600 bg-amber-50/30' },
    { name: 'corollary', title: 'Hệ quả', border: 'border-l-4 border-purple-600 bg-purple-50/30' },
  ];

  academicEnvs.forEach(env => {
    const reg = new RegExp(`\\\\begin\\{${env.name}\\}(?:\\[([^\\]]*)\\])?([\\s\\S]*?)\\\\end\\{${env.name}\\}`, 'g');
    processed = processed.replace(reg, (_, optTitle, content) => {
      const heading = optTitle ? `${env.title} (${optTitle})` : env.title;
      const isProof = env.name === 'proof';
      return `<div class="my-5 p-4 rounded-r-md ${env.border} text-neutral-800 leading-relaxed text-sm">
        <div class="font-bold text-neutral-900 mb-1.5 flex items-center justify-between">
          <span>${heading}</span>
          ${isProof ? `<span class="text-xs text-neutral-500 font-normal">Q.E.D. ■</span>` : ''}
        </div>
        <div class="${isProof ? 'text-neutral-800' : 'italic'}">${content.trim()}</div>
      </div>`;
    });
  });

  // Handle Code blocks / Verbatim / lstlisting
  processed = processed.replace(/\\begin\{(?:verbatim|lstlisting)\}([\s\S]*?)\\end\{(?:verbatim|lstlisting)\}/g, (_, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre class="my-4 p-4 rounded-md bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto border border-neutral-800 leading-normal"><code>${escaped}</code></pre>`;
  });

  // Handle Display Math: \begin{equation*?}, \begin{align*?}, \begin{gather*?}, \[ ... \], $$ ... $$
  processed = processed.replace(/\\begin\{(equation|align|gather)\*?\}([\s\S]*?)\\end\{\1\*?\}/g, (_, envType, mathCode) => {
    equationCount++;
    const isNumbered = !_.includes('*');
    const rendered = renderKatexDisplay(mathCode, macros, logs);
    const numBadge = isNumbered ? `<span class="text-xs text-neutral-500 font-mono ml-4 select-none self-center">(${eqNumber++})</span>` : '';
    return `<div class="my-4 flex items-center justify-center relative group overflow-x-auto py-1">
      <div class="flex-1 text-center">${rendered}</div>
      ${numBadge}
    </div>`;
  });

  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, mathCode) => {
    equationCount++;
    const rendered = renderKatexDisplay(mathCode, macros, logs);
    return `<div class="my-4 overflow-x-auto text-center py-1">${rendered}</div>`;
  });

  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, mathCode) => {
    equationCount++;
    const rendered = renderKatexDisplay(mathCode, macros, logs);
    return `<div class="my-4 overflow-x-auto text-center py-1">${rendered}</div>`;
  });

  // Handle Tabular & Tables
  processed = processed.replace(/\\begin\{table\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{table\}/g, (_, tableBody) => {
    const captionMatch = tableBody.match(/\\caption\{([^}]+)\}/);
    const caption = captionMatch ? captionMatch[1] : '';
    const cleanBody = tableBody.replace(/\\caption\{[^}]+\}/g, '').replace(/\\label\{[^}]+\}/g, '').trim();
    return `<figure class="my-6 overflow-x-auto text-center">
      ${cleanBody}
      ${caption ? `<figcaption class="text-xs text-neutral-600 italic mt-2 text-center">Bảng: ${caption}</figcaption>` : ''}
    </figure>`;
  });

  processed = processed.replace(/\\begin\{tabular\}\{([^}]+)\}([\s\S]*?)\\end\{tabular\}/g, (_, colSpec, content) => {
    return parseTabular(colSpec, content, macros, logs);
  });

  // Handle TikZ Environments: \begin{tikzpicture} ... \end{tikzpicture}
  processed = processed.replace(/\\begin\{tikzpicture\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{tikzpicture\}/g, (match) => {
    tikzCount++;
    return renderTikzToHtml(match);
  });

  // Handle Figures
  processed = processed.replace(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g, (_, figBody) => {
    const captionMatch = figBody.match(/\\caption\{([^}]+)\}/);
    const caption = captionMatch ? captionMatch[1] : '';
    const cleanBody = figBody.replace(/\\caption\{[^}]+\}/g, '').replace(/\\label\{[^}]+\}/g, '').trim();

    if (cleanBody.includes('<svg') || cleanBody.includes('<table') || cleanBody.includes('Bảng biến thiên')) {
      return `<figure class="my-6 text-center">
        ${cleanBody}
        ${caption ? `<figcaption class="text-xs text-neutral-600 italic mt-2">Hình: ${caption}</figcaption>` : ''}
      </figure>`;
    }

    const imgMatch = figBody.match(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/);
    const imgSource = imgMatch ? imgMatch[1] : '';
    
    return `<figure class="my-6 text-center">
      <div class="p-6 bg-neutral-100 rounded-md border border-neutral-200 inline-block max-w-full">
        <div class="text-xs text-neutral-500 font-mono mb-2 flex items-center justify-center gap-1.5">
          <svg class="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Hình ảnh minh họa: ${imgSource || 'latex_figure.png'}</span>
        </div>
        <div class="w-64 h-32 mx-auto bg-neutral-200/80 rounded flex items-center justify-center text-neutral-400 text-xs italic">
          [Khu vực đồ thị / hình vẽ TeX]
        </div>
      </div>
      ${caption ? `<figcaption class="text-xs text-neutral-600 italic mt-2">Hình: ${caption}</figcaption>` : ''}
    </figure>`;
  });

  // Handle Lists: itemize and enumerate
  processed = processed.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_, content) => {
    const items = content.split('\\item').slice(1).map((item: string) => `<li class="ml-4 pl-1">${item.trim()}</li>`).join('');
    return `<ul class="list-disc my-3 space-y-1 text-sm text-neutral-800 ml-4">${items}</ul>`;
  });

  processed = processed.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (_, content) => {
    const items = content.split('\\item').slice(1).map((item: string) => `<li class="ml-4 pl-1">${item.trim()}</li>`).join('');
    return `<ol class="list-decimal my-3 space-y-1 text-sm text-neutral-800 ml-4">${items}</ol>`;
  });

  // Handle Sections, Subsections, Subsubsections with numbering
  const tocEntries: { level: number; title: string; id: string }[] = [];
  let secIdx = 1;
  let subSecIdx = 1;
  let subSubSecIdx = 1;

  processed = processed.replace(/\\section\*?\{([^}]+)\}/g, (_, title) => {
    sectionCount++;
    const isNumbered = !_.includes('*');
    const numPrefix = isNumbered ? `${secIdx++}. ` : '';
    subSecIdx = 1;
    const cleanT = cleanLatexArg(title);
    const id = `sec-${secIdx}`;
    tocEntries.push({ level: 1, title: `${numPrefix}${cleanT}`, id });
    return `<h2 id="${id}" class="text-xl font-bold tracking-tight text-neutral-900 mt-8 mb-3 pb-1 border-b border-neutral-200 latex-font-serif flex items-baseline gap-2">
      <span class="text-neutral-900">${numPrefix}${cleanT}</span>
    </h2>`;
  });

  processed = processed.replace(/\\subsection\*?\{([^}]+)\}/g, (_, title) => {
    const isNumbered = !_.includes('*');
    const numPrefix = isNumbered ? `${secIdx - 1}.${subSecIdx++} ` : '';
    subSubSecIdx = 1;
    const cleanT = cleanLatexArg(title);
    const id = `subsec-${secIdx}-${subSecIdx}`;
    tocEntries.push({ level: 2, title: `${numPrefix}${cleanT}`, id });
    return `<h3 id="${id}" class="text-base font-semibold text-neutral-900 mt-6 mb-2 latex-font-serif">
      ${numPrefix}${cleanT}
    </h3>`;
  });

  processed = processed.replace(/\\subsubsection\*?\{([^}]+)\}/g, (_, title) => {
    const isNumbered = !_.includes('*');
    const numPrefix = isNumbered ? `${secIdx - 1}.${subSecIdx - 1}.${subSubSecIdx++} ` : '';
    const cleanT = cleanLatexArg(title);
    return `<h4 class="text-sm font-semibold text-neutral-800 mt-4 mb-1.5 latex-font-serif">
      ${numPrefix}${cleanT}
    </h4>`;
  });

  // Handle Footnotes: \footnote{...}
  processed = processed.replace(/\\footnote\{([^}]+)\}/g, (_, text) => {
    footnotes.push(text.trim());
    const fnIdx = footnotes.length;
    return `<sup class="cursor-pointer text-indigo-600 font-mono text-[10px] hover:underline" title="${escapeHtml(text)}">[${fnIdx}]</sup>`;
  });

  // Handle Citations: \cite{...}
  processed = processed.replace(/\\cite\{([^}]+)\}/g, (_, key) => {
    const cleanKey = key.trim();
    if (!citations[cleanKey]) {
      citations[cleanKey] = citationIndex++;
    }
    return `<span class="inline-block px-1 py-0.2 text-[11px] font-mono text-neutral-700 bg-neutral-100 rounded border border-neutral-200 select-none">[${citations[cleanKey]}]</span>`;
  });

  // Handle Text Styling
  processed = processed
    .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>')
    .replace(/\\underline\{([^}]+)\}/g, '<span class="underline underline-offset-2">$1</span>')
    .replace(/\\texttt\{([^}]+)\}/g, '<code class="px-1 py-0.5 rounded bg-neutral-100 font-mono text-xs text-neutral-800 border border-neutral-200">$1</code>')
    .replace(/\\textsc\{([^}]+)\}/g, '<span class="uppercase tracking-wider text-xs">$1</span>')
    .replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-mono text-xs">$1</a>')
    .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">$2</a>')
    .replace(/\\hrule/g, '<hr class="my-6 border-neutral-200" />')
    .replace(/\\newpage|\\clearpage/g, '<div class="my-8 py-3 border-b-2 border-dashed border-neutral-300 text-center text-xs text-neutral-400 select-none font-mono">── Hết trang (New Page) ──</div>');

  // Handle Inline Math: $...$ or \( ... \)
  // Replace inline math safely
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, mathCode) => {
    equationCount++;
    return renderKatexInline(mathCode, macros, logs);
  });

  processed = processed.replace(/(?<!\\)\$((?:\\\$|[^$])+?)\$/g, (_, mathCode) => {
    equationCount++;
    return renderKatexInline(mathCode, macros, logs);
  });

  // Handle Paragraphs and linebreaks
  // Replace \\ with <br />
  processed = processed.replace(/\\\\/g, '<br />');

  // Clean unhandled basic LaTeX tokens
  processed = processed
    .replace(/\\label\{[^}]*\}/g, '')
    .replace(/\\ref\{([^}]*)\}/g, '<span class="font-mono text-xs text-indigo-600">[ref:$1]</span>')
    .replace(/\\noindent/g, '')
    .replace(/\\indent/g, '&emsp;')
    .replace(/\\quad/g, '&emsp;')
    .replace(/\\qquad/g, '&emsp;&emsp;')
    .replace(/\\,/g, '&thinsp;')
    .replace(/\\;/g, '&nbsp;&nbsp;')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&amp;')
    .replace(/\\_/g, '_')
    .replace(/\\#/g, '#')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}');

  // Break into paragraphs by double newlines
  const paragraphs = processed.split(/\n{2,}/);
  const formattedParagraphs = paragraphs
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('###')
      ) {
        return trimmed;
      }
      return `<p class="my-2.5 text-justify leading-relaxed text-sm text-neutral-800">${trimmed}</p>`;
    })
    .join('\n');

  parsedHtml = formattedParagraphs;

  // Replace Table of Contents
  let tocHtml = '';
  if (tocEntries.length > 0) {
    tocHtml = `<div class="my-6 p-4 bg-neutral-50 rounded border border-neutral-200 text-sm">
      <div class="font-bold text-neutral-900 mb-2 uppercase tracking-wide text-xs">Mục lục (Table of Contents)</div>
      <div class="space-y-1">
        ${tocEntries.map(e => `
          <div class="${e.level === 1 ? 'font-semibold text-neutral-900' : 'text-neutral-700 pl-4 text-xs'} flex items-center justify-between py-0.5">
            <span>${e.title}</span>
            <span class="border-b border-dotted border-neutral-300 flex-1 mx-2"></span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }
  parsedHtml = parsedHtml.replace('###TOC_PLACEHOLDER###', tocHtml);

  // Replace MakeTitle
  parsedHtml = parsedHtml.replace('###MAKETITLE_PLACEHOLDER###', makeTitleHtml);

  // Append Footnotes if present
  if (footnotes.length > 0) {
    parsedHtml += `<footer class="mt-12 pt-4 border-t border-neutral-200 text-xs text-neutral-600 space-y-1 font-sans">
      <div class="font-semibold text-neutral-700 text-[11px] mb-2 uppercase tracking-wider">Chú thích cuối trang:</div>
      ${footnotes.map((fn, idx) => `
        <div class="flex items-start gap-1.5">
          <span class="font-mono text-neutral-400 select-none">[${idx + 1}]</span>
          <span>${renderInlineMath(fn, macros, logs)}</span>
        </div>
      `).join('')}
    </footer>`;
  }

  // Calculate Metrics
  const textContent = bodyContent.replace(/\\([a-zA-Z]+|\S)/g, ' ').replace(/\s+/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(Boolean).length;
  const chars = latexCode.length;
  const estimatedPages = Math.max(1, Math.ceil(words / 450));
  const compileTimeMs = Math.round(performance.now() - startTime);

  // Determine overall status
  const hasError = logs.some(l => l.type === 'error');
  const hasWarning = logs.some(l => l.type === 'warning');
  const status = hasError ? 'error' : hasWarning ? 'warning' : 'success';

  if (tikzCount > 0) {
    logs.push({
      id: 'tikz-rendered',
      type: 'info',
      message: `Đã kết xuất ${tikzCount} hình vẽ / đồ thị TikZ & bảng biến thiên SVG thành công.`,
    });
  }

  if (logs.length === 0) {
    logs.push({
      id: 'compile-success',
      type: 'info',
      message: `Biên dịch thành công không phát hiện lỗi cú pháp.`,
      detail: `${equationCount} công thức đã được hiển thị qua KaTeX.`,
    });
  }

  return {
    html: parsedHtml,
    status,
    logs,
    metrics: {
      compileTimeMs,
      equationCount,
      wordCount: words,
      charCount: chars,
      estimatedPages,
      sectionCount,
      activePackagesCount: activeStyleFiles.length,
      tikzCount,
    },
    metadata,
  };
}

/**
 * Helper to render inline KaTeX
 */
function renderKatexInline(math: string, macros: Record<string, string>, logs: CompilationLog[]): string {
  try {
    return katex.renderToString(math.trim(), {
      displayMode: false,
      throwOnError: false,
      macros,
      output: 'htmlAndMathml',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push({
      id: `katex-inline-${Math.random().toString(36).substring(7)}`,
      type: 'warning',
      message: `Lỗi kết xuất công thức toán inline: ${errorMsg}`,
      detail: math,
    });
    return `<code class="text-rose-500 font-mono text-xs bg-rose-50 px-1 py-0.5 rounded">$${escapeHtml(math)}$</code>`;
  }
}

/**
 * Helper to render display KaTeX
 */
function renderKatexDisplay(math: string, macros: Record<string, string>, logs: CompilationLog[]): string {
  try {
    return katex.renderToString(math.trim(), {
      displayMode: true,
      throwOnError: false,
      macros,
      output: 'htmlAndMathml',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logs.push({
      id: `katex-display-${Math.random().toString(36).substring(7)}`,
      type: 'error',
      message: `Lỗi kết xuất công thức toán khối: ${errorMsg}`,
      detail: math,
    });
    return `<div class="p-3 my-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono rounded">
      [Lỗi KaTeX: ${escapeHtml(errorMsg)}]
      <pre class="mt-1">${escapeHtml(math)}</pre>
    </div>`;
  }
}

/**
 * Clean simple text arguments from LaTeX commands
 */
function cleanLatexArg(text: string): string {
  return text
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\emph\{([^}]+)\}/g, '$1')
    .replace(/\\\\/g, ' ')
    .trim();
}

/**
 * Escape HTML characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper to parse LaTeX tabular
 */
function parseTabular(colSpec: string, tableContent: string, macros: Record<string, string>, logs: CompilationLog[]): string {
  // Parse column alignments (e.g., "|l|c|r|")
  const alignments = colSpec.replace(/\|/g, '').split('').map(c => {
    if (c === 'r') return 'text-right';
    if (c === 'c') return 'text-center';
    return 'text-left';
  });

  const rawRows = tableContent
    .split('\\\\')
    .map(r => r.trim())
    .filter(r => r.length > 0 && r !== '\\hline');

  const parsedRows = rawRows.map((row, rIdx) => {
    // Strip \hline, \toprule, \midrule, \bottomrule
    const cleanRow = row
      .replace(/\\hline/g, '')
      .replace(/\\toprule/g, '')
      .replace(/\\midrule/g, '')
      .replace(/\\bottomrule/g, '')
      .trim();

    const cells = cleanRow.split('&').map(cell => cell.trim());
    const isHeader = rIdx === 0;

    return `<tr class="${isHeader ? 'bg-neutral-100 font-semibold' : 'border-b border-neutral-200 hover:bg-neutral-50/50'}">
      ${cells.map((cell, cIdx) => {
        const align = alignments[cIdx] || 'text-left';
        const cellHtml = renderInlineMath(cell, macros, logs);
        if (isHeader) {
          return `<th class="px-3 py-2 border-b-2 border-neutral-300 text-xs text-neutral-900 ${align}">${cellHtml}</th>`;
        }
        return `<td class="px-3 py-2 text-xs text-neutral-800 ${align}">${cellHtml}</td>`;
      }).join('')}
    </tr>`;
  });

  return `<div class="my-4 overflow-x-auto inline-block max-w-full border border-neutral-200 rounded">
    <table class="min-w-full divide-y divide-neutral-200 text-xs">
      <tbody>
        ${parsedRows.join('\n')}
      </tbody>
    </table>
  </div>`;
}

/**
 * Render inline math inside any text fragment
 */
function renderInlineMath(text: string, macros: Record<string, string>, logs: CompilationLog[]): string {
  return text.replace(/(?<!\\)\$((?:\\\$|[^$])+?)\$/g, (_, math) => {
    return renderKatexInline(math, macros, logs);
  });
}
