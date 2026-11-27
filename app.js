/* App Quản lý công việc Phòng Đào tạo - giao diện */
(function () {
  'use strict';
  var CFG = window.PDT_CONFIG || {};
  var DEMO = !CFG.API_URL;
  var app = document.getElementById('app');
  var modalsEl = document.getElementById('modals');

  /* ================= Tiện ích ================= */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return PDT.isoDate(d); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ddmm(s) { if (!s) return ''; var p = s.split('-'); return p[2] + '/' + p[1]; }
  function ddmmyyyy(s) { if (!s) return ''; var p = s.slice(0, 10).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function timeAgo(isoStr) {
    var d = new Date(isoStr); if (isNaN(d)) return '';
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function diff(a, b) { return PDT.dayDiff(a, b); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function monthStart(y, m) { return y + '-' + pad(m) + '-01'; }
  function monthEnd(y, m) { return iso(new Date(y, m, 0)); }
  function uid() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2); }
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function initials(name) {
    var w = String(name || '?').replace(/\(.*?\)/g, ' ').replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/);
    return (w.length >= 2 ? w[w.length - 2][0] + w[w.length - 1][0] : String(name || '?').slice(0, 2)).toUpperCase();
  }
  var AVC = ['#1f8a5b', '#7a5a2f', '#2f6fdb', '#8e44ad', '#c0392b', '#16a085', '#d35400', '#34495e', '#b03a78', '#3c6e47'];
  function avColor(id) { var h = 0; String(id).split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return AVC[h % AVC.length]; }
  function av(u, lg) { if (!u) return ''; return '<span class="av' + (lg ? ' lg' : '') + '" style="background:' + avColor(u.id) + '">' + esc(initials(u.name)) + '</span>'; }

  /* ================= Biểu tượng ================= */
  var IC = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    list: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2M11 17h2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    mega: '<path d="m3 11 18-5v12L3 14z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.8 3.5 6"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    check: '<path d="m5 12 5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    clip: '<path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10zM16 9.5a3.5 3.5 0 0 1 0 5"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v4M12 17h.01"/>',
    inbox: '<path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'
  };
  function ic(n, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || '') + '</svg>'; }

  /* ================= Trạng thái ứng dụng ================= */
  var S = {
    token: LS.get('pdt_token', null), data: null, tab: 'home', sub: null, param: null,
    month: null, taskView: LS.get('pdt_taskview', 'list'), taskChip: 'all', q: '', filter: {},
    sumMode: 'month', meTab: 'tasks', noteChip: 'all', planYear: null, evalMode: 'month', myChip: 'open',
    sound: LS.get('pdt_sound', true), seenNotifs: LS.get('pdt_seen', [])
  };
  var D = function () { return S.data || {}; };
  function today() { return (S.data && S.data.today) || iso(new Date()); }
  function me() { return D().me || {}; }
  function users() { return (D().users || []).slice().sort(function (a, b) { return (a.sort || 99) - (b.sort || 99) || a.name.localeCompare(b.name, 'vi'); }); }
  function activeUsers() { return users().filter(function (u) { return u.active; }); }
  function user(id) { return (D().users || []).filter(function (u) { return u.id === id; })[0]; }
  function tasks() { return D().tasks || []; }
  function task(id) { return tasks().filter(function (t) { return t.id === id; })[0]; }
  function eff(t) { return PDT.effStatus(t, today()); }
  function sett() { return D().settings || PDT.DEFAULT_SETTINGS; }
  function isLead() { return PDT.isLead(me()); }
  function isTL() { return PDT.isTeamLead(me()); }
  function startOf(t) { return t.startDate || (t.createdAt || '').slice(0, 10) || t.dueDate; }
  function overlaps(t, a, b) { return startOf(t) <= b && t.dueDate >= a; }
  function counted(t) { return t.status !== 'huy' && t.status !== 'de_xuat'; }
  function schoolYearOf(d) { var y = +d.slice(0, 4), m = +d.slice(5, 7); return m >= 8 ? y + '-' + (y + 1) : (y - 1) + '-' + y; }
  function yearRange(sy) { var y = +sy.slice(0, 4); return [y + '-08-01', (y + 1) + '-07-31']; }

  /* ================= Kết nối máy chủ ================= */
  var demoCore = null;
  function demoStore() {
    var KEY = 'pdt_demo_db', db = LS.get(KEY, {});
    function save() { LS.set(KEY, db); }
    return {
      all: function (t) { return (db[t] || []).map(function (o) { return JSON.parse(JSON.stringify(o)); }); },
      put: function (t, o) { db[t] = db[t] || []; var i = db[t].findIndex(function (x) { return x.id === o.id; }); var c = JSON.parse(JSON.stringify(o)); if (i >= 0) db[t][i] = c; else db[t].push(c); save(); },
      del: function (t, id) { db[t] = (db[t] || []).filter(function (x) { return x.id !== id; }); save(); }
    };
  }
  function getDemo() {
    if (demoCore) return demoCore;
    var store = demoStore();
    var env = { uuid: uid, nowIso: function () { return new Date().toISOString(); }, today: function () { return iso(new Date()); } };
    demoCore = PDT.createCore(store, env);
    if (!store.all('Users').length) seedDemo(demoCore, store, env);
    return demoCore;
  }
  function api(action, data) {
    var req = { action: action, token: S.token, data: data || {} };
    var p;
    if (DEMO) {
      p = new Promise(function (r) { setTimeout(function () { r(getDemo().handle(JSON.parse(JSON.stringify(req)))); }, 50); });
    } else {
      p = fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(req), redirect: 'follow' })
        .then(function (r) { return r.json(); })
        .catch(function () { return { ok: false, error: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.' }; });
    }
    return p.then(function (res) {
      if (!res.ok) { if (res.auth) logout(true); throw new Error(res.error || 'Có lỗi xảy ra.'); }
      return res.data;
    });
  }
  /* Tải dữ liệu: chỉ vẽ lại màn hình khi dữ liệu thật sự thay đổi */
  var lastSig = '', inflight = 0, syncTimer = null;
  function load(silent) {
    return api('bootstrap').then(function (d) {
      if (inflight > 0) { scheduleSync(1500); return; }  /* đang lưu dở: chờ lưu xong mới đồng bộ */
      var sig = JSON.stringify(d), changed = sig !== lastSig || !S.data;
      lastSig = sig;
      if (!changed) { if (!silent) toast('Dữ liệu đã mới nhất'); return; }
      var before = S.data ? (S.data.notifs || []).map(function (n) { return n.id; }) : null;
      var oldLogo = S.data && S.data.settings ? S.data.settings.logo : null;
      S.data = d; LS.set('pdt_cache', d);
      if (oldLogo !== (d.settings || {}).logo) applyLogo();
      if (before) {
        var fresh = (d.notifs || []).filter(function (n) { return !n.read && before.indexOf(n.id) < 0; });
        if (fresh.length) alertNew(fresh);
      }
      render();
      if (!silent) toast('Đã cập nhật dữ liệu');
    }).catch(function (e) { if (!silent) toast(e.message); });
  }
  function scheduleSync(ms) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { if (S.token) load(true); }, ms || 4000);
  }
  function upsert(list, o) {
    for (var i = 0; i < list.length; i++) if (list[i].id === o.id) { list[i] = o; return; }
    list.unshift(o);
  }
  /* Ghép kết quả máy chủ trả về vào dữ liệu trên máy, không tải lại toàn bộ */
  function merge(action, data, r) {
    var d = S.data; if (!d || !r) return;
    if (r.task) upsert(d.tasks, r.task);
    if (r.note) upsert(d.notes, r.note);
    if (action === 'deleteNote') d.notes = d.notes.filter(function (n) { return n.id !== data.id; });
    if (r.plan) upsert(d.plans, r.plan);
    if (r.user) { upsert(d.users, r.user); if (r.user.id === d.me.id) Object.assign(d.me, r.user); }
    if (action === 'rejectUser') d.users = d.users.filter(function (u) { return u.id !== data.id; });
    if (r.settings) d.settings = r.settings;
    if (action === 'readNotifs') d.notifs.forEach(function (n) { if (!data.ids || data.ids.indexOf(n.id) >= 0) n.read = true; });
    LS.set('pdt_cache', d);
  }
  /* Lưu: (1) đổi ngay trên màn hình nếu có hàm local, (2) gửi máy chủ chạy nền,
     (3) ghép kết quả trả về; lỗi thì trả màn hình về như cũ và báo lỗi */
  function act(action, data, okMsg, local) {
    var undo = null;
    if (local && S.data) { try { undo = local(S.data); } catch (e) { undo = null; } render(); }
    inflight++;
    return api(action, data).then(function (r) {
      inflight--;
      if (undo && undo.temp) undo();
      merge(action, data, r); render();
      if (okMsg) toast(okMsg);
      scheduleSync();
      return r;
    }).catch(function (e) {
      inflight = Math.max(0, inflight - 1);
      if (undo) { undo(); render(); }
      toast(e.message); scheduleSync(1000);
      throw e;
    });
  }
  function canAp(u, t) { return PDT.canApprove(u, t, user(t.creatorId)); }
  var canAp0 = canAp;
  /* Thay đổi tạm trên máy cho các thao tác công việc */
  function localTaskOp(x) {
    return function (d) {
      var t = d.tasks.filter(function (k) { return k.id === x.id; })[0];
      if (!t) return null;
      var old = JSON.parse(JSON.stringify(t)), td = today();
      switch (x.op) {
        case 'progress': t.progress = x.progress; if (t.progress > 0) t.status = 'dang'; break;
        case 'start': t.status = 'dang'; break;
        case 'submit': t.progress = 100; t.submittedAt = td; if (isLead()) { t.status = 'xong'; t.doneDate = td; } else t.status = 'cho_duyet'; break;
        case 'approve': t.status = 'xong'; t.doneDate = t.submittedAt || td; if (x.score !== '' && x.score != null) t.score = +x.score; break;
        case 'return': t.status = 'dang'; t.submittedAt = ''; break;
        case 'reopen': t.status = 'dang'; t.doneDate = ''; t.score = null; break;
        case 'accept': if (x.assigneeId) t.assigneeId = x.assigneeId; if (x.dueDate) t.dueDate = x.dueDate; if (x.priority) t.priority = x.priority;
          if (!t.startDate || t.startDate < td) t.startDate = td; t.status = t.startDate <= td ? 'dang' : 'chua'; break;
        case 'reject': case 'withdraw': t.status = 'huy'; break;
        case 'revise': break;
        case 'cancel': t.status = 'huy'; break;
        case 'restore': t.status = t.progress > 0 ? 'dang' : 'chua'; break;
      }
      return function () { Object.keys(t).forEach(function (k) { delete t[k]; }); Object.assign(t, old); };
    };
  }

  /* ================= Thông báo, âm thanh ================= */
  function beep() {
    if (!S.sound) return;
    try {
      var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.35);
      o.start(); o.stop(c.currentTime + 0.4);
    } catch (e) { }
  }
  function sysNotify(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var opt = { body: body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'pdt-' + Date.now() };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (r) { r.showNotification(title, opt); }).catch(function () { try { new Notification(title, opt); } catch (e) { } });
    } else { try { new Notification(title, opt); } catch (e) { } }
  }
  function alertNew(list) {
    beep();
    /* Đã nhận qua Firebase thì máy chủ tự đẩy thông báo, không hiện trùng */
    if (LS.get('pdt_push', true) && !LS.get('pdt_fcm', null)) list.slice(0, 3).forEach(function (n) { sysNotify(CFG.TEN_APP || 'Công việc', n.text); });
  }

  /* ================= Firebase: nhận thông báo cả khi đóng app ================= */
  var FB = CFG.FIREBASE || {};
  var FCM_ON = !DEMO && !!(FB.apiKey && FB.projectId && FB.messagingSenderId && FB.appId && CFG.VAPID_KEY);
  var FB_VER = '10.12.2', messaging = null;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error('Không tải được thư viện Firebase. Kiểm tra mạng.')); };
      document.head.appendChild(s);
    });
  }
  function getMessaging() {
    if (messaging) return Promise.resolve(messaging);
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    return loadScript(base + 'firebase-app-compat.js').then(function () { return loadScript(base + 'firebase-messaging-compat.js'); })
      .then(function () { if (!firebase.apps.length) firebase.initializeApp(FB); messaging = firebase.messaging(); return messaging; });
  }
  function registerPush() {
    if (!FCM_ON || !S.token || !('serviceWorker' in navigator) || !('Notification' in window) || Notification.permission !== 'granted') return Promise.resolve(false);
    return navigator.serviceWorker.ready
      .then(function (reg) { return getMessaging().then(function (m) { return m.getToken({ vapidKey: CFG.VAPID_KEY, serviceWorkerRegistration: reg }); }); })
      .then(function (tok) {
        if (!tok) return false;
        return api('registerDevice', { token: tok, ua: navigator.userAgent }).then(function () { LS.set('pdt_fcm', { token: tok, at: Date.now(), user: me().id }); return true; });
      });
  }
  function unregisterPush() {
    var f = LS.get('pdt_fcm', null); LS.del('pdt_fcm');
    if (!f) return Promise.resolve();
    var p = S.token ? api('unregisterDevice', { token: f.token }).catch(function () { }) : Promise.resolve();
    return p.then(function () { return messaging ? messaging.deleteToken().catch(function () { }) : null; });
  }
  function keepPushFresh() {
    if (!FCM_ON || LS.get('pdt_push', true) === false || !('Notification' in window) || Notification.permission !== 'granted') return;
    var f = LS.get('pdt_fcm', null);
    if (f && f.user === me().id && Date.now() - f.at < 3 * 86400000) return;
    registerPush().catch(function () { });
  }

  /* ================= Dữ liệu dùng thử ================= */
  function seedDemo(core, store, env) {
    core.seed({ username: 'truongphong', password: '1111', name: 'Trưởng phòng (dùng thử)' });
    var lead = store.all('Users')[0]; lead.mustChange = false; store.put('Users', lead);
    var ppl = [
      ['phophong', 'Phó Trưởng phòng (dùng thử)', 'lanh_dao', '', 'Phó Trưởng phòng'],
      ['totruong1', 'Tổ trưởng Tổ 1', 'to_truong', 'to1', 'Tổ trưởng'],
      ['totruong2', 'Tổ trưởng Tổ 2', 'to_truong', 'to2', 'Tổ trưởng'],
      ['topho1', 'Tổ phó Tổ 1', 'to_pho', 'to1', 'Tổ phó'],
      ['chuyenvien1', 'Chuyên viên Tổ 1 An', 'chuyen_vien', 'to1', 'Chuyên viên'],
      ['chuyenvien2', 'Chuyên viên Tổ 1 Bình', 'chuyen_vien', 'to1', 'Chuyên viên'],
      ['chuyenvien3', 'Chuyên viên Tổ 2 Cường', 'chuyen_vien', 'to2', 'Chuyên viên'],
      ['chuyenvien4', 'Chuyên viên Tổ 2 Dung', 'chuyen_vien', 'to2', 'Chuyên viên']
    ];
    var ids = {};
    ppl.forEach(function (p, i) {
      var salt = env.uuid();
      var u = { id: env.uuid(), username: p[0] + '@' + PDT.DOMAIN, email: p[0] + '@' + PDT.DOMAIN, salt: salt, passHash: PDT.hashPass('1111', salt), name: p[1], role: p[2], team: p[3], title: p[4],
        birthday: '', phone: '', active: true, mustChange: false, sort: i + 2, createdAt: env.nowIso() };
      store.put('Users', u); ids[p[0]] = u.id;
    });
    ids.truongphong = lead.id;
    var t0 = env.today();
    var plan = store.all('Plans')[0];
    var T = [
      ['Xây dựng lịch thi kết thúc học phần học kỳ I năm học 2026–2027', 'totruong2', 'to2', 'khan', 'Kế hoạch, thời khóa biểu', -12, 0, 'dang', 70],
      ['Báo cáo công tác tháng và kế hoạch tháng sau của Phòng', 'chuyenvien3', 'to2', 'cao', 'Văn bản, báo cáo', -6, 1, 'dang', 40],
      ['Rà soát hồ sơ xét tốt nghiệp đợt tháng 12', 'chuyenvien1', 'to1', 'cao', 'Giáo vụ', -10, 1, 'dang', 55],
      ['Tổng hợp dữ liệu CĐR tiếng Anh khóa 17, phân nhóm cảnh báo', 'chuyenvien2', 'to1', 'cao', 'CTĐT và chuẩn đầu ra', -20, 4, 'dang', 30, 'nv123'],
      ['Danh mục quy trình nghiệp vụ đào tạo, phân loại điểm nghẽn', 'totruong1', 'to1', 'thuong', 'Văn bản, báo cáo', -25, 5, 'chua', 0, 'nv121'],
      ['Cập nhật CSDL doanh nghiệp dùng chung theo mẫu chuẩn', 'chuyenvien4', 'to2', 'thuong', 'Hợp tác doanh nghiệp, thực tập', -15, 9, 'chua', 0, 'nv122'],
      ['Thông báo kế hoạch học kỳ phụ và học vượt hè 2027', 'chuyenvien3', 'to2', 'thuong', 'Kế hoạch, thời khóa biểu', -3, 12, 'chua', 0],
      ['Dự thảo mục tiêu, CĐR, ma trận CTĐT Kỹ thuật Ô tô', 'chuyenvien1', 'to1', 'cao', 'CTĐT và chuẩn đầu ra', -18, 4, 'dang', 50, 'nv111'],
      ['Đối soát dữ liệu sổ gốc văn bằng năm 2014', 'chuyenvien2', 'to1', 'thuong', 'Văn bằng, chứng chỉ', -30, -3, 'dang', 60, 'nv133'],
      ['Phân công giảng dạy học kỳ II, gửi các Khoa rà soát', 'chuyenvien4', 'to2', 'cao', 'Kế hoạch, thời khóa biểu', -20, -2, 'cho_duyet', 100],
      ['Kế hoạch thực tập cuối khóa K17 theo Phương án A, B', 'totruong2', 'to2', 'thuong', 'Hợp tác doanh nghiệp, thực tập', -25, -8, 'xong', 100],
      ['Quyết định công nhận tốt nghiệp đợt tháng 10', 'chuyenvien1', 'to1', 'khan', 'Giáo vụ', -28, -14, 'xong', 100],
      ['Biên bản họp Hội đồng chuyên môn Khoa về đề cương học phần', 'chuyenvien2', 'to1', 'thuong', 'CTĐT và chuẩn đầu ra', -22, -10, 'xong', 100],
      ['Thời khóa biểu học kỳ II các khóa K18, K19, K20', 'chuyenvien3', 'to2', 'cao', 'Kế hoạch, thời khóa biểu', -24, -6, 'xong', 100],
      ['Tiêu chí lựa chọn CTĐT thí điểm giảng dạy bằng tiếng Anh', 'totruong1', 'to1', 'thuong', 'CTĐT và chuẩn đầu ra', -16, -4, 'xong', 100, 'nv112']
    ];
    var seq = 0;
    T.forEach(function (x) {
      seq++;
      var due = addDays(t0, x[6]), st = x[7];
      var t = { id: env.uuid(), code: 'CV' + t0.slice(2, 4) + '-' + ('00' + seq).slice(-3), title: x[0], desc: '', assigneeId: ids[x[1]],
        collaborators: seq % 3 === 0 ? [x[1] === 'chuyenvien2' ? ids.chuyenvien1 : ids.chuyenvien2] : [], creatorId: ids.truongphong, team: x[2], priority: x[3], category: x[4],
        status: st, progress: x[8], startDate: addDays(t0, x[5]), dueDate: due, doneDate: st === 'xong' ? addDays(due, seq % 4 === 0 ? 2 : -1) : '',
        submittedAt: st === 'cho_duyet' ? addDays(due, -1) : '', approvedBy: st === 'xong' ? ids.truongphong : '', score: null,
        planItem: x[9] ? plan.id + '#' + x[9] : '', evidence: st === 'xong' ? [{ id: env.uuid(), name: 'Văn bản hoàn thành.pdf', url: 'https://drive.google.com/', by: ids[x[1]], at: env.nowIso() }] : [],
        createdAt: addDays(t0, x[5]) + 'T08:00:00.000Z', updatedAt: env.nowIso() };
      if (st === 'xong') t.score = PDT.defaultScore(t, PDT.DEFAULT_SETTINGS);
      store.put('Tasks', t);
      store.put('Logs', { id: env.uuid(), taskId: t.id, userId: ids.truongphong, kind: 'create', text: 'Giao việc', at: t.createdAt });
    });
    store.put('Settings', { id: 'seq_' + t0.slice(2, 4), value: seq });
    store.put('Notifs', { id: env.uuid(), userId: ids.truongphong, text: 'Chuyên viên Tổ 2 Dung báo hoàn thành: Phân công giảng dạy học kỳ II', taskId: '', read: false, at: env.nowIso() });
  }

  /* ================= Điều hướng ================= */
  var modalStack = [];
  function go(tab, sub, param) {
    S.tab = tab; S.sub = sub || null; S.param = param || null;
    history.pushState({ tab: tab, sub: S.sub, param: S.param }, '', '#' + tab + (sub ? '/' + sub : ''));
    render(); window.scrollTo(0, 0);
  }
  window.addEventListener('popstate', function (e) {
    if (skipPop) { skipPop--; return; }
    if (modalStack.length) { closeTop(); return; }
    var st = e.state || { tab: 'home' };
    S.tab = st.tab || 'home'; S.sub = st.sub || null; S.param = st.param || null;
    render();
  });

  /* ================= Cửa sổ ================= */
  function openModal(title, bodyHtml, opts) {
    opts = opts || {};
    var ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = '<div class="sheet' + (opts.small ? ' small' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="sh"><h3>' + esc(title) + '</h3><button class="iconbtn" data-x aria-label="Đóng">' + ic('x') + '</button></div>' +
      '<div class="sb">' + bodyHtml + '</div><div class="sf">' + (opts.foot || '') + '</div></div>';
    modalsEl.appendChild(ov);
    var m = { el: ov, onClose: opts.onClose };
    modalStack.push(m);
    history.pushState({ modal: true, tab: S.tab, sub: S.sub, param: S.param }, '', location.hash);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-x]')) closeModal(); });
    document.body.style.overflow = 'hidden';
    return ov;
  }
  function closeTop() {
    var m = modalStack.pop(); if (!m) return;
    m.el.remove(); if (m.onClose) m.onClose();
    if (!modalStack.length) document.body.style.overflow = '';
  }
  var skipPop = 0;
  function closeModal() { if (!modalStack.length) return; closeTop(); skipPop++; history.back(); }
  function refreshModal(ov, html) { ov.querySelector('.sb').innerHTML = html; }

  /* Hộp thoại nhập liệu chung */
  function ask(title, fields, okLabel) {
    return new Promise(function (resolve) {
      var html = fields.map(function (f) {
        var v = f.value == null ? '' : f.value;
        var inp;
        if (f.type === 'textarea') inp = '<textarea class="inp" name="' + f.name + '" placeholder="' + esc(f.ph || '') + '">' + esc(v) + '</textarea>';
        else if (f.type === 'select') inp = '<select class="inp" name="' + f.name + '">' + f.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
        else if (f.type === 'info') return '<p class="muted">' + f.html + '</p>';
        else inp = '<input class="inp" name="' + f.name + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '" placeholder="' + esc(f.ph || '') + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + '>';
        return '<div class="fld"><label>' + esc(f.label) + '</label>' + inp + (f.hint ? '<div class="hint">' + f.hint + '</div>' : '') + '</div>';
      }).join('');
      var done = false;
      var ov = openModal(title, '<form id="askf">' + html + '</form>', {
        small: true, foot: '<button class="btn" data-x>Hủy</button><button class="btn pri" data-ok>' + esc(okLabel || 'Đồng ý') + '</button>',
        onClose: function () { if (!done) resolve(null); }
      });
      function submit() {
        var o = {};
        fields.forEach(function (f) { var el = ov.querySelector('[name="' + f.name + '"]'); if (el) o[f.name] = el.value; });
        done = true; resolve(o); closeModal();
      }
      ov.querySelector('[data-ok]').onclick = submit;
      ov.querySelector('#askf').onsubmit = function (e) { e.preventDefault(); submit(); };
      var first = ov.querySelector('input,textarea,select'); if (first && window.innerWidth > 700) first.focus();
    });
  }
  function confirmBox(title, text, okLabel) {
    return ask(title, [{ type: 'info', html: esc(text) }], okLabel || 'Đồng ý').then(function (r) { return !!r; });
  }

  /* ================= Hiển thị chung ================= */
  var ST_LABEL = PDT.STATUS;
  function stPill(t) { var s = eff(t); return '<span class="pill"><i class="bg-' + s + '"></i>' + ST_LABEL[s] + '</span>'; }
  function dueInfo(t) {
    if (t.status === 'xong') return { txt: 'Đã xong ' + ddmm(t.doneDate), cls: 'c-ok' };
    if (t.status === 'huy') return { txt: 'Đã hủy', cls: 'c-mut' };
    if (t.status === 'cho_duyet') return { txt: 'Chờ duyệt', cls: 'c-warn' };
    var n = diff(today(), t.dueDate);
    if (n < 0) return { txt: 'Quá hạn ' + (-n) + ' ngày', cls: 'c-red' };
    if (n === 0) return { txt: 'Hạn hôm nay', cls: 'c-warn' };
    if (n === 1) return { txt: 'Hạn ngày mai', cls: 'c-warn' };
    return { txt: 'Còn ' + n + ' ngày', cls: n <= 5 ? 'c-warn' : 'c-mut' };
  }
  function unreadTaskIds() {
    var o = {}; (D().notifs || []).forEach(function (n) { if (!n.read && n.taskId) o[n.taskId] = 1; }); return o;
  }
  function taskRow(t, unread) {
    var u = user(t.assigneeId), di = dueInfo(t), ev = (t.evidence || []).length, at = (t.attachments || []).length;
    var pri = t.priority === 'khan' ? ' · <span class="pri-khan">Khẩn cấp</span>' : t.priority === 'cao' ? ' · <span class="pri-cao">Cao</span>' : '';
    var showBar = (t.status === 'dang' || t.status === 'chua') && t.progress > 0;
    return '<div class="row" data-task="' + t.id + '"><span class="bullet' + (unread && unread[t.id] ? ' new' : '') + '"></span>' +
      '<div class="body"><div class="ttl">' + esc(t.title) + '</div><div class="meta"><span class="who">' + av(u) + '<span>' + esc(u ? u.name : '—') + '</span></span>' +
      '<span class="sub">· ' + esc(t.code) + pri + '</span>' + (at ? '<span class="sub">· ' + at + ' tài liệu</span>' : '') + (ev ? '<span class="sub">· ' + ev + ' minh chứng</span>' : '') +
      (t.status === 'de_xuat' ? '<span>· <b style="color:var(--s-dx)">Đề xuất</b></span>' : '') + '</div></div>' +
      '<div class="side"><b>' + ddmm(t.dueDate) + '</b><span class="' + di.cls + '">' + di.txt + '</span></div>' +
      (showBar ? '<div class="pbar"><i style="width:' + t.progress + '%"></i></div>' : '') + '</div>';
  }
  function bindRows(root) {
    root.querySelectorAll('[data-task]').forEach(function (el) { el.onclick = function () { openTask(el.getAttribute('data-task')); }; });
  }
  function header(title, opts) {
    opts = opts || {};
    var unread = (D().notifs || []).filter(function (n) { return !n.read; }).length;
    return '<div class="top' + (opts.back ? ' sub' : '') + '">' + (opts.back ? '<button class="iconbtn back" data-back aria-label="Quay lại">' + ic('left') + '</button>' : '') +
      (opts.logo ? '<img class="logo" src="' + esc(logoSrc()) + '" alt="Logo">' : '') +
      '<h1>' + esc(title) + '</h1>' + (opts.extra || '') +
      (opts.noRefresh ? '' : '<button class="iconbtn" data-refresh aria-label="Làm mới">' + ic('refresh') + '</button>') +
      '<button class="iconbtn" data-bell aria-label="Thông báo">' + ic('bell') + (unread ? '<span class="badge">' + (unread > 99 ? '99+' : unread) + '</span>' : '') + '</button></div>' +
      (DEMO && S.tab === 'home' ? '<div class="demo">Chế độ dùng thử: dữ liệu mẫu, chỉ lưu trên máy này. Khi nối Google Sheet, cả Phòng dùng chung dữ liệu.</div>' : '');
  }
  function bindHeader(root) {
    var r = root.querySelector('[data-refresh]'); if (r) r.onclick = function () { r.innerHTML = '<span class="spin"></span>'; load(false); };
    var b = root.querySelector('[data-bell]'); if (b) b.onclick = function () { go('more', 'notifs'); };
    var bk = root.querySelector('[data-back]'); if (bk) bk.onclick = function () { history.back(); };
  }

  /* ================= Thống kê ================= */
  function statsFor(list) {
    var c = { chua: 0, dang: 0, cho_duyet: 0, xong: 0, qua_han: 0 };
    list.forEach(function (t) { var s = eff(t); if (c[s] != null) c[s]++; });
    return c;
  }
  function stackBar(c, total, cls) {
    if (!total) return '<div class="stack ' + (cls || '') + '"></div>';
    return '<div class="stack ' + (cls || '') + '">' + ['chua', 'dang', 'cho_duyet', 'xong', 'qua_han'].map(function (k) {
      return c[k] ? '<i class="bg-' + k + '" style="flex:' + c[k] + '"></i>' : '';
    }).join('') + '</div>';
  }
  function legend(c) {
    return '<div class="legend">' + [['chua', 'Chưa bắt đầu'], ['dang', 'Đang làm'], ['cho_duyet', 'Chờ duyệt'], ['xong', 'Hoàn thành'], ['qua_han', 'Quá hạn']].map(function (x) {
      return '<span><i class="bg-' + x[0] + '"></i>' + x[1] + ' <b>' + c[x[0]] + '</b></span>';
    }).join('') + '</div>';
  }
  function rangeTasks(a, b) { return tasks().filter(function (t) { return counted(t) && overlaps(t, a, b); }); }
  function personEval(u, a, b) {
    var st = sett();
    var mine = rangeTasks(a, b).filter(function (t) { return t.assigneeId === u.id; });
    var xong = mine.filter(function (t) { return t.status === 'xong'; });
    var qua = mine.filter(function (t) { return eff(t) === 'qua_han'; });
    var tre = xong.filter(function (t) { return (t.doneDate || '') > t.dueDate; });
    var ph = rangeTasks(a, b).filter(function (t) { return (t.collaborators || []).indexOf(u.id) >= 0; }).length;
    var scored = xong.filter(function (t) { return t.score != null; });
    var score = null;
    if (scored.length || qua.length) {
      var base = scored.length ? scored.reduce(function (s, t) { return s + Number(t.score); }, 0) / scored.length : 100;
      score = Math.max(0, Math.round(base - qua.length * Number(st.truQuaHan || 5)));
    }
    return { u: u, giao: mine.length, xong: xong.length, dung: xong.length - tre.length, tre: tre.length, qua: qua.length, ph: ph, score: score, list: mine };
  }
  function nameCell(u) { return '<div class="nmw"><span class="n">' + esc(u.name) + '</span>' + (u.badge ? '<span class="tag pt">' + esc(u.badge) + '</span>' : '') + '</div>'; }
  function scoreBadge(s) { if (s == null) return '<span class="score n">—</span>'; return '<span class="score ' + (s >= 90 ? 'g' : s >= 70 ? 'y' : 'r') + '">' + s + '</span>'; }
  function curRange(mode, ym) {
    if (mode === 'year') { var sy = schoolYearOf(ym ? monthStart(ym[0], ym[1]) : today()); return yearRange(sy).concat(['Năm học ' + sy]); }
    var y = ym ? ym[0] : +today().slice(0, 4), m = ym ? ym[1] : +today().slice(5, 7);
    return [monthStart(y, m), monthEnd(y, m), 'Tháng ' + m + '/' + y];
  }

  /* ================= Trang chủ ================= */
  function attentionList() {
    var m = me(), lead = isLead();
    var list = tasks().filter(function (t) {
      if (t.status === 'xong' || t.status === 'huy') return false;
      if (lead) return true;
      if (t.assigneeId === m.id || (t.collaborators || []).indexOf(m.id) >= 0 || t.creatorId === m.id) return true;
      if ((t.status === 'cho_duyet' || t.status === 'de_xuat') && canAp(m, t)) return true;
      return false;
    });
    var rank = { khan: 0, cao: 1, thuong: 2 };
    return list.sort(function (a, b) {
      var oa = eff(a) === 'qua_han' ? 0 : 1, ob = eff(b) === 'qua_han' ? 0 : 1;
      return oa - ob || (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0) || rank[a.priority] - rank[b.priority];
    });
  }
  function upcomingReminders() {
    var out = [];
    (D().notes || []).forEach(function (n) {
      var nx = nextOcc(n); if (!nx) return;
      var d = diff(today(), nx);
      if (d >= 0 && d <= (n.remindDays == null ? 7 : n.remindDays)) out.push({ title: n.title, date: nx, d: d, kind: n.kind });
    });
    activeUsers().forEach(function (u) {
      if (!u.birthday || u.id === me().id) return;
      var nx = nextOcc({ date: u.birthday, yearly: true }); var d = diff(today(), nx);
      if (d >= 0 && d <= 3) out.push({ title: 'Sinh nhật ' + u.name, date: nx, d: d, kind: 'sinh_nhat' });
    });
    return out.sort(function (a, b) { return a.d - b.d; });
  }
  /* Cảnh báo của cá nhân: việc quá hạn, đến hạn, việc chờ mình duyệt */
  function alertsHtml() {
    var m = me(), td = today();
    var mine = tasks().filter(function (t) { return (t.status === 'chua' || t.status === 'dang') && (t.assigneeId === m.id || (t.collaborators || []).indexOf(m.id) >= 0); });
    var qua = mine.filter(function (t) { return t.dueDate < td; });
    var hom = mine.filter(function (t) { return t.dueDate === td; });
    var sap = mine.filter(function (t) { var d = diff(td, t.dueDate); return d >= 1 && d <= 2; });
    var duyet = tasks().filter(function (t) { return (t.status === 'cho_duyet' || t.status === 'de_xuat') && canAp(m, t); });
    var phong = isLead() ? tasks().filter(function (t) { return eff(t) === 'qua_han'; }) : [];
    var out = '';
    if (qua.length) out += '<div class="al r" data-al="qua">' + ic('alert') + '<div><b>' + qua.length + ' việc của bạn đã quá hạn</b><span>' + esc(qua.slice(0, 2).map(function (t) { return t.title; }).join('; ')) + (qua.length > 2 ? '…' : '') + '</span></div></div>';
    if (hom.length || sap.length) out += '<div class="al y" data-al="han">' + ic('clock') + '<div><b>' + (hom.length ? hom.length + ' việc đến hạn hôm nay' : '') + (hom.length && sap.length ? ', ' : '') + (sap.length ? sap.length + ' việc đến hạn trong 2 ngày tới' : '') + '</b><span>' + esc(hom.concat(sap).slice(0, 2).map(function (t) { return t.title; }).join('; ')) + '</span></div></div>';
    var myProp = tasks().filter(function (t) { return t.status === 'de_xuat' && t.creatorId === m.id; });
    if (myProp.length) out += '<div class="al b" data-al="myprop">' + ic('send') + '<div><b>' + myProp.length + ' đề xuất của bạn đang chờ duyệt</b><span>' + esc(myProp.slice(0, 2).map(function (t) { return t.title; }).join('; ')) + '</span></div></div>';
    if (duyet.length) out += '<div class="al b" data-al="duyet">' + ic('inbox') + '<div><b>' + duyet.length + ' việc chờ bạn duyệt</b><span>Báo hoàn thành, đề xuất của cán bộ</span></div></div>';
    if (phong.length) out += '<div class="al g" data-al="phong">' + ic('chart') + '<div><b>Phòng có ' + phong.length + ' việc quá hạn</b><span>Bấm để xem danh sách</span></div></div>';
    return out ? '<div class="alerts">' + out + '</div>' : '';
  }
  function renderHome() {
    var ym = S.month || [+today().slice(0, 4), +today().slice(5, 7)];
    var r = curRange('month', ym), mt = rangeTasks(r[0], r[1]), c = statsFor(mt);
    var att = attentionList(), unread = unreadTaskIds();
    var rem = upcomingReminders();
    var ppl = activeUsers().map(function (u) {
      var l = mt.filter(function (t) { return t.assigneeId === u.id; }); return { u: u, l: l, c: statsFor(l) };
    }).filter(function (x) { return x.l.length; }).sort(function (a, b) { return b.l.length - a.l.length; });
    var max = ppl.length ? ppl[0].l.length : 1;
    var sr = curRange(S.sumMode, ym);
    var rows = activeUsers().map(function (u) { return personEval(u, sr[0], sr[1]); })
      .sort(function (a, b) { return (b.score == null ? -1 : b.score) - (a.score == null ? -1 : a.score) || b.giao - a.giao; });

    var left = alertsHtml() + '<div class="sec"><h2>Cần chú ý</h2><button class="link" data-all>Xem tất cả</button></div>' +
      '<div class="card list">' + (att.length ? att.slice(0, 6).map(function (t) { return taskRow(t, unread); }).join('') : '<div class="empty">Không có việc cần chú ý.</div>') + '</div>' +
      (rem.length ? '<div class="sec"><h2>Nhắc riêng</h2><button class="link" data-notes>Ghi chú</button></div><div class="card list">' + rem.slice(0, 4).map(function (x) {
        return '<div class="row note" data-notes><span class="ni">' + ic(x.kind === 'sinh_nhat' ? 'cake' : x.kind === 'ky_niem' ? 'heart' : 'bell') + '</span><div class="body"><div class="ttl">' + esc(x.title) + '</div></div><div class="side"><b>' + ddmm(x.date) + '</b><span class="c-warn">' + (x.d === 0 ? 'Hôm nay' : 'Còn ' + x.d + ' ngày') + '</span></div></div>';
      }).join('') + '</div>' : '');

    var right = '<div class="sec"><h2>Tháng ' + ym[1] + ' của Phòng</h2><button class="link" data-eval>Đánh giá ' + ic('right').replace('<svg ', '<svg style="width:16px;height:16px" ') + '</button></div>' +
      '<div class="card pad">' + stackBar(c, mt.length) + legend(c) +
      '<div class="ppl">' + (ppl.length ? ppl.map(function (x) {
        return '<div class="p" data-person="' + x.u.id + '"><span class="n">' + esc(x.u.name) + '</span><div style="width:' + Math.max(8, Math.round(x.l.length / max * 100)) + '%">' + stackBar(x.c, x.l.length, 'sm') + '</div><span class="c">' + x.l.length + '</span></div>';
      }).join('') : '<div class="muted small">Chưa có công việc trong tháng.</div>') + '</div></div>' +
      '<div class="sec"><h2>Bảng tổng hợp ' + (S.sumMode === 'month' ? 'tháng ' + pad(ym[1]) + '/' + ym[0] : sr[2].toLowerCase()) + '</h2><div class="seg"><button data-sm="month" class="' + (S.sumMode === 'month' ? 'on' : '') + '">Tháng</button><button data-sm="year" class="' + (S.sumMode === 'year' ? 'on' : '') + '">Năm</button></div></div>' +
      '<div class="card tblwrap"><table class="tbl sum"><thead><tr><th>Cán bộ</th><th class="r">Xong/Giao</th><th class="r">Quá hạn</th><th class="r">Điểm</th></tr></thead><tbody>' +
      rows.map(function (x) {
        return '<tr data-person="' + x.u.id + '"><td>' + nameCell(x.u) + '</td><td class="r">' + x.xong + '/' + x.giao + '</td><td class="r' + (x.qua ? ' c-red' : '') + '">' + x.qua + '</td><td class="r">' + scoreBadge(x.score) + '</td></tr>';
      }).join('') + '</tbody></table></div><div class="foot">Điểm = bình quân điểm các việc hoàn thành trừ ' + sett().truQuaHan + ' điểm cho mỗi việc đang quá hạn.</div>';

    app.querySelector('.main').innerHTML = header('Trang chủ', { logo: true }) + '<div class="cols"><div>' + left + '</div><div>' + right + '</div></div>';
    var root = app.querySelector('.main');
    bindHeader(root); bindRows(root);
    root.querySelectorAll('[data-al]').forEach(function (el) {
      el.onclick = function () {
        var k = el.getAttribute('data-al');
        if (k === 'duyet') return go('more', 'review');
        if (k === 'myprop') { S.meTab = 'tasks'; S.myChip = 'de_xuat'; return go('me'); }
        S.filter = k === 'phong' ? {} : { person: me().id };
        S.taskChip = (k === 'qua' || k === 'phong') ? 'qua_han' : 'open'; S.taskView = 'list'; go('tasks');
      };
    });
    root.querySelector('[data-all]').onclick = function () { S.taskChip = isLead() ? 'open' : 'mine'; go('tasks'); };
    root.querySelector('[data-eval]').onclick = function () { go('more', 'eval'); };
    root.querySelectorAll('[data-notes]').forEach(function (el) { el.onclick = function () { S.meTab = 'notes'; go('me'); }; });
    root.querySelectorAll('[data-sm]').forEach(function (el) { el.onclick = function () { S.sumMode = el.getAttribute('data-sm'); render(); }; });
    root.querySelectorAll('[data-person]').forEach(function (el) { el.onclick = function () { S.filter = { person: el.getAttribute('data-person') }; S.taskChip = 'all'; go('tasks'); }; });
  }

  /* ================= Công việc ================= */
  function filteredTasks() {
    var m = me(), q = S.q.trim().toLowerCase(), f = S.filter || {};
    return tasks().filter(function (t) {
      var s = eff(t);
      switch (S.taskChip) {
        case 'open': if (t.status === 'xong' || t.status === 'huy') return false; break;
        case 'mine': if (t.assigneeId !== m.id && (t.collaborators || []).indexOf(m.id) < 0) return false; if (t.status === 'huy') return false; break;
        case 'qua_han': if (s !== 'qua_han') return false; break;
        case 'cho_duyet': if (t.status !== 'cho_duyet') return false; break;
        case 'de_xuat': if (t.status !== 'de_xuat') return false; break;
        case 'xong': if (t.status !== 'xong') return false; break;
        case 'huy': if (t.status !== 'huy') return false; break;
        default: if (t.status === 'huy') return false;
      }
      if (f.person && t.assigneeId !== f.person && (t.collaborators || []).indexOf(f.person) < 0) return false;
      if (f.team && t.team !== f.team) return false;
      if (f.priority && t.priority !== f.priority) return false;
      if (f.category && t.category !== f.category) return false;
      if (q) {
        var u = user(t.assigneeId);
        var hay = (t.title + ' ' + t.code + ' ' + (u ? u.name : '') + ' ' + (t.category || '')).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function renderTasks() {
    var chips = [['all', 'Tất cả'], ['mine', 'Của tôi'], ['open', 'Đang mở'], ['qua_han', 'Quá hạn'], ['cho_duyet', 'Chờ duyệt'], ['de_xuat', 'Đề xuất'], ['xong', 'Hoàn thành'], ['huy', 'Đã hủy']];
    var fcount = Object.keys(S.filter || {}).filter(function (k) { return S.filter[k]; }).length;
    var html = header('Công việc') +
      '<div class="bar"><label class="search">' + ic('search') + '<input id="q" placeholder="Tìm công việc, mã, người phụ trách" value="' + esc(S.q) + '"></label>' +
      '<button class="iconbtn" id="fbtn" aria-label="Bộ lọc">' + ic('filter') + (fcount ? '<span class="badge">' + fcount + '</span>' : '') + '</button></div>' +
      '<div class="bar"><button class="btn" id="propose">' + ic('send') + 'Đề xuất</button><div class="seg"><button data-v="list" class="' + (S.taskView === 'list' ? 'on' : '') + '">Danh sách</button><button data-v="gantt" class="' + (S.taskView === 'gantt' ? 'on' : '') + '">Tiến độ</button></div></div>' +
      (S.taskView === 'list' ? '<div class="chips">' + chips.map(function (c) { return '<button class="chip' + (S.taskChip === c[0] ? ' on' : '') + '" data-chip="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' : '') +
      (fcount ? '<div class="hint">Đang lọc: ' + filterText() + ' · <button class="link" id="clearf">Bỏ lọc</button></div>' : '') +
      '<div id="tbody" class="mt"></div>';
    var root = app.querySelector('.main'); root.innerHTML = html;
    bindHeader(root);
    drawTaskBody();
    var qi = root.querySelector('#q');
    qi.oninput = function () { S.q = qi.value; drawTaskBody(); };
    root.querySelector('#fbtn').onclick = openFilter;
    root.querySelector('#propose').onclick = function () { if (isLead()) openTaskForm(null); else openTaskForm(null, { propose: true }); };
    root.querySelectorAll('[data-v]').forEach(function (b) { b.onclick = function () { S.taskView = b.getAttribute('data-v'); LS.set('pdt_taskview', S.taskView); render(); }; });
    root.querySelectorAll('[data-chip]').forEach(function (b) { b.onclick = function () { S.taskChip = b.getAttribute('data-chip'); render(); }; });
    var cf = root.querySelector('#clearf'); if (cf) cf.onclick = function () { S.filter = {}; render(); };
  }
  function filterText() {
    var f = S.filter, a = [];
    if (f.person) a.push((user(f.person) || {}).name);
    if (f.team) a.push(PDT.TEAMS[f.team]);
    if (f.priority) a.push('Ưu tiên ' + PDT.PRIORITY[f.priority]);
    if (f.category) a.push(f.category);
    return esc(a.join(', '));
  }
  function drawTaskBody() {
    var el = document.getElementById('tbody'); if (!el) return;
    if (S.taskView === 'gantt') { el.innerHTML = ganttHtml(); bindGantt(el); return; }
    var list = filteredTasks().sort(function (a, b) {
      var da = a.status === 'xong' ? 1 : 0, db = b.status === 'xong' ? 1 : 0;
      return da - db || (da ? (a.doneDate < b.doneDate ? 1 : -1) : (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
    });
    el.innerHTML = '<div class="muted small" style="margin:0 4px 8px">' + list.length + ' công việc</div><div class="card list">' +
      (list.length ? list.map(function (t) { return taskRow(t, unreadTaskIds()); }).join('') : '<div class="empty">Không có công việc phù hợp.</div>') + '</div>';
    bindRows(el);
  }
  function ganttHtml() {
    var ym = S.month || [+today().slice(0, 4), +today().slice(5, 7)];
    var y = ym[0], m = ym[1], a = monthStart(y, m), b = monthEnd(y, m), days = +b.slice(8, 10);
    var list = filteredTasks().filter(function (t) { return t.status !== 'huy' && overlaps(t, a, b); })
      .sort(function (p, q) { return startOf(p) < startOf(q) ? -1 : startOf(p) > startOf(q) ? 1 : (p.dueDate < q.dueDate ? -1 : 1); });
    var W = 38, LW = window.innerWidth < 600 ? 150 : 240, RH = 54;
    var dn = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    var g = '<div class="g" style="width:' + (LW + days * W) + 'px"><div class="gr"><div class="gh" style="width:' + LW + 'px">' + list.length + ' công việc</div>';
    for (var d = 1; d <= days; d++) {
      var dt = new Date(y, m - 1, d), wd = dt.getDay(), isT = iso(dt) === today();
      g += '<div class="gd' + (wd === 0 || wd === 6 ? ' we' : '') + (isT ? ' td' : '') + '" style="width:' + W + 'px">' + dn[wd] + '<b>' + d + '</b></div>';
    }
    g += '</div>';
    var cells = '';
    for (var d2 = 1; d2 <= days; d2++) { var wd2 = new Date(y, m - 1, d2).getDay(); cells += '<div class="gc' + (wd2 === 0 || wd2 === 6 ? ' we' : '') + '" style="width:' + W + 'px"></div>'; }
    list.forEach(function (t) {
      var u = user(t.assigneeId);
      var s = startOf(t) < a ? a : startOf(t), e = t.dueDate > b ? b : t.dueDate;
      var si = +s.slice(8, 10) - 1, ei = +e.slice(8, 10) - 1;
      var st = eff(t), col = 'var(--s-' + ({ chua: 'chua', dang: 'dang', cho_duyet: 'cho', xong: 'xong', qua_han: 'qua', de_xuat: 'dx' }[st] || 'chua') + ')';
      var p = t.status === 'xong' ? 100 : (t.progress || 0);
      g += '<div class="gr"><div class="gl" data-task="' + t.id + '" style="width:' + LW + 'px;height:' + RH + 'px"><b>' + esc(t.title) + '</b><span>' + esc(u ? u.name : '') + '</span></div>';
      g += '<div class="gt" style="width:' + (days * W) + 'px;height:' + RH + 'px">' + cells +
        '<div class="gb' + (p === 0 ? ' zero' : '') + '" data-task="' + t.id + '" title="' + esc(t.title + ' – ' + ST_LABEL[st]) + '" style="left:' + (si * W + 3) + 'px;width:' + ((ei - si + 1) * W - 6) + 'px">' +
        '<div class="tr" style="background:' + col + '"></div><div class="fi" style="width:' + p + '%;background:' + col + '"></div><span>' + p + '%</span></div></div></div>';
    });
    g += '</div>';
    return '<div class="bar"><button class="iconbtn" data-gm="-1" aria-label="Tháng trước">' + ic('left') + '</button><b style="font-size:17px">Tháng ' + pad(m) + '/' + y + '</b><button class="iconbtn" data-gm="1" aria-label="Tháng sau">' + ic('right') + '</button><button class="btn sm" data-gm="0">Tháng này</button></div>' +
      '<div class="legend" style="margin:0 0 10px">' + [['dang', 'Đang làm'], ['cho_duyet', 'Chờ duyệt'], ['xong', 'Hoàn thành'], ['qua_han', 'Quá hạn'], ['chua', 'Chưa bắt đầu']].map(function (x) { return '<span><i class="bg-' + x[0] + '"></i>' + x[1] + '</span>'; }).join('') + '</div>' +
      '<div class="gantt">' + (list.length ? g : '<div class="empty">Không có công việc trong tháng.</div>') + '</div>';
  }
  function bindGantt(el) {
    bindRows(el);
    el.querySelectorAll('[data-gm]').forEach(function (b) {
      b.onclick = function () {
        var k = +b.getAttribute('data-gm'), ym = S.month || [+today().slice(0, 4), +today().slice(5, 7)];
        S.ganttLeft = null;
        if (k === 0) S.month = null; else { var d = new Date(ym[0], ym[1] - 1 + k, 1); S.month = [d.getFullYear(), d.getMonth() + 1]; }
        drawTaskBody();
      };
    });
    var gw = el.querySelector('.gantt');
    var ym = S.month || [+today().slice(0, 4), +today().slice(5, 7)];
    if (gw) {
      if (S.ganttLeft != null) gw.scrollLeft = S.ganttLeft;
      else if (today().slice(0, 7) === ym[0] + '-' + pad(ym[1])) gw.scrollLeft = Math.max(0, (+today().slice(8, 10) - 3) * 38);
      gw.addEventListener('scroll', function () { S.ganttLeft = gw.scrollLeft; });
    }
  }
  function openFilter() {
    var f = S.filter || {};
    ask('Bộ lọc', [
      { name: 'person', label: 'Cán bộ', type: 'select', value: f.person || '', options: [['', 'Tất cả']].concat(activeUsers().map(function (u) { return [u.id, u.name]; })) },
      { name: 'team', label: 'Tổ', type: 'select', value: f.team || '', options: [['', 'Tất cả']].concat(Object.keys(PDT.TEAMS).map(function (k) { return [k, PDT.TEAMS[k]]; })) },
      { name: 'priority', label: 'Mức ưu tiên', type: 'select', value: f.priority || '', options: [['', 'Tất cả'], ['khan', 'Khẩn cấp'], ['cao', 'Cao'], ['thuong', 'Thường']] },
      { name: 'category', label: 'Danh mục', type: 'select', value: f.category || '', options: [['', 'Tất cả']].concat((sett().categories || []).map(function (c) { return [c, c]; })) }
    ], 'Áp dụng').then(function (r) { if (r) { S.filter = r; render(); } });
  }

  /* ================= Chi tiết công việc ================= */
  function openTask(id) {
    var t = task(id); if (!t) return;
    var ov = openModal(t.code, '<div class="empty"><span class="spin"></span></div>');
    var unreadIds = (D().notifs || []).filter(function (n) { return !n.read && n.taskId === id; }).map(function (n) { return n.id; });
    if (unreadIds.length) { (D().notifs || []).forEach(function (n) { if (unreadIds.indexOf(n.id) >= 0) n.read = true; }); render(); api('readNotifs', { ids: unreadIds }).catch(function () { }); }
    function draw(logs) {
      t = task(id) || t;
      refreshModal(ov, taskDetailHtml(t, logs));
      var sf = ov.querySelector('.sf'); sf.className = 'sf act'; sf.innerHTML = taskDetailHtml.main;
      bindTaskDetail(ov, t, logs, draw);
    }
    api('taskDetail', { id: id }).then(function (r) { draw(r.logs); }).catch(function (e) { draw([]); toast(e.message); });
  }
  function planItemLabel(key) {
    if (!key) return '';
    var p = key.split('#'), plan = (D().plans || []).filter(function (x) { return x.id === p[0]; })[0];
    if (!plan) return '';
    var it = (plan.items || []).filter(function (x) { return x.id === p[1]; })[0];
    if (!it) return '';
    return plan.kind === 'nam' ? 'NV ' + (it.code || '') + ' – ' + it.title : 'KH tháng ' + plan.month.split('-').reverse().join('/') + ': ' + it.title;
  }
  function taskDetailHtml(t, logs) {
    var m = me(), s = eff(t), di = dueInfo(t), u = user(t.assigneeId), cr = user(t.creatorId);
    var canWork = PDT.canWork(m, t), canMan = PDT.canManage(m, t), canAp = canAp0(m, t);
    var isCollab = (t.collaborators || []).indexOf(m.id) >= 0;
    var btns = [], main = [];
    if (t.status === 'de_xuat' && canAp) { main.push('<button class="btn dan" data-op="reject">Không duyệt</button>'); main.push('<button class="btn" data-op="revise">Yêu cầu sửa</button>'); main.push('<button class="btn ok" data-op="accept">' + ic('check') + 'Duyệt, triển khai</button>'); }
    if (t.status === 'de_xuat' && t.creatorId === m.id) { main.push('<button class="btn dan" data-op="withdraw">Rút đề xuất</button>'); main.push('<button class="btn pri" data-edit>' + ic('edit') + 'Sửa đề xuất</button>'); }
    if (canWork && t.status === 'chua') main.push('<button class="btn" data-op="start">Bắt đầu làm</button>');
    if (canWork && (t.status === 'chua' || t.status === 'dang')) main.push('<button class="btn pri" data-op="submit">' + ic('check') + 'Báo hoàn thành</button>');
    if (canAp && t.status === 'cho_duyet') { main.push('<button class="btn" data-op="return">Trả lại</button>'); main.push('<button class="btn ok" data-op="approve">' + ic('check') + 'Duyệt, chấm điểm</button>'); }
    if (canAp && t.status === 'xong') btns.push('<button class="btn" data-op="reopen">Mở lại</button>');
    if (canMan && t.status !== 'huy' && t.status !== 'xong' && t.status !== 'de_xuat') btns.push('<button class="btn" data-edit>' + ic('edit') + 'Sửa</button>');
    if (canMan && t.status !== 'huy' && t.status !== 'xong' && t.status !== 'de_xuat') btns.push('<button class="btn dan" data-op="cancel">Hủy việc</button>');
    if (canMan && t.status === 'huy') btns.push('<button class="btn" data-op="restore">Khôi phục</button>');
    var collab = (t.collaborators || []).map(function (id) { var x = user(id); return x ? esc(x.name) : ''; }).filter(Boolean).join(', ');
    var pl = planItemLabel(t.planItem);
    var dxNote = t.status === 'de_xuat' ? '<div class="al b" style="margin:0 0 10px">' + ic('inbox') + '<div><b>Đề xuất đang chờ duyệt</b><span style="white-space:normal">' +
      (t.creatorId === m.id ? 'Khi được duyệt, việc tự chuyển sang triển khai và anh/chị nhận thông báo.' : canAp ? 'Bấm "Duyệt, triển khai" để giao việc ngay cho người đề xuất; có thể đổi người thực hiện, hạn.' : 'Chờ lãnh đạo Phòng, tổ trưởng duyệt.') + '</span></div></div>' : '';
    var html = '<div class="dh">' + dxNote + stPill(t) + ' <span class="pill">' + PDT.PRIORITY[t.priority || 'thuong'] + '</span>' +
      '<h2>' + esc(t.title) + '</h2><div class="' + di.cls + ' small">' + di.txt + '</div>' +
      '<dl class="kv"><dt>Người phụ trách</dt><dd>' + esc(u ? u.name : '—') + '</dd>' +
      (collab ? '<dt>Phối hợp</dt><dd>' + collab + '</dd>' : '') +
      '<dt>' + (t.status === 'de_xuat' || (cr && !PDT.isLead(cr) && !PDT.isTeamLead(cr)) ? 'Người đề xuất' : 'Người giao') + '</dt><dd>' + esc(cr ? cr.name : '—') + '</dd>' +
      (t.team ? '<dt>Tổ</dt><dd>' + esc(PDT.TEAMS[t.team] || t.team) + '</dd>' : '') +
      (t.category ? '<dt>Danh mục</dt><dd>' + esc(t.category) + '</dd>' : '') +
      '<dt>Thời gian</dt><dd>' + ddmmyyyy(startOf(t)) + ' → ' + ddmmyyyy(t.dueDate) + '</dd>' +
      (t.doneDate ? '<dt>Hoàn thành</dt><dd>' + ddmmyyyy(t.doneDate) + (t.score != null ? ' · <b>' + t.score + ' điểm</b>' : '') + '</dd>' : '') +
      (pl ? '<dt>Thuộc kế hoạch</dt><dd>' + esc(pl) + '</dd>' : '') + '</dl>' +
      (t.desc ? '<div class="mt" style="white-space:pre-wrap">' + esc(t.desc) + '</div>' : '') + '</div>';
    var atts = t.attachments || [];
    if (atts.length || canMan) html += '<div class="dh"><div style="display:flex;justify-content:space-between;align-items:center"><b>Tài liệu kèm theo (' + atts.length + ')</b>' +
      (canMan && t.status !== 'huy' ? '<span class="btns"><button class="btn sm" data-attlink>' + ic('link') + 'Dán link</button>' + (DEMO ? '' : '<button class="btn sm" data-attfile>' + ic('clip') + 'Tải tệp</button>') + '</span>' : '') + '</div>' +
      (atts.length ? atts.map(function (e) {
        return '<div class="ev">' + ic('clip') + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + '</a><span class="small muted">' + timeAgo(e.at) + '</span>' +
          (canMan ? '<button class="iconbtn" data-rmatt="' + e.id + '" aria-label="Gỡ">' + ic('trash') + '</button>' : '') + '</div>';
      }).join('') : '<div class="small muted mt">Chưa có tài liệu. Đính kèm công văn, biểu mẫu, dữ liệu gốc để người thực hiện dùng.</div>') +
      '<input type="file" id="attfile" multiple hidden></div>';
    var p = t.status === 'xong' ? 100 : (t.progress || 0);
    html += '<div class="dh"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b>Tiến độ</b><b id="pv">' + p + '%</b></div><div class="prog"><i style="width:' + p + '%"></i></div>' +
      (canWork && (t.status === 'chua' || t.status === 'dang') ? '<input type="range" id="prg" min="0" max="100" step="5" value="' + p + '" class="mt" aria-label="Tiến độ"><div class="btns mt"><button class="btn sm" id="saveprg">Lưu tiến độ</button></div>' : '') +
      (btns.length ? '<div class="btns mt">' + btns.join('') + '</div>' : '') + '</div>';
    html += '<div class="dh"><div style="display:flex;justify-content:space-between;align-items:center"><b>Minh chứng (' + (t.evidence || []).length + ')</b>' +
      ((canWork || isCollab) ? '<span class="btns"><button class="btn sm" data-addlink>' + ic('link') + 'Dán link</button>' + (DEMO ? '' : '<button class="btn sm" data-addfile>' + ic('clip') + 'Tải tệp</button>') + '</span>' : '') + '</div>' +
      ((t.evidence || []).length ? (t.evidence || []).map(function (e) {
        var by = user(e.by);
        return '<div class="ev">' + ic('clip') + '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + '</a><span class="small muted">' + esc(by ? initials(by.name) : '') + ' ' + timeAgo(e.at) + '</span>' +
          ((e.by === m.id || canMan) ? '<button class="iconbtn" data-rmev="' + e.id + '" aria-label="Gỡ">' + ic('trash') + '</button>' : '') + '</div>';
      }).join('') : '<div class="small muted mt">Chưa có minh chứng.</div>') +
      '<input type="file" id="evfile" multiple hidden></div>';
    html += '<div class="dh"><b>Trao đổi và lịch sử</b><div class="logs mt">' + (logs || []).map(function (l) {
      var lu = user(l.userId);
      return '<div class="log' + (l.kind === 'comment' ? ' c' : '') + '">' + av(lu) + '<div class="lb"><b>' + esc(lu ? lu.name : '') + '</b> <span class="lt">' + timeAgo(l.at) + '</span>' +
        (l.kind === 'comment' ? '<div class="tx">' + esc(l.text) + '</div>' : '<div class="muted">' + esc(l.text) + '</div>') + '</div></div>';
    }).join('') + '</div><form id="cmt" class="bar mt mb0"><input class="inp" style="flex:1" name="text" placeholder="Viết trao đổi…" autocomplete="off"><button class="btn pri" aria-label="Gửi">' + ic('send') + '</button></form></div>';
    taskDetailHtml.main = main.join('');
    return html;
  }
  function bindTaskDetail(ov, t, logs, draw) {
    var reload = function () { return api('taskDetail', { id: t.id }).then(function (r) { draw(r.logs); }).catch(function () { }); };
    function run(x, msg) {
      var p = act('taskAction', x, msg, localTaskOp(x));
      draw(logs);
      p.then(reload).catch(function () { draw(logs); });
    }
    var prg = ov.querySelector('#prg');
    if (prg) {
      prg.oninput = function () { ov.querySelector('#pv').textContent = prg.value + '%'; ov.querySelector('.prog i').style.width = prg.value + '%'; };
      ov.querySelector('#saveprg').onclick = function () { run({ id: t.id, op: 'progress', progress: +prg.value }, 'Đã lưu tiến độ'); };
    }
    ov.querySelectorAll('[data-op]').forEach(function (b) {
      b.onclick = function () {
        var op = b.getAttribute('data-op');
        if (op === 'approve') {
          var def = PDT.defaultScore(t, sett());
          ask('Duyệt hoàn thành', [
            { name: 'score', label: 'Điểm công việc (0–100)', type: 'number', value: def, min: 0, max: 100, hint: 'Gợi ý tự tính: 100 trừ ' + sett().truMoiNgayTre + ' điểm mỗi ngày nộp trễ (tối đa ' + sett().truToiDa + ').' },
            { name: 'note', label: 'Nhận xét (không bắt buộc)', type: 'textarea' }
          ], 'Duyệt').then(function (r) { if (r) run({ id: t.id, op: 'approve', score: r.score, note: r.note }, 'Đã duyệt'); });
        } else if (op === 'accept') {
          var pu = user(t.assigneeId);
          var opts = activeUsers().filter(function (u) { return u.id === t.assigneeId || PDT.canAssignTo(me(), u); }).map(function (u) { return [u.id, u.name + (u.id === t.creatorId ? ' (người đề xuất)' : '')]; });
          ask('Duyệt đề xuất, triển khai', [
            { name: 'assigneeId', label: 'Người thực hiện', type: 'select', value: t.assigneeId, options: opts, hint: 'Mặc định là người đề xuất. Sau khi duyệt, việc tự chuyển sang Đang làm và gửi thông báo.' },
            { name: 'dueDate', label: 'Hạn hoàn thành', type: 'date', value: t.dueDate < today() ? today() : t.dueDate },
            { name: 'priority', label: 'Mức ưu tiên', type: 'select', value: t.priority || 'thuong', options: [['thuong', 'Thường'], ['cao', 'Cao'], ['khan', 'Khẩn cấp']] },
            { name: 'note', label: 'Ý kiến chỉ đạo (không bắt buộc)', type: 'textarea' }
          ], 'Duyệt, triển khai').then(function (r) {
            if (!r) return;
            if (!r.dueDate || r.dueDate < today()) { toast('Hạn hoàn thành phải từ hôm nay trở đi'); return; }
            run({ id: t.id, op: 'accept', assigneeId: r.assigneeId, dueDate: r.dueDate, priority: r.priority, note: r.note }, 'Đã duyệt, việc chuyển sang triển khai');
          });
        } else if (op === 'return' || op === 'cancel' || op === 'submit' || op === 'reopen' || op === 'reject' || op === 'revise' || op === 'withdraw') {
          var lb = { return: ['Trả lại công việc', 'Lý do, yêu cầu hoàn thiện', 'Trả lại'], cancel: ['Hủy công việc', 'Lý do hủy', 'Hủy việc'], submit: ['Báo hoàn thành', 'Kết quả, ghi chú (không bắt buộc)', 'Gửi'], reopen: ['Mở lại công việc', 'Lý do', 'Mở lại'],
            reject: ['Không duyệt đề xuất', 'Lý do (gửi người đề xuất) *', 'Không duyệt'], revise: ['Yêu cầu chỉnh sửa đề xuất', 'Nội dung cần chỉnh sửa *', 'Gửi yêu cầu'], withdraw: ['Rút đề xuất', 'Lý do (không bắt buộc)', 'Rút đề xuất'] }[op];
          var must = op === 'reject' || op === 'revise';
          ask(lb[0], [{ name: 'note', label: lb[1], type: 'textarea' }], lb[2]).then(function (r) {
            if (!r) return;
            if (must && !String(r.note || '').trim()) { toast('Chưa nhập nội dung'); return; }
            run({ id: t.id, op: op, note: r.note }, op === 'revise' ? 'Đã gửi yêu cầu chỉnh sửa' : 'Đã cập nhật');
          });
        } else {
          run({ id: t.id, op: op }, 'Đã cập nhật');
        }
      };
    });
    var ed = ov.querySelector('[data-edit]'); if (ed) ed.onclick = function () { openTaskForm(task(t.id), { after: reload }); };
    var atl = ov.querySelector('[data-attlink]');
    if (atl) atl.onclick = function () {
      ask('Thêm tài liệu kèm theo', [{ name: 'name', label: 'Tên tài liệu', ph: 'Ví dụ: Công văn số … của Bộ' }, { name: 'url', label: 'Đường dẫn (Google Drive, OneDrive…)', type: 'url', ph: 'https://' }], 'Thêm')
        .then(function (r) { if (r) act('addAttachment', { taskId: t.id, name: r.name, url: r.url }, 'Đã thêm tài liệu').then(reload); });
    };
    var atb = ov.querySelector('[data-attfile]'), atf = ov.querySelector('#attfile');
    if (atb) atb.onclick = function () { atf.click(); };
    if (atf) atf.onchange = function () { uploadFiles(t.id, 'attachment', atf.files).then(reload); };
    ov.querySelectorAll('[data-rmatt]').forEach(function (b) {
      b.onclick = function () { confirmBox('Gỡ tài liệu', 'Gỡ tài liệu này khỏi công việc?', 'Gỡ').then(function (ok) { if (ok) act('removeAttachment', { taskId: t.id, id: b.getAttribute('data-rmatt') }, 'Đã gỡ').then(reload); }); };
    });
    var al = ov.querySelector('[data-addlink]');
    if (al) al.onclick = function () {
      ask('Thêm minh chứng', [{ name: 'name', label: 'Tên minh chứng', ph: 'Ví dụ: Công văn số …' }, { name: 'url', label: 'Đường dẫn (Google Drive, OneDrive…)', type: 'url', ph: 'https://' }], 'Thêm')
        .then(function (r) { if (r) act('addEvidence', { taskId: t.id, name: r.name, url: r.url }, 'Đã thêm minh chứng').then(reload); });
    };
    var af = ov.querySelector('[data-addfile]'), fi = ov.querySelector('#evfile');
    if (af) af.onclick = function () { fi.click(); };
    if (fi) fi.onchange = function () { uploadFiles(t.id, 'evidence', fi.files).then(reload); };
    ov.querySelectorAll('[data-rmev]').forEach(function (b) {
      b.onclick = function () { confirmBox('Gỡ minh chứng', 'Gỡ minh chứng này khỏi công việc?', 'Gỡ').then(function (ok) { if (ok) { var eid = b.getAttribute('data-rmev'); var p = act('removeEvidence', { taskId: t.id, id: eid }, 'Đã gỡ', function (d) { var k = d.tasks.filter(function (z) { return z.id === t.id; })[0], old = k.evidence; k.evidence = (old || []).filter(function (z) { return z.id !== eid; }); return function () { k.evidence = old; }; }); draw(logs); p.then(reload).catch(function () { draw(logs); }); } }); };
    });
    var cf = ov.querySelector('#cmt');
    cf.onsubmit = function (e) {
      e.preventDefault(); var v = cf.text.value.trim(); if (!v) return;
      draw((logs || []).concat([{ id: 'tam', userId: me().id, kind: 'comment', text: v, at: new Date().toISOString() }]));
      inflight++;
      api('addComment', { taskId: t.id, text: v }).then(function (r) { inflight--; draw(r.logs); scheduleSync(); })
        .catch(function (er) { inflight = Math.max(0, inflight - 1); toast(er.message); draw(logs); var c2 = ov.querySelector('#cmt'); if (c2) c2.text.value = v; });
    };
  }

  /* Tải lần lượt nhiều tệp lên Drive: tệp đến 4 MB gửi một lần; tệp lớn (tới 50 MB) gửi từng phần 4 MB */
  var MAX_MB = 50, SMALL = 4 * 1024 * 1024;
  function fileB64(f) { return new Promise(function (res, rej) { var rd = new FileReader(); rd.onload = function () { res(String(rd.result).split(',')[1]); }; rd.onerror = function () { rej(new Error('Không đọc được tệp ' + f.name)); }; rd.readAsDataURL(f); }); }
  function uploadOne(taskId, target, f, label) {
    if (f.size <= SMALL) {
      return fileB64(f).then(function (b64) { return api(target === 'attachment' ? 'addAttachment' : 'addEvidence', { taskId: taskId, name: f.name, mime: f.type, base64: b64 }); });
    }
    return api('uploadStart', { taskId: taskId, target: target, name: f.name, mime: f.type || 'application/octet-stream', size: f.size }).then(function (s) {
      var off = 0;
      function next() {
        var end = Math.min(off + s.chunk, f.size), last = end >= f.size;
        toast(label + ': ' + Math.round(off / f.size * 100) + '%');
        return fileB64(f.slice(off, end)).then(function (b64) { return api('uploadChunk', { uploadId: s.uploadId, offset: off, data: b64, last: last }); })
          .then(function (r) { if (r.done) return r; off = end; return next(); });
      }
      return next();
    });
  }
  function uploadFiles(taskId, target, files) {
    var list = Array.prototype.slice.call(files || []), ok = 0, big = [];
    list = list.filter(function (f) { if (f.size > MAX_MB * 1024 * 1024) { big.push(f.name); return false; } return true; });
    if (big.length) toast('Bỏ qua tệp lớn hơn ' + MAX_MB + ' MB (hãy dán link Drive): ' + big.join(', '));
    if (!list.length) return Promise.resolve(0);
    inflight++;
    return list.reduce(function (p, f, i) {
      return p.then(function () {
        var label = 'Đang tải ' + (list.length > 1 ? (i + 1) + '/' + list.length + ' ' : '') + f.name;
        toast(label);
        return uploadOne(taskId, target, f, label)
          .then(function (r) { ok++; merge('upload', {}, r); render(); })
          .catch(function (e) { toast(f.name + ': ' + e.message); });
      });
    }, Promise.resolve()).then(function () {
      inflight = Math.max(0, inflight - 1);
      if (ok) toast('Đã tải ' + ok + '/' + list.length + ' tệp');
      scheduleSync();
      return ok;
    });
  }

  /* ================= Biểu mẫu công việc ================= */
  function planOptions() {
    var out = [['', '— Không gắn —']];
    (D().plans || []).forEach(function (p) {
      (p.items || []).forEach(function (it) {
        out.push([p.id + '#' + it.id, p.kind === 'nam' ? 'NV ' + (it.code || '') + ' (' + p.year + ') – ' + it.title : 'KH tháng ' + p.month.split('-').reverse().join('/') + ' – ' + it.title]);
      });
    });
    return out;
  }
  function openTaskForm(t, opts) {
    opts = opts || {};
    var m = me(), isNew = !t, propose = !!opts.propose;
    t = t || opts.draft || { title: opts.title || '', desc: '', assigneeId: opts.assigneeId || (propose ? m.id : ''), collaborators: [], team: opts.team || m.team || '', priority: 'thuong', category: '', startDate: today(), dueDate: opts.dueDate || addDays(today(), 7), planItem: opts.planItem || '' };
    var assignable = activeUsers().filter(function (u) { return propose ? true : PDT.canAssignTo(m, u); });
    if (!assignable.length) { assignable = [m]; propose = true; }
    var html = '<form id="tf">' +
      (propose && isNew ? '<div class="demo" style="background:var(--primary-soft);border-color:transparent;color:var(--primary)">Đề xuất được gửi ' + (isTL() ? 'lãnh đạo Phòng' : 'Tổ trưởng, Tổ phó và lãnh đạo Phòng') + ' duyệt. Khi được duyệt, việc tự chuyển sang triển khai, anh/chị là người thực hiện và nhận thông báo.</div>' : '') +
      '<div class="fld"><label>Tên công việc *</label><input class="inp" name="title" required value="' + esc(t.title) + '"></div>' +
      '<div class="fld"><label>Nội dung, yêu cầu sản phẩm</label><textarea class="inp" name="desc">' + esc(t.desc) + '</textarea></div>' +
      (propose && isNew ? '<div class="fld"><label>Lý do đề xuất, kết quả dự kiến</label><textarea class="inp" name="reason" placeholder="Vì sao cần làm, sản phẩm đầu ra, căn cứ…">' + esc(t.reason || '') + '</textarea></div>' : '') +
      '<div class="two"><div class="fld"><label>' + (propose ? 'Người đề xuất thực hiện' : 'Người phụ trách *') + '</label><select class="inp" name="assigneeId">' +
      (isNew && !propose ? '<option value="">— Chọn —</option>' : '') +
      assignable.map(function (u) { return '<option value="' + u.id + '"' + (u.id === t.assigneeId ? ' selected' : '') + '>' + esc(u.name) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label>Tổ</label><select class="inp" name="team"><option value="">Chung của Phòng</option>' + Object.keys(PDT.TEAMS).map(function (k) { return '<option value="' + k + '"' + (t.team === k ? ' selected' : '') + '>' + esc(PDT.TEAMS[k]) + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="fld"><label>Người phối hợp</label><div class="checks">' + activeUsers().map(function (u) { return '<label><input type="checkbox" name="col" value="' + u.id + '"' + ((t.collaborators || []).indexOf(u.id) >= 0 ? ' checked' : '') + '>' + esc(u.name) + '</label>'; }).join('') + '</div></div>' +
      '<div class="two"><div class="fld"><label>Ngày bắt đầu</label><input class="inp" type="date" name="startDate" value="' + esc(t.startDate || today()) + '"></div>' +
      '<div class="fld"><label>Hạn hoàn thành *</label><input class="inp" type="date" name="dueDate" required value="' + esc(t.dueDate) + '"></div></div>' +
      '<div class="two"><div class="fld"><label>Mức ưu tiên</label><select class="inp" name="priority">' + [['thuong', 'Thường'], ['cao', 'Cao'], ['khan', 'Khẩn cấp']].map(function (x) { return '<option value="' + x[0] + '"' + (t.priority === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label>Danh mục</label><select class="inp" name="category"><option value="">—</option>' + (sett().categories || []).map(function (c) { return '<option' + (t.category === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></div></div>' +
      (isNew ? '<div class="fld"><label>Tài liệu kèm theo</label><div id="attlist"></div><div class="btns">' +
        (DEMO ? '' : '<button type="button" class="btn sm" id="attpick">' + ic('clip') + 'Đính kèm tệp</button>') +
        '<button type="button" class="btn sm" id="attlinkf">' + ic('link') + 'Dán link</button></div>' +
        '<input type="file" id="attin" multiple hidden><div class="hint">Công văn, biểu mẫu, dữ liệu gốc… Mỗi tệp tối đa 50 MB; tệp lớn hơn hãy dán link Google Drive.</div></div>' : '') +
      '<div class="fld"><label>Thuộc kế hoạch, nhiệm vụ trọng tâm</label><select class="inp" name="planItem">' + planOptions().map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === t.planItem ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>' +
      '</form>';
    var ov = openModal(isNew ? (propose ? 'Đề xuất công việc' : 'Giao việc mới') : 'Sửa công việc', html, { foot: '<button class="btn" data-x>Hủy</button><button class="btn pri" data-save>' + (isNew ? (propose ? 'Gửi đề xuất' : 'Giao việc') : 'Lưu') + '</button>' });
    var f = ov.querySelector('#tf');
    f.assigneeId.onchange = function () { var u = user(f.assigneeId.value); if (u && u.team && isNew) f.team.value = u.team; };
    var pend = (opts.draft && opts.draft.attachments) ? opts.draft.attachments.slice() : [], pendFiles = [];
    function drawAtt() {
      var el = ov.querySelector('#attlist'); if (!el) return;
      el.innerHTML = pend.map(function (a, i) { return '<div class="ev">' + ic('link') + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(a.name) + '</span><button type="button" class="iconbtn" data-rl="' + i + '" aria-label="Bỏ">' + ic('x') + '</button></div>'; }).join('') +
        pendFiles.map(function (fl, i) { return '<div class="ev">' + ic('clip') + '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(fl.name) + ' <span class="muted small">(' + Math.max(1, Math.round(fl.size / 1024)) + ' KB)</span></span><button type="button" class="iconbtn" data-rf="' + i + '" aria-label="Bỏ">' + ic('x') + '</button></div>'; }).join('');
      el.querySelectorAll('[data-rl]').forEach(function (b) { b.onclick = function () { pend.splice(+b.getAttribute('data-rl'), 1); drawAtt(); }; });
      el.querySelectorAll('[data-rf]').forEach(function (b) { b.onclick = function () { pendFiles.splice(+b.getAttribute('data-rf'), 1); drawAtt(); }; });
    }
    var ap = ov.querySelector('#attpick'), ai = ov.querySelector('#attin'), alf = ov.querySelector('#attlinkf');
    if (ap) ap.onclick = function () { ai.click(); };
    if (ai) ai.onchange = function () {
      Array.prototype.slice.call(ai.files).forEach(function (fl) { if (fl.size > MAX_MB * 1024 * 1024) toast(fl.name + ' lớn hơn ' + MAX_MB + ' MB, hãy dán link Drive.'); else pendFiles.push(fl); });
      ai.value = ''; drawAtt();
    };
    if (alf) alf.onclick = function () {
      ask('Dán link tài liệu', [{ name: 'name', label: 'Tên tài liệu', ph: 'Ví dụ: Công văn số … của Bộ' }, { name: 'url', label: 'Đường dẫn', type: 'url', ph: 'https://' }], 'Thêm').then(function (r) {
        if (!r) return;
        if (!/^https?:\/\//i.test(r.url.trim())) { toast('Đường dẫn phải bắt đầu bằng https://'); return; }
        pend.push({ name: r.name.trim() || r.url.trim(), url: r.url.trim() }); drawAtt();
      });
    };
    drawAtt();
    ov.querySelector('[data-save]').onclick = function () {
      if (!f.title.value.trim()) { toast('Chưa nhập tên công việc'); return; }
      if (!f.assigneeId.value) { toast('Chưa chọn người phụ trách'); return; }
      if (!f.dueDate.value) { toast('Chưa chọn hạn'); return; }
      if (f.startDate.value && f.startDate.value > f.dueDate.value) { toast('Ngày bắt đầu sau hạn hoàn thành'); return; }
      var x = { id: t.id, title: f.title.value, desc: f.desc.value, assigneeId: f.assigneeId.value, team: f.team.value, priority: f.priority.value, category: f.category.value,
        startDate: f.startDate.value, dueDate: f.dueDate.value, planItem: f.planItem.value, propose: propose, attachments: isNew ? pend : undefined, reason: f.reason ? f.reason.value : undefined,
        collaborators: Array.prototype.slice.call(f.querySelectorAll('[name=col]:checked')).map(function (c) { return c.value; }) };
      var local = function (d) {
        if (isNew) {
          var tmp = Object.assign({}, x, { id: 'tam-' + Date.now(), code: 'Đang lưu…', creatorId: m.id, progress: 0, evidence: [],
            status: propose || !PDT.canAssignTo(m, user(x.assigneeId)) ? 'de_xuat' : 'chua', createdAt: new Date().toISOString() });
          d.tasks.unshift(tmp);
          var u = function () { d.tasks = d.tasks.filter(function (k) { return k.id !== tmp.id; }); };
          u.temp = true; return u;
        }
        var k = d.tasks.filter(function (z) { return z.id === x.id; })[0]; if (!k) return null;
        var old = JSON.parse(JSON.stringify(k));
        Object.keys(x).forEach(function (f2) { if (f2 !== 'propose' && f2 !== 'reason' && x[f2] !== undefined) k[f2] = x[f2]; });
        return function () { Object.keys(k).forEach(function (f2) { delete k[f2]; }); Object.assign(k, old); };
      };
      closeModal();
      var files = pendFiles.slice();
      act('saveTask', { task: x }, isNew ? (propose ? 'Đã gửi đề xuất' : 'Đã giao việc') : 'Đã lưu', local).then(function (r) {
        if (files.length && r.task) uploadFiles(r.task.id, 'attachment', files);
        if (opts.after) opts.after(r.task);
      }).catch(function () {
        if (isNew) setTimeout(function () { openTaskForm(null, Object.assign({}, opts, { draft: x })); }, 300);
      });
    };
  }

  /* ================= Kế hoạch ================= */
  function renderPlan() {
    if (S.sub === 'year') return renderYearPlan();
    if (S.sub === 'month') return renderMonthPlan();
    var sy = S.planYear || schoolYearOf(today());
    var y0 = +sy.slice(0, 4);
    var plan = (D().plans || []).filter(function (p) { return p.kind === 'nam' && p.year === sy; })[0];
    var html = header('Kế hoạch', { noRefresh: true }) +
      '<div class="bar" style="justify-content:center"><button class="iconbtn" data-y="-1" aria-label="Năm trước">' + ic('left') + '</button><b style="font-size:17px">Năm học ' + sy.replace('-', '–') + '</b><button class="iconbtn" data-y="1" aria-label="Năm sau">' + ic('right') + '</button></div>';
    if (plan) {
      var pr = yearProgress(plan);
      html += '<div class="card plan" data-open-year><div class="pi">' + ic('cal') + '</div><div style="flex:1;min-width:0"><h3>Kế hoạch năm học ' + sy.replace('-', '–') + '</h3>' +
        '<span class="pill">' + (plan.status === 'ban_hanh' ? '<i class="bg-xong"></i>Ban hành' : '<i class="bg-chua"></i>Dự thảo') + '</span>' +
        '<p>Mục tiêu: ' + esc(plan.goal || '—') + '</p><div class="prog"><i style="width:' + pr.pct + '%"></i></div>' +
        '<div class="small muted" style="margin-top:6px">' + pr.total + ' nhiệm vụ trọng tâm · ' + pr.assigned + ' đã giao · ' + pr.done + ' hoàn thành · ' + pr.pct + '%</div></div>' + ic('right', 'chev').replace('<svg ', '<svg style="width:20px;height:20px;color:var(--faint)" ') + '</div>';
    } else {
      html += '<div class="card pad"><div class="muted">Chưa có kế hoạch năm học ' + sy + '.</div>' + (isLead() ? '<button class="btn pri mt" data-new-year>' + ic('plus') + 'Lập kế hoạch năm học</button>' : '') + '</div>';
    }
    html += '<div class="sec"><h2>Kế hoạch tháng</h2></div><div class="card">';
    for (var i = 0; i < 12; i++) {
      var m = (i + 7) % 12 + 1, y = m >= 8 ? y0 : y0 + 1, key = y + '-' + pad(m);
      var mp = (D().plans || []).filter(function (p) { return p.kind === 'thang' && p.month === key; })[0];
      var due = tasks().filter(function (t) { return counted(t) && t.dueDate.slice(0, 7) === key; });
      var dn = due.filter(function (t) { return t.status === 'xong'; }).length;
      html += '<div class="mrow' + (mp ? ' has' : '') + '" data-month="' + key + '"><div class="mi">T' + m + '</div><div class="body"><b>Tháng ' + m + '/' + y + '</b><div>' +
        (mp ? (mp.items || []).length + ' nội dung · ' + (mp.status === 'ban_hanh' ? 'Ban hành' : 'Dự thảo') : 'Chưa có kế hoạch') + (due.length ? ' · ' + dn + '/' + due.length + ' việc xong' : '') + '</div></div>' +
        (!mp && (isLead() || isTL()) ? '<button class="link" data-newm="' + key + '">+ Lập kế hoạch</button>' : ic('right').replace('<svg ', '<svg style="width:18px;height:18px;color:var(--faint)" ')) + '</div>';
    }
    html += '</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    root.querySelectorAll('[data-y]').forEach(function (b) { b.onclick = function () { var k = +b.getAttribute('data-y'); S.planYear = (y0 + k) + '-' + (y0 + k + 1); render(); }; });
    var oy = root.querySelector('[data-open-year]'); if (oy) oy.onclick = function () { go('plan', 'year', plan.id); };
    var ny = root.querySelector('[data-new-year]');
    if (ny) ny.onclick = function () {
      ask('Lập kế hoạch năm học ' + sy, [{ name: 'goal', label: 'Mục tiêu', type: 'textarea' }], 'Tạo').then(function (r) {
        if (r) act('savePlan', { plan: { kind: 'nam', year: sy, goal: r.goal, items: [] } }, 'Đã tạo kế hoạch').then(function (x) { go('plan', 'year', x.plan.id); });
      });
    };
    root.querySelectorAll('[data-month]').forEach(function (el) { el.onclick = function (e) { if (e.target.closest('[data-newm]')) return; go('plan', 'month', el.getAttribute('data-month')); }; });
    root.querySelectorAll('[data-newm]').forEach(function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-newm');
        act('savePlan', { plan: { kind: 'thang', year: sy, month: key, goal: '', items: [] } }, 'Đã tạo kế hoạch tháng').then(function () { go('plan', 'month', key); });
      };
    });
  }
  function itemTasks(plan, it) { return tasks().filter(function (t) { return t.planItem === plan.id + '#' + it.id && t.status !== 'huy'; }); }
  function yearProgress(plan) {
    var items = plan.items || [], assigned = 0, done = 0, sum = 0;
    items.forEach(function (it) {
      var ts = itemTasks(plan, it).filter(counted);
      if (ts.length) assigned++;
      var d = ts.filter(function (t) { return t.status === 'xong'; }).length;
      if (ts.length && d === ts.length) done++;
      sum += ts.length ? ts.reduce(function (s, t) { return s + (t.status === 'xong' ? 100 : (t.progress || 0)); }, 0) / ts.length : 0;
    });
    return { total: items.length, assigned: assigned, done: done, pct: items.length ? Math.round(sum / items.length) : 0 };
  }
  function miniTask(t) {
    return '<div class="mini" data-task="' + t.id + '"><i class="bg-' + eff(t) + '"></i><span>' + esc(t.title) + '</span><small class="muted">' + esc((user(t.assigneeId) || {}).name || '') + ' · ' + (t.status === 'xong' ? 100 : t.progress || 0) + '%</small></div>';
  }
  function renderYearPlan() {
    var plan = (D().plans || []).filter(function (p) { return p.id === S.param; })[0];
    if (!plan) { go('plan'); return; }
    var lead = isLead(), canGive = lead || isTL(), pr = yearProgress(plan);
    var html = header('Năm học ' + plan.year.replace('-', '–'), { back: true, noRefresh: true }) +
      '<div class="dh"><span class="pill">' + (plan.status === 'ban_hanh' ? '<i class="bg-xong"></i>Ban hành' : '<i class="bg-chua"></i>Dự thảo') + '</span>' +
      '<div class="mt"><b>Mục tiêu:</b> ' + esc(plan.goal || '—') + '</div><div class="prog mt"><i style="width:' + pr.pct + '%"></i></div>' +
      '<div class="small muted" style="margin-top:6px">' + pr.total + ' nhiệm vụ · ' + pr.assigned + ' đã giao · ' + pr.done + ' hoàn thành · ' + pr.pct + '%</div>' +
      (lead ? '<div class="btns mt"><button class="btn sm" data-goal>' + ic('edit') + 'Sửa mục tiêu</button><button class="btn sm" data-status>' + (plan.status === 'ban_hanh' ? 'Chuyển về dự thảo' : 'Ban hành') + '</button><button class="btn sm pri" data-additem>' + ic('plus') + 'Thêm nhiệm vụ</button></div>' : '') + '</div>' +
      '<div class="sec"><h2>Nhiệm vụ trọng tâm</h2></div><div class="card">' +
      ((plan.items || []).length ? plan.items.map(function (it) {
        var ts = itemTasks(plan, it);
        return '<div class="nv"><div><span class="code">' + esc(it.code || '') + '</span><b>' + esc(it.title) + '</b></div>' +
          '<div class="small muted" style="margin-top:4px">' + (it.team ? esc(PDT.TEAMS[it.team]) : 'Cả hai tổ') + (it.deadline ? ' · Hạn ' + ddmmyyyy(it.deadline) : '') + '</div>' +
          (it.milestones ? '<div class="ms">Mốc: ' + esc(it.milestones) + '</div>' : '') +
          (ts.length ? '<div class="mt">' + ts.map(miniTask).join('') + '</div>' : '') +
          '<div class="btns mt">' + (canGive ? '<button class="btn sm" data-give="' + it.id + '">' + ic('plus') + 'Giao việc</button>' : '') + (lead ? '<button class="btn sm" data-edititem="' + it.id + '">' + ic('edit') + 'Sửa</button>' : '') + '</div></div>';
      }).join('') : '<div class="empty">Chưa có nhiệm vụ.</div>') + '</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root); bindRows(root);
    function save(p, msg) { var PP = p; return act('savePlan', { plan: p }, msg || 'Đã lưu', function (d) { var k = d.plans.filter(function (z) { return z.id === PP.id; })[0]; if (!k) return null; var old = JSON.parse(JSON.stringify(k)); Object.assign(k, JSON.parse(JSON.stringify(PP))); return function () { Object.keys(k).forEach(function (f2) { delete k[f2]; }); Object.assign(k, old); }; }); }
    var g = root.querySelector('[data-goal]');
    if (g) g.onclick = function () { ask('Mục tiêu năm học', [{ name: 'goal', label: 'Mục tiêu', type: 'textarea', value: plan.goal }], 'Lưu').then(function (r) { if (r) save({ id: plan.id, goal: r.goal, items: plan.items }); }); };
    var st = root.querySelector('[data-status]');
    if (st) st.onclick = function () { save({ id: plan.id, status: plan.status === 'ban_hanh' ? 'du_thao' : 'ban_hanh', items: plan.items }); };
    function itemForm(it) {
      it = it || {};
      ask(it.id ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ trọng tâm', [
        { name: 'code', label: 'Mã', value: it.code, ph: '1.1.1' }, { name: 'title', label: 'Nhiệm vụ', type: 'textarea', value: it.title },
        { name: 'team', label: 'Tổ chủ trì', type: 'select', value: it.team || '', options: [['', 'Cả hai tổ']].concat(Object.keys(PDT.TEAMS).map(function (k) { return [k, PDT.TEAMS[k]]; })) },
        { name: 'deadline', label: 'Hạn', type: 'date', value: it.deadline }, { name: 'milestones', label: 'Các mốc', type: 'textarea', value: it.milestones }
      ], 'Lưu').then(function (r) {
        if (!r || !r.title.trim()) return;
        var items = (plan.items || []).slice();
        if (it.id) items = items.map(function (x) { return x.id === it.id ? Object.assign({}, x, r) : x; }); else items.push(Object.assign({ id: uid().slice(0, 8) }, r));
        save({ id: plan.id, items: items });
      });
    }
    var ai = root.querySelector('[data-additem]'); if (ai) ai.onclick = function () { itemForm(); };
    root.querySelectorAll('[data-edititem]').forEach(function (b) { b.onclick = function () { itemForm(plan.items.filter(function (x) { return x.id === b.getAttribute('data-edititem'); })[0]); }; });
    root.querySelectorAll('[data-give]').forEach(function (b) {
      b.onclick = function () {
        var it = plan.items.filter(function (x) { return x.id === b.getAttribute('data-give'); })[0];
        openTaskForm(null, { title: (it.code ? '[' + it.code + '] ' : ''), team: it.team, planItem: plan.id + '#' + it.id, dueDate: it.deadline });
      };
    });
  }
  function renderMonthPlan() {
    var key = S.param, y = +key.slice(0, 4), m = +key.slice(5, 7);
    var plan = (D().plans || []).filter(function (p) { return p.kind === 'thang' && p.month === key; })[0];
    var canEdit = isLead() || isTL();
    var due = tasks().filter(function (t) { return counted(t) && overlaps(t, monthStart(y, m), monthEnd(y, m)); })
      .sort(function (a, b) { return a.dueDate < b.dueDate ? -1 : 1; });
    var html = header('Tháng ' + m + '/' + y, { back: true, noRefresh: true });
    if (plan) {
      html += '<div class="dh"><span class="pill">' + (plan.status === 'ban_hanh' ? '<i class="bg-xong"></i>Ban hành' : '<i class="bg-chua"></i>Dự thảo') + '</span>' +
        '<div class="mt" style="white-space:pre-wrap"><b>Trọng tâm tháng:</b> ' + esc(plan.goal || '—') + '</div>' +
        (canEdit ? '<div class="btns mt"><button class="btn sm" data-goal>' + ic('edit') + 'Sửa trọng tâm</button>' + (isLead() ? '<button class="btn sm" data-status>' + (plan.status === 'ban_hanh' ? 'Chuyển về dự thảo' : 'Ban hành') + '</button>' : '') + '<button class="btn sm pri" data-additem>' + ic('plus') + 'Thêm nội dung</button></div>' : '') + '</div>' +
        '<div class="sec"><h2>Nội dung kế hoạch</h2></div><div class="card">' + ((plan.items || []).length ? plan.items.map(function (it) {
          var ts = itemTasks(plan, it), u = user(it.assigneeId);
          return '<div class="nv"><b>' + esc(it.title) + '</b><div class="small muted" style="margin-top:4px">' + esc(u ? u.name : 'Chưa phân công') + (it.dueDate ? ' · Hạn ' + ddmmyyyy(it.dueDate) : '') + '</div>' +
            (ts.length ? '<div class="mt">' + ts.map(miniTask).join('') + '</div>' : '') +
            (canEdit ? '<div class="btns mt">' + (!ts.length ? '<button class="btn sm" data-give="' + it.id + '">' + ic('plus') + 'Giao thành công việc</button>' : '') + '<button class="btn sm" data-edititem="' + it.id + '">' + ic('edit') + 'Sửa</button><button class="btn sm dan" data-rmitem="' + it.id + '">' + ic('trash') + '</button></div>' : '') + '</div>';
        }).join('') : '<div class="empty">Chưa có nội dung.</div>') + '</div>';
    } else {
      html += '<div class="card pad"><div class="muted">Chưa có kế hoạch tháng ' + m + '/' + y + '.</div>' + (canEdit ? '<button class="btn pri mt" data-create>' + ic('plus') + 'Lập kế hoạch</button>' : '') + '</div>';
    }
    html += '<div class="sec"><h2>Công việc trong tháng (' + due.length + ')</h2></div><div class="card list">' + (due.length ? due.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có công việc.</div>') + '</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root); bindRows(root);
    var cr = root.querySelector('[data-create]');
    if (cr) cr.onclick = function () { act('savePlan', { plan: { kind: 'thang', year: schoolYearOf(key + '-01'), month: key, goal: '', items: [] } }, 'Đã tạo kế hoạch'); };
    if (!plan) return;
    function save(p) { var PP = Object.assign({ id: plan.id, items: plan.items }, p); return act('savePlan', { plan: PP }, 'Đã lưu', function (d) { var k = d.plans.filter(function (z) { return z.id === PP.id; })[0]; if (!k) return null; var old = JSON.parse(JSON.stringify(k)); Object.assign(k, JSON.parse(JSON.stringify(PP))); return function () { Object.keys(k).forEach(function (f2) { delete k[f2]; }); Object.assign(k, old); }; }); }
    var g = root.querySelector('[data-goal]');
    if (g) g.onclick = function () { ask('Trọng tâm tháng ' + m + '/' + y, [{ name: 'goal', label: 'Trọng tâm', type: 'textarea', value: plan.goal }], 'Lưu').then(function (r) { if (r) save({ goal: r.goal }); }); };
    var st = root.querySelector('[data-status]'); if (st) st.onclick = function () { save({ status: plan.status === 'ban_hanh' ? 'du_thao' : 'ban_hanh' }); };
    function itemForm(it) {
      it = it || {};
      ask(it.id ? 'Sửa nội dung' : 'Thêm nội dung kế hoạch', [
        { name: 'title', label: 'Nội dung công việc', type: 'textarea', value: it.title },
        { name: 'assigneeId', label: 'Người phụ trách', type: 'select', value: it.assigneeId || '', options: [['', '— Chưa phân công —']].concat(activeUsers().map(function (u) { return [u.id, u.name]; })) },
        { name: 'dueDate', label: 'Hạn', type: 'date', value: it.dueDate || monthEnd(y, m) }
      ], 'Lưu').then(function (r) {
        if (!r || !r.title.trim()) return;
        var items = (plan.items || []).slice();
        if (it.id) items = items.map(function (x) { return x.id === it.id ? Object.assign({}, x, r) : x; }); else items.push(Object.assign({ id: uid().slice(0, 8) }, r));
        save({ items: items });
      });
    }
    var ai = root.querySelector('[data-additem]'); if (ai) ai.onclick = function () { itemForm(); };
    root.querySelectorAll('[data-edititem]').forEach(function (b) { b.onclick = function () { itemForm(plan.items.filter(function (x) { return x.id === b.getAttribute('data-edititem'); })[0]); }; });
    root.querySelectorAll('[data-rmitem]').forEach(function (b) {
      b.onclick = function () { confirmBox('Bỏ nội dung', 'Bỏ nội dung này khỏi kế hoạch tháng? Công việc đã giao vẫn giữ nguyên.', 'Bỏ').then(function (ok) { if (ok) save({ items: plan.items.filter(function (x) { return x.id !== b.getAttribute('data-rmitem'); }) }); }); };
    });
    root.querySelectorAll('[data-give]').forEach(function (b) {
      b.onclick = function () {
        var it = plan.items.filter(function (x) { return x.id === b.getAttribute('data-give'); })[0];
        openTaskForm(null, { title: it.title, assigneeId: it.assigneeId, dueDate: it.dueDate, planItem: plan.id + '#' + it.id, team: (user(it.assigneeId) || {}).team });
      };
    });
  }

  /* ================= Của tôi ================= */
  function nextOcc(n) {
    var t = today();
    if (!n.date) return null;
    if (!n.yearly) return n.date;
    var p = n.date.split('-').map(Number), ty = +t.slice(0, 4);
    if (n.lunar) {
      var l = Lunar.toLunar(p[2], p[1], p[0]);
      for (var yy = ty - 1; yy <= ty + 1; yy++) {
        var s = Lunar.toSolar(l.day, l.month, yy, 0);
        if (!s || !s[0]) continue;
        var chk = Lunar.toLunar(s[0], s[1], s[2]);
        if (chk.day !== l.day) s = Lunar.toSolar(l.day - 1, l.month, yy, 0);
        var x = s[2] + '-' + pad(s[1]) + '-' + pad(s[0]);
        if (x >= t) return x;
      }
      return null;
    }
    for (var y2 = ty; y2 <= ty + 1; y2++) {
      var d = p[2];
      if (p[1] === 2 && d === 29 && !(y2 % 4 === 0 && (y2 % 100 !== 0 || y2 % 400 === 0))) d = 28;
      var x2 = y2 + '-' + pad(p[1]) + '-' + pad(d);
      if (x2 >= t) return x2;
    }
    return null;
  }
  function lunarText(isoS) { var p = isoS.split('-').map(Number), l = Lunar.toLunar(p[2], p[1], p[0]); return 'ÂL ' + l.day + '/' + l.month + (l.leap ? ' nhuận' : ''); }
  function renderMe() {
    var m = me();
    var html = header('Việc của tôi', { noRefresh: true }) +
      '<div class="seg" style="margin-bottom:14px"><button data-mt="tasks" class="' + (S.meTab === 'tasks' ? 'on' : '') + '">Công việc</button><button data-mt="notes" class="' + (S.meTab === 'notes' ? 'on' : '') + '">Ghi chú nhắc việc</button></div>';
    if (S.meTab === 'tasks') {
      var mine = tasks().filter(function (t) { return t.assigneeId === m.id || (t.collaborators || []).indexOf(m.id) >= 0 || (t.status === 'de_xuat' && t.creatorId === m.id); });
      var chips = [['open', 'Đang mở'], ['de_xuat', 'Đề xuất'], ['cho_duyet', 'Chờ duyệt'], ['xong', 'Hoàn thành'], ['all', 'Tất cả']];
      var list = mine.filter(function (t) {
        if (S.myChip === 'open') return ['chua', 'dang', 'de_xuat'].indexOf(t.status) >= 0;
        if (S.myChip === 'all') return t.status !== 'huy';
        return t.status === S.myChip;
      }).sort(function (a, b) { return a.dueDate < b.dueDate ? -1 : 1; });
      var ym = [+today().slice(0, 4), +today().slice(5, 7)], r = curRange('month', ym), ev = personEval(m, r[0], r[1]);
      html += '<div class="card pad" style="display:flex;gap:16px;align-items:center;margin-bottom:12px">' + av(m, true) +
        '<div style="flex:1"><b>' + esc(m.name) + '</b><div class="small muted">Tháng ' + ym[1] + ': ' + ev.xong + '/' + ev.giao + ' việc xong · ' + ev.qua + ' quá hạn' + (ev.ph ? ' · ' + ev.ph + ' phối hợp' : '') + '</div></div>' + scoreBadge(ev.score) + '</div>' +
        '<div class="chips">' + chips.map(function (c) { return '<button class="chip' + (S.myChip === c[0] ? ' on' : '') + '" data-mc="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        '<div class="card list mt">' + (list.length ? list.map(function (t) { return taskRow(t, unreadTaskIds()); }).join('') : '<div class="empty">Không có công việc.</div>') + '</div>';
    } else {
      var chips2 = [['all', 'Tất cả'], ['sinh_nhat', 'Sinh nhật'], ['ky_niem', 'Kỷ niệm'], ['nhac_viec', 'Nhắc việc']];
      var notes = (D().notes || []).filter(function (n) { return S.noteChip === 'all' || n.kind === S.noteChip; })
        .map(function (n) { var nx = nextOcc(n); return { n: n, nx: nx, d: nx ? diff(today(), nx) : 99999 }; })
        .sort(function (a, b) { return a.d - b.d; });
      html += '<div class="chips">' + chips2.map(function (c) { return '<button class="chip' + (S.noteChip === c[0] ? ' on' : '') + '" data-nc="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        '<div class="card list mt">' + (notes.length ? notes.map(function (x) {
          var n = x.n, nx = x.nx || n.date, icn = n.kind === 'sinh_nhat' ? 'cake' : n.kind === 'ky_niem' ? 'heart' : 'bell';
          var sub = n.yearly ? (n.lunar ? 'Ngày ' + lunarText(n.date).replace('ÂL ', '') + ' âm lịch hằng năm · DL ' + ddmm(nx) : 'Ngày ' + ddmm(n.date) + ' hằng năm · ' + lunarText(nx)) : ddmmyyyy(n.date) + ' · ' + lunarText(n.date);
          var cd = x.nx == null ? '<span class="c-mut">Đã qua</span>' : x.d === 0 ? '<span class="c-warn">Hôm nay</span>' : '<span class="c-mut">Còn ' + x.d + ' ngày</span>';
          return '<div class="row note" data-note="' + n.id + '"><span class="ni">' + ic(icn) + '</span><div class="body"><div class="ttl">' + esc(n.title) + '</div><div class="meta">' + sub + '</div></div><div class="side"><b>' + ddmm(nx) + '</b>' + cd + '</div></div>';
        }).join('') : '<div class="empty">Chưa có ghi chú. Bấm + để thêm sinh nhật, ngày kỷ niệm hoặc việc cần nhắc.</div>') + '</div>' +
        '<div class="foot">Ghi chú là riêng tư: lãnh đạo Phòng và đồng nghiệp không xem được. Nhắc nhở hiện ở Trang chủ theo số ngày anh/chị chọn.</div>';
    }
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root); bindRows(root);
    root.querySelectorAll('[data-mt]').forEach(function (b) { b.onclick = function () { S.meTab = b.getAttribute('data-mt'); render(); }; });
    root.querySelectorAll('[data-mc]').forEach(function (b) { b.onclick = function () { S.myChip = b.getAttribute('data-mc'); render(); }; });
    root.querySelectorAll('[data-nc]').forEach(function (b) { b.onclick = function () { S.noteChip = b.getAttribute('data-nc'); render(); }; });
    root.querySelectorAll('[data-note]').forEach(function (el) { el.onclick = function () { openNoteForm((D().notes || []).filter(function (n) { return n.id === el.getAttribute('data-note'); })[0]); }; });
  }
  function openNoteForm(n) {
    var isNew = !n;
    n = n || { kind: S.noteChip !== 'all' ? S.noteChip : 'nhac_viec', title: '', date: today(), yearly: S.noteChip === 'sinh_nhat' || S.noteChip === 'ky_niem', lunar: false, remindDays: 7 };
    var html = '<form id="nf"><div class="fld"><label>Loại</label><select class="inp" name="kind">' + [['nhac_viec', 'Nhắc việc'], ['sinh_nhat', 'Sinh nhật'], ['ky_niem', 'Kỷ niệm']].map(function (x) { return '<option value="' + x[0] + '"' + (n.kind === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label>Nội dung</label><input class="inp" name="title" value="' + esc(n.title) + '" placeholder="Ví dụ: Sinh nhật …, Nộp báo cáo …"></div>' +
      '<div class="fld"><label>Ngày (dương lịch)</label><input class="inp" type="date" name="date" value="' + esc(n.date) + '"><div class="hint" id="al"></div></div>' +
      '<div class="checks fld"><label><input type="checkbox" name="yearly"' + (n.yearly ? ' checked' : '') + '>Lặp lại hằng năm</label><label><input type="checkbox" name="lunar"' + (n.lunar ? ' checked' : '') + '>Lặp theo âm lịch</label></div>' +
      '<div class="fld"><label>Nhắc trước</label><select class="inp" name="remindDays">' + [1, 3, 7, 14, 30].map(function (d) { return '<option value="' + d + '"' + (+n.remindDays === d ? ' selected' : '') + '>' + d + ' ngày</option>'; }).join('') + '</select></div></form>';
    var ov = openModal(isNew ? 'Thêm ghi chú nhắc việc' : 'Sửa ghi chú', html, {
      small: true, foot: (isNew ? '' : '<button class="btn dan" data-del style="margin-right:auto">' + ic('trash') + 'Xóa</button>') + '<button class="btn" data-x>Hủy</button><button class="btn pri" data-save>Lưu</button>'
    });
    var f = ov.querySelector('#nf');
    function showAl() { ov.querySelector('#al').textContent = f.date.value ? 'Âm lịch: ' + lunarText(f.date.value).replace('ÂL ', '') : ''; }
    f.date.oninput = showAl; showAl();
    f.lunar.onchange = function () { if (f.lunar.checked) f.yearly.checked = true; };
    ov.querySelector('[data-save]').onclick = function () {
      var nx = { id: n.id, kind: f.kind.value, title: f.title.value, date: f.date.value, yearly: f.yearly.checked, lunar: f.lunar.checked, remindDays: +f.remindDays.value };
      if (!nx.title.trim() || !nx.date) { toast('Nhập nội dung và ngày.'); return; }
      closeModal();
      act('saveNote', { note: nx }, 'Đã lưu ghi chú', function (d) {
        if (nx.id) { var k = d.notes.filter(function (z) { return z.id === nx.id; })[0], old = JSON.parse(JSON.stringify(k)); Object.assign(k, nx); return function () { Object.assign(k, old); }; }
        var tmp = Object.assign({}, nx, { id: 'tam-' + Date.now() }); d.notes.push(tmp);
        var u = function () { d.notes = d.notes.filter(function (z) { return z.id !== tmp.id; }); }; u.temp = true; return u;
      }).catch(function () { });
    };
    var dl = ov.querySelector('[data-del]');
    if (dl) dl.onclick = function () {
      closeModal();
      act('deleteNote', { id: n.id }, 'Đã xóa ghi chú', function (d) { var old = d.notes; d.notes = old.filter(function (z) { return z.id !== n.id; }); return function () { d.notes = old; }; }).catch(function () { });
    };
  }

  /* ================= Thêm ================= */
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; });
  function renderMore() {
    switch (S.sub) {
      case 'notifs': return renderNotifs();
      case 'eval': return renderEval();
      case 'staff': return renderStaff();
      case 'settings': return renderSettings();
      case 'install': return renderInstall();
      case 'review': return renderReview();
    }
    var m = me(), lead = isLead();
    var pending = tasks().filter(function (t) { return (t.status === 'cho_duyet' || t.status === 'de_xuat') && canAp(m, t); }).length;
    var myOpen = tasks().filter(function (t) { return t.assigneeId === m.id && ['chua', 'dang', 'cho_duyet'].indexOf(t.status) >= 0; }).length;
    var notifOn = ('Notification' in window) && Notification.permission === 'granted' && LS.get('pdt_push', true);
    function row(key, icn, label, val) { return '<div class="row" data-k="' + key + '">' + ic(icn, 'ic') + '<div class="body">' + label + '</div>' + (val || '') + ic('right', 'chev') + '</div>'; }
    var html = header('Thêm', { noRefresh: true }) +
      '<div class="card profile">' + av(m, true) + '<div style="flex:1"><b>' + esc(m.name) + '</b><span class="small muted">' + esc(m.title || PDT.ROLES[m.role]) + (m.team ? ' · ' + esc(PDT.TEAMS[m.team]) : '') + '</span></div></div>' +
      '<div class="card list menu mt">' +
      row('notifs', 'mega', 'Thông báo', (D().notifs || []).filter(function (n) { return !n.read; }).length ? '<span class="bluepill">' + (D().notifs || []).filter(function (n) { return !n.read; }).length + ' chưa đọc</span>' : '') +
      row('review', 'users', 'Việc tôi phụ trách', '<span class="bluepill">' + myOpen + ' đang mở' + (pending ? ' · ' + pending + ' chờ duyệt' : '') + '</span>') +
      row('eval', 'chart', 'Đánh giá kết quả') +
      (lead ? row('staff', 'users', 'Nhân sự', users().filter(function (u) { return u.pending; }).length ? '<span class="bluepill">' + users().filter(function (u) { return u.pending; }).length + ' chờ duyệt</span>' : '') + row('settings', 'gear', 'Cài đặt danh mục &amp; đánh giá') : row('staff', 'users', 'Nhân sự của Phòng')) +
      row('install', 'download', 'Cài đặt ứng dụng lên thiết bị') +
      '<div class="row" data-k="reload">' + ic('refresh', 'ic') + '<div class="body">Làm mới dữ liệu</div></div></div>' +
      '<div class="card list menu mt">' +
      '<div class="row" data-k="push">' + ic('bell', 'ic') + '<div class="body">Thông báo trên thiết bị' + (notifOn ? '<div class="small muted">' + (LS.get('pdt_fcm', null) ? 'Nhận cả khi đóng app' : 'Chỉ nhận khi app đang mở') + '</div>' : '') + '</div><span class="okpill' + (notifOn ? '' : ' off') + '">' + (notifOn ? 'Đã bật' : 'Chưa bật') + '</span></div>' +
      '<div class="row" data-k="testpush">' + ic('send', 'ic') + '<div class="body">Gửi thử thông báo</div></div>' +
      (notifOn ? '<div class="row" data-k="pushoff">' + ic('x', 'ic') + '<div class="body">Tắt thông báo trên thiết bị này</div></div>' : '') +
      '<div class="row" data-k="sound">' + ic('sound', 'ic') + '<div class="body">Âm thanh khi có việc mới</div><span class="okpill' + (S.sound ? '' : ' off') + '">' + (S.sound ? 'Bật' : 'Tắt') + '</span></div>' +
      '<div class="row" data-k="theme">' + ic('sun', 'ic') + '<div class="body">Giao diện</div><span class="val">' + ({ light: 'Sáng', dark: 'Tối' }[LS.get('pdt_theme', '')] || 'Theo máy') + '</span></div>' +
      '<div class="row" data-k="bday">' + ic('cake', 'ic') + '<div class="body">Ngày sinh của tôi</div><span class="val">' + (m.birthday ? ddmmyyyy(m.birthday) : 'Chưa nhập') + '</span></div>' +
      '<div class="row" data-k="pass">' + ic('lock', 'ic') + '<div class="body">Đổi mật khẩu</div></div>' +
      '<div class="row" data-k="logout">' + ic('logout', 'ic') + '<div class="body c-red">Đăng xuất</div></div></div>' +
      '<div class="foot">Phiên bản ' + PDT.VERSION + (DEMO ? ' · dùng thử' : '') + ' · ' + esc(sett().tenPhong) + ' – ' + esc(CFG.TEN_TRUONG || '') + '</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    root.querySelectorAll('[data-k]').forEach(function (el) {
      el.onclick = function () {
        var k = el.getAttribute('data-k');
        if (['notifs', 'eval', 'staff', 'settings', 'install', 'review'].indexOf(k) >= 0) return go('more', k);
        if (k === 'reload') return load(false);
        if (k === 'push') {
          if (notifOn && (LS.get('pdt_fcm', null) || !FCM_ON)) return toast('Thông báo đang bật trên thiết bị này');
          return togglePush();
        }
        if (k === 'pushoff') { LS.set('pdt_push', false); unregisterPush(); toast('Đã tắt thông báo trên thiết bị này'); return render(); }
        if (k === 'testpush') {
          if (!('Notification' in window) || Notification.permission !== 'granted') { toast('Hãy bật Thông báo trên thiết bị trước.'); return; }
          if (LS.get('pdt_fcm', null)) {
            toast('Đang gửi thử qua máy chủ…');
            return api('testPush').then(function (r) { toast('Máy chủ đã gửi tới ' + (r.sent || 0) + '/' + r.devices + ' thiết bị. Thử đóng app rồi gửi lại để kiểm tra.'); })
              .catch(function (e) { toast(e.message); });
          }
          sysNotify(CFG.TEN_APP, 'Thông báo thử: thiết bị đã nhận được thông báo.'); beep(); return;
        }
        if (k === 'sound') { S.sound = !S.sound; LS.set('pdt_sound', S.sound); if (S.sound) beep(); return render(); }
        if (k === 'theme') { var cur = LS.get('pdt_theme', ''), nx = cur === '' ? 'light' : cur === 'light' ? 'dark' : ''; LS.set('pdt_theme', nx); applyTheme(); return render(); }
        if (k === 'bday') return ask('Ngày sinh của tôi', [{ name: 'b', label: 'Ngày sinh', type: 'date', value: m.birthday, hint: 'Đồng nghiệp sẽ thấy lời nhắc sinh nhật trước 3 ngày.' }], 'Lưu').then(function (r) { if (r) act('updateProfile', { birthday: r.b }, 'Đã lưu'); });
        if (k === 'pass') return changePass(false);
        if (k === 'logout') return confirmBox('Đăng xuất', 'Đăng xuất khỏi thiết bị này?', 'Đăng xuất').then(function (ok) { if (ok) logout(); });
      };
    });
  }
  function togglePush() {
    if (!('Notification' in window)) { toast('Thiết bị chưa hỗ trợ. Trên iPhone, hãy cài app ra màn hình chính trước.'); return; }
    if (Notification.permission === 'denied') { toast('Thông báo đang bị chặn; mở cài đặt trình duyệt để cho phép.'); return; }
    var ask0 = Notification.permission === 'granted' ? Promise.resolve('granted') : Notification.requestPermission();
    ask0.then(function (p) {
      LS.set('pdt_push', p === 'granted');
      if (p !== 'granted') { toast('Chưa được cho phép'); return render(); }
      if (!FCM_ON) { toast('Đã bật thông báo (khi app đang mở)'); return render(); }
      toast('Đang đăng ký nhận thông báo…');
      return registerPush().then(function (ok) { toast(ok ? 'Đã bật: nhận thông báo cả khi đóng app' : 'Đã bật thông báo khi app đang mở'); render(); })
        .catch(function (e) { toast('Chưa đăng ký được: ' + e.message); render(); });
    });
  }
  function changePass(force) {
    return ask(force ? 'Đặt mật khẩu mới' : 'Đổi mật khẩu', [
      force ? { type: 'info', html: 'Đây là lần đăng nhập đầu. Vui lòng đặt mật khẩu riêng.' } : null,
      { name: 'old', label: 'Mật khẩu hiện tại', type: 'password' },
      { name: 'p1', label: 'Mật khẩu mới (từ 6 ký tự, khác mật khẩu ban đầu)', type: 'password' }, { name: 'p2', label: 'Nhập lại mật khẩu mới', type: 'password' }
    ].filter(Boolean), 'Lưu').then(function (r) {
      if (!r) return;
      if (r.p1 !== r.p2) { toast('Hai lần nhập mật khẩu mới không khớp.'); return changePass(force); }
      return api('changePassword', { old: r.old, password: r.p1 }).then(function (x) { S.token = x.token; LS.set('pdt_token', x.token); toast('Đã đổi mật khẩu'); })
        .catch(function (e) { toast(e.message); return changePass(force); });
    });
  }
  var NK = {
    giao_viec: ['Việc mới', 'send', '#2f6fdb'], de_xuat: ['Đề xuất', 'send', '#7b55c7'], sap_han: ['Sắp đến hạn', 'clock', '#d08a17'],
    qua_han: ['Quá hạn', 'alert', '#d9433b'], cho_duyet: ['Chờ duyệt', 'inbox', '#d08a17'], duyet: ['Đã duyệt', 'check', '#1f8a5b'],
    tra_lai: ['Trả lại', 'left', '#d0731a'], trao_doi: ['Trao đổi', 'mega', '#5b6680'], doi_han: ['Đổi hạn', 'cal', '#2f6fdb'],
    huy: ['Đã hủy', 'x', '#8a93a3'], nhan_su: ['Tài khoản', 'users', '#005474'], he_thong: ['Hệ thống', 'bell', '#005474']
  };
  function nkind(n) {
    if (n.kind && NK[n.kind]) return n.kind;
    var t = n.text || '';
    if (/Quá hạn/.test(t)) return 'qua_han';
    if (/đến hạn/.test(t)) return 'sap_han';
    if (/đề xuất việc/.test(t)) return 'de_xuat';
    if (/giao việc|duyệt đề xuất/.test(t)) return 'giao_viec';
    if (/báo hoàn thành|chờ bạn duyệt/.test(t)) return 'cho_duyet';
    if (/đã duyệt/.test(t)) return 'duyet';
    if (/trả lại|mở lại/.test(t)) return 'tra_lai';
    if (/trao đổi/.test(t)) return 'trao_doi';
    if (/Đổi hạn/.test(t)) return 'doi_han';
    if (/hủy/.test(t)) return 'huy';
    if (/đăng ký|Chào mừng/.test(t)) return 'nhan_su';
    return 'he_thong';
  }
  var NGROUP = { all: null, unread: null, moi: ['giao_viec', 'de_xuat'], han: ['sap_han', 'qua_han', 'doi_han'], duyet: ['cho_duyet', 'duyet', 'tra_lai'], traodoi: ['trao_doi'] };
  function renderNotifs() {
    var all = D().notifs || [], g = S.nChip || 'all';
    var list = all.filter(function (n) { if (g === 'unread') return !n.read; if (!NGROUP[g]) return true; return NGROUP[g].indexOf(nkind(n)) >= 0; });
    var cnt = function (k) { return all.filter(function (n) { return !n.read && (!NGROUP[k] || NGROUP[k].indexOf(nkind(n)) >= 0); }).length; };
    var chips = [['all', 'Tất cả'], ['unread', 'Chưa đọc'], ['moi', 'Việc mới'], ['han', 'Hạn, quá hạn'], ['duyet', 'Duyệt'], ['traodoi', 'Trao đổi']];
    var html = header('Thông báo', { back: true, noRefresh: true }) +
      '<div class="chips">' + chips.map(function (c) { var k = c[0] === 'all' ? 0 : cnt(c[0] === 'unread' ? 'all' : c[0]); return '<button class="chip' + (g === c[0] ? ' on' : '') + '" data-nc2="' + c[0] + '">' + c[1] + (k ? ' <b class="nb">' + k + '</b>' : '') + '</button>'; }).join('') + '</div>' +
      (all.some(function (n) { return !n.read; }) ? '<div class="bar mt"><button class="btn sm" id="readall">' + ic('check') + 'Đánh dấu đã đọc tất cả</button></div>' : '<div class="mt"></div>') +
      '<div class="card list">' + (list.length ? list.map(function (n) {
        var k = nkind(n), m = NK[k];
        return '<div class="row nrow' + (n.read ? '' : ' unread') + '" data-n="' + n.id + '" data-t="' + esc(n.taskId) + '">' +
          '<span class="nic" style="background:' + m[2] + '1f;color:' + m[2] + '">' + ic(m[1]) + '</span>' +
          '<div class="body"><div class="ntx">' + esc(n.text) + '</div><div class="meta"><span class="ntag" style="color:' + m[2] + '">' + m[0] + '</span><span>· ' + timeAgo(n.at) + '</span></div></div>' +
          (n.read ? '' : '<span class="bullet new" style="margin-top:6px"></span>') + '</div>';
      }).join('') : '<div class="empty">Không có thông báo.</div>') + '</div>' +
      '<div class="foot">Máy chủ tự nhắc việc sắp đến hạn (còn 2 ngày, 1 ngày, hôm nay) và cảnh báo việc quá hạn mỗi sáng.</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    root.querySelectorAll('[data-nc2]').forEach(function (b) { b.onclick = function () { S.nChip = b.getAttribute('data-nc2'); render(); }; });
    var ra = root.querySelector('#readall'); if (ra) ra.onclick = function () { act('readNotifs', {}, 'Đã đọc tất cả', function (d) { var was = d.notifs.filter(function (n) { return !n.read; }); was.forEach(function (n) { n.read = true; }); return function () { was.forEach(function (n) { n.read = false; }); }; }).catch(function () { }); };
    root.querySelectorAll('[data-n]').forEach(function (el) {
      el.onclick = function () {
        var id = el.getAttribute('data-n'), tid = el.getAttribute('data-t');
        var n = list.filter(function (x) { return x.id === id; })[0];
        if (n && !n.read) { n.read = true; api('readNotifs', { ids: [id] }).catch(function () { }); render(); }
        if (tid && task(tid)) openTask(tid);
      };
    });
  }
  function renderReview() {
    var m = me();
    var wait = tasks().filter(function (t) { return t.status === 'cho_duyet' && canAp(m, t); });
    var prop = tasks().filter(function (t) { return t.status === 'de_xuat' && canAp(m, t); });
    var given = tasks().filter(function (t) { return t.creatorId === m.id && t.assigneeId !== m.id && ['chua', 'dang'].indexOf(t.status) >= 0; })
      .sort(function (a, b) { return a.dueDate < b.dueDate ? -1 : 1; });
    var mine = tasks().filter(function (t) { return t.assigneeId === m.id && ['chua', 'dang', 'cho_duyet'].indexOf(t.status) >= 0; })
      .sort(function (a, b) { return a.dueDate < b.dueDate ? -1 : 1; });
    var canRv = isLead() || isTL();
    var html = header('Việc tôi phụ trách', { back: true, noRefresh: true }) +
      '<div class="sec"><h2>Việc tôi đang phụ trách (' + mine.length + ')</h2></div><div class="card list">' + (mine.length ? mine.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có việc đang mở.</div>') + '</div>' +
      (!canRv ? '' : '<div class="sec"><h2>Báo hoàn thành, chờ tôi duyệt (' + wait.length + ')</h2></div><div class="card list">' + (wait.length ? wait.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có.</div>') + '</div>' +
      '<div class="sec"><h2>Đề xuất chờ duyệt (' + prop.length + ')</h2></div><div class="card list">' + (prop.length ? prop.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có.</div>') + '</div>' +
      '<div class="sec"><h2>Việc tôi đã giao, đang thực hiện (' + given.length + ')</h2></div><div class="card list">' + (given.length ? given.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có.</div>') + '</div>');
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root); bindRows(root);
  }
  function renderEval() {
    var ym = S.month || [+today().slice(0, 4), +today().slice(5, 7)];
    var r = curRange(S.evalMode, ym);
    var rows = activeUsers().map(function (u) { return personEval(u, r[0], r[1]); });
    var tot = rows.reduce(function (s, x) { ['giao', 'xong', 'dung', 'tre', 'qua', 'ph'].forEach(function (k) { s[k] += x[k]; }); return s; }, { giao: 0, xong: 0, dung: 0, tre: 0, qua: 0, ph: 0 });
    var html = header('Đánh giá kết quả', { back: true, noRefresh: true }) +
      '<div class="bar"><button class="iconbtn" data-em="-1" aria-label="Trước">' + ic('left') + '</button><b style="font-size:17px">' + r[2] + '</b><button class="iconbtn" data-em="1" aria-label="Sau">' + ic('right') + '</button>' +
      '<div class="seg"><button data-mode="month" class="' + (S.evalMode === 'month' ? 'on' : '') + '">Tháng</button><button data-mode="year" class="' + (S.evalMode === 'year' ? 'on' : '') + '">Năm học</button></div>' +
      '<button class="btn sm" id="csv">' + ic('download') + 'Tải Excel</button></div>' +
      '<div class="card tblwrap"><table class="tbl"><thead><tr><th>Cán bộ</th><th class="r">Giao</th><th class="r">Xong</th><th class="r">Đúng hạn</th><th class="r">Trễ</th><th class="r">Quá hạn</th><th class="r">Phối hợp</th><th class="r">Điểm</th></tr></thead><tbody>' +
      rows.map(function (x) {
        return '<tr data-person="' + x.u.id + '"><td style="min-width:170px">' + nameCell(x.u) + '</td><td class="r">' + x.giao + '</td><td class="r">' + x.xong + '</td><td class="r">' + x.dung + '</td><td class="r">' + x.tre + '</td><td class="r' + (x.qua ? ' c-red' : '') + '">' + x.qua + '</td><td class="r">' + x.ph + '</td><td class="r">' + scoreBadge(x.score) + '</td></tr>';
      }).join('') + '<tr style="font-weight:700;cursor:default"><td>Toàn Phòng</td><td class="r">' + tot.giao + '</td><td class="r">' + tot.xong + '</td><td class="r">' + tot.dung + '</td><td class="r">' + tot.tre + '</td><td class="r">' + tot.qua + '</td><td class="r">' + tot.ph + '</td><td></td></tr></tbody></table></div>' +
      '<div class="foot">Kỳ đánh giá tính các việc có thời gian thực hiện giao với kỳ. Điểm từng việc do người duyệt chấm (mặc định 100, trừ ' + sett().truMoiNgayTre + ' điểm/ngày nộp trễ, tối đa ' + sett().truToiDa + '). Điểm cán bộ = bình quân điểm các việc hoàn thành, trừ ' + sett().truQuaHan + ' điểm cho mỗi việc đang quá hạn.</div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    root.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () { S.evalMode = b.getAttribute('data-mode'); render(); }; });
    root.querySelectorAll('[data-em]').forEach(function (b) {
      b.onclick = function () { var k = +b.getAttribute('data-em'); var d = new Date(ym[0], ym[1] - 1 + (S.evalMode === 'year' ? 12 * k : k), 1); S.month = [d.getFullYear(), d.getMonth() + 1]; render(); };
    });
    root.querySelectorAll('[data-person]').forEach(function (el) {
      el.onclick = function () {
        var x = rows.filter(function (q) { return q.u.id === el.getAttribute('data-person'); })[0];
        var ov = openModal(x.u.name + ' – ' + r[2], '<div class="card list">' + (x.list.length ? x.list.map(function (t) { return taskRow(t); }).join('') : '<div class="empty">Không có công việc.</div>') + '</div>');
        bindRows(ov);
      };
    });
    root.querySelector('#csv').onclick = function () {
      var lines = [['Cán bộ', 'Giao', 'Hoàn thành', 'Đúng hạn', 'Trễ hạn', 'Quá hạn', 'Phối hợp', 'Điểm']];
      rows.forEach(function (x) { lines.push([x.u.name, x.giao, x.xong, x.dung, x.tre, x.qua, x.ph, x.score == null ? '' : x.score]); });
      lines.push([]); lines.push(['Mã', 'Công việc', 'Người phụ trách', 'Bắt đầu', 'Hạn', 'Hoàn thành', 'Trạng thái', 'Tiến độ', 'Điểm']);
      rangeTasks(r[0], r[1]).forEach(function (t) { lines.push([t.code, t.title, (user(t.assigneeId) || {}).name || '', ddmmyyyy(startOf(t)), ddmmyyyy(t.dueDate), ddmmyyyy(t.doneDate), ST_LABEL[eff(t)], (t.status === 'xong' ? 100 : t.progress || 0) + '%', t.score == null ? '' : t.score]); });
      var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v == null ? '' : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = 'Danh gia ' + r[2].replace(/\//g, '-') + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    };
  }
  function renderStaff() {
    var lead = isLead(), all = (lead ? users() : activeUsers()).filter(function (u) { return !u.pending; });
    var pend = lead ? users().filter(function (u) { return u.pending; }) : [];
    var groups = [['lead', 'Lãnh đạo Phòng']].concat(Object.keys(PDT.TEAMS).map(function (k) { return [k, PDT.TEAMS[k]]; })).concat([['none', 'Chưa xếp tổ']]);
    var html = header(lead ? 'Nhân sự' : 'Nhân sự của Phòng', { back: true, noRefresh: true }) +
      (lead ? '<div class="bar"><button class="btn pri" id="adduser">' + ic('plus') + 'Thêm cán bộ</button><button class="btn" id="addmany">' + ic('users') + 'Thêm nhiều cán bộ</button></div>' +
        '<div class="hint" style="margin:-4px 4px 8px">Cán bộ cũng có thể tự bấm <b>Đăng ký</b> ở màn đăng nhập bằng email trường; đăng ký hiện ở mục Chờ duyệt dưới đây.</div>' : '') +
      (pend.length ? '<div class="sec"><h2>Chờ duyệt (' + pend.length + ')</h2></div><div class="card list">' + pend.map(function (u) {
        return '<div class="row">' + av(u, true) + '<div class="body"><b>' + esc(u.name) + '</b><div class="meta">' + esc(u.username) +
          (u.team ? ' · ' + esc(PDT.TEAMS[u.team]) : '') + (u.createdAt ? ' · ' + timeAgo(u.createdAt) : '') + '</div>' +
          '<div class="btns mt"><button class="btn sm dan" data-rej="' + u.id + '">Từ chối</button><button class="btn sm ok" data-apv="' + u.id + '">' + ic('check') + 'Duyệt</button></div></div></div>';
      }).join('') + '</div>' : '');
    groups.forEach(function (g) {
      var l = all.filter(function (u) { return g[0] === 'lead' ? u.role === 'lanh_dao' : g[0] === 'none' ? u.role !== 'lanh_dao' && !u.team : u.role !== 'lanh_dao' && u.team === g[0]; });
      if (!l.length) return;
      html += '<div class="sec"><h2>' + esc(g[1]) + '</h2></div><div class="card list">' + l.map(function (u) {
        return '<div class="row" style="align-items:center" data-u="' + u.id + '">' + av(u, true) + '<div class="body"><b>' + esc(u.name) + '</b>' + (u.badge ? '<span class="tag pt">' + esc(u.badge) + '</span>' : '') + (u.active ? '' : ' <span class="tag">Ngừng</span>') + '<div class="meta">' + esc(u.title || PDT.ROLES[u.role]) + (lead ? ' · ' + esc(u.username || '') : '') + '</div></div></div>';
      }).join('') + '</div>';
    });
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    if (!lead) return;
    root.querySelector('#adduser').onclick = function () { userForm(); };
    root.querySelectorAll('[data-u]').forEach(function (el) { el.onclick = function () { userForm(user(el.getAttribute('data-u'))); }; });
    root.querySelectorAll('[data-apv]').forEach(function (b) {
      b.onclick = function () {
        var u = user(b.getAttribute('data-apv'));
        ask('Duyệt tài khoản ' + u.name, [
          { type: 'info', html: esc(u.username) },
          { name: 'role', label: 'Quyền', type: 'select', value: 'chuyen_vien', options: Object.keys(PDT.ROLES).map(function (k) { return [k, PDT.ROLES[k]]; }) },
          { name: 'team', label: 'Tổ', type: 'select', value: u.team || '', options: [['', '—']].concat(Object.keys(PDT.TEAMS).map(function (k) { return [k, PDT.TEAMS[k]]; })) },
          { name: 'title', label: 'Chức danh', value: u.title || 'Chuyên viên' },
          { name: 'badge', label: 'Nhãn chức vụ (vd: PT 2, để trống nếu không cần)', value: '' }
        ], 'Duyệt').then(function (r) { if (r) act('approveUser', Object.assign({ id: u.id }, r), 'Đã duyệt ' + u.name); });
      };
    });
    root.querySelectorAll('[data-rej]').forEach(function (b) {
      b.onclick = function () {
        var u = user(b.getAttribute('data-rej'));
        confirmBox('Từ chối đăng ký', 'Từ chối và xóa đăng ký của ' + u.name + ' (' + u.username + ')?', 'Từ chối').then(function (ok) { if (ok) act('rejectUser', { id: u.id }, 'Đã từ chối'); });
      };
    });
    root.querySelector('#addmany').onclick = function () {
      ask('Thêm nhiều cán bộ', [
        { name: 'list', label: 'Mỗi dòng một cán bộ: Họ và tên, email (thêm ", 1" hoặc ", 2" để xếp vào Tổ 1, Tổ 2)', type: 'textarea',
          ph: 'Nguyễn Văn A, nva@uneti.edu.vn, 1\nTrần Thị B, ttb@uneti.edu.vn, 2', hint: 'Có thể dán từ Excel (cột cách nhau bằng phím Tab). Tài khoản dùng mật khẩu ban đầu, cán bộ đổi khi đăng nhập lần đầu.' }
      ], 'Thêm').then(function (r) {
        if (!r || !r.list.trim()) return;
        var rows = r.list.split(/\r?\n/).map(function (l) {
          var p = l.split(/[,;\t]/).map(function (x) { return x.trim(); });
          var t = (p[2] || '').replace(/\D/g, '');
          return { name: p[0], email: p[1], team: t === '1' ? 'to1' : t === '2' ? 'to2' : '' };
        }).filter(function (x) { return x.name || x.email; });
        act('addUsers', { rows: rows }).then(function (x) {
          ask('Kết quả thêm cán bộ', [{ type: 'info', html: 'Đã tạo <b>' + x.created.length + '</b> tài khoản, mật khẩu ban đầu <b>' + esc(x.tempPassword) + '</b>.' +
            (x.skipped.length ? '<br><br>Bỏ qua ' + x.skipped.length + ' dòng:<br>' + x.skipped.map(esc).join('<br>') : '') }], 'Đã ghi nhận');
        });
      });
    };
  }
  function userForm(u) {
    var isNew = !u; u = u || { name: '', username: '', role: 'chuyen_vien', team: '', title: 'Chuyên viên', active: true, sort: 99 };
    var html = '<form id="uf"><div class="fld"><label>Họ và tên *</label><input class="inp" name="name" value="' + esc(u.name) + '"></div>' +
      '<div class="two"><div class="fld"><label>Email đăng nhập *</label><input class="inp" name="username" inputmode="email" value="' + esc(u.username || '') + '" autocapitalize="off" placeholder="ten@uneti.edu.vn"></div>' +
      '<div class="fld"><label>Chức danh</label><input class="inp" name="title" value="' + esc(u.title || '') + '"></div></div>' +
      '<div class="fld"><label>Nhãn chức vụ hiện trong bảng tổng hợp</label><input class="inp" name="badge" maxlength="12" value="' + esc(u.badge || '') + '" placeholder="vd: PT 2"><div class="hint">Dùng cho Phó Trưởng phòng (PT 1, PT 2…). Để trống nếu không cần.</div></div>' +
      '<div class="two"><div class="fld"><label>Quyền</label><select class="inp" name="role">' + Object.keys(PDT.ROLES).map(function (k) { return '<option value="' + k + '"' + (u.role === k ? ' selected' : '') + '>' + PDT.ROLES[k] + '</option>'; }).join('') + '</select></div>' +
      '<div class="fld"><label>Tổ</label><select class="inp" name="team"><option value="">—</option>' + Object.keys(PDT.TEAMS).map(function (k) { return '<option value="' + k + '"' + (u.team === k ? ' selected' : '') + '>' + PDT.TEAMS[k] + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="two"><div class="fld"><label>Thứ tự hiển thị</label><input class="inp" type="number" name="sort" value="' + esc(u.sort == null ? 99 : u.sort) + '"></div>' +
      '<div class="fld"><label>Trạng thái</label><select class="inp" name="active"><option value="1"' + (u.active ? ' selected' : '') + '>Đang làm việc</option><option value="0"' + (u.active ? '' : ' selected') + '>Ngừng sử dụng</option></select></div></div>' +
      '<div class="hint">Lãnh đạo Phòng: giao, duyệt mọi việc, quản lý nhân sự, cài đặt. Tổ trưởng, Tổ phó: giao việc cho cán bộ trong tổ, duyệt việc của tổ; lãnh đạo Phòng vẫn xem và duyệt được mọi việc. Chuyên viên: nhận việc, cập nhật tiến độ, đề xuất việc.</div></form>';
    var ov = openModal(isNew ? 'Thêm cán bộ' : 'Sửa thông tin cán bộ', html, {
      small: true, foot: (isNew ? '' : '<button class="btn" data-reset style="margin-right:auto">' + ic('lock') + 'Đặt lại mật khẩu</button>') + '<button class="btn" data-x>Hủy</button><button class="btn pri" data-save>Lưu</button>'
    });
    var f = ov.querySelector('#uf');
    ov.querySelector('[data-save]').onclick = function () {
      act('saveUser', { user: { id: u.id, name: f.name.value, username: f.username.value, title: f.title.value, badge: f.badge.value, role: f.role.value, team: f.team.value, sort: +f.sort.value, active: f.active.value === '1' } }, 'Đã lưu')
        .then(function (r) { closeModal(); if (r.tempPassword) setTimeout(function () { ask('Đã tạo tài khoản', [{ type: 'info', html: 'Email đăng nhập: <b>' + esc(r.user.username) + '</b><br>Mật khẩu ban đầu: <b>' + esc(r.tempPassword) + '</b><br>Cán bộ sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu.' }], 'Đã ghi nhận'); }, 300); });
    };
    var rs = ov.querySelector('[data-reset]');
    if (rs) rs.onclick = function () {
      confirmBox('Đặt lại mật khẩu', 'Đặt lại mật khẩu của ' + u.name + ' về mật khẩu mặc định?', 'Đặt lại').then(function (ok) {
        if (ok) api('resetPassword', { id: u.id }).then(function (r) { toast('Mật khẩu mới: ' + r.tempPassword); }).catch(function (e) { toast(e.message); });
      });
    };
  }
  /* ================= Logo ================= */
  var DEFAULT_LOGO = 'icons/logo-uneti.png';
  function logoSrc() { return (S.data && S.data.settings && S.data.settings.logo) || LS.get('pdt_logo', '') || DEFAULT_LOGO; }
  function readImage(file) {
    return new Promise(function (res, rej) {
      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { rej(new Error('Hãy chọn ảnh PNG, JPG hoặc WEBP.')); return; }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error('Không đọc được ảnh.')); };
      img.src = url;
    });
  }
  /* Logo trong app: thu về khung 240px, giữ nền trong suốt; giảm dần cỡ nếu dung lượng lớn */
  function logoDataUrl(img) {
    var sizes = [240, 200, 160, 128];
    for (var i = 0; i < sizes.length; i++) {
      var k = Math.min(1, sizes[i] / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
      var g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
      var png = c.toDataURL('image/png');
      if (png.length < 44000) return png;
      var webp = c.toDataURL('image/webp', 0.9);
      if (webp.indexOf('data:image/webp') === 0 && webp.length < 44000) return webp;
    }
    throw new Error('Ảnh logo quá chi tiết, hãy chọn ảnh khác nhỏ hơn.');
  }
  function iconCanvas(img, size, scale, round) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, size, size);
    var k = size * scale / Math.max(img.naturalWidth, img.naturalHeight);
    var w = img.naturalWidth * k, h = img.naturalHeight * k;
    g.imageSmoothingQuality = 'high'; g.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return c;
  }
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { rej(new Error('Không đọc được logo.')); }; i.src = src; }); }
  function downloadIcons() {
    return loadImg(logoSrc()).then(function (img) {
      var list = [['icon-192.png', 192, .84], ['icon-512.png', 512, .84], ['apple-touch-icon.png', 180, .84], ['icon-maskable-512.png', 512, .64], ['favicon.png', 64, .9]];
      toast('Đang tạo 5 tệp biểu tượng…');
      return list.reduce(function (p, x) {
        return p.then(function () {
          return new Promise(function (res) {
            iconCanvas(img, x[1], x[2]).toBlob(function (b) {
              var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = x[0];
              document.body.appendChild(a); a.click(); a.remove(); setTimeout(res, 400);
            }, 'image/png');
          });
        });
      }, Promise.resolve()).then(function () { toast('Đã tải 5 tệp biểu tượng. Tải lên thư mục icons trên GitHub.'); });
    });
  }
  /* Áp logo cho biểu tượng trình duyệt, biểu tượng khi thêm vào màn hình chính iPhone */
  function applyLogo() {
    var src = logoSrc();
    if (S.data && S.data.settings) LS.set('pdt_logo', S.data.settings.logo || '');
    if (src === DEFAULT_LOGO) {
      var f0 = document.querySelector('link[rel=icon]'); if (f0) f0.href = 'icons/favicon.png';
      var a0 = document.querySelector('link[rel=apple-touch-icon]'); if (a0) a0.href = 'icons/apple-touch-icon.png';
      return;
    }
    loadImg(src).then(function (img) {
      var fav = document.querySelector('link[rel=icon]'); if (fav) fav.href = iconCanvas(img, 64, .9).toDataURL('image/png');
      var ap = document.querySelector('link[rel=apple-touch-icon]'); if (ap) ap.href = iconCanvas(img, 180, .84).toDataURL('image/png');
    }).catch(function () { });
  }

  function renderSettings() {
    var s = sett();
    var html = header('Cài đặt', { back: true, noRefresh: true }) + '<form id="sf" class="card pad">' +
      '<div class="fld"><label>Tên đơn vị</label><input class="inp" name="tenPhong" value="' + esc(s.tenPhong) + '"></div>' +
      '<div class="fld"><label>Danh mục công việc (mỗi dòng một danh mục)</label><textarea class="inp" name="categories" style="min-height:200px">' + esc((s.categories || []).join('\n')) + '</textarea></div>' +
      '<div class="two"><div class="fld"><label>Trừ điểm mỗi ngày nộp trễ</label><input class="inp" type="number" name="truMoiNgayTre" value="' + esc(s.truMoiNgayTre) + '"></div>' +
      '<div class="fld"><label>Trừ tối đa cho một việc trễ</label><input class="inp" type="number" name="truToiDa" value="' + esc(s.truToiDa) + '"></div></div>' +
      '<div class="two"><div class="fld"><label>Trừ điểm mỗi việc đang quá hạn</label><input class="inp" type="number" name="truQuaHan" value="' + esc(s.truQuaHan) + '"></div>' +
      '<div class="fld"><label>Mật khẩu mặc định khi cấp tài khoản</label><input class="inp" name="matKhauMacDinh" value="' + esc(s.matKhauMacDinh) + '"></div></div>' +
      '<button class="btn pri" type="submit">Lưu cài đặt</button></form>' +
      '<div class="sec"><h2>Logo của app</h2></div><div class="card pad">' +
      '<div style="display:flex;gap:16px;align-items:center"><div class="logobox"><img src="' + esc(logoSrc()) + '" alt="Logo"></div>' +
      '<div class="small muted">Logo hiện ở màn đăng nhập, Trang chủ, thanh bên và làm biểu tượng app khi cài mới. Nên dùng ảnh PNG nền trong suốt, hình gần vuông.</div></div>' +
      '<div class="btns mt"><button class="btn pri" id="lgpick">' + ic('edit') + 'Chọn logo mới</button>' +
      (s.logo ? '<button class="btn" id="lgreset">Dùng logo UNETI mặc định</button>' : '') +
      '<button class="btn" id="lgicons">' + ic('download') + 'Tải bộ biểu tượng điện thoại</button></div>' +
      '<input type="file" id="lgfile" accept="image/png,image/jpeg,image/webp" hidden>' +
      '<div class="hint mt">Đổi biểu tượng trên màn hình chính điện thoại: bấm "Tải bộ biểu tượng điện thoại", tải 5 tệp vừa nhận lên thư mục <b>icons</b> trên GitHub (ghi đè). Android tự cập nhật sau ít ngày; iPhone cần xóa biểu tượng cũ rồi thêm lại vào màn hình chính.</div></div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    var f = root.querySelector('#sf');
    var lf = root.querySelector('#lgfile');
    root.querySelector('#lgpick').onclick = function () { lf.click(); };
    lf.onchange = function () {
      var file = lf.files[0]; if (!file) return;
      readImage(file).then(function (img) { return act('saveSettings', { settings: { logo: logoDataUrl(img) } }, 'Đã đổi logo'); })
        .then(function () { applyLogo(); render(); }).catch(function (e) { toast(e.message); });
    };
    var rs = root.querySelector('#lgreset');
    if (rs) rs.onclick = function () { act('saveSettings', { settings: { logo: '' } }, 'Đã dùng lại logo UNETI').then(function () { applyLogo(); render(); }); };
    root.querySelector('#lgicons').onclick = function () { downloadIcons().catch(function (e) { toast(e.message); }); };
    f.onsubmit = function (e) {
      e.preventDefault();
      act('saveSettings', { settings: { tenPhong: f.tenPhong.value, categories: f.categories.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), truMoiNgayTre: +f.truMoiNgayTre.value, truToiDa: +f.truToiDa.value, truQuaHan: +f.truQuaHan.value, matKhauMacDinh: f.matKhauMacDinh.value } }, 'Đã lưu cài đặt');
    };
  }
  function renderInstall() {
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    var html = header('Cài đặt ứng dụng', { back: true, noRefresh: true }) +
      (standalone ? '<div class="card pad"><b class="c-ok">Ứng dụng đã được cài trên thiết bị này.</b></div>' : '') +
      (installEvt ? '<div class="card pad mt"><button class="btn pri" id="inst">' + ic('download') + 'Cài đặt ngay</button></div>' : '') +
      '<div class="card pad mt"><b>iPhone, iPad (Safari)</b><ol class="muted"><li>Mở đường dẫn app bằng Safari.</li><li>Bấm nút Chia sẻ (ô vuông có mũi tên lên).</li><li>Chọn "Thêm vào MH chính", bấm "Thêm".</li><li>Mở app từ biểu tượng trên màn hình chính, vào Thêm › Thông báo trên thiết bị để bật thông báo.</li></ol></div>' +
      '<div class="card pad mt"><b>Điện thoại Android (Chrome)</b><ol class="muted"><li>Mở đường dẫn app bằng Chrome.</li><li>Bấm menu ⋮ ở góc trên, chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".</li><li>Mở app, bật Thông báo trên thiết bị.</li></ol></div>' +
      '<div class="card pad mt"><b>Máy tính (Chrome, Edge)</b><ol class="muted"><li>Bấm biểu tượng cài đặt ở cuối thanh địa chỉ.</li><li>App mở thành cửa sổ riêng, có biểu tượng trên thanh tác vụ.</li></ol></div>';
    var root = app.querySelector('.main'); root.innerHTML = html; bindHeader(root);
    var b = root.querySelector('#inst'); if (b) b.onclick = function () { installEvt.prompt(); installEvt.userChoice.then(function () { installEvt = null; render(); }); };
  }

  /* ================= Khung chính ================= */
  function renderShell() {
    var unread = (D().notifs || []).filter(function (n) { return !n.read; }).length;
    var tabs = [['home', 'home', 'Trang chủ'], ['tasks', 'list', 'Công việc'], ['plan', 'cal', 'Kế hoạch'], ['me', 'user', 'Của tôi'], ['more', 'more', 'Thêm']];
    app.innerHTML = '<div class="shell"><nav class="tabbar"><div class="brand"><img src="' + esc(logoSrc()) + '" alt="Logo"><div>' + esc(sett().tenPhong) + '<small>Quản lý công việc</small></div></div>' +
      tabs.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '">' + ic(t[1]) + '<span>' + t[2] + '</span>' + (t[0] === 'more' && unread ? '<span class="dot">' + unread + '</span>' : '') + '</button>'; }).join('') +
      '</nav><main class="main"></main></div><button class="fab" aria-label="Thêm mới">' + ic('plus') + '</button>';
    app.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-tab'); if (t === 'tasks' && S.tab !== 'tasks') { S.filter = {}; } go(t); }; });
    app.querySelector('.fab').onclick = function () {
      if (S.tab === 'me' && S.meTab === 'notes') return openNoteForm();
      if (isLead() || isTL()) return openTaskForm(null);
      openTaskForm(null, { propose: true });
    };
  }
  function render() {
    var ae = document.activeElement, keep = ae && ae.id && app.contains(ae) ? { id: ae.id, s: ae.selectionStart, e: ae.selectionEnd } : null;
    renderInner();
    if (keep) { var el = document.getElementById(keep.id); if (el) { el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (x) { } } }
  }
  function renderInner() {
    if (!S.token) return renderLogin();
    if (!S.data) { app.innerHTML = '<div class="boot">Đang tải dữ liệu…</div>'; return; }
    renderShell();
    switch (S.tab) {
      case 'tasks': renderTasks(); break;
      case 'plan': renderPlan(); break;
      case 'me': renderMe(); break;
      case 'more': renderMore(); break;
      default: renderHome();
    }
  }

  /* ================= Đăng nhập ================= */
  function renderLogin() {
    app.innerHTML = '<div class="login"><form class="card" id="lf"><div class="lg"><img src="' + esc(logoSrc()) + '" alt="Logo"><div><h1>' + esc(CFG.TEN_APP || 'Công việc Phòng Đào tạo') + '</h1><p>' + esc(CFG.TEN_TRUONG || '') + '</p></div></div>' +
      '<div class="fld"><label>Email</label><input class="inp" name="u" inputmode="email" autocomplete="username" autocapitalize="off" placeholder="ten@uneti.edu.vn" required></div>' +
      '<div class="fld"><label>Mật khẩu</label><input class="inp" name="p" type="password" autocomplete="current-password" required></div>' +
      '<div class="err" id="lerr"></div><button class="btn pri" type="submit">Đăng nhập</button>' +
      '<div class="small muted" style="text-align:center;margin-top:16px">Cán bộ Phòng chưa có tài khoản? <button type="button" class="link" id="reg">Đăng ký</button></div>' +
      (DEMO ? '<div class="demo mt">Bản dùng thử. Tài khoản mẫu (đuôi @uneti.edu.vn, mật khẩu chung <b>1111</b>): <b>truongphong</b> (lãnh đạo Phòng), <b>totruong1</b>, <b>totruong2</b> (tổ trưởng), <b>topho1</b> (tổ phó), <b>chuyenvien1</b>…<b>chuyenvien4</b>.</div>' : '') +
      '</form></div>';
    var f = document.getElementById('lf');
    document.getElementById('reg').onclick = openRegister;
    f.onsubmit = function (e) {
      e.preventDefault();
      var btn = f.querySelector('button'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span>';
      api('login', { username: f.u.value, password: f.p.value }).then(function (r) {
        S.token = r.token; LS.set('pdt_token', r.token);
        return load(true).then(function () { keepPushFresh(); if (r.mustChange) changePass(true); });
      }).catch(function (er) { document.getElementById('lerr').textContent = er.message; btn.disabled = false; btn.textContent = 'Đăng nhập'; });
    };
  }
  function openRegister() {
    var html = '<form id="rf"><div class="fld"><label>Họ và tên</label><input class="inp" name="name" autocomplete="name"></div>' +
      '<div class="fld"><label>Email của Trường</label><input class="inp" name="email" inputmode="email" autocapitalize="off" placeholder="ten@uneti.edu.vn"></div>' +
      '<div class="fld"><label>Tổ</label><select class="inp" name="team"><option value="">— Chưa rõ —</option>' + Object.keys(PDT.TEAMS).map(function (k) { return '<option value="' + k + '">' + esc(PDT.TEAMS[k]) + '</option>'; }).join('') + '</select></div>' +
      '<div class="two"><div class="fld"><label>Mật khẩu (từ 6 ký tự)</label><input class="inp" name="p1" type="password" autocomplete="new-password"></div>' +
      '<div class="fld"><label>Nhập lại mật khẩu</label><input class="inp" name="p2" type="password" autocomplete="new-password"></div></div>' +
      '<div class="err" id="rerr"></div><div class="hint">Lãnh đạo Phòng duyệt xong, anh/chị đăng nhập bằng email và mật khẩu vừa đặt.</div></form>';
    var ov = openModal('Đăng ký tài khoản', html, { small: true, foot: '<button class="btn" data-x>Hủy</button><button class="btn pri" data-reg>Gửi đăng ký</button>' });
    var rf = ov.querySelector('#rf');
    ov.querySelector('[data-reg]').onclick = function () {
      var e = ov.querySelector('#rerr'); e.textContent = '';
      if (rf.p1.value !== rf.p2.value) { e.textContent = 'Hai lần nhập mật khẩu không khớp.'; return; }
      var b = this; b.disabled = true;
      api('register', { name: rf.name.value, email: rf.email.value, team: rf.team.value, password: rf.p1.value }).then(function () {
        closeModal();
        setTimeout(function () { ask('Đã gửi đăng ký', [{ type: 'info', html: 'Đăng ký đã chuyển tới lãnh đạo Phòng. Sau khi được duyệt, anh/chị đăng nhập bằng email và mật khẩu vừa đặt.' }], 'Đã hiểu'); }, 300);
      }).catch(function (er) { e.textContent = er.message; b.disabled = false; });
    };
  }
  function logout(expired) {
    var f = LS.get('pdt_fcm', null);
    if (f && !expired) api('unregisterDevice', { token: f.token }).catch(function () { });
    LS.del('pdt_fcm');
    S.token = null; S.data = null; S.tab = 'home'; S.sub = null; S.filter = {}; S.month = null; LS.del('pdt_token'); LS.del('pdt_cache');
    history.replaceState({ tab: 'home' }, '', '#home');
    while (modalStack.length) { var m = modalStack.pop(); m.el.remove(); }
    document.body.style.overflow = '';
    render();
    if (expired) toast('Phiên đăng nhập đã hết, vui lòng đăng nhập lại.');
  }
  function applyTheme() {
    var t = LS.get('pdt_theme', '');
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  }

  /* ================= Khởi động ================= */
  applyTheme();
  if (LS.get('pdt_logo', '')) setTimeout(applyLogo, 0);
  var h = (location.hash || '').replace('#', '').split('/');
  if (['home', 'tasks', 'plan', 'me', 'more'].indexOf(h[0]) >= 0 && !h[1]) S.tab = h[0];
  history.replaceState({ tab: S.tab }, '', '#' + S.tab);
  var openTaskId = new URLSearchParams(location.search).get('task');
  if (openTaskId) history.replaceState({ tab: S.tab }, '', location.pathname + '#' + S.tab);
  function openPendingTask() { if (openTaskId && task(openTaskId)) { var id = openTaskId; openTaskId = null; openTask(id); } }
  if (S.token) {
    var cached = LS.get('pdt_cache', null);
    if (cached) S.data = cached;
    render();
    load(true).then(function () { keepPushFresh(); openPendingTask(); });
  } else render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'push' && S.token) load(true);
    if (d.type === 'open' && d.taskId) { openTaskId = d.taskId; if (S.data) openPendingTask(); }
  });
  setInterval(function () { if (S.token && !document.hidden && !modalStack.length) load(true); }, (CFG.LAM_MOI_GIAY || 60) * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && S.token) load(true); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () { });
})();
