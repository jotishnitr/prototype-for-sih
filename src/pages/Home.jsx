import { Link } from 'react-router-dom'

function Home() {
  return (
    <main>

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="container hero-grid">

          <div>
            <p className="hero-label">
              PS-05 • DISASTER MANAGEMENT
            </p>

            <h1 className="hero-title">
              Faster Response.
              <br />
              Better Coordination.
            </h1>

            <p className="hero-description">
              ResQNet connects citizens, response teams and available
              resources to make disaster response faster and more organised.
            </p>

            <div className="hero-buttons">

              <Link to="/report" className="report-btn">
                Report an Incident
              </Link>

              <Link to="/dashboard" className="dashboard-btn">
                Open Dashboard
              </Link>

            </div>
          </div>

          <MiniMapGraphic />

        </div>
      </section>


      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">

          <div className="section-heading">

            <p className="section-label">
              WHAT RESQNET PROVIDES
            </p>

            <h2 className="section-title">
              Simple tools for faster response
            </h2>

            <p className="section-description">
              Everything response teams need to receive information,
              understand incidents and coordinate available resources.
            </p>

          </div>


          <div className="feature-grid">

            <FeatureCard
              icon="▤"
              title="Incident Reporting"
              desc="Citizens can quickly report emergencies with their location and important incident details."
            />

            <FeatureCard
              icon="⌖"
              title="Live Map"
              desc="View reported incidents and available resources on a single interactive map."
            />

            <FeatureCard
              icon="●"
              title="Resource Coordination"
              desc="Identify nearby response teams and resources that can help with an incident."
            />

            <FeatureCard
              icon="♢"
              title="Emergency Alerts"
              desc="Important updates can be shared with the concerned response teams when needed."
            />

          </div>

        </div>
      </section>


      {/* RESPONSE PROCESS */}
      <section className="process-section">
        <div className="container">

          <p className="section-label">
            RESPONSE PROCESS
          </p>

          <h2 className="section-title">
            How ResQNet Works
          </h2>


          <div className="process-grid">

            <ProcessCard
              number="01"
              title="Report"
              text="An incident is reported by a citizen."
            />

            <ProcessCard
              number="02"
              title="Review"
              text="The incident is checked and prioritised."
            />

            <ProcessCard
              number="03"
              title="Assign"
              text="Suitable nearby resources are identified."
            />

            <ProcessCard
              number="04"
              title="Respond"
              text="The response team takes action."
            />

          </div>

        </div>
      </section>


      {/* PLATFORM OVERVIEW */}
      <section className="overview-section">

        <div className="container overview-grid">

          <div>

            <p className="section-label">
              THE PLATFORM
            </p>

            <h2 className="section-title">
              One place for disaster coordination
            </h2>

            <p className="overview-text">
              ResQNet brings incident reporting, live location information
              and resource coordination together in one platform.
            </p>

            <Link to="/about" className="about-link">
              Learn more about ResQNet →
            </Link>

          </div>


          <div className="info-container">

            <InfoRow
              title="Real-time monitoring"
              text="Track incidents and updates as they happen."
            />

            <InfoRow
              title="Location-based coordination"
              text="Use location information to find suitable nearby resources."
            />

            <InfoRow
              title="Connected response"
              text="Keep citizens and response teams connected through one system."
            />

          </div>

        </div>

      </section>


      {/* CALL TO ACTION */}
      <section className="cta-section">

        <h2 className="cta-title">
          Help report. Help respond.
        </h2>

        <p className="cta-text">
          Together, better information can lead to faster action.
        </p>

        <Link to="/report" className="cta-button">
          Report an Incident
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="home-footer">

        <div className="container">

          <div className="footer-top">

            {/* BRAND */}
            <div className="footer-brand">

              <strong className="footer-brand-title">
                ResQNet
              </strong>

              <p className="footer-brand-text">
                A centralized platform for disaster management,
                connecting citizens with emergency responders.
              </p>

            </div>


            {/* NAVIGATION */}
            <div className="footer-navigation">

              <div>

                <strong className="footer-heading">
                  PLATFORM
                </strong>

                <div className="footer-links">

                  <Link to="/report" className="footer-link">
                    Report Incident
                  </Link>

                  <Link to="/dashboard" className="footer-link">
                    Live Dashboard
                  </Link>

                  <Link to="/about" className="footer-link">
                    About Us
                  </Link>

                </div>

              </div>


              <div>

                <strong className="footer-heading">
                  TEAM
                </strong>

                <div className="footer-links">

                  <Link to="/about" className="footer-link">
                    Team Altiora
                  </Link>

                  <Link to="/about" className="footer-link">
                    About ResQNet
                  </Link>

                </div>

              </div>

            </div>

          </div>


          {/* FOOTER BOTTOM */}
          <div className="footer-bottom">

            <span>
              © {new Date().getFullYear()} ResQNet · Made by Team Altiora
            </span>

            <span>
              PS-05 · Disaster Management
            </span>

          </div>

        </div>

      </footer>


      {/* ALL CSS */}
      <style>{`

        * {
          box-sizing: border-box;
        }


        /* HERO */

        .home-hero {
          background: #06295f;
          color: #fff;
          padding: 64px 0 72px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
        }

        .hero-label {
          color: #3b82f6;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 46px;
          line-height: 1.1;
          margin: 0 0 20px;
          font-weight: 800;
          color: #fff;
        }

        .hero-description {
          font-size: 16px;
          color: rgba(255,255,255,0.82);
          line-height: 1.7;
          margin-bottom: 30px;
          max-width: 500px;
        }

        .hero-buttons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .report-btn {
          background: #1769e0;
          color: #fff;
          padding: 13px 28px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 6px;
          text-decoration: none;
        }

        .report-btn:hover {
          background: #0f5bc7;
        }

        .dashboard-btn {
          border: 1px solid rgba(255,255,255,0.8);
          color: #fff;
          padding: 13px 28px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          text-decoration: none;
        }

        .dashboard-btn:hover {
          background: rgba(255,255,255,0.1);
        }


        /* FEATURES */

        .features-section {
          padding: 58px 0 40px;
          background: #fff;
        }

        .section-heading {
          margin-bottom: 32px;
        }

        .section-label {
          color: #1769e0;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .section-title {
          font-size: 28px;
          color: #071b41;
          margin: 0 0 10px;
          font-weight: 800;
        }

        .section-description {
          color: #59677f;
          font-size: 14.5px;
          max-width: 600px;
          line-height: 1.6;
          margin: 0;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .feature-card {
          border: 1px solid #dce6f5;
          border-radius: 7px;
          padding: 22px;
          background: #fff;
          transition: 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(7,27,65,0.08);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #1456c3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 18px;
        }

        .feature-title {
          font-size: 16px;
          color: #071b41;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .feature-text {
          font-size: 13.5px;
          color: #59677f;
          line-height: 1.65;
          margin: 0;
        }


        /* RESPONSE PROCESS */

        .process-section {
          padding: 48px 0 55px;
          background: #f4f8ff;
        }

        .process-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .process-card {
          background: #fff;
          border: 1px solid #dce6f5;
          border-radius: 7px;
          padding: 18px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .process-number {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          background: #eaf2ff;
          color: #1456c3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
        }

        .process-title {
          font-size: 14px;
          color: #071b41;
          margin: 0 0 5px;
          font-weight: 700;
        }

        .process-text {
          font-size: 12.5px;
          color: #59677f;
          line-height: 1.5;
          margin: 0;
        }


        /* PLATFORM */

        .overview-section {
          padding: 58px 0;
          background: #fff;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 55px;
          align-items: center;
        }

        .overview-text {
          color: #59677f;
          font-size: 15px;
          line-height: 1.7;
          max-width: 500px;
          margin-bottom: 18px;
        }

        .about-link {
          color: #1769e0;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .info-container {
          border-left: 1px solid #dce6f5;
          padding-left: 35px;
        }

        .info-row {
          display: flex;
          gap: 15px;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid #e4ebf5;
        }

        .info-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 50%;
          background: #eaf2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1769e0;
          font-size: 17px;
          font-weight: 700;
        }

        .info-title {
          font-size: 14px;
          color: #071b41;
          margin: 0 0 4px;
          font-weight: 700;
        }

        .info-text {
          font-size: 12.5px;
          color: #59677f;
          margin: 0;
          line-height: 1.5;
        }


        /* MAP */

        .mini-map {
          background: #0b3978;
          border-radius: 8px;
          padding: 0;
          border: 1px solid rgba(255,255,255,0.25);
          overflow: hidden;
        }

        .mini-map svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .map-footer {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          color: rgba(255,255,255,0.85);
          font-size: 11px;
        }

        .monitoring-status {
          color: #4b9cff;
        }


        /* CTA */

        .cta-section {
          background: #073579;
          padding: 42px 20px;
          text-align: center;
          color: #fff;
        }

        .cta-title {
          font-size: 25px;
          margin: 0 0 8px;
          font-weight: 800;
        }

        .cta-text {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 20px;
        }

        .cta-button {
          display: inline-block;
          background: #1769e0;
          color: #fff;
          padding: 12px 30px;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
        }


        /* FOOTER */

        .home-footer {
          background: #061d42;
          color: rgba(255,255,255,0.7);
          padding: 45px 0 22px;
          font-size: 13px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 35px;
          margin-bottom: 20px;
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-brand-title {
          color: #fff;
          font-size: 20px;
          display: block;
          margin-bottom: 12px;
        }

        .footer-brand-text {
          margin: 0;
          line-height: 1.7;
        }

        .footer-navigation {
          display: flex;
          gap: 65px;
          flex-wrap: wrap;
        }

        .footer-heading {
          color: #fff;
          display: block;
          margin-bottom: 13px;
          font-size: 12px;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .footer-link {
          color: rgba(255,255,255,0.65);
          text-decoration: none;
        }

        .footer-link:hover {
          color: #fff;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
        }


        /* RESPONSIVE */

        @media (max-width: 900px) {

          .hero-grid {
            grid-template-columns: 1fr;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .info-container {
            border-left: none;
            border-top: 1px solid #dce6f5;
            padding-left: 0;
            padding-top: 25px;
          }

          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .process-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }


        @media (max-width: 600px) {

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .process-grid {
            grid-template-columns: 1fr;
          }

          .hero-title {
            font-size: 36px;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .report-btn,
          .dashboard-btn {
            text-align: center;
          }

          .overview-grid {
            gap: 35px;
          }

          .footer-navigation {
            gap: 35px;
          }
        }

      `}</style>

    </main>
  )
}


/* =========================
   FEATURE CARD
========================= */

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3 className="feature-title">
        {title}
      </h3>

      <p className="feature-text">
        {desc}
      </p>

    </div>
  )
}


/* =========================
   PROCESS CARD
========================= */

function ProcessCard({ number, title, text }) {
  return (
    <div className="process-card">

      <div className="process-number">
        {number}
      </div>

      <div>

        <h4 className="process-title">
          {title}
        </h4>

        <p className="process-text">
          {text}
        </p>

      </div>

    </div>
  )
}


/* =========================
   INFORMATION ROW
========================= */

function InfoRow({ title, text }) {
  return (
    <div className="info-row">

      <div className="info-icon">
        ●
      </div>

      <div>

        <h4 className="info-title">
          {title}
        </h4>

        <p className="info-text">
          {text}
        </p>

      </div>

    </div>
  )
}


/* =========================
   MAP GRAPHIC
========================= */

function MiniMapGraphic() {
  return (
    <div className="mini-map">

      <svg
        viewBox="0 0 500 300"
        width="100%"
        height="auto"
      >

        {/* Map background */}
        <rect
          width="500"
          height="300"
          fill="#0c3670"
        />


        {/* Horizontal map lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 34}
            x2="500"
            y2={i * 34}
            stroke="#174985"
            strokeWidth="1"
          />
        ))}


        {/* Vertical map lines */}
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 38}
            y1="0"
            x2={i * 38}
            y2="300"
            stroke="#174985"
            strokeWidth="1"
          />
        ))}


        {/* Roads */}
        <path
          d="M20 230 C120 180 150 250 230 180 S370 150 480 55"
          stroke="#23528b"
          strokeWidth="7"
          fill="none"
        />

        <path
          d="M50 40 C150 80 180 30 280 90 S390 220 470 250"
          stroke="#1d4b86"
          strokeWidth="4"
          fill="none"
        />


        {/* Incident 1 */}
        <circle
          cx="120"
          cy="90"
          r="7"
          fill="#fff"
        />

        <circle
          cx="120"
          cy="90"
          r="13"
          fill="none"
          stroke="#4b9cff"
          strokeWidth="2"
        />


        {/* Incident 2 */}
        <circle
          cx="270"
          cy="145"
          r="7"
          fill="#fff"
        />

        <circle
          cx="270"
          cy="145"
          r="13"
          fill="none"
          stroke="#4b9cff"
          strokeWidth="2"
        />


        {/* Incident 3 */}
        <circle
          cx="365"
          cy="80"
          r="7"
          fill="#fff"
        />

        <circle
          cx="365"
          cy="80"
          r="13"
          fill="none"
          stroke="#4b9cff"
          strokeWidth="2"
        />


        {/* Incident 4 */}
        <circle
          cx="180"
          cy="220"
          r="7"
          fill="#fff"
        />

        <circle
          cx="180"
          cy="220"
          r="13"
          fill="none"
          stroke="#4b9cff"
          strokeWidth="2"
        />


        {/* Dispatch connection */}
        <line
          x1="120"
          y1="90"
          x2="200"
          y2="55"
          stroke="#62a9ff"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        <circle
          cx="200"
          cy="55"
          r="9"
          fill="#fff"
        />

      </svg>


      <div className="map-footer">

        <span>
          Live Incident Map
        </span>

        <span>
          <span className="monitoring-status">
            ●
          </span>
          {' '}Monitoring Active
        </span>

      </div>

    </div>
  )
}


export default Home
