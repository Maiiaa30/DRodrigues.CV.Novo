// Interactive terminal — small, real working REPL with a fixed command set.
const { useState, useRef, useEffect, useCallback } = React;

function Terminal({ accent, onTheme }) {
  const initialLines = [
    {
      t: "muted",
      text: "drod-cv v1.0.3 — type 'help' for commands. ↑/↓ recalls history.",
    },
    { t: "dim", text: "" },
  ];
  const [lines, setLines] = useState(initialLines);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const print = useCallback((entries) => {
    setLines((prev) => [...prev, ...entries]);
  }, []);

  const run = useCallback(
    (raw) => {
      const cmd = raw.trim();
      const [name, ...args] = cmd.split(/\s+/);
      const echo = { t: "fg", text: null, echo: cmd };

      if (!cmd) {
        print([echo]);
        return;
      }

      switch (name.toLowerCase()) {
        case "help":
          print([
            echo,
            {
              t: "help",
              text: null,
              items: [
                ["whoami", "Identity card"],
                ["skills", "List stack + offsec kit"],
                ["certs", "Certifications in progress"],
                ["contact", "How to reach me"],
                ["scan", "Simulated nmap scan"],
                ["theme", "theme [grey|lime|ice|amber]"],
                ["date", "Current timestamp"],
                ["clear", "Wipe the buffer"],
                ["exit", "Close terminal"],
              ],
            },
          ]);
          break;
        case "whoami":
          print([
            echo,
            { t: "fg", text: "diogo.rodrigues" },
            { t: "dim", text: "role:     Penetration tester (in transition)" },
            { t: "dim", text: "from:     Web developer · react + python" },
            { t: "dim", text: "studying: CompTIA Pentest+ (current)" },
            { t: "dim", text: "status:   open to offsec roles & internships" },
          ]);
          break;
        case "skills":
          print([
            echo,
            { t: "accent", text: "// stack" },
            { t: "dim", text: "  html · css · javascript · react · python" },
            { t: "accent", text: "// kit" },
            {
              t: "dim",
              text: "  Nmap · burp suite · Nuclei",
            },
            { t: "accent", text: "// platforms" },
            {
              t: "dim",
              text: "  tryhackme · hackthebox",
            },
          ]);
          break;
        case "certs":
          print([
            echo,
            {
              t: "fg",
              text: "CompTIA Pentest+    [in-progress]  ████████░░  80%",
            },
            {
              t: "dim",
              text: "OSCP                [target Q4]    ░░░░░░░░░░  goal",
            },
          ]);
          break;
        case "contact":
          print([
            echo,
            {
              t: "dim",
              text: "email     →  diogo.rodrigues@contact@drodrigues.cv",
            },
            { t: "dim", text: "github    →  github.com/Maiiaa30" },
            // { t: "dim", text: "linkedin  →  linkedin.com/in/diogo-rodrigues" },
            { t: "dim", text: "htb       →  app.hackthebox.com/profile/diogo" },
          ]);
          break;
        case "scan": {
          const target = args[0] || "localhost";
          print([
            echo,
            {
              t: "muted",
              text: `Starting Nmap 7.94 ( https://nmap.org ) — target: ${target}`,
            },
            { t: "dim", text: "Host is up (0.00021s latency)." },
            { t: "dim", text: "Not shown: 996 closed tcp ports" },
            { t: "dim", text: "PORT      STATE  SERVICE" },
            { t: "fg", text: "22/tcp    open   ssh" },
            { t: "fg", text: "80/tcp    open   http      curiosity/3.0" },
            { t: "fg", text: "443/tcp   open   https     dedication/2.1" },
            { t: "fg", text: "8080/tcp  open   http-proxy learning-loop" },
            {
              t: "ok",
              text: "Nmap done: 1 IP address (1 host up) scanned in 0.42s",
            },
          ]);
          break;
        }
        case "theme": {
          const t = (args[0] || "").toLowerCase();
          const map = {
            grey: "#cfcfcf",
            gray: "#cfcfcf",
            lime: "#9eff6b",
            ice: "#7ec8ff",
            amber: "#ffb648",
          };
          if (map[t]) {
            onTheme && onTheme(map[t]);
            print([echo, { t: "ok", text: `accent → ${t}` }]);
          } else {
            print([
              echo,
              { t: "err", text: "usage: theme [grey|lime|ice|amber]" },
            ]);
          }
          break;
        }
        case "date":
          print([echo, { t: "dim", text: new Date().toString() }]);
          break;
        case "clear":
        case "cls":
          setLines(initialLines);
          return;
        case "exit":
          print([echo, { t: "muted", text: "connection closed." }]);
          break;
        case "sudo":
          print([
            echo,
            {
              t: "err",
              text: `[drod] is not in the sudoers file. This incident will be reported.`,
            },
          ]);
          break;
        case "ls":
          print([
            echo,
            {
              t: "dim",
              text: "about.md   skills.json   certs/   projects/   contact.vcf   resume.pdf",
            },
          ]);
          break;
        case "cat": {
          const f = args[0] || "";
          if (f === "about.md") {
            print([
              echo,
              {
                t: "fg",
                text: "Web dev for years. Switched lanes because breaking apps taught me more than building them.",
              },
            ]);
          } else if (f === "resume.pdf") {
            print([
              echo,
              {
                t: "err",
                text: "cat: resume.pdf: binary file (use download button below)",
              },
            ]);
          } else {
            print([
              echo,
              { t: "err", text: `cat: ${f || "<file>"}: no such file` },
            ]);
          }
          break;
        }
        default:
          print([
            echo,
            { t: "err", text: `command not found: ${name}. try 'help'.` },
          ]);
      }
    },
    [print, onTheme],
  );

  const onKey = (e) => {
    if (e.key === "Enter") {
      const v = value;
      if (v.trim()) setHistory((h) => [...h, v]);
      setHistIdx(-1);
      run(v);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setValue(history[idx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0 || histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setValue("");
      } else {
        setHistIdx(idx);
        setValue(history[idx]);
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines(initialLines);
    }
  };

  return (
    <div
      className="terminal"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      <div className="tbar">
        <div className="lights">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div>~/diogo-rdr</div>
        <div className="spacer-grow"></div>
        <div className="title">drod@cv — zsh</div>
      </div>
      <div className="body" ref={bodyRef}>
        {lines.map((l, i) => {
          if (l.echo !== undefined) {
            return (
              <div key={i} className="tline">
                <span className="prompt">drod@cv ❯ </span>
                <span className="arg">{l.echo}</span>
              </div>
            );
          }
          if (l.items) {
            return (
              <div key={i} className="tline">
                <div className="helpgrid">
                  {l.items.map(([c, d], j) => (
                    <React.Fragment key={j}>
                      <b>{c}</b>
                      <span className="dim" style={{ color: "var(--dim)" }}>
                        {d}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className={`tline ${l.t === "fg" ? "" : l.t}`}>
              {l.text}
            </div>
          );
        })}
      </div>
      <div className="tinput">
        <span className="p">drod@cv ❯</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}

window.Terminal = Terminal;
