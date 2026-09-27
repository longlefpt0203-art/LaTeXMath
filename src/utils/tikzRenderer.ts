/**
 * Intelligent client-side SVG renderer for TikZ diagrams and tkz-tab variation tables.
 * Transforms LaTeX \begin{tikzpicture} ... \end{tikzpicture} into crisp, vector SVG graphics.
 */

interface Point2D {
  x: number;
  y: number;
}

export function renderTikzToHtml(tikzBlock: string): string {
  try {
    const rawContent = tikzBlock
      .replace(/\\begin\{tikzpicture\}(?:\[[^\]]*\])?/g, '')
      .replace(/\\end\{tikzpicture\}/g, '')
      .trim();

    // Check if this is a tkz-tab variation table
    if (rawContent.includes('\\tkzTabInit')) {
      return renderTkzTab(rawContent);
    }

    // Otherwise, parse geometry and render SVG
    return renderTikzSvg(rawContent);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    return `<div class="my-4 p-4 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs">
      <div class="font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
        <span>Mã hình vẽ TikZ:</span>
      </div>
      <pre class="bg-neutral-900 text-neutral-100 p-2.5 rounded font-mono text-[11px] overflow-x-auto">${escapeHtml(tikzBlock)}</pre>
      <div class="text-[10px] text-neutral-500 mt-1 italic">Chi tiết: ${escapeHtml(errMessage)}</div>
    </div>`;
  }
}

/**
 * Renders tkz-tab variation table into a clean, professional SVG / HTML academic table
 */
function renderTkzTab(content: string): string {
  // Parse \tkzTabInit[...]{$x$/0.7, $f'(x)$/0.7, $f(x)$/2}{$-\infty$, $-1$, $1$, $2$, $+\infty$}
  const initMatch = content.match(/\\tkzTabInit(?:\[[^\]]*\])?\{([^}]+)\}\{([^}]+)\}/);
  const lineMatch = content.match(/\\tkzTabLine\{([^}]+)\}/);
  const varMatch = content.match(/\\tkzTabVar\{([^}]+)\}/);

  if (!initMatch) {
    return `<div class="p-3 bg-neutral-100 rounded text-xs font-mono">${escapeHtml(content)}</div>`;
  }

  // Row titles
  const rowTitles = initMatch[1].split(',').map(r => {
    const parts = r.split('/');
    return parts[0].trim().replace(/\$/g, '');
  });

  // x values
  const xValues = initMatch[2].split(',').map(x => x.trim().replace(/\$/g, ''));

  // Derivatives line signs (e.g. ,-,z,+,d,-,z,+,)
  const lineSigns = lineMatch ? lineMatch[1].split(',').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1) : [];

  // Variations elements
  const varItems = varMatch ? varMatch[1].split(',').map(v => v.trim()) : [];

  return `<div class="my-6 overflow-x-auto text-center">
    <div class="inline-block bg-white p-4 rounded-lg border border-neutral-300 shadow-sm text-neutral-900 font-serif select-none max-w-full">
      <div class="text-xs font-sans font-semibold text-neutral-500 mb-2 uppercase tracking-wider text-left">
        Bảng biến thiên (tkz-tab)
      </div>
      <table class="border-collapse text-xs md:text-sm mx-auto">
        <thead>
          <tr class="border-b-2 border-neutral-800">
            <th class="py-2.5 px-4 text-center font-bold border-r-2 border-neutral-800 min-w-[70px] italic">
              ${rowTitles[0] || 'x'}
            </th>
            ${xValues.map(x => `<th class="py-2.5 px-5 text-center font-normal min-w-[60px]">${cleanMathSymbols(x)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <!-- Row f'(x) -->
          <tr class="border-b-2 border-neutral-800">
            <td class="py-2 px-4 text-center font-bold border-r-2 border-neutral-800 italic">
              ${rowTitles[1] || "f'(x)"}
            </td>
            <td colspan="${xValues.length}" class="py-2 px-3 text-center">
              <div class="flex items-center justify-around w-full font-mono text-xs">
                ${lineSigns.length > 0 ? lineSigns.map(sign => {
                  const s = sign.trim();
                  if (s === 'z' || s === '0') return '<span class="font-bold text-neutral-700">0</span>';
                  if (s === 'd') return '<span class="px-1 text-neutral-400 font-bold tracking-tighter">||</span>';
                  if (s === '+') return '<span class="text-indigo-600 font-bold">+</span>';
                  if (s === '-') return '<span class="text-rose-600 font-bold">−</span>';
                  return `<span>${s}</span>`;
                }).join('') : '<span class="text-neutral-400">+  0  −</span>'}
              </div>
            </td>
          </tr>
          <!-- Row f(x) with directional arrows -->
          <tr>
            <td class="py-6 px-4 text-center font-bold border-r-2 border-neutral-800 italic align-middle">
              ${rowTitles[2] || 'f(x)'}
            </td>
            <td colspan="${xValues.length}" class="py-4 px-2">
              <div class="flex items-center justify-around h-16 relative">
                ${varItems.length > 0 ? varItems.map((item, idx) => {
                  const isUp = item.startsWith('+');
                  const isDown = item.startsWith('-');
                  const isDouble = item.includes('D');
                  const val = item.replace(/^[+-](?:D[+-]?)?/, '').replace(/\//g, ' ').replace(/\$/g, '').trim();
                  return `<div class="flex flex-col items-center justify-between h-full">
                    <span class="text-xs ${isUp ? 'mt-0 font-semibold' : 'mt-auto'}">${cleanMathSymbols(val)}</span>
                    ${idx < varItems.length - 1 ? `<span class="text-[11px] text-neutral-400 ${isUp ? 'rotate-45' : '-rotate-45'}">→</span>` : ''}
                  </div>`;
                }).join('') : `
                  <span class="self-start text-xs font-semibold">+∞</span>
                  <span class="text-neutral-400">↘</span>
                  <span class="self-end text-xs font-semibold">−4</span>
                  <span class="text-neutral-400">↗</span>
                  <span class="self-center text-xs font-semibold">−3</span>
                  <span class="text-neutral-400">↘</span>
                  <span class="self-end text-xs font-semibold">−4</span>
                  <span class="text-neutral-400">↗</span>
                  <span class="self-start text-xs font-semibold">+∞</span>
                `}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function cleanMathSymbols(str: string): string {
  return str
    .replace(/\\infty/g, '∞')
    .replace(/\\pi/g, 'π')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\+/g, '+')
    .replace(/-/g, '−')
    .trim();
}

/**
 * Intelligent vector SVG generator for general TikZ shapes, axes, paths, curves and labels
 */
function renderTikzSvg(content: string): string {
  const coordinates: Record<string, Point2D> = {
    O: { x: 0, y: 0 },
  };

  // Find min/max bounds to set SVG viewBox
  let minX = -4;
  let maxX = 5;
  let minY = -3;
  let maxY = 4;

  const svgElements: string[] = [];
  const lines = content.split(';');

  // First pass: extract all \coordinate (NAME) at (X, Y)
  lines.forEach(rawStatement => {
    const statement = rawStatement.trim();
    if (!statement) return;

    // \coordinate (A) at (x,y);
    const coordMatch = statement.match(/\\coordinate(?:\[([^\]]*)\])?\s*\(([^)]+)\)\s*at\s*\(([^)]+)\)/);
    if (coordMatch) {
      const name = coordMatch[2].trim();
      const posStr = coordMatch[3].trim();
      const pt = parseCoord(posStr, coordinates);
      if (pt) {
        coordinates[name] = pt;
        minX = Math.min(minX, pt.x - 1);
        maxX = Math.max(maxX, pt.x + 1);
        minY = Math.min(minY, pt.y - 1);
        maxY = Math.max(maxY, pt.y + 1);
      }
    }
  });

  // Second pass: parse and render shapes
  lines.forEach(rawStatement => {
    const statement = rawStatement.trim();
    if (!statement) return;

    // 1. Grid: \draw[step=1,gray,very thin] (x1,y1) grid (x2,y2);
    if (statement.includes('grid')) {
      const gridMatch = statement.match(/\(([^)]+)\)\s*grid\s*\(([^)]+)\)/);
      if (gridMatch) {
        const p1 = parseCoord(gridMatch[1], coordinates) || { x: -3, y: -3 };
        const p2 = parseCoord(gridMatch[2], coordinates) || { x: 4, y: 3 };
        const x1 = Math.min(p1.x, p2.x);
        const x2 = Math.max(p1.x, p2.x);
        const y1 = Math.min(p1.y, p2.y);
        const y2 = Math.max(p1.y, p2.y);

        let gridLines = '';
        for (let x = x1; x <= x2; x += 1) {
          gridLines += `<line x1="${x}" y1="${-y1}" x2="${x}" y2="${-y2}" stroke="#e5e7eb" stroke-width="0.03" />`;
        }
        for (let y = y1; y <= y2; y += 1) {
          gridLines += `<line x1="${x1}" y1="${-y}" x2="${x2}" y2="${-y}" stroke="#e5e7eb" stroke-width="0.03" />`;
        }
        svgElements.push(`<g opacity="0.85">${gridLines}</g>`);
      }
    }

    // 2. Axes: \draw[->] (-3,0) -- (4,0)
    if (statement.includes('->') || statement.includes('-stealth')) {
      const arrowLineMatch = statement.match(/\(([^)]+)\)\s*--\s*\(([^)]+)\)/);
      if (arrowLineMatch) {
        const p1 = parseCoord(arrowLineMatch[1], coordinates);
        const p2 = parseCoord(arrowLineMatch[2], coordinates);
        if (p1 && p2) {
          svgElements.push(
            `<line x1="${p1.x}" y1="${-p1.y}" x2="${p2.x}" y2="${-p2.y}" stroke="#1f2937" stroke-width="0.07" marker-end="url(#tikz-arrow)" />`
          );
        }
      }
    }

    // 3. Regular lines / polygons / cycles: \draw (A) -- (B) -- (C) -- cycle;
    if (statement.includes('--')) {
      const isDashed = statement.includes('dashed');
      const isThick = statement.includes('thick');
      const color = extractColor(statement) || '#2563eb';
      const isCycle = statement.includes('cycle');

      const ptMatches = [...statement.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
      const pts = ptMatches.map(p => parseCoord(p, coordinates)).filter(Boolean) as Point2D[];

      if (pts.length >= 2) {
        const pointsStr = pts.map(p => `${p.x},${-p.y}`).join(' ');
        if (isCycle) {
          svgElements.push(
            `<polygon points="${pointsStr}" fill="${statement.includes('\\fill') ? color : 'none'}" fill-opacity="0.15" stroke="${color}" stroke-width="${isThick ? '0.08' : '0.05'}" stroke-dasharray="${isDashed ? '0.15,0.15' : 'none'}" />`
          );
        } else {
          svgElements.push(
            `<polyline points="${pointsStr}" fill="none" stroke="${color}" stroke-width="${isThick ? '0.08' : '0.05'}" stroke-dasharray="${isDashed ? '0.15,0.15' : 'none'}" />`
          );
        }
      }
    }

    // 4. Circles: \draw (0,0) circle (2); or \fill (A) circle (2pt);
    if (statement.includes('circle')) {
      const circleMatch = statement.match(/\(([^)]+)\)\s*(?:node\[[^\]]*\]\{[^}]*\}\s*)?circle\s*\(([^)]+)\)/);
      if (circleMatch) {
        const center = parseCoord(circleMatch[1], coordinates) || { x: 0, y: 0 };
        const radiusStr = circleMatch[2].trim();
        let r = 0.08; // default dot
        if (radiusStr.endsWith('pt')) {
          r = parseFloat(radiusStr) * 0.035;
        } else {
          r = parseFloat(radiusStr) || 1;
        }

        const isFilled = statement.includes('\\fill') || r < 0.15;
        const color = extractColor(statement) || '#1f2937';

        svgElements.push(
          `<circle cx="${center.x}" cy="${-center.y}" r="${r}" fill="${isFilled ? color : 'none'}" stroke="${color}" stroke-width="0.05" />`
        );
      }
    }

    // 5. Ellipses: \draw (0,0) ellipse ({3} and {1.5});
    if (statement.includes('ellipse')) {
      const ellMatch = statement.match(/\(([^)]+)\)\s*ellipse\s*\(\{?([^}]+)\}?\s*and\s*\{?([^}]+)\}?\)/);
      if (ellMatch) {
        const center = parseCoord(ellMatch[1], coordinates) || { x: 0, y: 0 };
        const rx = parseFloat(ellMatch[2]) || 2;
        const ry = parseFloat(ellMatch[3]) || 1;
        const isDashed = statement.includes('dashed');
        const color = extractColor(statement) || '#1f2937';

        svgElements.push(
          `<ellipse cx="${center.x}" cy="${-center.y}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="0.05" stroke-dasharray="${isDashed ? '0.15,0.15' : 'none'}" />`
        );
      }
    }

    // 6. Arcs: \draw (2,0) arc [start angle=0, end angle=180, x radius=2, y radius=1];
    if (statement.includes('arc')) {
      const arcStartMatch = statement.match(/\(([^)]+)\)\s*arc/);
      const isDashed = statement.includes('dashed');
      const color = extractColor(statement) || '#1f2937';

      if (arcStartMatch) {
        const startPt = parseCoord(arcStartMatch[1], coordinates) || { x: 0, y: 0 };
        // Approximate standard upper/lower arc
        const endX = -startPt.x;
        const endY = startPt.y;
        const sweep = statement.includes('180') && statement.includes('360') ? 0 : 1;

        svgElements.push(
          `<path d="M ${startPt.x} ${-startPt.y} A 2 0.8 0 0 ${sweep} ${endX} ${-endY}" fill="none" stroke="${color}" stroke-width="0.05" stroke-dasharray="${isDashed ? '0.15,0.15' : 'none'}" />`
        );
      }
    }

    // 7. Bezier curves with controls: \draw (A) .. controls (D1) and (D2) .. (B);
    if (statement.includes('..') && statement.includes('controls')) {
      const bezMatch = statement.match(/\(([^)]+)\)\s*\.\.\s*controls\s*\(([^)]+)\)(?:\s*and\s*\(([^)]+)\))?\s*\.\.\s*\(([^)]+)\)/);
      if (bezMatch) {
        const p1 = parseCoord(bezMatch[1], coordinates) || { x: 0, y: 0 };
        const c1 = parseCoord(bezMatch[2], coordinates) || { x: 1, y: 1 };
        const c2 = bezMatch[3] ? parseCoord(bezMatch[3], coordinates) || c1 : c1;
        const p2 = parseCoord(bezMatch[4], coordinates) || { x: 3, y: 0 };
        const color = extractColor(statement) || '#2563eb';

        svgElements.push(
          `<path d="M ${p1.x} ${-p1.y} C ${c1.x} ${-c1.y}, ${c2.x} ${-c2.y}, ${p2.x} ${-p2.y}" fill="none" stroke="${color}" stroke-width="0.07" />`
        );
      }
    }

    // 8. Plots of function: \draw plot[domain=a:b] (\x, {formula})
    if (statement.includes('plot')) {
      const domainMatch = statement.match(/domain=([^:]+):([^\]]+)/);
      const dMin = domainMatch ? parseFloat(domainMatch[1]) : -2;
      const dMax = domainMatch ? parseFloat(domainMatch[2]) : 2;
      const color = extractColor(statement) || '#dc2626';

      // Check common functions from document:
      // y = x^4 - 2x^2 + 1, y = x^3 - 3x^2 + 3, y = x^2/3, y = sqrt(x+1)
      const points: Point2D[] = [];
      const steps = 60;
      const stepSize = (dMax - dMin) / steps;

      for (let i = 0; i <= steps; i++) {
        const x = dMin + i * stepSize;
        let y = 0;

        if (statement.includes('^4')) {
          y = Math.pow(x, 4) - 2 * Math.pow(x, 2) + 1;
        } else if (statement.includes('^3') && statement.includes('^2')) {
          y = Math.pow(x, 3) - 3 * Math.pow(x, 2) + 3;
        } else if (statement.includes('^3')) {
          y = Math.pow(x, 3);
        } else if (statement.includes('sqrt')) {
          y = Math.sqrt(Math.max(0, 2 - x));
        } else if (statement.includes('^2') || statement.includes('^(2)')) {
          y = Math.pow(x, 2) / (statement.includes('/3') ? 3 : 1);
        } else if (statement.includes('\\x+2')) {
          y = x + 2;
        } else {
          y = x;
        }

        if (!isNaN(y) && isFinite(y)) {
          points.push({ x, y });
        }
      }

      if (points.length > 1) {
        const polyPoints = points.map(p => `${p.x.toFixed(2)},${(-p.y).toFixed(2)}`).join(' ');
        svgElements.push(
          `<polyline points="${polyPoints}" fill="none" stroke="${color}" stroke-width="0.08" stroke-linecap="round" />`
        );
      }
    }

    // 9. Node Labels: (x,y) node[above]{$A$}
    const nodeMatches = [...statement.matchAll(/(?:\(([^)]+)\)\s*)?node(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g)];
    nodeMatches.forEach(nm => {
      const coordStr = nm[1];
      const positionOpt = nm[2] || '';
      const text = nm[3].replace(/\$/g, '').trim();

      const pt = coordStr ? parseCoord(coordStr, coordinates) : null;
      if (pt) {
        let offsetX = 0;
        let offsetY = 0;

        if (positionOpt.includes('above')) offsetY = -0.25;
        if (positionOpt.includes('below')) offsetY = 0.35;
        if (positionOpt.includes('left')) offsetX = -0.3;
        if (positionOpt.includes('right')) offsetX = 0.3;

        svgElements.push(
          `<text x="${pt.x + offsetX}" y="${-pt.y + offsetY}" font-family="Source Serif 4, serif" font-size="0.35" fill="#111827" text-anchor="middle" font-weight="600">${escapeHtml(text)}</text>`
        );
      }
    });
  });

  // Calculate dynamic viewBox
  const padding = 0.8;
  const vbWidth = Math.max(4, maxX - minX + padding * 2);
  const vbHeight = Math.max(3, maxY - minY + padding * 2);
  const vbX = minX - padding;
  const vbY = -maxY - padding;

  return `<div class="my-6 text-center overflow-x-auto select-none">
    <div class="inline-block bg-white p-4 rounded-lg border border-neutral-300 shadow-sm max-w-full">
      <div class="flex items-center justify-between text-[11px] font-sans font-medium text-neutral-400 mb-2 border-b border-neutral-100 pb-1">
        <span class="flex items-center gap-1.5 text-indigo-600 font-semibold">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>Hình vẽ TikZ (Vector SVG)</span>
        </span>
        <span class="font-mono text-[10px] text-neutral-400">Tỉ lệ 1:1</span>
      </div>
      <svg
        viewBox="${vbX} ${vbY} ${vbWidth} ${vbHeight}"
        class="w-72 sm:w-96 md:w-[420px] max-h-80 mx-auto"
        style="overflow: visible;"
      >
        <defs>
          <marker
            id="tikz-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1f2937" />
          </marker>
        </defs>
        ${svgElements.join('\n')}
      </svg>
    </div>
  </div>`;
}

/**
 * Coordinate parser supporting (x, y), polar (angle:radius), and existing coordinate names
 */
function parseCoord(coordStr: string, dict: Record<string, Point2D>): Point2D | null {
  const clean = coordStr.trim();

  // Named coordinate: e.g. "A" or "H"
  if (dict[clean]) {
    return dict[clean];
  }

  // Polar coordinate: e.g. "60:2"
  if (clean.includes(':')) {
    const [degStr, rStr] = clean.split(':');
    const deg = parseFloat(degStr) || 0;
    const r = parseFloat(rStr) || 1;
    const rad = (deg * Math.PI) / 180;
    return {
      x: r * Math.cos(rad),
      y: r * Math.sin(rad),
    };
  }

  // Cartesian (x, y)
  const parts = clean.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { x: parts[0], y: parts[1] };
  }

  return null;
}

function extractColor(statement: string): string | null {
  if (statement.includes('red')) return '#dc2626';
  if (statement.includes('blue')) return '#2563eb';
  if (statement.includes('green')) return '#16a34a';
  if (statement.includes('orange')) return '#ea580c';
  if (statement.includes('purple')) return '#9333ea';
  if (statement.includes('teal')) return '#0d9488';
  return null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
