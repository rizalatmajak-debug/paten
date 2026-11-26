/**
 * SISTEM PELAPORAN PATEN
 * Aplikasi web untuk laporan kunjungan PATEN dan dashboard pimpinan.
 * Menempel pada Google Sheet "Sistem Pelaporan PATEN" (tab Data, Daftar Desa, Pengaturan).
 */

const CFG = {
  SHEET_DATA: 'Data',
  SHEET_DESA: 'Daftar Desa',
  SHEET_SET: 'Pengaturan',
  FOLDER_FOTO: 'PATEN - Foto Kegiatan',
  FOLDER_ARSIP: 'PATEN - Arsip Bulanan',
  KOLOM: 23, // A sampai W
  LAYANAN: ['Konsultasi', 'Informasi PTSL', 'Pengecekan Sertipikat', 'Peralihan Hak',
            'Pemeliharaan Data', 'Pengaduan/Sengketa', 'Layanan Lainnya'],
  MAKS_DESA: 400
};

/* Desa/kelurahan Kabupaten Humbang Hasundutan (kode wilayah Kemendagri 12.16), 154 wilayah. */
const DESA_HUMBAHAS = [
  ['Doloksanggul', 'Aek Lung'],
  ['Doloksanggul', 'Bonanionan'],
  ['Doloksanggul', 'Hutabagasan'],
  ['Doloksanggul', 'Hutagurgur'],
  ['Doloksanggul', 'Hutaraja'],
  ['Doloksanggul', 'Janji'],
  ['Doloksanggul', 'Lumban Purba'],
  ['Doloksanggul', 'Lumban Tobing'],
  ['Doloksanggul', 'Matiti I'],
  ['Doloksanggul', 'Matiti II'],
  ['Doloksanggul', 'Pakkat'],
  ['Doloksanggul', 'Parik Sinomba'],
  ['Doloksanggul', 'Pasar Doloksanggul (Kelurahan)'],
  ['Doloksanggul', 'Pasaribu'],
  ['Doloksanggul', 'Purba Dolok'],
  ['Doloksanggul', 'Purba Manalu'],
  ['Doloksanggul', 'Saitnihuta'],
  ['Doloksanggul', 'Sampean'],
  ['Doloksanggul', 'Sigala Gala'],
  ['Doloksanggul', 'Sihite I'],
  ['Doloksanggul', 'Sihite II'],
  ['Doloksanggul', 'Sileang'],
  ['Doloksanggul', 'Simangaronsang'],
  ['Doloksanggul', 'Simarigung'],
  ['Doloksanggul', 'Sirisirisi'],
  ['Doloksanggul', 'Sosor Gonting'],
  ['Doloksanggul', 'Sosor Tambok'],
  ['Doloksanggul', 'Sosortolong Sihite III'],
  ['Parlilitan', 'Baringin'],
  ['Parlilitan', 'Baringin Natam'],
  ['Parlilitan', 'Janji Hutanapa'],
  ['Parlilitan', 'Pusuk I'],
  ['Parlilitan', 'Pusuk II Simaninggir'],
  ['Parlilitan', 'Sihotang Hasugian Dolok I'],
  ['Parlilitan', 'Sihotang Hasugian Dolok II'],
  ['Parlilitan', 'Sihotang Hasugian Habinsaran'],
  ['Parlilitan', 'Sihotang Hasugian Tonga'],
  ['Parlilitan', 'Simataniari'],
  ['Parlilitan', 'Sionom Hudon Julu'],
  ['Parlilitan', 'Sionom Hudon Runggu'],
  ['Parlilitan', 'Sionom Hudon Selatan'],
  ['Parlilitan', 'Sionom Hudon Sibulbulon'],
  ['Parlilitan', 'Sionom Hudon Timur'],
  ['Parlilitan', 'Sionom Hudon Timur II'],
  ['Parlilitan', 'Sionom Hudon Tonga'],
  ['Parlilitan', 'Sionom Hudon Toruan'],
  ['Parlilitan', 'Sionom Hudon Utara'],
  ['Parlilitan', 'Sionom Hudon VII'],
  ['Pollung', 'Aek Nauli I'],
  ['Pollung', 'Aek Nauli II'],
  ['Pollung', 'Hutajulu'],
  ['Pollung', 'Hutapaung'],
  ['Pollung', 'Hutapaung Utara'],
  ['Pollung', 'Pandumaan'],
  ['Pollung', 'Pansurbatu'],
  ['Pollung', 'Pardomuan'],
  ['Pollung', 'Parsingguran I'],
  ['Pollung', 'Parsingguran II'],
  ['Pollung', 'Pollung'],
  ['Pollung', 'Ria-Ria'],
  ['Pollung', 'Sipituhuta'],
  ['Baktiraja', 'Marbun Tonga Marbun Dolok'],
  ['Baktiraja', 'Marbun Toruan'],
  ['Baktiraja', 'Simamora'],
  ['Baktiraja', 'Simangulampe'],
  ['Baktiraja', 'Sinambela'],
  ['Baktiraja', 'Siunong-Unong Julu'],
  ['Baktiraja', 'Tipang'],
  ['Paranginan', 'Lobutolong'],
  ['Paranginan', 'Lobutolong Habinsaran'],
  ['Paranginan', 'Lumban Barat'],
  ['Paranginan', 'Lumban Sialaman'],
  ['Paranginan', 'Lumban Sianturi'],
  ['Paranginan', 'Paranginan Selatan'],
  ['Paranginan', 'Paranginan Utara'],
  ['Paranginan', 'Pearung'],
  ['Paranginan', 'Pearung Silali'],
  ['Paranginan', 'Siboru Torop'],
  ['Paranginan', 'Sihonongan'],
  ['Lintong Nihuta', 'Bonan Dolok'],
  ['Lintong Nihuta', 'Dolok Margu'],
  ['Lintong Nihuta', 'Habeahan'],
  ['Lintong Nihuta', 'Hutasoit I'],
  ['Lintong Nihuta', 'Hutasoit II'],
  ['Lintong Nihuta', 'Lobutua'],
  ['Lintong Nihuta', 'Nagasaribu I'],
  ['Lintong Nihuta', 'Nagasaribu II'],
  ['Lintong Nihuta', 'Nagasaribu III'],
  ['Lintong Nihuta', 'Nagasaribu IV'],
  ['Lintong Nihuta', 'Nagasaribu V'],
  ['Lintong Nihuta', 'Pargaulan'],
  ['Lintong Nihuta', 'Parulohan'],
  ['Lintong Nihuta', 'Sibuntuon Parpea'],
  ['Lintong Nihuta', 'Sibuntuon Partur'],
  ['Lintong Nihuta', 'Sigompul'],
  ['Lintong Nihuta', 'Sigumpar'],
  ['Lintong Nihuta', 'Siharjulu'],
  ['Lintong Nihuta', 'Siponjot'],
  ['Lintong Nihuta', 'Sitio II'],
  ['Lintong Nihuta', 'Sitolu Bahal'],
  ['Lintong Nihuta', 'Tapian Nauli'],
  ['Sijamapolang', 'Batu Nagajar'],
  ['Sijamapolang', 'Bonan Dolok I'],
  ['Sijamapolang', 'Bonan Dolok II'],
  ['Sijamapolang', 'Hutaginjang'],
  ['Sijamapolang', 'Nagurguran'],
  ['Sijamapolang', 'Sanggaran I'],
  ['Sijamapolang', 'Siborboron'],
  ['Sijamapolang', 'Sibuntuon'],
  ['Sijamapolang', 'Sigulok'],
  ['Sijamapolang', 'Sitapongan'],
  ['Onan Ganjang', 'Aek Godang Arbaan'],
  ['Onan Ganjang', 'Batu Nagodang Siatas'],
  ['Onan Ganjang', 'Hutajulu'],
  ['Onan Ganjang', 'Janji Nagodang'],
  ['Onan Ganjang', 'Onan Ganjang'],
  ['Onan Ganjang', 'Parbotihan'],
  ['Onan Ganjang', 'Parnapa'],
  ['Onan Ganjang', 'Sampetua'],
  ['Onan Ganjang', 'Sanggaran II'],
  ['Onan Ganjang', 'Sibuluan'],
  ['Onan Ganjang', 'Sigalogo'],
  ['Onan Ganjang', 'Sihikkit'],
  ['Pakkat', 'Ambobi Paranginan'],
  ['Pakkat', 'Banuarea'],
  ['Pakkat', 'Hauagong'],
  ['Pakkat', 'Karya'],
  ['Pakkat', 'Lumban Tonga-Tonga'],
  ['Pakkat', 'Manalu'],
  ['Pakkat', 'Pakkat Hauagong'],
  ['Pakkat', 'Panggugunan'],
  ['Pakkat', 'Parmonangan'],
  ['Pakkat', 'Peadungdung'],
  ['Pakkat', 'Pulo Godang'],
  ['Pakkat', 'Purba Baringin'],
  ['Pakkat', 'Purba Bersatu'],
  ['Pakkat', 'Purba Sianjur'],
  ['Pakkat', 'Rura Aek Sopang'],
  ['Pakkat', 'Rura Tanjung'],
  ['Pakkat', 'Siambaton'],
  ['Pakkat', 'Siambaton Pahae'],
  ['Pakkat', 'Sijarango'],
  ['Pakkat', 'Sijarango I'],
  ['Pakkat', 'Sipagabu'],
  ['Pakkat', 'Tukka Dolok'],
  ['Tarabintang', 'Marpadan'],
  ['Tarabintang', 'Mungkur'],
  ['Tarabintang', 'Sibongkare'],
  ['Tarabintang', 'Sibongkare Sianju'],
  ['Tarabintang', 'Sihombu'],
  ['Tarabintang', 'Sihotang Hasugian Toruan'],
  ['Tarabintang', 'Simbara'],
  ['Tarabintang', 'Sitanduk'],
  ['Tarabintang', 'Tarabintang']
];

/* ---------- Halaman web ---------- */

function doGet(e) {
  const page = (e && e.parameter && e.parameter.p) === 'dashboard' ? 'Dashboard' : 'Formulir';
  const t = HtmlService.createTemplateFromFile(page);
  t.appUrl = ScriptApp.getService().getUrl();
  return t.evaluate()
    .setTitle(page === 'Dashboard' ? 'Dashboard PATEN' : 'Laporan PATEN')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/* ---------- API untuk aplikasi HP di GitHub Pages ---------- */

function doPost(e) {
  let out;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = jalankanApi_(req);
  } catch (err) {
    out = { apiError: true, pesan: 'Permintaan tidak dapat diproses: ' + err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function jalankanApi_(req) {
  const args = Array.isArray(req.args) ? req.args : [];
  if (req.fn === 'getDashboard') return { hasil: getDashboard(args[0], args[1]) };
  if (req.fn !== 'getReferensi' && req.fn !== 'kirimLaporan') return { apiError: true, pesan: 'Fungsi tidak dikenal.' };
  const kode = PropertiesService.getScriptProperties().getProperty('KODE_PETUGAS');
  if (kode && String(req.kode || '').trim() !== kode) return { perluKode: true };
  return { hasil: req.fn === 'getReferensi' ? getReferensi() : kirimLaporan(args[0] || {}) };
}

function aturKodePetugas() {
  const ui = SpreadsheetApp.getUi();
  const lama = PropertiesService.getScriptProperties().getProperty('KODE_PETUGAS');
  const r = ui.prompt('Kode petugas',
    'Kode ini diminta sekali saat petugas pertama kali membuka aplikasi di HP.\n' +
    (lama ? 'Kode sekarang: ' + lama + '\n' : 'Belum ada kode (siapa pun bisa mengirim laporan).\n') +
    'Isi 4 sampai 20 huruf/angka. Kosongkan untuk menghapus kode.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const kode = r.getResponseText().trim();
  const props = PropertiesService.getScriptProperties();
  if (!kode) { props.deleteProperty('KODE_PETUGAS'); ui.alert('Kode petugas dihapus.'); return; }
  if (!/^[A-Za-z0-9]{4,20}$/.test(kode)) { ui.alert('Kode harus 4 sampai 20 huruf atau angka, tanpa spasi.'); return; }
  props.setProperty('KODE_PETUGAS', kode);
  ui.alert('Kode petugas tersimpan: ' + kode + '\n\nBagikan kode ini hanya kepada petugas PATEN.');
}

/* ---------- Menu di Google Sheet ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('PATEN')
    .addItem('1. Pasang sistem (sekali saja)', 'pasangSistem')
    .addItem('2. Atur PIN dashboard', 'aturPin')
    .addItem('3. Atur kode petugas', 'aturKodePetugas')
    .addItem('Isi ulang daftar desa Humbang Hasundutan', 'isiDaftarDesa')
    .addItem('Perbaiki rumus Rekap Desa', 'perbaikiRekapDesa')
    .addSeparator()
    .addItem('Tampilkan tautan aplikasi', 'tampilkanTautan')
    .addItem('Arsipkan sekarang', 'arsipBulanan')
    .addToUi();
}

function pasangSistem() {
  const ui = SpreadsheetApp.getUi();
  folder_(CFG.FOLDER_FOTO);
  folder_(CFG.FOLDER_ARSIP);
  const b5 = String(SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_DESA).getRange('B5').getValue());
  if (!b5.trim() || b5.indexOf('[') === 0) isiDaftarDesa_();
  siapkanRekapDesa_();
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'arsipBulanan'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('arsipBulanan').timeBased().onMonthDay(1).atHour(6).create();
  const cek = cekTabData_();
  ui.alert('Sistem PATEN terpasang',
    'Folder foto dan arsip sudah dibuat, dan arsip otomatis dijadwalkan setiap tanggal 1.\n\n' +
    (cek ? 'Perhatian: ' + cek + '\n\n' : '') +
    'Langkah berikutnya: Terapkan > Penerapan baru > Aplikasi web, lalu buka menu PATEN > Tampilkan tautan aplikasi.',
    ui.ButtonSet.OK);
}

function aturPin() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('PIN dashboard',
    'Masukkan 4 sampai 8 angka. Kosongkan untuk membuka dashboard tanpa PIN.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pin = r.getResponseText().trim();
  const props = PropertiesService.getScriptProperties();
  if (!pin) { props.deleteProperty('DASHBOARD_PIN'); ui.alert('Dashboard dapat dibuka tanpa PIN.'); return; }
  if (!/^\d{4,8}$/.test(pin)) { ui.alert('PIN harus 4 sampai 8 angka.'); return; }
  props.setProperty('DASHBOARD_PIN', pin);
  ui.alert('PIN dashboard tersimpan.');
}

function tampilkanTautan() {
  const url = ScriptApp.getService().getUrl();
  const ui = SpreadsheetApp.getUi();
  if (!url) { ui.alert('Aplikasi web belum diterapkan. Pilih Terapkan > Penerapan baru > Aplikasi web.'); return; }
  ui.alert('Tautan aplikasi PATEN',
    'Formulir petugas:\n' + url + '\n\nDashboard pimpinan:\n' + url + '?p=dashboard', ui.ButtonSet.OK);
}

/* ---------- Data untuk formulir ---------- */

function getReferensi() {
  const ss = SpreadsheetApp.getActive();
  const desa = ss.getSheetByName(CFG.SHEET_DESA).getRange(5, 1, CFG.MAKS_DESA, 2).getValues()
    .filter(function (r) { return String(r[1]).trim() !== ''; })
    .map(function (r) { return { kecamatan: String(r[0]).trim(), desa: String(r[1]).trim() }; });
  const status = ss.getSheetByName(CFG.SHEET_SET).getRange('A8:A10').getValues()
    .map(function (r) { return String(r[0]).trim(); }).filter(String);
  return { desa: desa, status: status.length ? status : ['Belum', 'Proses', 'Selesai'], layanan: CFG.LAYANAN };
}

/* ---------- Menyimpan laporan ---------- */

function kirimLaporan(lap) {
  const ref = getReferensi();
  const err = validasi_(lap, ref);
  if (err) return { ok: false, pesan: err };

  const cek = cekTabData_();
  if (cek) return { ok: false, pesan: cek };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_DATA);
    const tz = Session.getScriptTimeZone();
    const last = sh.getLastRow();

    if (!lap.paksa && last >= 2) {
      const ada = sh.getRange(2, 2, last - 1, 3).getValues().some(function (r) {
        return r[0] instanceof Date && Utilities.formatDate(r[0], tz, 'yyyy-MM-dd') === lap.tanggal &&
          String(r[1]).trim() === lap.kecamatan && String(r[2]).trim() === lap.desa;
      });
      if (ada) return { ok: false, ganda: true,
        pesan: 'Sudah ada laporan untuk ' + lap.desa + ' pada tanggal ini. Kirim tetap jika ini laporan berbeda.' };
    }

    let fotoUrl = '';
    if (lap.foto && lap.foto.data) {
      const blob = Utilities.newBlob(Utilities.base64Decode(lap.foto.data), lap.foto.mime || 'image/jpeg',
        lap.tanggal + ' ' + lap.desa + '.jpg');
      fotoUrl = folder_(CFG.FOLDER_FOTO).createFile(blob).getUrl();
    }

    const p = lap.tanggal.split('-');
    const n = function (v) { return Math.max(0, Math.round(Number(v) || 0)); };
    const row = [
      new Date(), new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])), lap.kecamatan, lap.desa, lap.petugas.trim(),
      n(lap.wargaLk), n(lap.wargaPr)
    ].concat(lap.layanan.map(n)).concat([
      n(lap.berkas), n(lap.pnbp), (lap.temuan || '').trim(), (lap.tindakLanjut || '').trim(),
      (lap.temuan || '').trim() ? lap.status : '', (lap.aparat || '').trim(), (lap.lokasi || '').trim(),
      lap.kepuasan ? Number(lap.kepuasan) : '', fotoUrl
    ]);
    sh.getRange(last + 1, 1, 1, CFG.KOLOM).setValues([row]);
    sh.getRange(last + 1, 2).setNumberFormat('dd/mm/yyyy');
    sh.getRange(last + 1, 16).setNumberFormat('"Rp"#,##0');

    return { ok: true, ringkasan: {
      desa: lap.desa, tanggal: lap.tanggal, warga: n(lap.wargaLk) + n(lap.wargaPr),
      layanan: lap.layanan.reduce(function (a, b) { return a + n(b); }, 0),
      berkas: n(lap.berkas), temuan: (lap.temuan || '').trim() ? lap.status : ''
    } };
  } finally {
    lock.releaseLock();
  }
}

function validasi_(lap, ref) {
  if (!lap || typeof lap !== 'object') return 'Data laporan tidak terbaca.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lap.tanggal || '')) return 'Tanggal kunjungan belum diisi.';
  const d = ref.desa.filter(function (x) { return x.desa === lap.desa && x.kecamatan === lap.kecamatan; })[0];
  if (!d) return 'Desa tidak ada di Daftar Desa untuk kecamatan yang dipilih.';
  if (!lap.petugas || !String(lap.petugas).trim()) return 'Nama petugas belum diisi.';
  if (!Array.isArray(lap.layanan) || lap.layanan.length !== CFG.LAYANAN.length) return 'Jumlah layanan tidak lengkap.';
  if (!lap.aparat || !String(lap.aparat).trim()) return 'Konfirmasi aparat desa belum diisi.';
  if (String(lap.temuan || '').trim() && ref.status.indexOf(lap.status) < 0) return 'Pilih status tindak lanjut untuk temuan.';
  if (lap.kepuasan && !(Number(lap.kepuasan) >= 1 && Number(lap.kepuasan) <= 5)) return 'Nilai kepuasan harus 1 sampai 5.';
  if (lap.foto && lap.foto.data && lap.foto.data.length > 7000000) return 'Foto terlalu besar.';
  return '';
}

function cekTabData_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_DATA);
  if (!sh) return 'Tab Data tidak ditemukan.';
  const f = String(sh.getRange('A2').getFormula() || '');
  if (/ARRAYFORMULA/i.test(f)) {
    return 'Tab Data masih tersambung ke Google Form (rumus ARRAYFORMULA di sel A2). ' +
      'Pilih salah satu cara pelaporan: hapus rumus itu untuk memakai aplikasi ini.';
  }
  return '';
}

/* ---------- Data untuk dashboard ---------- */

function getDashboard(pin, bulan) {
  const saved = PropertiesService.getScriptProperties().getProperty('DASHBOARD_PIN');
  if (saved && String(pin || '') !== saved) return { ok: false, perluPin: true };

  const ss = SpreadsheetApp.getActive();
  const tz = Session.getScriptTimeZone();
  const sh = ss.getSheetByName(CFG.SHEET_DATA);
  const last = sh.getLastRow();
  const raw = last >= 2 ? sh.getRange(2, 1, last - 1, CFG.KOLOM).getValues() : [];
  const ref = getReferensi();

  const semua = raw.filter(function (r) { return r[1] instanceof Date && String(r[3]).trim(); }).map(function (r) {
    return {
      tgl: Utilities.formatDate(r[1], tz, 'yyyy-MM-dd'), kecamatan: String(r[2]).trim(), desa: String(r[3]).trim(),
      lk: num_(r[5]), pr: num_(r[6]), layanan: r.slice(7, 14).map(num_), berkas: num_(r[14]), pnbp: num_(r[15]),
      temuan: String(r[16]).trim(), tindak: String(r[17]).trim(), status: String(r[18]).trim(), kepuasan: num_(r[21])
    };
  });
  const daftarBulan = semua.map(function (x) { return x.tgl.slice(0, 7); })
    .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  const rows = bulan ? semua.filter(function (x) { return x.tgl.slice(0, 7) === bulan; }) : semua;

  const sum = function (f) { return rows.reduce(function (a, x) { return a + f(x); }, 0); };
  const kp = rows.map(function (x) { return x.kepuasan; }).filter(function (v) { return v > 0; });
  const perDesa = ref.desa.map(function (d) {
    const v = rows.filter(function (x) { return x.desa === d.desa && x.kecamatan === d.kecamatan; });
    return { desa: d.desa, kecamatan: d.kecamatan, kunjungan: v.length,
      warga: v.reduce(function (a, x) { return a + x.lk + x.pr; }, 0),
      berkas: v.reduce(function (a, x) { return a + x.berkas; }, 0),
      terakhir: v.map(function (x) { return x.tgl; }).sort().pop() || '' };
  }).sort(function (a, b) { return b.kunjungan - a.kunjungan || a.desa.localeCompare(b.desa); });
  const kec = {};
  rows.forEach(function (x) { kec[x.kecamatan] = (kec[x.kecamatan] || 0) + 1; });
  const status = {};
  rows.filter(function (x) { return x.temuan; }).forEach(function (x) { const s = x.status || 'Belum'; status[s] = (status[s] || 0) + 1; });
  const perBulan = daftarBulan.map(function (b) {
    const v = semua.filter(function (x) { return x.tgl.slice(0, 7) === b; });
    return { bulan: b, warga: v.reduce(function (a, x) { return a + x.lk + x.pr; }, 0), kunjungan: v.length };
  });

  return {
    ok: true, bulan: bulan || '', daftarBulan: daftarBulan, diperbarui: Utilities.formatDate(new Date(), tz, 'dd/MM/yyyy HH:mm'),
    kunjungan: rows.length, wargaLk: sum(function (x) { return x.lk; }), wargaPr: sum(function (x) { return x.pr; }),
    layananTotal: sum(function (x) { return x.layanan.reduce(function (a, b) { return a + b; }, 0); }),
    berkas: sum(function (x) { return x.berkas; }), pnbp: sum(function (x) { return x.pnbp; }),
    kepuasan: kp.length ? Math.round(kp.reduce(function (a, b) { return a + b; }, 0) / kp.length * 10) / 10 : 0,
    layanan: CFG.LAYANAN.map(function (l, i) { return { label: l, n: sum(function (x) { return x.layanan[i]; }) }; }),
    totalDesa: ref.desa.length, desaDikunjungi: perDesa.filter(function (d) { return d.kunjungan > 0; }).length,
    perDesa: perDesa,
    perKecamatan: Object.keys(kec).map(function (k) { return { label: k, n: kec[k] }; }),
    statusTemuan: ['Selesai', 'Proses', 'Belum'].map(function (s) { return { label: s, n: status[s] || 0 }; }),
    perBulan: perBulan,
    terbuka: rows.filter(function (x) { return x.temuan && x.status !== 'Selesai'; })
      .sort(function (a, b) { return b.tgl.localeCompare(a.tgl); })
      .map(function (x) { return { tgl: x.tgl, desa: x.desa, temuan: x.temuan, tindak: x.tindak, status: x.status || 'Belum' }; })
  };
}

function num_(v) { const n = Number(v); return isFinite(n) ? n : 0; }

/* ---------- Daftar desa dan rekap desa ---------- */

function isiDaftarDesa() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.alert('Isi ulang daftar desa',
    'Tab Daftar Desa akan diganti dengan ' + DESA_HUMBAHAS.length + ' desa/kelurahan Kabupaten Humbang Hasundutan. Lanjutkan?',
    ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  isiDaftarDesa_();
  siapkanRekapDesa_();
  ui.alert('Daftar desa sudah diisi.');
}

function isiDaftarDesa_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_DESA);
  sh.getRange(5, 1, CFG.MAKS_DESA, 2).clearContent();
  sh.getRange(5, 1, DESA_HUMBAHAS.length, 2).setValues(DESA_HUMBAHAS);
  sh.getRange(5, 1, CFG.MAKS_DESA, 2).setFontColor('#0000FF').setBackground('#FFF8DB');
  sh.getRange('A2').setValue('Satu baris per desa, maksimal ' + CFG.MAKS_DESA + ' desa. Sumber awal: kode wilayah Kemendagri Kabupaten Humbang Hasundutan.');
}

/* Pemisah argumen rumus mengikuti lokal Sheet: "," (mis. Inggris) atau ";" (mis. Indonesia). */
function pemisah_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_SET);
  const c = sh.getRange(sh.getMaxRows(), sh.getMaxColumns());
  const lama = c.getFormula() || c.getValue();
  c.setFormula('=IF(TRUE,1,0)');
  SpreadsheetApp.flush();
  const sep = c.getValue() === 1 ? ',' : ';';
  c.clearContent();
  if (lama !== '' && lama !== null) c.setValue(lama);
  return sep;
}

function perbaikiRekapDesa() {
  siapkanRekapDesa_();
  SpreadsheetApp.getUi().alert('Rumus Rekap Desa sudah diperbaiki.');
}

function siapkanRekapDesa_() {
  const ss = SpreadsheetApp.getActive();
  const S = pemisah_();
  const last = 5 + CFG.MAKS_DESA - 1;
  ss.getSheetByName(CFG.SHEET_SET).getRange('B5').setFormula("=COUNTA('Daftar Desa'!B5:B" + last + ")");
  ss.getSheetByName(CFG.SHEET_DATA).getRange('C2:D').clearDataValidations();
  const sh = ss.getSheetByName('Rekap Desa');
  if (!sh) return;
  const n = ss.getSheetByName(CFG.SHEET_DESA).getRange(5, 2, CFG.MAKS_DESA, 1).getValues()
    .filter(function (r) { return String(r[0]).trim(); }).length;
  const top = 9, rows = [];
  for (let i = 0; i < Math.max(n, 1); i++) {
    const r = top + i, s = 5 + i, k = 'Data!$C:$C' + S + '$A' + r + S + 'Data!$D:$D' + S + '$B' + r;
    const kosong = 'IF($B' + r + '=""' + S + '""' + S;
    rows.push([
      "=IF('Daftar Desa'!B" + s + '=""' + S + '""' + S + "'Daftar Desa'!A" + s + ')',
      "=IF('Daftar Desa'!B" + s + '=""' + S + '""' + S + "'Daftar Desa'!B" + s + ')',
      '=' + kosong + 'COUNTIFS(' + k + '))',
      '=' + kosong + 'SUMIFS(Data!$F:$F' + S + k + ')+SUMIFS(Data!$G:$G' + S + k + '))',
      '=' + kosong + 'SUMIFS(Data!$O:$O' + S + k + '))',
      '=' + kosong + 'SUMIFS(Data!$P:$P' + S + k + '))',
      '=' + kosong + 'IF($C' + r + '=0' + S + '""' + S + 'MAXIFS(Data!$B:$B' + S + k + ')))',
      '=' + kosong + 'IF($C' + r + '=0' + S + '"Belum dikunjungi"' + S + '"Sudah dikunjungi"))'
    ]);
  }
  const maxRow = Math.max(sh.getMaxRows(), top + CFG.MAKS_DESA);
  if (sh.getMaxRows() < maxRow) sh.insertRowsAfter(sh.getMaxRows(), maxRow - sh.getMaxRows());
  sh.getRange(top, 1, CFG.MAKS_DESA, 8).clearContent();
  sh.getRange(top, 1, rows.length, 8).setFormulas(rows);
  sh.getRange(top, 6, rows.length, 1).setNumberFormat('"Rp"#,##0');
  sh.getRange(top, 7, rows.length, 1).setNumberFormat('dd/mm/yyyy');
  sh.getRange('B5').setFormula('=COUNTIF(H' + top + ':H' + (top + CFG.MAKS_DESA - 1) + S + '"Sudah dikunjungi")');
}

/* ---------- Arsip bulanan ---------- */

function arsipBulanan() {
  const ss = SpreadsheetApp.getActive();
  const tz = Session.getScriptTimeZone();
  const url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=xlsx';
  const blob = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }).getBlob();
  blob.setName('Arsip PATEN ' + Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd') + '.xlsx');
  folder_(CFG.FOLDER_ARSIP).createFile(blob);
}

/* ---------- Bantuan ---------- */

function folder_(nama) {
  const it = DriveApp.getFoldersByName(nama);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nama);
}
