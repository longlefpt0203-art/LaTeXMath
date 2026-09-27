import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  onProgress?: (message: string) => void;
}

/**
 * Generates an actual PDF Blob from the compiled LaTeX A4 pages.
 * Supports individual .a4-page-sheet elements or container fallback.
 */
export async function generateLatexPdfBlob(
  containerId: string = 'latex-printable-document',
  onProgress?: (msg: string) => void
): Promise<{ blob: Blob; url: string; totalPages: number }> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Không tìm thấy phần tử tài liệu (${containerId}).`);
  }

  onProgress?.('Đang chuẩn bị trang in...');

  // Check if multiple individual page sheets exist
  const pageSheets = Array.from(container.querySelectorAll<HTMLElement>('.a4-page-sheet'));

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidthMm = 210;
  const pdfHeightMm = 297;

  if (pageSheets.length > 0) {
    // Multi-page discrete sheet rendering
    for (let i = 0; i < pageSheets.length; i++) {
      onProgress?.(`Đang kết xuất trang ${i + 1}/${pageSheets.length}...`);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const sheet = pageSheets[i];
      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    return { blob, url, totalPages: pageSheets.length };
  } else {
    // Fallback: render single container and slice by A4 ratio
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    const canvasWidthPx = canvas.width;
    const canvasHeightPx = canvas.height;
    const pageCanvasHeightPx = (canvasWidthPx * pdfHeightMm) / pdfWidthMm;
    const totalPages = Math.max(1, Math.ceil(canvasHeightPx / pageCanvasHeightPx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidthPx;
      pageCanvas.height = Math.min(pageCanvasHeightPx, canvasHeightPx - page * pageCanvasHeightPx);

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          page * pageCanvasHeightPx,
          canvasWidthPx,
          pageCanvas.height,
          0,
          0,
          canvasWidthPx,
          pageCanvas.height
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const sliceHeightMm = (pageCanvas.height * pdfWidthMm) / canvasWidthPx;
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidthMm, sliceHeightMm, undefined, 'FAST');
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    return { blob, url, totalPages };
  }
}

/**
 * Downloads the compiled LaTeX document as a real PDF file.
 */
export async function downloadLatexPdf(
  elementId: string = 'latex-printable-document',
  options: PdfExportOptions = {}
): Promise<{ success: boolean; message: string }> {
  const {
    filename = 'Tai_lieu_LaTeX.pdf',
    onProgress,
  } = options;

  onProgress?.('Đang xuất bản file PDF...');
  const { blob, totalPages } = await generateLatexPdfBlob(elementId, onProgress);

  onProgress?.('Đang tải file PDF xuống máy...');
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: `Đã xuất và tải thành công file "${cleanFilename}" (${totalPages} trang).`,
  };
}
