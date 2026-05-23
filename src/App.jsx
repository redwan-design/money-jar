import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────
const CURRENCY = "BDT";
const DENOMS = [10, 50, 100, 500, 1000];
const JAR_THEMES = [
  { name: "Ocean", fill: "#38BDF8", bg: "#E0F7FF", accent: "#0284C7", dark: "#0C4A6E" },
  { name: "Sunset", fill: "#FB923C", bg: "#FFF1E6", accent: "#EA580C", dark: "#7C2D12" },
  { name: "Forest", fill: "#4ADE80", bg: "#EDFFF4", accent: "#16A34A", dark: "#14532D" },
  { name: "Berry", fill: "#C084FC", bg: "#FAF0FF", accent: "#9333EA", dark: "#581C87" },
  { name: "Rose", fill: "#FB7185", bg: "#FFF0F3", accent: "#E11D48", dark: "#881337" },
];

function fmt(n) { return Number(n).toLocaleString("en-BD"); }

function getLevel(pct) {
  if (pct >= 1.00) return { label: "GOAL REACHED", icon: "🏆", color: "#F59E0B" };
  if (pct >= 0.75) return { label: "ALMOST THERE", icon: "🚀", color: "#8B5CF6" };
  if (pct >= 0.50) return { label: "HALFWAY", icon: "🔥", color: "#F97316" };
  if (pct >= 0.25) return { label: "BUILDING UP", icon: "⚡", color: "#0EA5E9" };
  if (pct > 0.00) return { label: "JUST STARTED", icon: "🌱", color: "#22C55E" };
  return { label: "EMPTY JAR", icon: "🫙", color: "#94A3B8" };
}

// ─── Jar SVG ─────────────────────────────────────────────────────
function JarSVG({ pct, theme, size = 180 }) {
  const fillPct = Math.min(pct, 1);
  const maxH = 108;
  const fillH = Math.round(fillPct * maxH);
  const fillY = 200 - fillH - 28;

  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 180 210" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="jbody">
          <path d="M38 58 Q34 72 34 90 L34 170 Q34 190 56 192 L124 192 Q146 190 146 170 L146 90 Q146 72 142 58 Z" />
        </clipPath>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.fill} stopOpacity="0.7" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="jarShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Lid shadow */}
      <ellipse cx="90" cy="62" rx="50" ry="6" fill="#00000011" />
      {/* Lid */}
      <rect x="48" y="30" width="84" height="26" rx="10" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
      <rect x="62" y="22" width="56" height="16" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Lid shine */}
      <rect x="52" y="33" width="76" height="8" rx="4" fill="url(#jarShine)" />

      {/* Jar body base */}
      <path d="M38 58 Q34 72 34 90 L34 170 Q34 190 56 192 L124 192 Q146 190 146 170 L146 90 Q146 72 142 58 Z"
        fill="white" stroke="#E2E8F0" strokeWidth="2.5" />

      {/* Liquid fill */}
      <g clipPath="url(#jbody)">
        {fillPct > 0 && (
          <>
            <rect x="34" y={fillY + 12} width="112" height={fillH + 80}
              fill="url(#fillGrad)"
              style={{ transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            {/* Wave */}
            <path
              d={`M34 ${fillY + 12} Q62 ${fillY + 4} 90 ${fillY + 12} Q118 ${fillY + 20} 146 ${fillY + 12} L146 ${fillY + 22} Q118 ${fillY + 30} 90 ${fillY + 22} Q62 ${fillY + 14} 34 ${fillY + 22} Z`}
              fill={theme.fill}
              style={{ transition: "all 0.9s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            {/* Bubbles */}
            {fillPct > 0.15 && <circle cx="68" cy={fillY + 35} r="5" fill="#ffffff44" className="bbl1" />}
            {fillPct > 0.3 && <circle cx="108" cy={fillY + 55} r="3.5" fill="#ffffff33" className="bbl2" />}
            {fillPct > 0.45 && <circle cx="78" cy={fillY + 72} r="4" fill="#ffffff3a" className="bbl3" />}
          </>
        )}
        {/* Shine overlay */}
        <rect x="50" y="58" width="16" height="120" rx="8" fill="#ffffff33" />
        <rect x="70" y="65" width="8" height="80" rx="4" fill="#ffffff1a" />
      </g>

      {/* Jar outline on top */}
      <path d="M38 58 Q34 72 34 90 L34 170 Q34 190 56 192 L124 192 Q146 190 146 170 L146 90 Q146 72 142 58 Z"
        fill="none" stroke="#CBD5E1" strokeWidth="2" />

      {/* Bottom shadow */}
      <ellipse cx="90" cy="192" rx="48" ry="5" fill="#00000008" />
    </svg>
  );
}

// ─── Floating particles ───────────────────────────────────────────
function Particles({ bursts }) {
  return (
    <>
      {bursts.map(b => (
        <div key={b.id} style={{ position: "fixed", left: b.x, top: b.y, pointerEvents: "none", zIndex: 9999 }}>
          {["💰", "✨", "🪙", "⭐", "💛"].map((em, i) => (
            <div key={i} style={{
              position: "absolute",
              fontSize: 16 + Math.random() * 8,
              animation: `burst${(i % 3) + 1} 0.8s ease-out forwards`,
              animationDelay: `${i * 0.04}s`,
            }}>{em}</div>
          ))}
        </div>
      ))}
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)",
      background: "#1E293B", color: "#F8FAFC",
      borderRadius: 100, padding: "13px 28px",
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14,
      zIndex: 600, whiteSpace: "nowrap",
      boxShadow: "0 8px 32px #0004",
      animation: "toastAnim 2s ease forwards",
    }}>{msg}</div>
  );
}

// ─── Nav Icons ────────────────────────────────────────────────────
function IconHome({ filled, color }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill={color} />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconHistory({ filled, color }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.52 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3Z" fill={color} />
      <path d="M12 8V13L16.25 15.52L17 14.33L13.5 12.25V8H12Z" fill={color} />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.52 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3Z" stroke={color} strokeWidth="1.8" />
      <path d="M12 8V13L16.25 15.52" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconJars({ filled, color }) {
  return filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="3" width="10" height="3" rx="1.5" fill={color} />
      <path d="M6 6H18L17.5 8C17.5 8 18.5 9.5 18.5 13C18.5 17 16.5 21 12 21C7.5 21 5.5 17 5.5 13C5.5 9.5 6.5 8 6.5 8L6 6Z" fill={color} />
      <rect x="9" y="12" width="6" height="2" rx="1" fill="white" opacity="0.6" />
    </svg>
  ) : (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="3" width="10" height="3" rx="1.5" stroke={color} strokeWidth="1.8" />
      <path d="M6 6H18L17.5 8C17.5 8 18.5 9.5 18.5 13C18.5 17 16.5 21 12 21C7.5 21 5.5 17 5.5 13C5.5 9.5 6.5 8 6.5 8L6 6Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────
function BottomNav({ active, onChange, accentColor }) {
  const tabs = [
    { id: "home", Icon: IconHome, label: "Home" },
    { id: "history", Icon: IconHistory, label: "History" },
    { id: "jars", Icon: IconJars, label: "Jars" },
  ];
  return (
    <div className="floating-nav">
      {tabs.map(({ id, Icon, label }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} className={`nav-item${isActive ? " active" : ""}`}>
            <Icon filled={isActive} color={isActive ? accentColor : "#94A3B8"} />
            <span className="nav-label" style={{ color: isActive ? "#1E293B" : "#64748B" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function MoneyJar() {
  const [jars, setJars] = useState(() => {
    try {
      const s = localStorage.getItem("mjar_v3");
      return s ? JSON.parse(s) : [{
        id: 1, name: "New Car", emoji: "🚗",
        goal: 100000, saved: 0, themeIdx: 0, history: [],
      }];
    } catch {
      return [{ id: 1, name: "New Car", emoji: "🚗", goal: 100000, saved: 0, themeIdx: 0, history: [] }];
    }
  });
  const [activeJar, setActiveJar] = useState(0);
  const [tab, setTab] = useState("home");
  const [bursts, setBursts] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddJar, setShowAddJar] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [customAmt, setCustomAmt] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newGoal, setNewGoal] = useState("");
  const [newTheme, setNewTheme] = useState(0);
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const burstId = useRef(0);
  const toastTimer = useRef(null);

  useEffect(() => { localStorage.setItem("mjar_v3", JSON.stringify(jars)); }, [jars]);

  const jar = jars[Math.min(activeJar, jars.length - 1)];
  const theme = JAR_THEMES[jar?.themeIdx ?? 0];
  const pct = jar ? Math.min(jar.saved / jar.goal, 1) : 0;
  const level = getLevel(pct);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  function spawnBurst(e) {
    const el = e?.currentTarget;
    const rect = el?.getBoundingClientRect?.() || { left: 180, top: 400, width: 80, height: 48 };
    const id = burstId.current++;
    const b = { id, x: rect.left + rect.width / 2 - 12, y: rect.top - 10 };
    setBursts(p => [...p, b]);
    setTimeout(() => setBursts(p => p.filter(bb => bb.id !== id)), 900);
  }

  function addMoney(amount, e) {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    spawnBurst(e);
    setJars(prev => prev.map((j, i) => {
      if (i !== activeJar) return j;
      const newSaved = j.saved + amt;
      const newPct = Math.min(newSaved / j.goal, 1);
      const oldPct = j.saved / j.goal;
      if (newPct >= 1.00 && oldPct < 1.00) setTimeout(() => showToast("🏆 Goal reached! Amazing!"), 400);
      else if (newPct >= 0.75 && oldPct < 0.75) setTimeout(() => showToast("🚀 75% there! You're flying!"), 400);
      else if (newPct >= 0.50 && oldPct < 0.50) setTimeout(() => showToast("🔥 Halfway! Keep it up!"), 400);
      else if (newPct >= 0.25 && oldPct < 0.25) setTimeout(() => showToast("⚡ 25% done! Great start!"), 400);
      else showToast(`+${CURRENCY} ${fmt(amt)} added!`);
      return { ...j, saved: newSaved, history: [{ date: new Date().toISOString(), amount: amt, type: "in" }, ...j.history] };
    }));
    setCustomAmt("");
  }

  function doWithdraw() {
    const amt = Number(withdrawAmt);
    if (!amt || amt <= 0) return;
    setJars(prev => prev.map((j, i) => {
      if (i !== activeJar) return j;
      return { ...j, saved: Math.max(0, j.saved - amt), history: [{ date: new Date().toISOString(), amount: -amt, type: "out" }, ...j.history] };
    }));
    setWithdrawAmt("");
    setShowWithdraw(false);
    showToast(`↩ ${CURRENCY} ${fmt(amt)} withdrawn`);
  }

  function createJar() {
    if (!newName.trim() || !newGoal || isNaN(newGoal) || Number(newGoal) <= 0) return;
    const newJar = { id: Date.now(), name: newName.trim(), emoji: newEmoji, goal: Number(newGoal), saved: 0, themeIdx: newTheme, history: [] };
    const nextIdx = jars.length;
    setJars(p => [...p, newJar]);
    setActiveJar(nextIdx);
    setShowAddJar(false);
    setNewName(""); setNewGoal(""); setNewEmoji("🎯"); setNewTheme(0);
    setTab("home");
    showToast("🫙 New jar created!");
  }

  function deleteJar() {
    const remaining = jars.filter((_, i) => i !== activeJar);
    setJars(remaining);
    setActiveJar(0);
    setConfirmDelete(false);
    showToast("🗑 Jar deleted");
  }

  const QUICK_EMOJIS = ["🎯", "🚗", "✈️", "🏠", "💍", "📱", "🎓", "🏋️", "🎮", "🛍️", "💊", "🌴"];

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: theme.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.5s ease", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sora:wght@700;800&display=swap');
        *, html, body { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; } html, body, #root { width: 100%; min-height: 100vh; }
        ::-webkit-scrollbar { display: none; }

        @keyframes burst1 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-35px,-80px) scale(0);opacity:0} }
        @keyframes burst2 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(10px,-100px) scale(0);opacity:0} }
        @keyframes burst3 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(40px,-70px) scale(0);opacity:0} }
        @keyframes toastAnim { 0%{opacity:0;transform:translateX(-50%) translateY(12px)} 12%,80%{opacity:1;transform:translateX(-50%) translateY(0)} 100%{opacity:0;transform:translateX(-50%) translateY(-8px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.88)} 70%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
        @keyframes bbl1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bbl2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes bbl3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .bbl1 { animation: bbl1 2.2s ease-in-out infinite; }
        .bbl2 { animation: bbl2 2.8s ease-in-out infinite 0.4s; }
        .bbl3 { animation: bbl3 1.9s ease-in-out infinite 0.8s; }

        .screen { animation: slideUp 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .card { background: #fff; border-radius: 24px; box-shadow: 0 2px 24px #00000009, 0 1px 4px #0000000a; }
        .denom-btn {
          background: #fff;
          border: 2px solid #F1F5F9;
          border-radius: 14px;
          font-family: 'Sora', sans-serif;
          font-size: 15px; font-weight: 800;
          padding: 15px 0;
          cursor: pointer;
          color: #1E293B;
          transition: all 0.14s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 3px 0 #E2E8F0;
          user-select: none;
        }
        .denom-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 0 #E2E8F0; }
        .denom-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 #E2E8F0; }
        .primary-btn {
          border: none; border-radius: 16px;
          font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800;
          padding: 17px; cursor: pointer; width: 100%; color: #fff;
          transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1);
          letter-spacing: 0.01em;
        }
        .primary-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
        .primary-btn:active { transform: translateY(1px); filter: brightness(0.95); }
        .ghost-btn {
          background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
          padding: 13px 20px; cursor: pointer; color: #64748B;
          transition: all 0.15s;
        }
        .ghost-btn:hover { background: #F1F5F9; color: #334155; }
        .input-box {
          width: 100%; border: 2px solid #E2E8F0; border-radius: 14px;
          padding: 15px 18px; background: #F8FAFC;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 600;
          color: #1E293B; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-box:focus { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); background: #fff; }
        .jar-chip {
          border: 2px solid #E2E8F0; border-radius: 50px; background: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 13px;
          padding: 9px 18px; cursor: pointer; color: #64748B;
          transition: all 0.18s; white-space: nowrap;
          box-shadow: 0 2px 0 #E2E8F0;
        }
        .jar-chip.active { color: #fff; border-color: transparent; box-shadow: 0 3px 0 #0002; }
        .jar-chip:hover:not(.active) { border-color: #CBD5E1; color: #334155; transform: translateY(-1px); }
        .overlay { position:fixed;inset:0;background:#00000055;z-index:300;backdrop-filter:blur(4px); display:flex;align-items:flex-end;justify-content:center; }
        .sheet { background:#fff;border-radius:28px 28px 0 0;padding:28px 24px 48px;width:100%;max-width:600px;animation:popIn 0.28s ease; }
        .floating-nav {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #1E293B;
          border-radius: 100px;
          display: flex;
          align-items: center;
          padding: 8px 8px;
          gap: 4px;
          z-index: 200;
          box-shadow: 0 8px 32px #00000030, 0 2px 8px #00000020;
          backdrop-filter: blur(12px);
          width: auto;
          min-width: 240px;
          max-width: 340px;
        }
        .nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          padding: 10px 22px; border-radius: 100px; cursor: pointer;
          border: none; background: transparent;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          flex: 1;
        }
        .nav-item.active { background: #fff; }
        .nav-item:hover:not(.active) { background: #ffffff15; }
        .nav-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 10px; letter-spacing: 0.04em;
        }
        .sheet-handle { width:40px;height:4px;background:#E2E8F0;border-radius:100px;margin:0 auto 24px; }
        .pill-row { display:flex;gap:10px;flex-wrap:wrap; }
        .emoji-pick { width:44px;height:44px;border-radius:12px;border:2px solid #E2E8F0;background:#F8FAFC;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s; }
        .emoji-pick.sel { border-color:var(--accent);background:var(--accent-soft); }
        .theme-dot { width:28px;height:28px;border-radius:50%;cursor:pointer;transition:all 0.18s;border:3px solid transparent; }
        .theme-dot.sel { border-color:#1E293B;transform:scale(1.2); }
        .label { font-size:12px;font-weight:800;color:#94A3B8;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px; }
      `}</style>

      {/* CSS vars for accent */}
      <style>{`:root { --accent: ${theme.accent}; --accent-soft: ${theme.fill}22; }`}</style>

      <Particles bursts={bursts} />
      <Toast msg={toast} />

      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", paddingBottom: 110 }}>

        {/* ── HOME TAB ── */}
        {tab === "home" && jar && (
          <div className="screen" style={{ padding: "0 0 0" }}>

            {/* Header bar */}
            <div style={{ padding: "clamp(32px,5vw,52px) clamp(16px,4vw,32px) 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>My Savings</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "#1E293B", lineHeight: 1.1 }}>
                  {jar.emoji} {jar.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 3 }}>TOTAL DEPOSITS</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{jar.history.filter(h => h.amount > 0).length}</div>
              </div>
            </div>

            {/* Jar switcher chips */}
            {jars.length > 1 && (
              <div style={{ padding: "0 clamp(12px,3vw,24px) 16px", display: "flex", gap: 8, overflowX: "auto" }}>
                {jars.map((j, i) => (
                  <button key={j.id} className={`jar-chip${i === activeJar ? " active" : ""}`}
                    style={i === activeJar ? { background: JAR_THEMES[j.themeIdx].accent } : {}}
                    onClick={() => { setActiveJar(i); setConfirmDelete(false); }}>
                    {j.emoji} {j.name}
                  </button>
                ))}
              </div>
            )}

            {/* Main jar card */}
            <div style={{ margin: "0 clamp(12px,3vw,20px) 16px" }}>
              <div className="card" style={{ padding: "28px 24px 24px", border: `2px solid ${theme.fill}44` }}>

                {/* Level badge */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <div style={{ background: level.color + "18", border: `1.5px solid ${level.color}44`, borderRadius: 100, padding: "5px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{level.icon}</span>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 11, color: level.color, letterSpacing: "0.08em" }}>{level.label}</span>
                  </div>
                </div>

                {/* Jar + amount */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <div style={{ flexShrink: 0 }}>
                    <JarSVG pct={pct} theme={theme} size={120} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", marginBottom: 4 }}>SAVED SO FAR</div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800, color: "#1E293B", lineHeight: 1, letterSpacing: "-0.02em" }}>
                      {fmt(jar.saved)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginTop: 2 }}>{CURRENCY}</div>
                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: theme.accent }}>
                      Goal: {CURRENCY} {fmt(jar.goal)}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>Progress</span>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 800, color: theme.accent }}>{Math.round(pct * 100)}%</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 100, height: 14, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      height: "100%", borderRadius: 100,
                      width: `${pct * 100}%`,
                      background: `linear-gradient(90deg, ${theme.fill}, ${theme.accent})`,
                      transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
                      minWidth: pct > 0 ? 14 : 0,
                      boxShadow: `0 0 12px ${theme.fill}88`,
                    }} />
                  </div>
                  {/* Milestone pips */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 2px 0" }}>
                    {[25, 50, 75, 100].map(m => (
                      <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: pct * 100 >= m ? theme.accent : "#E2E8F0", transition: "background 0.4s", boxShadow: pct * 100 >= m ? `0 0 6px ${theme.accent}88` : "none" }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: pct * 100 >= m ? theme.accent : "#CBD5E1" }}>{m}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remaining */}
                {pct < 1 && (
                  <div style={{ marginTop: 14, background: theme.bg, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>Still needed</span>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: theme.accent }}>{CURRENCY} {fmt(Math.max(0, jar.goal - jar.saved))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add */}
            <div style={{ padding: "0 clamp(12px,3vw,20px) 14px" }}>
              <div className="card" style={{ padding: "20px" }}>
                <div className="label" style={{ marginBottom: 14 }}>Quick Drop</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
                  {DENOMS.map((d, idx) => (
                    <button key={d} className="denom-btn"
                      style={{ animationDelay: `${idx * 0.05}s`, borderColor: theme.fill + "55", boxShadow: `0 3px 0 ${theme.fill}44` }}
                      onClick={e => addMoney(d, e)}>
                      {d >= 1000 ? `${d / 1000}K` : d}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="input-box" type="number" placeholder="Custom amount…"
                    value={customAmt} onChange={e => setCustomAmt(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addMoney(customAmt, e)}
                    style={{ flex: 1 }} />
                  <button onClick={e => addMoney(customAmt, e)} style={{
                    background: theme.accent, border: "none", borderRadius: 14,
                    width: 54, cursor: "pointer", fontSize: 22,
                    boxShadow: `0 4px 0 ${theme.dark}55`, transition: "all 0.15s",
                    flexShrink: 0,
                  }}>➕</button>
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div style={{ padding: "0 clamp(12px,3vw,20px) 16px", display: "flex", gap: 10 }}>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setShowWithdraw(true)}>↩ Withdraw</button>
              {jars.length > 1 && (
                <button className="ghost-btn" style={{ color: "#EF4444", borderColor: "#FCA5A5", flex: "0 0 auto" }}
                  onClick={() => setConfirmDelete(true)}>🗑</button>
              )}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && jar && (
          <div className="screen" style={{ padding: "clamp(32px,5vw,52px) clamp(12px,4vw,24px) 24px" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 6, padding: "0 8px" }}>
              Transaction History
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 20, padding: "0 8px" }}>
              {jar.emoji} {jar.name} · {jar.history.length} transaction{jar.history.length !== 1 ? "s" : ""}
            </div>

            {jar.history.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🫙</div>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 17, color: "#1E293B", marginBottom: 6 }}>No transactions yet</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>Start dropping money into your jar!</div>
              </div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                {jar.history.map((h, i) => {
                  const isIn = h.amount > 0;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                      borderBottom: i < jar.history.length - 1 ? "1.5px solid #F8FAFC" : "none",
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: isIn ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {isIn ? "💚" : "↩"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: isIn ? "#16A34A" : "#EF4444" }}>
                          {isIn ? "+" : "-"}{CURRENCY} {fmt(Math.abs(h.amount))}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", marginTop: 2 }}>
                          {new Date(h.date).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1" }}>
                        {new Date(h.date).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── JARS TAB ── */}
        {tab === "jars" && (
          <div className="screen" style={{ padding: "clamp(32px,5vw,52px) clamp(12px,4vw,24px) 24px" }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 20, padding: "0 8px" }}>
              All Jars
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {jars.map((j, i) => {
                const jt = JAR_THEMES[j.themeIdx];
                const jp = Math.min(j.saved / j.goal, 1);
                return (
                  <button key={j.id} onClick={() => { setActiveJar(i); setTab("home"); setConfirmDelete(false); }}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
                    <div className="card" style={{ padding: "18px 20px", border: i === activeJar ? `2px solid ${jt.accent}` : "2px solid transparent", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: jt.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `2px solid ${jt.fill}44` }}>
                          {j.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: "#1E293B" }}>{j.name}</div>
                            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: jt.accent }}>{Math.round(jp * 100)}%</div>
                          </div>
                          <div style={{ background: "#F1F5F9", borderRadius: 100, height: 6, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${jp * 100}%`, background: `linear-gradient(90deg, ${jt.fill}, ${jt.accent})`, borderRadius: 100, transition: "width 0.6s ease" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>{CURRENCY} {fmt(j.saved)}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>of {fmt(j.goal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button className="primary-btn" style={{ background: theme.accent, boxShadow: `0 5px 0 ${theme.dark}55` }}
              onClick={() => setShowAddJar(true)}>
              ＋ Create New Jar
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <BottomNav active={tab} onChange={t => { setTab(t); setConfirmDelete(false); }} accentColor={theme.accent} />

      {/* ── WITHDRAW SHEET ── */}
      {showWithdraw && (
        <div className="overlay" onClick={() => setShowWithdraw(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 6 }}>Withdraw Funds</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 24 }}>Available: {CURRENCY} {fmt(jar?.saved || 0)}</div>
            <div className="label">Amount to withdraw</div>
            <input className="input-box" type="number" placeholder={`e.g. 500`}
              value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)}
              style={{ marginBottom: 20 }} autoFocus />
            <div style={{ display: "flex", gap: 12 }}>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => { setShowWithdraw(false); setWithdrawAmt(""); }}>Cancel</button>
              <button className="primary-btn" style={{ flex: 2, background: "#EF4444", boxShadow: "0 4px 0 #B91C1C55" }} onClick={doWithdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION SHEET ── */}
      {confirmDelete && jars.length > 1 && jar && (
        <div className="overlay" onClick={() => setConfirmDelete(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />

            {/* Warning icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: "#FEE2E2",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H5H21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6L18.1 19.1C18.05 19.6 17.6 20 17.1 20H6.9C6.4 20 5.95 19.6 5.9 19.1L5 6H19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 10V14M10 10V14M14 10V14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
                Delete this jar?
              </div>
              <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>{jar.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 15, color: "#1E293B" }}>{jar.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8" }}>{CURRENCY} {fmt(jar.saved)} saved · {jar.history.length} transactions</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", lineHeight: 1.6 }}>
                All savings data will be permanently lost.<br />This action cannot be undone.
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="ghost-btn" style={{ flex: 1, padding: "15px 20px" }}
                onClick={() => setConfirmDelete(false)}>
                Keep it
              </button>
              <button className="primary-btn" style={{ flex: 1.4, background: "#EF4444", boxShadow: "0 4px 0 #B91C1C55" }}
                onClick={deleteJar}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD JAR SHEET ── */}
      {showAddJar && (
        <div className="overlay" onClick={() => setShowAddJar(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div className="sheet-handle" />
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Create New Jar</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 24 }}>What are you saving for?</div>

            <div className="label">Pick an emoji</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {QUICK_EMOJIS.map(em => (
                <button key={em} className={`emoji-pick${newEmoji === em ? " sel" : ""}`}
                  onClick={() => setNewEmoji(em)}>{em}</button>
              ))}
            </div>

            <div className="label">Jar name</div>
            <input className="input-box" placeholder="e.g. Dream Vacation" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: 16 }} />

            <div className="label">Savings goal (BDT)</div>
            <input className="input-box" type="number" placeholder="e.g. 50000" value={newGoal} onChange={e => setNewGoal(e.target.value)} style={{ marginBottom: 20 }} />

            <div className="label">Colour theme</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              {JAR_THEMES.map((t, i) => (
                <button key={i} className={`theme-dot${newTheme === i ? " sel" : ""}`}
                  style={{ background: t.fill }} onClick={() => setNewTheme(i)} />
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setShowAddJar(false)}>Cancel</button>
              <button className="primary-btn" style={{ flex: 2, background: JAR_THEMES[newTheme].accent, boxShadow: `0 4px 0 ${JAR_THEMES[newTheme].dark}55` }}
                onClick={createJar}>Create Jar 🎉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}