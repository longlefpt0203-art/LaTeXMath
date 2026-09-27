export interface LatexSymbolCategory {
  name: string;
  items: {
    label: string;
    latex: string;
    snippet: string;
    tooltip?: string;
  }[];
}

export const LATEX_SYMBOL_CATEGORIES: LatexSymbolCategory[] = [
  {
    name: 'Ký tự Hy Lạp (Greek)',
    items: [
      { label: 'α', latex: '\\alpha', snippet: '\\alpha', tooltip: 'alpha' },
      { label: 'β', latex: '\\beta', snippet: '\\beta', tooltip: 'beta' },
      { label: 'γ', latex: '\\gamma', snippet: '\\gamma', tooltip: 'gamma' },
      { label: 'δ', latex: '\\delta', snippet: '\\delta', tooltip: 'delta' },
      { label: 'ε', latex: '\\varepsilon', snippet: '\\varepsilon', tooltip: 'epsilon' },
      { label: 'θ', latex: '\\theta', snippet: '\\theta', tooltip: 'theta' },
      { label: 'λ', latex: '\\lambda', snippet: '\\lambda', tooltip: 'lambda' },
      { label: 'μ', latex: '\\mu', snippet: '\\mu', tooltip: 'mu' },
      { label: 'π', latex: '\\pi', snippet: '\\pi', tooltip: 'pi' },
      { label: 'σ', latex: '\\sigma', snippet: '\\sigma', tooltip: 'sigma' },
      { label: 'τ', latex: '\\tau', snippet: '\\tau', tooltip: 'tau' },
      { label: 'φ', latex: '\\phi', snippet: '\\phi', tooltip: 'phi' },
      { label: 'ω', latex: '\\omega', snippet: '\\omega', tooltip: 'omega' },
      { label: 'Γ', latex: '\\Gamma', snippet: '\\Gamma', tooltip: 'Gamma' },
      { label: 'Δ', latex: '\\Delta', snippet: '\\Delta', tooltip: 'Delta' },
      { label: 'Θ', latex: '\\Theta', snippet: '\\Theta', tooltip: 'Theta' },
      { label: 'Λ', latex: '\\Lambda', snippet: '\\Lambda', tooltip: 'Lambda' },
      { label: 'Σ', latex: '\\Sigma', snippet: '\\Sigma', tooltip: 'Sigma' },
      { label: 'Ω', latex: '\\Omega', snippet: '\\Omega', tooltip: 'Omega' },
    ],
  },
  {
    name: 'Giải tích & Toán tử (Calculus)',
    items: [
      { label: 'a/b', latex: '\\frac{a}{b}', snippet: '\\frac{a}{b}', tooltip: 'Phân số (Fraction)' },
      { label: 'x²', latex: 'x^{2}', snippet: '^{2}', tooltip: 'Số mũ (Superscript)' },
      { label: 'xᵢ', latex: 'x_{i}', snippet: '_{i}', tooltip: 'Chỉ số dưới (Subscript)' },
      { label: '√x', latex: '\\sqrt{x}', snippet: '\\sqrt{x}', tooltip: 'Căn bậc hai' },
      { label: 'ⁿ√x', latex: '\\sqrt[n]{x}', snippet: '\\sqrt[n]{x}', tooltip: 'Căn bậc n' },
      { label: '∫', latex: '\\int', snippet: '\\int_{a}^{b} f(x)\\,dx', tooltip: 'Tích phân xác định' },
      { label: '∬', latex: '\\iint', snippet: '\\iint_{D} f(x,y)\\,dx\\,dy', tooltip: 'Tích phân kép' },
      { label: '∮', latex: '\\oint', snippet: '\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r}', tooltip: 'Tích phân đường cong' },
      { label: '∑', latex: '\\sum', snippet: '\\sum_{i=1}^{n} ', tooltip: 'Tổng sigma' },
      { label: '∏', latex: '\\prod', snippet: '\\prod_{i=1}^{n} ', tooltip: 'Tích pi' },
      { label: 'lim', latex: '\\lim', snippet: '\\lim_{x \\to \\infty} ', tooltip: 'Giới hạn limit' },
      { label: '∂', latex: '\\partial', snippet: '\\frac{\\partial f}{\\partial x}', tooltip: 'Đạo hàm riêng' },
      { label: '∇', latex: '\\nabla', snippet: '\\nabla ', tooltip: 'Toán tử Nabla / Gradient' },
      { label: 'df/dx', latex: '\\frac{df}{dx}', snippet: '\\frac{df}{dx}', tooltip: 'Đạo hàm thường' },
    ],
  },
  {
    name: 'Quan hệ & Logic (Relations)',
    items: [
      { label: '≤', latex: '\\le', snippet: '\\le ', tooltip: 'Nhỏ hơn hoặc bằng' },
      { label: '≥', latex: '\\ge', snippet: '\\ge ', tooltip: 'Lớn hơn hoặc bằng' },
      { label: '≠', latex: '\\neq', snippet: '\\neq ', tooltip: 'Khác nhau' },
      { label: '≈', latex: '\\approx', snippet: '\\approx ', tooltip: 'Xấp xỉ' },
      { label: '≡', latex: '\\equiv', snippet: '\\equiv ', tooltip: 'Đồng dư / Tương đương' },
      { label: '∈', latex: '\\in', snippet: '\\in ', tooltip: 'Thuộc tập hợp' },
      { label: '∉', latex: '\\notin', snippet: '\\notin ', tooltip: 'Không thuộc' },
      { label: '⊂', latex: '\\subset', snippet: '\\subset ', tooltip: 'Tập con' },
      { label: '⊆', latex: '\\subseteq', snippet: '\\subseteq ', tooltip: 'Tập con hoặc bằng' },
      { label: '∪', latex: '\\cup', snippet: '\\cup ', tooltip: 'Hợp' },
      { label: '∩', latex: '\\cap', snippet: '\\cap ', tooltip: 'Giao' },
      { label: '∀', latex: '\\forall', snippet: '\\forall ', tooltip: 'Với mọi' },
      { label: '∃', latex: '\\exists', snippet: '\\exists ', tooltip: 'Tồn tại' },
      { label: '⇒', latex: '\\implies', snippet: '\\implies ', tooltip: 'Suy ra' },
      { label: '⇔', latex: '\\iff', snippet: '\\iff ', tooltip: 'Khi và chỉ khi' },
      { label: '→', latex: '\\to', snippet: '\\to ', tooltip: 'Mũi tên phải' },
      { label: '∞', latex: '\\infty', snippet: '\\infty', tooltip: 'Vô cực' },
      { label: '±', latex: '\\pm', snippet: '\\pm ', tooltip: 'Cộng trừ' },
      { label: '×', latex: '\\times', snippet: '\\times ', tooltip: 'Dấu nhân' },
    ],
  },
  {
    name: 'Ma trận & Véc-tơ (Linear Algebra)',
    items: [
      {
        label: '[...] 2x2',
        latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}',
        snippet: '\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}',
        tooltip: 'Ma trận ngoặc vuông 2x2',
      },
      {
        label: '(...) 2x2',
        latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        snippet: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}',
        tooltip: 'Ma trận ngoặc tròn 2x2',
      },
      {
        label: '|...| det',
        latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
        snippet: '\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}',
        tooltip: 'Định thức ma trận (Determinant)',
      },
      { label: 'v⃗', latex: '\\vec{v}', snippet: '\\vec{v}', tooltip: 'Véc-tơ' },
      { label: 'X (đậm)', latex: '\\mathbf{X}', snippet: '\\mathbf{X}', tooltip: 'Ký hiệu ma trận đậm' },
      { label: 'ℝ', latex: '\\mathbb{R}', snippet: '\\mathbb{R}', tooltip: 'Tập số thực' },
      { label: 'ℂ', latex: '\\mathbb{C}', snippet: '\\mathbb{C}', tooltip: 'Tập số phức' },
      { label: 'ℕ', latex: '\\mathbb{N}', snippet: '\\mathbb{N}', tooltip: 'Tập số tự nhiên' },
      { label: 'ℤ', latex: '\\mathbb{Z}', snippet: '\\mathbb{Z}', tooltip: 'Tập số nguyên' },
    ],
  },
  {
    name: 'Khối môi trường (Environments)',
    items: [
      {
        label: 'Khối Equation',
        latex: '\\begin{equation}',
        snippet: '\\begin{equation}\n  E = mc^2\n\\end{equation}\n',
        tooltip: 'Phương trình đánh số tự động',
      },
      {
        label: 'Hệ align',
        latex: '\\begin{align}',
        snippet: '\\begin{align}\n  2x + 3y &= 7 \\\\\n  x - y &= 1\n\\end{align}\n',
        tooltip: 'Hệ phương trình căn lề dấu =',
      },
      {
        label: 'Danh sách tròn (itemize)',
        latex: '\\begin{itemize}',
        snippet: '\\begin{itemize}\n  \\item Điểm thứ nhất\n  \\item Điểm thứ hai\n\\end{itemize}\n',
        tooltip: 'Danh sách gạch đầu dòng',
      },
      {
        label: 'Danh sách số (enumerate)',
        latex: '\\begin{enumerate}',
        snippet: '\\begin{enumerate}\n  \\item Bước 1\n  \\item Bước 2\n\\end{enumerate}\n',
        tooltip: 'Danh sách thứ tự đánh số',
      },
      {
        label: 'Bảng (tabular)',
        latex: '\\begin{tabular}',
        snippet: '\\begin{table}[h]\n  \\centering\n  \\caption{Bảng thông số mẫu}\n  \\begin{tabular}{|l|c|r|}\n    \\hline\n    Tham số & Đơn vị & Giá trị \\\\\n    \\hline\n    Tốc độ & m/s & 299792458 \\\\\n    Khối lượng & kg & 1.0 \\\\\n    \\hline\n  \\end{tabular}\n\\end{table}\n',
        tooltip: 'Bảng dữ liệu chuẩn LaTeX',
      },
      {
        label: 'Định lý (theorem)',
        latex: '\\begin{theorem}',
        snippet: '\\begin{theorem}[Tên định lý]\n  Nội dung định lý toán học tại đây.\n\\end{theorem}\n',
        tooltip: 'Khối định lý học thuật',
      },
      {
        label: 'Chứng minh (proof)',
        latex: '\\begin{proof}',
        snippet: '\\begin{proof}\n  Các bước chứng minh chi tiết tại đây.\n\\end{proof}\n',
        tooltip: 'Khối chứng minh kết thúc bằng Q.E.D',
      },
    ],
  },
  {
    name: 'Định dạng văn bản (Formatting)',
    items: [
      { label: 'In đậm', latex: '\\textbf{}', snippet: '\\textbf{nội dung}', tooltip: 'Chữ in đậm' },
      { label: 'In nghiêng', latex: '\\textit{}', snippet: '\\textit{nội dung}', tooltip: 'Chữ in nghiêng' },
      { label: 'Gạch chân', latex: '\\underline{}', snippet: '\\underline{nội dung}', tooltip: 'Gạch chân' },
      { label: 'Mục lớn (Section)', latex: '\\section{}', snippet: '\\section{Tiêu đề phần mới}\n', tooltip: 'Phần tiêu đề cấp 1' },
      { label: 'Mục con (Sub)', latex: '\\subsection{}', snippet: '\\subsection{Tiêu đề mục con}\n', tooltip: 'Phần tiêu đề cấp 2' },
      { label: 'Trích dẫn chú thích', latex: '\\footnote{}', snippet: '\\footnote{Nội dung giải thích cuối trang}', tooltip: 'Chú thích dưới trang' },
      { label: 'Tài liệu tham khảo', latex: '\\cite{}', snippet: '\\cite{reference_key}', tooltip: 'Ký hiệu trích dẫn [1]' },
      { label: 'Đoạn mã (Code)', latex: '\\begin{verbatim}', snippet: '\\begin{verbatim}\n// Mã nguồn tại đây\nconst x = 42;\n\\end{verbatim}\n', tooltip: 'Hiển thị mã nguồn định dạng monospace' },
      { label: 'Qua trang mới', latex: '\\newpage', snippet: '\\newpage\n', tooltip: 'Ngắt trang A4' },
    ],
  },
];
