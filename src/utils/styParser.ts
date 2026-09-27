export interface ParsedMacro {
  name: string; // e.g. "\norm"
  argsCount: number;
  definition: string;
  snippet: string;
  source: string;
}

export interface StyleFile {
  id: string;
  name: string; // e.g. "advanced_math.sty"
  content: string;
  enabled: boolean;
  updatedAt: number;
  macros: ParsedMacro[];
}

/**
 * Parses LaTeX .sty (style/package) file contents to extract macros and definitions
 */
export function parseStyContent(name: string, content: string): { macros: Record<string, string>; macroList: ParsedMacro[] } {
  const macros: Record<string, string> = {};
  const macroList: ParsedMacro[] = [];

  // Remove full comment lines (preserve internal text)
  const lines = content.split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%')) return;

    // 1. \newcommand{\name}[args]{definition} or \renewcommand or \providecommand
    // Matches \newcommand{\mycmd}[2]{#1 + #2} or \newcommand{\mycmd}{x}
    const newCmdRegex = /\\(?:re)?(?:new|provide)command\*?\{?\\([a-zA-Z0-9@]+)\}?(?:\[(\d+)\])?\{([\s\S]*?)\}(?=\s*(?:\\(?:re)?(?:new|provide)command|\\DeclareMathOperator|\\def|%|$))/g;
    let match: RegExpExecArray | null;

    while ((match = newCmdRegex.exec(line)) !== null) {
      const cmdName = `\\${match[1]}`;
      const argsCount = match[2] ? parseInt(match[2], 10) : 0;
      const def = match[3].trim();

      macros[cmdName] = def;
      macroList.push({
        name: cmdName,
        argsCount,
        definition: def,
        snippet: generateSnippet(cmdName, argsCount),
        source: name,
      });
    }

    // 2. \DeclareMathOperator{\argmin}{arg\,min} or \DeclareMathOperator*{\argmax}{arg\,max}
    const mathOpRegex = /\\DeclareMathOperator(\*?)\{?\\([a-zA-Z0-9]+)\}?\{([^}]+)\}/g;
    while ((match = mathOpRegex.exec(line)) !== null) {
      const isStar = match[1] === '*';
      const cmdName = `\\${match[2]}`;
      const opText = match[3].trim();
      const def = isStar ? `\\operatorname*{${opText}}` : `\\operatorname{${opText}}`;

      macros[cmdName] = def;
      macroList.push({
        name: cmdName,
        argsCount: 0,
        definition: def,
        snippet: cmdName + ' ',
        source: name,
      });
    }

    // 3. Simple \def\cmd{definition} or \def\cmd#1{definition}
    const defRegex = /\\def\\([a-zA-Z0-9]+)(?:#1(?:#2)?)?\{([^}]+)\}/g;
    while ((match = defRegex.exec(line)) !== null) {
      const cmdName = `\\${match[1]}`;
      if (!macros[cmdName]) {
        const def = match[2].trim();
        macros[cmdName] = def;
        macroList.push({
          name: cmdName,
          argsCount: line.includes('#2') ? 2 : line.includes('#1') ? 1 : 0,
          definition: def,
          snippet: cmdName + ' ',
          source: name,
        });
      }
    }
  });

  return { macros, macroList };
}

/**
 * Generate friendly placeholder snippet based on argument count
 */
function generateSnippet(cmdName: string, argsCount: number): string {
  if (argsCount === 0) return `${cmdName} `;
  if (argsCount === 1) return `${cmdName}{x}`;
  if (argsCount === 2) return `${cmdName}{a}{b}`;
  if (argsCount === 3) return `${cmdName}{a}{b}{c}`;
  const args = Array.from({ length: argsCount }, (_, i) => `{x_${i + 1}}`).join('');
  return `${cmdName}${args}`;
}

/**
 * Pre-packaged sample .sty library for instant mathematical and scientific productivity
 */
export const SAMPLE_STY_PACKAGES: StyleFile[] = [
  {
    id: 'sty-ex-test',
    name: 'ex_test.sty',
    enabled: true,
    updatedAt: Date.now(),
    content: `% Gói thư viện soạn thảo đề thi Toán chuẩn Việt Nam ex_test.sty
\\ProvidesPackage{ex_test}

% 1. Định dạng đáp án đúng / sai trong trắc nghiệm
\\newcommand{\\True}{\\mathbf{\\checkmark}}
\\newcommand{\\False}{\\mathbf{\\times}}

% 2. Hệ phương trình & Tuyển phương trình
\\newcommand{\\heva}[1]{\\left\\{\\begin{aligned}#1\\end{aligned}\\right\\}}
\\newcommand{\\hoac}[1]{\\left[\\begin{aligned}#1\\end{aligned}\\right\\}}

% 3. Ký hiệu vector và hình học
\\newcommand{\\vect}[1]{\\vec{#1}}
\\newcommand{\\degree}{^\\circ}
\\newcommand{\\parallel}{\\mathrel{/\\!/}}
\\newcommand{\\perp}{\\bot}

% 4. Vi phân tích phân & giải tích
\\newcommand{\\dx}{\\,\\mathrm{d}x}
\\newcommand{\\dt}{\\,\\mathrm{d}t}
\\newcommand{\\du}{\\,\\mathrm{d}u}

% 5. Lệnh điểm số & tiêu đề
\\newcommand{\\point}[1]{\\textbf{(#1 điểm)}}
\\newcommand{\\dapso}[1]{\\textbf{Đáp số: }#1}
`,
    macros: [
      { name: '\\True', argsCount: 0, definition: '\\mathbf{\\checkmark}', snippet: '\\True ', source: 'ex_test.sty' },
      { name: '\\False', argsCount: 0, definition: '\\mathbf{\\times}', snippet: '\\False ', source: 'ex_test.sty' },
      { name: '\\heva', argsCount: 1, definition: '\\left\\{\\begin{aligned}#1\\end{aligned}\\right\\}', snippet: '\\heva{x + y = 1 \\\\ x - y = 0}', source: 'ex_test.sty' },
      { name: '\\hoac', argsCount: 1, definition: '\\left[\\begin{aligned}#1\\end{aligned}\\right\\}', snippet: '\\hoac{x = 1 \\\\ x = -1}', source: 'ex_test.sty' },
      { name: '\\vect', argsCount: 1, definition: '\\vec{#1}', snippet: '\\vect{AB}', source: 'ex_test.sty' },
      { name: '\\degree', argsCount: 0, definition: '^\\circ', snippet: '^\\degree', source: 'ex_test.sty' },
      { name: '\\dx', argsCount: 0, definition: '\\,\\mathrm{d}x', snippet: '\\dx', source: 'ex_test.sty' },
      { name: '\\point', argsCount: 1, definition: '\\textbf{(#1 điểm)}', snippet: '\\point{1.0}', source: 'ex_test.sty' },
      { name: '\\dapso', argsCount: 1, definition: '\\textbf{Đáp số: }#1', snippet: '\\dapso{S = 4}', source: 'ex_test.sty' },
    ],
  },
  {
    id: 'sty-standard-math',
    name: 'math_shortcuts.sty',
    enabled: true,
    updatedAt: Date.now(),
    content: `% Gói thư viện toán học nâng cao math_shortcuts.sty
\\ProvidesPackage{math_shortcuts}

% 1. Ký hiệu tập hợp chuẩn
\\newcommand{\\RR}{\\mathbb{R}}
\\newcommand{\\NN}{\\mathbb{N}}
\\newcommand{\\ZZ}{\\mathbb{Z}}
\\newcommand{\\CC}{\\mathbb{C}}
\\newcommand{\\QQ}{\\mathbb{Q}}

% 2. Toán tử xác suất và thống kê
\\newcommand{\\E}{\\mathbb{E}}
\\newcommand{\\Var}{\\mathrm{Var}}
\\newcommand{\\Cov}{\\mathrm{Cov}}

% 3. Chuẩn vector và tích vô hướng
\\newcommand{\\norm}[1]{\\left\\| #1 \\right\\|}
\\newcommand{\\inner}[2]{\\left\\langle #1, #2 \\right\\rangle}
\\newcommand{\\abs}[1]{\\left| #1 \\right|}

% 4. Toán tử tối ưu hóa
\\DeclareMathOperator*{\\argmin}{arg\\,min}
\\DeclareMathOperator*{\\argmax}{arg\\,max}
\\DeclareMathOperator{\\diag}{diag}
\\DeclareMathOperator{\\trace}{tr}

% 5. Vi phân và ký hiệu vật lý
\\newcommand{\\diff}{\\mathrm{d}}
\\newcommand{\\pd}[2]{\\frac{\\partial #1}{\\partial #2}}
`,
    macros: [
      { name: '\\RR', argsCount: 0, definition: '\\mathbb{R}', snippet: '\\RR ', source: 'math_shortcuts.sty' },
      { name: '\\norm', argsCount: 1, definition: '\\left\\| #1 \\right\\|', snippet: '\\norm{x}', source: 'math_shortcuts.sty' },
      { name: '\\inner', argsCount: 2, definition: '\\left\\langle #1, #2 \\right\\rangle', snippet: '\\inner{u}{v}', source: 'math_shortcuts.sty' },
      { name: '\\argmin', argsCount: 0, definition: '\\operatorname*{arg\\,min}', snippet: '\\argmin_{x} ', source: 'math_shortcuts.sty' },
      { name: '\\argmax', argsCount: 0, definition: '\\operatorname*{arg\\,max}', snippet: '\\argmax_{x} ', source: 'math_shortcuts.sty' },
      { name: '\\E', argsCount: 0, definition: '\\mathbb{E}', snippet: '\\E[X]', source: 'math_shortcuts.sty' },
      { name: '\\Var', argsCount: 0, definition: '\\mathrm{Var}', snippet: '\\Var(X)', source: 'math_shortcuts.sty' },
      { name: '\\diff', argsCount: 0, definition: '\\mathrm{d}', snippet: '\\diff ', source: 'math_shortcuts.sty' },
      { name: '\\pd', argsCount: 2, definition: '\\frac{\\partial #1}{\\partial #2}', snippet: '\\pd{f}{x}', source: 'math_shortcuts.sty' },
    ],
  },
];
