export interface TikzSnippet {
  id: string;
  title: string;
  description: string;
  category: string;
  pageRef?: string;
  code: string;
}

export interface TikzCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  snippets: TikzSnippet[];
}

export const TIKZ_LIBRARY_CATEGORIES: TikzCategory[] = [
  {
    id: 'co-ban',
    name: '1. Khai báo & Môi trường TikZ',
    iconName: 'Shapes',
    description: 'Cấu trúc tài liệu TikZ cơ bản, nạp thư viện calc, angles, intersections',
    snippets: [
      {
        id: 'tikz-env-basic',
        title: 'Môi trường TikZ cơ bản',
        description: 'Khung môi trường \\begin{tikzpicture} chuẩn với định dạng mũi tên stealth',
        pageRef: 'Trang 3',
        category: 'co-ban',
        code: `\\begin{tikzpicture}[>=stealth,scale=1,line width=0.6pt]
  % Các lệnh vẽ tại đây
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-standalone-preamble',
        title: 'Khai báo gói đầy đủ (Preamble)',
        description: 'Khai báo các thư viện TikZ quan trọng: calc, angles, intersections, patterns',
        pageRef: 'Trang 3, 13, 50',
        category: 'co-ban',
        code: `\\usepackage{tikz}
\\usetikzlibrary{calc,angles,intersections,patterns}
\\usepackage{tkz-tab}
`,
      },
      {
        id: 'tikz-khvuong-def',
        title: 'Hàm vẽ ký hiệu góc vuông (\\khvuong)',
        description: 'Macro vẽ ký hiệu góc vuông tùy biến kích thước từ 3 đỉnh tam giác',
        pageRef: 'Trang 18, 19',
        category: 'co-ban',
        code: `% Định nghĩa lệnh vẽ ký hiệu vuông góc tại đỉnh #3 (ví dụ góc ABC vuông tại B: \\khvuong[size=5pt](A,B,C))
\\def\\khvuong[size=#1](#2,#3,#4){
  \\draw ($(#3)!#1!(#2)$) -- ($($(#3)!#1!(#2)$)+($(#3)!#1!(#4)$)-(#3)$) -- ($(#3)!#1!(#4)$);
}
`,
      },
    ],
  },
  {
    id: 'he-toa-do',
    name: '2. Hệ trục tọa độ & Lưới Oxy',
    iconName: 'Grid',
    description: 'Lưới tọa độ grid, trục tọa độ Oxy, đánh dấu gốc O và tên trục',
    snippets: [
      {
        id: 'tikz-grid-oxy',
        title: 'Lưới tọa độ (Grid)',
        description: 'Vẽ lưới tọa độ nét mảnh hỗ trợ định vị các điểm hình học',
        pageRef: 'Trang 4, 5',
        category: 'he-toa-do',
        code: `\\draw[step=1,gray,very thin] (-3,-3) grid (4,3);\n`,
      },
      {
        id: 'tikz-axes-oxy',
        title: 'Hệ trục tọa độ vuông góc Oxy',
        description: 'Trục Ox, Oy với mũi tên stealth, nhãn x, y và gốc tọa độ O',
        pageRef: 'Trang 4, 37',
        category: 'he-toa-do',
        code: `\\draw[->] (-3,0) -- (4,0) node[below]{$x$};
\\draw[->] (0,-3) -- (0,4) node[left]{$y$};
\\fill (0,0) circle (1.5pt) node[below left]{$O$};
`,
      },
      {
        id: 'tikz-axes-with-ticks',
        title: 'Hệ trục Oxy với vạch chia số (Ticks)',
        description: 'Trục tọa độ Oxy kèm các số chia trên trục bằng vòng lặp foreach',
        pageRef: 'Trang 61, 62',
        category: 'he-toa-do',
        code: `\\draw[->,thick] (-3.5,0) -- (4.5,0) node[below]{$x$};
\\draw[->,thick] (0,-2.5) -- (0,4.5) node[left]{$y$};
\\node[below left] at (0,0) {$O$};
\\foreach \\x in {-3,-2,-1,1,2,3,4}
  \\draw (\\x,0.08) -- (\\x,-0.08) node[below,font=\\footnotesize] {$\\x$};
\\foreach \\y in {-2,-1,1,2,3,4}
  \\draw (0.08,\\y) -- (-0.08,\\y) node[left,font=\\footnotesize] {$\\y$};
`,
      },
    ],
  },
  {
    id: 'diem-doan-thang',
    name: '3. Điểm, Đoạn thẳng & Tính toán tọa độ',
    iconName: 'Compass',
    description: 'Vẽ điểm, vector, đoạn thẳng, trung điểm, chân đường cao, phép quay',
    snippets: [
      {
        id: 'tikz-draw-point',
        title: 'Vẽ điểm & Gán nhãn (Node)',
        description: 'Vẽ điểm tròn bán kính 1pt/2pt và nhãn A, B, C',
        pageRef: 'Trang 5, 10',
        category: 'diem-doan-thang',
        code: `\\coordinate[label=above left:$A$] (A) at (2,1);
\\fill (A) circle (1.5pt);
`,
      },
      {
        id: 'tikz-polar-point',
        title: 'Điểm theo tọa độ cực (α : r)',
        description: 'Xác định điểm theo góc quay độ và bán kính khoảng cách',
        pageRef: 'Trang 5',
        category: 'diem-doan-thang',
        code: `\\coordinate[label=right:$B$] (B) at (60:2);
\\fill (B) circle (1.5pt);
\\draw[dashed] (0,0) -- (B);
`,
      },
      {
        id: 'tikz-midpoint-ratio',
        title: 'Trung điểm / Điểm tỉ lệ ($(A)!k!(B)$)',
        description: 'Khai báo trung điểm M của AB hoặc điểm tỉ lệ vị tự k',
        pageRef: 'Trang 11, 12',
        category: 'diem-doan-thang',
        code: `% Trung điểm M của đoạn thẳng AB:
\\coordinate[label=above:$M$] (M) at ($(A)!0.5!(B)$);
\\fill (M) circle (1.5pt);
`,
      },
      {
        id: 'tikz-perpendicular-foot',
        title: 'Chân đường vuông góc ($(B)!(A)!(C)$)',
        description: 'Xác định chân đường cao H hạ từ A xuống cạnh BC',
        pageRef: 'Trang 20, 21',
        category: 'diem-doan-thang',
        code: `% Chân đường cao H kẻ từ A tới đoạn BC:
\\coordinate[label=below:$H$] (H) at ($(B)!(A)!(C)$);
\\draw[dashed] (A) -- (H);
\\khvuong[size=5pt](A,H,C)
`,
      },
      {
        id: 'tikz-rotation-point',
        title: 'Phép quay tâm A góc θ ($(A)!1!θ:(B)$)',
        description: 'Lấy điểm C là ảnh của điểm B qua phép quay tâm A góc 60 độ',
        pageRef: 'Trang 19',
        category: 'diem-doan-thang',
        code: `% Điểm C là ảnh của B qua phép quay tâm A góc 60 độ:
\\coordinate[label=above:$C$] (C) at ($(A)!1!60:(B)$);
`,
      },
      {
        id: 'tikz-intersections',
        title: 'Giao điểm của 2 đường (intersections)',
        description: 'Đặt tên đường name path và tìm giao điểm tự động',
        pageRef: 'Trang 13, 14, 15',
        category: 'diem-doan-thang',
        code: `\\draw[name path=d1] (A) -- (B);
\\draw[name path=d2] (C) -- (D);
\\path[name intersections={of=d1 and d2, by=H}];
\\fill (H) circle (1.5pt) node[above right]{$H$};
`,
      },
      {
        id: 'tikz-polygon-cycle',
        title: 'Vẽ đa giác khép kín (cycle)',
        description: 'Nối các đỉnh liên tiếp và tự động khép góc bằng cycle',
        pageRef: 'Trang 6, 21',
        category: 'diem-doan-thang',
        code: `\\coordinate (A) at (1,3);
\\coordinate (B) at (0,0);
\\coordinate (C) at (4,0);
\\draw[thick] (A) -- (B) -- (C) -- cycle;
\\node[above] at (A) {$A$};
\\node[left] at (B) {$B$};
\\node[right] at (C) {$C$};
`,
      },
    ],
  },
  {
    id: 'duong-tron-ellip',
    name: '4. Đường tròn, Ellipse & Cung tròn',
    iconName: 'Circle',
    description: 'Vẽ đường tròn, ellipse, cung arc theo góc và bán kính',
    snippets: [
      {
        id: 'tikz-circle',
        title: 'Đường tròn tâm (x,y) bán kính R',
        description: 'Lệnh vẽ đường tròn tâm O bán kính 2cm',
        pageRef: 'Trang 7',
        category: 'duong-tron-ellip',
        code: `\\draw (0,0) circle (2);
\\fill (0,0) circle (1.5pt) node[below left]{$O$};
`,
      },
      {
        id: 'tikz-ellipse',
        title: 'Đường Ellipse ({a} and {b})',
        description: 'Vẽ ellipse với bán trục hoành a và bán trục tung b',
        pageRef: 'Trang 7',
        category: 'duong-tron-ellip',
        code: `\\draw (0,0) ellipse ({3} and {1.5});\n`,
      },
      {
        id: 'tikz-arc',
        title: 'Cung tròn (arc)',
        description: 'Cung xuất phát từ điểm (x,y) từ góc α đến β bán kính R',
        pageRef: 'Trang 7, 8, 9',
        category: 'duong-tron-ellip',
        code: `% Cung tròn từ điểm (-1,0), xuất phát từ 0 độ đến 120 độ bán kính 1:
\\draw (-1,0) arc (0:120:1);
`,
      },
      {
        id: 'tikz-ellipse-arc',
        title: 'Cung Ellipse rút gọn',
        description: 'Vẽ nửa ellipse hoặc cung ellipse phục vụ hình không gian',
        pageRef: 'Trang 8, 24',
        category: 'duong-tron-ellip',
        code: `% Nửa ellipse nét đứt (đáy khuất) và nửa nét liền:
\\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.6];
\\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.6];
`,
      },
    ],
  },
  {
    id: 'hinh-khong-gian',
    name: '5. Hình học không gian 3D',
    iconName: 'Box',
    description: 'Khối hình học không gian kinh điển: Hình trụ, Hình nón, Mặt cầu, Lăng trụ',
    snippets: [
      {
        id: 'tikz-cylinder',
        title: 'Vẽ Hình trụ hoàn chỉnh (Cylinder)',
        description: 'Hình trụ gồm 2 đường sinh, đáy trên thấy rõ và đáy dưới có nét đứt',
        pageRef: 'Trang 24',
        category: 'hinh-khong-gian',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  % Đáy dưới: nửa elip nét đứt (phía sau) và nửa elip nét liền (phía trước)
  \\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.8];
  \\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.8];
  % Hai đường sinh và trục
  \\draw (-2,0) -- (-2,3.5);
  \\draw (2,0) -- (2,3.5);
  \\draw[dashed] (0,0) -- (0,3.5);
  \\draw[dashed] (0,0) -- (2,0);
  % Đáy trên: elip thấy toàn bộ
  \\draw (0,3.5) ellipse ({2} and {0.8});
  \\fill (0,0) circle (1.5pt) node[below]{$O'$};
  \\fill (0,3.5) circle (1.5pt) node[above]{$O$};
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-cone',
        title: 'Vẽ Hình nón hoàn chỉnh (Cone)',
        description: 'Hình nón có đỉnh S, trục SO, đường sinh SA, SB và đáy elip',
        pageRef: 'Trang 25',
        category: 'hinh-khong-gian',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  % Đáy hình nón
  \\draw[dashed] (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=0.6];
  \\draw (-2,0) arc [start angle=180, end angle=360, x radius=2, y radius=0.6];
  % Đỉnh S và hai đường sinh
  \\coordinate[label=above:$S$] (S) at (0,3.5);
  \\draw (-2,0) -- (S) -- (2,0);
  % Đường cao và bán kính đáy
  \\draw[dashed] (S) -- (0,0) node[below]{$O$} -- (2,0) node[right]{$A$};
  \\fill (0,0) circle (1.5pt);
  \\fill (S) circle (1.5pt);
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-sphere',
        title: 'Vẽ Mặt cầu với kinh/vĩ tuyến (Sphere)',
        description: 'Mặt cầu tâm O bán kính R với đường tròn biên và các elip kinh vĩ tuyến',
        pageRef: 'Trang 25',
        category: 'hinh-khong-gian',
        code: `\\begin{tikzpicture}[scale=1]
  % Đường tròn bao ngoài
  \\draw[thick] (0,0) circle (2.5);
  % Xích đạo (vĩ tuyến chính)
  \\draw[dashed] (2.5,0) arc [start angle=0, end angle=180, x radius=2.5, y radius=0.7];
  \\draw (-2.5,0) arc [start angle=180, end angle=360, x radius=2.5, y radius=0.7];
  % Kinh tuyến
  \\draw[dashed] (0,2.5) arc [start angle=90, end angle=270, x radius=1, y radius=2.5];
  \\draw (0,-2.5) arc [start angle=-90, end angle=90, x radius=1, y radius=2.5];
  % Trục quay cực Bắc - cực Nam
  \\draw[dashed] (0,2.5) -- (0,-2.5);
  \\fill (0,0) circle (1.5pt) node[below left]{$O$};
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-prism',
        title: 'Vẽ Hình lăng trụ xiên/đứng (Prism)',
        description: 'Khai báo các đỉnh đáy A,B,C,D và tịnh tiến lên đáy A\',B\',C\',D\'',
        pageRef: 'Trang 26, 27',
        category: 'hinh-khong-gian',
        code: `\\begin{tikzpicture}[scale=1]
  % Đáy dưới
  \\coordinate[label=below:$A$] (A) at (0,0);
  \\coordinate[label=below:$B$] (B) at (2.5,-0.5);
  \\coordinate[label=right:$C$] (C) at (4,0.5);
  \\coordinate[label=above left:$D$] (D) at (1.5,1);
  % Tịnh tiến tạo đáy trên qua vector (0.5, 3)
  \\coordinate[label=above left:$A'$] (AA) at ($(A)+(0.5,3)$);
  \\coordinate[label=above:$B'$] (BB) at ($(B)+(0.5,3)$);
  \\coordinate[label=above right:$C'$] (CC) at ($(C)+(0.5,3)$);
  \\coordinate[label=above:$D'$] (DD) at ($(D)+(0.5,3)$);
  % Vẽ đáy trên (nét liền toàn bộ)
  \\draw[thick] (AA) -- (BB) -- (CC) -- (DD) -- cycle;
  % Các cạnh bên
  \\draw[thick] (A) -- (AA)  (B) -- (BB)  (C) -- (CC);
  \\draw[dashed] (D) -- (DD);
  % Cạnh đáy dưới
  \\draw[thick] (A) -- (B) -- (C);
  \\draw[dashed] (C) -- (D) -- (A);
\\end{tikzpicture}\n`,
      },
    ],
  },
  {
    id: 'bang-bien-thien',
    name: '6. Bảng biến thiên (tkz-tab)',
    iconName: 'Table',
    description: 'Bảng biến thiên đầy đủ với nghiệm đạo hàm, điểm gián đoạn và mũi tên f(x)',
    snippets: [
      {
        id: 'tkz-tab-full',
        title: 'Bảng biến thiên đầy đủ (tkz-tab)',
        description: 'Bảng biến thiên chuẩn gồm 3 dòng: x, f\'(x), f(x) với cực trị và vô cực',
        pageRef: 'Trang 30, 31, 32',
        category: 'bang-bien-thien',
        code: `\\begin{tikzpicture}
  \\tkzTabInit[nocadre,lgt=1.5,espcl=2.2,deltacl=.5]
    {$x$/0.8, $f'(x)$/0.8, $f(x)$/2}
    {$-\\infty$, $-1$, $1$, $2$, $+\\infty$}
  \\tkzTabLine{,-,z,+,z,-,z,+,}
  \\tkzTabVar{+/ $+\\infty$, -/ $-4$, +/ $-3$, -/ $-4$, +/ $+\\infty$}
\\end{tikzpicture}\n`,
      },
      {
        id: 'tkz-tab-discontinuous',
        title: 'Bảng biến thiên có điểm gián đoạn 2 vạch (d)',
        description: 'Điểm không xác định 2 vạch tại x=1 với đạo hàm mang chữ d',
        pageRef: 'Trang 31, 32',
        category: 'bang-bien-thien',
        code: `\\begin{tikzpicture}
  \\tkzTabInit[nocadre,lgt=1.5,espcl=2.2,deltacl=.5]
    {$x$/0.8, $f'(x)$/0.8, $f(x)$/2}
    {$-\\infty$, $-1$, $1$, $2$, $+\\infty$}
  \\tkzTabLine{,-,z,+,d,-,z,+,}
  \\tkzTabVar{+/ $+\\infty$, -/ $-4$, +D+/ $+\\infty$, -/ $-4$, +/ $+\\infty$}
\\end{tikzpicture}\n`,
      },
      {
        id: 'tkz-tab-double-limit',
        title: 'Giới hạn 2 phía khác nhau (+D-)',
        description: 'Tiệm cận đứng có giới hạn trái +∞ và giới hạn phải -∞',
        pageRef: 'Trang 32, 33',
        category: 'bang-bien-thien',
        code: `\\begin{tikzpicture}
  \\tkzTabInit[nocadre,lgt=1.5,espcl=2.5,deltacl=.5]
    {$x$/0.8, $f'(x)$/0.8, $f(x)$/2.2}
    {$-\\infty$, $1$, $+\\infty$}
  \\tkzTabLine{,-,d,-,}
  \\tkzTabVar{+/ $2$, -D+/ $-\\infty$ / $+\\infty$, -/ $2$}
\\end{tikzpicture}\n`,
      },
    ],
  },
  {
    id: 'do-thi-ham-so',
    name: '7. Đồ thị hàm số & Hệ tọa độ cực',
    iconName: 'Activity',
    description: 'Vẽ đồ thị hàm số giải tích, đồ thị hàm bậc 3, bậc 4, đồ thị tham số',
    snippets: [
      {
        id: 'tikz-plot-quartic',
        title: 'Đồ thị hàm trùng phương (bậc 4)',
        description: 'Vẽ đồ thị y = x^4 - 2x^2 + 1 với smooth và domain xác định',
        pageRef: 'Trang 37',
        category: 'do-thi-ham-so',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  \\draw[->] (-2.5,0) -- (2.5,0) node[below]{$x$};
  \\draw[->] (0,-1) -- (0,3) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  \\draw[smooth,blue,thick] plot[domain=-1.65:1.65] (\\x,{(\\x)^4 - 2*(\\x)^2 + 1});
  \\node[below] at (0,-1.2) {$y=x^4 - 2x^2 + 1$};
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-plot-cubic',
        title: 'Đồ thị hàm bậc 3 với đường dóng (Dashed)',
        description: 'Vẽ đồ thị y = x^3 - 3x^2 + 3 và các đường dóng tọa độ cực trị',
        pageRef: 'Trang 38',
        category: 'do-thi-ham-so',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  \\draw[->] (-2,0) -- (3.5,0) node[below]{$x$};
  \\draw[->] (0,-1.5) -- (0,4) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  % Đồ thị hàm bậc 3
  \\draw[smooth,red,thick] plot[domain=-0.8:3] (\\x,{(\\x)^3 - 3*(\\x)^2 + 3});
  % Đường dóng điểm cực tiểu (2, -1)
  \\draw[dashed] (0,-1) node[left]{\\small $-1$} -- (2,-1) -- (2,0) node[above]{\\small $2$};
  \\fill (2,-1) circle (1.5pt);
  \\node[above right] at (0,3) {\\small $3$};
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-parametric-plot',
        title: 'Đồ thị phương trình tham số ({u(t)}, {v(t)})',
        description: 'Vẽ đường hình sao Astroid x = cos^3(t), y = sin^3(t)',
        pageRef: 'Trang 39',
        category: 'do-thi-ham-so',
        code: `\\begin{tikzpicture}[>=stealth,scale=1.5]
  \\draw[->] (-1.5,0) -- (1.5,0) node[below]{$x$};
  \\draw[->] (0,-1.5) -- (0,1.5) node[left]{$y$};
  \\draw[blue,smooth,thick,variable=\\t] plot[domain=0:360] ({cos(\\t)^3}, {sin(\\t)^3});
\\end{tikzpicture}\n`,
      },
    ],
  },
  {
    id: 'to-mien-dien-tich',
    name: '8. Tô miền đồ thị (Tích phân & Clip)',
    iconName: 'Paintbrush',
    description: 'Tô diện tích hình phẳng giới hạn bởi các đường, gạch sọc pattern, scope clip',
    snippets: [
      {
        id: 'tikz-fill-known-bounds',
        title: 'Tô miền giữa đồ thị và trục hoành',
        description: 'Tô miền diện tích giới hạn bởi y = x^2/3 từ x=1 đến x=2',
        pageRef: 'Trang 42, 43',
        category: 'to-mien-dien-tich',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  \\draw[->] (-1,0) -- (3.5,0) node[below]{$x$};
  \\draw[->] (0,-0.5) -- (0,3) node[left]{$y$};
  % Tô miền màu xanh từ x=1 đến x=2
  \\fill[indigo!30,smooth] (1,0) -- plot[domain=1:2] (\\x,{(\\x)^2/3}) -- (2,0) -- cycle;
  % Đồ thị
  \\draw[smooth,red,thick] plot[domain=0:2.5] (\\x,{(\\x)^2/3});
  \\draw[dashed] (1,0) node[below]{\\small $1$} -- (1,{1/3});
  \\draw[dashed] (2,0) node[below]{\\small $2$} -- (2,{4/3});
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-fill-between-curves',
        title: 'Tô miền giới hạn giữa 2 đường cong (y=f(x) và y=g(x))',
        description: 'Tô miền khép kín bằng cách vẽ f(x) xuôi chiều và g(x) ngược chiều',
        pageRef: 'Trang 44, 45',
        category: 'to-mien-dien-tich',
        code: `\\begin{tikzpicture}[>=stealth,scale=1]
  \\draw[->] (-2.5,0) -- (3,0) node[below]{$x$};
  \\draw[->] (0,-1) -- (0,5) node[left]{$y$};
  % Tô miền giao nhau giữa y=x^2 và y=x+2 (cận từ -1 đến 2)
  \\fill[blue!25,smooth] plot[domain=-1:2] (\\x,{(\\x)^2}) -- plot[domain=2:-1] (\\x,{\\x+2}) -- cycle;
  \\draw[smooth,red,thick] plot[domain=-1.5:2.3] (\\x,{(\\x)^2});
  \\draw[smooth,teal,thick] plot[domain=-1.5:2.5] (\\x,{\\x+2});
  \\draw[dashed] (-1,0) node[below]{\\small $-1$} -- (-1,1);
  \\draw[dashed] (2,0) node[below]{\\small $2$} -- (2,4);
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-scope-clip',
        title: 'Cắt miền bằng môi trường \\begin{scope} \\clip',
        description: 'Cắt miền khi không biết công thức hoành độ giao điểm',
        pageRef: 'Trang 48',
        category: 'to-mien-dien-tich',
        code: `\\begin{tikzpicture}[scale=1.5]
  \\draw[->] (-1.5,0) -- (1.5,0) node[below]{$x$};
  \\draw[->] (0,-1.5) -- (0,1.5) node[left]{$y$};
  \\begin{scope}
    % Cắt bên trong hình tròn đơn vị
    \\clip (0,0) circle (1);
    \\fill[blue!40,smooth] (-1,0) -- plot[domain=-1:1] (\\x,{(\\x)^3}) -- (1,0) -- cycle;
  \\end{scope}
  \\draw[thick] (0,0) circle (1);
  \\draw[smooth,thick] plot[domain=-1.1:1.1] (\\x,{(\\x)^3});
\\end{tikzpicture}\n`,
      },
      {
        id: 'tikz-pattern-fill',
        title: 'Tô miền gạch sọc (patterns: north east lines)',
        description: 'Tô sọc chéo chuẩn đề thi tuyển sinh toán học',
        pageRef: 'Trang 51, 52',
        category: 'to-mien-dien-tich',
        code: `\\fill[pattern=north east lines,smooth] (-1,0) -- plot[domain=-1:1] (\\x,{(\\x)^3}) -- (1,0) -- cycle;\n`,
      },
    ],
  },
  {
    id: 'duong-cong-controls',
    name: '9. Đường cong Bezier & Khảo sát đồ thị',
    iconName: 'Spline',
    description: 'Vẽ đường cong bằng điểm điều khiển controls, to[in=,out=], khảo sát hàm số',
    snippets: [
      {
        id: 'tikz-bezier-controls',
        title: 'Đường cong với 2 điểm điều khiển (controls)',
        description: 'Vẽ đường cong mượt từ A đến B với 2 tiếp tuyến DA và DB',
        pageRef: 'Trang 53, 54',
        category: 'duong-cong-controls',
        code: `\\coordinate (A) at (0,3);
\\coordinate (B) at (6,3);
\\draw[blue,thick] (A) .. controls (1,0) and (5,0) .. (B);
`,
      },
      {
        id: 'tikz-polar-relative-controls',
        title: 'Điểm điều khiển tương đối qua góc cực (+goc:bankinh)',
        description: 'Kỹ thuật đỉnh cao giúp nắn đồ thị cực kỳ nhanh chóng và tự nhiên',
        pageRef: 'Trang 56, 59, 60',
        category: 'duong-cong-controls',
        code: `% Vẽ đường cong từ (A) sang (B) với góc tiếp tuyến tại A là 60 độ, tại B là -150 độ:
\\draw[red,thick] (0,0) .. controls +(60:2) and +(-150:3) .. (6,0);
`,
      },
      {
        id: 'tikz-to-in-out',
        title: 'Lệnh nối đường to[in=..., out=...]',
        description: 'Nối 2 điểm với góc đi ra (out) và góc đi vào (in)',
        pageRef: 'Trang 58, 61',
        category: 'duong-cong-controls',
        code: `\\draw[blue,thick] (-3,4) to[out=-86,in=95] (-3,3);\n`,
      },
      {
        id: 'tikz-complete-graph-survey',
        title: 'Mẫu đồ thị khảo sát hàm số hoàn chỉnh bằng controls',
        description: 'Đồ thị uốn lượn có cực đại, cực tiểu, lưới tọa độ và dóng số chuẩn đề thi',
        pageRef: 'Trang 60, 61',
        category: 'duong-cong-controls',
        code: `\\begin{tikzpicture}[scale=0.9,>=stealth]
  \\draw[step=1,thin,gray!30] (-4,-3) grid (5,5);
  \\draw[->,thick] (-4,0) -- (5,0) node[below]{$x$};
  \\draw[->,thick] (0,-3) -- (0,5) node[left]{$y$};
  \\node[below left] at (0,0) {$O$};
  % Đường dóng điểm cực trị
  \\draw[dashed] (-2,0) node[below]{\\small $-2$} -- (-2,4) -- (0,4) node[right]{\\small $4$};
  \\draw[dashed] (1,0) node[above]{\\small $1$} -- (1,-1) -- (0,-1) node[left]{\\small $-1$};
  \\fill (-2,4) circle (1.5pt);
  \\fill (1,-1) circle (1.5pt);
  % Đường cong đồ thị mượt mà bằng controls
  \\draw[blue,thick] (-3.5,-2) to[in=-100,out=85] (-3,1)
    .. controls +(80:1.5) and +(140:1) .. (-2,4)
    .. controls +(-40:1) and +(130:1) .. (0,1)
    .. controls +(-50:1) and +(-140:0.8) .. (1,-1)
    .. controls +(40:1) and +(-100:1.5) .. (3,4);
\\end{tikzpicture}\n`,
      },
    ],
  },
];
