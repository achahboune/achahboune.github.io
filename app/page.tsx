"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Chart from "chart.js/auto"

type Metric = "temp" | "hum" | "vib" | "co2"

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKqc44-iXAAwxkk2NEWLodNMkshh4u31NP1bWBRvmAcu1GIA/viewform?embedded=true"

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const [metric, setMetric] = useState<Metric>("temp")
  const [popupOpen, setPopupOpen] = useState(false)
  const [iframeSrc, setIframeSrc] = useState<string>("")

  const metricConfig = useMemo(() => {
    const cfg: Record<
      Metric,
      { label: string; data: number[]; text: string; cls: "ok" | "warn" | "risk" }
    > = {
      temp: {
        label: "Temp",
        data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
        text: "Warning: Temperature excursion",
        cls: "warn",
      },
      hum: {
        label: "Humidity",
        data: [45, 46, 44, 43, 42, 41],
        text: "Status: Normal humidity",
        cls: "ok",
      },
      vib: {
        label: "Vibration",
        data: [1, 2, 8, 6, 2, 1],
        text: "Risk: Shock detected",
        cls: "risk",
      },
      co2: {
        label: "CO₂",
        data: [400, 420, 480, 650, 720, 680],
        text: "Warning: CO₂ rising",
        cls: "warn",
      },
    }
    return cfg
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["00h", "04h", "08h", "12h", "16h", "20h"],
        datasets: [
          {
            data: [4.2, 4.3, 4.5, 4.4, 4.6, 4.3],
            borderColor: "#1b73ff",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(0,0,0,.06)" } },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    c.data.datasets[0].data = metricConfig[metric].data as any
    c.update()
  }, [metric, metricConfig])

  function openPopup() {
    setPopupOpen(true)
    setIframeSrc("")
    setTimeout(() => setIframeSrc(FORM_URL), 40)
  }

  function closePopup() {
    setPopupOpen(false)
  }

  const alertText = metricConfig[metric].text
  const alertCls = metricConfig[metric].cls

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --dark: #0b1c33;
          --muted: #6c7a92;
          --bg: #f5f7fb;
          --card: #ffffff;
          --ok: #2ecc71;
          --warn: #f1c40f;
          --risk: #e74c3c;
        }

        body {
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            var(--bg);
          color: var(--dark);
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
          background: rgba(245, 247, 251, 0.9);
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
          gap: 10px;
        }

        .logo img {
          height: 44px;
          width: auto;
        }

        .logo strong {
          color: var(--blue);
          font-size: 18px;
          line-height: 1;
        }

        .logo span {
          display: block;
          margin-top: 2px;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #4a5d7a;
          font-weight: 600;
          white-space: nowrap;
        }

        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease;
        }
        .btn:active {
          transform: translateY(1px);
        }

        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        /* IMPORTANT: hero plein écran (corrige la page “vide”) */
        .hero {
          padding: 42px 0 24px;
          min-height: calc(100dvh - 72px);
          display: flex;
          align-items: center;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        .hero h1 {
          font-size: clamp(36px, 4.2vw, 64px);
          line-height: 1.05;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .hero h1 span {
          color: var(--blue);
        }

        .hero p {
          max-width: 560px;
          color: var(--muted);
          font-size: 16px;
          margin: 18px 0 26px;
        }

        .dashboard {
          background: var(--card);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 22px 60px rgba(6, 19, 37, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #2b3d5a;
          font-weight: 600;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(46, 204, 113, 0.18);
        }

        .dashboard-menu {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }

        .dashboard-menu button {
          flex: 1;
          border: 1px solid rgba(0, 0, 0, 0.06);
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
          background: #eef3ff;
          cursor: pointer;
          font-weight: 700;
        }

        .dashboard-menu button.active {
          background: var(--blue);
          color: #fff;
          border-color: rgba(27, 115, 255, 0.4);
        }

        .alert {
          font-size: 12px;
          margin: 8px 0 10px;
          font-weight: 700;
        }
        .alert.ok {
          color: var(--ok);
        }
        .alert.warn {
          color: #b08900;
        }
        .alert.risk {
          color: var(--risk);
        }

        .chartWrap {
          height: 170px;
        }

        section.block {
          padding: 56px 0 80px;
        }

        .section-title {
          font-size: clamp(22px, 2.2vw, 34px);
          margin: 0 0 18px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .card {
          background: #fff;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 14px 40px rgba(6, 19, 37, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .card h3 {
          color: var(--blue);
          margin: 0 0 8px;
        }

        .card p {
          margin: 0;
          color: var(--muted);
          font-weight: 600;
        }

        /* Popup */
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
          width: 780px;
          max-width: 100%;
          height: 86vh;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
        }
        .popup iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .popup-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          .hero {
            min-height: auto;
            padding: 34px 0 18px;
          }
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

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

      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <h1>
                Sensors you can trust.
                <br />
                <span>Evidence you can prove.</span>
              </h1>
              <p>
                Enthalpy combines <strong>IoT sensors</strong> and a{" "}
                <strong>blockchain-secured ledger</strong> to protect cold chains and critical assets.
              </p>
              <button className="btn btn-primary" onClick={openPopup}>
                Request pilot access
              </button>
            </div>

            <div className="dashboard">
              <div className="dashboard-header">
                <strong>Live monitoring</strong>
                <div className="status">
                  <div className="dot" />
                  Sensors online
                </div>
              </div>

              <div className="dashboard-menu">
                {(["temp", "hum", "vib", "co2"] as Metric[]).map((m) => (
                  <button
                    key={m}
                    className={metric === m ? "active" : ""}
                    onClick={() => setMetric(m)}
                  >
                    {metricConfig[m].label}
                  </button>
                ))}
              </div>

              <div className={`alert ${alertCls}`}>{alertText}</div>

              <div className="chartWrap">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <h2 className="section-title">
            Industries where a few degrees
            <br />
            cost millions
          </h2>

          <div className="grid-3">
            <div className="card">
              <h3>Pharma &amp; Biotech</h3>
              <p>Audit-ready traceability.</p>
            </div>
            <div className="card">
              <h3>Food &amp; Frozen</h3>
              <p>Prevent cold-chain failures.</p>
            </div>
            <div className="card">
              <h3>Logistics &amp; 3PL</h3>
              <p>Proof of compliance.</p>
            </div>
          </div>
        </div>
      </section>

      <div className={`popup-overlay ${popupOpen ? "active" : ""}`}>
        <div className="popup">
          <button className="popup-close" onClick={closePopup} aria-label="Close">
            ×
          </button>
          <iframe title="Early access form" src={iframeSrc} />
        </div>
      </div>
    </>
  )
}
