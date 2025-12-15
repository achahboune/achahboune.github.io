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

  const metricConfig = useMemo(
    () => ({
      temp: {
        label: "Temp",
        color: "#f59e0b", // ORANGE
        data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
        status: "Temperature excursion detected",
        cls: "warn",
      },
      hum: {
        label: "Humidity",
        color: "#22c55e", // GREEN
        data: [45, 46, 44, 43, 42, 41],
        status: "Humidity stable",
        cls: "ok",
      },
      vib: {
        label: "Vibration",
        color: "#ef4444", // RED
        data: [1, 2, 8, 6, 2, 1],
        status: "Critical shock detected",
        cls: "risk",
      },
      co2: {
        label: "CO₂",
        color: "#a855f7", // PURPLE
        data: [400, 420, 480, 650, 720, 680],
        status: "CO₂ level rising",
        cls: "warn",
      },
    }),
    []
  )

  const active = metricConfig[metric]

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
            data: metricConfig.temp.data,
            borderColor: metricConfig.temp.color,
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
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

    return () => chartRef.current?.destroy()
  }, [metricConfig])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data = active.data as any
    chartRef.current.data.datasets[0].borderColor = active.color as any
    chartRef.current.update()
  }, [active])

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            #f5f7fb;
          color: #0b1c33;
        }
        .container {
          max-width: 1200px;
          margin: auto;
          padding: 0 24px;
        }
        header {
          position: sticky;
          top: 0;
          background: rgba(245, 247, 251, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #e5e7eb;
          z-index: 10;
        }
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
        }
        .btn {
          padding: 12px 22px;
          border-radius: 999px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1b73ff, #00c8ff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        .hero {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }
        h1 {
          font-size: clamp(36px, 4vw, 64px);
          margin: 0;
        }
        h1 span {
          color: #1b73ff;
        }

        .card {
          background: #fff;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
        }

        /* ===== DASHBOARD (tabs color fix) ===== */
        .dashTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .dashTitle {
          font-weight: 800;
        }
        .online {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #2b3d5a;
        }
        .dotOnline {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 5px rgba(34, 197, 94, 0.15);
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .tabBtn {
          flex: 1;
          border: none;
          border-radius: 12px;
          padding: 9px 10px;
          font-weight: 800;
          background: #eef2ff;
          cursor: pointer;
          font-size: 12px;
          color: #0b1c33;
        }
        .chartBox {
          height: 200px;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }
        .dashStatus {
          margin-top: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        /* ===== From sensors to proof ===== */
        .process {
          padding: 70px 0 22px; /* ↓ réduit le vide en bas */
          text-align: center;
        }
        .processTitle {
          margin: 0 0 8px;
          font-weight: 900;
        }
        .processSub {
          margin: 0 auto 26px;
          max-width: 760px;
          color: #6b7280;
          font-weight: 650;
        }
        .flowGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 8px;
        }
        .flowCard {
          text-align: left;
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.04);
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .flowBar {
          width: 4px;
          border-radius: 999px;
          flex: 0 0 4px;
          height: 100%;
          min-height: 54px;
          background: #1b73ff;
        }
        .flowBar.blue {
          background: #1b73ff;
        }
        .flowBar.orange {
          background: #f59e0b;
        }
        .flowBar.green {
          background: #22c55e;
        }
        .flowHead {
          font-weight: 900;
          margin-bottom: 6px;
        }
        .flowText {
          margin: 0;
          color: #4b5563;
          font-weight: 650;
          line-height: 1.45;
          font-size: 13px;
        }

        /* ===== Industries (moved up + centered title) ===== */
        .industries {
          padding: 10px 0 70px; /* ↑ remonte, enlève le vide */
          text-align: center;
        }
        .indTitle {
          margin: 0 0 22px;
          font-weight: 900;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          text-align: left;
        }

        /* ===== POPUP ===== */
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
        }
        .popup-overlay.active {
          display: flex;
        }
        .popup {
          width: 820px;
          max-width: 100%;
          height: 86vh;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.25);
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
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          .hero-grid,
          .flowGrid,
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* HEADER */}
      <header>
        <div className="container">
          <nav>
            <div style={{ fontWeight: 900 }}>Enthalpy</div>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Sensors you can trust.
              <br />
              <span>Evidence you can prove.</span>
            </h1>
            <p style={{ color: "#6b7280", fontWeight: 650, maxWidth: 620, lineHeight: 1.55 }}>
              Transform raw IoT data into cryptographically verified proof for compliance, insurance,
              and automated blockchain payments.
            </p>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </div>

          {/* DASHBOARD */}
          <div className="card">
            <div className="dashTop">
              <div className="dashTitle">Live monitoring</div>
              <div className="online">
                <span className="dotOnline" />
                Sensors online
              </div>
            </div>

            <div className="tabs">
              {(["temp", "hum", "vib", "co2"] as Metric[]).map((m) => {
                const isActive = metric === m
                return (
                  <button
                    key={m}
                    className="tabBtn"
                    onClick={() => setMetric(m)}
                    style={
                      isActive
                        ? {
                            background: metricConfig[m].color, // ✅ couleur paramètre
                            color: "#fff",
                          }
                        : undefined
                    }
                  >
                    {metricConfig[m].label}
                  </button>
                )
              })}
            </div>

            <div className="chartBox">
              <div style={{ height: 200, padding: 10 }}>
                <canvas ref={canvasRef} />
              </div>
            </div>

            <div className="dashStatus">{active.status}</div>
          </div>
        </div>
      </section>

      {/* FROM SENSORS TO PROOF */}
      <section className="process">
        <div className="container">
          <h2 className="processTitle">From sensors to proof</h2>
          <div className="processSub">
            Enthalpy turns real-world incidents into trusted digital evidence that can trigger compliance
            actions or payments.
          </div>

          <div className="flowGrid">
            <div className="flowCard">
              <div className="flowBar blue" />
              <div>
                <div className="flowHead">🔔 Sensor event</div>
                <p className="flowText">Temperature, vibration or CO₂ threshold exceeded.</p>
              </div>
            </div>

            <div className="flowCard">
              <div className="flowBar orange" />
              <div>
                <div className="flowHead">🔒 Blockchain proof</div>
                <p className="flowText">Event is hashed, timestamped and sealed on-chain.</p>
              </div>
            </div>

            <div className="flowCard">
              <div className="flowBar green" />
              <div>
                <div className="flowHead">✅ Compliance / Payment</div>
                <p className="flowText">Audit, penalty or automated payout is triggered.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES (moved up + centered title) */}
      <section className="industries">
        <div className="container">
          <h2 className="indTitle">Industries where a few degrees cost millions</h2>

          <div className="grid-3">
            <div className="card">
              <h3 style={{ margin: "0 0 8px", color: "#1b73ff" }}>Pharma &amp; Biotech</h3>
              <p style={{ margin: 0, color: "#6b7280", fontWeight: 650 }}>
                Audit-ready traceability.
              </p>
            </div>
            <div className="card">
              <h3 style={{ margin: "0 0 8px", color: "#1b73ff" }}>Food &amp; Frozen</h3>
              <p style={{ margin: 0, color: "#6b7280", fontWeight: 650 }}>
                Prevent cold-chain failures.
              </p>
            </div>
            <div className="card">
              <h3 style={{ margin: "0 0 8px", color: "#1b73ff" }}>Logistics &amp; 3PL</h3>
              <p style={{ margin: 0, color: "#6b7280", fontWeight: 650 }}>
                Proof of compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* POPUP */}
      <div className={`popup-overlay ${popupOpen ? "active" : ""}`}>
        <div className="popup">
          <button className="popup-close" onClick={() => setPopupOpen(false)} aria-label="Close">
            ×
          </button>
          <iframe title="Pilot access form" src={FORM_URL} />
        </div>
      </div>
    </>
  )
}
