'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const MAX_BYTES = 5 * 1024 * 1024;
  let reviewMap = null;
  let layer = null;

  const setStatus = text => { $('status').textContent = text; };
  const isNum = v => typeof v === 'number' && Number.isFinite(v);
  const fmtTime = sec => {
    const s = Math.floor(sec || 0);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(r).padStart(2, '0');
  };
  const pinIcon = (kind, label) => L.divIcon({
    className: 'map-pin-wrap map-pin-' + kind,
    html: '<span class="pin-body"><b>' + label + '</b></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  function validTrack(r) {
    return r && typeof r === 'object' && Array.isArray(r.points) && r.points.length > 0 && r.points.length <= 200000
      && isNum(r.seconds) && isNum(r.meters) && r.seconds >= 0 && r.meters >= 0
      && r.points.every(p => p && isNum(p.lat) && isNum(p.lng) && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180);
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\r' || c === '\n') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x !== ''));
  }

  function ensureMap() {
    if (reviewMap) return;
    reviewMap = L.map('reviewMap', { zoomControl: true });
    addBaseMap(reviewMap);
  }

  function showTrack(r) {
    ensureMap();
    if (layer) layer.remove();
    layer = L.layerGroup().addTo(reviewMap);
    const groups = new Map();
    for (const p of r.points) {
      const k = p.segment || 0;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push([p.lat, p.lng]);
    }
    for (const pts of groups.values()) {
      if (pts.length < 2) continue;
      L.polyline(pts, { color: '#fff', weight: 9, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }).addTo(layer);
      L.polyline(pts, { color: '#d95432', weight: 5, lineCap: 'round', lineJoin: 'round' }).addTo(layer);
    }
    const first = r.points[0], last = r.points[r.points.length - 1];
    const bounds = [[first.lat, first.lng]];
    L.marker([first.lat, first.lng], { icon: pinIcon('start', '起'), zIndexOffset: 500 }).bindTooltip('起點').addTo(layer);
    if (r.points.length > 1) {
      L.marker([last.lat, last.lng], { icon: pinIcon('end', '終'), zIndexOffset: 500 }).bindTooltip('終點').addTo(layer);
      bounds.push([last.lat, last.lng]);
    }
    const t = r.target;
    if (t && isNum(t.lat) && isNum(t.lng)) {
      L.marker([t.lat, t.lng], { icon: pinIcon('target', '集'), zIndexOffset: 600 }).bindTooltip('老師指定的集合點').addTo(layer);
      L.polyline([[last.lat, last.lng], [t.lat, t.lng]], { color: '#975325', dashArray: '6 8', weight: 2 }).addTo(layer);
      bounds.push([t.lat, t.lng]);
    }
    $('detail').hidden = false;
    $('list').hidden = true;
    reviewMap.invalidateSize();
    reviewMap.fitBounds(bounds, { padding: [36, 36], maxZoom: 18 });
  }

  function addFact(dl, label, value) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    dl.append(dt, dd);
  }

  function showFacts(r) {
    const km = r.meters / 1000, sec = r.seconds;
    const speed = sec > 0 ? km / (sec / 3600) : 0;
    const computedKcal = isNum(r.met) && isNum(r.weight) ? MoveCore.calories(r.met, r.weight, sec) : 0;
    const kcal = isNum(r.kcal) ? r.kcal : computedKcal;
    $('statDistance').textContent = km.toFixed(2);
    $('statTime').textContent = fmtTime(sec);
    $('statSpeed').textContent = speed.toFixed(1);
    $('statKcal').textContent = String(Math.round(kcal));

    const dl = $('facts');
    dl.replaceChildren();
    const pts = r.points;
    const first = pts[0], last = pts[pts.length - 1];
    const segments = new Set(pts.map(p => p.segment || 0)).size;
    const date = r.date ? new Date(r.date) : null;
    addFact(dl, '日期時間', date && !isNaN(date) ? date.toLocaleString('zh-TW') : '未記錄');
    addFact(dl, '紀錄類型', r.demo ? '示範（模擬座標與時間，不代表真實運動）' : 'GPS 真實紀錄');
    addFact(dl, '課堂代號', r.alias || '未填寫');
    addFact(dl, '活動方式', r.mode || '未記錄');
    addFact(dl, '身高 ／ 體重 ／ 年齡', [r.height, r.weight, r.age].map((v, i) => v == null ? '—' : v + ['cm', 'kg', '歲'][i]).join(' ／ '));
    addFact(dl, '活動強度 MET', isNum(r.met) ? String(r.met) : '未記錄');
    addFact(dl, '有效定位點', pts.length + ' 個，分為 ' + segments + ' 段（暫停或斷訊後會另起一段）');
    addFact(dl, '起點座標', first.lat.toFixed(5) + ', ' + first.lng.toFixed(5));
    addFact(dl, '終點座標', last.lat.toFixed(5) + ', ' + last.lng.toFixed(5));
    const t = r.target;
    addFact(dl, '集合點距離', t && isNum(t.lat) && isNum(t.lng)
      ? '終點到集合點直線約 ' + Math.round(MoveCore.distance(last, t)) + ' 公尺'
      : '這次紀錄未設定集合點');
    addFact(dl, '平均速度', speed.toFixed(2) + ' km/h（距離 ÷ 運動時間）');
    addFact(dl, '熱量算式', (isNum(r.met) && isNum(r.weight))
      ? r.met + ' × 3.5 × ' + r.weight + ' ÷ 200 × ' + (sec / 60).toFixed(1) + ' 分鐘 ＝ ' + kcal.toFixed(1) + ' kcal（估算值，非 GPS 測量）'
      : '未記錄');
  }

  function showList(rows, name) {
    const head = rows[0], body = rows.slice(1);
    const distIdx = head.indexOf('距離 m');
    const kcalIdx = head.indexOf('總熱量 kcal');
    let meters = 0, kcal = 0;
    for (const r of body) {
      meters += Number(r[distIdx]) || 0;
      kcal += Number(r[kcalIdx]) || 0;
    }
    $('listSummary').textContent = name + '：共 ' + body.length + ' 筆，合計距離 ' + (meters / 1000).toFixed(2) + ' km，合計估算熱量 ' + Math.round(kcal) + ' kcal。CSV 只含摘要，沒有路線；要看路線請匯入軌跡 JSON。';
    const thead = $('listHead'), tbody = $('listBody');
    thead.replaceChildren();
    tbody.replaceChildren();
    const htr = document.createElement('tr');
    for (const h of head) { const th = document.createElement('th'); th.textContent = h; htr.append(th); }
    thead.append(htr);
    for (const r of body) {
      const tr = document.createElement('tr');
      for (const v of r) { const td = document.createElement('td'); td.textContent = v; tr.append(td); }
      tbody.append(tr);
    }
    $('list').hidden = false;
    $('detail').hidden = true;
  }

  async function handleFiles(files) {
    const list = [...files];
    if (!list.length) return;
    const f = list[0];
    if (f.size > MAX_BYTES) { setStatus(f.name + ' 超過 5 MB，無法開啟。'); return; }
    const text = (await f.text()).replace(/^﻿/, '');
    if (/\.json$/i.test(f.name) || f.type === 'application/json') {
      let r;
      try { r = JSON.parse(text); } catch { setStatus(f.name + ' 不是有效的 JSON 檔。'); return; }
      if (!validTrack(r)) { setStatus(f.name + ' 不是 PACE 的軌跡 JSON。請用「運動紀錄」的「軌跡」按鈕下載。'); return; }
      showTrack(r);
      showFacts(r);
      $('detail').hidden = false;
      setStatus('已開啟：' + f.name + (list.length > 1 ? '（一次只開啟第一份檔案）' : ''));
      return;
    }
    const rows = parseCSV(text);
    if (!rows.length || rows[0][0] !== '時間 ISO') { setStatus(f.name + ' 不是 PACE 的摘要 CSV。'); return; }
    showList(rows, f.name);
    setStatus('已開啟：' + f.name);
  }

  $('file').addEventListener('change', e => handleFiles(e.target.files));
  const drop = $('drop');
  ['dragenter', 'dragover'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  document.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
})();
