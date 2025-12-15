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
    () =>
      ({
        temp: {
          label: "Temp",
          color: "#f59e0b", // orange
          data: [4.2, 4.4, 5.8, 6.1, 5.2, 4.6],
          status: "Warning: temperature excursion",
          level: "warn",
          badge: "Excursion",
        },
        hum: {
          label: "Humidity",
          color: "#22c55e", // green
          data: [45, 46, 44, 43, 42, 41],
          status: "Status: humidity stable",
          level: "ok",
          badge: "Normal",
        },
        vib: {
          label: "Vibration",
          color: "#ef4444", // red
          data: [1, 2, 8, 6, 2, 1],
          status: "Risk: shock detected",
          level: "risk",
          badge: "Shock",
        },
        co2: {
          label: "CO₂",
          color: "#a855f7", // purple
          data: [400, 420, 480, 650, 720, 680],
          status: "Warning: CO₂ rising",
          level: "warn",
          badge: "Rising",
        },
      }) satisfies Record<
        Metric,
        {
          label: string
          color: string
          data: number[]
          status: string
          level: "ok" | "warn" | "risk"
          badge: string
        }
      >,
    []
  )

  const active = metricConfig[metric]

  /* ================= CHART ================= */
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

  /* ================= UI ================= */
  return (
    <>
      {/* ================= GLOBAL STYLE ================= */}
      <style jsx global>{`
        :root {
          --bg: #f5f7fb;
          --text: #0b1c33;
          --muted: #6b7280;
          --card: #ffffff;
          --blue: #1b73ff;
          --shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
          --border: 1px solid #e5e7eb;

          --temp: ${metricConfig.temp.color};
          --hum: ${metricConfig.hum.color};
          --vib: ${metricConfig.vib.color};
          --co2: ${metricConfig.co2.color};
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(
              1200px 600px at 70% 0%,
              rgba(27, 115, 255, 0.12),
              transparent 60%
            ),
            var(--bg);
          color: var(--text);
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
          border-bottom: var(--border);
          z-index: 10;
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
          height: 40px;
          width: auto;
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
          padding: 22px 0;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        h1 {
          font-size: clamp(36px, 4vw, 60px);
          margin: 0;
          letter-spacing: -0.02em;
        }

        h1 span {
          color: var(--blue);
        }

        .lead {
          color: var(--muted);
          max-width: 640px;
          margin: 14px 0 18px;
          line-height: 1.5;
        }

        .tagline {
          margin-top: 10px;
          color: #1e3a8a;
          font-weight: 700;
        }

        .card {
          background: var(--card);
          border-radius: 20px;
          padding: 18px;
          box-shadow: var(--shadow);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .dashTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .liveTitle {
          font-weight: 800;
        }

        .online {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #2b3d5a;
          font-weight: 700;
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

        .tabBtn.active {
          color: white;
        }

        /* Active color per metric */
        .tabBtn.active.temp {
          background: var(--temp);
        }
        .tabBtn.active.hum {
          background: var(--hum);
        }
        .tabBtn.active.vib {
          background: var(--vib);
        }
        .tabBtn.active.co2 {
          background: var(--co2);
        }

        .chartBox {
          height: 200px;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }

        .statusRow {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          background: rgba(27, 115, 255, 0.08);
          border: 1px solid rgba(27, 115, 255, 0.15);
        }

        .pillDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${active.color};
          box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.05);
        }

        .miniLegend {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 11px;
          color: #344860;
          font-weight: 700;
        }

        .lgItem {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .lgDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .lgTemp {
          background: var(--temp);
        }
        .lgHum {
          background: var(--hum);
        }
        .lgVib {
          background: var(--vib);
        }
        .lgCo2 {
          background: var(--co2);
        }

        /* ===== PROCESS ===== */
        .process {
          padding: 80px 0;
        }

        .process h2 {
          text-align: center;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .process p.subtitle {
          text-align: center;
          color: var(--muted);
          max-width: 720px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .process-card {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          overflow: hidden;
        }

        .process-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            700px 220px at 20% 0%,
            rgba(27, 115, 255, 0.08),
            transparent 55%
          );
          pointer-events: none;
        }

        .pcTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          position: relative;
        }

        .pcTitle {
          font-weight: 900;
        }

        .pcBadge {
          font-size: 11px;
          font-weight: 900;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.08);
          white-space: nowrap;
        }

        .pcText {
          position: relative;
          margin: 10px 0 0;
          color: #46556b;
          font-weight: 650;
          line-height: 1.55;
        }

        /* ===== INDUSTRIES ===== */
        .industries {
          padding: 80px 0;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .indCard {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .indCard strong {
          display: block;
          margin-bottom: 6px;
        }

        .indCard p {
          margin: 0;
          color: #5a677a;
          font-weight: 650;
          line-height: 1.5;
        }

        footer {
          padding: 60px 0;
          text-align: center;
          background: #fff;
          border-top: var(--border);
        }

        footer p {
          margin: 6px 0;
          color: #3f4d61;
          font-weight: 650;
        }

        /* POPUP */
        .popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: ${popupOpen ? "flex" : "none"};
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 18px;
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
          .process-grid,
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header>
        <div className="container">
          <nav>
            <div className="logo">
              <img src="/assets/logo.png" alt="Enthalpy" />
              <strong>Enthalpy</strong>
            </div>
            <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
              Request pilot access
            </button>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Sensors you can trust.<br />
              <span>Evidence you can prove.</span>
            </h1>

            <p className="lead">
              Transform raw IoT data into <strong>cryptographically verified proof</strong> for
              compliance, insurance, and automated blockchain payments.
            </p>

            <p className="lead">
              Enthalpy seals critical events on a <strong>blockchain-secured event ledger</strong>,
              turning real-world incidents into audit-ready evidence that can trigger claims,
              penalties, or payouts.
            </p>

            <div className="tagline">From sensors → proof → payment.</div>

            <div style={{ marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
                Request pilot access
              </button>
            </div>
          </div>

          {/* DASHBOARD */}
          <div className="card">
            <div className="dashTop">
              <div className="liveTitle">Live monitoring</div>
              <div className="online">
                <span className="dotOnline" />
                Sensors online
              </div>
            </div>

            <div className="tabs">
              {(["temp", "hum", "vib", "co2"] as Metric[]).map((m) => (
                <button
                  key={m}
                  className={`tabBtn ${metric === m ? "active" : ""} ${m}`}
                  onClick={() => setMetric(m)}
                >
                  {metricConfig[m].label}
                </button>
              ))}
            </div>

            <div className="chartBox">
              <div style={{ height: 200, padding: 10 }}>
                <canvas ref={canvasRef} />
              </div>
            </div>

            <div className="statusRow">
              <div className="pill">
                <span className="pillDot" />
                {active.status}
              </div>

              <div className="miniLegend" aria-label="Legend">
                <span className="lgItem">
                  <span className="lgDot lgTemp" /> Temp
                </span>
                <span className="lgItem">
                  <span className="lgDot lgHum" /> Humidity
                </span>
                <span className="lgItem">
                  <span className="lgDot lgVib" /> Vibration
                </span>
                <span className="lgItem">
                  <span className="lgDot lgCo2" /> CO₂
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="process">
        <div className="container">
          <h2>From sensors to proof</h2>
          <p className="subtitle">
            Enthalpy converts operational incidents into tamper-proof evidence — ready for audits,
            insurers, and automated settlement.
          </p>

          <div className="process-grid">
            <div className="process-card">
              <div className="pcTop">
                <div className="pcTitle">📡 Capture</div>
                <div className="pcBadge">Sensor event</div>
              </div>
              <p className="pcText">
                Temperature excursion, vibration shock, humidity drift or CO₂ anomaly is detected
                and contextualized (time, device, route, asset).
              </p>
            </div>

            <div className="process-card">
              <div className="pcTop">
                <div className="pcTitle">🔐 Seal</div>
                <div className="pcBadge">Blockchain ledger</div>
              </div>
              <p className="pcText">
                The event is hashed and timestamped, producing an immutable proof trail. This turns
                “logs” into evidence that stands during disputes.
              </p>
            </div>

            <div className="process-card">
              <div className="pcTop">
                <div className="pcTitle">💸 Trigger</div>
                <div className="pcBadge">Compliance / payment</div>
              </div>
              <p className="pcText">
                Proof can automatically trigger: compliance alerts, SLA penalties, claim workflows,
                or conditional payments (smart settlement).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INDUSTRIES ================= */}
      <section className="industries">
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: 30 }}>
            Industries where a few degrees cost millions
          </h2>

          <div className="grid-3">
            <div className="indCard">
              <strong>💊 Pharma & Biotech</strong>
              <p>Audit-ready cold chain compliance, temperature excursions, traceability.</p>
            </div>

            <div className="indCard">
              <strong>🥶 Food & Frozen</strong>
              <p>Spoilage prevention, supplier accountability, insurer-ready proof.</p>
            </div>

            <div className="indCard">
              <strong>🚚 Logistics & 3PL</strong>
              <p>SLA enforcement, custody proof, dispute resolution with sealed evidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <p>contact@enthalpy.site</p>
        <p>
          <strong>Tangier, Morocco 🇲🇦</strong>
        </p>
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => setPopupOpen(true)}>
            Request pilot access
          </button>
        </div>
      </footer>

      {/* ================= POPUP ================= */}
      <div className="popup-overlay" role="dialog" aria-modal="true">
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
