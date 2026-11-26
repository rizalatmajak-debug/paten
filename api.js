/* Penghubung aplikasi PATEN (GitHub Pages) ke Google Apps Script.
   Meniru google.script.run supaya halaman tetap sama dengan versi Apps Script. */
var API_URL = 'https://script.google.com/macros/s/AKfycbwvtuFNl_xe6NPZV0rh2sAA0amHJ__tL1E5RfodgW9eh7S_sEkRTKrFNs-ZogmEPaEuRg/exec';

var PATEN_API = (function () {
  function ambil(k) { try { return localStorage.getItem('paten_' + k); } catch (e) { return null; } }
  function simpan(k, v) { try { if (v === null) localStorage.removeItem('paten_' + k); else localStorage.setItem('paten_' + k, v); } catch (e) {} }

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
        var kode = window.prompt(ulang ? 'Kode petugas salah. Masukkan kode petugas PATEN:' : 'Masukkan kode petugas PATEN (diminta sekali saja):', '');
        if (kode === null) { gagal(new Error('Kode petugas diperlukan.')); return; }
        simpan('kode', kode.trim());
        panggil(fn, args, ok, gagal, true);
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
