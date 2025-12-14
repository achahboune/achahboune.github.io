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
  const [iframeSrc, setIframeSrc] = useState("")

  const metricConfig = useMemo(
    () => ({
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
    }),
    []
  )

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
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [metricConfig])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.data.datasets[0].data =
      metricConfig[metric].data as any
    chartRef.current.update()
  }, [metric, metricConfig])

  const openPopup = () => {
    setPopupOpen(true)
    setIframeSrc("")
    setTimeout(() => setIframeSrc(FORM_URL), 50)
  }

  const closePopup = () => setPopupOpen(false)

  return (
    <>
      <style jsx global>{`
        :root {
          --blue: #1b73ff;
          --bg: #f5f7fb;
          --card: #fff;
          --text: #0b1c33;
          --muted: #6c7a92;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: Poppins, system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
        }
        .container {
          max-width: 1280px;
          margin: auto;
          padding: 0 24px;
        }
        header {
          position: fixed;
          inset: 0 0 auto 0;
          height: 72px;
          background: rgba(245, 247, 251, 0.9);
          backdrop-filter: blur(10px);
          z-index: 10;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        nav {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo img {
          height: 42px;
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
          box-shadow: 0 14px 30px rgba(27, 115, 255, 0.35);
        }

        /* HERO FULL SCREEN */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 72px;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          align-items: center;
          width: 100%;
        }
        h1 {
          font-size: 52px;
          line-height: 1.1;
          margin: 0;
        }
        h1 span {
          color: var(--blue);
        }
        p {
          color: var(--muted);
          max-width: 520px;
        }
        .dashboard {
          background: var(--card);
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 30px 60px rgba(6, 19, 37, 0.12);
        }
        .dashboard-menu {
          display: flex;
          gap: 6px;
          margin: 12px 0;
        }
        .dashboard-menu button {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: none;
          background: #eef3ff;
          cursor: pointer;
        }
        .dashboard-menu button.active {
          background: var(--blue);
          color: white;
        }
        .chart {
          height: 180px;
        }

        section {
          padding: 120px 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        footer {
          padding: 120px 0;
          text-align: center;
          background: linear-gradient(
            to bottom,
            rgba(245, 247, 251, 0),
            rgba(245, 247, 251, 1)
          );
        }

        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          h1 {
            font-size: 36px;
          }
        }
      `}</style>

      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" />
              <strong>Enthalpy</strong>
            </div>
            <button className="btn btn-primary" onClick={openPopup}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <h1>
                Sensors you can trust.
                <br />
                <span>Evidence you can prove.</span>
              </h1>
              <p>
                IoT sensors + blockchain-secured ledger for audit-ready cold
                chain monitoring.
              </p>
              <button className="btn btn-primary" onClick={openPopup}>
                Request pilot access
              </button>
            </div>

            <div className="dashboard">
              <strong>Live monitoring</strong>
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
              <div className="chart">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container">
            <h2>Industries where a few degrees cost millions</h2>
            <div className="grid-3">
              <div className="card">Pharma & Biotech</div>
              <div className="card">Food & Frozen</div>
              <div className="card">Logistics & 3PL</div>
            </div>
          </div>
        </section>

        <footer>
          <h2>Turn incidents into evidence.</h2>
          <p>Start with a pilot. Get audit-ready proof in days.</p>
          <button className="btn btn-primary" onClick={openPopup}>
            Request pilot access
          </button>
        </footer>
      </main>

      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 50,
          }}
          onClick={closePopup}
        >
          <iframe
            src={iframeSrc}
            style={{
              width: "90%",
              height: "90%",
              borderRadius: 20,
              border: "none",
              margin: "5% auto",
              display: "block",
              background: "#fff",
            }}
          />
        </div>
      )}
    </>
  )
}
