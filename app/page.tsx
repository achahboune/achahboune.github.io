/* app/page.tsx */
"use client"

import React, { useEffect, useMemo, useState } from "react"

type Metric = "temp" | "humidity" | "vibration" | "co2"

const SERIES: Record<
  Metric,
  { label: string; unit: string; data: number[]; alert: string; yMin?: number; yMax?: number }
> = {
  temp: {
    label: "Temp",
    unit: "°C",
    data: [4.2, 4.1, 4.3, 4.8, 5.4, 5.9, 6.1, 6.0, 5.7, 5.4, 5.2],
    alert: "Temperature excursion detected",
    yMin: 4,
    yMax: 6.5,
  },
  humidity: {
    label: "Humidity",
    unit: "%",
    data: [58, 57, 58, 60, 62, 66, 68, 67, 65, 63, 62],
    alert: "Humidity drift detected",
    yMin: 50,
    yMax: 75,
  },
  vibration: {
    label: "Vibration",
    unit: "g",
    data: [0.12, 0.11, 0.13, 0.18, 0.22, 0.31, 0.28, 0.24, 0.21, 0.19, 0.17],
    alert: "Abnormal vibration detected",
    yMin: 0.05,
    yMax: 0.35,
  },
  co2: {
    label: "CO₂",
    unit: "ppm",
    data: [410, 415, 420, 435, 460, 520, 610, 690, 720, 710, 680],
    alert: "CO₂ level rising",
    yMin: 380,
    yMax: 760,
  },
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export default function Page() {
  // POPUP + FORM
  const [popupOpen, setPopupOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    website: "", // honeypot
  })

  // DASHBOARD
  const [metric, setMetric] = useState<Metric>("temp")

  function openPopup() {
    setPopupOpen(true)
    setSubmitted(false)
    setErrorMsg("")
    setForm({ name: "", company: "", email: "", message: "", website: "" })
  }

  function closePopup() {
    setPopupOpen(false)
    setErrorMsg("")
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")

    if (form.website.trim().length > 0) return // honeypot

    if (!form.company.trim()) return setErrorMsg("Company name is required.")
    if (!form.email.trim()) return setErrorMsg("Work email is required.")
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setErrorMsg("Please enter a valid email.")
    if (!form.message.trim()) return setErrorMsg("Message is required.")

    setSubmitting(true)
    try {
      const res = await fetch("/api/pilot-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          website: form.website.trim(),
        }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setErrorMsg(data?.error || `Something went wrong. (${res.status})`)
        return
      }

      setSubmitted(true)
    } catch {
      setErrorMsg("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // ESC close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopupOpen(false)
    }
    if (popupOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [popupOpen])

  const chart = useMemo(() => {
    const s = SERIES[metric]
    const W = 560
    const H = 230
    const padX = 18
    const padY = 16

    const min =
      typeof s.yMin === "number" ? s.yMin : Math.min(...s.data) - (Math.max(...s.data) - Math.min(...s.data)) * 0.08
    const max =
      typeof s.yMax === "number" ? s.yMax : Math.max(...s.data) + (Math.max(...s.data) - Math.min(...s.data)) * 0.08

    const points = s.data
      .map((v, i) => {
        const x = padX + (i / (s.data.length - 1)) * (W - padX * 2)
        const t = (v - min) / (max - min || 1)
        const y = padY + (1 - clamp(t, 0, 1)) * (H - padY * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")

    return { W, H, padX, padY, min, max, points, s }
  }, [metric])

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --dark: #0b1c33;
          --muted: #6c7a92;
          --bg: #f5f7fb;
          --card: #ffffff;
          --ok: #22c55e;
          --warn: #f59e0b;
          --risk: #ef4444;
          --label: #51627f;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          font-weight: 400;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            var(--bg);
          color: var(--dark);
        }

        strong,
        b {
          font-weight: 520;
        }

        .container {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(245, 247, 251, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo img {
          height: 52px;
          width: auto;
        }

        .logo strong {
          color: var(--dark);
          font-size: 18px;
          line-height: 1;
          font-weight: 560;
        }

        .logo span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #4a5d7a;
          font-weight: 520;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 520;
          cursor: pointer;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        .btn-ghost {
          background: rgba(0, 0, 0, 0.04);
          color: #0b1c33;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .hero {
          padding: 46px 0 26px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 40px;
          align-items: start;
        }

        .heroLeft {
          position: relative;
          padding: 6px 0;
        }

        /* 👇 Filigrane (côté gauche) */
        .heroLeft::before {
          content: "";
          position: absolute;
          inset: -80px -40px -80px -120px;
          background: url("/assets/hero-connectivity-bg.png") left center / cover no-repeat;
          opacity: 0.24;
          filter: saturate(1.05) contrast(1.05);
          pointer-events: none;
          z-index: 0;
          mask-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.95) 45%,
            rgba(0, 0, 0, 0) 78%
          );
        }

        /* 👇 voile pour garder la lisibilité du texte */
        .heroLeft::after {
          content: "";
          position: absolute;
          inset: -80px -40px -80px -120px;
          background: linear-gradient(90deg, rgba(245, 247, 251, 0.94), rgba(245, 247, 251, 0.78), rgba(245, 247, 251, 0));
          pointer-events: none;
          z-index: 0;
        }

        .heroLeft > * {
          position: relative;
          z-index: 1;
        }

        h1 {
          font-size: clamp(36px, 4.3vw, 64px);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.04;
          font-weight: 620;
        }

        h1 .accent {
          color: var(--blue);
        }

        .hero-copy {
          margin-top: 14px;
          color: #2b3d5a;
          font-weight: 400;
          max-width: 620px;
          line-height: 1.6;
          font-size: 14px;
        }

        .hero-tagline {
          margin-top: 12px;
          color: var(--blue);
          font-weight: 520;
          font-size: 13px;
        }

        /* DASHBOARD CARD */
        .dashCard {
          background: var(--card);
          border-radius: 18px;
          padding: 14px 14px 12px;
          box-shadow: 0 22px 60px rgba(6, 19, 37, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .dashTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 4px 10px;
        }

        .dashTitle {
          font-weight: 560;
          font-size: 13px;
          color: #0b1c33;
          letter-spacing: -0.01em;
        }

        .online {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #2b3d5a;
          font-weight: 450;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.18);
          padding: 6px 10px;
          border-radius: 999px;
        }

        .onlineDot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: var(--ok);
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 2px 0 10px;
        }

        .tab {
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 520;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(0, 0, 0, 0.02);
          cursor: pointer;
          color: #0b1c33;
        }

        .tabActive {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.35);
        }

        .chartWrap {
          background: linear-gradient(180deg, rgba(27, 115, 255, 0.06), rgba(255, 255, 255, 1));
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 14px;
          padding: 10px 10px 6px;
          overflow: hidden;
        }

        .axisLabel {
          font-size: 11px;
          fill: rgba(11, 28, 51, 0.55);
          font-weight: 500;
        }

        .alert {
          margin-top: 8px;
          font-size: 12px;
          color: #7a4d00;
          font-weight: 520;
        }

        .chips {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 450;
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #0b1c33;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--blue);
          box-shadow: 0 0 0 5px rgba(27, 115, 255, 0.12);
        }

        .dotOk {
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.12);
        }

        .dotWarn {
          background: var(--warn);
          box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.12);
        }

        .centerTitle {
          text-align: center;
          font-weight: 520;
          font-size: 18px;
          margin: 26px 0 6px;
          letter-spacing: -0.01em;
        }

        .centerSub {
          text-align: center;
          margin: 0 auto 22px;
          max-width: 760px;
          color: var(--muted);
          font-weight: 400;
          font-size: 13px;
        }

        .grid3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .stepCard {
          background: #fff;
          border-radius: 14px;
          padding: 18px 18px 16px;
          box-shadow: 0 14px 40px rgba(6, 19, 37, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          min-height: 96px;
          display: grid;
          grid-template-columns: 10px 1fr;
          gap: 12px;
          align-items: start;
        }

        .bar {
          width: 4px;
          border-radius: 999px;
          height: 100%;
        }

        .stepTitle {
          font-weight: 520;
          margin: 0 0 4px;
          font-size: 13px;
        }

        .stepText {
          margin: 0;
          color: #2b3d5a;
          font-weight: 400;
          font-size: 12px;
          line-height: 1.4;
        }

        .industryTitle {
          text-align: center;
          font-weight: 520;
          font-size: 20px;
          margin: 26px 0 14px;
          letter-spacing: -0.01em;
        }

        .industryCard {
          background: #fff;
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(6, 19, 37, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .industryCard h3 {
          margin: 0 0 6px;
          color: var(--blue);
          font-weight: 520;
          font-size: 14px;
        }

        .industryCard p {
          margin: 0;
          color: #2b3d5a;
          font-weight: 400;
          font-size: 12px;
        }

        .footer {
          text-align: center;
          padding: 26px 0 34px;
          color: #2b3d5a;
          font-weight: 400;
          font-size: 12px;
        }

        .footer .email {
          font-weight: 520;
          color: #0b1c33;
          font-size: 13px;
        }

        .footer .loc {
          margin-top: 6px;
          color: #6c7a92;
          font-weight: 450;
        }

        /* POPUP */
        .popup-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .popup-overlay.active {
          display: flex;
        }

        .popup {
          background: #fff;
          width: 720px;
          max-width: 100%;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .popupHead {
          padding: 18px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: linear-gradient(180deg, rgba(27, 115, 255, 0.06), rgba(255, 255, 255, 1));
        }

        .popupTitle {
          margin: 0;
          font-weight: 520;
          letter-spacing: -0.02em;
          font-size: 18px;
        }

        .popupSub {
          margin: 6px 0 0;
          color: #2b3d5a;
          font-weight: 400;
          font-size: 12px;
          line-height: 1.4;
        }

        .popupBody {
          padding: 16px 18px 18px;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 450;
          color: var(--label);
          margin: 0 0 6px;
        }

        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          padding: 12px 12px;
          font-size: 13px;
          font-weight: 400;
          outline: none;
          background: #fff;
          color: #0b1c33;
        }

        input:focus,
        textarea:focus {
          border-color: rgba(27, 115, 255, 0.55);
          box-shadow: 0 0 0 4px rgba(27, 115, 255, 0.12);
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        .actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .err {
          margin-top: 10px;
          color: #b91c1c;
          font-weight: 450;
          font-size: 12px;
        }

        .successBox {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(34, 197, 94, 0.14), rgba(34, 197, 94, 0.08));
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #0b1c33;
          font-weight: 400;
          font-size: 13px;
          line-height: 1.45;
        }

        .successIcon {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(34, 197, 94, 0.18);
          border: 1px solid rgba(34, 197, 94, 0.28);
          font-weight: 700;
          color: #15803d;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .popup-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        .hp {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .grid3 {
            grid-template-columns: 1fr;
          }
          .row {
            grid-template-columns: 1fr;
          }
          .heroLeft::before,
          .heroLeft::after {
            inset: -80px -24px -80px -24px;
            mask-image: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" alt="Enthalpy" />
              <div>
                <strong>Enthalpy</strong>
                <span>COLD &amp; CRITICAL MONITORING</span>
              </div>
            </div>

            <button className="btn btn-primary" onClick={openPopup}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="heroLeft">
              <h1>
                Smart IoT sensors for critical goods.
                <br />
                <span className="accent">Clear proof when something goes wrong.</span>
              </h1>

              <div className="hero-copy">
                Enthalpy monitors <strong>temperature</strong>, <strong>humidity</strong>, <strong>vibration</strong> and{" "}
                <strong>CO₂</strong> in real time — in warehouses, trucks, and containers <strong>even at sea</strong> via
                cellular and satellite connectivity.
                <br />
                If an incident happens, it is automatically recorded and sealed into a <strong>blockchain ledger</strong>,
                turning it into trusted proof for <strong>audits</strong>, <strong>insurance</strong> and{" "}
                <strong>compliance</strong>.
              </div>

              <div className="hero-tagline">From sensors → proof → payment.</div>
            </div>

            {/* DASHBOARD (graphs) */}
            <div className="dashCard">
              <div className="dashTop">
                <div className="dashTitle">Live monitoring</div>
                <div className="online">
                  <span className="onlineDot" />
                  Sensors online
                </div>
              </div>

              <div className="tabs">
                {(["temp", "humidity", "vibration", "co2"] as Metric[]).map((m) => (
                  <button
                    key={m}
                    className={`tab ${metric === m ? "tabActive" : ""}`}
                    onClick={() => setMetric(m)}
                    type="button"
                  >
                    {SERIES[m].label}
                  </button>
                ))}
              </div>

              <div className="chartWrap">
                <svg width="100%" viewBox={`0 0 ${chart.W} ${chart.H}`} role="img" aria-label="Sensor chart">
                  {/* grid */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = chart.padY + (i / 4) * (chart.H - chart.padY * 2)
                    return (
                      <line
                        key={i}
                        x1={chart.padX}
                        y1={y}
                        x2={chart.W - chart.padX}
                        y2={y}
                        stroke="rgba(11, 28, 51, 0.08)"
                        strokeWidth="1"
                      />
                    )
                  })}

                  {/* axis labels (min/max) */}
                  <text x={chart.padX} y={14} className="axisLabel">
                    {chart.max.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                  </text>
                  <text x={chart.padX} y={chart.H - 4} className="axisLabel">
                    {chart.min.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                  </text>

                  {/* line */}
                  <polyline
                    points={chart.points}
                    fill="none"
                    stroke="rgba(27,115,255,0.95)"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="alert">{chart.s.alert}</div>

              <div className="chips">
                <span className="chip">
                  <span className="dot dotWarn" />
                  Incident captured
                </span>
                <span className="chip">
                  <span className="dot" />
                  Cellular + Satellite
                </span>
                <span className="chip">
                  <span className="dot dotOk" />
                  Blockchain proof
                </span>
              </div>
            </div>
          </div>

          <div className="centerTitle">From sensors to proof</div>
          <div className="centerSub">
            Enthalpy turns real-world incidents into trusted evidence that can trigger compliance actions or payments.
          </div>

          <div className="grid3">
            <div className="stepCard">
              <div className="bar" style={{ background: "#1b73ff" }} />
              <div>
                <p className="stepTitle">🔔 Sensor event</p>
                <p className="stepText">A threshold is exceeded (temperature, vibration, CO₂...).</p>
              </div>
            </div>

            <div className="stepCard">
              <div className="bar" style={{ background: "#f59e0b" }} />
              <div>
                <p className="stepTitle">🧾 Evidence + timestamp</p>
                <p className="stepText">Data is captured, timestamped, and stored for traceability.</p>
              </div>
            </div>

            <div className="stepCard">
              <div className="bar" style={{ background: "#22c55e" }} />
              <div>
                <p className="stepTitle">🔒 Blockchain ledger</p>
                <p className="stepText">The incident is sealed into a blockchain record you can prove.</p>
              </div>
            </div>
          </div>

          <div className="industryTitle">Industries where a few degrees cost millions</div>

          <div className="grid3">
            <div className="industryCard">
              <h3>Pharma &amp; Biotech</h3>
              <p>Audit-ready traceability.</p>
            </div>
            <div className="industryCard">
              <h3>Food &amp; Frozen</h3>
              <p>Prevent cold-chain failures.</p>
            </div>
            <div className="industryCard">
              <h3>Logistics &amp; 3PL</h3>
              <p>Proof of compliance.</p>
            </div>
          </div>

          <div className="footer">
            <div className="email">contact@enthalpy.site</div>
            <div className="loc">Tangier, Morocco</div>
          </div>
        </div>
      </section>

      {/* POPUP */}
      <div
        className={`popup-overlay ${popupOpen ? "active" : ""}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closePopup()
        }}
      >
        <div className="popup" onMouseDown={(e) => e.stopPropagation()}>
          <button className="popup-close" onClick={closePopup} aria-label="Close">
            ×
          </button>

          <div className="popupHead">
            <h3 className="popupTitle">Request pilot access</h3>
            <p className="popupSub">Tell us about your company and use case. We’ll reply quickly.</p>
          </div>

          <div className="popupBody">
            {submitted ? (
              <div className="successBox">
                <div className="successIcon">✓</div>
                <div>
                  ✅ Request received. A confirmation email has been sent. If you don’t see it, please check Spam or contact{" "}
                  <b>contact@enthalpy.site</b>.
                </div>
              </div>
            ) : (
              <form onSubmit={submitForm}>
                {/* Honeypot */}
                <div className="hp">
                  <label>
                    Website
                    <input name="website" value={form.website} onChange={onChange} autoComplete="off" />
                  </label>
                </div>

                <div className="row">
                  <div>
                    <label>Name (optional)</label>
                    <input
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={onChange}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label>Company Name *</label>
                    <input
                      name="company"
                      placeholder="Company"
                      value={form.company}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Work Email *</label>
                  <input
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={onChange}
                    required
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Message *</label>
                  <textarea
                    name="message"
                    placeholder="What do you monitor? (assets, routes, limits, alerts needed...)"
                    value={form.message}
                    onChange={onChange}
                    required
                  />
                </div>

                {errorMsg ? <div className="err">{errorMsg}</div> : null}

                <div className="actions">
                  <button type="button" className="btn btn-ghost" onClick={closePopup} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Sending..." : "Submit request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
