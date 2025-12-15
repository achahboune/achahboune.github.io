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

  const metricConfig = useMemo(() => ({
    temp: {
      label: "Temp",
      data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
      event: "Temperature excursion detected",
    },
    hum: {
      label: "Humidity",
      data: [45, 46, 44, 43, 42, 41],
      event: "Humidity within safe range",
    },
    vib: {
      label: "Vibration",
      data: [1, 2, 8, 6, 2, 1],
      event: "Shock / vibration event detected",
    },
    co2: {
      label: "CO₂",
      data: [400, 420, 480, 650, 720, 680],
      event: "CO₂ threshold exceeded",
    },
  }), [])

  /* ===== Chart ===== */
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
            borderColor: "#1b73ff",
            tension: 0.4,
            borderWidth: 2,
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
    chartRef.current.data.datasets[0].data = metricConfig[metric].data as any
    chartRef.current.update()
  }, [metric, metricConfig])

  return (
    <>
      {/* ===== GLOBAL STYLE ===== */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(1200px 600px at 70% 0%, rgba(27,115,255,.12), transparent 60%), #f5f7fb;
          color: #0b1c33;
        }
        .container { max-width: 1200px; margin: auto; padding: 0 24px; }
        header { position: sticky; top: 0; background: rgba(245,247,251,.95); backdrop-filter: blur(10px); border-bottom: 1px solid #ddd; z-index: 10; }
        nav { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; }

        .logo { display: flex; align-items: center; gap: 10px; font-weight: 800; }
        .logo img { height: 34px; }

        .btn { padding: 12px 22px; border-radius: 999px; border: none; font-weight: 700; cursor: pointer; }
        .btn-primary { background: linear-gradient(135deg, #1b73ff, #00c8ff); color: #fff; box-shadow: 0 14px 30px rgba(27,115,255,.35); }

        .hero { min-height: calc(100vh - 70px); display: flex; align-items: center; }
        .hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 40px; }

        h1 { font-size: clamp(38px, 4vw, 64px); line-height: 1.05; margin: 0; }
        h1 span { color: #1b73ff; }
        .hero p { color: #5f6f86; max-width: 520px; }

        .monitor { background: #fff; border-radius: 18px; padding: 16px; box-shadow: 0 20px 50px rgba(0,0,0,.12); }
        .monitor-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
        .online { color: #2ecc71; display: flex; align-items: center; gap: 6px; }
        .online i { width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; }

        .tabs { display: flex; gap: 6px; margin: 12px 0; }
        .tabs button {
          flex: 1; font-size: 11px; font-weight: 700;
          border-radius: 8px; border: none;
          background: #eef3ff; color: #1b73ff;
          padding: 6px; cursor: pointer;
        }
        .tabs button.active { background: #1b73ff; color: #fff; }

        .chart { height: 160px; }

        .log {
          margin-top: 14px;
          padding: 10px;
          border-radius: 12px;
          background: #f8faff;
          font-size: 12px;
        }

        .badge { font-size: 11px; font-weight: 700; color: #1b73ff; }

        footer { padding: 80px 0; text-align: center; background: #fff; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" alt="Enthalpy" />
              Enthalpy
            </div>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Sensors you can trust.<br />
              <span>Evidence you can prove.</span>
            </h1>
            <p>
              Transform raw IoT data into cryptographically verified proof for compliance,
              insurance, and automated blockchain payments.
            </p>
            <p><strong>From sensors → proof → payment.</strong></p>

            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </div>

          <div className="monitor">
            <div className="monitor-header">
              <span>Live monitoring</span>
              <span className="online"><i /> Sensors online</span>
            </div>

            <div className="tabs">
              {(Object.keys(metricConfig) as Metric[]).map(m => (
                <button
                  key={m}
                  className={metric === m ? "active" : ""}
                  onClick={() => setMetric(m)}
                >
                  {metricConfig[m].label}
                </button>
              ))}
            </div>

            <div className="chart">
              <canvas ref={canvasRef} />
            </div>

            <div className="log">
              <strong>{metricConfig[metric].event}</strong><br />
              Event sealed on blockchain ledger<br />
              <span className="badge">🔐 Blockchain-sealed · 💸 Payment-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer>
        <p>contact@enthalpy.site · Tangier, Morocco</p>
        <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
          Request pilot access
        </button>
      </footer>

      {/* ===== POPUP ===== */}
      {popupOpen && (
        <div className="popup-overlay" onClick={() => setPopupOpen(false)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <iframe src={FORM_URL} />
          </div>
        </div>
      )}
    </>
  )
}
