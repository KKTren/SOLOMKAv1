import React, { useState, useRef, useEffect, useMemo, useCallback, createContext, useContext } from "react";

/* ============================ КОНСТАНТЫ ============================ */

const BALE_L = 2.0;
const BALE_T = 0.8;

const C = {
  chrome: "#D6D2C4", chromeHi: "#FFFFFF", chromeLo: "#84806F", chromeDk: "#B3AE9C",
  ink: "#1A1A18", gridMinor: "#D8E6F0", gridMajor: "#A9C3D6",
  hayFill: "#EEDFAB", hayLine: "#C2A85F", hayEdge: "#2E2612",
  wood: "#C99A5B", woodLine: "#8A6231", rubber: "#3A3A3C", steel: "#5B5B60",
  teamA: "#2D5AA8", teamB: "#B03434", sel: "#1E6FD9",
};

const ZONE_KINDS = {
  safe:   { label: "Safety / Respawn", fill: "#E2E9D9", stroke: "#A9BE96", under: true },
  spawnA: { label: "Спавн A",          fill: "#BBC9E4", stroke: "#7F97C4" },
  spawnB: { label: "Спавн B",          fill: "#F1DDC5", stroke: "#CFAE85" },
  bomb:   { label: "Точка бомбы",      fill: "#F0DCC8", stroke: "#C9A27A" },
  red:    { label: "Ред-зона",         fill: "#F2BAB9", stroke: "#CE8B8A" },
  obj:    { label: "Точка задачи",     fill: "#D9E8CF", stroke: "#9CBF87" },
  dead:   { label: "Мёртвая зона",     fill: "#DCDCDC", stroke: "#A0A0A0" },
  custom: { label: "Своя зона",        fill: "#E6DCF0", stroke: "#B09FC8" },
};

const SEED_WALLS = [
  {d:"H",x:0.5,y:0.5,l:16.5},{d:"H",x:4.5,y:3,l:3},{d:"H",x:25,y:5.5,l:12.5},
  {d:"H",x:0.5,y:6,l:3},{d:"H",x:6.5,y:6,l:6.5},{d:"H",x:29,y:6,l:2.5},
  {d:"H",x:16,y:6.5,l:3.5},{d:"H",x:22.5,y:6.5,l:2.5},{d:"H",x:4.5,y:9,l:2.5},
  {d:"H",x:33.5,y:9,l:6},{d:"H",x:5.5,y:12.5,l:11.5},{d:"H",x:33.5,y:16.5,l:6},
  {d:"H",x:16.5,y:17,l:3},{d:"H",x:26,y:17,l:2.5},{d:"H",x:42.5,y:17.5,l:6},
  {d:"H",x:33.5,y:20.5,l:6},{d:"H",x:10,y:21.5,l:3.5},{d:"H",x:14.5,y:22.5,l:3},
  {d:"H",x:33.5,y:23,l:2.5},{d:"H",x:5.5,y:25,l:3},{d:"H",x:39.5,y:25,l:8.5},
  {d:"H",x:18,y:26,l:2.5},{d:"H",x:37,y:29,l:12.5},{d:"H",x:0.5,y:33,l:8},
  {d:"H",x:13,y:33,l:16},{d:"H",x:37.5,y:35,l:8.5},{d:"H",x:0.5,y:39,l:5.5},
  {d:"H",x:32,y:39,l:18},{d:"H",x:40,y:0,l:9.5},{d:"H",x:43,y:5.5,l:6},
  {d:"H",x:46,y:9,l:3.5},{d:"H",x:39.5,y:12.5,l:6.5},{d:"H",x:37.5,y:5.5,l:2.5},
  {d:"V",x:0.5,y:0.5,l:16},{d:"V",x:0.5,y:25,l:2},{d:"V",x:3,y:19.5,l:2},
  {d:"V",x:4,y:19.5,l:2},{d:"V",x:5.5,y:12.5,l:13.5},{d:"V",x:7,y:0.5,l:9},
  {d:"V",x:7,y:11,l:2.5},{d:"V",x:8,y:33,l:5},{d:"V",x:9.5,y:15,l:12},
  {d:"V",x:13,y:33,l:5},{d:"V",x:16,y:0.5,l:7},{d:"V",x:16.5,y:12.5,l:11},
  {d:"V",x:26,y:13.5,l:4.5},{d:"V",x:29,y:25,l:2},{d:"V",x:29,y:33,l:5},
  {d:"V",x:30.5,y:25,l:2},{d:"V",x:33.5,y:20,l:3.5},{d:"V",x:33.5,y:29.5,l:3},
  {d:"V",x:34,y:9,l:2},{d:"V",x:37.5,y:31.5,l:4.5},{d:"V",x:38,y:9,l:8.5},
  {d:"V",x:39,y:20.5,l:6.5},{d:"V",x:39,y:33.5,l:2.5},{d:"V",x:40,y:3,l:3.5},
  {d:"V",x:42.5,y:16.5,l:5.5},{d:"V",x:47.5,y:7,l:5},{d:"V",x:48,y:13.5,l:12},
  {d:"V",x:49,y:19,l:2.5},{d:"V",x:49,y:27,l:11.5},{d:"V",x:43,y:0,l:7},
  {d:"V",x:49,y:0,l:7.5},{d:"V",x:39.5,y:2.5,l:4.5},{d:"V",x:49,y:9,l:4.5},
];

const SEED_PROPS = [
  ["crate",10.5,8.2],["crate",12.0,8.8],["tire",11.4,9.8],["tire",15.4,18.2],
  ["column",17.4,10.0],["column",24.6,10.0],["column",13.0,9.2],["barrel",16.8,22.2],
  ["barrel",30.4,25.4],["tire",36.4,14.4],["barrel",9.6,26.6],["crate",11.1,28.9],
  ["stack",26.5,24.3],["stack",1.2,29.2],["stack",24.0,14.0],["column",0.5,16.7],
  ["column",31.6,24.8],["column",39.8,25.9],["column",20.5,26.8],["column",27.7,34.8],
  ["column",4.2,19.7],
];

const SEED_ZONES = [
  {id:"z_safeL", k:"safe",   n:"Safety / Respawn", x:-4.5, y:0,    w:4.5,  h:40},
  {id:"z_safeR", k:"safe",   n:"Safety / Respawn", x:50,   y:0,    w:4.5,  h:40},
  {id:"z_red",   k:"red",    n:"RED",              x:24,   y:0,    w:16,   h:4.7},
  {id:"z_start", k:"spawnA", n:"START",            x:14.5, y:33.8, w:14.5, h:6.2},
  {id:"z_bomb",  k:"bomb",   n:"BOMB",             x:32.5, y:29.8, w:14.5, h:6},
  {id:"z_spawnB",k:"spawnB", n:"SPAWN B",          x:39.4, y:13.2, w:9.4,  h:12.4},
];

const SEED_FIGS = [
  ["A",20,37],["A",22.5,36.2],["A",3.5,1.8],["B",43,31.5],["B",41,20],["B",17.5,23.5],
];

const ASSETS = {
  wallH:  { name: "Стена (гор.)",  cat: "wall" },
  wallV:  { name: "Стена (верт.)", cat: "wall" },
  column: { name: "Колонна",       cat: "prop", w: 0.8, h: 0.8 },
  stack:  { name: "Штабель",       cat: "prop", w: 2.0, h: 1.6 },
  crate:  { name: "Поддон",        cat: "prop", w: 1.2, h: 0.8 },
  tire:   { name: "Покрышка",      cat: "prop", w: 0.7, h: 0.7 },
  barrel: { name: "Бочка",         cat: "prop", w: 0.6, h: 0.6 },
  figA:   { name: "Игрок A",       cat: "fig" },
  figB:   { name: "Игрок B",       cat: "fig" },
  bomb:   { name: "Точка бомбы",   cat: "mark", w: 1.6, h: 1.6 },
  skull:  { name: "Мёртвая зона",  cat: "mark", w: 1.6, h: 1.6 },
};

/* ============================ УТИЛИТЫ ============================ */

/* Компактный (телефонный) режим. Включается на узком или низком экране:
   панели уезжают в выдвижной лист, кнопки и поля становятся крупнее. */
const CompactCtx = createContext(false);
const useCompact = () => useContext(CompactCtx);
const detectCompact = () => (typeof window === "undefined" ? false : window.innerWidth < 900 || window.innerHeight < 520);
const detectCoarse = () => {
  try { return window.matchMedia("(pointer: coarse)").matches; } catch (e) { return false; }
};

let _uid = 0;
const uid = (p) => `${p}_${Date.now().toString(36)}_${(_uid++).toString(36)}`;
const snapTo = (v, s) => Math.round(v / s) * s;
const r1 = (v) => Math.round(v * 10) / 10;
const baleCount = (len, tiers) => Math.ceil(Math.max(len, 0.01) / BALE_L) * (tiers || 1);

function buildSeed() {
  const objects = {};
  SEED_WALLS.forEach((w) => {
    const id = uid("w");
    objects[id] = { id, t: w.d === "H" ? "wallH" : "wallV", x: w.x, y: w.y, l: w.l, tiers: 2 };
  });
  SEED_PROPS.forEach(([t, x, y]) => {
    const id = uid("p");
    objects[id] = { id, t, x, y, tiers: t === "stack" ? 2 : 1 };
  });
  SEED_FIGS.forEach(([team, x, y]) => {
    const id = uid("f");
    objects[id] = { id, t: team === "A" ? "figA" : "figB", x, y };
  });
  let id = uid("m"); objects[id] = { id, t: "bomb", x: 44.6, y: 30.6 };
  id = uid("m"); objects[id] = { id, t: "skull", x: 2.6, y: 35.6 };
  const zones = {};
  SEED_ZONES.forEach((z) => { zones[z.id] = { ...z, score: 0 }; });
  return { objects, zones };
}


/* ====== ХРАНИЛИЩЕ И ССЫЛКИ ======
   Библиотека карт живёт в localStorage браузера (у каждого своя).
   Обмен между людьми — через ссылку: карта пакуется в адрес страницы. */

const LS_PREFIX = "cqb_selo_map:";

function lsAvailable() {
  try { const k = "__t"; window.localStorage.setItem(k, "1"); window.localStorage.removeItem(k); return true; }
  catch (e) { return false; }
}

function listLibrary() {
  if (!lsAvailable()) return [];
  const out = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || k.indexOf(LS_PREFIX) !== 0) continue;
    try {
      const raw = window.localStorage.getItem(k);
      const d = JSON.parse(raw);
      out.push({ key: k, name: d.name || k.slice(LS_PREFIX.length), at: d.at || 0, size: raw.length });
    } catch (e) { /* битая запись — пропускаем */ }
  }
  return out.sort((a, b) => b.at - a.at);
}

function bytesToB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64ToBytes(str) {
  const b = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b + "===".slice((b.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function packMap(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  if (typeof window.CompressionStream === "function") {
    const cs = new window.CompressionStream("gzip");
    const w = cs.writable.getWriter(); w.write(bytes); w.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    return "g" + bytesToB64(new Uint8Array(buf));
  }
  return "p" + bytesToB64(bytes);
}

async function unpackMap(code) {
  const kind = code[0], body = code.slice(1);
  const bytes = b64ToBytes(body);
  if (kind === "g") {
    if (typeof window.DecompressionStream !== "function") throw new Error("Браузер не умеет распаковывать такие ссылки");
    const ds = new window.DecompressionStream("gzip");
    const w = ds.writable.getWriter(); w.write(bytes); w.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return JSON.parse(new TextDecoder().decode(buf));
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}


/* Список карт из папки maps репозитория.
   Сначала пробуем перечислить папку через GitHub API (тогда достаточно
   просто положить туда файл), при неудаче читаем maps/index.json. */
async function fetchSharedMaps() {
  const out = [];
  try {
    const m = String(window.location.hostname).match(/^([\w-]+)\.github\.io$/);
    if (m) {
      const seg = String(window.location.pathname).split("/").filter(Boolean);
      const repo = seg.length ? seg[0] : window.location.hostname;
      const r = await fetch(`https://api.github.com/repos/${m[1]}/${repo}/contents/maps`);
      if (r.ok) {
        const items = await r.json();
        if (Array.isArray(items)) {
          items.forEach((it) => {
            if (it.type === "file" && /\.json$/i.test(it.name) && it.name.toLowerCase() !== "index.json") {
              out.push({ name: it.name.replace(/\.json$/i, ""), url: it.download_url, size: it.size });
            }
          });
        }
      }
    }
  } catch (e) { /* нет сети или лимит API — идём к index.json */ }
  if (out.length) return out.sort((a, b) => a.name.localeCompare(b.name, "ru"));

  const r2 = await fetch("maps/index.json", { cache: "no-cache" });
  if (!r2.ok) throw new Error("папка maps не найдена");
  const list = await r2.json();
  (Array.isArray(list) ? list : list.maps || []).forEach((it) => {
    if (typeof it === "string") out.push({ name: it.replace(/\.json$/i, ""), url: "maps/" + it });
    else if (it && it.file) out.push({ name: it.name || it.file.replace(/\.json$/i, ""), url: "maps/" + it.file, author: it.author, note: it.note });
  });
  return out;
}

/* ============================ ЭЛЕМЕНТЫ ИНТЕРФЕЙСА ============================ */

function Bevel({ out = true, children, style = {}, ...rest }) {
  const lo = out ? C.chromeLo : C.chromeHi, hi = out ? C.chromeHi : C.chromeLo;
  return (
    <div style={{
      borderTop: `2px solid ${hi}`, borderLeft: `2px solid ${hi}`,
      borderBottom: `2px solid ${lo}`, borderRight: `2px solid ${lo}`,
      background: C.chrome, ...style,
    }} {...rest}>{children}</div>
  );
}

function ChromeButton({ active, children, onClick, title, style = {}, disabled }) {
  const [down, setDown] = useState(false);
  const compact = useCompact();
  const pressed = down || active;
  /* на телефоне: палец, а не курсор — кнопка не меньше 36 px и шрифт не мельче 13 px */
  const big = compact ? { minHeight: 36, minWidth: 36, fontSize: Math.max(13, style.fontSize || 14), touchAction: "manipulation" } : null;
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      onPointerDown={() => setDown(true)} onPointerUp={() => setDown(false)} onPointerLeave={() => setDown(false)}
      onMouseUp={(e) => e.currentTarget.blur()}
      style={{
        background: active ? "#C4BFAE" : C.chrome, color: disabled ? "#8C8878" : C.ink,
        font: "12px/1.1 Tahoma, Verdana, system-ui, sans-serif", padding: compact ? "6px 11px" : "4px 9px",
        cursor: disabled ? "default" : "pointer",
        borderTop: `2px solid ${pressed ? C.chromeLo : C.chromeHi}`,
        borderLeft: `2px solid ${pressed ? C.chromeLo : C.chromeHi}`,
        borderBottom: `2px solid ${pressed ? C.chromeHi : C.chromeLo}`,
        borderRight: `2px solid ${pressed ? C.chromeHi : C.chromeLo}`,
        ...style, ...big,
      }}>{children}</button>
  );
}

function PanelTitle({ children }) {
  return (
    <div style={{
      background: C.chromeDk, color: C.ink, textAlign: "center",
      font: "bold 11px/1 Tahoma, Verdana, sans-serif", letterSpacing: ".06em",
      padding: "4px 0", borderBottom: `1px solid ${C.chromeLo}`,
    }}>{children}</div>
  );
}

function Menu({ label, items, open, setOpen }) {
  const isOpen = open === label;
  return (
    <div style={{ position: "relative" }}>
      <button type="button"
        onClick={() => setOpen(isOpen ? null : label)}
        onMouseEnter={() => { if (open && !isOpen) setOpen(label); }}
        style={{
          font: "12px Tahoma, sans-serif", padding: "3px 9px", cursor: "pointer",
          background: isOpen ? "#2F5FA8" : "transparent", color: isOpen ? "#fff" : C.ink, border: "none",
        }}>{label}</button>
      {isOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 40, minWidth: 250,
          background: C.chrome, borderTop: `2px solid ${C.chromeHi}`, borderLeft: `2px solid ${C.chromeHi}`,
          borderBottom: `2px solid ${C.chromeLo}`, borderRight: `2px solid ${C.chromeLo}`,
          boxShadow: "3px 3px 0 rgba(0,0,0,.25)", padding: 2,
        }}>
          {items.map((it, i) => it === "-" ? (
            <div key={i} style={{ borderTop: `1px solid ${C.chromeLo}`, borderBottom: `1px solid ${C.chromeHi}`, margin: "3px 2px" }} />
          ) : (
            <button key={i} type="button" disabled={it.disabled}
              onClick={() => { setOpen(null); if (it.fn) it.fn(); }}
              style={{
                display: "flex", width: "100%", justifyContent: "space-between", gap: 20,
                font: "12px Tahoma, sans-serif", color: it.disabled ? "#8C8878" : C.ink,
                padding: "4px 10px", background: "transparent", border: "none",
                cursor: it.disabled ? "default" : "pointer", textAlign: "left",
              }}
              onMouseEnter={(e) => { if (!it.disabled) { e.currentTarget.style.background = "#2F5FA8"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = it.disabled ? "#8C8878" : C.ink; }}>
              <span>{it.on != null ? (it.on ? "✓ " : "\u00A0\u00A0") : ""}{it.label}</span>
              <span style={{ opacity: 0.6 }}>{it.key || ""}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose, width = 380 }) {
  const compact = useCompact();
  if (compact) {
    /* на телефоне окно не шире экрана, с крупным крестиком и отступами под вырез */
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "calc(8px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) calc(8px + env(safe-area-inset-left))",
      }}
        onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <Bevel style={{ width: "100%", maxWidth: width, maxHeight: "100%", display: "flex", flexDirection: "column", boxShadow: "4px 4px 0 rgba(0,0,0,.3)" }}>
          <div style={{ background: "#2F5FA8", color: "#fff", font: "bold 14px Tahoma, sans-serif", padding: "4px 4px 4px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span>{title}</span>
            <button type="button" onClick={onClose} aria-label="Закрыть" style={{ background: C.chrome, border: `1px solid ${C.chromeLo}`, cursor: "pointer", font: "14px Tahoma", width: 38, height: 32, padding: 0, touchAction: "manipulation" }}>✕</button>
          </div>
          <div style={{ padding: 12, overflowY: "auto", overscrollBehavior: "contain", minHeight: 0, fontSize: 14 }}>{children}</div>
        </Bevel>
      </div>
    );
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Bevel style={{ width, maxHeight: "90vh", overflowY: "auto", boxShadow: "4px 4px 0 rgba(0,0,0,.3)" }}>
        <div style={{ background: "#2F5FA8", color: "#fff", font: "bold 12px Tahoma, sans-serif", padding: "4px 8px", display: "flex", justifyContent: "space-between" }}>
          <span>{title}</span>
          <button type="button" onClick={onClose} style={{ background: C.chrome, border: `1px solid ${C.chromeLo}`, cursor: "pointer", font: "10px Tahoma", padding: "0 5px" }}>✕</button>
        </div>
        <div style={{ padding: 12 }}>{children}</div>
      </Bevel>
    </div>
  );
}

const ToolIcon = ({ kind, w = 30, h = 26 }) => {
  const s = { width: w, height: h };
  switch (kind) {
    case "select": return (<svg {...s} viewBox="0 0 24 24"><path d="M5 3l13 9-6 1 3 7-3 1-3-7-4 4z" fill="#111" /></svg>);
    case "wallH": return (<svg {...s} viewBox="0 0 32 24"><rect x="2" y="8" width="28" height="9" fill={C.hayFill} stroke={C.hayEdge} /><path d="M4 10.5h24M4 13h24M4 15h24" stroke={C.hayLine} /></svg>);
    case "wallV": return (<svg {...s} viewBox="0 0 24 32"><rect x="8" y="2" width="9" height="28" fill={C.hayFill} stroke={C.hayEdge} /><path d="M10.5 4v24M13 4v24M15 4v24" stroke={C.hayLine} /></svg>);
    case "place": return (<svg {...s} viewBox="0 0 24 24"><path d="M3 17l10-10 3 3L6 20H3z" fill={C.wood} stroke="#111" /><path d="M17 3v6M14 6h6" stroke="#1a7a1a" strokeWidth="2.5" /></svg>);
    case "pan": return (<svg {...s} viewBox="0 0 24 24"><path d="M6 12V6a1.6 1.6 0 013.2 0v5m0-1V4.6a1.6 1.6 0 013.2 0V11m0-.5V5.4a1.6 1.6 0 013.2 0V12m0-2.4a1.6 1.6 0 013.2 0V15a6 6 0 01-6 6h-2a6 6 0 01-6-6v-2" fill="#F0C9A0" stroke="#111" /></svg>);
    case "zone": return (<svg {...s} viewBox="0 0 24 24"><rect x="3" y="4" width="11" height="9" fill="#BBC9E4" stroke="#111" /><path d="M14 8h4v8a2 2 0 01-4 0z" fill="#888" stroke="#111" /></svg>);
    case "delete": return (<svg {...s} viewBox="0 0 24 24"><path d="M4 16l8-8 5 5-8 8H6z" fill="#E8A0A0" stroke="#111" /><path d="M11 20h9" stroke="#111" strokeWidth="2" /></svg>);
    default: return null;
  }
};

const AssetThumb = ({ t }) => {
  const box = { width: "100%", height: 44 };
  switch (t) {
    case "wallH": return (<svg style={box} viewBox="0 0 40 30"><rect x="3" y="10" width="34" height="11" fill={C.hayFill} stroke={C.hayEdge} /><path d="M5 13h30M5 15.5h30M5 18h30" stroke={C.hayLine} /></svg>);
    case "wallV": return (<svg style={box} viewBox="0 0 30 40"><rect x="10" y="3" width="11" height="34" fill={C.hayFill} stroke={C.hayEdge} /><path d="M13 5v30M15.5 5v30M18 5v30" stroke={C.hayLine} /></svg>);
    case "column": return (<svg style={box} viewBox="0 0 40 30"><rect x="13" y="9" width="14" height="13" fill={C.hayFill} stroke={C.hayEdge} /><path d="M15 12h10M15 15h10M15 18h10" stroke={C.hayLine} /></svg>);
    case "stack": return (<svg style={box} viewBox="0 0 40 30"><rect x="5" y="13" width="14" height="9" fill={C.hayFill} stroke={C.hayEdge} /><rect x="19" y="13" width="14" height="9" fill={C.hayFill} stroke={C.hayEdge} /><rect x="12" y="5" width="14" height="9" fill={C.hayFill} stroke={C.hayEdge} /></svg>);
    case "crate": return (<svg style={box} viewBox="0 0 40 30"><rect x="7" y="7" width="26" height="17" fill={C.wood} stroke="#5C3E1B" /><path d="M7 12h26M7 17h26M7 21h26" stroke={C.woodLine} /></svg>);
    case "tire": return (<svg style={box} viewBox="0 0 40 30"><circle cx="20" cy="15" r="11" fill={C.rubber} stroke="#111" /><circle cx="20" cy="15" r="4.5" fill="#6B6B70" /></svg>);
    case "barrel": return (<svg style={box} viewBox="0 0 40 30"><circle cx="20" cy="15" r="9" fill={C.steel} stroke="#111" /><circle cx="20" cy="15" r="5" fill="none" stroke="#8A8A90" /></svg>);
    case "figA": return (<svg style={box} viewBox="0 0 40 30"><circle cx="20" cy="11" r="4.5" fill={C.teamA} stroke="#111" /><path d="M20 15.5c-5 0-7.5 3.5-7.5 8h15c0-4.5-2.5-8-7.5-8z" fill={C.teamA} stroke="#111" /></svg>);
    case "figB": return (<svg style={box} viewBox="0 0 40 30"><circle cx="20" cy="11" r="4.5" fill={C.teamB} stroke="#111" /><path d="M20 15.5c-5 0-7.5 3.5-7.5 8h15c0-4.5-2.5-8-7.5-8z" fill={C.teamB} stroke="#111" /></svg>);
    case "bomb": return (<svg style={box} viewBox="0 0 40 30"><circle cx="19" cy="18" r="8.5" fill="#111" /><path d="M25 11l3-3M27 9l3 1-1-3" stroke="#D9A400" strokeWidth="1.6" fill="none" /></svg>);
    case "skull": return (<svg style={box} viewBox="0 0 40 30"><circle cx="20" cy="11" r="7" fill="#111" /><circle cx="17.4" cy="10.5" r="2" fill="#fff" /><circle cx="22.6" cy="10.5" r="2" fill="#fff" /><path d="M12 26l16-8M12 18l16 8" stroke="#111" strokeWidth="3.4" strokeLinecap="round" /></svg>);
    default: return null;
  }
};

/* ============================ ОТРИСОВКА ОБЪЕКТОВ ============================ */

function HayWall({ o, selected, ss = 1 }) {
  const horiz = o.t === "wallH";
  const n = Math.ceil(o.l / BALE_L);
  const bales = [];
  for (let i = 0; i < n; i++) {
    const seg = Math.min(BALE_L, o.l - i * BALE_L);
    if (seg <= 0.02) break;
    const bx = horiz ? o.x + i * BALE_L : o.x;
    const by = horiz ? o.y : o.y + i * BALE_L;
    const bw = horiz ? seg : BALE_T, bh = horiz ? BALE_T : seg;
    bales.push(
      <g key={i}>
        <rect x={bx} y={by} width={bw} height={bh} fill="url(#hay)" stroke={C.hayEdge} strokeWidth={0.075} />
        {o.tiers > 1 && <rect x={bx + 0.09} y={by + 0.09} width={Math.max(bw - 0.18, 0.02)} height={Math.max(bh - 0.18, 0.02)} fill="none" stroke={C.hayEdge} strokeWidth={0.035} opacity={0.55} />}
      </g>
    );
  }
  return (<g>{bales}
    {selected && <rect x={o.x - 0.15} y={o.y - 0.15} width={(horiz ? o.l : BALE_T) + 0.3} height={(horiz ? BALE_T : o.l) + 0.3} fill="none" stroke={C.sel} strokeWidth={0.16 * ss} strokeDasharray={`${0.5 * ss} ${0.3 * ss}`} />}
  </g>);
}

function Prop({ o, selected, ss = 1 }) {
  const a = ASSETS[o.t] || {};
  const w = a.w || 0.8, h = a.h || 0.8;
  let body = null;
  if (o.t === "column") {
    body = (<><rect x={o.x} y={o.y} width={w} height={h} fill="url(#hay)" stroke={C.hayEdge} strokeWidth={0.075} />
      <rect x={o.x + 0.1} y={o.y + 0.1} width={w - 0.2} height={h - 0.2} fill="none" stroke={C.hayEdge} strokeWidth={0.04} opacity={0.5} /></>);
  } else if (o.t === "stack") {
    body = (<><rect x={o.x} y={o.y} width={w} height={h / 2} fill="url(#hay)" stroke={C.hayEdge} strokeWidth={0.075} />
      <rect x={o.x} y={o.y + h / 2} width={w} height={h / 2} fill="url(#hay)" stroke={C.hayEdge} strokeWidth={0.075} />
      <line x1={o.x + w / 2} y1={o.y} x2={o.x + w / 2} y2={o.y + h} stroke={C.hayEdge} strokeWidth={0.05} opacity={0.6} /></>);
  } else if (o.t === "crate") {
    body = (<><rect x={o.x} y={o.y} width={w} height={h} fill={C.wood} stroke="#5C3E1B" strokeWidth={0.07} />
      {[0.2, 0.4, 0.6, 0.8].map((f) => <line key={f} x1={o.x} y1={o.y + h * f} x2={o.x + w} y2={o.y + h * f} stroke={C.woodLine} strokeWidth={0.045} />)}</>);
  } else if (o.t === "tire") {
    body = (<><circle cx={o.x + w / 2} cy={o.y + h / 2} r={w / 2} fill={C.rubber} stroke="#111" strokeWidth={0.05} />
      <circle cx={o.x + w / 2} cy={o.y + h / 2} r={w / 5} fill="#70707A" /></>);
  } else if (o.t === "barrel") {
    body = (<><circle cx={o.x + w / 2} cy={o.y + h / 2} r={w / 2} fill={C.steel} stroke="#111" strokeWidth={0.05} />
      <circle cx={o.x + w / 2} cy={o.y + h / 2} r={w / 3.2} fill="none" stroke="#93939A" strokeWidth={0.05} /></>);
  } else if (o.t === "bomb") {
    body = (<><rect x={o.x - 0.15} y={o.y - 0.15} width={w + 0.3} height={h + 0.3} fill="#fff" stroke="#111" strokeWidth={0.07} />
      <circle cx={o.x + w / 2 - 0.08} cy={o.y + h / 2 + 0.12} r={w / 2.9} fill="#111" />
      <path d={`M${o.x + w * 0.72} ${o.y + h * 0.3} L${o.x + w * 0.9} ${o.y + h * 0.12}`} stroke="#111" strokeWidth={0.09} fill="none" />
      <path d={`M${o.x + w * 0.86} ${o.y + h * 0.16} l0.22 0.06 l-0.06 -0.24 l0.2 0.1`} stroke="#D9A400" strokeWidth={0.1} fill="none" /></>);
  } else if (o.t === "skull") {
    const cx = o.x + w / 2, cy = o.y + h / 2;
    body = (<><path d={`M${cx - w * 0.45} ${cy + h * 0.42} L${cx + w * 0.45} ${cy - h * 0.05} M${cx - w * 0.45} ${cy - h * 0.05} L${cx + w * 0.45} ${cy + h * 0.42}`} stroke="#111" strokeWidth={0.24} strokeLinecap="round" />
      <circle cx={cx} cy={cy - h * 0.2} r={w * 0.36} fill="#111" />
      <circle cx={cx - w * 0.14} cy={cy - h * 0.22} r={w * 0.1} fill="#fff" />
      <circle cx={cx + w * 0.14} cy={cy - h * 0.22} r={w * 0.1} fill="#fff" /></>);
  }
  return (<g>{body}{selected && <rect x={o.x - 0.15} y={o.y - 0.15} width={w + 0.3} height={h + 0.3} fill="none" stroke={C.sel} strokeWidth={0.14 * ss} strokeDasharray={`${0.4 * ss} ${0.25 * ss}`} />}</g>);
}

function Figure({ o, selected, ss = 1 }) {
  const col = o.t === "figA" ? C.teamA : C.teamB;
  return (
    <g transform={`translate(${o.x},${o.y})`}>
      <ellipse cx={0} cy={0.1} rx={0.55} ry={0.4} fill="#000" opacity={0.12} />
      <path d="M0 -0.16 c-0.5 0 -0.72 0.42 -0.72 0.86 h1.44 c0 -0.44 -0.22 -0.86 -0.72 -0.86 z" fill={col} stroke="#111" strokeWidth={0.05} />
      <circle cx={0} cy={-0.34} r={0.29} fill={col} stroke="#111" strokeWidth={0.05} />
      {selected && <circle cx={0} cy={0} r={0.95} fill="none" stroke={C.sel} strokeWidth={0.12 * ss} strokeDasharray={`${0.3 * ss} ${0.2 * ss}`} />}
    </g>
  );
}

/* ============================ ГЛАВНЫЙ КОМПОНЕНТ ============================ */

export default function CQBSelo() {
  const seed = useMemo(buildSeed, []);
  const [objects, setObjects] = useState(seed.objects);
  const [zones, setZones] = useState(seed.zones);
  const [field, setField] = useState({ w: 50, h: 40, grid: 5 });
  const [tool, setTool] = useState("select");
  const [asset, setAsset] = useState("column");
  const [zoneKind, setZoneKind] = useState("spawnA");
  const [selected, setSelected] = useState(null);
  const [selZone, setSelZone] = useState(null);
  const [snap, setSnap] = useState(0.5);
  const [tiers, setTiers] = useState(2);
  const [price, setPrice] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [view, setView] = useState({ cx: -12, cy: -6, mpp: 0.09 });
  const [boxSize, setBoxSize] = useState({ w: 900, h: 620 });
  const [status, setStatus] = useState("Планировка снята с референса · поле 50 × 40 м");
  const [openMenu, setOpenMenu] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [pending, setPending] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [bg, setBg] = useState(null);
  const [history, setHistory] = useState([]);
  const [tablesOpen, setTablesOpen] = useState(true);
  const [library, setLibrary] = useState([]);
  const [mapName, setMapName] = useState("Без названия");
  const [shareUrl, setShareUrl] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [shared, setShared] = useState({ state: "idle", list: [], err: "" });
  const [compact, setCompact] = useState(detectCompact);
  const [vp, setVp] = useState(() => (typeof window === "undefined" ? { w: 1200, h: 800 } : { w: window.innerWidth, h: window.innerHeight }));
  const [coarse, setCoarse] = useState(detectCoarse);
  const [sheet, setSheet] = useState(null);
  const [bgFinger, setBgFinger] = useState(false);

  const wrapRef = useRef(null), svgRef = useRef(null);
  const fileRef = useRef(null), imgRef = useRef(null);
  const dragRef = useRef(null);
  const dragTokenRef = useRef(null);
  const touchesRef = useRef(new Map());
  const pinchRef = useRef(null);
  const viewRef = useRef(view);
  const snapRef = useRef(snap);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { snapRef.current = snap; }, [snap]);

  /* Ширина экрана решает раскладку: узкий или низкий — телефонная. */
  useEffect(() => {
    const on = () => { setCompact(detectCompact()); setVp({ w: window.innerWidth, h: window.innerHeight }); };
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => { window.removeEventListener("resize", on); window.removeEventListener("orientationchange", on); };
  }, []);

  /* Раскладка меняется целиком, поэтому следим за новым контейнером карты. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      setBoxSize({ w: Math.max(r.width, 120), h: Math.max(r.height, 120) });
    };
    const ro = new ResizeObserver(read);
    ro.observe(el); read();
    return () => ro.disconnect();
  }, [compact]);

  const vb = useMemo(() => ({ x: view.cx, y: view.cy, w: boxSize.w * view.mpp, h: boxSize.h * view.mpp }), [view, boxSize]);

  /* Предел отдаления: не меньше прежних 0.3 м/пкс, но большое поле
     на узком экране всё равно должно помещаться целиком с запасом. */
  const zoomMax = Math.max(0.3, ((field.w + 22) / boxSize.w) * 2, ((field.h + 14) / boxSize.h) * 2);
  const zoomMaxRef = useRef(zoomMax);
  useEffect(() => { zoomMaxRef.current = zoomMax; }, [zoomMax]);

  const toWorld = useCallback((cx, cy) => {
    const r = svgRef.current.getBoundingClientRect();
    const v = viewRef.current;
    return { x: v.cx + (cx - r.left) * v.mpp, y: v.cy + (cy - r.top) * v.mpp };
  }, []);

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h.slice(-40), { objects, zones, bg }]);
  }, [objects, zones, bg]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) { setStatus("Отменять нечего"); return h; }
      const last = h[h.length - 1];
      setObjects(last.objects); setZones(last.zones); setBg(last.bg);
      setSelected(null); setSelZone(null); setStatus("Отменено последнее действие");
      return h.slice(0, -1);
    });
  }, []);

  const stats = useMemo(() => {
    const list = Object.values(objects);
    const walls = list.filter((o) => o.t === "wallH" || o.t === "wallV");
    const columns = list.filter((o) => o.t === "column");
    const stacks = list.filter((o) => o.t === "stack");
    const wallBales = walls.reduce((s, o) => s + baleCount(o.l, o.tiers), 0);
    const colBales = columns.reduce((s, o) => s + (o.tiers || 1), 0);
    const stackBales = stacks.reduce((s, o) => s + 2 * (o.tiers || 1), 0);
    const groups = {};
    walls.forEach((o) => {
      const key = r1(o.l) + "|" + (o.tiers || 1);
      if (!groups[key]) groups[key] = { len: r1(o.l), tiers: o.tiers || 1, n: 0 };
      groups[key].n++;
    });
    const rows = Object.values(groups).map((g) => ({ ...g, per: baleCount(g.len, g.tiers), total: g.n * baleCount(g.len, g.tiers) }))
      .sort((a, b) => b.len - a.len || b.tiers - a.tiers);
    return {
      walls, rows, columns, stacks, wallBales, colBales, stackBales,
      totalBales: wallBales + colBales + stackBales,
      totalLen: walls.reduce((s, o) => s + o.l, 0),
      crates: list.filter((o) => o.t === "crate").length,
      tires: list.filter((o) => o.t === "tire").length,
      barrels: list.filter((o) => o.t === "barrel").length,
      figs: list.filter((o) => o.t === "figA" || o.t === "figB"),
    };
  }, [objects]);

  const zoneOccupancy = useCallback((z) => {
    let a = 0, b = 0;
    stats.figs.forEach((f) => {
      if (f.x >= z.x && f.x <= z.x + z.w && f.y >= z.y && f.y <= z.y + z.h) { if (f.t === "figA") a++; else b++; }
    });
    return { a, b };
  }, [stats.figs]);

  /* tol — допуск в метрах. Мышью попадаем точно (tol = 0), а пальцем
     стена в 0.8 м на телефоне — это 4 пикселя, поэтому при касании
     берём ближайший объект в пределах допуска, если точного попадания нет. */
  const hitTest = useCallback((p, tol = 0) => {
    const list = Object.values(objects);
    let best = null, bestD = Infinity;
    for (let i = list.length - 1; i >= 0; i--) {
      const o = list[i];
      let d;
      if (o.t === "figA" || o.t === "figB") {
        const r = Math.hypot(o.x - p.x, o.y - p.y);
        if (r < 0.75) return o;
        d = r - 0.75;
      } else {
        let x0 = o.x, y0 = o.y, x1, y1;
        if (o.t === "wallH") { x1 = o.x + o.l; y1 = o.y + BALE_T; }
        else if (o.t === "wallV") { x1 = o.x + BALE_T; y1 = o.y + o.l; }
        else { const a = ASSETS[o.t] || {}; x1 = o.x + (a.w || 0.8); y1 = o.y + (a.h || 0.8); }
        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) return o;
        d = Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(y0 - p.y, 0, p.y - y1));
      }
      if (d <= tol && d < bestD) { best = o; bestD = d; }
    }
    return best;
  }, [objects]);

  const hitZone = useCallback((p) => {
    const zs = Object.values(zones);
    for (let i = zs.length - 1; i >= 0; i--) {
      const z = zs[i];
      if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) return z;
    }
    return null;
  }, [zones]);

  /* Попадание в подложку. Картинка может быть повёрнута, поэтому точку
     крутим обратно вокруг центра и проверяем уже в её собственных осях. */
  const hitBg = useCallback((p) => {
    if (!bg) return false;
    const h = bg.w / bg.aspect;
    const cx = bg.x + bg.w / 2, cy = bg.y + h / 2;
    const a = -((bg.rot || 0) * Math.PI) / 180;
    const dx = p.x - cx, dy = p.y - cy;
    const lx = cx + dx * Math.cos(a) - dy * Math.sin(a);
    const ly = cy + dx * Math.sin(a) + dy * Math.cos(a);
    return lx >= bg.x && lx <= bg.x + bg.w && ly >= bg.y && ly <= bg.y + h;
  }, [bg]);

  /* единый цикл перетаскивания на window.
     pid — какой палец/кнопка ведёт перетаскивание: при мультитаче чужие
     касания не должны двигать объект. Жетон (token) позволяет оборвать
     перетаскивание снаружи — например, когда второй палец начинает щипок.
     th — порог в пикселях: пока палец не сдвинулся дальше, это ещё касание,
     а не перетаскивание (иначе дрожь пальца сдвигает объекты). */
  const beginDrag = useCallback((d, pid) => {
    const token = {};
    dragTokenRef.current = token;
    dragRef.current = d;
    const alive = () => dragTokenRef.current === token;
    const mine = (e) => pid == null || e.pointerId === pid;
    function cleanup() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    }
    function move(e) {
      if (!alive()) { cleanup(); return; }
      if (!mine(e)) return;
      let dr = dragRef.current;
      if (!dr) return;
      if (dr.th) {
        if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < dr.th) return;
        if (dr.kind === "tap") {
          /* палец поехал — значит, это не нажатие, а сдвиг карты */
          const v = viewRef.current;
          dragRef.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: v.cx, oy: v.cy };
          return;
        }
        dr = { ...dr, th: 0 };
        dragRef.current = dr;
      }
      if (dr.kind === "tap") return;
      const s = snapRef.current;
      const p = toWorld(e.clientX, e.clientY);
      setMouse(p);
      if (dr.kind === "pan") {
        const v = viewRef.current;
        setView({ mpp: v.mpp, cx: dr.ox - (e.clientX - dr.sx) * v.mpp, cy: dr.oy - (e.clientY - dr.sy) * v.mpp });
      } else if (dr.kind === "draw" || dr.kind === "zone") {
        const nd = { ...dr, x1: snapTo(p.x, s), y1: snapTo(p.y, s) };
        dragRef.current = nd;
        setGhost(nd);
      } else if (dr.kind === "move") {
        const nx = dr.isFig ? r1(p.x - dr.dx) : snapTo(p.x - dr.dx, s);
        const ny = dr.isFig ? r1(p.y - dr.dy) : snapTo(p.y - dr.dy, s);
        setObjects((m) => (m[dr.id] ? { ...m, [dr.id]: { ...m[dr.id], x: nx, y: ny } } : m));
      } else if (dr.kind === "moveZone") {
        setZones((m) => (m[dr.id] ? { ...m, [dr.id]: { ...m[dr.id], x: snapTo(p.x - dr.dx, s), y: snapTo(p.y - dr.dy, s) } } : m));
      } else if (dr.kind === "moveBg") {
        setBg((b) => (b ? { ...b, x: r1(p.x - dr.dx), y: r1(p.y - dr.dy) } : b));
      }
    }
    function up(e) {
      if (!alive()) { cleanup(); return; }
      if (!mine(e)) return;
      cleanup();
      dragTokenRef.current = null;
      const dr = dragRef.current;
      dragRef.current = null;
      setGhost(null);
      if (!dr) return;
      const s = snapRef.current;
      if (dr.kind === "tap") {
        if (e.type !== "pointercancel" && dr.fn) dr.fn();
      } else if (dr.kind === "draw") {
        const horiz = dr.dir === "wallH";
        const len = snapTo(Math.abs(horiz ? dr.x1 - dr.x0 : dr.y1 - dr.y0), s);
        if (len >= 1) {
          const id = uid("w");
          const o = horiz
            ? { id, t: "wallH", x: Math.min(dr.x0, dr.x1), y: dr.y0, l: len, tiers: dr.tiers }
            : { id, t: "wallV", x: dr.x0, y: Math.min(dr.y0, dr.y1), l: len, tiers: dr.tiers };
          setObjects((m) => ({ ...m, [id]: o }));
          setSelected(id); setSelZone(null);
          setStatus(`Стена ${len} м · ${baleCount(len, dr.tiers)} тюков`);
        }
      } else if (dr.kind === "zone") {
        const x = Math.min(dr.x0, dr.x1), y = Math.min(dr.y0, dr.y1);
        const w = Math.abs(dr.x1 - dr.x0), h = Math.abs(dr.y1 - dr.y0);
        if (w >= 1 && h >= 1) setPending({ x, y, w, h, k: dr.k, n: "" });
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [toWorld]);
  const beginDragRef = useRef(beginDrag);
  useEffect(() => { beginDragRef.current = beginDrag; }, [beginDrag]);

  /* Оборвать текущее перетаскивание так, будто его не было:
     недорисованную стену выбросить, сдвинутый объект вернуть на место. */
  const cancelDrag = useCallback(() => {
    const dr = dragRef.current;
    dragTokenRef.current = null;
    dragRef.current = null;
    setGhost(null);
    if (!dr) return;
    if (dr.kind === "draw" || dr.kind === "zone") setHistory((h) => h.slice(0, -1));
    else if (dr.kind === "move" && dr.orig) {
      setObjects((m) => (m[dr.id] ? { ...m, [dr.id]: { ...m[dr.id], x: dr.orig.x, y: dr.orig.y } } : m));
      setHistory((h) => h.slice(0, -1));
    } else if (dr.kind === "moveZone" && dr.orig) {
      setZones((m) => (m[dr.id] ? { ...m, [dr.id]: { ...m[dr.id], x: dr.orig.x, y: dr.orig.y } } : m));
      setHistory((h) => h.slice(0, -1));
    } else if (dr.kind === "moveBg" && dr.orig) {
      setBg((b) => (b ? { ...b, x: dr.orig.x, y: dr.orig.y } : b));
      setHistory((h) => h.slice(0, -1));
    }
  }, []);

  /* Щипок двумя пальцами: зум и сдвиг карты сразу. Точка карты под
     серединой между пальцами остаётся под ней же. */
  const anchorPinch = useCallback(() => {
    const pts = [...touchesRef.current.values()];
    if (pts.length < 2 || !svgRef.current) { pinchRef.current = null; return; }
    const [a, b] = pts;
    const r = svgRef.current.getBoundingClientRect();
    const v = viewRef.current;
    const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
    pinchRef.current = { dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), mpp: v.mpp, wx: v.cx + mx * v.mpp, wy: v.cy + my * v.mpp };
  }, []);

  useEffect(() => {
    const mv = (e) => {
      if (e.pointerType !== "touch" || !touchesRef.current.has(e.pointerId)) return;
      touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pr = pinchRef.current;
      if (!pr || touchesRef.current.size < 2 || !svgRef.current) return;
      const [a, b] = [...touchesRef.current.values()];
      const dist = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      const r = svgRef.current.getBoundingClientRect();
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      const mpp = Math.min(zoomMaxRef.current, Math.max(0.008, (pr.mpp * pr.dist) / dist));
      setView({ mpp, cx: pr.wx - mx * mpp, cy: pr.wy - my * mpp });
    };
    const up = (e) => {
      if (e.pointerType !== "touch" || !touchesRef.current.has(e.pointerId)) return;
      touchesRef.current.delete(e.pointerId);
      if (!pinchRef.current) return;
      if (touchesRef.current.size >= 2) { anchorPinch(); return; }
      pinchRef.current = null;
      /* один палец остался на экране — продолжаем им двигать карту */
      if (touchesRef.current.size === 1) {
        const [[id, p]] = [...touchesRef.current.entries()];
        const v = viewRef.current;
        beginDragRef.current({ kind: "pan", sx: p.x, sy: p.y, ox: v.cx, oy: v.cy }, id);
      }
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [anchorPinch]);

  const onPointerDown = (ev) => {
    setOpenMenu(null);
    const isTouch = ev.pointerType === "touch";
    const fingerish = ev.pointerType === "touch" || ev.pointerType === "pen";
    if (fingerish !== coarse) setCoarse(fingerish);
    if (isTouch) {
      if (ev.isPrimary) touchesRef.current.clear();
      touchesRef.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (touchesRef.current.size >= 2) {
        /* второй палец: что бы ни начал первый — отменяем и щиплем */
        cancelDrag(); anchorPinch(); return;
      }
    }
    const pid = ev.pointerId;
    const p = toWorld(ev.clientX, ev.clientY);
    const v = viewRef.current;
    const tol = fingerish ? 14 * v.mpp : 0;
    const TH = 8;

    if (ev.button === 1 || ev.button === 2 || ev.shiftKey || tool === "pan") {
      beginDrag({ kind: "pan", sx: ev.clientX, sy: ev.clientY, ox: v.cx, oy: v.cy }, pid);
      return;
    }
    if (tool === "wallH" || tool === "wallV") {
      pushHistory();
      const d = { kind: "draw", dir: tool, tiers, x0: snapTo(p.x, snap), y0: snapTo(p.y, snap), x1: snapTo(p.x, snap), y1: snapTo(p.y, snap) };
      setGhost(d); beginDrag(d, pid); return;
    }
    if (tool === "zone") {
      pushHistory();
      const d = { kind: "zone", k: zoneKind, x0: snapTo(p.x, snap), y0: snapTo(p.y, snap), x1: snapTo(p.x, snap), y1: snapTo(p.y, snap) };
      setGhost(d); beginDrag(d, pid); return;
    }
    if (tool === "place") {
      const placeIt = () => {
        pushHistory();
        const a = ASSETS[asset]; const id = uid("o");
        const o = a.cat === "fig"
          ? { id, t: asset, x: r1(p.x), y: r1(p.y) }
          : { id, t: asset, x: snapTo(p.x - (a.w || 0) / 2, snap), y: snapTo(p.y - (a.h || 0) / 2, snap), tiers: (asset === "column" || asset === "stack") ? tiers : 1 };
        setObjects((m) => ({ ...m, [id]: o }));
        setSelected(id); setSelZone(null);
        setStatus(`Добавлено: ${a.name}`);
      };
      /* пальцем ставим по отпусканию: если палец поехал, это сдвиг карты */
      if (isTouch) beginDrag({ kind: "tap", sx: ev.clientX, sy: ev.clientY, th: TH, fn: placeIt }, pid);
      else placeIt();
      return;
    }
    const hit = hitTest(p, tol);
    if (tool === "delete") {
      const delIt = () => {
        if (hit) { pushHistory(); setObjects((m) => { const c = { ...m }; delete c[hit.id]; return c; }); setSelected(null); setStatus(`Удалено: ${ASSETS[hit.t]?.name || hit.t}`); }
        else { const z = hitZone(p); if (z) { pushHistory(); setZones((m) => { const c = { ...m }; delete c[z.id]; return c; }); setSelZone(null); setStatus(`Удалена зона: ${z.n}`); } }
      };
      if (isTouch) beginDrag({ kind: "tap", sx: ev.clientX, sy: ev.clientY, th: TH, fn: delIt }, pid);
      else delIt();
      return;
    }
    if (hit) {
      setSelected(hit.id); setSelZone(null); pushHistory();
      beginDrag({
        kind: "move", id: hit.id, dx: p.x - hit.x, dy: p.y - hit.y, isFig: hit.t === "figA" || hit.t === "figB",
        orig: { x: hit.x, y: hit.y }, sx: ev.clientX, sy: ev.clientY, th: isTouch ? TH : 0,
      }, pid);
      return;
    }
    const z = hitZone(p);
    if (z) {
      /* Зоны большие и лежат под всем полем. Пальцем сначала выбираем
         зону касанием, двигаем — только уже выбранную; иначе палец
         по зоне двигает карту. */
      if (isTouch && selZone !== z.id) {
        beginDrag({ kind: "tap", sx: ev.clientX, sy: ev.clientY, th: TH, fn: () => { setSelZone(z.id); setSelected(null); } }, pid);
        return;
      }
      setSelZone(z.id); setSelected(null); pushHistory();
      beginDrag({ kind: "moveZone", id: z.id, dx: p.x - z.x, dy: p.y - z.y, orig: { x: z.x, y: z.y }, sx: ev.clientX, sy: ev.clientY, th: isTouch ? TH : 0 }, pid);
      return;
    }
    if (bg && bg.visible && !bg.locked && (!isTouch || bgFinger) && hitBg(p)) {
      pushHistory();
      beginDrag({ kind: "moveBg", dx: p.x - bg.x, dy: p.y - bg.y, orig: { x: bg.x, y: bg.y } }, pid);
      return;
    }
    setSelected(null); setSelZone(null);
    beginDrag({ kind: "pan", sx: ev.clientX, sy: ev.clientY, ox: v.cx, oy: v.cy }, pid);
  };

  const onMoveIdle = (ev) => { if (!dragRef.current) setMouse(toWorld(ev.clientX, ev.clientY)); };

  const onWheel = (ev) => {
    ev.preventDefault();
    const r = svgRef.current.getBoundingClientRect();
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    const v = viewRef.current;
    const wx = v.cx + px * v.mpp, wy = v.cy + py * v.mpp;
    const mpp = Math.min(zoomMaxRef.current, Math.max(0.008, v.mpp * (ev.deltaY > 0 ? 1.12 : 0.893)));
    setView({ mpp, cx: wx - px * mpp, cy: wy - py * mpp });
  };

  const fitView = useCallback(() => {
    const padL = 13, padR = 9, padTop = 7, padBot = 7;
    const needW = field.w + padL + padR, needH = field.h + padTop + padBot;
    const mpp = Math.max(needW / boxSize.w, needH / boxSize.h);
    setView({ mpp, cx: -padL - (boxSize.w * mpp - needW) / 2, cy: -padTop - (boxSize.h * mpp - needH) / 2 });
  }, [field, boxSize]);

  /* На компьютере при изменении окна поле вписывается заново, как раньше.
     На телефоне высота прыгает от клавиатуры и панелей браузера — там
     сохраняем текущий масштаб и держим центр, а вписываем только при
     смене ширины (поворот экрана) или раскладки. */
  const lastBoxRef = useRef(null);
  useEffect(() => {
    const prev = lastBoxRef.current;
    lastBoxRef.current = { w: boxSize.w, h: boxSize.h, compact };
    if (!compact || !prev || prev.compact !== compact || Math.abs(prev.w - boxSize.w) > 40) { fitView(); return; }
    setView((v) => ({ ...v, cx: v.cx + ((prev.w - boxSize.w) * v.mpp) / 2, cy: v.cy + ((prev.h - boxSize.h) * v.mpp) / 2 }));
    /* eslint-disable-next-line */
  }, [boxSize.w, boxSize.h]);

  /* Горячие клавиши. Слушаем code (физическую клавишу), а не key,
     иначе русская раскладка ломает H/V/Z. Фаза capture — чтобы
     фокус на кнопке тулбара не перехватывал пробел и стрелки. */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      const code = e.code || "";

      if (code === "Delete" || code === "Backspace") {
        e.preventDefault();
        if (selected) { pushHistory(); setObjects((m) => { const c = { ...m }; delete c[selected]; return c; }); setSelected(null); }
        else if (selZone) { pushHistory(); setZones((m) => { const c = { ...m }; delete c[selZone]; return c; }); setSelZone(null); }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && code === "KeyZ") { e.preventDefault(); undo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (code === "KeyH") { e.preventDefault(); setTool("wallH"); setStatus("Инструмент: горизонтальная стена"); }
      else if (code === "KeyV") { e.preventDefault(); setTool("wallV"); setStatus("Инструмент: вертикальная стена"); }
      else if (code === "KeyS") { e.preventDefault(); setTool("select"); setStatus("Инструмент: выделить и двигать"); }
      else if (code === "KeyZ") { e.preventDefault(); setTool("zone"); setDialog("zonekind"); }
      else if (code === "KeyD") { e.preventDefault(); setTool("delete"); setStatus("Инструмент: удалить"); }
      else if (code === "KeyF") { e.preventDefault(); fitView(); }
      else if (code === "KeyG") { e.preventDefault(); setShowGrid((g) => !g); }
      else if (code === "Space") { e.preventDefault(); setTool("pan"); setStatus("Инструмент: панорама"); }
      else if (code === "Escape") { setTool("select"); setSelected(null); setSelZone(null); setOpenMenu(null); setDialog(null); setPending(null); setSheet(null); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [selected, selZone, pushHistory, undo, fitView]);

  /* ---- библиотека карт в браузере ---- */
  const refreshLibrary = useCallback(() => setLibrary(listLibrary()), []);

  const currentDoc = useCallback((withBg) => ({
    v: 3, name: mapName, at: Date.now(), field, objects, zones, price,
    bg: withBg ? bg : null,
  }), [mapName, field, objects, zones, price, bg]);

  const applyDoc = useCallback((d, label) => {
    pushHistory();
    if (d.field) setField(d.field);
    if (d.objects) setObjects(d.objects);
    if (d.zones) setZones(d.zones);
    if (d.price != null) setPrice(d.price);
    setBg(d.bg || null);
    if (d.name) setMapName(d.name);
    setSelected(null); setSelZone(null);
    setStatus(label);
  }, [pushHistory]);

  const saveToLibrary = useCallback((name) => {
    if (!lsAvailable()) { setStatus("Браузер не разрешает сохранение. Пользуйтесь файлом JSON."); return; }
    const clean = (name || "").trim() || "Без названия";
    try {
      window.localStorage.setItem(LS_PREFIX + clean, JSON.stringify({ ...currentDoc(true), name: clean }));
      setMapName(clean); refreshLibrary();
      setStatus(`Карта «${clean}» сохранена в этом браузере`);
    } catch (e) {
      setStatus("Не хватило места в браузере. Уберите подложку или удалите старые карты.");
    }
  }, [currentDoc, refreshLibrary]);

  const loadFromLibrary = useCallback((key) => {
    try {
      const d = JSON.parse(window.localStorage.getItem(key));
      applyDoc(d, `Открыта карта «${d.name || ""}»`);
      setDialog(null);
    } catch (e) { setStatus("Запись повреждена и не открылась"); }
  }, [applyDoc]);

  const deleteFromLibrary = useCallback((key, name) => {
    window.localStorage.removeItem(key); refreshLibrary();
    setStatus(`Карта «${name}» удалена из браузера`);
  }, [refreshLibrary]);

  /* ---- общие карты из папки maps ---- */
  const openShared = useCallback(() => {
    setDialog("shared");
    setShared({ state: "loading", list: [], err: "" });
    fetchSharedMaps()
      .then((list) => setShared({ state: "ok", list, err: "" }))
      .catch((e) => setShared({ state: "err", list: [], err: e.message }));
  }, []);

  const loadShared = useCallback((item) => {
    setShared((s0) => ({ ...s0, err: "" }));
    fetch(item.url, { cache: "no-cache" })
      .then((r) => { if (!r.ok) throw new Error("файл не открылся"); return r.json(); })
      .then((d) => { applyDoc(d, `Открыта общая карта «${d.name || item.name}»`); setMapName(d.name || item.name); setDialog(null); })
      .catch((e) => setShared((s0) => ({ ...s0, err: "Не удалось открыть: " + e.message })));
  }, [applyDoc]);

  /* ---- ссылка для друзей ---- */
  const makeShareLink = useCallback(async () => {
    setDialog("share"); setShareUrl(""); setShareNote("");
    try {
      const hadBg = !!bg;
      const code = await packMap(currentDoc(false));
      const base = window.location.origin + window.location.pathname;
      const url = base + "#m=" + code;
      setShareUrl(url);
      const kb = Math.round(url.length / 1024);
      setShareNote(hadBg
        ? `Длина ссылки ${kb} КБ. Подложка в ссылку не входит — картинку отправьте отдельно.`
        : `Длина ссылки ${kb} КБ.`);
    } catch (e) {
      setShareNote("Не удалось собрать ссылку: " + e.message);
    }
  }, [currentDoc, bg]);

  /* карта из адреса страницы при открытии */
  const hashLoaded = useRef(false);
  useEffect(() => {
    if (hashLoaded.current) return;
    hashLoaded.current = true;
    const h = window.location.hash || "";
    const i = h.indexOf("#m=");
    if (i !== 0) { refreshLibrary(); return; }
    unpackMap(h.slice(3))
      .then((d) => applyDoc(d, "Карта открыта по ссылке. Сохраните её у себя, чтобы не потерять."))
      .catch((e) => setStatus("Ссылка не прочиталась: " + e.message))
      .then(refreshLibrary);
  }, [applyDoc, refreshLibrary]);

  const saveMap = () => {
    const data = JSON.stringify(currentDoc(true), null, 1);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `${(mapName || "cqb_selo").replace(/[^\wа-яА-Я\- ]+/g, "")}.json`; a.click();
    URL.revokeObjectURL(url); setStatus("Карта сохранена в cqb_selo.json");
  };
  const loadMap = (ev) => {
    const f = ev.target.files && ev.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        pushHistory();
        if (d.field) setField(d.field);
        if (d.objects) setObjects(d.objects);
        if (d.zones) setZones(d.zones);
        if (d.price != null) setPrice(d.price);
        setBg(d.bg || null);
        setSelected(null); setSelZone(null); setStatus(`Загружено: ${f.name}`);
      } catch (err) { setStatus("Не удалось прочитать файл: он не похож на карту"); }
    };
    rd.readAsText(f); ev.target.value = "";
  };
  const loadBg = (ev) => {
    const f = ev.target.files && ev.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        pushHistory();
        const aspect = img.naturalWidth / img.naturalHeight;
        setBg({ src: rd.result, x: 0, y: 0, w: field.w, aspect, rot: 0, opacity: 0.45, locked: false, visible: true, name: f.name });
        setDialog("bg");
        setStatus(`Подложка «${f.name}» вписана в ширину поля`);
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f); ev.target.value = "";
  };
  const exportSVG = () => {
    const node = svgRef.current.cloneNode(true);
    node.setAttribute("viewBox", `-14 -7 ${field.w + 26} ${field.h + 16}`);
    node.setAttribute("width", String((field.w + 26) * 20));
    node.setAttribute("height", String((field.h + 16) * 20));
    const src = new XMLSerializer().serializeToString(node);
    const url = URL.createObjectURL(new Blob([src], { type: "image/svg+xml" }));
    const a = document.createElement("a"); a.href = url; a.download = "cqb_selo.svg"; a.click();
    URL.revokeObjectURL(url); setStatus("Экспортировано в cqb_selo.svg");
  };
  const exportCSV = () => {
    const lines = [["Тип секции", "Секций", "Ярусов", "Тюков в секции", "Всего"].join(";")];
    stats.rows.forEach((r) => lines.push([`Стена ${r.len} м`, r.n, r.tiers, r.per, r.total].join(";")));
    if (stats.colBales) lines.push(["Колонны", stats.columns.length, "", "", stats.colBales].join(";"));
    if (stats.stackBales) lines.push(["Штабели", stats.stacks.length, "", "", stats.stackBales].join(";"));
    lines.push(["ИТОГО", stats.walls.length, "", "", stats.totalBales].join(";"));
    lines.push(["Смета, руб", "", "", "", stats.totalBales * price].join(";"));
    const url = URL.createObjectURL(new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "cqb_selo_raschet.csv"; a.click();
    URL.revokeObjectURL(url); setStatus("Расчёт выгружен в CSV");
  };
  const newMap = () => { pushHistory(); setObjects({}); setZones({}); setSelected(null); setSelZone(null); setStatus("Пустое поле. Выберите инструмент стены и рисуйте"); };
  const resetMap = () => { pushHistory(); const s = buildSeed(); setObjects(s.objects); setZones(s.zones); setSelected(null); setSelZone(null); setStatus("Восстановлена планировка с референса"); };

  const sel = selected ? objects[selected] : null;
  const zsel = selZone ? zones[selZone] : null;
  const updateSel = (patch) => { if (selected) setObjects((m) => ({ ...m, [selected]: { ...m[selected], ...patch } })); };
  const updateZone = (id, patch) => setZones((m) => ({ ...m, [id]: { ...m[id], ...patch } }));

  const gridLines = useMemo(() => {
    const minor = [], major = [];
    for (let x = 0; x <= field.w + 0.001; x += 1) (Math.abs(x % field.grid) < 1e-6 ? major : minor).push(["V", x]);
    for (let y = 0; y <= field.h + 0.001; y += 1) (Math.abs(y % field.grid) < 1e-6 ? major : minor).push(["H", y]);
    return { minor, major };
  }, [field]);

  const deleteSelected = () => {
    pushHistory();
    if (selected) { setObjects((m) => { const c = { ...m }; delete c[selected]; return c; }); setSelected(null); }
    else if (selZone) { setZones((m) => { const c = { ...m }; delete c[selZone]; return c; }); setSelZone(null); }
  };

  const TOOLS = [
    ["select", "Выделить и двигать"], ["wallH", "Стена из тюков (Г)"], ["wallV", "Стена из тюков (В)"],
    ["place", "Поставить объект"], ["pan", "Панорама"], ["zone", "Нарисовать зону"], ["delete", "Удалить"],
  ];

  const MENUS = [
    { label: "Файл", items: [
      { label: "Новая карта", fn: newMap },
      { label: "Мои карты…", key: `${library.length}`, fn: () => { refreshLibrary(); setDialog("library"); } },
      { label: "Общие карты с сайта…", fn: openShared },
      { label: "Сохранить в браузере", fn: () => saveToLibrary(mapName) },
      { label: "Ссылка для друзей…", fn: makeShareLink }, "-",
      { label: "Открыть файл карты…", fn: () => fileRef.current && fileRef.current.click() },
      { label: "Сохранить файлом", key: "JSON", fn: saveMap }, "-",
      { label: "Экспорт чертежа", key: "SVG", fn: exportSVG },
      { label: "Экспорт расчёта", key: "CSV", fn: exportCSV },
    ]},
    { label: "Правка", items: [
      { label: "Отменить", key: "Ctrl+Z", fn: undo, disabled: !history.length },
      { label: "Удалить выбранное", key: "Del", disabled: !selected && !selZone, fn: deleteSelected },
      { label: "Снять выделение", key: "Esc", fn: () => { setSelected(null); setSelZone(null); } }, "-",
      { label: "Сбросить к референсу", fn: resetMap },
    ]},
    { label: "Карта", items: [
      { label: "Вписать в экран", fn: fitView },
      { label: "Сетка", on: showGrid, fn: () => setShowGrid((g) => !g) },
      { label: "Размер поля и сетка…", fn: () => setDialog("field") }, "-",
      { label: "Загрузить подложку…", fn: () => imgRef.current && imgRef.current.click() },
      { label: "Настройка подложки…", disabled: !bg, fn: () => setDialog("bg") },
      { label: "Показывать подложку", on: !!(bg && bg.visible), disabled: !bg, fn: () => setBg((b) => (b ? { ...b, visible: !b.visible } : b)) },
      { label: "Убрать подложку", disabled: !bg, fn: () => { pushHistory(); setBg(null); } },
    ]},
    { label: "Расчёт", items: [
      { label: `Всего тюков: ${stats.totalBales}`, disabled: true },
      { label: `Длина стен: ${r1(stats.totalLen)} м`, disabled: true },
      { label: `Смета: ${(stats.totalBales * price).toLocaleString("ru-RU")} ₽`, disabled: true }, "-",
      { label: "Цена тюка…", fn: () => setDialog("price") },
      { label: "Выгрузить расчёт в CSV", fn: exportCSV },
    ]},
    { label: "Справка", items: [
      { label: compact ? "Управление пальцами…" : "Горячие клавиши…", fn: () => setDialog("keys") },
      ...(compact ? [{ label: "Легенда…", fn: () => setDialog("legend") }] : []),
      { label: "О программе…", fn: () => setDialog("about") },
    ]},
  ];

  const ui = { font: "12px/1.35 Tahoma, Verdana, system-ui, sans-serif", color: C.ink };
  const bgH = bg ? bg.w / bg.aspect : 0;
  const bgRot = bg ? (bg.rot || 0) : 0;

  /* ---- общие куски интерфейса: одни и те же для компьютера и телефона ---- */
  const fs = (n) => (compact ? n + 2.5 : n);
  /* на телефоне пунктир выделения толще, иначе его не видно при мелком масштабе */
  const ss = compact ? Math.max(1, view.mpp / 0.09) : 1;
  const ghostFs = compact ? Math.max(1.1, 13 * view.mpp) : 1.1;

  const hiddenInputs = (<>
    <input ref={fileRef} type="file" accept=".json,application/json" onChange={loadMap} style={{ display: "none" }} />
    <input ref={imgRef} type="file" accept="image/*" onChange={loadBg} style={{ display: "none" }} />
  </>);

  const mapSvg = (
          <svg ref={svgRef} width="100%" height="100%" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            style={{ display: "block", touchAction: "none", cursor: tool === "pan" ? "grab" : tool === "select" ? "default" : "crosshair" }}
            onPointerDown={onPointerDown} onPointerMove={onMoveIdle} onWheel={onWheel} onContextMenu={(e) => e.preventDefault()}>
            <defs>
              <pattern id="hay" width="0.8" height="0.4" patternUnits="userSpaceOnUse">
                <rect width="0.8" height="0.4" fill={C.hayFill} />
                <path d="M0 0.08 h0.8 M0 0.2 h0.8 M0 0.32 h0.8" stroke={C.hayLine} strokeWidth="0.035" opacity="0.85" />
                <path d="M0.15 0 v0.4 M0.45 0 v0.4 M0.68 0 v0.4" stroke="#D9C68F" strokeWidth="0.025" opacity="0.8" />
              </pattern>
              <pattern id="concrete" width="2" height="2" patternUnits="userSpaceOnUse">
                <rect width="2" height="2" fill="#FBFBFA" />
                <circle cx="0.4" cy="0.6" r="0.035" fill="#E2E2DE" />
                <circle cx="1.5" cy="1.2" r="0.03" fill="#E6E6E2" />
                <circle cx="1.0" cy="1.8" r="0.025" fill="#E2E2DE" />
              </pattern>
            </defs>

            <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="#F7F9FB" />

            {Object.values(zones).filter((z) => ZONE_KINDS[z.k] && ZONE_KINDS[z.k].under).map((z) => (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill || ZONE_KINDS[z.k].fill} stroke={ZONE_KINDS[z.k].stroke} strokeWidth={0.08} />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2} textAnchor="middle" fontSize={1.25} fill="#46523F" fontFamily="Tahoma, sans-serif"
                  transform={z.h > z.w * 1.6 ? `rotate(-90 ${z.x + z.w / 2} ${z.y + z.h / 2})` : undefined}>{z.n}</text>
                {selZone === z.id && <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke={C.sel} strokeWidth={0.2 * ss} strokeDasharray={`${0.8 * ss} ${0.5 * ss}`} />}
              </g>
            ))}

            {bg && bg.visible && (
              <g transform={bgRot ? `rotate(${bgRot} ${bg.x + bg.w / 2} ${bg.y + bgH / 2})` : undefined}>
                <image href={bg.src} xlinkHref={bg.src} x={bg.x} y={bg.y} width={bg.w} height={bgH} opacity={bg.opacity} preserveAspectRatio="none" />
              </g>
            )}

            <rect x={0} y={0} width={field.w} height={field.h} fill="url(#concrete)" opacity={bg && bg.visible ? 0 : 1} />

            {showGrid && (
              <g>
                {gridLines.minor.map(([d, v], i) => d === "V"
                  ? <line key={"mv" + i} x1={v} y1={0} x2={v} y2={field.h} stroke={C.gridMinor} strokeWidth={0.035} />
                  : <line key={"mh" + i} x1={0} y1={v} x2={field.w} y2={v} stroke={C.gridMinor} strokeWidth={0.035} />)}
                {gridLines.major.map(([d, v], i) => d === "V"
                  ? <line key={"Mv" + i} x1={v} y1={0} x2={v} y2={field.h} stroke={C.gridMajor} strokeWidth={0.07} />
                  : <line key={"Mh" + i} x1={0} y1={v} x2={field.w} y2={v} stroke={C.gridMajor} strokeWidth={0.07} />)}
              </g>
            )}

            {Object.values(zones).filter((z) => !(ZONE_KINDS[z.k] && ZONE_KINDS[z.k].under)).map((z) => (
              <g key={z.id}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill || ZONE_KINDS[z.k].fill} stroke={ZONE_KINDS[z.k].stroke} strokeWidth={0.08} opacity={0.95} />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 0.6} textAnchor="middle" fontSize={1.8} fontWeight="bold" fill="#2B2B26" fontFamily="Tahoma, sans-serif" opacity={0.9}>{z.n}</text>
                {selZone === z.id && <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke={C.sel} strokeWidth={0.2 * ss} strokeDasharray={`${0.8 * ss} ${0.5 * ss}`} />}
              </g>
            ))}

            {Object.values(objects).filter((o) => o.t === "wallH" || o.t === "wallV").map((o) => <HayWall key={o.id} o={o} selected={o.id === selected} ss={ss} />)}
            {Object.values(objects).filter((o) => ASSETS[o.t] && (ASSETS[o.t].cat === "prop" || ASSETS[o.t].cat === "mark")).map((o) => <Prop key={o.id} o={o} selected={o.id === selected} ss={ss} />)}
            {Object.values(objects).filter((o) => o.t === "figA" || o.t === "figB").map((o) => <Figure key={o.id} o={o} selected={o.id === selected} ss={ss} />)}

            <rect x={0} y={0} width={field.w} height={field.h} fill="none" stroke="#141412" strokeWidth={0.18} />

            {ghost && ghost.kind === "draw" && (() => {
              const horiz = ghost.dir === "wallH";
              const len = Math.abs(horiz ? ghost.x1 - ghost.x0 : ghost.y1 - ghost.y0);
              const x = horiz ? Math.min(ghost.x0, ghost.x1) : ghost.x0;
              const y = horiz ? ghost.y0 : Math.min(ghost.y0, ghost.y1);
              return (<g>
                <rect x={x} y={y} width={horiz ? len : BALE_T} height={horiz ? BALE_T : len} fill={C.hayFill} opacity={0.6} stroke={C.sel} strokeWidth={0.1} />
                <text x={x + (horiz ? len / 2 : 1.4)} y={y - 0.4} fontSize={ghostFs} fill={C.sel} textAnchor="middle" fontFamily="Tahoma, sans-serif">{r1(len)} м · {baleCount(len, tiers)} тюк.</text>
              </g>);
            })()}
            {ghost && ghost.kind === "zone" && (
              <rect x={Math.min(ghost.x0, ghost.x1)} y={Math.min(ghost.y0, ghost.y1)}
                width={Math.abs(ghost.x1 - ghost.x0)} height={Math.abs(ghost.y1 - ghost.y0)}
                fill={ZONE_KINDS[ghost.k].fill} opacity={0.75} stroke={C.sel} strokeWidth={0.1} strokeDasharray="0.6 0.4" />
            )}

            {/* размерные линии вынесены наружу safety-зон */}
            <g stroke="#141412" strokeWidth={0.06} fill="#141412" fontFamily="Tahoma, sans-serif">
              <line x1={0} y1={-4} x2={field.w} y2={-4} />
              <line x1={0} y1={-4.5} x2={0} y2={-3.5} /><line x1={field.w} y1={-4.5} x2={field.w} y2={-3.5} />
              <rect x={field.w / 2 - 3} y={-5.3} width={6} height={2} fill="#F7F9FB" stroke="none" />
              <text x={field.w / 2} y={-3.8} fontSize={1.6} textAnchor="middle" stroke="none">{field.w} м</text>
              <line x1={-8.5} y1={0} x2={-8.5} y2={field.h} />
              <line x1={-9} y1={0} x2={-8} y2={0} /><line x1={-9} y1={field.h} x2={-8} y2={field.h} />
              <rect x={-9.7} y={field.h / 2 - 2.6} width={2.4} height={5.2} fill="#F7F9FB" stroke="none" />
              <text x={-8.5} y={field.h / 2} fontSize={1.6} textAnchor="middle" stroke="none" transform={`rotate(-90 ${-8.5} ${field.h / 2})`}>{field.h} м</text>
            </g>

            <g transform={`translate(${field.w / 2 - 6}, ${field.h + 2.4})`} fontFamily="Tahoma, sans-serif">
              <path d="M0 -0.3 c-0.42 0 -0.6 0.36 -0.6 0.74 h1.2 c0 -0.38 -0.18 -0.74 -0.6 -0.74 z" fill="#4A4A4A" transform="translate(-1.6,0.6)" />
              <circle cx={-1.6} cy={0.12} r={0.26} fill="#4A4A4A" />
              <text x={-1.6} y={2.2} fontSize={0.85} textAnchor="middle" fill="#141412">1.8 м</text>
              {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1 + i} y={0.5} width={1} height={0.45} fill={i % 2 ? "#fff" : "#1A1A18"} stroke="#1A1A18" strokeWidth={0.05} />)}
              {[0, 1, 2, 3, 4, 5].map((i) => <text key={i} x={1 + i} y={0.25} fontSize={0.8} textAnchor="middle" fill="#141412">{i}{i ? "м" : ""}</text>)}
              <text x={7.6} y={0.95} fontSize={0.85} fill="#141412">метрическая</text>
            </g>

            <g fontFamily="Tahoma, sans-serif" fill="#5E6A72" fontSize={0.95}>
              {Array.from({ length: Math.floor(field.w / field.grid) }, (_, i) => (
                <text key={"gx" + i} x={i * field.grid + field.grid / 2} y={-0.45} textAnchor="middle">{String.fromCharCode(65 + i)}</text>
              ))}
              {Array.from({ length: Math.floor(field.h / field.grid) }, (_, i) => (
                <text key={"gy" + i} x={-0.7} y={i * field.grid + field.grid / 2 + 0.35} textAnchor="middle">{i + 1}</text>
              ))}
            </g>
          </svg>
  );

  const buildInner = (<>
              <Row label="Ширина, м"><NumIn value={field.w} min={5} max={1000} step={1} onChange={(v) => setField((f) => ({ ...f, w: v }))} /></Row>
              <Row label="Длина, м"><NumIn value={field.h} min={5} max={1000} step={1} onChange={(v) => setField((f) => ({ ...f, h: v }))} /></Row>
              <Row label="Сетка, м"><Select value={field.grid} onChange={(v) => setField((f) => ({ ...f, grid: +v }))} options={[[1, "1"], [2, "2"], [2.5, "2.5"], [5, "5"], [10, "10"], [20, "20"], [25, "25"], [50, "50"]]} /></Row>
              <Row label="Привязка"><Select value={snap} onChange={(v) => setSnap(+v)} options={[[0.1, "0.1 м"], [0.5, "0.5 м"], [1, "1 м"], [2, "2 м"]]} /></Row>
              <Row label="Ярусов"><Select value={tiers} onChange={(v) => setTiers(+v)} options={[[1, "1 (0.8 м)"], [2, "2 (1.6 м)"], [3, "3 (2.4 м)"]]} /></Row>
              <Check checked={showGrid} onChange={setShowGrid}>Сетка</Check>
  </>);

  const bgInner = bg ? (<>
                <div style={{ fontSize: fs(10.5), opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bg.name}</div>
                <BgSlider label="Прозрачность" unit="%" value={Math.round(bg.opacity * 100)} min={0} max={100} step={2}
                  onChange={(v) => setBg((b) => ({ ...b, opacity: v / 100 }))} />
                <BgSlider label="Ширина" unit=" м" value={bg.w} min={0.2} max={20000} step={0.5} free minClamp={0.05}
                  onChange={(v) => setBg((b) => ({ ...b, w: v }))}
                  extra={<div style={{ display: "flex", gap: 3 }}>
                    <ChromeButton style={{ flex: 1, padding: "0 4px", fontSize: fs(10.5) }} onClick={() => setBg((b) => ({ ...b, w: Math.max(0.05, Math.round(b.w * 50) / 100) }))}>÷2</ChromeButton>
                    <ChromeButton style={{ flex: 1, padding: "0 4px", fontSize: fs(10.5) }} onClick={() => setBg((b) => ({ ...b, w: Math.round(b.w * 200) / 100 }))}>×2</ChromeButton>
                    <ChromeButton style={{ flex: 1, padding: "0 4px", fontSize: fs(10.5) }} onClick={() => setBg((b) => ({ ...b, w: field.w }))}>= поле</ChromeButton>
                  </div>} />
                <BgSlider label="Поворот" unit="°" value={bgRot} min={0} max={360} step={0.5} wrap
                  onChange={(v) => setBg((b) => ({ ...b, rot: v }))}
                  extra={<div style={{ display: "flex", gap: 3 }}>
                    {[0, 90, 180, 270].map((a) => (
                      <ChromeButton key={a} style={{ flex: 1, padding: "0 3px", fontSize: fs(10.5) }} onClick={() => setBg((b) => ({ ...b, rot: a }))}>{a}°</ChromeButton>
                    ))}
                  </div>} />
                <BgSlider label="Смещение X" unit=" м" value={bg.x} min={-(field.w + bg.w)} max={field.w + bg.w} step={1} free
                  onChange={(v) => setBg((b) => ({ ...b, x: v }))} />
                <BgSlider label="Смещение Y" unit=" м" value={bg.y} min={-(field.h + bgH)} max={field.h + bgH} step={1} free
                  onChange={(v) => setBg((b) => ({ ...b, y: v }))} />
                <Check checked={!!bg.locked} onChange={(v) => setBg((b) => ({ ...b, locked: v }))}>Закрепить</Check>
                <Check checked={!!bg.visible} onChange={(v) => setBg((b) => ({ ...b, visible: v }))}>Показывать</Check>
                {compact && !bg.locked && (
                  <Check checked={bgFinger} onChange={setBgFinger}>Двигать подложку пальцем</Check>
                )}
                <ChromeButton onClick={() => { pushHistory(); setBg(null); }}>Убрать подложку</ChromeButton>
  </>) : null;

  const assetGrid = (cols) => (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: compact ? 6 : 4, padding: compact ? 0 : 5 }}>
            {Object.keys(ASSETS).map((k) => {
              const isTool = k === "wallH" || k === "wallV";
              const active = isTool ? tool === k : tool === "place" && asset === k;
              return (
                <button key={k} type="button" title={ASSETS[k].name}
                  onClick={() => {
                    if (isTool) setTool(k); else { setAsset(k); setTool("place"); }
                    if (compact) {
                      setSheet(null);
                      setStatus(isTool ? "Проведите пальцем по карте — появится стена" : `Выбрано для установки: ${ASSETS[k].name}`);
                    }
                  }}
                  style={{ background: active ? "#C0CBE0" : "#F2F0E8", padding: compact ? "6px 3px" : 3, cursor: "pointer", touchAction: "manipulation", ...ui, border: active ? `2px solid ${C.sel}` : `2px solid ${C.chromeDk}` }}>
                  <AssetThumb t={k} />
                  <div style={{ fontSize: fs(10), textAlign: "center", marginTop: 1 }}>{ASSETS[k].name}</div>
                </button>
              );
            })}
          </div>
  );

  const propsInner = (
            sel ? (<>
              <Row label="Объект"><Static>{(ASSETS[sel.t] && ASSETS[sel.t].name) || sel.t}</Static></Row>
              <Row label="X, м"><NumIn value={sel.x} step={snap} onChange={(v) => updateSel({ x: v })} /></Row>
              <Row label="Y, м"><NumIn value={sel.y} step={snap} onChange={(v) => updateSel({ y: v })} /></Row>
              {sel.l != null && <Row label="Длина, м"><NumIn value={sel.l} min={0.5} step={snap} onChange={(v) => updateSel({ l: v })} /></Row>}
              {sel.tiers != null && <Row label="Ярусов"><Select value={sel.tiers} onChange={(v) => updateSel({ tiers: +v })} options={[[1, "1"], [2, "2"], [3, "3"]]} /></Row>}
              {sel.l != null && <Row label="Тюков"><Static>{baleCount(sel.l, sel.tiers)}</Static></Row>}
              <ChromeButton onClick={deleteSelected}>Удалить объект</ChromeButton>
            </>) : zsel ? (<>
              <div style={{ fontSize: fs(11.5) }}>Название зоны</div>
              <input value={zsel.n} onChange={(e) => updateZone(zsel.id, { n: e.target.value })}
                style={{ width: "100%", background: "#fff", border: "1px solid #9A9684", padding: "2px 5px", font: `${fs(12)}px Tahoma, sans-serif` }} />
              <div style={{ fontSize: fs(11.5), marginTop: 2 }}>Тип</div>
              <select value={zsel.k} onChange={(e) => updateZone(zsel.id, { k: e.target.value })}
                style={{ width: "100%", background: "#fff", border: "1px solid #9A9684", font: `${fs(12)}px Tahoma, sans-serif` }}>
                {Object.keys(ZONE_KINDS).map((k) => <option key={k} value={k}>{ZONE_KINDS[k].label}</option>)}
              </select>
              {zsel.k === "custom" && (
                <Row label="Цвет">
                  <input type="color" value={zsel.fill || ZONE_KINDS.custom.fill} onChange={(e) => updateZone(zsel.id, { fill: e.target.value })}
                    style={{ width: compact ? 96 : 66, height: compact ? 36 : 22, padding: 0, border: "1px solid #9A9684" }} />
                </Row>
              )}
              <Row label="X, м"><NumIn value={zsel.x} step={snap} onChange={(v) => updateZone(zsel.id, { x: v })} /></Row>
              <Row label="Y, м"><NumIn value={zsel.y} step={snap} onChange={(v) => updateZone(zsel.id, { y: v })} /></Row>
              <Row label="Ширина, м"><NumIn value={zsel.w} min={0.5} step={snap} onChange={(v) => updateZone(zsel.id, { w: v })} /></Row>
              <Row label="Высота, м"><NumIn value={zsel.h} min={0.5} step={snap} onChange={(v) => updateZone(zsel.id, { h: v })} /></Row>
              <ChromeButton onClick={deleteSelected}>Удалить зону</ChromeButton>
            </>) : (
              <div style={{ fontSize: fs(11), opacity: 0.7 }}>{compact ? "Ничего не выбрано. Возьмите «Выбор» и коснитесь объекта или зоны на карте." : "Ничего не выбрано. Возьмите «Выделить и двигать» и щёлкните по объекту или зоне."}</div>
            )
  );

  const legendInner = (<>
            <LegendRow label="Стена из тюков"><svg width="34" height="16" viewBox="0 0 34 16"><rect x="1" y="3" width="32" height="10" fill={C.hayFill} stroke={C.hayEdge} /><path d="M3 6h28M3 8.5h28M3 11h28" stroke={C.hayLine} /></svg></LegendRow>
            <LegendRow label="Колонна из тюков"><svg width="34" height="16" viewBox="0 0 34 16"><rect x="11" y="2" width="12" height="12" fill={C.hayFill} stroke={C.hayEdge} /><path d="M13 5h8M13 8h8M13 11h8" stroke={C.hayLine} /></svg></LegendRow>
            <LegendRow label="Проход / дверь"><svg width="34" height="16" viewBox="0 0 34 16"><path d="M4 3v10M30 3v10" stroke="#111" strokeWidth="1.4" /><path d="M8 8h18M8 8l3-2.5M8 8l3 2.5M26 8l-3-2.5M26 8l-3 2.5" stroke="#111" fill="none" /></svg></LegendRow>
            {Object.keys(ZONE_KINDS).map((k) => (
              <LegendRow key={k} label={ZONE_KINDS[k].label}><span style={{ display: "block", width: 34, height: 14, background: ZONE_KINDS[k].fill, border: `1px solid ${ZONE_KINDS[k].stroke}` }} /></LegendRow>
            ))}
            <LegendRow label="Поддон / ящик"><svg width="34" height="16" viewBox="0 0 34 16"><rect x="5" y="2" width="24" height="12" fill={C.wood} stroke="#5C3E1B" /><path d="M5 6h24M5 10h24" stroke={C.woodLine} /></svg></LegendRow>
            <LegendRow label="Покрышки"><svg width="34" height="16" viewBox="0 0 34 16"><circle cx="17" cy="8" r="6.5" fill={C.rubber} /><circle cx="17" cy="8" r="2.6" fill="#70707A" /></svg></LegendRow>
            <LegendRow label="Бочка"><svg width="34" height="16" viewBox="0 0 34 16"><circle cx="17" cy="8" r="6" fill={C.steel} stroke="#111" /><circle cx="17" cy="8" r="3" fill="none" stroke="#93939A" /></svg></LegendRow>
            <LegendRow label="Игрок, 1.8 м"><svg width="34" height="16" viewBox="0 0 34 16"><circle cx="17" cy="5" r="3" fill={C.teamA} stroke="#111" /><path d="M17 8c-3.4 0-5 2.4-5 5.5h10C22 10.4 20.4 8 17 8z" fill={C.teamA} stroke="#111" /></svg></LegendRow>
  </>);

  const baleTable = (
            <table style={{ width: "100%", borderCollapse: "collapse", font: `${fs(11.5)}px Tahoma, sans-serif` }}>
              <thead><tr style={{ background: "#EDEBE2" }}>
                <Th>Тип секции</Th><Th right>Секций</Th><Th right>Ярусов</Th><Th right>Тюков в секции</Th><Th right>Всего</Th>
              </tr></thead>
              <tbody>
                {stats.rows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? "#F7F6F1" : "#fff" }}>
                    <Td>Стена {r.len} м</Td><Td right>{r.n}</Td><Td right>{r.tiers}</Td><Td right>{r.per}</Td><Td right><b>{r.total}</b></Td>
                  </tr>
                ))}
                {stats.colBales > 0 && <tr style={{ background: "#F7F6F1" }}><Td>Колонны</Td><Td right>{stats.columns.length}</Td><Td right>—</Td><Td right>—</Td><Td right><b>{stats.colBales}</b></Td></tr>}
                {stats.stackBales > 0 && <tr><Td>Штабели</Td><Td right>{stats.stacks.length}</Td><Td right>—</Td><Td right>—</Td><Td right><b>{stats.stackBales}</b></Td></tr>}
                <tr style={{ background: "#DDE6D6", borderTop: `2px solid ${C.chromeLo}` }}>
                  <Td><b>Итого</b></Td><Td right><b>{stats.walls.length}</b></Td><Td right>—</Td><Td right>—</Td><Td right><b>{stats.totalBales}</b></Td>
                </tr>
              </tbody>
            </table>
  );

  const dialogs = (<>
      {/* ДИАЛОГИ */}
      {pending && (
        <Modal title="Новая зона" onClose={() => setPending(null)}>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: fs(12) }}>Размер: {r1(pending.w)} × {r1(pending.h)} м</div>
            <div style={{ fontSize: fs(12) }}>Название</div>
            <input autoFocus={!compact} value={pending.n} placeholder={ZONE_KINDS[pending.k].label}
              onChange={(e) => setPending((p) => ({ ...p, n: e.target.value }))}
              style={{ background: "#fff", border: "1px solid #9A9684", padding: "3px 6px", font: `${fs(12)}px Tahoma, sans-serif` }} />
            <div style={{ fontSize: fs(12) }}>Тип зоны</div>
            <div style={{ display: "grid", gridTemplateColumns: compact && vp.w < 380 ? "1fr" : "1fr 1fr", gap: compact ? 5 : 3 }}>
              {Object.keys(ZONE_KINDS).map((k) => (
                <button key={k} type="button" onClick={() => setPending((p) => ({ ...p, k }))}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: compact ? "9px 6px" : "3px 5px", cursor: "pointer",
                    font: `${fs(11.5)}px Tahoma, sans-serif`, background: pending.k === k ? "#C0CBE0" : "#F2F0E8",
                    border: pending.k === k ? `2px solid ${C.sel}` : `2px solid ${C.chromeDk}`, textAlign: "left",
                  }}>
                  <span style={{ width: 18, height: 12, background: ZONE_KINDS[k].fill, border: `1px solid ${ZONE_KINDS[k].stroke}`, flexShrink: 0 }} />
                  {ZONE_KINDS[k].label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
              <ChromeButton onClick={() => setPending(null)}>Отмена</ChromeButton>
              <ChromeButton onClick={() => {
                const id = uid("z");
                const name = pending.n.trim() || ZONE_KINDS[pending.k].label;
                setZones((m) => ({ ...m, [id]: { id, k: pending.k, n: name, x: pending.x, y: pending.y, w: pending.w, h: pending.h, score: 0 } }));
                setSelZone(id); setSelected(null); setPending(null);
                setStatus(`Зона «${name}» создана`);
              }}>Создать зону</ChromeButton>
            </div>
          </div>
        </Modal>
      )}

      {dialog === "library" && (
        <Modal title="Мои карты" onClose={() => setDialog(null)} width={480}>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input value={mapName} onChange={(e) => setMapName(e.target.value)} placeholder="Название карты"
                style={{ flex: 1, background: "#fff", border: "1px solid #9A9684", padding: "3px 6px", font: `${fs(12)}px Tahoma, sans-serif` }} />
              <ChromeButton onClick={() => saveToLibrary(mapName)}>Сохранить</ChromeButton>
            </div>
            {library.length === 0 ? (
              <div style={{ fontSize: fs(11.5), opacity: 0.75, padding: "6px 0" }}>
                Сохранённых карт пока нет. Впишите название и нажмите «Сохранить» — карта останется в этом браузере.
              </div>
            ) : (
              compact ? (
                <div style={{ display: "grid", gap: 6 }}>
                  {library.map((m) => (
                    <Bevel key={m.key} out={false} style={{ background: "#fff", padding: 8, display: "grid", gap: 6 }}>
                      <div style={{ fontWeight: "bold", overflowWrap: "anywhere" }}>{m.name}</div>
                      <div style={{ fontSize: 12.5, opacity: 0.7 }}>{m.at ? new Date(m.at).toLocaleString("ru-RU") : ""} · {Math.round(m.size / 1024)} КБ</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ChromeButton style={{ flex: 1 }} onClick={() => loadFromLibrary(m.key)}>Открыть</ChromeButton>
                        <ChromeButton style={{ flex: 1 }} onClick={() => deleteFromLibrary(m.key, m.name)}>Удалить</ChromeButton>
                      </div>
                    </Bevel>
                  ))}
                </div>
              ) : (
              <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${C.chromeLo}`, background: "#fff" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", font: `${fs(11.5)}px Tahoma, sans-serif` }}>
                    <tbody>
                      {library.map((m, i) => (
                        <tr key={m.key} style={{ background: i % 2 ? "#F7F6F1" : "#fff" }}>
                          <Td>{m.name}</Td>
                          <Td>{m.at ? new Date(m.at).toLocaleString("ru-RU") : ""}</Td>
                          <Td right>{Math.round(m.size / 1024)} КБ</Td>
                          <Td right><span style={{ display: "inline-flex", gap: 4 }}>
                            <ChromeButton style={{ padding: "1px 7px" }} onClick={() => loadFromLibrary(m.key)}>Открыть</ChromeButton>
                            <ChromeButton style={{ padding: "1px 7px" }} onClick={() => deleteFromLibrary(m.key, m.name)}>Удалить</ChromeButton>
                          </span></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
            <div style={{ fontSize: fs(11), opacity: 0.75, lineHeight: 1.5 }}>
              Карты лежат в этом браузере на этом устройстве. Друзья своих карт здесь не увидят — чтобы передать карту,
              сделайте ссылку через {compact ? "«Меню → Ссылка для друзей»" : "«Файл → Ссылка для друзей»"} или сохраните файлом JSON.
              Очистка данных сайта в браузере удалит список.
            </div>
          </div>
        </Modal>
      )}

      {dialog === "shared" && (
        <Modal title="Общие карты с сайта" onClose={() => setDialog(null)} width={490}>
          <div style={{ display: "grid", gap: 9 }}>
            {shared.state === "loading" && <div style={{ fontSize: fs(12) }}>Читаю папку maps…</div>}
            {shared.state === "err" && (
              <div style={{ fontSize: fs(11.5), lineHeight: 1.6 }}>
                Список не загрузился: {shared.err}.<br />
                Такое бывает, если приложение открыто файлом с диска, а не по ссылке сайта,
                либо папки maps в репозитории ещё нет.
              </div>
            )}
            {shared.state === "ok" && shared.list.length === 0 && (
              <div style={{ fontSize: fs(11.5) }}>Папка maps пустая. Положите туда файлы карт .json.</div>
            )}
            {shared.state === "ok" && shared.list.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: "auto", border: `1px solid ${C.chromeLo}`, background: "#fff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", font: `${fs(11.5)}px Tahoma, sans-serif` }}>
                  <tbody>
                    {shared.list.map((m, i) => (
                      <tr key={m.url} style={{ background: i % 2 ? "#F7F6F1" : "#fff" }}>
                        <Td>{m.name}{m.author ? <span style={{ opacity: 0.6 }}> · {m.author}</span> : null}</Td>
                        <Td right>{m.size ? Math.round(m.size / 1024) + " КБ" : ""}</Td>
                        <Td right><ChromeButton style={{ padding: "1px 7px" }} onClick={() => loadShared(m)}>Открыть</ChromeButton></Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {shared.state === "ok" && shared.err && <div style={{ fontSize: fs(11.5), color: "#9A2A2A" }}>{shared.err}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: fs(11), opacity: 0.75 }}>Карты лежат в папке maps репозитория сайта.</span>
              <ChromeButton onClick={openShared}>Обновить</ChromeButton>
            </div>
          </div>
        </Modal>
      )}

      {dialog === "share" && (
        <Modal title="Ссылка для друзей" onClose={() => setDialog(null)} width={470}>
          <div style={{ display: "grid", gap: 9, fontSize: fs(12) }}>
            {shareUrl ? (<>
              <div>Вся карта упакована внутрь адреса. Кто откроет ссылку, увидит эту планировку.</div>
              <textarea readOnly value={shareUrl} rows={5} onFocus={(e) => e.target.select()}
                style={{ width: "100%", font: "11px Consolas, monospace", border: "1px solid #9A9684", padding: 5, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: fs(11), opacity: 0.75 }}>{shareNote}</span>
                {typeof navigator !== "undefined" && navigator.share && (
                  <ChromeButton onClick={() => {
                    navigator.share({ title: `CQB СЕЛО — ${mapName}`, url: shareUrl }).catch(() => {});
                  }}>Поделиться…</ChromeButton>
                )}
                <ChromeButton onClick={() => {
                  if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).then(
                    () => setShareNote("Ссылка скопирована"), () => setShareNote("Скопируйте вручную: выделите текст выше"));
                  else setShareNote("Скопируйте вручную: выделите текст выше");
                }}>Скопировать</ChromeButton>
              </div>
            </>) : (
              <div>{shareNote || "Собираю ссылку…"}</div>
            )}
          </div>
        </Modal>
      )}

      {dialog === "zonekind" && (
        <Modal title="Тип зоны для рисования" onClose={() => setDialog(null)} width={340}>
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: fs(11.5), opacity: 0.8, marginBottom: 4 }}>Выберите тип, затем протяните рамку на карте. Название спросим после.</div>
            {Object.keys(ZONE_KINDS).map((k) => (
              <button key={k} type="button" onClick={() => { setZoneKind(k); setDialog(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: compact ? "10px 8px" : "5px 7px", cursor: "pointer",
                  font: `${fs(12)}px Tahoma, sans-serif`, background: zoneKind === k ? "#C0CBE0" : "#F2F0E8",
                  border: zoneKind === k ? `2px solid ${C.sel}` : `2px solid ${C.chromeDk}`, textAlign: "left",
                }}>
                <span style={{ width: 26, height: 15, background: ZONE_KINDS[k].fill, border: `1px solid ${ZONE_KINDS[k].stroke}` }} />
                {ZONE_KINDS[k].label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {dialog === "bg" && bg && (
        <Modal title="Подложка" onClose={() => setDialog(null)} width={400}>
          <div style={{ display: "grid", gap: 8, fontSize: fs(12) }}>
            <div style={{ opacity: 0.8 }}>{bg.name}</div>
            <BgSlider label="Прозрачность" unit="%" value={Math.round(bg.opacity * 100)} min={0} max={100} step={2}
              onChange={(v) => setBg((b) => ({ ...b, opacity: v / 100 }))} />
            <BgSlider label="Ширина картинки" unit=" м" value={bg.w} min={0.2} max={20000} step={0.5} free minClamp={0.05}
              onChange={(v) => setBg((b) => ({ ...b, w: v }))}
              extra={<div style={{ display: "flex", gap: 4 }}>
                <ChromeButton style={{ flex: 1, padding: "0 5px", fontSize: fs(11) }} onClick={() => setBg((b) => ({ ...b, w: Math.max(0.05, Math.round(b.w * 25) / 100) }))}>÷4</ChromeButton>
                <ChromeButton style={{ flex: 1, padding: "0 5px", fontSize: fs(11) }} onClick={() => setBg((b) => ({ ...b, w: Math.max(0.05, Math.round(b.w * 50) / 100) }))}>÷2</ChromeButton>
                <ChromeButton style={{ flex: 1, padding: "0 5px", fontSize: fs(11) }} onClick={() => setBg((b) => ({ ...b, w: Math.round(b.w * 200) / 100 }))}>×2</ChromeButton>
                <ChromeButton style={{ flex: 1, padding: "0 5px", fontSize: fs(11) }} onClick={() => setBg((b) => ({ ...b, w: Math.round(b.w * 400) / 100 }))}>×4</ChromeButton>
              </div>} />
            <BgSlider label="Поворот" unit="°" value={bgRot} min={0} max={360} step={0.5} wrap
              onChange={(v) => setBg((b) => ({ ...b, rot: v }))}
              extra={<div style={{ display: "flex", gap: 4, flexWrap: compact ? "wrap" : "nowrap" }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                  <ChromeButton key={a} style={{ flex: compact ? "1 0 60px" : 1, padding: "0 3px", fontSize: fs(10.5) }} onClick={() => setBg((b) => ({ ...b, rot: a }))}>{a}</ChromeButton>
                ))}
              </div>} />
            <BgSlider label="Смещение X" unit=" м" value={bg.x} min={-(field.w + bg.w)} max={field.w + bg.w} step={1} free
              onChange={(v) => setBg((b) => ({ ...b, x: v }))} />
            <BgSlider label="Смещение Y" unit=" м" value={bg.y} min={-(field.h + bgH)} max={field.h + bgH} step={1} free
              onChange={(v) => setBg((b) => ({ ...b, y: v }))} />
            <Check checked={!!bg.locked} onChange={(v) => setBg((b) => ({ ...b, locked: v }))}>
              {compact ? "Закрепить" : "Закрепить (иначе двигается мышью инструментом «Выделить»)"}
            </Check>
            {compact && !bg.locked && (
              <Check checked={bgFinger} onChange={setBgFinger}>Двигать подложку пальцем по карте</Check>
            )}
            <div style={{ fontSize: fs(11), opacity: 0.75 }}>
              Как совместить: подберите ширину так, чтобы известный объект на снимке совпал по длине с сеткой, поворотом разверните снимок по осям поля, затем сдвиньте картинку. Мелкая сетка — 1 м. Ширина не ограничена сверху: ползунок логарифмический, точное число можно вписать руками, кнопки ×2 и ÷2 меняют масштаб скачком.
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
              <ChromeButton onClick={() => setBg((b) => ({ ...b, x: 0, y: 0, w: field.w }))}>Вписать в поле</ChromeButton>
              <ChromeButton onClick={() => setDialog(null)}>Готово</ChromeButton>
            </div>
          </div>
        </Modal>
      )}

      {dialog === "field" && (
        <Modal title="Размер поля и сетка" onClose={() => setDialog(null)} width={320}>
          <div style={{ display: "grid", gap: 8 }}>
            <Row label="Ширина поля, м"><NumIn value={field.w} min={5} max={1000} step={1} onChange={(v) => setField((f) => ({ ...f, w: v }))} /></Row>
            <Row label="Длина поля, м"><NumIn value={field.h} min={5} max={1000} step={1} onChange={(v) => setField((f) => ({ ...f, h: v }))} /></Row>
            <Row label="Шаг сетки, м"><Select value={field.grid} onChange={(v) => setField((f) => ({ ...f, grid: +v }))} options={[[1, "1"], [2, "2"], [2.5, "2.5"], [5, "5"], [10, "10"], [20, "20"], [25, "25"], [50, "50"]]} /></Row>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <ChromeButton onClick={() => { fitView(); setDialog(null); }}>Готово</ChromeButton>
            </div>
          </div>
        </Modal>
      )}

      {dialog === "price" && (
        <Modal title="Цена тюка" onClose={() => setDialog(null)} width={330}>
          <div style={{ display: "grid", gap: 8, fontSize: fs(12) }}>
            <Row label="Цена одного тюка, ₽"><NumIn value={price} min={0} step={10} onChange={setPrice} width={90} /></Row>
            <div>Тюков в проекте: <b>{stats.totalBales}</b></div>
            <div>Смета: <b>{(stats.totalBales * price).toLocaleString("ru-RU")} ₽</b></div>
            <div style={{ fontSize: fs(11), opacity: 0.75 }}>Цена относится к тюку {BALE_L} × {BALE_T} м. Поддоны, покрышки и бочки в смету не входят — их количество показано под таблицей.</div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><ChromeButton onClick={() => setDialog(null)}>Готово</ChromeButton></div>
          </div>
        </Modal>
      )}

      {dialog === "keys" && compact && (
        <Modal title="Управление пальцами" onClose={() => setDialog(null)} width={420}>
          <div style={{ display: "grid", gap: 8 }}>
            {[["Два пальца", "Приблизить, отдалить и сдвинуть карту — с любым инструментом"],
              ["Палец по пустому месту", "Сдвинуть карту (инструмент «Выбор» или «Панорама»)"],
              ["Касание объекта", "Выделить. Тяните — объект поедет за пальцем"],
              ["Касание зоны", "Выделить. Уже выбранную зону можно тянуть"],
              ["Стена Г / Стена В / Зона", "Проведите пальцем по карте"],
              ["Объект / Удалить", "Коснитесь нужного места на карте"],
              ["Кнопка ↶ вверху", "Отменить последнее действие"]].map(([k, v]) => (
              <div key={k} style={{ display: "grid", gap: 1, borderBottom: "1px solid #CFCBBE", paddingBottom: 6 }}>
                <b>{k}</b><span style={{ opacity: 0.85 }}>{v}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {dialog === "keys" && !compact && (
        <Modal title="Горячие клавиши" onClose={() => setDialog(null)} width={370}>
          <table style={{ width: "100%", font: `${fs(12)}px Tahoma, sans-serif`, borderCollapse: "collapse" }}>
            <tbody>
              {[["H", "Горизонтальная стена"], ["V", "Вертикальная стена"], ["Пробел", "Панорама"],
                ["Shift + тяга", "Панорама из любого инструмента"], ["Правая кнопка", "Панорама"],
                ["Колесо", "Зум к курсору"], ["Del", "Удалить выбранное"], ["Ctrl + Z", "Отменить"],
                ["Esc", "Сбросить инструмент"]].map(([k, v]) => (
                <tr key={k}><td style={{ padding: "3px 10px 3px 0", whiteSpace: "nowrap" }}><b>{k}</b></td><td style={{ padding: "3px 0" }}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {dialog === "about" && (
        <Modal title="О программе" onClose={() => setDialog(null)} width={380}>
          <div style={{ fontSize: fs(12), display: "grid", gap: 7 }}>
            <div style={{ font: `bold ${fs(16)}px Tahoma, sans-serif` }}>CQB СЕЛО · планировщик поля v1.3</div>
            <div>Планировка CQB-полигона из тюков сена с расчётом количества тюков и сметы.</div>
            <div>Тюк {BALE_L} × {BALE_T} м. Все координаты в метрах, сетка метрическая.</div>
            <div>Поле до 1000 м. Подложка тянется без верхнего предела и крутится на любой угол 0…360°.</div>
            <div style={{ opacity: 0.75 }}>Карты сохраняются в JSON на ваш компьютер. Ничего никуда не отправляется, работает без интернета.</div>
            <div style={{ opacity: 0.75 }}>На телефоне панели открываются кнопками внизу экрана, карта двигается и масштабируется пальцами.</div>
          </div>
        </Modal>
      )}
      {dialog === "menu" && (
        <Modal title="Меню" onClose={() => setDialog(null)} width={440}>
          <div style={{ display: "grid", gap: 10 }}>
            {MENUS.map((m) => (
              <div key={m.label}>
                <PanelTitle>{m.label}</PanelTitle>
                <Bevel out={false} style={{ background: "#F2F0E8", display: "grid" }}>
                  {m.items.filter((it) => it !== "-").map((it, i) => {
                    const info = it.disabled && !it.fn;
                    const hint = it.key && !/^(Ctrl|Del|Esc)/.test(it.key) ? it.key : "";
                    return (
                      <button key={i} type="button" disabled={it.disabled}
                        onClick={() => { setDialog(null); if (it.fn) it.fn(); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                          minHeight: 44, padding: "8px 12px", background: "transparent", border: "none",
                          borderTop: i ? "1px solid #DDD9CC" : "none", textAlign: "left", cursor: it.disabled ? "default" : "pointer",
                          font: `${info ? "bold " : ""}15px Tahoma, sans-serif`, color: it.disabled && !info ? "#8C8878" : C.ink,
                          touchAction: "manipulation",
                        }}>
                        <span>{it.on != null ? (it.on ? "☑ " : "☐ ") : ""}{it.label}</span>
                        {hint ? <span style={{ opacity: 0.55, fontSize: 13 }}>{hint}</span> : null}
                      </button>
                    );
                  })}
                </Bevel>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {dialog === "legend" && (
        <Modal title="Легенда" onClose={() => setDialog(null)} width={380}>
          <div style={{ display: "grid", gap: 7 }}>{legendInner}</div>
        </Modal>
      )}
  </>);

  /* ======================= ТЕЛЕФОННАЯ РАСКЛАДКА =======================
     Сверху — меню, название и «отменить / вписать». Почти весь экран —
     карта. Снизу — инструменты и вкладки панелей; панель выезжает
     листом поверх карты (снизу в портрете, справа в альбомной ориентации),
     так размер карты не меняется и масштаб не сбрасывается. */
  if (compact) {
    const landscape = vp.w > vp.h && vp.w >= 600;
    const oneRow = vp.w >= 640;
    /* narrow — самые узкие телефоны (320–369 px): подписи короче и мельче,
       чтобы все семь инструментов влезли без прокрутки.
       low — низкий экран в альбомной ориентации: ужимаем верх и низ. */
    const narrow = vp.w < 370;
    const low = vp.h < 430;
    const barH = low ? 46 : 54;
    const SHORT = { select: "Выбор", wallH: "Стена Г", wallV: "Стена В", place: "Объект", pan: narrow ? "Сдвиг" : "Панорама", zone: "Зона", delete: "Удалить" };
    const SHEETS = [["objects", "Объекты"], ["props", "Свойства"], ["field", "Поле"], ["calc", "Расчёт"], ["zones", "Зоны"]];
    const SHEET_TITLE = { objects: "Библиотека объектов", props: "Свойства", field: "Поле и подложка", calc: "Расчёт тюков и смета", zones: "Зоны и счёт" };
    const bevelBtn = (on) => ({
      borderTop: `2px solid ${on ? C.chromeLo : C.chromeHi}`, borderLeft: `2px solid ${on ? C.chromeLo : C.chromeHi}`,
      borderBottom: `2px solid ${on ? C.chromeHi : C.chromeLo}`, borderRight: `2px solid ${on ? C.chromeHi : C.chromeLo}`,
    });
    const pickTool = (k) => {
      setTool(k);
      if (k === "zone") setDialog("zonekind");
      setSheet(k === "place" ? "objects" : null);
    };
    const toggleSheet = (k) => setSheet((cur) => (cur === k ? null : k));

    const selText = sel
      ? `${(ASSETS[sel.t] && ASSETS[sel.t].name) || sel.t}${sel.l != null ? ` · ${r1(sel.l)} м · ${baleCount(sel.l, sel.tiers)} тюк.` : ""}`
      : zsel ? `Зона «${zsel.n}» · ${r1(zsel.w)} × ${r1(zsel.h)} м` : "";

    let hint = "";
    if (ghost && ghost.kind === "draw") {
      const len = Math.abs(ghost.dir === "wallH" ? ghost.x1 - ghost.x0 : ghost.y1 - ghost.y0);
      hint = `Стена ${r1(len)} м · ${baleCount(len, tiers)} тюк.`;
    } else if (ghost && ghost.kind === "zone") {
      hint = `Зона ${r1(Math.abs(ghost.x1 - ghost.x0))} × ${r1(Math.abs(ghost.y1 - ghost.y0))} м`;
    } else if (tool === "wallH") hint = "Проведите пальцем по карте — горизонтальная стена";
    else if (tool === "wallV") hint = "Проведите пальцем по карте — вертикальная стена";
    else if (tool === "place") hint = `Коснитесь карты — поставить «${ASSETS[asset].name}»`;
    else if (tool === "zone") hint = `Протяните рамку: ${ZONE_KINDS[zoneKind].label}`;
    else if (tool === "delete") hint = "Коснитесь объекта или зоны, чтобы удалить";
    else if (tool === "pan") hint = "Тяните карту пальцем, двумя — зум";

    const chip = {
      display: "flex", alignItems: "center", gap: 6, maxWidth: "100%", minWidth: 0,
      background: "rgba(255,255,255,.94)", border: `1px solid ${C.chromeLo}`, boxShadow: "2px 2px 0 rgba(0,0,0,.18)",
      padding: "4px 6px 4px 9px", fontSize: 13.5, pointerEvents: "auto",
    };

    const sheetBody = sheet === "objects" ? (
      <div style={{ display: "grid", gap: 8 }}>
        {assetGrid(vp.w < 400 ? 3 : 4)}
        <div style={{ fontSize: 12.5, opacity: 0.75 }}>
          Выберите объект — лист закроется, и объект встанет туда, куда вы коснётесь. Стены рисуются протяжкой пальца.
          Ярусы новых стен и колонн задаются во вкладке «Поле».
        </div>
      </div>
    ) : sheet === "props" ? (
      <Bevel out={false} style={{ padding: 10, background: "#E6E3D8", display: "grid", gap: 8 }}>{propsInner}</Bevel>
    ) : sheet === "field" ? (
      <div style={{ display: "grid", gap: 10 }}>
        <div>
          <PanelTitle>ПОСТРОЕНИЕ</PanelTitle>
          <Bevel out={false} style={{ padding: 10, display: "grid", gap: 8, background: "#E6E3D8" }}>{buildInner}</Bevel>
        </div>
        <div>
          <PanelTitle>ПОДЛОЖКА</PanelTitle>
          <Bevel out={false} style={{ padding: 10, display: "grid", gap: 10, background: "#E6E3D8" }}>
            {bg ? bgInner : (<>
              <div style={{ fontSize: 13.5, opacity: 0.8 }}>Снимок участка или схема под планировку. Картинка остаётся только у вас и в ссылку не входит.</div>
              <ChromeButton onClick={() => imgRef.current && imgRef.current.click()}>Загрузить подложку</ChromeButton>
            </>)}
          </Bevel>
        </div>
      </div>
    ) : sheet === "calc" ? (
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[["Всего тюков", stats.totalBales], ["Длина стен", `${r1(stats.totalLen)} м`],
            ["Смета", `${(stats.totalBales * price).toLocaleString("ru-RU")} ₽`], ["Цена тюка", null]].map(([k, v]) => (
            <Bevel key={k} out={false} style={{ background: "#fff", padding: "7px 9px", display: "grid", gap: 2 }}>
              <span style={{ fontSize: 12.5, opacity: 0.7 }}>{k}</span>
              {v != null ? <b style={{ fontSize: 17 }}>{v}</b> : <span><NumIn value={price} min={0} step={10} onChange={setPrice} width={96} /> ₽</span>}
            </Bevel>
          ))}
        </div>
        <Bevel out={false} style={{ background: "#fff", overflowX: "auto" }}>{baleTable}</Bevel>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Тюк {BALE_L} × {BALE_T} м. Поддонов {stats.crates}, покрышек {stats.tires}, бочек {stats.barrels} — в смету не входят.
        </div>
        <ChromeButton onClick={exportCSV}>Выгрузить расчёт в CSV</ChromeButton>
      </div>
    ) : sheet === "zones" ? (
      <div style={{ display: "grid", gap: 7 }}>
        {Object.values(zones).length === 0 && (
          <div style={{ fontSize: 13.5, opacity: 0.8 }}>Зон пока нет. Возьмите инструмент «Зона» и протяните рамку на карте.</div>
        )}
        {Object.values(zones).map((z) => {
          const occ = zoneOccupancy(z);
          return (
            <Bevel key={z.id} out={false} style={{ background: selZone === z.id ? "#DCE6F5" : "#fff", padding: 8, display: "grid", gap: 7 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ width: 20, height: 16, flexShrink: 0, background: z.fill || ZONE_KINDS[z.k].fill, border: `1px solid ${ZONE_KINDS[z.k].stroke}` }} />
                <input value={z.n} onChange={(e) => updateZone(z.id, { n: e.target.value })}
                  onFocus={() => { setSelZone(z.id); setSelected(null); }}
                  style={{ flex: 1, minWidth: 0, background: "#fff", border: "1px solid #9A9684", padding: "4px 7px", font: "16px Tahoma, sans-serif" }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select value={z.k} onChange={(e) => updateZone(z.id, { k: e.target.value })}
                  style={{ flex: "1 1 150px", minWidth: 0, background: "#fff", border: "1px solid #9A9684", font: "16px Tahoma, sans-serif" }}>
                  {Object.keys(ZONE_KINDS).map((k) => <option key={k} value={k}>{ZONE_KINDS[k].label}</option>)}
                </select>
                <span style={{ fontSize: 14, whiteSpace: "nowrap" }}>
                  A <b style={{ color: C.teamA }}>{occ.a}</b> / B <b style={{ color: C.teamB }}>{occ.b}</b>
                </span>
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 14, marginLeft: "auto" }}>
                  Очки <b style={{ minWidth: 20, textAlign: "center" }}>{z.score}</b>
                  <ChromeButton onClick={() => updateZone(z.id, { score: (z.score || 0) + 1 })}>+</ChromeButton>
                  <ChromeButton onClick={() => updateZone(z.id, { score: Math.max(0, (z.score || 0) - 1) })}>−</ChromeButton>
                </span>
              </div>
            </Bevel>
          );
        })}
        {Object.values(zones).length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14, padding: "4px 2px", flexWrap: "wrap" }}>
            <span>Зон: <b>{Object.keys(zones).length}</b></span>
            <span>Игроков A / B: <b style={{ color: C.teamA }}>{stats.figs.filter((f) => f.t === "figA").length}</b> / <b style={{ color: C.teamB }}>{stats.figs.filter((f) => f.t === "figB").length}</b></span>
            <span>Очков: <b>{Object.values(zones).reduce((s0, z) => s0 + (z.score || 0), 0)}</b></span>
          </div>
        )}
        <div style={{ fontSize: 12.5, opacity: 0.75 }}>A / B — сколько фигурок каждой команды сейчас стоит в зоне.</div>
      </div>
    ) : null;

    const toolButtons = TOOLS.map(([k, label]) => (
      <button key={k} type="button" title={label} aria-label={label} aria-pressed={tool === k}
        onClick={() => pickTool(k)}
        style={{
          flex: narrow ? "1 1 0" : "1 0 50px", minWidth: narrow ? 0 : 50, height: barH, padding: "3px 1px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", touchAction: "manipulation",
          background: tool === k ? "#C0CBE0" : C.chrome, color: C.ink, ...bevelBtn(tool === k),
        }}>
        <ToolIcon kind={k} w={narrow || low ? 24 : 28} h={narrow || low ? 20 : 24} />
        <span style={{ font: `${narrow ? 9.5 : 10.5}px/1 Tahoma, sans-serif`, whiteSpace: "nowrap" }}>{SHORT[k]}</span>
      </button>
    ));
    const tabButtons = SHEETS.map(([k, label]) => (
      <button key={k} type="button" aria-pressed={sheet === k}
        onClick={() => toggleSheet(k)}
        style={{
          flex: oneRow ? "1 0 70px" : 1, minWidth: 0, height: oneRow ? barH : 42, padding: narrow ? 0 : "0 2px", cursor: "pointer", touchAction: "manipulation",
          background: sheet === k ? "#C4BFAE" : C.chrome, color: C.ink, font: `${narrow ? 11.5 : 13}px Tahoma, sans-serif`, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis", ...bevelBtn(sheet === k),
        }}>
        {label}{k === "props" && (sel || zsel) ? " •" : ""}
      </button>
    ));

    return (
      <CompactCtx.Provider value={true}>
        <div style={{
          ...ui, fontSize: 14, background: C.chrome, width: "100%", height: "100%", overflow: "hidden",
          display: "flex", flexDirection: "column", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
          paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)",
        }}>
          {hiddenInputs}

          {/* ВЕРХ */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: low ? "2px 6px" : "5px 6px", paddingTop: `calc(${low ? 2 : 5}px + env(safe-area-inset-top))`,
            borderBottom: `2px solid ${C.chromeLo}`, background: "#DFDBCD", flexShrink: 0,
          }}>
            <ChromeButton onClick={() => setDialog("menu")} title="Меню">☰ Меню</ChromeButton>
            <svg width="34" height="25" viewBox="0 0 46 34" style={{ flexShrink: 0 }} aria-hidden="true">
              <rect x="2" y="12" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
              <rect x="2" y="21" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
              <rect x="8" y="4" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
              <circle cx="36" cy="20" r="9" fill="#2A2A2C" />
              <circle cx="32.5" cy="18" r="2.6" fill="#DDD" /><circle cx="39.5" cy="18" r="2.6" fill="#DDD" />
            </svg>
            <div style={{ lineHeight: 1.1, minWidth: 0, flex: 1 }}>
              <div style={{ font: "bold 15px Tahoma, sans-serif", letterSpacing: ".03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                CQB СЕЛО{low ? <span style={{ fontWeight: "normal", opacity: 0.75 }}> · {mapName}</span> : null}
              </div>
              {!low && <div style={{ font: "11.5px Tahoma, sans-serif", opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mapName}</div>}
            </div>
            <ChromeButton onClick={undo} disabled={!history.length} title="Отменить" style={{ padding: "4px 8px" }}>
              <svg width="20" height="18" viewBox="0 0 20 18" aria-label="Отменить" style={{ display: "block", margin: "0 auto" }}>
                <path d="M7 3L2 8l5 5" fill="none" stroke={history.length ? "#1A1A18" : "#8C8878"} strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M3 8h9a5 5 0 010 10h-3" fill="none" stroke={history.length ? "#1A1A18" : "#8C8878"} strokeWidth="2.2" />
              </svg>
            </ChromeButton>
            <ChromeButton onClick={fitView} title="Вписать поле в экран" style={{ padding: "4px 8px" }}>
              <svg width="20" height="18" viewBox="0 0 20 18" aria-label="Вписать" style={{ display: "block", margin: "0 auto" }}>
                <path d="M2 6V2h4M14 2h4v4M18 12v4h-4M6 16H2v-4" fill="none" stroke="#1A1A18" strokeWidth="2" />
                <rect x="6" y="6" width="8" height="6" fill={C.hayFill} stroke={C.hayEdge} />
              </svg>
            </ChromeButton>
          </div>

          {/* КАРТА */}
          <div ref={wrapRef} style={{ flex: 1, minHeight: 0, minWidth: 0, position: "relative", background: "#EFEFEF", overflow: "hidden" }}>
            {mapSvg}

            <div style={{ position: "absolute", left: 6, top: 6, right: 6, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 5, justifyItems: "start", pointerEvents: "none" }}>
              {(sel || zsel) && (
                <div style={chip}>
                  <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selText}</span>
                  <ChromeButton onClick={() => setSheet("props")} style={{ padding: "4px 8px", flexShrink: 0 }}>Свойства</ChromeButton>
                  <ChromeButton onClick={deleteSelected} style={{ padding: "4px 8px", flexShrink: 0 }}>Удалить</ChromeButton>
                </div>
              )}
              {hint && (
                <div style={{ ...chip, padding: "5px 9px", background: ghost ? "#FFFBE6" : chip.background }}>
                  <span>{hint}</span>
                  {tool === "zone" && !ghost && (
                    <ChromeButton onClick={() => setDialog("zonekind")} style={{ padding: "4px 8px" }}>Тип</ChromeButton>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "absolute", right: 8, bottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <ChromeButton onClick={() => setView((v) => ({ ...v, mpp: Math.max(0.008, v.mpp * 0.8) }))} title="Приблизить" style={{ width: 44, height: 44, fontSize: 20, padding: 0 }}>+</ChromeButton>
              <ChromeButton onClick={() => setView((v) => ({ ...v, mpp: Math.min(zoomMax, v.mpp * 1.25) }))} title="Отдалить" style={{ width: 44, height: 44, fontSize: 20, padding: 0 }}>−</ChromeButton>
            </div>

            {sheet && (
              <div style={{
                position: "absolute", zIndex: 30, display: "flex", flexDirection: "column", background: C.chrome,
                boxShadow: "0 -3px 0 rgba(0,0,0,.18)",
                ...(landscape
                  ? { top: 0, right: 0, bottom: 0, width: "min(400px, 58%)", borderLeft: `2px solid ${C.chromeHi}`, boxShadow: "-3px 0 0 rgba(0,0,0,.18)" }
                  : { left: 0, right: 0, bottom: 0, height: "62%", borderTop: `2px solid ${C.chromeHi}` }),
              }}>
                <div style={{ background: "#2F5FA8", color: "#fff", font: "bold 14px Tahoma, sans-serif", padding: "3px 3px 3px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexShrink: 0 }}>
                  <span>{SHEET_TITLE[sheet]}</span>
                  <button type="button" onClick={() => setSheet(null)} aria-label="Закрыть панель"
                    style={{ background: C.chrome, border: `1px solid ${C.chromeLo}`, font: "14px Tahoma", width: 38, height: 32, padding: 0, cursor: "pointer", touchAction: "manipulation" }}>✕</button>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: 10 }}>
                  {sheetBody}
                </div>
              </div>
            )}
          </div>

          {/* СТАТУС */}
          <div style={{ display: "flex", borderTop: `2px solid ${C.chromeHi}`, borderBottom: `2px solid ${C.chromeLo}`, flexShrink: 0 }}>
            <StatusCell flex>{status}</StatusCell>
            <button type="button" onClick={() => toggleSheet("calc")}
              style={{ padding: "3px 10px", font: "bold 12.5px Tahoma, sans-serif", background: C.chrome, color: C.ink, border: "none", borderLeft: `1px solid ${C.chromeHi}`, cursor: "pointer", whiteSpace: "nowrap", touchAction: "manipulation" }}>
              Тюков: {stats.totalBales}
            </button>
          </div>

          {/* ИНСТРУМЕНТЫ И ПАНЕЛИ */}
          <div style={{
            display: "flex", gap: 3, padding: 4, overflowX: "auto", flexShrink: 0,
            paddingBottom: oneRow ? "calc(4px + env(safe-area-inset-bottom))" : 4,
          }}>
            {toolButtons}
            {oneRow && <div style={{ width: 2, flexShrink: 0, margin: "2px 3px", borderLeft: `1px solid ${C.chromeLo}`, borderRight: `1px solid ${C.chromeHi}` }} />}
            {oneRow && tabButtons}
          </div>
          {!oneRow && (
            <div style={{ display: "flex", gap: 3, padding: "0 4px 4px", paddingBottom: "calc(4px + env(safe-area-inset-bottom))", flexShrink: 0 }}>
              {tabButtons}
            </div>
          )}

          {dialogs}
        </div>
      </CompactCtx.Provider>
    );
  }

  return (
    <div style={{ ...ui, background: C.chrome, width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", userSelect: "none" }}
      onPointerDown={() => setOpenMenu(null)}>

      {/* ВЕРХ */}
      <div style={{ display: "flex", alignItems: "stretch", borderBottom: `2px solid ${C.chromeLo}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 2, padding: "2px 6px" }} onPointerDown={(e) => e.stopPropagation()}>
            {MENUS.map((m) => <Menu key={m.label} label={m.label} items={m.items} open={openMenu} setOpen={setOpenMenu} />)}
          </div>
          <div style={{ display: "flex", gap: 5, padding: "0 8px 6px", flexWrap: "wrap" }}>
            <ChromeButton onClick={newMap}>Новая карта</ChromeButton>
            <ChromeButton onClick={() => fileRef.current && fileRef.current.click()}>Файл</ChromeButton>
            <ChromeButton onClick={() => saveToLibrary(mapName)}>Сохранить</ChromeButton>
            <ChromeButton onClick={() => { refreshLibrary(); setDialog("library"); }}>Мои карты</ChromeButton>
            <ChromeButton onClick={openShared}>Общие</ChromeButton>
            <ChromeButton onClick={makeShareLink}>Ссылка</ChromeButton>
            <ChromeButton onClick={() => imgRef.current && imgRef.current.click()}>Подложка</ChromeButton>
            <ChromeButton onClick={undo} disabled={!history.length}>Отменить</ChromeButton>
            <ChromeButton onClick={fitView}>Вписать</ChromeButton>
            <ChromeButton onClick={resetMap}>Сброс к референсу</ChromeButton>
            {hiddenInputs}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px", borderLeft: `2px solid ${C.chromeLo}`, background: "#DFDBCD" }}>
          <svg width="46" height="34" viewBox="0 0 46 34">
            <rect x="2" y="12" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
            <rect x="2" y="21" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
            <rect x="8" y="4" width="20" height="9" fill={C.hayFill} stroke={C.hayEdge} />
            <circle cx="36" cy="20" r="9" fill="#2A2A2C" />
            <circle cx="32.5" cy="18" r="2.6" fill="#DDD" /><circle cx="39.5" cy="18" r="2.6" fill="#DDD" />
          </svg>
          <div style={{ lineHeight: 1.05 }}>
            <div style={{ font: `bold ${fs(20)}px Tahoma, sans-serif`, letterSpacing: ".03em" }}>CQB СЕЛО</div>
            <div style={{ font: `${fs(10)}px Tahoma, sans-serif`, opacity: 0.75, letterSpacing: ".16em" }}>ПЛАНИРОВЩИК ПОЛЯ v1.3</div>
          </div>
        </div>
      </div>

      {/* РАБОЧАЯ ОБЛАСТЬ */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ width: 196, flexShrink: 0, borderRight: `2px solid ${C.chromeLo}`, padding: 6, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {TOOLS.map(([k, label]) => (
            <button key={k} type="button" onMouseUp={(e) => e.currentTarget.blur()}
              onClick={() => { setTool(k); if (k === "zone") setDialog("zonekind"); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", cursor: "pointer",
                background: tool === k ? "#C0CBE0" : C.chrome, textAlign: "left", ...ui,
                borderTop: `2px solid ${tool === k ? C.chromeLo : C.chromeHi}`, borderLeft: `2px solid ${tool === k ? C.chromeLo : C.chromeHi}`,
                borderBottom: `2px solid ${tool === k ? C.chromeHi : C.chromeLo}`, borderRight: `2px solid ${tool === k ? C.chromeHi : C.chromeLo}`,
              }}>
              <Bevel out={false} style={{ padding: 2, background: "#EFECE2", display: "flex" }}><ToolIcon kind={k} /></Bevel>
              <span style={{ fontSize: fs(11.5) }}>{label}</span>
            </button>
          ))}

          {tool === "zone" && (
            <Bevel out={false} style={{ padding: 6, background: "#E6E3D8", display: "grid", gap: 3, marginTop: 2 }}>
              <div style={{ fontSize: fs(10.5), opacity: 0.75, marginBottom: 2 }}>Тип новой зоны:</div>
              {Object.keys(ZONE_KINDS).map((k) => (
                <button key={k} type="button" onClick={() => setZoneKind(k)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "2px 4px", cursor: "pointer", ...ui, fontSize: fs(11),
                    background: zoneKind === k ? "#C0CBE0" : "transparent",
                    border: zoneKind === k ? `1px solid ${C.sel}` : "1px solid transparent",
                  }}>
                  <span style={{ width: 20, height: 13, background: ZONE_KINDS[k].fill, border: `1px solid ${ZONE_KINDS[k].stroke}` }} />{ZONE_KINDS[k].label}
                </button>
              ))}
            </Bevel>
          )}

          <div style={{ marginTop: 8 }}>
            <PanelTitle>ПОСТРОЕНИЕ</PanelTitle>
            <Bevel out={false} style={{ padding: 7, display: "grid", gap: 5, background: "#E6E3D8" }}>
              {buildInner}
            </Bevel>
          </div>

          {bg && (
            <div style={{ marginTop: 6 }}>
              <PanelTitle>ПОДЛОЖКА</PanelTitle>
              <Bevel out={false} style={{ padding: 7, display: "grid", gap: 5, background: "#E6E3D8" }}>
                {bgInner}
              </Bevel>
            </div>
          )}
        </div>

        {/* КАРТА */}
        <div ref={wrapRef} style={{ flex: 1, minWidth: 320, position: "relative", background: "#EFEFEF", borderRight: `2px solid ${C.chromeLo}`, overflow: "hidden" }}>
          {mapSvg}

          <div style={{ position: "absolute", right: 8, bottom: 8, display: "flex", gap: 4 }} onPointerDown={(e) => e.stopPropagation()}>
            <ChromeButton onClick={() => setView((v) => ({ ...v, mpp: Math.max(0.008, v.mpp * 0.83) }))}>+</ChromeButton>
            <ChromeButton onClick={() => setView((v) => ({ ...v, mpp: Math.min(zoomMax, v.mpp * 1.2) }))}>−</ChromeButton>
            <ChromeButton onClick={fitView}>Вписать</ChromeButton>
          </div>
          {tool === "pan" && (
            <div style={{ position: "absolute", left: 8, top: 8, background: "rgba(255,255,255,.88)", border: `1px solid ${C.chromeLo}`, padding: "3px 8px", fontSize: fs(11) }}>
              {coarse ? "Тяните карту пальцем. Двумя пальцами — зум." : "Тяните карту мышью. Колесо — зум. Пробел включает панораму из любого инструмента."}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ */}
        <div style={{ width: 236, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <PanelTitle>БИБЛИОТЕКА ОБЪЕКТОВ</PanelTitle>
          {assetGrid(2)}

          <PanelTitle>СВОЙСТВА</PanelTitle>
          <Bevel out={false} style={{ margin: 5, padding: 7, background: "#E6E3D8", display: "grid", gap: 5 }}>
            {propsInner}
          </Bevel>

          <PanelTitle>ЛЕГЕНДА</PanelTitle>
          <Bevel out={false} style={{ margin: 5, padding: 7, background: "#FFFFFF", display: "grid", gap: 5 }}>
            {legendInner}
          </Bevel>
        </div>
      </div>

      {/* СТАТУС */}
      <div style={{ display: "flex", borderTop: `2px solid ${C.chromeHi}`, borderBottom: `2px solid ${C.chromeLo}` }}>
        <StatusCell w={168}>Карта: <b>{mapName}</b></StatusCell>
        <StatusCell w={160}>Курсор: {r1(mouse.x)} ; {r1(mouse.y)} м</StatusCell>
        <StatusCell w={120}>1 : {Math.round(view.mpp * 1000)}</StatusCell>
        <StatusCell flex>
          {sel ? `Выбрано: ${(ASSETS[sel.t] && ASSETS[sel.t].name) || sel.t}${sel.l != null ? `, ${r1(sel.l)} м — ${baleCount(sel.l, sel.tiers)} тюков` : ""}`
            : zsel ? `Зона: ${zsel.n} — ${r1(zsel.w)} × ${r1(zsel.h)} м` : status}
        </StatusCell>
        <StatusCell w={168}><b>Всего тюков: {stats.totalBales}</b></StatusCell>
        <StatusCell w={175}>Длина стен: {r1(stats.totalLen)} м</StatusCell>
        <div style={{ display: "flex", alignItems: "center", padding: "0 5px", background: C.chrome, borderLeft: `1px solid ${C.chromeHi}` }}>
          <ChromeButton style={{ padding: "1px 8px" }} onClick={() => setTablesOpen((o) => !o)}>
            {tablesOpen ? "Скрыть расчёт ▾" : "Показать расчёт ▴"}
          </ChromeButton>
        </div>
      </div>

      {/* ТАБЛИЦЫ */}
      <div style={{
        display: tablesOpen ? "flex" : "none", gap: 8, padding: 8, alignItems: "stretch",
        height: 208, flexShrink: 0, overflow: "hidden",
      }}>
        <Bevel out={false} style={{ background: "#FFFFFF", minWidth: 400, flex: "1 1 400px", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: C.chromeDk, font: `bold ${fs(11)}px Tahoma, sans-serif`, padding: "4px 8px", letterSpacing: ".05em" }}>
            РАСЧЁТ КОЛИЧЕСТВА ТЮКОВ · размер тюка {BALE_L} × {BALE_T} м
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {baleTable}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderTop: `1px solid ${C.chromeDk}`, background: "#EDEBE2", flexWrap: "wrap" }}>
            <span style={{ fontSize: fs(11.5) }}>Цена тюка, ₽</span>
            <NumIn value={price} min={0} step={10} onChange={setPrice} width={70} />
            <span style={{ fontSize: fs(11.5) }}>Смета: <b>{(stats.totalBales * price).toLocaleString("ru-RU")} ₽</b></span>
            <span style={{ fontSize: fs(10.5), opacity: 0.7 }}>Поддонов {stats.crates} · покрышек {stats.tires} · бочек {stats.barrels}</span>
          </div>
        </Bevel>

        <Bevel out={false} style={{ background: "#FFFFFF", minWidth: 360, flex: "1 1 360px", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ background: C.chromeDk, font: `bold ${fs(11)}px Tahoma, sans-serif`, padding: "4px 8px", letterSpacing: ".05em" }}>ЗОНЫ И СЧЁТ</div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", font: `${fs(11.5)}px Tahoma, sans-serif` }}>
              <thead><tr style={{ background: "#EDEBE2" }}>
                <Th>Название</Th><Th>Тип</Th><Th right>A / B</Th><Th right>Очки</Th><Th />
              </tr></thead>
              <tbody>
                {Object.values(zones).map((z, i) => {
                  const occ = zoneOccupancy(z);
                  return (
                    <tr key={z.id} style={{ background: selZone === z.id ? "#DCE6F5" : i % 2 ? "#F7F6F1" : "#fff" }}>
                      <Td>
                        <span style={{ display: "inline-block", width: 13, height: 11, background: z.fill || ZONE_KINDS[z.k].fill, border: `1px solid ${ZONE_KINDS[z.k].stroke}`, marginRight: 6, verticalAlign: "-1px" }} />
                        <input value={z.n} onChange={(e) => updateZone(z.id, { n: e.target.value })}
                          onFocus={() => { setSelZone(z.id); setSelected(null); }}
                          style={{ width: 104, background: "#fff", border: "1px solid #C9C6BA", padding: "1px 3px", font: `${fs(11.5)}px Tahoma, sans-serif` }} />
                      </Td>
                      <Td>
                        <select value={z.k} onChange={(e) => updateZone(z.id, { k: e.target.value })}
                          style={{ width: 116, background: "#fff", border: "1px solid #C9C6BA", font: `${fs(11)}px Tahoma, sans-serif` }}>
                          {Object.keys(ZONE_KINDS).map((k) => <option key={k} value={k}>{ZONE_KINDS[k].label}</option>)}
                        </select>
                      </Td>
                      <Td right><span style={{ color: C.teamA }}>{occ.a}</span> / <span style={{ color: C.teamB }}>{occ.b}</span></Td>
                      <Td right><b>{z.score}</b></Td>
                      <Td right><span style={{ display: "inline-flex", gap: 3 }}>
                        <ChromeButton style={{ padding: "0 6px" }} onClick={() => updateZone(z.id, { score: (z.score || 0) + 1 })}>+</ChromeButton>
                        <ChromeButton style={{ padding: "0 6px" }} onClick={() => updateZone(z.id, { score: Math.max(0, (z.score || 0) - 1) })}>−</ChromeButton>
                      </span></Td>
                    </tr>
                  );
                })}
                <tr style={{ background: "#DDE6D6", borderTop: `2px solid ${C.chromeLo}` }}>
                  <Td><b>Итого</b></Td><Td>{Object.keys(zones).length} зон</Td>
                  <Td right><b><span style={{ color: C.teamA }}>{stats.figs.filter((f) => f.t === "figA").length}</span> / <span style={{ color: C.teamB }}>{stats.figs.filter((f) => f.t === "figB").length}</span></b></Td>
                  <Td right><b>{Object.values(zones).reduce((s, z) => s + (z.score || 0), 0)}</b></Td><Td />
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: "6px 8px", borderTop: `1px solid ${C.chromeDk}`, background: "#EDEBE2", fontSize: fs(10.5), opacity: 0.8 }}>
            Название правится прямо в таблице, тип — в списке рядом. A / B — сколько фигурок каждой команды сейчас в зоне.
          </div>
        </Bevel>
      </div>

      {dialogs}
    </div>
  );
}

/* ============================ МЕЛКИЕ КОМПОНЕНТЫ ============================ */

const miniBtnStyle = { font: "11px Tahoma", padding: "0 5px", cursor: "pointer", background: C.chrome, border: `1px solid ${C.chromeLo}` };
const miniBtnBig = { ...miniBtnStyle, font: "16px Tahoma", minWidth: 36, height: 34, padding: "0 8px", touchAction: "manipulation" };

/* Ползунок подложки.
   free  — верхнего предела нет: число вводится руками, шкала логарифмическая
           и сама растягивается вслед за значением (min > 0) либо линейная,
           но раздвигающаяся (смещения, где бывает минус).
   wrap  — значение ходит по кругу 0…360 (угол поворота).
   minClamp — жёсткий нижний предел в режиме free; без него нижнего нет. */
function BgSlider({ label, value, min, max, step, onChange, unit = "", free = false, wrap = false, minClamp = null, extra = null }) {
  const [draft, setDraft] = useState(null);
  const compact = useCompact();
  const mb = compact ? miniBtnBig : miniBtnStyle;
  const r1 = (v) => Math.round(v * 10) / 10;
  const norm = (v) => {
    if (!isFinite(v)) return value;
    if (wrap) { const t = v % 360; return r1(t < 0 ? t + 360 : t); }
    const lo = free ? (minClamp == null ? -Infinity : minClamp) : min;
    const hi = free ? Infinity : max;
    return r1(Math.min(hi, Math.max(lo, v)));
  };
  /* Логарифмическая шкала: одним ползунком и сантиметры, и километры. */
  const logMode = free && min > 0;
  const lnMin = logMode ? Math.log(min) : 0;
  const lnMax = logMode ? Math.log(Math.max(max, value * 1.5, min * 10)) : 0;
  const toSlider = (v) => (logMode ? ((Math.log(Math.max(min, v)) - lnMin) / (lnMax - lnMin)) * 2000 : v);
  const fromSlider = (t) => (logMode ? Math.exp(lnMin + (t / 2000) * (lnMax - lnMin)) : t);
  const sliderMin = logMode ? 0 : (free ? Math.min(min, value) : min);
  const sliderMax = logMode ? 2000 : (free ? Math.max(max, value) : max);
  const sliderStep = logMode ? 1 : step;
  const typed = free || wrap;
  return (
    <div style={{ display: "grid", gap: compact ? 6 : 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: compact ? 14 : 11, gap: 6 }}>
        <span>{label}</span>
        <span style={{ display: "inline-flex", gap: compact ? 5 : 3, alignItems: "center" }}>
          <button type="button" onClick={() => onChange(norm(value - step))} style={mb}>−</button>
          {typed ? (
            <>
              <input type="number" value={draft == null ? r1(value) : draft} step={step}
                onChange={(e) => { setDraft(e.target.value); const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(norm(n)); }}
                onBlur={() => setDraft(null)}
                style={compact
                  ? { width: 84, height: 34, textAlign: "right", font: "16px Tahoma, sans-serif", background: "#fff", border: "1px solid #9A9684", padding: "0 5px" }
                  : { width: 66, textAlign: "right", font: "11px Tahoma, sans-serif", background: "#fff", border: "1px solid #9A9684", padding: "0 3px" }} />
              {unit ? <span style={{ fontSize: compact ? 13 : 10.5, opacity: 0.75 }}>{unit.trim()}</span> : null}
            </>
          ) : (
            <b style={{ minWidth: 42, textAlign: "right" }}>{r1(value)}{unit}</b>
          )}
          <button type="button" onClick={() => onChange(norm(value + step))} style={mb}>+</button>
        </span>
      </div>
      <input type="range" min={sliderMin} max={sliderMax} step={sliderStep}
        value={Math.max(sliderMin, Math.min(sliderMax, toSlider(value)))}
        onChange={(e) => onChange(norm(fromSlider(+e.target.value)))} style={{ width: "100%", height: compact ? 30 : undefined, margin: compact ? 0 : undefined }} />
      {extra}
    </div>
  );
}

function Row({ label, children }) {
  const compact = useCompact();
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: compact ? 10 : 6, fontSize: compact ? 14 : 11.5 }}><span>{label}</span>{children}</div>;
}
function Static({ children }) {
  const compact = useCompact();
  return <span style={{ background: "#fff", border: "1px solid #9A9684", padding: compact ? "5px 8px" : "1px 6px", minWidth: compact ? 96 : 66, textAlign: "right", fontSize: compact ? 14 : 11.5 }}>{children}</span>;
}
/* Флажок с подписью. На телефоне сам квадратик и строка крупнее — под палец. */
function Check({ checked, onChange, children }) {
  const compact = useCompact();
  return (
    <label style={{ display: "flex", gap: compact ? 10 : 6, alignItems: "center", fontSize: compact ? 14 : 11.5, minHeight: compact ? 34 : undefined }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={compact ? { width: 22, height: 22, margin: 0, flexShrink: 0 } : undefined} />{children}
    </label>
  );
}
/* Поле числа. Пока в нём стоит курсор, показываем ровно то, что набирают:
   иначе строку нельзя стереть и ввести заново — React возвращает старое число. */
function NumIn({ value, onChange, min, max, step = 1, width = 66 }) {
  const [draft, setDraft] = useState(null);
  const compact = useCompact();
  /* 16 px — порог, ниже которого iPhone сам приближает страницу при вводе */
  const big = compact ? { width: Math.max(width, 96), height: 36, fontSize: 16, padding: "2px 6px" } : null;
  return (
    <input type="number" value={draft == null ? value : draft} step={step} min={min} max={max}
      onChange={(e) => {
        setDraft(e.target.value);
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(Math.min(max == null ? 1e6 : max, Math.max(min == null ? -1e6 : min, v)));
      }}
      onBlur={() => setDraft(null)}
      style={{ width, background: "#fff", border: "1px solid #9A9684", padding: "1px 4px", font: "11.5px Tahoma, sans-serif", textAlign: "right", ...big }} />
  );
}
function Select({ value, onChange, options }) {
  const compact = useCompact();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: 82, background: "#fff", border: "1px solid #9A9684", font: "11.5px Tahoma, sans-serif", ...(compact ? { width: 120, height: 36, fontSize: 16 } : null) }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
function LegendRow({ label, children }) {
  const compact = useCompact();
  return <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: compact ? 14 : 11.5 }}>
    <span style={{ width: 36, display: "flex", justifyContent: "center" }}>{children}</span><span>{label}</span>
  </div>;
}
function StatusCell({ children, w, flex }) {
  return <div style={{
    width: w, flex: flex ? 1 : "none", padding: "3px 9px", font: "11.5px Tahoma, sans-serif",
    borderRight: `1px solid ${C.chromeLo}`, borderLeft: `1px solid ${C.chromeHi}`,
    background: C.chrome, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  }}>{children}</div>;
}
const Th = ({ children, right }) => {
  const compact = useCompact();
  return <th style={{ textAlign: right ? "right" : "left", padding: compact ? "6px 7px" : "3px 8px", borderBottom: `1px solid ${C.chromeLo}`, font: `bold ${compact ? 12.5 : 11}px Tahoma, sans-serif` }}>{children}</th>;
};
const Td = ({ children, right }) => {
  const compact = useCompact();
  return <td style={{ textAlign: right ? "right" : "left", padding: compact ? "7px 7px" : "2px 8px", borderBottom: "1px solid #E8E6DE" }}>{children}</td>;
};
