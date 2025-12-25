// app/privacy/page.tsx
import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — Enthalpy",
  description: "Privacy Policy for Enthalpy (cold chain monitoring & blockchain proof).",
}

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: "100svh",
        backgroundImage: "url(/assets/bg-ocean.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* léger voile pour la lisibilité */}
      <div
        style={{
          minHeight: "100svh",
          background:
            "radial-gradient(900px 520px at 18% 10%, rgba(255,255,255,0.35), rgba(255,255,255,0.10)), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.12))",
          padding: "28px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          {/* top bar minimal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.30)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/assets/logo.png" alt="Enthalpy" style={{ width: 30, height: 30 }} />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 600, color: "rgba(6,19,37,0.90)" }}>Enthalpy</div>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(6,19,37,0.55)" }}>
                  PRIVACY
                </div>
              </div>
            </div>

            <Link
              href="/"
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: 999,
                background: "linear-gradient(135deg,#1b73ff,#00c8ff)",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 14px 30px rgba(27,115,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              Back to site
            </Link>
          </div>

          {/* content card */}
          <main
            style={{
              marginTop: 16,
              padding: "22px 18px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.60)",
              border: "1px solid rgba(255,255,255,0.30)",
              backdropFilter: "blur(14px)",
              color: "rgba(6,19,37,0.88)",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.02em" }}>Privacy Policy</h1>
            <p style={{ marginTop: 8, marginBottom: 18, color: "rgba(6,19,37,0.70)", lineHeight: 1.6 }}>
              Effective date: <b>2025-12-25</b>
            </p>

            <section style={{ lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                Enthalpy (“we”, “us”) provides cold & critical monitoring with IoT sensors and blockchain-proof evidence.
                This Policy explains how we collect, use, and protect information when you use our website and request pilot
                access.
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Information we collect</h2>
              <ul>
                <li>
                  <b>Pilot access form:</b> company name, work email, message, and optional name.
                </li>
                <li>
                  <b>Basic technical data:</b> IP address, device/browser, and logs for security and performance (typical web
                  server logs).
                </li>
              </ul>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>How we use information</h2>
              <ul>
                <li>To respond to your pilot access request and communicate with you.</li>
                <li>To operate, secure, and improve the website (fraud prevention, debugging, performance).</li>
                <li>To maintain records related to compliance and business operations.</li>
              </ul>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Blockchain & sensor data</h2>
              <p>
                Enthalpy’s blockchain proof is designed for sensor events (e.g., temperature excursions). We do not intend to
                store personal data on-chain. If this changes for a specific deployment, we will provide deployment-specific
                terms and data processing details.
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Sharing</h2>
              <p>
                We may use service providers to run the website and send emails (hosting, email delivery). We share only what is
                necessary to provide the service. We do not sell your personal data.
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Retention</h2>
              <p>
                We keep form submissions as long as needed to handle requests and maintain operational records, then delete or
                anonymize when no longer necessary.
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Your rights</h2>
              <p>
                You can request access, correction, or deletion of your information by contacting us.
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Contact</h2>
              <p>
                Email:{" "}
                <a href="mailto:contact@enthalpy.site" style={{ color: "#1b73ff", fontWeight: 600 }}>
                  contact@enthalpy.site
                </a>
                <br />
                Location: Tangier, Morocco
              </p>

              <h2 style={{ marginTop: 18, fontSize: 18 }}>Changes</h2>
              <p>
                We may update this policy from time to time. The latest version will always be available on this page.
              </p>
            </section>
          </main>

          <div style={{ textAlign: "center", marginTop: 14, color: "rgba(255,255,255,0.85)" }}>
            <small>© 2025 Enthalpy</small>
          </div>
        </div>
      </div>
    </div>
  )
}
