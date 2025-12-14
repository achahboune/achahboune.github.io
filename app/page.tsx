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

  // Create chart once
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

  // Update chart on metric change
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
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: Poppins, system-ui, sans-serif;
          background: var(--bg);
          color: var(--dark);
        }
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 0 20px;
        }
        header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(245, 247, 251, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
          height: 48px;
        }
        .logo strong {
          color: var(--blue);
          font-size: 18px;
        }
        .logo span {
          display: block;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #4a5d7a;
          font-weight: 600;
        }
        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.4);
        }
        .hero {
          padding: 56px 0 40px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
        }
        .hero h1 {
          font-size: 48px;
          line-height: 1.08;
          margin: 0;
        }
        .hero h1 span {
          color: var(--blue);
        }
        .hero p {
          max-width: 520px;
          color: var(--muted);
          font-size: 16px;
          margin: 18px 0 26px;
        }
        .dashboard {
          background: var(--card);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 20px 50px rgba(6, 19, 37, 0.12);
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
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--ok);
          box-shadow: 0 0 0 5px rgba(46, 204, 113, 0.2);
        }
        .dashboard-menu {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }
        .dashboard-menu button {
          flex: 1;
          border: none;
          padding: 8px;
          border-radius: 10px;
          font-size: 12px;
          background: #eef3ff;
          cursor: pointer;
        }
        .dashboard-menu button.active {
          background: var(--blue);
          color: #fff;
        }
        .alert {
          font-size: 12px;
          margin: 6px 0;
        }
        .alert.ok {
          color: var(--ok);
        }
        .alert.warn {
          color: var(--warn);
        }
        .alert.risk {
          color: var(--risk);
        }
        .chartWrap {
          height: 150px;
        }
        section {
          padding: 56px 0;
        }
        .section-title {
          font-size: 32px;
          margin-bottom: 18px;
          line-height: 1.15;
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
        }
        .card h3 {
          color: var(--blue);
          margin-top: 0;
        }
        .popup-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9999;
          align-items: center;
          justify-content: center;
        }
        .popup-overlay.active {
          display: flex;
        }
        .popup {
          background: #fff;
          width: 720px;
          max-width: 95%;
          height: 82vh;
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .hero h1 {
            font-size: 34px;
          }
          .section-title {
            font-size: 26px;
          }
          .grid-3 {
            grid-template-columns: 1fr;
          }
          .dashboard {
            margin-top: 10px;
          }
        }
        @media (max-width: 420px) {
          .hero h1 {
            font-size: 30px;
          }
          .logo strong {
            font-size: 17px;
          }
          .logo span {
            font-size: 10px;
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
                <strong>blockchain-secured ledger</strong> to protect cold
                chains and critical assets.
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

      <section>
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
          <button className="popup-close" onClick={closePopup}>
            ×
          </button>
          <iframe title="Early access form" src={iframeSrc} />
        </div>
      </div>
    </>
  )
}
