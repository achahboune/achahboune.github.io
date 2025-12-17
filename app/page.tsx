"use client"

import { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  const [popupOpen, setPopupOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
            data: [4.2, 4.3, 5.9, 6.2, 5.3, 4.7],
            borderColor: "#1b73ff",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    })

    return () => chartRef.current?.destroy()
  }, [])

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: #f5f7fb;
          color: #0b1c33;
        }
        header {
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(0,0,0,.06);
        }
        h1 {
          font-size: 44px;
          font-weight: 400;
          letter-spacing: -0.02em;
        }
        h1 span {
          color: #1b73ff;
          font-weight: 500;
        }
        label {
          font-size: 12px;
          color: #6c7a92;
          font-weight: 400;
        }
        input, textarea {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,.15);
          font-size: 13px;
          font-weight: 400;
        }
        button {
          padding: 10px 18px;
          border-radius: 999px;
          border: none;
          background: #1b73ff;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>

      <header>
        <strong>Enthalpy</strong>
        <button onClick={() => setPopupOpen(true)}>Request pilot access</button>
      </header>

      <main style={{ padding: 40 }}>
        <h1>
          Sensors you can trust.<br />
          <span>Evidence you can prove.</span>
        </h1>

        <div style={{ height: 220, maxWidth: 520, marginTop: 24 }}>
          <canvas ref={canvasRef} />
        </div>
      </main>

      {popupOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setPopupOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              width: 420,
              borderRadius: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 500 }}>Request pilot access</h3>

            {submitted ? (
              <p style={{ fontSize: 13 }}>
                ✅ Request recorded.<br />
                We’ll contact you at <b>contact@enthalpy.site</b>.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubmitted(true) // mock OK for GitHub Pages
                }}
              >
                <label>Company</label>
                <input required />

                <label style={{ marginTop: 10 }}>Work email</label>
                <input required />

                <label style={{ marginTop: 10 }}>Message</label>
                <textarea rows={4} required />

                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <button type="submit">Submit</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
