export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'notes' | 'career' | 'exam';
  code: string;
}

export const LATEX_TEMPLATES: LatexTemplate[] = [
  {
    id: 'vietnamese-exam-ex-test',
    name: 'Đề thi Toán Chuẩn (ex_test.sty & TikZ)',
    description: 'Đề thi trắc nghiệm & tự luận theo chuẩn gói ex_test.sty với các câu hỏi \\begin{ex}, \\choice, \\True, \\loigiai và đồ thị TikZ trong \\begin{center}.',
    category: 'exam',
    code: `\\documentclass[a4paper,12pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{tikz}
\\usepackage{ex_test}

\\title{ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN 12}
\\author{Trường THPT Chuyên - Tổ Toán Tin}
\\date{Năm học 2025 - 2026}

\\begin{document}

\\begin{center}
{\\bf BỘ GIÁO DỤC VÀ ĐÀO TẠO --- TRƯỜNG THPT CHUYÊN} \\\\
{\\bf ĐỀ THI KHẢO SÁT CHẤT LƯỢNG MÔN TOÁN} \\\\
{\\it Thời gian làm bài: 90 phút (không kể thời gian phát đề)}
\\end{center}

\\section*{PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN}
\\textit{Thí sinh trả lời từ câu 1 đến câu 3. Mỗi câu hỏi chỉ chọn một phương án.}

\\begin{ex}[2D1-1]
Nghiệm của phương trình $2^{2x-1} = 8$ là:
\\choice
{$x = 1$}
{\\True $x = 2$}
{$x = 3$}
{$x = \\frac{3}{2}$}
\\loigiai{
Ta có $2^{2x-1} = 8 = 2^3 \\Leftrightarrow 2x - 1 = 3 \\Leftrightarrow 2x = 4 \\Leftrightarrow x = 2$.
}
\\end{ex}

\\begin{ex}[2D1-2]
Cho hàm số $y = f(x)$ có đồ thị như hình vẽ bên dưới:

\\begin{center}
\\begin{tikzpicture}[>=stealth,scale=1.0]
  \\draw[->] (-2.5,0) -- (2.5,0) node[below]{$x$};
  \\draw[->] (0,-1) -- (0,3) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  \\draw[smooth,blue,line width=1.2pt] plot[domain=-1.7:1.7] (\\x,{(\\x)^4 - 2*(\\x)^2 + 1});
  \\draw[dashed] (-1,0) node[below]{$-1$} -- (-1,0);
  \\draw[dashed] (1,0) node[below]{$1$} -- (1,0);
\\end{tikzpicture}
\\end{center}

Hàm số đã cho đồng biến trên khoảng nào dưới đây?
\\choice
{$(-\\infty; -1)$}
{\\True $(-1; 0)$}
{$(0; 1)$}
{$(-\\infty; 0)$}
\\loigiai{
Quan sát đồ thị hàm số, trên khoảng $(-1; 0)$, đồ thị đi lên từ trái sang phải, suy ra hàm số đồng biến trên $(-1; 0)$.
}
\\end{ex}

\\begin{ex}[2H1-1]
Cho khối lăng trụ tam giác $ABC.A'B'C'$ có diện tích đáy $B = 6a^2$ và chiều cao $h = 3a$. Thể tích $V$ của khối lăng trụ đã cho bằng:
\\choice
{$V = 6a^3$}
{$V = 9a^3$}
{\\True $V = 18a^3$}
{$V = 2a^3$}
\\loigiai{
Thể tích của khối lăng trụ được tính theo công thức:
\\[
V = B \\cdot h = 6a^2 \\cdot 3a = 18a^3.
\\]
}
\\end{ex}

\\newpage

\\section*{PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI}
\\textit{Thí sinh trả lời câu hỏi dưới đây. Trong mỗi ý a), b), c), d), chọn đúng hoặc sai.}

\\begin{ex}[2D2-1]
Cho hàm số $f(x) = x^3 - 3x + 2$. Xét tính đúng sai của các khẳng định sau:
\\choiceTF
{\\True Đạo hàm của hàm số là $f'(x) = 3x^2 - 3$.}
{\\True Hàm số có hai điểm cực trị là $x = -1$ và $x = 1$.}
{Hàm số đồng biến trên khoảng $(-1; 1)$.}
{\\True Giá trị cực đại của hàm số bằng $4$.}
\\loigiai{
Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.
\\begin{itemize}
  \\item Khẳng định a đúng: $f'(x) = 3x^2 - 3$.
  \\item Khẳng định b đúng: Hàm số có hai điểm cực trị tại $x = -1$ và $x = 1$.
  \\item Khẳng định c sai: Trên khoảng $(-1; 1)$, $f'(x) < 0$ nên hàm số nghịch biến.
  \\item Khẳng định d đúng: $f(-1) = (-1)^3 - 3(-1) + 2 = 4$.
\\end{itemize}
}
\\end{ex}

\\section*{PHẦN III. BÀI TẬP TỰ LUẬN}

\\begin{bt}[2D3-1]
\\point{2.0}
Tính tích phân $I = \\int_{0}^{1} (2x + 1) e^x \\dx$.
\\loigiai{
Đặt $\\heva{u = 2x + 1 \\\\ \\diff v = e^x \\dx} \\Rightarrow \\heva{\\diff u = 2\\dx \\\\ v = e^x}$.
Theo công thức tích phân từng phần:
\\[
I = \\left. (2x+1)e^x \\right|_0^1 - \\int_0^1 2e^x \\dx = (3e - 1) - 2(e - 1) = e + 1.
\\]
\\dapso{$I = e + 1$}
}
\\end{bt}

\\end{document}`,
  },
  {
    id: 'academic-paper',
    name: 'Bài báo Nghiên cứu Khoa học',
    description: 'Bố cục bài báo chuẩn IEEE/Springer với Abstract, Phương trình giải tích, Bảng số liệu và Tài liệu tham khảo.',
    category: 'academic',
    code: `\\documentclass[a4paper,11pt]{article}
\\usepackage{amsmath,amssymb,graphicx}

\\title{Nghiên cứu Tối ưu hóa Thuật toán Học máy trên Không gian Vector Đa chiều}
\\author{TS. Nguyễn Văn An\\\\Khoa Công nghệ Thông tin, Đại học Bách Khoa\\\\Email: an.nguyen@univ.edu.vn}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Bài viết này nghiên cứu các phương pháp tối ưu hóa Gradient phi tuyến tính trong không gian Euclid đa chiều $\\mathbb{R}^n$. Chúng tôi phân tích tốc độ hội tụ của thuật toán Adam cải tiến và kiểm chứng qua các bộ dữ liệu chuẩn. Kết quả thực nghiệm cho thấy thời gian hội tụ giảm đáng kể $18.4\\%$ so với phương pháp Gradient Descent tiêu chuẩn.
\\end{abstract}

\\tableofcontents

\\section{Giới thiệu tổng quan}
Trong những năm gần đây, bài toán tối ưu hóa lồi và phi lồi đóng vai trò then chốt trong sự phát triển của trí tuệ nhân tạo và xử lý dữ liệu lớn. Cho hàm mục tiêu $f: \\mathbb{R}^n \\to \\mathbb{R}$, bài toán tìm điểm cực tiểu toàn cục được mô tả như sau:

\\begin{equation}
  \\min_{\\mathbf{w} \\in \\mathbb{R}^n} f(\\mathbf{w}) = \\frac{1}{m} \\sum_{i=1}^{m} L(h(\\mathbf{x}_i; \\mathbf{w}), y_i) + \\frac{\\lambda}{2} \\|\\mathbf{w}\\|^2_2
\\end{equation}

Trong đó $\\mathbf{w}$ là vector trọng số, $L$ là hàm mất mát (loss function), và $\\lambda > 0$ là hệ số điều chuẩn $L_2$ nhằm chống hiện tượng overfitting.

\\section{Cơ sở lý thuyết & Thuật toán}

\\subsection{Công thức biến đổi Fourier liên tục}
Để phân tích phổ tần số của dữ liệu chuỗi thời gian, ta áp dụng phép biến đổi Fourier thuận:

\\begin{equation}
  \\mathcal{F}\\{f(t)\\}(\\omega) = \\hat{f}(\\omega) = \\int_{-\\infty}^{+\\infty} f(t) e^{-i \\omega t} \\, dt
\\end{equation}

Tương tự, phép biến đổi ngược được xác định bởi:
\\begin{equation}
  f(t) = \\frac{1}{2\\pi} \\int_{-\\infty}^{+\\infty} \\hat{f}(\\omega) e^{i \\omega t} \\, d\\omega
\\end{equation}

\\subsection{Quy tắc cập nhật tham số}
Quá trình cập nhật tham số bước lặp thứ $t+1$ theo thuật toán Gradient tích lũy động lượng (Momentum):

\\begin{align}
  \\mathbf{v}_{t+1} &= \\beta \\mathbf{v}_t + (1 - \\beta) \\nabla f(\\mathbf{w}_t) \\\\
  \\mathbf{w}_{t+1} &= \\mathbf{w}_t - \\eta \\mathbf{v}_{t+1}
\\end{align}

Với $\\beta \\in [0.9, 0.99]$ là hệ số suy giảm đà quán tính và $\\eta$ là tốc độ học (learning rate).

\\begin{theorem}[Định lý Hội tụ Mạnh]
Nếu hàm mục tiêu $f(\\mathbf{w})$ khả vi cấp 2, lồi chặt với tham số $\\mu > 0$ và có gradient thỏa mãn điều kiện Lipschitz với hằng số $L$, thì khi chọn bước nhảy $\\eta \\le \\frac{2}{\\mu + L}$, thuật toán hội tụ theo cấp số nhân:
\\begin{equation}
  \\|\\mathbf{w}_t - \\mathbf{w}^*\\| \\le \\left(1 - \\frac{2\\mu L}{\\mu + L}\\right)^{t/2} \\|\\mathbf{w}_0 - \\mathbf{w}^*\\|
\\end{equation}
\\end{theorem}

\\begin{proof}
Áp dụng bất đẳng thức Cauchy-Schwarz và tính chất co hẹp của ánh xạ vi phân liên tục trên tập compact lồi trong $\\mathbb{R}^n$.
\\end{proof}

\\section{Kết quả thực nghiệm}
Dưới đây là bảng so sánh hiệu năng giữa thuật toán đề xuất và các phương pháp cơ sở:

\\begin{table}[h]
  \\centering
  \\caption{So sánh độ chính xác và thời gian huấn luyện trên bộ dữ liệu ImageNet}
  \\begin{tabular}{|l|c|r|}
    \\hline
    Phương pháp & Độ chính xác (Top-1) & Thời gian (giờ) \\\\
    \\hline
    SGD cơ bản & $74.2\\%$ & 32.5 \\\\
    RMSprop & $76.8\\%$ & 26.1 \\\\
    Adam chuẩn & $78.1\\%$ & 24.3 \\\\
    \\textbf{Thuật toán đề xuất} & \\textbf{79.5\\%} & \\textbf{19.8} \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Kết luận}
Nghiên cứu đã chứng minh tính ưu việt của thuật toán tối ưu đề xuất cả trên lý thuyết toán học và thực tế thực nghiệm. Hướng phát triển tiếp theo là áp dụng vào các mô hình Transformer quy mô lớn.

\\end{document}`,
  },
  {
    id: 'math-physics-notebook',
    name: 'Sổ tay Toán - Lý Đại cương',
    description: 'Ghi chú học tập Toán cao cấp, Đại số tuyến tính, Phương trình vi phân và Vật lý lượng tử.',
    category: 'notes',
    code: `\\documentclass[a4paper,12pt]{article}
\\usepackage{amsmath,amssymb}

\\title{Sổ tay Ghi chép: Giải tích & Phương trình Vật lý Lý thuyết}
\\author{Lê Hoàng Long\\\\Khoa Vật lý Lý thuyết}
\\date{Năm học 2026}

\\begin{document}
\\maketitle

\\section{Đại số tuyến tính: Không gian Vectơ & Ma trận}
Cho ma trận vuông thực cấp $3 \\times 3$ biểu diễn toán tử quay trong không gian ba chiều:

\\begin{equation}
  \\mathbf{R}_z(\\theta) = \\begin{pmatrix}
    \\cos\\theta & -\\sin\\theta & 0 \\\\
    \\sin\\theta & \\cos\\theta & 0 \\\\
    0 & 0 & 1
  \\end{pmatrix}
\\end{equation}

Phương trình tìm trị riêng $\\lambda$ và vectơ riêng $\\mathbf{v}$:
\\begin{equation}
  \\det(\\mathbf{A} - \\lambda \\mathbf{I}) = 0 \\implies \\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}
\\end{equation}

\\section{Phương trình Vi phân & Giải tích Hàm}
Phương trình truyền nhiệt tổng quát trong môi trường đồng chất:

\\begin{equation}
  \\frac{\\partial u}{\\partial t} - \\alpha \\left( \\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right) = f(x,y,z,t)
\\end{equation}

Hay viết gọn dưới dạng toán tử vi phân Laplace $\\Delta$:
\\begin{equation}
  \\frac{\\partial u}{\\partial t} = \\alpha \\nabla^2 u + f
\\end{equation}

\\section{Hệ phương trình Điện từ trường Maxwell}
Bốn phương trình cơ bản chi phối toàn bộ thế giới điện từ:

\\begin{align}
  \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\quad \\text{(Định luật Gauss cho điện trường)} \\\\
  \\nabla \\cdot \\mathbf{B} &= 0 \\quad \\text{(Định luật Gauss cho từ trường)} \\\\
  \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\quad \\text{(Định luật cảm ứng Faraday)} \\\\
  \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0\\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\quad \\text{(Định luật Ampère-Maxwell)}
\\end{align}

\\section{Cơ học Lượng tử: Phương trình Schrödinger}
Trạng thái lượng tử của hạt chuyển động trong thế năng $V(\\mathbf{r})$:

\\begin{equation}
  i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\Psi(\\mathbf{r}, t)
\\end{equation}

Với chuẩn hóa xác suất:
\\begin{equation}
  \\int_{-\\infty}^{+\\infty} |\\Psi(\\mathbf{r}, t)|^2 \\, d^3\\mathbf{r} = 1
\\end{equation}

\\end{document}`,
  },
  {
    id: 'academic-cv',
    name: 'Sơ yếu Lý lịch / CV Chuẩn LaTeX',
    description: 'Mẫu hồ sơ năng lực học thuật & chuyên môn định dạng thanh lịch, sạch sẽ, chuẩn quốc tế.',
    category: 'career',
    code: `\\documentclass[a4paper,10pt]{article}
\\usepackage{amsmath,amssymb}

\\title{NGUYỄN VĂN AN\\\\Kỹ sư Khoa học Dữ liệu & AI}
\\author{Hà Nội, Việt Nam | Phone: (+84) 987 654 321\\\\Email: nguyen.van.an@email.com | GitHub: github.com/nguyenvanan}
\\date{}

\\begin{document}
\\maketitle

\\section{Mục tiêu Nghề nghiệp}
Kỹ sư Trí tuệ Nhân tạo với 5 năm kinh nghiệm nghiên cứu mô hình học sâu và tối ưu hóa hệ thống máy tính phân tán. Mong muốn áp dụng các phương pháp mô hình hóa toán học tiên tiến để giải quyết các bài toán công nghiệp quy mô lớn.

\\section{Học vấn (Education)}
\\begin{itemize}
  \\item \\textbf{Thạc sĩ Khoa học Máy tính} (2022 - 2024)\\\\
  Đại học Bách Khoa Hà Nội -- GPA: 3.85/4.0\\\\
  Luận văn: \\textit{Tối ưu hóa mô hình mạng nơ-ron tích chập trên thiết bị nhúng}
  \\item \\textbf{Cử nhân Kỹ thuật Phần mềm} (2018 - 2022)\\\\
  Đại học Quốc gia Hà Nội -- Tốt nghiệp Xuất sắc, Học bổng Tài năng
\\end{itemize}

\\section{Kỹ năng Chuyên môn (Technical Skills)}
\\begin{itemize}
  \\item \\textbf{Ngôn ngữ lập trình}: Python, C++, TypeScript, Rust, R, SQL
  \\item \\textbf{Frameworks & Tools}: PyTorch, TensorFlow, Docker, Kubernetes, Git, LaTeX
  \\item \\textbf{Toán học ứng dụng}: Tối ưu hóa lồi, Xác suất thống kê, Đại số tuyến tính, Xử lý tín hiệu
\\end{itemize}

\\section{Kinh nghiệm Làm việc (Work Experience)}
\\begin{itemize}
  \\item \\textbf{Senior AI Research Engineer} -- Trung tâm Nghiên cứu AI Vingroup (2024 - Hiện tại)\\\\
  - Thiết kế kiến trúc nén mô hình LLM giúp giảm $42\\%$ lượng bộ nhớ VRAM với mức suy giảm độ chính xác $< 0.8\\%$.\\\\
  - Tối ưu hóa chuỗi xử lý suy luận (Inference Pipeline) phục vụ hơn 500.000 truy vấn mỗi ngày.
  \\item \\textbf{Data Scientist} -- Công ty Công nghệ FPT (2022 - 2024)\\\\
  - Xây dựng mô hình phát hiện gian lận giao dịch tài chính với AUC-ROC đạt $0.984$.
\\end{itemize}

\\section{Công trình Công bố (Publications)}
\\begin{enumerate}
  \\item An Nguyen, et al. \\textit{"Fast Gradient Invariance on Manifold Learning"}, IEEE Transactions on Neural Networks, 2025.
  \\item An Nguyen, Minh Tran. \\textit{"Pruning Deep ResNet Architectures for Real-Time Robotics"}, ICML Workshop, 2024.
\\end{enumerate}

\\end{document}`,
  },
  {
    id: 'exam-quiz',
    name: 'Đề thi & Hướng dẫn Giải chi tiết',
    description: 'Đề kiểm tra Toán học / Vật lý định dạng chuẩn gồm câu hỏi trắc nghiệm và câu hỏi tự luận.',
    category: 'exam',
    code: `\\documentclass[a4paper,12pt]{article}
\\usepackage{amsmath,amssymb}

\\title{ĐỀ KIỂM TRA ĐỊNH KỲ MÔN TOÁN CAO CẤP\\\\Thời gian làm bài: 90 phút (Không kể phát đề)}
\\author{Bộ môn Giải tích & Đại số -- Học kỳ 1}
\\date{Năm học 2026 - 2027}

\\begin{document}
\\maketitle

\\section{Phần 1: Trắc nghiệm Khách quan (4.0 điểm)}

\\begin{enumerate}
  \\item \\textbf{Câu 1}: Tính giới hạn sau đây: $L = \\lim_{x \\to 0} \\frac{\\sin(3x)}{\\ln(1 + 2x)}$.\\\\
  A. $L = 1$ \\qquad\\qquad B. $L = \\frac{3}{2}$ \\qquad\\qquad C. $L = 0$ \\qquad\\qquad D. $L = \\infty$

  \\item \\textbf{Câu 2}: Cho ma trận $\\mathbf{A} = \\begin{pmatrix} 2 & 1 \\\\ 3 & 4 \\end{pmatrix}$. Định thức $\\det(\\mathbf{A})$ bằng bao nhiêu?\\\\
  A. $5$ \\qquad\\qquad B. $8$ \\qquad\\qquad C. $-5$ \\qquad\\qquad D. $11$

  \\item \\textbf{Câu 3}: Tích phân xác định $I = \\int_{0}^{1} x e^x \\, dx$ có giá trị bằng:\\\\
  A. $1$ \\qquad\\qquad B. $e - 1$ \\qquad\\qquad C. $e$ \\qquad\\qquad D. $2$
\\end{enumerate}

\\section{Phần 2: Tự luận (6.0 điểm)}

\\subsection*{Bài 1 (3.0 điểm): Khảo sát và Vẽ đồ thị}
Cho hàm số $f(x) = x^3 - 3x^2 + 2$.
\\begin{enumerate}
  \\item Tìm các điểm cực đại, cực tiểu và các khoảng đồng biến, nghịch biến của hàm số.
  \\item Tính bán kính cong tại điểm uốn $x = 1$.
\\end{enumerate}

\\begin{proof}[Lời giải chi tiết Bài 1]
Đạo hàm bậc nhất:
\\begin{equation}
  f'(x) = 3x^2 - 6x = 3x(x - 2)
\\end{equation}
Cho $f'(x) = 0 \\iff x_1 = 0$ hoặc $x_2 = 2$.
\\begin{itemize}
  \\item Tại $x = 0$: $f(0) = 2$, đạo hàm $f''(0) = -6 < 0 \\implies$ Cực đại tại $(0, 2)$.
  \\item Tại $x = 2$: $f(2) = -2$, đạo hàm $f''(2) = 6 > 0 \\implies$ Cực tiểu tại $(2, -2)$.
\\end{itemize}
\\end{proof}

\\subsection*{Bài 2 (3.0 điểm): Tích phân mặt}
Tính tích phân mặt loại hai:
\\begin{equation}
  \\iint_{S} (x \\, dy\\,dz + y \\, dz\\,dx + z \\, dx\\,dy)
\\end{equation}
Trong đó $S$ là mặt cầu đơn vị $x^2 + y^2 + z^2 = 1$ hướng ra phía ngoài.

\\begin{proof}[Lời giải chi tiết Bài 2]
Áp dụng định lý Gauss-Ostrogradsky:
\\begin{equation}
  \\iint_{S} \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_{V} (\\nabla \\cdot \\mathbf{F}) \\, dV
\\end{equation}
Ta có $\\nabla \\cdot \\mathbf{F} = \\frac{\\partial x}{\\partial x} + \\frac{\\partial y}{\\partial y} + \\frac{\\partial z}{\\partial z} = 1 + 1 + 1 = 3$.
Do đó:
\\begin{equation}
  I = 3 \\iiint_{V} dV = 3 \\cdot \\frac{4}{3}\\pi R^3 = 4\\pi
\\end{equation}
\\end{proof}

\\end{document}`,
  },
  {
    id: 'cheat-sheet',
    name: 'Bảng Tóm tắt Công thức Trọng tâm',
    description: 'Cheat sheet thu gọn công thức Giải tích, Lượng giác, Đạo hàm và Khai triển chuỗi Taylor.',
    category: 'notes',
    code: `\\documentclass[a4paper,11pt]{article}
\\usepackage{amsmath,amssymb}

\\title{TỔNG HỢP CÔNG THỨC TOÁN HỌC TRỌNG TÂM}
\\author{Tài liệu Tra cứu Cá nhân}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Bảng Đạo hàm Các hàm Cơ bản}
\\begin{align}
  (x^n)' &= n x^{n-1} & (e^x)' &= e^x \\\\
  (\\ln x)' &= \\frac{1}{x} & (a^x)' &= a^x \\ln a \\\\
  (\\sin x)' &= \\cos x & (\\cos x)' &= -\\sin x \\\\
  (\\tan x)' &= \\frac{1}{\\cos^2 x} = 1 + \\tan^2 x & (\\cot x)' &= -\\frac{1}{\\sin^2 x} \\\\
  (\\arcsin x)' &= \\frac{1}{\\sqrt{1 - x^2}} & (\\arctan x)' &= \\frac{1}{1 + x^2}
\\end{align}

\\section{Bảng Nguyên hàm Cơ bản}
\\begin{align}
  \\int x^n \\, dx &= \\frac{x^{n+1}}{n+1} + C \\quad (n \\ne -1) & \\int \\frac{1}{x} \\, dx &= \\ln|x| + C \\\\
  \\int e^x \\, dx &= e^x + C & \\int \\sin x \\, dx &= -\\cos x + C \\\\
  \\int \\cos x \\, dx &= \\sin x + C & \\int \\frac{1}{1+x^2} \\, dx &= \\arctan x + C
\\end{align}

\\section{Khai triển Chuỗi Taylor / Maclaurin}
Khi $x \\to 0$, ta có các khai triển tiệm cận quen thuộc:
\\begin{align}
  e^x &= 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} \\\\
  \\sin x &= x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} \\\\
  \\cos x &= 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!} \\\\
  \\frac{1}{1-x} &= 1 + x + x^2 + x^3 + \\dots = \\sum_{n=0}^{\\infty} x^n \\quad (|x| < 1)
\\end{align}

\\end{document}`,
  },
  {
    id: 'tikz-geometry-graphics',
    name: 'Tuyển tập Hình vẽ Hình học TikZ (Chuẩn sách giáo khoa)',
    description: 'Bao gồm hệ trục Oxy, tam giác có đường cao vuông góc (\\khvuong), hình trụ, hình nón 3D và giao điểm đường cong.',
    category: 'notes',
    code: `\\documentclass[a4paper,11pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{tikz}
\\usetikzlibrary{calc,angles,intersections,patterns}

\\title{TUYỂN TẬP HÌNH VẼ HÌNH HỌC VÀ ĐỒ THỊ BẰNG TIKZ}
\\author{Trung tâm GDNN - GDTX Duy Tiên}
\\date{\\today}

% Định nghĩa macro vẽ ký hiệu vuông góc tại đỉnh #3
\\def\\khvuong[size=#1](#2,#3,#4){
  \\draw ($(#3)!#1!(#2)$) -- ($($(#3)!#1!(#2)$)+($(#3)!#1!(#4)$)-(#3)$) -- ($(#3)!#1!(#4)$);
}

\\begin{document}
\\maketitle

\\section{Hình học phẳng: Tam giác và Chân đường vuông góc}
Cho tam giác $ABC$ với $A(1,3)$, $B(0,0)$ và $C(4,0)$. Kẻ đường cao $AH$ vuông góc với $BC$ tại điểm $H$:

\\begin{center}
\\begin{tikzpicture}[>=stealth,scale=1.2]
  \\coordinate[label=above:$A$] (A) at (1,3);
  \\coordinate[label=left:$B$] (B) at (0,0);
  \\coordinate[label=right:$C$] (C) at (4,0);
  \\coordinate[label=below:$H$] (H) at ($(B)!(A)!(C)$);
  
  \\draw[thick] (A) -- (B) -- (C) -- cycle;
  \\draw[dashed,thick] (A) -- (H);
  \\khvuong[size=5pt](A,H,C)
\\end{tikzpicture}
\\end{center}

\\section{Hình học Không gian: Hình trụ và Hình nón}
Biểu diễn hình trụ tròn xoay với đáy dưới gồm cung elip nét đứt (mặt khuất) và nửa nét liền:

\\begin{center}
\\begin{tikzpicture}[>=stealth,scale=1.1]
  % Đáy dưới hình trụ
  \\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.7];
  \\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.7];
  % Các đường sinh và trục
  \\draw (-2,0) -- (-2,3);
  \\draw (2,0) -- (2,3);
  \\draw[dashed] (0,0) -- (0,3);
  \\draw[dashed] (0,0) -- (2,0);
  % Đáy trên hình trụ
  \\draw (0,3) ellipse ({2} and {0.7});
  \\fill (0,0) circle (1.5pt) node[below]{$O'$};
  \\fill (0,3) circle (1.5pt) node[above]{$O$};
\\end{tikzpicture}
\\end{center}

\\section{Đồ thị hàm số bậc 4 & Điểm cực trị}
Đồ thị hàm số trùng phương $y = x^4 - 2x^2 + 1$ vẽ với tham số \\texttt{smooth}:

\\begin{center}
\\begin{tikzpicture}[>=stealth,scale=1.2]
  \\draw[->] (-2.5,0) -- (2.5,0) node[below]{$x$};
  \\draw[->] (0,-1) -- (0,3) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  \\draw[smooth,blue,line width=1.2pt] plot[domain=-1.65:1.65] (\\x,{(\\x)^4 - 2*(\\x)^2 + 1});
  \\node[below] at (0,-1.2) {$y=x^4 - 2x^2 + 1$};
\\end{tikzpicture}
\\end{center}

\\end{document}`,
  },
  {
    id: 'tkz-tab-variation-table',
    name: 'Bảng Biến thiên & Tô Miền Tích phân (tkz-tab)',
    description: 'Mẫu bảng biến thiên hoàn chỉnh bằng tkz-tab kết hợp đồ thị tô miền tích phân giới hạn bởi hai đường cong.',
    category: 'exam',
    code: `\\documentclass[a4paper,12pt]{article}
\\usepackage{amsmath,amssymb}
\\usepackage{tikz}
\\usetikzlibrary{calc,intersections,patterns}
\\usepackage{tkz-tab}

\\title{BÀI TOÁN KHẢO SÁT HÀM SỐ VÀ TÍNH DIỆN TÍCH HÌNH PHẲNG}
\\author{Bộ môn Toán - Luyện thi Đại học}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Bảng biến thiên hàm số (tkz-tab)}
Khảo sát sự biến thiên của hàm số có điểm gián đoạn $x = 1$:

\\begin{center}
\\begin{tikzpicture}
  \\tkzTabInit[nocadre,lgt=1.5,espcl=2.2,deltacl=.5]
    {$x$/0.8, $f'(x)$/0.8, $f(x)$/2}
    {$-\\infty$, $-1$, $1$, $2$, $+\\infty$}
  \\tkzTabLine{,-,z,+,d,-,z,+,}
  \\tkzTabVar{+/ $+\\infty$, -/ $-4$, +D+/ $+\\infty$, -/ $-4$, +/ $+\\infty$}
\\end{tikzpicture}
\\end{center}

\\section{Tính diện tích hình phẳng giới hạn bởi đồ thị}
Tính diện tích miền hình phẳng $(H)$ giới hạn bởi parabol $y = x^2$ và đường thẳng $y = x + 2$:

\\begin{center}
\\begin{tikzpicture}[>=stealth,scale=1.1]
  \\draw[->] (-2.5,0) -- (3,0) node[below]{$x$};
  \\draw[->] (0,-1) -- (0,5) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  
  % Tô màu diện tích tích phân giữa 2 đường cong từ -1 đến 2
  \\fill[blue!25,smooth] plot[domain=-1:2] (\\x,{(\\x)^2}) -- plot[domain=2:-1] (\\x,{\\x+2}) -- cycle;
  
  % Vẽ 2 đồ thị
  \\draw[smooth,red,line width=1pt] plot[domain=-1.5:2.3] (\\x,{(\\x)^2});
  \\draw[smooth,teal,line width=1pt] plot[domain=-1.5:2.5] (\\x,{\\x+2});
  
  % Đường dóng tọa độ giao điểm
  \\draw[dashed] (-1,0) node[below]{\\small $-1$} -- (-1,1) -- (0,1) node[right]{\\small $1$};
  \\draw[dashed] (2,0) node[below]{\\small $2$} -- (2,4) -- (0,4) node[left]{\\small $4$};
\\end{tikzpicture}
\\end{center}

\\section{Công thức tính diện tích hình phẳng}
\\begin{equation}
  S = \\int_{-1}^{2} \\left| (x+2) - x^2 \\right| \\, dx = \\left. \\left( \\frac{x^2}{2} + 2x - \\frac{x^3}{3} \\right) \\right|_{-1}^{2} = \\frac{9}{2}
\\end{equation}

\\end{document}`,
  },
];
