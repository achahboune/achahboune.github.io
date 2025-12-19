"use client"

import React, { useEffect, useState } from "react"

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

        .visualCard {
          background: var(--card);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 22px 60px rgba(6, 19, 37, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .visualImg {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 14px;
        }

        .visualCaption {
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
            <div>
              <h1>
                Smart IoT sensors for critical goods.
                <br />
                <span className="accent">Clear proof when something goes wrong.</span>
              </h1>

              <div className="hero-copy">
                Enthalpy monitors <strong>temperature</strong>, <strong>humidity</strong>,{" "}
                <strong>vibration</strong> and <strong>CO₂</strong> in real time — in warehouses,
                trucks, and containers <strong>even at sea</strong> via cellular and satellite
                connectivity.
                <br />
                If an incident happens, it is automatically recorded and sealed into a{" "}
                <strong>blockchain ledger</strong>, turning it into trusted proof for{" "}
                <strong>audits</strong>, <strong>insurance</strong> and <strong>compliance</strong>.
              </div>

              <div className="hero-tagline">From sensors → proof → payment.</div>
            </div>

            {/* VISUAL */}
            {/* VISUAL */}
<div className="visualCard">
  <img
    className="visualImg"
    src="/assets/hero-iot-proof.png"
    alt="Realtime IoT monitoring via cellular + satellite, sealed as blockchain proof"
  />
  <div className="visualCaption">
    <span className="chip">
      <span className="dot" />
      Realtime monitoring
    </span>
    <span className="chip">
      <span className="dot" />
      Cellular + Satellite
    </span>
    <span className="chip">
      <span className="dot" />
      Blockchain proof
    </span>
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
