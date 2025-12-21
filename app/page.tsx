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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPopupOpen(false)
    }
    if (popupOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [popupOpen])

  const chart = useMemo(() => {
    const s = SERIES[metric]
    const W = 900
    const H = 420
    const padX = 26
    const padY = 22

    const min =
      typeof s.yMin === "number"
        ? s.yMin
        : Math.min(...s.data) - (Math.max(...s.data) - Math.min(...s.data)) * 0.08

    const max =
      typeof s.yMax === "number"
        ? s.yMax
        : Math.max(...s.data) + (Math.max(...s.data) - Math.min(...s.data)) * 0.08

    const pts = s.data.map((v, i) => {
      const x = padX + (i / (s.data.length - 1)) * (W - padX * 2)
      const t = (v - min) / (max - min || 1)
      const y = padY + (1 - clamp(t, 0, 1)) * (H - padY * 2)
      return { x, y }
    })

    const points = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
    const area = [
      `${padX},${H - padY}`,
      ...pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `${W - padX},${H - padY}`,
    ].join(" ")

    return { W, H, padX, padY, min, max, points, area, s }
  }, [metric])

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --cyan: #00c8ff;
          --dark: #071628;
          --glass: rgba(255, 255, 255, 0.42);
          --shadow: 0 30px 90px rgba(0, 0, 0, 0.22);
          --shadow2: 0 18px 60px rgba(0, 0, 0, 0.16);
          --ok: #22c55e;
          --warn: #f59e0b;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          height: 100%;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: var(--dark);
          overflow-x: hidden;

          /* ✅ BACKGROUND PLEIN ÉCRAN */
          background: url("/assets/bg-ocean.jpg") center / cover no-repeat fixed;
        }

        /* voile global pro */
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          background:
            radial-gradient(1100px 620px at 14% 10%, rgba(255, 255, 255, 0.60), rgba(255, 255, 255, 0.08)),
            radial-gradient(1400px 900px at 86% 16%, rgba(27, 115, 255, 0.16), rgba(27, 115, 255, 0.02)),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.10));
          pointer-events: none;
          z-index: 0;
        }

        .wrap {
          position: relative;
          z-index: 1;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
        }

        /* ✅ “container” plein écran (pas petit au milieu) */
        .container {
          width: min(1800px, calc(100vw - 64px)); /* 92vw environ */
          margin: 0 auto;
        }

        header {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 14px 0;
          background: rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }

        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand img {
          width: 46px;
          height: 46px;
        }

        .brand strong {
          display: block;
          font-weight: 650;
          font-size: 16px;
          line-height: 1.1;
        }

        .brand span {
          display: block;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: rgba(7, 22, 40, 0.62);
          font-weight: 650;
          margin-top: 3px;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.30);
          background: rgba(255, 255, 255, 0.14);
          color: #061325;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(12px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
          transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          filter: saturate(1.05);
        }

        .btnPrimary {
          border: none;
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          color: #fff;
          box-shadow: 0 18px 46px rgba(27, 115, 255, 0.34);
        }

        main {
          flex: 1;
          display: flex;
          align-items: stretch;
        }

        /* ✅ zone principale = PLEIN ÉCRAN */
        .stage {
          min-height: calc(100svh - 78px);
          padding: clamp(18px, 3vh, 44px) 0 22px;
          display: flex;
          flex-direction: column;
          justify-content: center; /* remplit la page */
          gap: 18px;
        }

        /* ✅ Grand “panel” pro comme les landing premium */
        .panel {
          width: 100%;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.20);
          backdrop-filter: blur(18px);
          box-shadow: var(--shadow);
          padding: clamp(18px, 2.2vw, 28px);
        }

        .layout {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 26px;
          align-items: stretch;

          /* ✅ grosse hauteur */
          min-height: min(820px, 78vh);
        }

        .glass {
          background: var(--glass);
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 22px;
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow2);
        }

        .heroCard {
          position: relative;
          overflow: hidden;
          padding: 28px 28px 22px;
        }

        .heroCard::before {
          content: "";
          position: absolute;
          inset: 0;
          background: url("/assets/hero-iot-proof.png") right center / cover no-repeat;
          opacity: 0.40;
          filter: saturate(1.08) contrast(1.06);
          pointer-events: none;
        }

        .heroCard::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.88) 0%,
            rgba(255, 255, 255, 0.62) 52%,
            rgba(255, 255, 255, 0.16) 100%
          );
          pointer-events: none;
        }

        .heroInner {
          position: relative;
          z-index: 2;
          max-width: 860px;
        }

        h1 {
          margin: 0;
          letter-spacing: -0.025em;
          line-height: 1.03;
          font-size: clamp(40px, 3.3vw, 58px);
          font-weight: 620;
        }

        .accent {
          color: var(--blue);
          font-weight: 620;
        }

        .lead {
          margin-top: 14px;
          font-size: 15.5px;
          line-height: 1.65;
          color: rgba(7, 22, 40, 0.78);
          font-weight: 560;
          max-width: 760px;
        }

        .chips {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.30);
          font-size: 12.5px;
          font-weight: 800;
          color: rgba(7, 22, 40, 0.82);
          backdrop-filter: blur(10px);
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--blue);
          box-shadow: 0 0 0 5px rgba(27, 115, 255, 0.16);
        }

        .dotOk {
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.16);
        }

        .dotWarn {
          background: var(--warn);
          box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.16);
        }

        .chartCard {
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .topRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .cardTitle {
          font-weight: 900;
          font-size: 13px;
          color: rgba(7, 22, 40, 0.86);
          letter-spacing: 0.02em;
        }

        .live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.14);
          border: 1px solid rgba(34, 197, 94, 0.18);
          font-size: 12px;
          font-weight: 850;
        }

        .liveDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--ok);
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .tab {
          border-radius: 999px;
          padding: 10px 10px;
          font-size: 12px;
          font-weight: 850;
          border: 1px solid rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.20);
          cursor: pointer;
          color: rgba(7, 22, 40, 0.86);
          backdrop-filter: blur(10px);
          transition: background 140ms ease, transform 140ms ease;
        }

        .tab:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.28);
        }

        .tabActive {
          background: rgba(27, 115, 255, 0.18);
          border-color: rgba(27, 115, 255, 0.25);
        }

        .chartWrap {
          background: rgba(255, 255, 255, 0.56);
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 18px;
          padding: 12px 12px 10px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          flex: 1;
          display: flex;
          align-items: center;
        }

        .axisLabel {
          font-size: 11px;
          fill: rgba(7, 22, 40, 0.58);
          font-weight: 850;
        }

        .alert {
          font-size: 12.5px;
          font-weight: 900;
          color: rgba(122, 77, 0, 0.95);
          background: rgba(245, 158, 11, 0.16);
          border: 1px solid rgba(245, 158, 11, 0.20);
          padding: 12px 14px;
          border-radius: 14px;
        }

        .features {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .feat {
          padding: 16px 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.26);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          box-shadow: var(--shadow2);
        }

        .feat strong {
          display: block;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .feat p {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.4;
          color: rgba(7, 22, 40, 0.72);
          font-weight: 650;
        }

        .footer {
          margin-top: 12px;
          text-align: center;
          color: rgba(255, 255, 255, 0.94);
          font-weight: 900;
          text-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }

        .footer small {
          display: block;
          margin-top: 6px;
          font-weight: 850;
          color: rgba(255, 255, 255, 0.84);
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
          background: rgba(255, 255, 255, 0.92);
          width: 720px;
          max-width: 100%;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(12px);
        }

        .popupHead {
          padding: 18px 18px 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: linear-gradient(180deg, rgba(27, 115, 255, 0.12), rgba(255, 255, 255, 0.92));
        }

        .popupTitle {
          margin: 0;
          font-weight: 950;
          letter-spacing: -0.02em;
          font-size: 18px;
        }

        .popupSub {
          margin: 6px 0 0;
          color: rgba(7, 22, 40, 0.78);
          font-weight: 700;
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
          font-weight: 850;
          color: rgba(7, 22, 40, 0.7);
          margin: 0 0 6px;
        }

        input,
        textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.16);
          padding: 12px 12px;
          font-size: 13px;
          font-weight: 800;
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          color: #061325;
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
          font-weight: 950;
          font-size: 12px;
        }

        .successBox {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px;
          border-radius: 14px;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #061325;
          font-weight: 800;
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
          font-weight: 950;
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
          background: rgba(255, 255, 255, 0.92);
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

        @media (max-width: 1120px) {
          .container {
            width: calc(100vw - 28px);
          }
          .layout {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          header {
            position: relative;
          }
          body {
            background-attachment: scroll;
          }
          .row {
            grid-template-columns: 1fr;
          }
          .features {
            grid-template-columns: 1fr;
          }
          .heroCard::before {
            opacity: 0.26;
          }
          .heroCard::after {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.60));
          }
        }
      `}</style>

      <div className="wrap">
        <header>
          <div className="container">
            <nav>
              <div className="brand">
                <img src="/assets/logo.png" alt="Enthalpy" />
                <div>
                  <strong>Enthalpy</strong>
                  <span>COLD &amp; CRITICAL MONITORING</span>
                </div>
              </div>

              <button className="btn btnPrimary" onClick={openPopup}>
                Request pilot access
              </button>
            </nav>
          </div>
        </header>

        <main>
          <div className="container">
            <div className="stage">
              <div className="panel">
                <div className="layout">
                  {/* HERO */}
                  <section className="glass heroCard">
                    <div className="heroInner">
                      <h1>
                        Smart IoT sensors for critical goods.
                        <br />
                        <span className="accent">Blockchain proof &amp; payment when something goes wrong.</span>
                      </h1>

                      <div className="lead">
                        Enthalpy monitors <b>temperature</b>, <b>humidity</b>, <b>vibration</b> and <b>CO₂</b> in real time
                        across <b>warehouses</b>, <b>trucks</b> and <b>containers</b>.
                        <br />
                        When an incident happens, the data is <b>timestamped</b> and sealed as <b>proof on blockchain</b> —
                        and the same blockchain record can trigger <b>automatic payment</b> (insurance, claims, SLA).
                      </div>

                      <div className="chips">
                        <span className="chip">
                          <span className="dot" />
                          Temperature • Humidity • CO₂ • Vibration
                        </span>
                        <span className="chip">
                          <span className="dot dotOk" />
                          Proof (blockchain-sealed)
                        </span>
                        <span className="chip">
                          <span className="dot dotWarn" />
                          Payment (blockchain-triggered)
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* CHART */}
                  <section className="glass chartCard" aria-label="Analytics">
                    <div className="topRow">
                      <div className="cardTitle">Analytics</div>
                      <div className="live">
                        <span className="liveDot" />
                        Live
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
                        <defs>
                          <linearGradient id="fillLine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(27,115,255,0.26)" />
                            <stop offset="100%" stopColor="rgba(27,115,255,0.02)" />
                          </linearGradient>
                        </defs>

                        {Array.from({ length: 5 }).map((_, i) => {
                          const y = chart.padY + (i / 4) * (chart.H - chart.padY * 2)
                          return (
                            <line
                              key={i}
                              x1={chart.padX}
                              y1={y}
                              x2={chart.W - chart.padX}
                              y2={y}
                              stroke="rgba(7, 22, 40, 0.10)"
                              strokeWidth="1"
                            />
                          )
                        })}

                        <text x={chart.padX} y={16} className="axisLabel">
                          {chart.max.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                        </text>
                        <text x={chart.padX} y={chart.H - 6} className="axisLabel">
                          {chart.min.toFixed(metric === "vibration" ? 2 : 0)} {chart.s.unit}
                        </text>

                        <polygon points={chart.area} fill="url(#fillLine)" />

                        <polyline
                          points={chart.points}
                          fill="none"
                          stroke="rgba(27,115,255,0.95)"
                          strokeWidth="4.0"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div className="alert">{chart.s.alert}</div>
                  </section>
                </div>

                <div className="features">
                  <div className="feat">
                    <strong>Evidence</strong>
                    <p>Incidents captured, timestamped, and stored as proof.</p>
                  </div>
                  <div className="feat">
                    <strong>Instant alerts</strong>
                    <p>Real-time notifications when limits are exceeded.</p>
                  </div>
                  <div className="feat">
                    <strong>Blockchain</strong>
                    <p>Proof + payment flows secured via blockchain records.</p>
                  </div>
                </div>

                <div className="footer">
                  contact@enthalpy.site
                  <small>Tangier, Morocco</small>
                </div>
              </div>
            </div>
          </div>
        </main>

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
                  <div className="hp">
                    <label>
                      Website
                      <input name="website" value={form.website} onChange={onChange} autoComplete="off" />
                    </label>
                  </div>

                  <div className="row">
                    <div>
                      <label>Name (optional)</label>
                      <input name="name" placeholder="Your name" value={form.name} onChange={onChange} autoComplete="name" />
                    </div>
                    <div>
                      <label>Company Name *</label>
                      <input name="company" placeholder="Company" value={form.company} onChange={onChange} required />
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
                    <button type="button" className="btn" onClick={closePopup} disabled={submitting}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btnPrimary" disabled={submitting}>
                      {submitting ? "Sending..." : "Submit request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
