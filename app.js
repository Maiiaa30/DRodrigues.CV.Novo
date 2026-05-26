// Main CV app — bilingual EN/PT-PT
const { useState, useEffect, useRef, useMemo, createContext, useContext } =
  React;

const LangContext = createContext("en");
const useTxt = () => I18N[useContext(LangContext)];

/* ===== Shared resume download ===== */
function downloadResume(lang) {
  const file = lang === "pt" ? "dRodrigues_cv.pdf" : "dRodrigues_cv.pdf";

  const a = document.createElement("a");
  a.href = file;
  a.download = lang === "pt" ? "dRodrigues_cv.pdf" : "dRodrigues_cv.pdf";

  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ===== Typewriter primitives ===== */
function Typewriter({
  text,
  speed = 38,
  startDelay = 350,
  onDone,
  showCaret = true,
  caretClass = "cursor",
  as = "span",
}) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    let id;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(id);
          setDone(true);
          onDone && onDone();
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, speed, startDelay]);
  const Tag = as;
  return (
    <Tag>
      {out}
      {showCaret && !done && <span className={caretClass}></span>}
    </Tag>
  );
}

function TypeOnView({
  text,
  speed = 30,
  className,
  tag = "span",
  threshold = 0.4,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const Tag = tag;
  return (
    <Tag ref={ref} className={className}>
      {visible ? (
        <Typewriter
          key={text}
          text={text}
          speed={speed}
          startDelay={120}
          showCaret={false}
        />
      ) : (
        <span style={{ opacity: 0 }}>{text}</span>
      )}
    </Tag>
  );
}

function TypedLines({
  lines,
  speed = 40,
  startDelay = 200,
  onDone,
  className,
}) {
  const [idx, setIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  useEffect(() => {
    setIdx(0);
    setAllDone(false);
  }, [lines.join("|")]);
  const advance = () => {
    if (idx + 1 >= lines.length) {
      setAllDone(true);
      onDone && onDone();
    } else setIdx(idx + 1);
  };
  return (
    <span className={className}>
      {lines.slice(0, idx).map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
      <Typewriter
        key={idx + ":" + lines.join("|")}
        text={lines[idx] || ""}
        speed={speed}
        startDelay={idx === 0 ? startDelay : 80}
        showCaret={!allDone}
        onDone={advance}
      />
    </span>
  );
}

/* ===== Right hero panel — 7 variants ===== */
function PanelShell({ title, sub, children }) {
  return (
    <div className="boot">
      <div className="head">
        <span>{title}</span>
        <span>{sub}</span>
      </div>
      {children}
    </div>
  );
}

function Boot({ replayKey }) {
  const txt = useTxt();
  const lines = txt.boot.map((text, i) => {
    const tails = { 1: "[ok]", 2: "[ok]", 3: "[ok]", 6: "[ok]", 9: "[ok]" };
    const warn = i === 8;
    const ts = [
      "00:00.01",
      "00:00.04",
      "00:00.09",
      "00:00.14",
      "00:00.21",
      "00:00.34",
      "00:00.42",
      "00:00.47",
      "00:00.51",
      "00:00.66",
      "00:00.72",
    ][i];
    return { ts, text, tail: tails[i], warn };
  });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [replayKey, txt]);

  return (
    <PanelShell title={txt.bootHead} sub={txt.bootUid}>
      {lines.slice(0, shown).map((l, i) => (
        <div className="line" key={i}>
          <span className="ts">[{l.ts}]</span>
          <span className={l.warn ? "warn" : ""}>{l.text}</span>
          {l.tail && <span className="ok">{l.tail}</span>}
        </div>
      ))}
      {shown < lines.length && (
        <div className="line">
          <span className="ts">[--:--.--]</span>
          <span>
            <span className="caret"></span>
          </span>
        </div>
      )}
    </PanelShell>
  );
}

function Dossier() {
  const txt = useTxt().dossier;
  const fp = "4F 2A · 9B 1C · D7 88 · 0E 31 · A2 55 · 6F C4";
  return (
    <PanelShell title={txt.title} sub={txt.sub}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr",
          gap: "6px 14px",
          fontSize: 12,
          lineHeight: 1.7,
          marginTop: 4,
        }}
      >
        {txt.rows.map(([k, v], i) => (
          <React.Fragment key={i}>
            <div
              style={{
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: 10,
                alignSelf: "center",
              }}
            >
              {k}
            </div>
            <div
              style={{
                color: v.startsWith("▣")
                  ? "var(--accent)"
                  : v.startsWith("●")
                    ? "var(--ok)"
                    : "var(--fg)",
              }}
            >
              {v}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid var(--line)",
          marginTop: 16,
          paddingTop: 12,
        }}
      >
        <div
          style={{
            color: "var(--muted)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {txt.fpLabel}
        </div>
        <div
          style={{
            color: "var(--accent)",
            fontSize: 11,
            letterSpacing: "0.06em",
          }}
        >
          {fp}
        </div>
      </div>
    </PanelShell>
  );
}

function NowFeed() {
  const txt = useTxt().now;
  return (
    <PanelShell title={txt.title} sub={txt.sub}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          marginTop: 6,
        }}
      >
        {txt.items.map(([tag, v, when], i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr",
              gap: "12px",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                color: "var(--accent)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {tag}
            </div>
            <div>
              <div style={{ color: "var(--fg)", fontSize: 13 }}>{v}</div>
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                · {when}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function MatrixGrid() {
  const COLS = 24,
    ROWS = 14;
  const chars = "0123456789ABCDEF";
  const [grid, setGrid] = useState(() =>
    Array.from({ length: ROWS }, () =>
      Array.from(
        { length: COLS },
        () => chars[Math.floor(Math.random() * chars.length)],
      ),
    ),
  );
  const [highlights, setHighlights] = useState(() => new Set());
  useEffect(() => {
    const id = setInterval(() => {
      setGrid((prev) => {
        const next = prev.map((r) => r.slice());
        const flips = 8 + Math.floor(Math.random() * 10);
        const newH = new Set();
        for (let k = 0; k < flips; k++) {
          const r = Math.floor(Math.random() * ROWS);
          const c = Math.floor(Math.random() * COLS);
          next[r][c] = chars[Math.floor(Math.random() * chars.length)];
          if (Math.random() < 0.35) newH.add(r * COLS + c);
        }
        setHighlights(newH);
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);
  return (
    <PanelShell title="entropy // pool.0x1F" sub="0xDEAD · 0xBEEF">
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 13,
          lineHeight: 1.45,
          letterSpacing: "0.1em",
          color: "var(--deep)",
          userSelect: "none",
          marginTop: 4,
        }}
      >
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 6 }}>
            {row.map((ch, c) => (
              <span
                key={c}
                style={{
                  color: highlights.has(r * COLS + c)
                    ? "var(--accent)"
                    : (r + c) % 7 === 0
                      ? "var(--dim)"
                      : "var(--deep)",
                  transition: "color 240ms ease",
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--line)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          seed · 0x
          {Math.floor(Math.random() * 0xffff)
            .toString(16)
            .padStart(4, "0")}
        </span>
        <span style={{ color: "var(--accent)" }}>● collecting</span>
      </div>
    </PanelShell>
  );
}

/* Big monogram letterform — typographic flex */
function Monogram() {
  return (
    <div
      className="boot"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 360,
      }}
    >
      <div className="head">
        <span>type // monogram.svg</span>
        <span>DR · 01</span>
      </div>
      <div
        style={{
          display: "grid",
          placeItems: "center",
          flex: 1,
          padding: "20px 0",
        }}
      >
        <div
          style={{
            fontFamily: "var(--sans)",
            fontSize: "clamp(120px, 22vw, 220px)",
            fontWeight: 500,
            letterSpacing: "-0.08em",
            lineHeight: 0.85,
            color: "var(--fg)",
            position: "relative",
          }}
        >
          <span>D</span>
          <span style={{ color: "var(--accent)" }}>R</span>
          <span
            style={{
              position: "absolute",
              right: "-0.2em",
              top: "-0.05em",
              fontSize: "0.18em",
              color: "var(--muted)",
              letterSpacing: "0.1em",
              fontFamily: "var(--mono)",
              fontWeight: 400,
            }}
          >
            2026
          </span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          borderTop: "1px solid var(--line)",
          paddingTop: 12,
          marginTop: 8,
          fontSize: 10,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        <div>diogo</div>
        <div>rodrigues</div>
        <div style={{ textAlign: "right" }}>pentester</div>
        <div style={{ textAlign: "right", color: "var(--accent)" }}>·LX</div>
      </div>
    </div>
  );
}

/* Live recon-style scanner that keeps running */
function Scanner() {
  const targets = [
    "10.0.0.1",
    "10.0.0.42",
    "10.0.0.77",
    "10.0.0.103",
    "10.0.0.128",
    "10.0.0.201",
  ];
  const services = [
    "ssh",
    "http",
    "https",
    "smb",
    "ftp",
    "redis",
    "mysql",
    "postgres",
    "dns",
    "rdp",
  ];
  const verbs = [
    "probing",
    "knocking",
    "fingerprinting",
    "enumerating",
    "grabbing banner",
    "testing auth",
    "sniffing",
    "tracing",
  ];
  const [lines, setLines] = useState([]);
  useEffect(() => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const id = setInterval(() => {
      const port = [22, 80, 443, 445, 21, 6379, 3306, 5432, 53, 3389][
        Math.floor(Math.random() * 10)
      ];
      const open = Math.random() > 0.35;
      const target = pick(targets);
      const svc = pick(services);
      const line = open
        ? {
            t: "ok",
            text: `[+] ${target}:${String(port).padEnd(5)} ${svc.padEnd(8)} open`,
          }
        : {
            t: "dim",
            text: `[·] ${target}:${String(port).padEnd(5)} ${pick(verbs).padEnd(16)} …`,
          };
      setLines((prev) => [...prev.slice(-13), line]);
    }, 380);
    return () => clearInterval(id);
  }, []);
  return (
    <PanelShell
      title="recon // scan.live"
      sub={`scanning · ${targets.length} hosts`}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          lineHeight: 1.55,
          minHeight: 280,
          marginTop: 4,
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color: l.t === "ok" ? "var(--ok)" : "var(--dim)",
              whiteSpace: "pre",
              opacity: 0.5 + (i / lines.length) * 0.5,
            }}
          >
            {l.text}
          </div>
        ))}
        {lines.length < 14 &&
          Array.from({ length: 14 - lines.length }).map((_, i) => (
            <div key={"ph" + i} style={{ color: "var(--deep)" }}>
              ·
            </div>
          ))}
      </div>
    </PanelShell>
  );
}

/* Receipt / tape style printout */
function Tape() {
  const txt = useTxt();
  const items = [
    ["name", "Diogo Rodrigues"],
    [
      "role",
      txt === I18N.pt
        ? "Pentester (em transição)"
        : "Pentester (in transition)",
    ],
    ["loc", txt.location],
    ["—", ""],
    ["cert.target", "CompTIA Pentest+"],
    ["progress", "████████░░ 80%"],
    ["platforms", "THM · HTB"],
    ["lab", "Kali · VMware"],
    ["—", ""],
    ["stack", "React · JS · Python"],
    ["kit", "Nmap · Burp · Nuclei"],
    ["—", ""],
    ["available", txt === I18N.pt ? "Sim" : "Yes"],
    ["rate", "— Open —"],
  ];
  return (
    <div className="boot" style={{ padding: "18px 0", overflow: "hidden" }}>
      <div className="head" style={{ margin: "0 20px 0 20px" }}>
        <span>print // receipt.txt</span>
        <span>#000482</span>
      </div>
      <div
        style={{
          position: "relative",
          margin: "12px 0 0 0",
          padding: "0 24px 4px",
          fontFamily: "var(--mono)",
          fontSize: 12,
          lineHeight: 1.7,
          color: "var(--fg)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderBottom: "1px dashed var(--line-2)",
            paddingBottom: 8,
            marginBottom: 10,
            color: "var(--accent)",
            letterSpacing: "0.2em",
          }}
        >
          ▮ Diogo Rodrigues CV ▮
        </div>
        {items.map(([k, v], i) =>
          k === "—" ? (
            <div
              key={i}
              style={{ borderTop: "1px dashed var(--line-2)", margin: "6px 0" }}
            ></div>
          ) : (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ color: "var(--muted)" }}>{k}</span>
              <span style={{ textAlign: "right" }}>{v}</span>
            </div>
          ),
        )}
        <div
          style={{
            textAlign: "center",
            borderTop: "1px dashed var(--line-2)",
            paddingTop: 8,
            marginTop: 10,
            color: "var(--muted)",
            fontSize: 10,
            letterSpacing: "0.15em",
          }}
        >
          THANK YOU · COME BACK
        </div>
      </div>
    </div>
  );
}

/* ASCII portrait — abstract geometric */
function Ascii() {
  const art = [
    "         ████████████          ",
    "       ██░░░░░░░░░░░░██        ",
    "      ██░░██░░░░░░██░░██       ",
    "     ██░░░░░░██████░░░░██      ",
    "     ██░░░░██░░░░██░░░░██      ",
    "     ██░░░░██░░░░██░░░░██      ",
    "      ██░░░░░░██░░░░░░██       ",
    "       ██░░░░░░░░░░░░██        ",
    "         ██░░░░░░░░██          ",
    "          ████████████         ",
    "         ▌            ▐        ",
    "        ▌  open ports  ▐       ",
    "         ▙▄▄▄▄▄▄▄▄▄▄▄▄▟        ",
  ];
  return (
    <PanelShell title="ascii // self.png" sub="render · ok">
      <pre
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          lineHeight: 1.05,
          letterSpacing: "0.04em",
          color: "var(--dim)",
          margin: "12px 0 6px",
          textAlign: "center",
        }}
      >
        {art.join("\n")}
      </pre>
      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--line)",
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        not a self-portrait · probably
      </div>
    </PanelShell>
  );
}

function RightPanel({ kind, replayKey }) {
  switch (kind) {
    case "dossier":
      return <Dossier />;
    case "now":
      return <NowFeed />;
    case "matrix":
      return <MatrixGrid />;
    case "monogram":
      return <Monogram />;
    case "scanner":
      return <Scanner />;
    case "tape":
      return <Tape />;
    case "ascii":
      return <Ascii />;
    default:
      return <Boot replayKey={replayKey} />;
  }
}

/* ===== Status bar ===== */
function StatusBar({ active, lang, onLang, onDownload }) {
  const txt = useTxt();
  const [now, setNow] = useState(() => fmt(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  function fmt(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
  }
  return (
    <div className="statusbar">
      <div className="container statusbar-inner">
        <div className="left">
          <span>
            <span className="dot pulse"></span>&nbsp; {txt.available}
          </span>
          <span style={{ color: "var(--muted)" }}>·</span>
          <span>{txt.location}</span>
        </div>
        <div className="center">
          <span style={{ color: "var(--muted)" }}>§</span>
          <span>{active}</span>
        </div>
        <div className="right">
          <button
            className="sb-btn"
            onClick={onDownload}
            title={lang === "pt" ? "Descarregar CV" : "Download CV"}
          >
            <span className="arr">↓</span>
            <span>{txt.download}</span>
          </button>
          <div className="lang-switch" role="tablist" aria-label="language">
            <button
              role="tab"
              aria-selected={lang === "en"}
              className={lang === "en" ? "on" : ""}
              onClick={() => onLang("en")}
            >
              EN
            </button>
            <button
              role="tab"
              aria-selected={lang === "pt"}
              className={lang === "pt" ? "on" : ""}
              onClick={() => onLang("pt")}
            >
              PT
            </button>
          </div>
          <span style={{ color: "var(--muted)" }}>·</span>
          <span className="sb-time">{now}</span>
        </div>
      </div>
    </div>
  );
}

/* ===== Sections ===== */
function Hero({ replayKey, panelKind }) {
  const txt = useTxt();
  return (
    <section
      id="hero"
      data-screen-label="01 Hero"
      style={{ borderTop: "none", paddingTop: 16 }}
    >
      <div className="container hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">{txt.identity}</div>
            <h1 className="typed-name">
              <TypedLines
                key={txt === I18N.pt ? "pt" : "en"}
                lines={["Diogo", "Rodrigues."]}
                speed={70}
                startDelay={500}
              />
            </h1>
            <div className="hero-role">
              <Typewriter
                key={"role:" + txt.roleLine}
                text={txt.roleLine}
                startDelay={1900}
              />
            </div>
            <div className="hero-meta">
              <div className="meta-cell">
                <div className="k">{txt.meta.location}</div>
                <div className="v">{txt.meta.locationV}</div>
              </div>
              <div className="meta-cell">
                <div className="k">{txt.meta.status}</div>
                <div className="v" style={{ color: "var(--accent)" }}>
                  {txt.meta.statusV}
                </div>
              </div>
              <div className="meta-cell">
                <div className="k">{txt.meta.focus}</div>
                <div className="v">{txt.meta.focusV}</div>
              </div>
              <div className="meta-cell">
                <div className="k">{txt.meta.studying}</div>
                <div className="v">{txt.meta.studyingV}</div>
              </div>
            </div>
          </div>
          <RightPanel kind={panelKind} replayKey={replayKey} />
        </div>
      </div>
    </section>
  );
}

function About() {
  const txt = useTxt();
  const a = txt.aside;
  return (
    <section id="about" data-screen-label="02 About">
      <div className="container">
        <div className="sec-head">
          <div className="sec-code">{txt.aboutCode}</div>
          <h2 className="sec-title">
            <TypeOnView text={txt.about} />
          </h2>
          <div className="sec-meta">{txt.aboutMeta}</div>
        </div>
        <div className="about-grid">
          <div className="spacer"></div>
          <div className="prose">
            <p>
              {txt.aboutP1[0]}
              <span className="accent">{txt.aboutP1[1]}</span>
              {txt.aboutP1[2]}
              <span className="accent">{txt.aboutP1[3]}</span>
            </p>
            <p>
              {txt.aboutP2[0]}
              <span className="accent">{txt.aboutP2[1]}</span>
              {txt.aboutP2[2]}
              <span className="accent">{txt.aboutP2[3]}</span>
              {txt.aboutP2[4]}
            </p>
            <p style={{ color: "var(--dim)", fontSize: "18px" }}>
              {txt.aboutP3}
            </p>
          </div>
          <div className="aside">
            <div className="row">
              <div className="k">{a.name}</div>
              <div className="v">{a.nameV}</div>
            </div>
            <div className="row">
              <div className="k">{a.previously}</div>
              <div className="v">{a.previouslyV}</div>
            </div>
            <div className="row">
              <div className="k">{a.now}</div>
              <div className="v">
                <span className="badge">▮</span> {a.nowV}
              </div>
            </div>
            <div className="row">
              <div className="k">{a.studying}</div>
              <div className="v">{a.studyingV}</div>
            </div>
            <div className="row">
              <div className="k">{a.stack}</div>
              <div className="v">{a.stackV}</div>
            </div>
            <div className="row">
              <div className="k">{a.platforms}</div>
              <div className="v">{a.platformsV}</div>
            </div>
            <div className="row">
              <div className="k">{a.languages}</div>
              <div className="v">{a.languagesV}</div>
            </div>
            <div className="row">
              <div className="k">{a.looking}</div>
              <div className="v">{a.lookingV}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const stack = [
  { name: "JavaScript", sub: "", lvl: 92 },
  { name: "React", sub: "hooks + rsc", lvl: 88 },
  { name: "HTML & CSS", sub: "", lvl: 95 },
  { name: "Python", sub: "scripting · automation", lvl: 78 },
  { name: "Node.js", sub: "apis, tooling", lvl: 70 },
  { name: "Git", sub: "workflows", lvl: 84 },
];
const kit = [
  { name: "Nmap", sub: "recon · scanning", lvl: 77 },
  { name: "Burp Suite", sub: "web pentest", lvl: 64 },
  { name: "Linux / Kali", sub: "daily driver", lvl: 75 },
  { name: "Metasploit", sub: "learning", lvl: 38 },
  { name: "Nuclei", sub: "", lvl: 75 },
];

function Skills() {
  const txt = useTxt();
  return (
    <section id="skills" data-screen-label="03 Skills">
      <div className="container">
        <div className="sec-head">
          <div className="sec-code">{txt.skillsCode}</div>
          <h2 className="sec-title">
            <TypeOnView text={txt.skills} />
          </h2>
          <div className="sec-meta">{txt.skillsMeta}</div>
        </div>
        <div className="skills">
          <div></div>
          <div className="skill-cols">
            <div className="skill-col">
              <div className="label">{txt.stackLabel}</div>
              {stack.map((s) => (
                <div className="skill-row" key={s.name}>
                  <div className="name">
                    {s.name}
                    <span className="sub">{s.sub}</span>
                  </div>
                  <div className="flex-row">
                    <div className="bar">
                      <i style={{ width: s.lvl + "%" }}></i>
                    </div>
                    <div className="lvl">{s.lvl}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="skill-col">
              <div className="label">{txt.kitLabel}</div>
              {kit.map((s) => (
                <div className="skill-row" key={s.name}>
                  <div className="name">
                    {s.name}
                    <span className="sub">{s.sub}</span>
                  </div>
                  <div className="flex-row">
                    <div className="bar">
                      <i style={{ width: s.lvl + "%" }}></i>
                    </div>
                    <div className="lvl">{s.lvl}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TerminalSection({ onTheme }) {
  const txt = useTxt();
  return (
    <section id="terminal" data-screen-label="04 Terminal">
      <div className="container">
        <div className="sec-head">
          <div className="sec-code">{txt.termCode}</div>
          <h2 className="sec-title">
            <TypeOnView text={txt.term} />
          </h2>
          <div className="sec-meta">{txt.termMeta}</div>
        </div>
        <div className="terminal-wrap">
          <div></div>
          <Terminal onTheme={onTheme} />
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const txt = useTxt();
  const items = [
    {
      k: "email",
      v: "contact@drodrigues.cv",
      href: "mailto:contact@drodrigues.cv",
      tag: "mail →",
    },
    {
      k: "github",
      v: "@Maiaa",
      href: "https://github.drodrigues.cv",
      tag: "github.com →",
    },
    {
      k: "linkedin",
      v: "Diogo Rodrigues",
      href: "https://linkedin.com",
      tag: "linkedin.com →",
    },
    {
      k: "hackthebox",
      v: "/profile/diogo",
      href: "https://hackthebox.com",
      tag: "htb →",
    },
  ];
  return (
    <section id="contact" data-screen-label="05 Contact">
      <div className="container">
        <div className="sec-head">
          <div className="sec-code">{txt.contactCode}</div>
          <h2 className="sec-title">
            <TypeOnView text={txt.contact} />
          </h2>
          <div className="sec-meta">{txt.contactMeta}</div>
        </div>
        <div className="contact">
          <div></div>
          <div className="contact-grid">
            {items.map((it) => (
              <a
                className="contact-card"
                key={it.k}
                href={it.href}
                target="_blank"
                rel="noreferrer"
              >
                <div className="k">// {it.k}</div>
                <div className="v">{it.v}</div>
                <div className="arr">
                  <span>{it.tag}</span>
                  <span>↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Outro — bold closing slab, no more "download card" ===== */
function Outro({ lang }) {
  const txt = useTxt();
  return (
    <section id="outro" data-screen-label="06 Outro" className="outro">
      <div className="container">
        <div className="outro-grid">
          <div className="outro-num">↓</div>
          <div className="outro-body">
            <h2 className="outro-lead">
              <TypeOnView text={txt.outroLead} speed={50} />
              <br />
              <span className="dim">
                <TypeOnView text={txt.outroLead2} speed={50} />
              </span>
            </h2>
            <p className="outro-sub">{txt.outroSub}</p>
            <div className="outro-ctas">
              <a className="cta primary" href="mailto:contact@drodrigues.cv">
                <span className="ctak">01</span>
                <span className="ctav">{txt.outroCta1}</span>
                <span className="ctaa">→</span>
              </a>
              <a
                className="cta"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  downloadResume(lang);
                }}
              >
                <span className="ctak">02</span>
                <span className="ctav">{txt.outroCta2}</span>
                <span className="ctaa">↓</span>
              </a>
              <a
                className="cta"
                href="https://github.drodrigues.cv"
                target="_blank"
                rel="noreferrer"
              >
                <span className="ctak">03</span>
                <span className="ctav">{txt.outroCta3}</span>
                <span className="ctaa">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== Active section observer ===== */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids.join(",")]);
  return active;
}

const sectionLabels = {
  hero: { en: "00 / identity", pt: "00 / identidade" },
  about: { en: "01 / about", pt: "01 / sobre" },
  skills: { en: "02 / skills", pt: "02 / competências" },
  terminal: { en: "03 / shell", pt: "03 / shell" },
  contact: { en: "04 / contact", pt: "04 / contacto" },
  outro: { en: "05 / outro", pt: "05 / fecho" },
};

/* ===== App root ===== */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  accent: "#7ec8ff",
  density: "comfortable",
  scanlines: false,
  vignette: true,
  showCorner: false,
  panelKind: "tape",
  lang: "en",
}; /*EDITMODE-END*/

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [replayKey, setReplayKey] = useState(0);
  const active = useActiveSection([
    "hero",
    "about",
    "skills",
    "terminal",
    "contact",
    "outro",
  ]);
  const lang = t.lang === "pt" ? "pt" : "en";

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty(
      "--accent-soft",
      t.accent + "1f",
    );
    document.documentElement.dataset.density = t.density;
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
  }, [t.accent, t.density, lang]);

  const setAccent = (c) => setTweak("accent", c);
  const setLang = (l) => setTweak("lang", l);

  const activeLabel = (sectionLabels[active] || {})[lang] || "";

  return (
    <LangContext.Provider value={lang}>
      <div className="shell">
        <StatusBar
          active={activeLabel}
          lang={lang}
          onLang={setLang}
          onDownload={() => downloadResume(lang)}
        />
        <Hero replayKey={replayKey} panelKind={t.panelKind} />
        <About />
        <Skills />
        <TerminalSection onTheme={setAccent} />
        <Contact />
        <Outro lang={lang} />

        <footer>
          <div className="container footer-inner">
            <div>© 2026 · diogo rodrigues</div>
            <div>{useTxt().footerHand}</div>
            <div className="right">
              <a href="#hero" style={{ color: "inherit" }}>
                {useTxt().footerTop}
              </a>
            </div>
          </div>
        </footer>

        {t.scanlines && <div className="scanlines"></div>}
        {t.vignette && <div className="vignette"></div>}
        {t.showCorner && (
          <div className="corner-mark">
            drod-cv · build {new Date().getUTCFullYear()}.
            {String(new Date().getUTCMonth() + 1).padStart(2, "0")}
          </div>
        )}

        <TweaksPanel title="Tweaks">
          <TweakSection label="Language">
            <TweakRadio
              label="lang"
              value={lang}
              options={[
                { label: "English", value: "en" },
                { label: "Português", value: "pt" },
              ]}
              onChange={(v) => setTweak("lang", v)}
            />
          </TweakSection>
          <TweakSection label="Hero panel">
            <TweakSelect
              label="variant"
              value={t.panelKind}
              options={[
                { label: "boot.log", value: "boot" },
                { label: "dossier", value: "dossier" },
                { label: "now · status", value: "now" },
                { label: "entropy grid", value: "matrix" },
                { label: "monogram DR", value: "monogram" },
                { label: "live scanner", value: "scanner" },
                { label: "receipt tape", value: "tape" },
                { label: "ascii block", value: "ascii" },
              ]}
              onChange={(v) => setTweak("panelKind", v)}
            />
            <TweakButton
              label="↻ replay boot"
              onClick={() => setReplayKey((k) => k + 1)}
            />
          </TweakSection>
          <TweakSection label="Accent">
            <TweakColor
              label="color"
              value={t.accent}
              options={["#cfcfcf", "#9eff6b", "#7ec8ff", "#ffb648", "#ff6b6b"]}
              onChange={(v) => setTweak("accent", v)}
            />
          </TweakSection>
          <TweakSection label="Layout">
            <TweakRadio
              label="density"
              value={t.density}
              options={[
                { label: "cozy", value: "comfortable" },
                { label: "tight", value: "compact" },
              ]}
              onChange={(v) => setTweak("density", v)}
            />
          </TweakSection>
          <TweakSection label="Effects">
            <TweakToggle
              label="scanlines"
              value={t.scanlines}
              onChange={(v) => setTweak("scanlines", v)}
            />
            <TweakToggle
              label="vignette"
              value={t.vignette}
              onChange={(v) => setTweak("vignette", v)}
            />
            <TweakToggle
              label="corner mark"
              value={t.showCorner}
              onChange={(v) => setTweak("showCorner", v)}
            />
          </TweakSection>
        </TweaksPanel>
      </div>
    </LangContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
