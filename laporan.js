/* Laporan Kinerja PATEN: unduh PDF (lewat cetak browser) dan Word (.docx).
   Memakai data terakhir yang tampil di dashboard (window.DATA_TERAKHIR). */
(function () {
  var TEAL = '#0F5E63', OR = '#F08A24';
  var PAL = [TEAL, OR, '#2F8F97', '#F4B26B', '#7FB7BB', '#B85F12', '#CBD5E1'];
  var STC = { Selesai: '#16A34A', Proses: '#F59E0B', Belum: '#DC2626' };
  var BLN_P = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var BLN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var KANTOR = {
    k1: 'KEMENTERIAN AGRARIA DAN TATA RUANG/BADAN PERTANAHAN NASIONAL',
    k2: 'KANTOR PERTANAHAN KABUPATEN HUMBANG HASUNDUTAN',
    k3: 'Jl. Dolok Sanggul – Sidikalang No. 269, Sirisirisi, Doloksanggul 22457 · WA 082273784505 · kab-humbanghasundutan@atrbpn.go.id'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Number(n || 0).toLocaleString('id-ID'); }
  function rpPenuh(n) { return 'Rp' + fmt(n); }
  function pct(a, b) { return b ? (Math.round(a / b * 1000) / 10).toLocaleString('id-ID') + '%' : '0%'; }
  function blnPanjang(s) { var p = s.split('-'); return BLN_P[+p[1] - 1] + ' ' + p[0]; }
  function blnPendek(s) { var p = s.split('-'); return BLN_S[+p[1] - 1] + ' ' + p[0].slice(2); }
  function tglIndo(s) { if (!s) return '–'; var p = String(s).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : s; }

  function periode(d) {
    if (d.bulan) return blnPanjang(d.bulan);
    var b = d.daftarBulan || [];
    return b.length ? 'Semua bulan (' + blnPanjang(b[0]) + ' – ' + blnPanjang(b[b.length - 1]) + ')' : 'Semua bulan';
  }
  function waktuCetak() {
    var t = new Date();
    return t.getDate() + ' ' + BLN_P[t.getMonth()] + ' ' + t.getFullYear() + ', ' +
      String(t.getHours()).padStart(2, '0') + '.' + String(t.getMinutes()).padStart(2, '0') + ' WIB';
  }
  function namaFile(d, ext) { return 'Laporan Kinerja PATEN - ' + (d.bulan ? blnPanjang(d.bulan) : 'Semua bulan') + '.' + ext; }

  function bagian(d) {
    var warga = (d.wargaLk || 0) + (d.wargaPr || 0);
    var layanan = d.layanan.map(function (l, i) { return { label: l.label, n: l.n, color: PAL[i % PAL.length] }; });
    var status = d.statusTemuan.map(function (s) { return { label: s.label, n: s.n, color: STC[s.label] || '#94A3B8' }; });
    var totT = status.reduce(function (a, s) { return a + s.n; }, 0);
    var belum = d.totalDesa - d.desaDikunjungi;
    return {
      warga: warga, totT: totT,
      kalimat: 'Selama periode ini, PATEN melayani ' + fmt(warga) + ' warga dalam ' + fmt(d.kunjungan) + ' kunjungan dan menjangkau ' +
        d.desaDikunjungi + ' dari ' + d.totalDesa + ' desa (' + pct(d.desaDikunjungi, d.totalDesa) + '). ' +
        fmt(d.terbuka.length) + ' temuan lapangan masih menunggu tindak lanjut.',
      kpi: [
        ['Kunjungan desa', fmt(d.kunjungan), 'Setiap Rabu'],
        ['Warga terlayani', fmt(warga), 'Lk ' + fmt(d.wargaLk) + ' · Pr ' + fmt(d.wargaPr)],
        ['Layanan diberikan', fmt(d.layananTotal), d.layanan.length + ' jenis layanan'],
        ['Berkas diterima', fmt(d.berkas), 'Masuk sistem'],
        ['Perkiraan PNBP', rpPenuh(d.pnbp), 'Dari berkas yang diterima'],
        ['Kepuasan warga', d.kepuasan ? String(d.kepuasan).replace('.', ',') + ' / 5' : '–', 'Rata-rata penilaian']
      ],
      donat: [
        { judul: 'Layanan menurut jenis', parts: layanan, tengah: fmt(d.layananTotal), sub: 'layanan' },
        { judul: 'Warga terlayani', parts: [{ label: 'Laki-laki', n: d.wargaLk, color: TEAL }, { label: 'Perempuan', n: d.wargaPr, color: OR }], tengah: fmt(warga), sub: 'warga' },
        { judul: 'Cakupan desa', parts: [{ label: 'Sudah dikunjungi', n: d.desaDikunjungi, color: OR }, { label: 'Belum dikunjungi', n: belum, color: '#CBD5E1' }], tengah: pct(d.desaDikunjungi, d.totalDesa), sub: d.desaDikunjungi + ' dari ' + d.totalDesa + ' desa' },
        { judul: 'Status temuan lapangan', parts: status, tengah: fmt(totT), sub: 'temuan' }
      ]
    };
  }

  /* ---------- Gambar (SVG) ---------- */
  function svgDonat(parts, tengah, sub, ukuran) {
    var tot = parts.reduce(function (a, p) { return a + (p.n || 0); }, 0), r = 60, sw = 22, a0 = -Math.PI / 2, isi = '';
    parts.forEach(function (p) {
      if (!p.n || !tot) return;
      var a1 = a0 + 2 * Math.PI * p.n / tot;
      if (p.n === tot) isi += '<circle cx="75" cy="75" r="60" fill="none" stroke="' + p.color + '" stroke-width="' + sw + '"/>';
      else {
        var x0 = 75 + r * Math.cos(a0), y0 = 75 + r * Math.sin(a0), x1 = 75 + r * Math.cos(a1), y1 = 75 + r * Math.sin(a1);
        isi += '<path d="M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + 'A60 60 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + '" fill="none" stroke="' + p.color + '" stroke-width="' + sw + '"/>';
      }
      a0 = a1;
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + ukuran + '" height="' + ukuran + '" viewBox="0 0 150 150">' +
      '<circle cx="75" cy="75" r="60" fill="none" stroke="#EEF2F6" stroke-width="22"/>' + isi +
      '<text x="75" y="76" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="' + (String(tengah).length > 6 ? 19 : 24) + '" font-weight="800" fill="' + TEAL + '">' + esc(tengah) + '</text>' +
      '<text x="75" y="95" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="10.5" fill="#64748B">' + esc(sub) + '</text></svg>';
  }
  function svgBatang(perBulan, w, h) {
    var pb = perBulan.slice(-6);
    if (!pb.length) return '';
    var mx = Math.max.apply(null, pb.map(function (x) { return x.warga; }).concat([1]));
    var lebar = w / pb.length, isi = '';
    pb.forEach(function (x, i) {
      var tb = Math.round(x.warga / mx * (h - 44)), cx = i * lebar + lebar / 2, bw = Math.min(lebar * 0.7, 56);
      isi += '<rect x="' + (cx - bw / 2) + '" y="' + (h - 22 - tb) + '" width="' + bw + '" height="' + tb + '" rx="4" fill="' + OR + '"/>' +
        '<text x="' + cx + '" y="' + (h - 27 - tb) + '" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" fill="' + TEAL + '">' + fmt(x.warga) + '</text>' +
        '<text x="' + cx + '" y="' + (h - 6) + '" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" fill="#64748B">' + blnPendek(x.bulan) + '</text>';
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + isi + '</svg>';
  }
  function svgLogo(w) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + Math.round(w * 88 / 240) + '" viewBox="0 0 240 88">' +
      '<text x="4" y="72" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="' + TEAL + '">P</text>' +
      '<path d="M50 74L76 20L102 74" fill="none" stroke="' + OR + '" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<rect x="68" y="56" width="16" height="18" rx="2" fill="' + TEAL + '"/>' +
      '<text x="108" y="72" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800" fill="' + TEAL + '">TEN</text></svg>';
  }

  /* ---------- PDF (cetak) ---------- */
  var CSS = '@page{size:A4;margin:12mm 14mm 16mm}' +
    '#cetak{font-family:Inter,Arial,sans-serif;color:#1E293B;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '#cetak *{box-sizing:border-box}#cetak .sec{display:flex;flex-direction:column;gap:4.5mm}#cetak .pb{break-before:page}' +
    '#cetak .kop{display:flex;align-items:center;gap:5mm;padding-bottom:3mm;border-bottom:2.5px solid ' + TEAL + '}' +
    '#cetak .k1{font-size:8.5pt;font-weight:600}#cetak .k2{font-size:12.5pt;font-weight:800;color:' + TEAL + '}#cetak .k3{font-size:7.5pt;color:#475569;margin-top:1mm}' +
    '#cetak h1{margin:0;font-size:19pt;color:' + TEAL + '}#cetak .per{font-size:9.5pt;color:#475569;margin-top:1mm}#cetak .per b{color:#1E293B}' +
    '#cetak .ring{background:#F1F5F9;border-left:3px solid ' + OR + ';padding:3mm 4mm;font-size:10pt;line-height:1.5}' +
    '#cetak .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}#cetak .kpi div{border:1px solid #E2E8F0;border-radius:2.5mm;padding:3mm 3.5mm}' +
    '#cetak .kpi small{display:block;font-size:8pt;color:#64748B}#cetak .kpi b{display:block;font-size:16pt;color:' + TEAL + ';margin-top:.5mm}#cetak .kpi span{font-size:7.5pt;color:#8A4A0B;font-weight:600}' +
    '#cetak .g2{display:grid;grid-template-columns:1fr 1fr;gap:4mm}' +
    '#cetak .card{border:1px solid #E2E8F0;border-radius:2.5mm;padding:3.5mm 4mm;display:flex;flex-direction:column;gap:2mm;break-inside:avoid}' +
    '#cetak .card h2{margin:0;font-size:10.5pt;color:' + TEAL + '}#cetak .dn{display:flex;align-items:center;gap:4mm}#cetak .dn svg{flex:none}' +
    '#cetak table{min-width:0;width:auto}#cetak td,#cetak th{border-bottom:0}' +
    '#cetak table.lg{border-collapse:collapse;font-size:7.8pt;flex:1}#cetak table.lg td{padding:.7mm 0;border:0}#cetak table.lg td:first-child{white-space:nowrap}' +
    '#cetak table.lg i{display:inline-block;width:2.6mm;height:2.6mm;border-radius:.6mm;margin-right:1.5mm;vertical-align:-.3mm}' +
    '#cetak .n{text-align:right;font-weight:700;padding-left:2mm}#cetak .p{text-align:right;color:#64748B;padding-left:2mm}' +
    '#cetak table.t{width:100%;min-width:0;border-collapse:collapse;font-size:8.5pt}#cetak table.t th{background:' + TEAL + ';color:#fff;text-align:left;padding:1.8mm 2mm;font-weight:600}' +
    '#cetak table.t td{padding:1.6mm 2mm;border-bottom:1px solid #E2E8F0;vertical-align:top}#cetak table.t tr{break-inside:avoid}#cetak thead{display:table-header-group}' +
    '#cetak .chip{font-size:7.5pt;font-weight:700;padding:.6mm 2mm;border-radius:5mm}#cetak .cb{background:#FEE2E2;color:#991B1B}#cetak .cp{background:#FEF3C7;color:#92400E}#cetak .cs{background:#DCFCE7;color:#166534}' +
    '#cetak .note{font-size:8pt;color:#64748B;font-style:italic}' +
    '#cetak .foot{margin-top:4mm;font-size:7.5pt;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:2mm}' +
    '@media screen{#cetak{display:none}}@media print{body>*:not(#cetak){display:none!important}#cetak{display:block}body{background:#fff!important}}';

  function legendaHTML(parts) {
    var tot = parts.reduce(function (a, p) { return a + (p.n || 0); }, 0);
    return parts.map(function (p) {
      return '<tr><td><i style="background:' + p.color + '"></i>' + esc(p.label) + '</td><td class="n">' + fmt(p.n) + '</td><td class="p">' + pct(p.n, tot) + '</td></tr>';
    }).join('');
  }

  function htmlLaporan(d, sertakanDesa) {
    var b = bagian(d), cetak = waktuCetak();
    var kop = '<div class="kop">' + svgLogo(96) + '<div><div class="k1">' + KANTOR.k1 + '</div><div class="k2">' + KANTOR.k2 + '</div><div class="k3">' + esc(KANTOR.k3) + '</div></div></div>';
    var kpi = b.kpi.map(function (k) { return '<div><small>' + k[0] + '</small><b>' + esc(k[1]) + '</b><span>' + esc(k[2]) + '</span></div>'; }).join('');
    var donat = b.donat.map(function (x) {
      return '<div class="card"><h2>' + x.judul + '</h2><div class="dn">' + svgDonat(x.parts, x.tengah, x.sub, 118) + '<table class="lg">' + legendaHTML(x.parts) + '</table></div></div>';
    }).join('');
    var kec = (d.perKecamatan || []).map(function (k) { return '<tr><td>' + esc(k.label) + '</td><td style="text-align:right;font-weight:700">' + fmt(k.n) + '</td></tr>'; }).join('') ||
      '<tr><td colspan="2" class="note">Belum ada kunjungan.</td></tr>';
    var chip = { Belum: 'cb', Proses: 'cp', Selesai: 'cs' };
    var tem = d.terbuka.map(function (t) {
      return '<tr><td>' + tglIndo(t.tgl) + '</td><td>' + esc(t.desa) + '</td><td>' + esc(t.temuan) + '</td><td>' + esc(t.tindak || '–') + '</td><td><span class="chip ' + (chip[t.status] || 'cb') + '">' + esc(t.status || 'Belum') + '</span></td></tr>';
    }).join('') || '<tr><td colspan="5" class="note">Tidak ada temuan yang menunggu tindak lanjut.</td></tr>';
    var desa = sertakanDesa
      ? '<table class="t"><thead><tr><th>Desa</th><th>Kecamatan</th><th style="text-align:right">Kunjungan</th><th style="text-align:right">Warga</th><th style="text-align:right">Berkas</th><th>Terakhir</th></tr></thead><tbody>' +
        d.perDesa.map(function (x) {
          return '<tr><td>' + esc(x.desa) + '</td><td>' + esc(x.kecamatan) + '</td><td style="text-align:right">' + fmt(x.kunjungan) + '</td><td style="text-align:right">' + fmt(x.warga) + '</td><td style="text-align:right">' + fmt(x.berkas) + '</td><td>' + (x.kunjungan ? tglIndo(x.terakhir) : 'Belum dikunjungi') + '</td></tr>';
        }).join('') + '</tbody></table>'
      : '<div class="note">Daftar nama desa tidak dicantumkan karena disembunyikan di dashboard saat laporan diunduh. Buka "Lihat rekap per desa" di dashboard sebelum mengunduh untuk menyertakannya.</div>';
    var foot = '<div class="foot">Laporan Kinerja PATEN · dicetak dari Dashboard PATEN, ' + cetak + ' · data diperbarui ' + esc(d.diperbarui) + '</div>';
    return '<style>' + CSS + '</style>' +
      '<div class="sec">' + kop +
      '<div><h1>Laporan Kinerja PATEN</h1><div class="per">Pelayanan pertanahan di desa setiap hari Rabu · Periode: <b>' + esc(periode(d)) + '</b></div></div>' +
      '<div class="ring">' + esc(b.kalimat) + '</div><div class="kpi">' + kpi + '</div><div class="g2">' + donat + '</div>' + foot + '</div>' +
      '<div class="sec pb">' + kop +
      '<div class="g2"><div class="card"><h2>Warga terlayani per bulan</h2>' + (svgBatang(d.perBulan || [], 300, 170) || '<div class="note">Belum ada data.</div>') + '</div>' +
      '<div class="card"><h2>Kunjungan per kecamatan</h2><table class="t"><thead><tr><th>Kecamatan</th><th style="text-align:right">Kunjungan</th></tr></thead><tbody>' + kec + '</tbody></table></div></div>' +
      '<div class="card"><h2>Temuan lapangan yang belum selesai</h2><table class="t"><thead><tr><th style="width:21mm">Tanggal</th><th style="width:27mm">Desa</th><th>Temuan</th><th>Tindak lanjut</th><th style="width:17mm">Status</th></tr></thead><tbody>' + tem + '</tbody></table></div>' +
      '<div class="card" style="break-inside:auto"><h2>Rekap per desa</h2>' + desa + '</div>' + foot + '</div>';
  }

  function unduhPDF() {
    var d = window.DATA_TERAKHIR; if (!d) return;
    var box = document.getElementById('cetak');
    if (!box) { box = document.createElement('div'); box.id = 'cetak'; document.body.appendChild(box); }
    box.innerHTML = htmlLaporan(d, !!window.LIHAT_DESA);
    var judulLama = document.title;
    document.title = namaFile(d, 'pdf').replace(/\.pdf$/, '');
    var kembali = function () { document.title = judulLama; window.removeEventListener('afterprint', kembali); };
    window.addEventListener('afterprint', kembali);
    setTimeout(function () { window.print(); setTimeout(kembali, 1500); }, 150);
  }

  /* ---------- Word (.docx) ---------- */
  function muatDocx() {
    return new Promise(function (ok, gagal) {
      if (window.docx) return ok(window.docx);
      var s = document.createElement('script'); s.src = 'vendor/docx.umd.js';
      s.onload = function () { window.docx ? ok(window.docx) : gagal(new Error('Pustaka Word tidak termuat.')); };
      s.onerror = function () { gagal(new Error('Pustaka Word gagal dimuat. Periksa sinyal.')); };
      document.head.appendChild(s);
    });
  }
  function svgKePng(svg, w, h) {
    return new Promise(function (ok, gagal) {
      var img = new Image(), skala = 2;
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = w * skala; c.height = h * skala;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { b ? b.arrayBuffer().then(ok) : gagal(new Error('Gambar gagal dibuat.')); }, 'image/png');
      };
      img.onerror = function () { gagal(new Error('Gambar gagal dibuat.')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  function unduhWord(tombol) {
    var d = window.DATA_TERAKHIR; if (!d) return;
    var teksLama = tombol.textContent; tombol.disabled = true; tombol.textContent = 'Menyiapkan…';
    var selesai = function () { tombol.disabled = false; tombol.textContent = teksLama; };
    var b = bagian(d), sertakanDesa = !!window.LIHAT_DESA;
    var gambar = [svgKePng(svgLogo(240), 240, 88)].concat(b.donat.map(function (x) { return svgKePng(svgDonat(x.parts, x.tengah, x.sub, 150), 150, 150); }));
    var batang = svgBatang(d.perBulan || [], 520, 200);
    if (batang) gambar.push(svgKePng(batang, 520, 200));
    Promise.all([muatDocx()].concat(gambar)).then(function (hasil) {
      var X = hasil[0], logo = hasil[1], donat = hasil.slice(2, 6), gbBatang = batang ? hasil[6] : null;
      var P = X.Paragraph, R = X.TextRun, T = X.Table, TR = X.TableRow, TC = X.TableCell, W = X.WidthType, SH = X.ShadingType, AL = X.AlignmentType, BS = X.BorderStyle;
      var LEBAR = 9906; // A4 dengan margin 1000 dxa kiri-kanan
      var tanpaGaris = { top: { style: BS.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BS.NONE, size: 0, color: 'FFFFFF' }, left: { style: BS.NONE, size: 0, color: 'FFFFFF' }, right: { style: BS.NONE, size: 0, color: 'FFFFFF' } };
      var garis = { style: BS.SINGLE, size: 4, color: 'E2E8F0' };
      var kotak = { top: garis, bottom: garis, left: garis, right: garis };
      var teks = function (s, o) { o = o || {}; return new R({ text: String(s), bold: o.b, size: o.sz || 20, color: o.c, italics: o.i, font: 'Arial' }); };
      var par = function (isi, o) { o = o || {}; return new P({ children: [].concat(isi), spacing: { before: o.sb || 0, after: o.sa == null ? 120 : o.sa }, alignment: o.al, shading: o.sh, border: o.bd }); };
      var sel = function (isi, w, o) { o = o || {}; return new TC({ children: [].concat(isi), width: { size: w, type: W.DXA }, shading: o.fill ? { fill: o.fill, type: SH.CLEAR, color: 'auto' } : undefined, borders: o.borders || kotak, margins: { top: 80, bottom: 80, left: 110, right: 110 }, verticalAlign: o.va }); };
      var tabel = function (lebar, baris) { return new T({ width: { size: LEBAR, type: W.DXA }, columnWidths: lebar, rows: baris }); };
      var judulTabel = function (kolom, lebar, kanan) {
        return new TR({ tableHeader: true, children: kolom.map(function (k, i) { return sel(par(teks(k, { b: true, c: 'FFFFFF', sz: 17 }), { sa: 0, al: kanan && kanan.indexOf(i) >= 0 ? AL.RIGHT : undefined }), lebar[i], { fill: '0F5E63' }); }) });
      };
      var barisData = function (isi, lebar, kanan) {
        return new TR({ children: isi.map(function (s, i) { return sel(par(teks(s, { sz: 17 }), { sa: 0, al: kanan && kanan.indexOf(i) >= 0 ? AL.RIGHT : undefined }), lebar[i]); }) });
      };
      var h2 = function (s) { return new P({ children: [teks(s, { b: true, sz: 24, c: '0F5E63' })], spacing: { before: 240, after: 100 }, keepNext: true, keepLines: true }); };

      var kop = [
        tabel([2300, LEBAR - 2300], [new TR({ children: [
          sel(new P({ children: [new X.ImageRun({ type: 'png', data: logo, transformation: { width: 110, height: 40 } })] }), 2300, { borders: tanpaGaris, va: X.VerticalAlign.CENTER }),
          sel([par(teks(KANTOR.k1, { b: true, sz: 16 }), { sa: 0 }), par(teks(KANTOR.k2, { b: true, sz: 24, c: '0F5E63' }), { sa: 0 }), par(teks(KANTOR.k3, { sz: 14, c: '475569' }), { sa: 0 })], LEBAR - 2300, { borders: tanpaGaris })
        ] })]),
        par([], { sa: 120, bd: { bottom: { style: BS.SINGLE, size: 18, color: '0F5E63', space: 1 } } })
      ];
      var kpiBaris = [0, 3].map(function (m) {
        return new TR({ children: b.kpi.slice(m, m + 3).map(function (k) {
          return sel([par(teks(k[0], { sz: 16, c: '64748B' }), { sa: 20 }), par(teks(k[1], { b: true, sz: 30, c: '0F5E63' }), { sa: 20 }), par(teks(k[2], { sz: 15, b: true, c: '8A4A0B' }), { sa: 0 })], Math.floor(LEBAR / 3));
        }) });
      });
      var selDonat = function (i) {
        var x = b.donat[i], tot = x.parts.reduce(function (a, p) { return a + (p.n || 0); }, 0);
        return sel([par(teks(x.judul, { b: true, sz: 20, c: '0F5E63' }), { sa: 60 }),
          new P({ alignment: AL.CENTER, children: [new X.ImageRun({ type: 'png', data: donat[i], transformation: { width: 130, height: 130 } })], spacing: { after: 60 } })]
          .concat(x.parts.map(function (p) { return par([teks('■ ', { c: p.color.replace('#', ''), sz: 18 }), teks(p.label + ': ', { sz: 17 }), teks(fmt(p.n), { b: true, sz: 17 }), teks(' (' + pct(p.n, tot) + ')', { sz: 15, c: '64748B' })], { sa: 20 }); })), Math.floor(LEBAR / 2));
      };
      var lebarKec = [LEBAR - 2200, 2200];
      var lebarTem = [1300, 1700, 2900, 2806, 1200];
      var lebarDesa = [2000, 1900, 1300, 1200, 1200, 2306];
      var anak = [].concat(kop, [
        par(teks('Laporan Kinerja PATEN', { b: true, sz: 36, c: '0F5E63' }), { sa: 40 }),
        par([teks('Pelayanan pertanahan di desa setiap hari Rabu · Periode: ', { sz: 19, c: '475569' }), teks(periode(d), { b: true, sz: 19 })], { sa: 160 }),
        par(teks(b.kalimat, { sz: 20 }), { sa: 200, sh: { fill: 'F1F5F9', type: SH.CLEAR, color: 'auto' }, bd: { left: { style: BS.SINGLE, size: 18, color: 'F08A24', space: 6 } } }),
        tabel([3302, 3302, 3302], kpiBaris),
        h2('Grafik'),
        tabel([4953, 4953], [new TR({ children: [selDonat(0), selDonat(1)] }), new TR({ children: [selDonat(2), selDonat(3)] })]),
        h2('Warga terlayani per bulan'),
        gbBatang ? new P({ alignment: AL.CENTER, children: [new X.ImageRun({ type: 'png', data: gbBatang, transformation: { width: 520, height: 200 } })] }) : par(teks('Belum ada data.', { i: true, c: '64748B' })),
        h2('Kunjungan per kecamatan'),
        tabel(lebarKec, [judulTabel(['Kecamatan', 'Kunjungan'], lebarKec, [1])].concat((d.perKecamatan || []).map(function (k) { return barisData([k.label, fmt(k.n)], lebarKec, [1]); }))),
        h2('Temuan lapangan yang belum selesai'),
        d.terbuka.length
          ? tabel(lebarTem, [judulTabel(['Tanggal', 'Desa', 'Temuan', 'Tindak lanjut', 'Status'], lebarTem)].concat(d.terbuka.map(function (t) { return barisData([tglIndo(t.tgl), t.desa, t.temuan, t.tindak || '–', t.status || 'Belum'], lebarTem); })))
          : par(teks('Tidak ada temuan yang menunggu tindak lanjut.', { i: true, c: '64748B' })),
        h2('Rekap per desa'),
        sertakanDesa
          ? tabel(lebarDesa, [judulTabel(['Desa', 'Kecamatan', 'Kunjungan', 'Warga', 'Berkas', 'Terakhir'], lebarDesa, [2, 3, 4])].concat(d.perDesa.map(function (x) { return barisData([x.desa, x.kecamatan, fmt(x.kunjungan), fmt(x.warga), fmt(x.berkas), x.kunjungan ? tglIndo(x.terakhir) : 'Belum dikunjungi'], lebarDesa, [2, 3, 4]); })))
          : par(teks('Daftar nama desa tidak dicantumkan karena disembunyikan di dashboard saat laporan diunduh. Buka "Lihat rekap per desa" di dashboard sebelum mengunduh untuk menyertakannya.', { i: true, sz: 17, c: '64748B' })),
        par(teks('Laporan Kinerja PATEN · dicetak dari Dashboard PATEN, ' + waktuCetak() + ' · data diperbarui ' + d.diperbarui, { sz: 15, c: '94A3B8' }), { sb: 300 })
      ]);
      var doc = new X.Document({
        creator: 'Dashboard PATEN', title: 'Laporan Kinerja PATEN',
        styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
        sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } }, children: anak }]
      });
      return X.Packer.toBlob(doc);
    }).then(function (blob) {
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = namaFile(d, 'docx');
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      selesai();
    }).catch(function (e) { selesai(); alert('Laporan Word belum dapat dibuat. ' + (e && e.message ? e.message : '')); });
  }

  window.PATEN_LAPORAN = { unduhPDF: unduhPDF, unduhWord: unduhWord, htmlLaporan: htmlLaporan };
})();
