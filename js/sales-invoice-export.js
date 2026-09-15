// ══════════════════════════════════════════════════════════════════
//  SALES INVOICE EXPORT — PDF and Excel for the posted tax invoice.
//
//    • PDF ..... a high-resolution snapshot of the exact invoice sheet the
//                preview shows, laid out on A4 (logo, QR and seal included).
//    • Excel ... a formatted .xlsx built from the same figures and labels
//                (window.getSalesInvoiceExportData in sales-invoice-print.js).
// ══════════════════════════════════════════════════════════════════
(function (global) {
  'use strict';

  const JSPDF_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  const HTML2CANVAS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  const EXCELJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js';
  const SHEET_WIDTH_PX = 820;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = Array.prototype.find.call(document.scripts, s => s.src === src);
      if (existing && existing.dataset.loaded === '1') return resolve();
      const script = existing || document.createElement('script');
      script.addEventListener('load', () => { script.dataset.loaded = '1'; resolve(); });
      script.addEventListener('error', () => reject(new Error('Could not load ' + src)));
      if (!existing) { script.src = src; document.head.appendChild(script); }
    });
  }

  async function ensureJsPDF() {
    if (!(global.jspdf && global.jspdf.jsPDF)) await loadScript(JSPDF_SRC);
    if (!(global.jspdf && global.jspdf.jsPDF)) throw new Error('PDF library is not available.');
    return global.jspdf.jsPDF;
  }

  async function ensureHtml2Canvas() {
    if (!global.html2canvas) await loadScript(HTML2CANVAS_SRC);
    if (!global.html2canvas) throw new Error('Snapshot library is not available.');
    return global.html2canvas;
  }

  async function ensureExcelJS() {
    if (!global.ExcelJS) await loadScript(EXCELJS_SRC);
    if (!global.ExcelJS) throw new Error('Excel library is not available.');
    return global.ExcelJS;
  }

  function getExportData(inv) {
    if (typeof global.getSalesInvoiceExportData !== 'function') {
      throw new Error('Invoice module is not loaded.');
    }
    return global.getSalesInvoiceExportData(inv);
  }

  function waitForImages(root) {
    const imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
    return Promise.all(imgs.map(img => (img.complete && img.naturalWidth)
      ? Promise.resolve()
      : new Promise(res => { img.addEventListener('load', res, { once: true }); img.addEventListener('error', res, { once: true }); })));
  }

  // html2canvas cannot paint CSS gradients reliably (the initials logo uses one), so each
  // gradient in the off-screen copy is redrawn onto a canvas and swapped in as an image.
  function rasterizeGradients(root) {
    const els = [root].concat(Array.prototype.slice.call(root.querySelectorAll('*')));
    els.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage || '';
      if (bg.indexOf('gradient') === -1) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const m = /linear-gradient\(\s*(?:(-?[\d.]+)deg\s*,)?(.*)\)\s*$/i.exec(bg);
      const colors = m ? (m[2].match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi) || []) : [];
      el.style.backgroundImage = 'none';
      if (!w || !h || colors.length < 2) {
        if (colors[0]) el.style.backgroundColor = colors[0];
        return;
      }
      const scale = 3;
      const W = Math.round(w * scale);
      const H = Math.round(h * scale);
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      const angle = (m[1] !== undefined ? parseFloat(m[1]) : 180) * Math.PI / 180;
      const half = (Math.abs(W * Math.sin(angle)) + Math.abs(H * Math.cos(angle))) / 2;
      const dx = Math.sin(angle) * half;
      const dy = -Math.cos(angle) * half;
      const g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
      colors.forEach((col, i) => g.addColorStop(i / (colors.length - 1), col));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      el.style.backgroundColor = colors[0];
      el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
      el.style.backgroundSize = '100% 100%';
      el.style.backgroundRepeat = 'no-repeat';
    });
  }

  // html2canvas skips SVG images (the company seal), so they are redrawn as PNG first.
  function rasterizeSvgImages(root) {
    const imgs = Array.prototype.slice.call(root.querySelectorAll('img'))
      .filter(img => /^data:image\/svg\+xml/i.test(img.getAttribute('src') || ''));
    return Promise.all(imgs.map(img => new Promise(resolve => {
      const src = img.getAttribute('src');
      const probe = new Image();
      probe.onload = () => {
        try {
          const w = probe.naturalWidth || 200;
          const h = probe.naturalHeight || 200;
          const scale = 4;
          const c = document.createElement('canvas');
          c.width = w * scale;
          c.height = h * scale;
          c.getContext('2d').drawImage(probe, 0, 0, c.width, c.height);
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = c.toDataURL('image/png');
        } catch (e) { resolve(); }
      };
      probe.onerror = () => resolve();
      probe.src = src;
    })));
  }

  // ── PDF ──────────────────────────────────────────────────────────
  async function exportSalesInvoiceToPDF(inv) {
    const data = getExportData(inv);
    const [jsPDF, html2canvas] = await Promise.all([ensureJsPDF(), ensureHtml2Canvas()]);

    // Render a fresh copy of the sheet off-screen at the preview's width, inside the
    // app document so it picks up exactly the same styles the preview uses.
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed; left:-12000px; top:0; width:' + SHEET_WIDTH_PX + 'px; background:#ffffff; pointer-events:none;';
    host.innerHTML = global.renderSalesTaxInvoiceHTML(inv);
    document.body.appendChild(host);

    try {
      await waitForImages(host);
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }

      const sheet = host.firstElementChild;
      rasterizeGradients(sheet);
      await rasterizeSvgImages(sheet);
      const canvas = await html2canvas(sheet, {
        scale: 2,
        imageTimeout: 4000,
        removeContainer: true,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: SHEET_WIDTH_PX
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;
      const mmPerPx = usableW / canvas.width;
      const fullH = canvas.height * mmPerPx;

      if (fullH <= usableH) {
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, usableW, fullH, undefined, 'FAST');
      } else {
        // Taller than one page: slice the snapshot page by page.
        const slicePx = Math.floor(usableH / mmPerPx);
        let offset = 0;
        let first = true;
        while (offset < canvas.height) {
          const h = Math.min(slicePx, canvas.height - offset);
          const part = document.createElement('canvas');
          part.width = canvas.width;
          part.height = h;
          const ctx = part.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, part.width, part.height);
          ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
          if (!first) pdf.addPage();
          pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, usableW, h * mmPerPx, undefined, 'FAST');
          offset += h;
          first = false;
        }
      }

      pdf.setProperties({
        title: data.docTitle + ' ' + (inv.invoiceNo || ''),
        subject: data.docTitle,
        author: data.companyName,
        creator: 'KYA Accounting'
      });
      pdf.save(data.fileBase + '.pdf');
      return true;
    } finally {
      host.remove();
    }
  }

  // ── Excel ────────────────────────────────────────────────────────
  const XL = {
    blue: 'FF2563EB', blueDark: 'FF1D4ED8', ink: 'FF0F172A', slate: 'FF334155',
    muted: 'FF475569', faint: 'FF64748B', line: 'FF94A3B8', shade: 'FFF8FAFC', white: 'FFFFFFFF'
  };
  const XL_NUM = '#,##0.00';
  const XL_FONT = 'Calibri';
  const XL_PX_PER_CHAR = 7.2;

  function colLetter(n) {
    let s = '';
    while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }

  // Excel only embeds PNG/JPEG, so anything else (SVG seal, WEBP logo …) is drawn to PNG.
  function imageToExcelMedia(src, size) {
    return new Promise(resolve => {
      if (!src) return resolve(null);
      const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(src);
      if (m) return resolve({ base64: m[2], extension: m[1].toLowerCase() === 'png' ? 'png' : 'jpeg' });
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || size || 200;
          const h = img.naturalHeight || size || 200;
          const scale = Math.max(1, Math.min(4, (size || 200) * 3 / Math.max(w, h)));
          const c = document.createElement('canvas');
          c.width = Math.round(w * scale);
          c.height = Math.round(h * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve({ base64: c.toDataURL('image/png').split(',')[1], extension: 'png' });
        } catch (e) { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // Initials badge in the company's icon colours, for companies without an uploaded logo.
  function initialsBadgeMedia(co, name) {
    const presets = {
      'blue-green': ['#2563eb', '#059669'], 'indigo-purple': ['#4f46e5', '#7c3aed'],
      'rose-red': ['#e11d48', '#be123c'], 'amber-orange': ['#f59e0b', '#d97706'],
      'emerald-teal': ['#10b981', '#047857'], 'dark-slate': ['#475569', '#1e293b']
    };
    const pair = presets[co.iconColor] || presets['blue-green'];
    const initials = (typeof global.getCompanyInitials === 'function')
      ? global.getCompanyInitials(co.name || name)
      : String(name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
    const px = 246;
    const c = document.createElement('canvas');
    c.width = px; c.height = px;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, px, px);
    g.addColorStop(0, pair[0]); g.addColorStop(1, pair[1]);
    const r = 42;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(px, 0, px, px, r);
    ctx.arcTo(px, px, 0, px, r);
    ctx.arcTo(0, px, 0, 0, r);
    ctx.arcTo(0, 0, px, 0, r);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 84px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, px / 2, px / 2 + 4);
    return { base64: c.toDataURL('image/png').split(',')[1], extension: 'png' };
  }

  async function exportSalesInvoiceToExcel(inv) {
    const d = getExportData(inv);
    const ExcelJS = await ensureExcelJS();

    const wb = new ExcelJS.Workbook();
    wb.creator = 'KYA Accounting';
    wb.created = new Date();
    const sheetName = String(inv.invoiceNo || 'Invoice').replace(/[\\/?*[\]:]/g, '-').slice(0, 31) || 'Invoice';
    const ws = wb.addWorksheet(sheetName, {
      views: [{ showGridLines: false }],
      pageSetup: {
        paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        horizontalCentered: true,
        margins: { left: 0.35, right: 0.35, top: 0.45, bottom: 0.45, header: 0.2, footer: 0.2 }
      }
    });

    // ── Columns follow the item table ──
    const taxCols = d.taxMode === 'split' ? ['CGST', 'SGST'] : (d.taxMode === 'igst' ? ['IGST'] : []);
    const headers = ['Sl No.', 'Item Description', 'HSN/SAC', 'Qty', 'Unit', 'Rate'].concat(taxCols, ['Amount']);
    const N = headers.length;
    const L = colLetter(N);
    const widths = [8, 36, 12, 8, 8, 13].concat(taxCols.map(() => 9), [15]);
    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    const PARTY_SPLIT = 3;            // Billed To A..C | Shipped To D..last
    const RIGHT_START = N - 2;        // totals label (N-2..N-1), value N
    const BANK_TEXT_END = N - 5;      // bank text A..(N-5); QR sits over (N-4..N-3)

    const border = (argb, style) => ({ style: style || 'thin', color: { argb } });
    const font = (o) => Object.assign({ name: XL_FONT, size: 10, color: { argb: XL.slate } }, o || {});
    const widthChars = (c1, c2) => widths.slice(c1 - 1, c2).reduce((s, w) => s + w, 0);
    let row = 0;

    const cellAt = (r, c) => ws.getCell(r, c);
    const merge = (r1, c1, r2, c2) => { if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2); return cellAt(r1, c1); };
    const put = (r, c1, c2, value, opts) => {
      const cell = merge(r, c1, r, c2);
      const o = opts || {};
      cell.value = value;
      cell.font = font(o.font);
      cell.alignment = Object.assign({ vertical: 'middle', horizontal: 'left', wrapText: !!o.wrap }, o.align || {});
      if (o.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: o.fill } };
      if (o.numFmt) cell.numFmt = o.numFmt;
      return cell;
    };
    const rich = (label, value, labelColor) => ({
      richText: [
        { text: label + ' ', font: font({ color: { argb: labelColor || XL.slate } }) },
        { text: String(value), font: font({ color: { argb: XL.ink } }) }
      ]
    });
    const fillRange = (r1, c1, r2, c2, argb) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) cellAt(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      }
    };
    const setBorderSides = (r, c, sides) => {
      const cell = cellAt(r, c);
      cell.border = Object.assign({}, cell.border || {}, sides);
    };
    const boxRange = (r1, c1, r2, c2, argb) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          const sides = {};
          if (r === r1) sides.top = border(argb);
          if (r === r2) sides.bottom = border(argb);
          if (c === c1) sides.left = border(argb);
          if (c === c2) sides.right = border(argb);
          if (Object.keys(sides).length) setBorderSides(r, c, sides);
        }
      }
    };
    const heightFor = (text, chars, base) => {
      const lines = String(text || '').split('\n')
        .reduce((n, part) => n + Math.max(1, Math.ceil(part.length / Math.max(8, chars * 1.1))), 0);
      return Math.max(base || 16, lines * 14 + 4);
    };
    // fractional column position for a pixel offset from the left edge of column `startCol`
    const pxToCol = (startCol, px) => {
      let col = startCol - 1;
      let remaining = px;
      while (col < widths.length) {
        const w = widths[col] * XL_PX_PER_CHAR;
        if (remaining <= w) return col + remaining / w;
        remaining -= w;
        col++;
      }
      return widths.length;
    };

    // ── 1. Header ──
    const co = d.co;
    const coLines = [];
    if (co.address) coLines.push(String(co.address).replace(/\s*\n\s*/g, ', '));
    if (co.gstin) coLines.push('GSTIN: ' + co.gstin);
    const contact = [co.phone ? 'Phone: ' + co.phone : '', co.email || ''].filter(Boolean).join('  ·  ');
    if (contact) coLines.push(contact);
    if (co.website) coLines.push(co.website);

    const leftHeader = [{ v: d.companyName, f: { size: 16, bold: true, color: { argb: XL.ink } } }]
      .concat(coLines.map(t => ({ v: t, f: { size: 10, color: { argb: XL.muted } } })));
    const rightHeader = [
      { v: d.docTitle.toUpperCase(), f: { size: 18, bold: true, color: { argb: XL.blueDark } } },
      { v: d.subtitle, f: { size: 9.5, bold: true, color: { argb: XL.faint } } },
      { v: rich('Invoice No.:', inv.invoiceNo || '', XL.faint) },
      { v: rich('Date:', d.invoiceDate || '', XL.faint) }
    ];
    if (d.placeOfSupply) rightHeader.push({ v: rich('Place of Supply:', d.placeOfSupply, XL.faint) });

    const headerRows = Math.max(leftHeader.length, rightHeader.length, 4);
    const headerTop = row + 1;
    const coTextEnd = Math.max(2, N - 4);
    for (let i = 0; i < headerRows; i++) {
      row++;
      ws.getRow(row).height = i === 0 ? 26 : 16;
      const lh = leftHeader[i];
      if (lh) put(row, 2, coTextEnd, lh.v, { font: lh.f });
      const rh = rightHeader[i];
      if (rh) put(row, N - 3, N, rh.v, { font: rh.f, align: { horizontal: 'right' } });
    }
    let logo = co.iconImage ? await imageToExcelMedia(co.iconImage, 120) : null;
    if (!logo) logo = initialsBadgeMedia(co, d.companyName);
    if (logo) {
      const id = wb.addImage(logo);
      ws.addImage(id, { tl: { col: 0.08, row: headerTop - 1 + 0.15 }, ext: { width: 54, height: 54 }, editAs: 'oneCell' });
    }
    for (let c = 1; c <= N; c++) setBorderSides(row, c, { bottom: border(XL.blueDark, 'medium') });

    // ── 2. Parties ──
    row++; ws.getRow(row).height = 8;
    const partyLines = (p) => {
      const lines = [];
      if (p.address) lines.push(String(p.address).replace(/\s*\n\s*/g, ', '));
      const cityPin = [p.city, p.pincode].filter(Boolean).join(' - ');
      if (cityPin) lines.push(cityPin);
      const stateCountry = [p.state, p.country].filter(Boolean).join(', ');
      if (stateCountry) lines.push(stateCountry);
      if (p.phone) lines.push('Phone: ' + p.phone);
      if (p.email) lines.push(p.email);
      if (p.gstin) lines.push('GSTIN: ' + p.gstin);
      if (p.pan) lines.push('PAN: ' + p.pan);
      return lines;
    };
    const billed = d.parties.billed;
    const shipped = d.parties.shipped || billed;
    const bLines = partyLines(billed);
    const sLines = partyLines(shipped);
    const shipNoteIndex = d.parties.isTemporary ? sLines.push('Delivery details entered on this voucher.') - 1 : -1;
    const partyCount = Math.max(bLines.length, sLines.length);
    const partyTop = row + 1;
    const labelFont = { size: 9, bold: true, color: { argb: XL.blue } };
    const nameFont = { size: 11, bold: true, color: { argb: XL.ink } };

    row++; ws.getRow(row).height = 18;
    put(row, 1, PARTY_SPLIT, 'BILLED TO (RECIPIENT)', { font: labelFont, fill: XL.shade });
    put(row, PARTY_SPLIT + 1, N, 'SHIPPED TO (DELIVERY)', { font: labelFont, fill: XL.shade });
    row++; ws.getRow(row).height = 18;
    put(row, 1, PARTY_SPLIT, billed.name || '—', { font: nameFont, fill: XL.shade });
    put(row, PARTY_SPLIT + 1, N, shipped.name || '—', { font: nameFont, fill: XL.shade });
    for (let i = 0; i < partyCount; i++) {
      row++;
      const bl = bLines[i] || '';
      const sl = sLines[i] || '';
      ws.getRow(row).height = Math.max(heightFor(bl, widthChars(1, PARTY_SPLIT)), heightFor(sl, widthChars(PARTY_SPLIT + 1, N)));
      put(row, 1, PARTY_SPLIT, bl, { font: { color: { argb: XL.muted } }, fill: XL.shade, wrap: true });
      put(row, PARTY_SPLIT + 1, N, sl, {
        font: i === shipNoteIndex ? { italic: true, color: { argb: XL.faint } } : { color: { argb: XL.muted } },
        fill: XL.shade, wrap: true
      });
    }
    boxRange(partyTop, 1, row, PARTY_SPLIT, XL.line);
    boxRange(partyTop, PARTY_SPLIT + 1, row, N, XL.line);

    // ── 3. Items ──
    row++; ws.getRow(row).height = 8;
    row++; ws.getRow(row).height = 24;
    headers.forEach((h, i) => {
      const cell = cellAt(row, i + 1);
      cell.value = h.toUpperCase();
      cell.font = font({ size: 9.5, bold: true, color: { argb: XL.white } });
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL.blue } };
      cell.border = { top: border(XL.blueDark), bottom: border(XL.blueDark), left: border(XL.blueDark), right: border(XL.blueDark) };
      const horizontal = (h === 'Sl No.' || h === 'Item Description' || h === 'HSN/SAC') ? 'left' : (h === 'Unit' ? 'center' : 'right');
      cell.alignment = { vertical: 'middle', horizontal };
    });

    const pct = (v) => v ? (Math.round(v * 100) / 100) + '%' : '—';
    if (!d.rows.length) {
      row++; ws.getRow(row).height = 22;
      put(row, 1, N, 'No line items on this invoice.', { font: { color: { argb: XL.line } }, align: { horizontal: 'center' }, fill: XL.shade });
      boxRange(row, 1, row, N, XL.line);
    }
    d.rows.forEach((r, idx) => {
      row++;
      const values = [idx + 1, r.name || '', r.hsn || '—', r.qty, (r.unit || '—').toUpperCase(), r.rate];
      if (d.taxMode === 'split') values.push(pct(r.taxPct / 2), pct(r.taxPct / 2));
      else if (d.taxMode === 'igst') values.push(pct(r.taxPct));
      values.push(r.total);
      ws.getRow(row).height = heightFor(r.name, widths[1], 18);
      values.forEach((v, i) => {
        const c = i + 1;
        const cell = cellAt(row, c);
        cell.value = v;
        cell.font = font({ size: 10, color: { argb: c === 1 ? XL.faint : (c === 3 || c === 5 ? XL.muted : XL.ink) } });
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL.shade } };
        cell.border = { top: border(XL.line), bottom: border(XL.line), left: border(XL.line), right: border(XL.line) };
        let horizontal = 'right';
        if (c === 1 || c === 5) horizontal = 'center';
        else if (c === 2 || c === 3) horizontal = 'left';
        cell.alignment = { vertical: 'middle', horizontal, wrapText: c === 2 };
        if (c === 6 || c === N) cell.numFmt = XL_NUM;
        if (c === 3) cell.numFmt = '@';
      });
    });

    // ── 4. Bank details (left) + totals (right) ──
    row++; ws.getRow(row).height = 8;
    const bank = d.bank;
    const bankLines = [];
    if (bank.bankName) bankLines.push(['Bank:', bank.bankName]);
    if (bank.accountHolder) bankLines.push(['A/c Holder:', bank.accountHolder]);
    if (bank.accountNo) bankLines.push(['A/c No.:', String(bank.accountNo)]);
    if (bank.ifsc) bankLines.push(['IFSC:', bank.ifsc]);
    if (bank.branch) bankLines.push(['Branch:', bank.branch]);
    const money = (n) => (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const payLines = d.payLines.map(p => [p.label + ':', p.value]);

    const totals = [['Taxable Value', d.subTotal]];
    if (d.totalDiscount > 0) totals.push(['Total Discount', -d.totalDiscount]);
    const gstStart = d.gstLines.length ? totals.length : -1;
    d.gstLines.forEach(g => totals.push([g.label, g.amount]));
    if (inv.tdsTcsMode === 'TCS' && d.tdsTcsAmount) totals.push(['TCS @ ' + (parseFloat(inv.tdsTcsRate) || 0) + '%', d.tdsTcsAmount]);
    if (inv.tdsTcsMode === 'TDS' && d.tdsTcsAmount) totals.push(['TDS @ ' + (parseFloat(inv.tdsTcsRate) || 0) + '%', -d.tdsTcsAmount]);
    const roundIndex = d.adjustments !== 0 ? totals.length : -1;
    if (d.adjustments !== 0) totals.push(['Round Off', d.adjustments]);

    const leftCount = 1 + bankLines.length + payLines.length;
    const qrRows = bank.qrCode ? 6 : 0;
    const bankRows = Math.max(leftCount, qrRows);
    const blockCount = Math.max(bankRows, totals.length + 1);
    const blockTop = row + 1;
    const dashedTop = { top: { style: 'dashed', color: { argb: XL.line } } };

    for (let i = 0; i < blockCount; i++) {
      row++;
      ws.getRow(row).height = 17;
      if (i === 0) {
        put(row, 1, BANK_TEXT_END, 'BANK DETAILS FOR PAYMENT', { font: labelFont });
      } else if (i - 1 < bankLines.length) {
        put(row, 1, BANK_TEXT_END, rich(bankLines[i - 1][0], bankLines[i - 1][1]));
      } else if (i - 1 - bankLines.length < payLines.length) {
        const p = payLines[i - 1 - bankLines.length];
        put(row, 1, BANK_TEXT_END, rich(p[0], p[1]));
        if (i - 1 === bankLines.length) {
          for (let c = 1; c <= BANK_TEXT_END; c++) setBorderSides(row, c, dashedTop);
        }
      }

      if (i < totals.length) {
        const t = totals[i];
        put(row, RIGHT_START, N - 1, t[0], { font: { bold: true, color: { argb: XL.slate } } });
        put(row, N, N, t[1], { font: { bold: true, color: { argb: XL.slate } }, align: { horizontal: 'right' }, numFmt: XL_NUM });
        if (i === gstStart || i === roundIndex) {
          for (let c = RIGHT_START; c <= N; c++) setBorderSides(row, c, dashedTop);
        }
      } else if (i === totals.length) {
        ws.getRow(row).height = 22;
        const valueFont = { size: 11, bold: true, color: { argb: XL.white } };
        put(row, RIGHT_START, N - 1, 'Total Amount Payable', { font: valueFont, fill: XL.blue });
        put(row, N, N, d.grandTotal, { font: valueFont, fill: XL.blue, align: { horizontal: 'right' }, numFmt: XL_NUM });
        boxRange(row, RIGHT_START, row, N, XL.blueDark);
      }
    }
    fillRange(blockTop, 1, blockTop + bankRows - 1, N - 3, XL.shade);
    if (bank.qrCode) {
      const qr = await imageToExcelMedia(bank.qrCode, 100);
      if (qr) {
        const id = wb.addImage(qr);
        const qrZonePx = widthChars(N - 4, N - 3) * XL_PX_PER_CHAR;
        const qrPx = 76;
        ws.addImage(id, {
          tl: { col: pxToCol(N - 4, Math.max(0, (qrZonePx - qrPx) / 2)), row: blockTop - 1 + 0.3 },
          ext: { width: qrPx, height: qrPx },
          editAs: 'oneCell'
        });
        put(blockTop + 5, N - 4, N - 3, 'SCAN TO PAY', {
          font: { size: 8, bold: true, color: { argb: XL.blue } },
          align: { horizontal: 'center', vertical: 'bottom' },
          fill: XL.shade
        });
      }
    }
    boxRange(blockTop, 1, blockTop + bankRows - 1, N - 3, XL.line);

    // ── 5. Amount in words (left) · For company (right) ──
    row++; ws.getRow(row).height = 8;
    row++; ws.getRow(row).height = 16;
    const wordsTop = row;
    put(row, 1, N - 3, 'AMOUNT IN WORDS', { font: labelFont, fill: XL.shade });
    put(row, RIGHT_START, N, 'For ' + d.companyName, { font: { size: 10, bold: true, color: { argb: XL.ink } }, align: { horizontal: 'center' } });
    row++; ws.getRow(row).height = heightFor(d.amountInWords, widthChars(1, N - 3), 18);
    put(row, 1, N - 3, d.amountInWords, { font: { size: 10.5, bold: true, color: { argb: XL.ink } }, fill: XL.shade, wrap: true });
    for (let r = wordsTop; r <= row; r++) setBorderSides(r, 1, { left: border(XL.blue, 'thick') });

    // ── 6. Terms (left) · signature + seal (right) ──
    row++; ws.getRow(row).height = 8;
    row++; ws.getRow(row).height = 16;
    put(row, 1, N - 3, 'TERMS & CONDITIONS', { font: { size: 8.5, bold: true, color: { argb: XL.line } } });
    const termLines = String(inv.notes || '').replace(/\s+$/, '').split('\n');
    termLines.forEach(t => {
      if (!t && termLines.length === 1) return;
      row++;
      ws.getRow(row).height = heightFor(t, widthChars(1, N - 3), 15);
      put(row, 1, N - 3, t, { font: { size: 9.5, color: { argb: XL.slate } }, wrap: true });
    });
    const signRowsNeeded = 7;
    while (row < wordsTop + signRowsNeeded) { row++; ws.getRow(row).height = 15; }
    const sigLineRow = row;
    put(sigLineRow, RIGHT_START, N, 'Authorised Signatory', {
      font: { size: 9.5, bold: true, color: { argb: XL.muted } },
      align: { horizontal: 'center', vertical: 'bottom' }
    });
    for (let c = RIGHT_START; c <= N; c++) setBorderSides(sigLineRow, c, { top: border(XL.line) });

    // Signature and seal are drawn into ONE transparent image (seal stamped over the
    // signature, both centred) so Excel can never shift one away from the other.
    const loadImage = (src) => new Promise(resolve => {
      if (!src) return resolve(null);
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    });
    const colPx = (c) => Math.round(widths[c - 1] * 7 + 5);
    const rowPx = (r) => (ws.getRow(r).height || 15) * 96 / 72;
    const zoneTopRow = wordsTop + 1;
    let zoneH = 0;
    for (let r = zoneTopRow; r < sigLineRow; r++) zoneH += rowPx(r);
    let zoneW = 0;
    for (let c = RIGHT_START; c <= N; c++) zoneW += colPx(c);
    const [sigImg, sealImg] = await Promise.all([loadImage(d.signatureImage), loadImage(d.companySeal)]);
    if ((sigImg || sealImg) && zoneW > 0 && zoneH > 0) {
      const S = 3;
      const cv = document.createElement('canvas');
      cv.width = Math.round(zoneW * S);
      cv.height = Math.round(zoneH * S);
      const ctx = cv.getContext('2d');
      const cx = cv.width / 2;
      const cy = cv.height / 2;
      const fit = (img, boxW, boxH) => {
        const w = img.naturalWidth || boxW;
        const h = img.naturalHeight || boxH;
        const k = Math.min(boxW / w, boxH / h);
        return { w: w * k, h: h * k };
      };
      if (sigImg) {
        const s = fit(sigImg, Math.min(150, zoneW - 16) * S, 48 * S);
        ctx.drawImage(sigImg, cx - s.w / 2, cy - s.h / 2, s.w, s.h);
      }
      if (sealImg) {
        const box = Math.min(92, Math.max(56, zoneH - 8)) * S;
        const s = fit(sealImg, box, box);
        ctx.globalAlpha = sigImg ? 0.85 : 1;
        ctx.drawImage(sealImg, cx - s.w / 2, cy - s.h / 2, s.w, s.h);
        ctx.globalAlpha = 1;
      }
      const id = wb.addImage({ base64: cv.toDataURL('image/png').split(',')[1], extension: 'png' });
      ws.addImage(id, {
        tl: { col: RIGHT_START - 1, row: zoneTopRow - 1 },
        ext: { width: zoneW, height: zoneH },
        editAs: 'oneCell'
      });
    }

    // ── 7. Thank you ──
    row++; ws.getRow(row).height = 10;
    for (let c = 1; c <= N; c++) setBorderSides(row, c, { bottom: border(XL.line) });
    row++; ws.getRow(row).height = 20;
    put(row, 1, N, 'Thank you for your business!', { font: { size: 12, bold: true, color: { argb: XL.blueDark } }, align: { horizontal: 'center' } });
    row++; ws.getRow(row).height = 14;
    put(row, 1, N, 'Certified that the particulars given above are true and correct. This is a computer generated ' + d.docTitle.toLowerCase() + '.', {
      font: { size: 8.5, color: { argb: XL.line } },
      align: { horizontal: 'center' }
    });

    ws.pageSetup.printArea = 'A1:' + L + row;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = d.fileBase + '.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    return true;
  }

  global.exportSalesInvoiceToPDF = exportSalesInvoiceToPDF;
  global.exportSalesInvoiceToExcel = exportSalesInvoiceToExcel;
})(window);
