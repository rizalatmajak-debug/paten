# Aplikasi PATEN — Kantor Pertanahan Kabupaten Humbang Hasundutan

Kementerian ATR/BPN · Kanwil BPN Provinsi Sumatera Utara  
Jl. Dolok Sanggul – Sidikalang No. 269, Sirisirisi, Kec. Doloksanggul, Kab. Humbang Hasundutan, Sumatera Utara 22457  
WhatsApp 082273784505 · kab-humbanghasundutan@atrbpn.go.id · https://kab-humbanghasundutan.atrbpn.go.id

Aplikasi HP untuk pelaporan kegiatan PATEN (pelayanan pertanahan di desa setiap hari Rabu).

- `index.html` — formulir laporan petugas
- `dashboard.html` — dashboard kinerja pimpinan
- `api.js` — penghubung ke Google Apps Script (data tersimpan di Google Sheet "Sistem Pelaporan PATEN")
- `manifest.json`, `sw.js`, `icons/` — supaya bisa dipasang di layar utama HP dan tetap terbuka saat sinyal lemah
- `Code.gs` — salinan kode Apps Script (cadangan; yang berjalan ada di editor Apps Script)

Kode petugas diatur di Google Sheet: menu **PATEN › 3. Atur kode petugas**.
PIN dashboard: menu **PATEN › 2. Atur PIN dashboard**.
