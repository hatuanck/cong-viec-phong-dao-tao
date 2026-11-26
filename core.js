/*
 * LÕI NGHIỆP VỤ - App Quản lý công việc Phòng Đào tạo
 * Dùng chung cho: (1) bản web ở chế độ dùng thử (lưu trên máy) và
 *                 (2) máy chủ Google Apps Script (lưu trên Google Sheet).
 * Không sửa riêng một nơi: sửa ở đây rồi chép sang apps-script/core.gs.
 */
var PDT = (function () {
  'use strict';
  var VERSION = '1.7.0';

  /* ---------- Cấu trúc dữ liệu (mỗi bảng = một trang tính) ---------- */
  var SCHEMA = {
    Users: {
      fields: ['id', 'username', 'passHash', 'salt', 'name', 'role', 'team', 'title', 'birthday', 'phone', 'email', 'active', 'mustChange', 'sort', 'createdAt', 'badge', 'pending'],
      num: ['sort'], bool: ['active', 'mustChange', 'pending'], json: []
    },
    Tasks: {
      fields: ['id', 'code', 'title', 'desc', 'assigneeId', 'collaborators', 'creatorId', 'team', 'priority', 'category', 'status', 'progress', 'startDate', 'dueDate', 'doneDate', 'submittedAt', 'approvedBy', 'score', 'planItem', 'evidence', 'createdAt', 'updatedAt'],
      num: ['progress', 'score'], bool: [], json: ['collaborators', 'evidence']
    },
    Logs: { fields: ['id', 'taskId', 'userId', 'kind', 'text', 'at'], num: [], bool: [], json: [] },
    Notes: {
      fields: ['id', 'userId', 'kind', 'title', 'date', 'lunar', 'yearly', 'remindDays', 'createdAt'],
      num: ['remindDays'], bool: ['lunar', 'yearly'], json: []
    },
    Plans: {
      fields: ['id', 'kind', 'year', 'month', 'status', 'goal', 'items', 'createdBy', 'updatedAt'],
      num: [], bool: [], json: ['items']
    },
    Notifs: { fields: ['id', 'userId', 'text', 'taskId', 'read', 'at'], num: [], bool: ['read'], json: [] },
    Devices: { fields: ['id', 'userId', 'token', 'ua', 'at'], num: [], bool: [], json: [] },
    Settings: { fields: ['id', 'value'], num: [], bool: [], json: ['value'] }
  };

  var ROLES = { lanh_dao: 'Lãnh đạo Phòng', to_truong: 'Tổ trưởng', to_pho: 'Tổ phó', chuyen_vien: 'Chuyên viên' };
  var TEAMS = {
    to1: 'Tổ Quản lý chương trình và Đào tạo từ xa',
    to2: 'Tổ Quản lý kế hoạch và Hợp tác doanh nghiệp'
  };
  var STATUS = {
    de_xuat: 'Đề xuất', chua: 'Chưa bắt đầu', dang: 'Đang làm', cho_duyet: 'Chờ duyệt',
    xong: 'Hoàn thành', huy: 'Đã hủy', qua_han: 'Quá hạn'
  };
  var PRIORITY = { thuong: 'Thường', cao: 'Cao', khan: 'Khẩn cấp' };

  var DEFAULT_SETTINGS = {
    tenPhong: 'Phòng Đào tạo',
    categories: ['Kế hoạch, thời khóa biểu', 'CTĐT và chuẩn đầu ra', 'Giáo vụ', 'Văn bằng, chứng chỉ', 'Kiểm định, tự đánh giá',
      'Hợp tác doanh nghiệp, thực tập', 'Sau đại học', 'Đào tạo từ xa', 'Văn bản, báo cáo', 'Khác'],
    truMoiNgayTre: 2,   // điểm trừ cho mỗi ngày nộp trễ hạn
    truToiDa: 30,       // trừ tối đa cho một việc trễ
    truQuaHan: 5,       // điểm trừ cho mỗi việc đang quá hạn trong kỳ đánh giá
    matKhauMacDinh: '1111'
  };
  var DOMAIN = 'uneti.edu.vn';
  /* Chuẩn hóa email đăng nhập: chữ thường; gõ thiếu đuôi thì tự thêm @uneti.edu.vn */
  function normEmail(s) {
    s = String(s || '').trim().toLowerCase();
    if (s && s.indexOf('@') < 0) s += '@' + DOMAIN;
    return s;
  }
  function validEmail(s) { return /^[a-z0-9._-]+@uneti\.edu\.vn$/.test(s); }

  /* ---------- SHA-256 thuần JS (chạy cả trình duyệt và Apps Script) ---------- */
  function sha256(str) {
    var ascii = unescape(encodeURIComponent(String(str)));
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var maxWord = Math.pow(2, 32), i, j, result = '';
    var words = [], bitLen = ascii.length * 8;
    var hash = [], k = [], pc = 0, isComp = {};
    for (var cand = 2; pc < 64; cand++) {
      if (!isComp[cand]) {
        for (i = 0; i < 313; i += cand) isComp[i] = cand;
        hash[pc] = (Math.pow(cand, 0.5) * maxWord) | 0;
        k[pc++] = (Math.pow(cand, 1 / 3) * maxWord) | 0;
      }
    }
    hash = hash.slice(0, 8);
    ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((bitLen / maxWord) | 0);
    words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), old = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? '0' : '') + b.toString(16); }
    return result;
  }
  function hashPass(pass, salt) {
    var h = salt + '|' + pass;
    for (var i = 0; i < 500; i++) h = sha256(h + '|' + salt);
    return h;
  }
  function sign(msg, secret) { return sha256(secret + '|' + msg + '|' + secret).slice(0, 40); }

  /* ---------- Chuyển dòng trang tính <-> đối tượng ---------- */
  function toRow(table, o) {
    var s = SCHEMA[table];
    return s.fields.map(function (f) {
      var v = o[f];
      if (s.json.indexOf(f) >= 0) return JSON.stringify(v == null ? (f === 'value' ? null : []) : v);
      if (v == null) return '';
      if (s.bool.indexOf(f) >= 0) return v ? 'TRUE' : 'FALSE';
      return String(v);
    });
  }
  function fromRow(table, r) {
    var s = SCHEMA[table], o = {};
    s.fields.forEach(function (f, i) {
      var v = r[i];
      if (s.json.indexOf(f) >= 0) {
        try { o[f] = (v === '' || v == null) ? (f === 'value' ? null : []) : JSON.parse(v); } catch (e) { o[f] = f === 'value' ? v : []; }
      } else if (s.num.indexOf(f) >= 0) {
        o[f] = (v === '' || v == null) ? null : Number(v);
      } else if (s.bool.indexOf(f) >= 0) {
        o[f] = v === true || String(v).toUpperCase() === 'TRUE';
      } else if (v instanceof Date) {
        o[f] = isoDate(v);
      } else {
        o[f] = v == null ? '' : String(v);
      }
    });
    return o;
  }
  function isoDate(d) {
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  function dayDiff(a, b) { // số ngày từ a đến b (chuỗi yyyy-mm-dd)
    if (!a || !b) return 0;
    var pa = a.split('-'), pb = b.split('-');
    return Math.round((Date.UTC(+pb[0], +pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], +pa[1] - 1, +pa[2])) / 86400000);
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- Phân quyền ---------- */
  function isLead(u) { return u && u.role === 'lanh_dao'; }
  /* Tổ trưởng, Tổ phó: giao, duyệt việc của cán bộ trong tổ mình */
  function isTeamLead(u) { return !!u && (u.role === 'to_truong' || u.role === 'to_pho'); }
  function canAssignTo(u, assignee) {
    if (!u || !assignee) return false;
    if (isLead(u)) return true;
    if (isTeamLead(u)) return assignee.id === u.id || assignee.team === u.team;
    return false;
  }
  function canManage(u, t) { // sửa nội dung, hủy việc
    if (!u || !t) return false;
    return isLead(u) || t.creatorId === u.id || (isTeamLead(u) && t.team === u.team);
  }
  function canApprove(u, t) {
    if (!u || !t) return false;
    if (isLead(u)) return true;
    return isTeamLead(u) && t.team === u.team && t.assigneeId !== u.id;
  }
  function canWork(u, t) { return u && t && (t.assigneeId === u.id || canManage(u, t)); }
  function effStatus(t, today) {
    if ((t.status === 'chua' || t.status === 'dang') && t.dueDate && t.dueDate < today) return 'qua_han';
    return t.status;
  }
  function defaultScore(t, settings) {
    var late = Math.max(0, dayDiff(t.dueDate, t.submittedAt || t.doneDate));
    var tru = Math.min(Number(settings.truToiDa || 30), late * Number(settings.truMoiNgayTre || 2));
    return Math.max(0, 100 - tru);
  }

  /* ---------- Bộ xử lý yêu cầu ---------- */
  function createCore(store, env) {
    function err(m) { var e = new Error(m); e.userError = true; throw e; }
    function settings() {
      var o = clone(DEFAULT_SETTINGS);
      store.all('Settings').forEach(function (r) { if (r.id !== 'secret' && r.id.indexOf('seq_') !== 0) o[r.id] = r.value; });
      return o;
    }
    function getSetting(k) { var r = store.all('Settings').filter(function (x) { return x.id === k; })[0]; return r ? r.value : null; }
    function setSetting(k, v) { store.put('Settings', { id: k, value: v }); }
    function secret() {
      var s = getSetting('secret');
      if (!s) { s = sha256(env.uuid() + env.uuid() + env.nowIso()); setSetting('secret', s); }
      return s;
    }
    function users() { return store.all('Users'); }
    function userById(id) { return users().filter(function (u) { return u.id === id; })[0]; }
    function pubUser(u, me) {
      var o = { id: u.id, name: u.name, role: u.role, team: u.team, title: u.title, badge: u.badge, birthday: u.birthday, active: u.active, sort: u.sort };
      if (isLead(me) || (me && me.id === u.id)) { o.username = u.username; o.phone = u.phone; o.email = u.email; o.pending = !!u.pending; o.createdAt = u.createdAt; }
      return o;
    }
    function task(id) { var t = store.all('Tasks').filter(function (x) { return x.id === id; })[0]; if (!t) err('Không tìm thấy công việc.'); return t; }
    function log(taskId, userId, kind, text) { store.put('Logs', { id: env.uuid(), taskId: taskId, userId: userId, kind: kind, text: text, at: env.nowIso() }); }
    function notify(ids, text, taskId, exceptId) {
      var seen = {};
      ids.forEach(function (id) {
        if (!id || id === exceptId || seen[id]) return; seen[id] = 1;
        store.put('Notifs', { id: env.uuid(), userId: id, text: text, taskId: taskId || '', read: false, at: env.nowIso() });
        pushQueue.push({ userId: id, text: text, taskId: taskId || '' });
      });
    }
    /* Gửi thông báo đẩy (Firebase) tới điện thoại, máy tính đã đăng ký của người nhận */
    var pushQueue = [];
    function flushPush() {
      if (!pushQueue.length || !env.push) return 0;
      var devs = store.all('Devices'), msgs = [];
      pushQueue.forEach(function (q) {
        devs.forEach(function (d) {
          if (d.userId === q.userId) msgs.push({ token: d.token, title: 'Công việc Phòng Đào tạo', body: q.text, taskId: q.taskId });
        });
      });
      pushQueue = [];
      if (!msgs.length) return 0;
      var bad = env.push(msgs) || [];
      devs.forEach(function (d) { if (bad.indexOf(d.token) >= 0) store.del('Devices', d.id); });
      return msgs.length - bad.length;
    }
    function leadsOf(team) {
      return users().filter(function (u) { return u.active && (isLead(u) || (isTeamLead(u) && u.team === team)); }).map(function (u) { return u.id; });
    }
    function approversOf(t) {
      var ids = [];
      var cr = userById(t.creatorId);
      if (cr && (isLead(cr) || isTeamLead(cr)) && cr.id !== t.assigneeId) ids.push(cr.id);
      users().forEach(function (u) { if (u.active && isTeamLead(u) && u.team === t.team && u.id !== t.assigneeId) ids.push(u.id); });
      if (!ids.length) users().forEach(function (u) { if (u.active && isLead(u)) ids.push(u.id); });
      return ids;
    }
    function involved(t) { return [t.assigneeId, t.creatorId].concat(t.collaborators || []); }
    function nextCode() {
      var yy = env.today().slice(2, 4), key = 'seq_' + yy;
      var n = Number(getSetting(key) || 0) + 1; setSetting(key, n);
      return 'CV' + yy + '-' + (n < 10 ? '00' : n < 100 ? '0' : '') + n;
    }
    function auth(token) {
      if (!token) err('AUTH');
      var p = String(token).split('.');
      if (p.length !== 3 || sign(p[0] + '.' + p[1], secret()) !== p[2]) err('AUTH');
      if (Number(p[1]) < Date.now()) err('AUTH');
      var u = userById(p[0]);
      if (!u || !u.active) err('AUTH');
      return u;
    }
    function makeToken(u) {
      var exp = Date.now() + 30 * 86400000;
      var body = u.id + '.' + exp;
      return body + '.' + sign(body, secret());
    }

    var A = {};

    A.login = function (d) {
      var name = normEmail(d.username);
      var u = users().filter(function (x) { return String(x.username).toLowerCase() === name; })[0];
      if (!u || hashPass(String(d.password || ''), u.salt) !== u.passHash) err('Sai email hoặc mật khẩu.');
      if (u.pending) err('Tài khoản đang chờ lãnh đạo Phòng duyệt. Vui lòng đăng nhập lại sau khi được duyệt.');
      if (!u.active) err('Tài khoản đã ngừng sử dụng. Liên hệ lãnh đạo Phòng.');
      return { token: makeToken(u), mustChange: !!u.mustChange };
    };

    /* Cán bộ tự đăng ký bằng email trường; tài khoản chờ lãnh đạo Phòng duyệt mới dùng được */
    A.register = function (d) {
      var name = String(d.name || '').trim().replace(/\s+/g, ' ');
      var mail = normEmail(d.email), pass = String(d.password || '');
      if (name.length < 4) err('Nhập đầy đủ họ và tên.');
      if (!validEmail(mail)) err('Chỉ đăng ký bằng email của Trường, dạng ten@uneti.edu.vn.');
      if (pass.length < 6) err('Mật khẩu cần ít nhất 6 ký tự.');
      var ex = users().filter(function (u) { return String(u.username).toLowerCase() === mail; })[0];
      if (ex) err(ex.pending ? 'Email này đã đăng ký, đang chờ duyệt.' : 'Email này đã có tài khoản. Hãy đăng nhập.');
      if (users().filter(function (u) { return u.pending; }).length >= 30) err('Đang có quá nhiều đăng ký chờ duyệt. Vui lòng liên hệ lãnh đạo Phòng.');
      var salt = env.uuid();
      var u = { id: env.uuid(), username: mail, email: mail, salt: salt, passHash: hashPass(pass, salt), name: name, role: 'chuyen_vien',
        team: TEAMS[d.team] ? d.team : '', title: 'Chuyên viên', birthday: '', phone: '', active: false, pending: true, mustChange: false,
        sort: 99, badge: '', createdAt: env.nowIso() };
      store.put('Users', u);
      notify(users().filter(function (x) { return x.active && isLead(x); }).map(function (x) { return x.id; }),
        name + ' (' + mail + ') đăng ký tài khoản, chờ duyệt', '', u.id);
      return { ok: 1 };
    };
    A.approveUser = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng duyệt tài khoản.');
      var u = userById(d.id); if (!u || !u.pending) err('Không tìm thấy đăng ký chờ duyệt.');
      u.pending = false; u.active = true;
      if (d.role) u.role = d.role;
      if (d.team != null) u.team = TEAMS[d.team] ? d.team : '';
      if (d.title != null) u.title = String(d.title || '');
      if (d.badge != null) u.badge = String(d.badge || '').trim().slice(0, 12);
      store.put('Users', u);
      notify([u.id], 'Chào mừng ' + u.name + '. Tài khoản đã được duyệt.', '', me.id);
      return { user: pubUser(u, me) };
    };
    A.rejectUser = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng xử lý đăng ký.');
      var u = userById(d.id); if (!u || !u.pending) err('Không tìm thấy đăng ký chờ duyệt.');
      store.del('Users', u.id);
      return {};
    };
    /* Thêm nhiều cán bộ một lần: mỗi dòng "Họ và tên, email" (có thể thêm ", tổ 1/2") */
    A.addUsers = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng thêm cán bộ.');
      var temp = String(settings().matKhauMacDinh || '1111'), created = [], skipped = [];
      (d.rows || []).slice(0, 100).forEach(function (r) {
        var name = String(r.name || '').trim(), mail = normEmail(r.email);
        if (!name || !validEmail(mail)) { skipped.push((name || '?') + ': email không hợp lệ'); return; }
        if (users().filter(function (u) { return String(u.username).toLowerCase() === mail; })[0]) { skipped.push(name + ': đã có tài khoản'); return; }
        var salt = env.uuid();
        store.put('Users', { id: env.uuid(), username: mail, email: mail, salt: salt, passHash: hashPass(temp, salt), name: name, role: 'chuyen_vien',
          team: TEAMS[r.team] ? r.team : '', title: 'Chuyên viên', birthday: '', phone: '', active: true, pending: false, mustChange: true,
          sort: 99, badge: '', createdAt: env.nowIso() });
        created.push(mail);
      });
      return { created: created, skipped: skipped, tempPassword: temp };
    };

    A.bootstrap = function (d, me) {
      var today = env.today();
      return {
        me: pubUser(me, me), today: today, version: VERSION,
        users: users().map(function (u) { return pubUser(u, me); }),
        tasks: store.all('Tasks'),
        plans: store.all('Plans'),
        notes: store.all('Notes').filter(function (n) { return n.userId === me.id; }),
        notifs: store.all('Notifs').filter(function (n) { return n.userId === me.id; })
          .sort(function (a, b) { return a.at < b.at ? 1 : -1; }).slice(0, 80),
        settings: settings()
      };
    };

    A.taskDetail = function (d) {
      var t = task(d.id);
      return { task: t, logs: store.all('Logs').filter(function (l) { return l.taskId === t.id; }).sort(function (a, b) { return a.at < b.at ? -1 : 1; }) };
    };

    A.saveTask = function (d, me) {
      var x = d.task || {};
      if (!String(x.title || '').trim()) err('Chưa nhập tên công việc.');
      if (!x.dueDate) err('Chưa chọn hạn hoàn thành.');
      var assignee = userById(x.assigneeId || me.id);
      if (!assignee) err('Người phụ trách không hợp lệ.');
      var fields = ['title', 'desc', 'priority', 'category', 'startDate', 'dueDate', 'planItem'];
      var now = env.nowIso();
      if (!x.id) {
        var t = { id: env.uuid(), code: nextCode(), creatorId: me.id, progress: 0, evidence: [], createdAt: now, updatedAt: now };
        fields.forEach(function (f) { t[f] = x[f] || ''; });
        t.title = String(t.title).trim();
        t.priority = t.priority || 'thuong';
        t.startDate = t.startDate || today0();
        t.assigneeId = assignee.id;
        t.collaborators = (x.collaborators || []).filter(function (id) { return id !== assignee.id; });
        t.team = x.team || assignee.team || me.team || '';
        var direct = canAssignTo(me, assignee) && !x.propose;
        t.status = direct ? 'chua' : 'de_xuat';
        store.put('Tasks', t);
        if (direct) {
          log(t.id, me.id, 'create', 'Giao việc cho ' + assignee.name);
          notify([t.assigneeId].concat(t.collaborators), me.name + ' giao việc: ' + t.title, t.id, me.id);
        } else {
          log(t.id, me.id, 'create', 'Đề xuất công việc');
          notify(leadsOf(t.team), me.name + ' đề xuất việc: ' + t.title, t.id, me.id);
        }
        return { task: t };
      }
      var cur = task(x.id);
      if (!canManage(me, cur)) err('Anh/chị không có quyền sửa công việc này.');
      if (assignee.id !== cur.assigneeId && !canAssignTo(me, assignee)) err('Không có quyền giao cho người này.');
      var changed = [];
      fields.forEach(function (f) { if (x[f] != null && x[f] !== cur[f]) { cur[f] = x[f]; changed.push(f); } });
      if (assignee.id !== cur.assigneeId) {
        cur.assigneeId = assignee.id; changed.push('assignee');
        notify([assignee.id], me.name + ' giao việc: ' + cur.title, cur.id, me.id);
      }
      if (x.collaborators) cur.collaborators = x.collaborators.filter(function (id) { return id !== cur.assigneeId; });
      if (x.team) cur.team = x.team;
      cur.updatedAt = now;
      store.put('Tasks', cur);
      if (changed.indexOf('dueDate') >= 0) notify(involved(cur), 'Đổi hạn "' + cur.title + '" sang ' + cur.dueDate.split('-').reverse().join('/'), cur.id, me.id);
      log(cur.id, me.id, 'edit', 'Cập nhật thông tin công việc');
      return { task: cur };
    };
    function today0() { return env.today(); }

    A.taskAction = function (d, me) {
      var t = task(d.id), op = d.op, st = settings(), now = env.nowIso(), today = env.today();
      var who = me.name;
      switch (op) {
        case 'progress':
          if (!canWork(me, t)) err('Chỉ người phụ trách cập nhật tiến độ.');
          if (t.status !== 'chua' && t.status !== 'dang') err('Công việc không ở trạng thái đang làm.');
          t.progress = Math.max(0, Math.min(100, Math.round(Number(d.progress) || 0)));
          if (t.progress > 0) t.status = 'dang';
          log(t.id, me.id, 'progress', 'Tiến độ ' + t.progress + '%' + (d.note ? ': ' + d.note : ''));
          break;
        case 'start':
          if (!canWork(me, t) || t.status !== 'chua') err('Không thể bắt đầu công việc này.');
          t.status = 'dang';
          log(t.id, me.id, 'status', 'Bắt đầu thực hiện');
          break;
        case 'submit':
          if (!canWork(me, t) || (t.status !== 'chua' && t.status !== 'dang')) err('Không thể báo hoàn thành.');
          t.progress = 100; t.submittedAt = today;
          var approvers = approversOf(t).filter(function (id) { return id !== me.id; });
          if (!approvers.length || isLead(me)) {
            t.status = 'xong'; t.doneDate = today; t.approvedBy = me.id; t.score = defaultScore(t, st);
            log(t.id, me.id, 'status', 'Hoàn thành' + (d.note ? ': ' + d.note : ''));
          } else {
            t.status = 'cho_duyet';
            log(t.id, me.id, 'status', 'Báo hoàn thành, chờ duyệt' + (d.note ? ': ' + d.note : ''));
            notify(approvers, who + ' báo hoàn thành: ' + t.title, t.id, me.id);
          }
          break;
        case 'approve':
          if (!canApprove(me, t) || t.status !== 'cho_duyet') err('Không có quyền duyệt việc này.');
          t.status = 'xong'; t.doneDate = t.submittedAt || today; t.approvedBy = me.id;
          t.score = d.score != null && d.score !== '' ? Math.max(0, Math.min(100, Number(d.score))) : defaultScore(t, st);
          log(t.id, me.id, 'status', 'Duyệt hoàn thành, điểm ' + t.score + (d.note ? ': ' + d.note : ''));
          notify(involved(t), who + ' đã duyệt hoàn thành: ' + t.title + ' (' + t.score + ' điểm)', t.id, me.id);
          break;
        case 'return':
          if (!canApprove(me, t) || t.status !== 'cho_duyet') err('Không có quyền trả lại việc này.');
          t.status = 'dang'; t.progress = Math.min(t.progress || 0, 90); t.submittedAt = '';
          log(t.id, me.id, 'status', 'Trả lại để hoàn thiện' + (d.note ? ': ' + d.note : ''));
          notify([t.assigneeId], who + ' trả lại: ' + t.title + (d.note ? ' – ' + d.note : ''), t.id, me.id);
          break;
        case 'reopen':
          if (!canApprove(me, t) || t.status !== 'xong') err('Không thể mở lại.');
          t.status = 'dang'; t.doneDate = ''; t.submittedAt = ''; t.score = null; t.progress = 90;
          log(t.id, me.id, 'status', 'Mở lại công việc' + (d.note ? ': ' + d.note : ''));
          notify([t.assigneeId], who + ' mở lại: ' + t.title, t.id, me.id);
          break;
        case 'accept':
          if (t.status !== 'de_xuat') err('Việc không ở trạng thái đề xuất.');
          var asg = userById(d.assigneeId || t.assigneeId);
          if (!canAssignTo(me, asg)) err('Không có quyền giao việc này.');
          t.assigneeId = asg.id; t.status = 'chua';
          if (d.dueDate) t.dueDate = d.dueDate;
          log(t.id, me.id, 'status', 'Duyệt đề xuất, giao cho ' + asg.name);
          notify([t.creatorId, t.assigneeId].concat(t.collaborators || []), who + ' duyệt đề xuất: ' + t.title, t.id, me.id);
          break;
        case 'cancel':
          if (!canManage(me, t) && !(t.status === 'de_xuat' && canApprove(me, t))) err('Không có quyền hủy việc này.');
          t.status = 'huy';
          log(t.id, me.id, 'status', (d.note ? 'Hủy: ' + d.note : 'Hủy công việc'));
          notify(involved(t), who + ' đã hủy: ' + t.title, t.id, me.id);
          break;
        case 'restore':
          if (!canManage(me, t) || t.status !== 'huy') err('Không thể khôi phục.');
          t.status = t.progress > 0 ? 'dang' : 'chua';
          log(t.id, me.id, 'status', 'Khôi phục công việc');
          break;
        default: err('Thao tác không hợp lệ.');
      }
      t.updatedAt = now;
      store.put('Tasks', t);
      return { task: t };
    };

    A.addComment = function (d, me) {
      var t = task(d.taskId), text = String(d.text || '').trim();
      if (!text) err('Chưa nhập nội dung.');
      log(t.id, me.id, 'comment', text.slice(0, 2000));
      notify(involved(t).concat(approversOf(t)), me.name + ' trao đổi ở "' + t.title + '": ' + text.slice(0, 80), t.id, me.id);
      return A.taskDetail({ id: t.id });
    };

    A.addEvidence = function (d, me) {
      var t = task(d.taskId);
      if (!canWork(me, t) && (t.collaborators || []).indexOf(me.id) < 0) err('Không có quyền thêm minh chứng.');
      var url = String(d.url || '').trim(), name = String(d.name || '').trim();
      if (d.base64) {
        if (!env.saveFile) err('Bản dùng thử chưa tải tệp lên được; hãy dán đường dẫn.');
        url = env.saveFile(name || 'minh-chung', d.mime || 'application/octet-stream', d.base64, t.code);
      }
      if (!/^https?:\/\//i.test(url)) err('Đường dẫn minh chứng phải bắt đầu bằng http:// hoặc https://');
      t.evidence = (t.evidence || []).concat([{ id: env.uuid(), name: name || url, url: url, by: me.id, at: env.nowIso() }]);
      t.updatedAt = env.nowIso();
      store.put('Tasks', t);
      log(t.id, me.id, 'evidence', 'Thêm minh chứng: ' + (name || url));
      return { task: t };
    };

    A.removeEvidence = function (d, me) {
      var t = task(d.taskId);
      var ev = (t.evidence || []).filter(function (e) { return e.id === d.id; })[0];
      if (!ev) err('Không tìm thấy minh chứng.');
      if (ev.by !== me.id && !canManage(me, t)) err('Không có quyền gỡ minh chứng này.');
      t.evidence = t.evidence.filter(function (e) { return e.id !== d.id; });
      store.put('Tasks', t);
      log(t.id, me.id, 'evidence', 'Gỡ minh chứng: ' + ev.name);
      return { task: t };
    };

    A.saveNote = function (d, me) {
      var n = d.note || {};
      if (!String(n.title || '').trim() || !n.date) err('Nhập tiêu đề và ngày.');
      var cur = n.id ? store.all('Notes').filter(function (x) { return x.id === n.id && x.userId === me.id; })[0] : null;
      var o = cur || { id: env.uuid(), userId: me.id, createdAt: env.nowIso() };
      o.kind = n.kind || 'nhac_viec'; o.title = String(n.title).trim(); o.date = n.date;
      o.lunar = !!n.lunar; o.yearly = !!n.yearly; o.remindDays = n.remindDays == null ? 7 : Number(n.remindDays);
      store.put('Notes', o);
      return { note: o };
    };
    A.deleteNote = function (d, me) {
      var n = store.all('Notes').filter(function (x) { return x.id === d.id && x.userId === me.id; })[0];
      if (!n) err('Không tìm thấy ghi chú.');
      store.del('Notes', n.id);
      return {};
    };

    A.savePlan = function (d, me) {
      if (!isLead(me) && !isTeamLead(me)) err('Chỉ lãnh đạo Phòng, tổ trưởng lập kế hoạch.');
      var p = d.plan || {};
      var cur = p.id ? store.all('Plans').filter(function (x) { return x.id === p.id; })[0] : null;
      if (cur && cur.kind === 'nam' && !isLead(me)) err('Chỉ lãnh đạo Phòng sửa kế hoạch năm học.');
      if (!cur && p.kind === 'nam' && !isLead(me)) err('Chỉ lãnh đạo Phòng lập kế hoạch năm học.');
      var o = cur || { id: env.uuid(), kind: p.kind, year: p.year, month: p.month || '', createdBy: me.id };
      if (p.status === 'ban_hanh' && !isLead(me)) err('Chỉ lãnh đạo Phòng ban hành kế hoạch.');
      o.status = p.status || o.status || 'du_thao';
      o.goal = p.goal != null ? p.goal : (o.goal || '');
      o.items = (p.items || o.items || []).map(function (it) { if (!it.id) it.id = env.uuid().slice(0, 8); return it; });
      o.updatedAt = env.nowIso();
      store.put('Plans', o);
      return { plan: o };
    };

    A.saveUser = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng quản lý nhân sự.');
      var x = d.user || {};
      var uname = normEmail(x.username);
      if (!String(x.name || '').trim()) err('Chưa nhập họ và tên.');
      if (!validEmail(uname)) err('Email đăng nhập phải là email của Trường, dạng ten@uneti.edu.vn.');
      var dup = users().filter(function (u) { return String(u.username).toLowerCase() === uname && u.id !== x.id; })[0];
      if (dup) err('Email này đã có tài khoản.');
      var u = x.id ? userById(x.id) : null, temp = null;
      if (!u) {
        temp = String(settings().matKhauMacDinh || '1111');
        var salt = env.uuid();
        u = { id: env.uuid(), salt: salt, passHash: hashPass(temp, salt), mustChange: true, createdAt: env.nowIso() };
      }
      if (u.id === me.id && x.role && x.role !== 'lanh_dao') err('Không tự hạ quyền của chính mình.');
      u.username = uname; u.name = String(x.name).trim(); u.role = x.role || 'chuyen_vien'; u.team = x.team || '';
      u.title = x.title || ''; u.phone = x.phone || ''; u.email = uname;
      if (x.birthday != null) u.birthday = x.birthday;
      u.active = x.active !== false; u.sort = x.sort == null ? 99 : Number(x.sort);
      u.badge = String(x.badge || '').trim().slice(0, 12);
      store.put('Users', u);
      return { user: pubUser(u, me), tempPassword: temp };
    };
    A.resetPassword = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng đặt lại mật khẩu.');
      var u = userById(d.id); if (!u) err('Không tìm thấy cán bộ.');
      var temp = String(settings().matKhauMacDinh || '1111');
      u.salt = env.uuid(); u.passHash = hashPass(temp, u.salt); u.mustChange = true;
      store.put('Users', u);
      return { tempPassword: temp };
    };
    A.changePassword = function (d, me) {
      var u = userById(me.id);
      if (hashPass(String(d.old || ''), u.salt) !== u.passHash) err('Mật khẩu hiện tại không đúng.');
      var nw = String(d.password || '');
      if (nw.length < 6) err('Mật khẩu mới cần ít nhất 6 ký tự.');
      if (nw === String(settings().matKhauMacDinh || '1111')) err('Mật khẩu mới phải khác mật khẩu ban đầu.');
      u.salt = env.uuid(); u.passHash = hashPass(nw, u.salt); u.mustChange = false;
      store.put('Users', u);
      return { token: makeToken(u) };
    };
    A.updateProfile = function (d, me) {
      var u = userById(me.id);
      if (d.birthday != null) u.birthday = d.birthday;
      if (d.phone != null) u.phone = d.phone;
      if (d.email != null) u.email = d.email;
      store.put('Users', u);
      return { user: pubUser(u, u) };
    };
    A.readNotifs = function (d, me) {
      store.all('Notifs').forEach(function (n) {
        if (n.userId === me.id && !n.read && (!d.ids || d.ids.indexOf(n.id) >= 0)) { n.read = true; store.put('Notifs', n); }
      });
      return {};
    };
    A.saveSettings = function (d, me) {
      if (!isLead(me)) err('Chỉ lãnh đạo Phòng đổi cài đặt.');
      var s = d.settings || {};
      if (s.logo != null) {
        var lg = String(s.logo);
        if (lg && !/^data:image\/(png|webp|jpeg);base64,/.test(lg)) err('Logo phải là ảnh PNG, JPG hoặc WEBP.');
        if (lg.length > 45000) err('Ảnh logo quá lớn, hãy chọn ảnh khác.');
        setSetting('logo', lg);
      }
      ['tenPhong', 'categories', 'truMoiNgayTre', 'truToiDa', 'truQuaHan', 'matKhauMacDinh'].forEach(function (k) {
        if (s[k] != null) setSetting(k, s[k]);
      });
      return { settings: settings() };
    };

    A.registerDevice = function (d, me) {
      var tok = String(d.token || '').trim();
      if (tok.length < 20) err('Mã thiết bị không hợp lệ.');
      var id = sha256(tok).slice(0, 32);
      store.put('Devices', { id: id, userId: me.id, token: tok, ua: String(d.ua || '').slice(0, 120), at: env.nowIso() });
      return { ok: 1 };
    };
    A.unregisterDevice = function (d, me) {
      var id = sha256(String(d.token || '').trim()).slice(0, 32);
      var dv = store.all('Devices').filter(function (x) { return x.id === id && x.userId === me.id; })[0];
      if (dv) store.del('Devices', dv.id);
      return { ok: 1 };
    };
    A.testPush = function (d, me) {
      if (!env.push) err('Máy chủ chưa cấu hình Firebase.');
      var devs = store.all('Devices').filter(function (x) { return x.userId === me.id; });
      if (!devs.length) err('Thiết bị này chưa đăng ký nhận thông báo. Hãy bật Thông báo trên thiết bị trước.');
      pushQueue.push({ userId: me.id, text: 'Thông báo thử: thiết bị đã nhận được thông báo từ máy chủ.', taskId: '' });
      return { devices: devs.length };
    };

    var PUBLIC = { login: 1, register: 1 };
    function handle(req) {
      try {
        var fn = A[req && req.action];
        if (!fn) err('Thao tác không hợp lệ.');
        var me = PUBLIC[req.action] ? null : auth(req.token);
        pushQueue = [];
        var out = fn(req.data || {}, me);
        try { var sent = flushPush(); if (req.action === 'testPush') out.sent = sent; }
        catch (pe) { if (req.action === 'testPush') err('Gửi qua Firebase lỗi: ' + (pe && pe.message || pe)); }
        if (store.flush) store.flush();
        return { ok: true, data: out };
      } catch (e) {
        if (e && e.message === 'AUTH') return { ok: false, auth: true, error: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại.' };
        return { ok: false, error: e && e.userError ? e.message : 'Lỗi máy chủ: ' + (e && e.message || e) };
      }
    }

    /* Khởi tạo dữ liệu ban đầu: tài khoản lãnh đạo Phòng + kế hoạch năm học có 09 nhiệm vụ trọng tâm */
    function seed(opts) {
      opts = opts || {};
      secret();
      var created = null;
      if (!users().length) {
        var salt = env.uuid();
        var pass = opts.password || '1111';
        var mail = normEmail(opts.username || 'truongphong');
        store.put('Users', {
          id: env.uuid(), username: mail, salt: salt, passHash: hashPass(pass, salt),
          name: opts.name || 'Trưởng phòng Đào tạo', role: 'lanh_dao', team: '', title: 'Trưởng phòng',
          birthday: '', phone: '', email: mail, active: true, mustChange: true, sort: 1, createdAt: env.nowIso()
        });
        created = { username: mail, password: pass };
      }
      if (!store.all('Plans').length) {
        store.put('Plans', {
          id: env.uuid(), kind: 'nam', year: '2026-2027', month: '', status: 'du_thao', createdBy: '',
          goal: 'Đổi mới toàn diện, chuyển đổi số để đáp ứng nhu cầu xã hội; trọng tâm công tác đào tạo là chuẩn hóa và số hóa.',
          items: NHIEM_VU_2026.map(function (x) { return clone(x); }), updatedAt: env.nowIso()
        });
      }
      return created;
    }

    return { handle: handle, seed: seed, actions: A };
  }

  var NHIEM_VU_2026 = [
    { id: 'nv111', code: '1.1.1', team: 'to1', deadline: '2027-02-28', title: 'Mở các CTĐT lĩnh vực kỹ thuật; chuẩn bị điều kiện mở CTĐT Ngôn ngữ Trung Quốc',
      milestones: '30/9 rà soát nhu cầu, điều kiện; 31/10 tổ xây dựng CTĐT; 30/11 Khoa dự thảo mục tiêu, CĐR, cấu trúc, ma trận; 31/12 lấy ý kiến chuyên gia, doanh nghiệp, người học; 31/01 rà soát năng lực theo TT 54, thẩm định; 28/02 hoàn thiện hồ sơ, trình' },
    { id: 'nv112', code: '1.1.2', team: 'to1', deadline: '2027-05-24', title: 'Phương án thí điểm 2–3 CTĐT giảng dạy một số học phần chuyên môn bằng tiếng Anh',
      milestones: '30/9 tiêu chí lựa chọn; 31/10 Khoa Ngoại ngữ khảo sát năng lực; 31/12 chọn CTĐT, học phần, giảng viên; 28/02 đề cương, học liệu song ngữ, rubric; 31/3 góp ý, tập huấn, kiểm tra điều kiện; 24/5 trình phê duyệt' },
    { id: 'nv113', code: '1.1.3', team: 'to2', deadline: '2027-05-24', title: 'Phát triển 1–3 CTĐT hợp tác chuyên sâu với doanh nghiệp',
      milestones: '30/9 chọn CTĐT; 31/10 mô hình hợp tác từng CTĐT; 31/12 Khoa xác định học phần, dự án, thực tập tại doanh nghiệp; 28/02 kế hoạch chi tiết; 31/3 thỏa thuận, kế hoạch lớp thí điểm; 24/5 trình phê duyệt' },
    { id: 'nv121', code: '1.2.1', team: '', deadline: '2027-03-31', title: 'Rà soát, chuẩn hóa quy trình nghiệp vụ đào tạo; lộ trình số hóa quy trình lõi',
      milestones: '30/9 danh mục quy trình; 31/10 phân loại, điểm nghẽn; 30/11 chuẩn hóa theo mẫu thống nhất; 31/01 lấy ý kiến, trình ban hành, chuyển yêu cầu số hóa cho Phòng CNTT; 31/3 ban hành bộ quy trình' },
    { id: 'nv122', code: '1.2.2', team: 'to2', deadline: '2027-05-24', title: 'Chuẩn hóa cơ chế quản lý, dữ liệu và minh chứng hợp tác doanh nghiệp trong đào tạo',
      milestones: '30/9 rà soát hiện trạng; 31/10 chuẩn hóa CSDL doanh nghiệp; 31/12 quy trình quản lý HTDN; 28/02 bộ biểu mẫu dùng chung; 31/3 thí điểm; 24/5 tổng kết, bảng chỉ số HTDN' },
    { id: 'nv123', code: '1.2.3', team: 'to1', deadline: '2027-03-31', title: 'Đổi mới triển khai CĐR tiếng Anh: phân tầng, cảnh báo sớm, hỗ trợ đúng nhóm sinh viên',
      milestones: '30/9 rà soát quy định, dữ liệu; 31/10 phân nhóm sinh viên; 31/12 lộ trình hỗ trợ, kế hoạch mở lớp, cơ chế cảnh báo; 28/02 thí điểm cảnh báo, tư vấn; 31/3 áp dụng toàn bộ' },
    { id: 'nv131', code: '1.3.1', team: 'to1', deadline: '2027-04-30', title: 'Thí điểm phần mềm/module quản lý, tổng hợp, khai thác dữ liệu CĐR CTĐT',
      milestones: '31/10 phương án thiết kế, rà soát các file Excel đang dùng; 31/12 chuẩn hóa cấu trúc dữ liệu, mẫu import; 28/02 Phòng CNTT cấu hình, thử nghiệm; 31/3 chạy thử, so với Excel thủ công; 30/4 hoàn thiện, hướng dẫn vận hành' },
    { id: 'nv132', code: '1.3.2', team: 'to1', deadline: '2027-02-28', title: 'Công cụ dữ liệu, cảnh báo CĐR tiếng Anh phục vụ cơ chế phân tầng',
      milestones: '30/9 cấu trúc dữ liệu; 31/10 chuẩn hóa, đối chiếu dữ liệu các đơn vị; 31/12 Phòng CNTT thiết kế dashboard cảnh báo; 31/01 chạy thử dữ liệu thật; 28/02 công bố hướng dẫn khai thác' },
    { id: 'nv133', code: '1.3.3', team: 'to1', deadline: '2027-05-31', title: 'Số hóa dữ liệu sổ gốc văn bằng, chứng chỉ; thí điểm cấp văn bằng số',
      milestones: '30/9 số hóa, đối soát dữ liệu đến năm 2026; 30/11 dữ liệu từ năm 2015 trở về trước; 30/4 thí điểm cấp văn bằng số cho một đợt; 31/5 đánh giá, trình triển khai chính thức' }
  ];

  return {
    VERSION: VERSION, SCHEMA: SCHEMA, ROLES: ROLES, TEAMS: TEAMS, STATUS: STATUS, PRIORITY: PRIORITY,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS, NHIEM_VU_2026: NHIEM_VU_2026,
    DOMAIN: DOMAIN, normEmail: normEmail, validEmail: validEmail,
    sha256: sha256, hashPass: hashPass, toRow: toRow, fromRow: fromRow, isoDate: isoDate, dayDiff: dayDiff,
    isLead: isLead, isTeamLead: isTeamLead, canAssignTo: canAssignTo, canManage: canManage, canApprove: canApprove,
    canWork: canWork, effStatus: effStatus, defaultScore: defaultScore, createCore: createCore
  };
})();
if (typeof module !== 'undefined') module.exports = PDT;
