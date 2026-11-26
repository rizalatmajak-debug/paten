/* Penghubung aplikasi PATEN (GitHub Pages) ke Google Apps Script.
   Meniru google.script.run supaya halaman tetap sama dengan versi Apps Script. */
var API_URL = 'https://script.google.com/macros/s/AKfycbwvtuFNl_xe6NPZV0rh2sAA0amHJ__tL1E5RfodgW9eh7S_sEkRTKrFNs-ZogmEPaEuRg/exec';

var PATEN_API = (function () {
  function ambil(k) { try { return localStorage.getItem('paten_' + k); } catch (e) { return null; } }
  function simpan(k, v) { try { if (v === null) localStorage.removeItem('paten_' + k); else localStorage.setItem('paten_' + k, v); } catch (e) {} }

  function mintaKode(salah, cb) {
    var lama = document.getElementById('patenKode'); if (lama) lama.remove();
    var w = document.createElement('div'); w.id = 'patenKode';
    w.style.cssText = 'position:fixed;inset:0;background:rgba(11,37,69,.92);display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Inter,Roboto,system-ui,sans-serif';
    w.innerHTML = '<div style="background:#fff;border-radius:16px;padding:22px;max-width:360px;width:100%;display:flex;flex-direction:column;gap:12px">' +
      '<div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#0F766E">PATEN</div>' +
      '<div style="font-size:20px;font-weight:700;color:#0B2545">Kode petugas</div>' +
      '<div style="font-size:14px;color:#475569">' + (salah ? '<b style="color:#B91C1C">Kode salah.</b> ' : '') + 'Masukkan kode dari koordinator PATEN. Cukup sekali di HP ini.</div>' +
      '<input id="patenKodeIn" autocomplete="off" autocapitalize="off" style="font-size:18px;padding:12px;border:1.5px solid #CBD5E1;border-radius:10px">' +
      '<button id="patenKodeOk" style="background:#0B2545;color:#fff;border:0;border-radius:10px;padding:13px;font-size:16px;font-weight:700">Masuk</button></div>';
    document.body.appendChild(w);
    var inp = document.getElementById('patenKodeIn'); inp.focus();
    var kirim = function () { var v = inp.value.trim(); if (!v) { inp.focus(); return; } w.remove(); cb(v); };
    document.getElementById('patenKodeOk').onclick = kirim;
    inp.onkeydown = function (e) { if (e.key === 'Enter') kirim(); };
  }

  function minta(fn, args) {
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args, kode: ambil('kode') || '' }),
      redirect: 'follow'
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function panggil(fn, args, ok, gagal, ulang) {
    minta(fn, args).then(function (res) {
      if (res.perluKode) {
        mintaKode(ulang, function (kode) {
          if (kode === null) { gagal(new Error('Kode petugas diperlukan.')); return; }
          simpan('kode', kode);
          panggil(fn, args, ok, gagal, true);
        });
        return;
      }
      if (res.apiError) { gagal(new Error(res.pesan)); return; }
      if (fn === 'getReferensi') simpan('ref', JSON.stringify(res.hasil));
      ok(res.hasil);
    }).catch(function (err) {
      if (fn === 'getReferensi') {
        var c = ambil('ref');
        if (c) { ok(JSON.parse(c)); return; }
      }
      gagal(err);
    });
  }

  function runner() {
    var ok = function () {}, gagal = function () {};
    var r = {
      withSuccessHandler: function (f) { ok = f; return r; },
      withFailureHandler: function (f) { gagal = f; return r; }
    };
    ['getReferensi', 'kirimLaporan', 'getDashboard'].forEach(function (fn) {
      r[fn] = function () { panggil(fn, Array.prototype.slice.call(arguments), ok, gagal, false); };
    });
    return r;
  }
  return { runner: runner };
})();

window.google = { script: {} };
Object.defineProperty(window.google.script, 'run', { get: PATEN_API.runner });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
