import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [weatherAlert, setWeatherAlert] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          "https://resqnet-fmhd.onrender.com/api/getWeather",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.weatherAlert) {
            setWeatherAlert(data.weatherAlert);
          }
        }
      } catch (err) {
        console.warn("Could not load live weather:", err);
      }
    }

    fetchWeather();
  }, []);

  const alertText =
    typeof weatherAlert === "string"
      ? weatherAlert
      : weatherAlert?.title
      ? `${weatherAlert.title}${
          weatherAlert.area ? ` (${weatherAlert.area})` : ""
        }${weatherAlert.severity ? ` - ${weatherAlert.severity}` : ""}`
      : "Weather monitoring is active for disaster-prone areas.";

  return (
    <main>
      {/* Weather Alert */}
      <div
        style={{
          background: "#172033",
          color: "#fff",
          padding: "9px 0",
          fontSize: 13,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#2563eb",
                display: "inline-block",
              }}
            />

            <strong>Weather Alert</strong>

            <span style={{ color: "rgba(255,255,255,0.7)" }}>
              {alertText}
            </span>
          </div>

          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Live monitoring
          </span>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          background: "#0f2f57",
          color: "#fff",
          padding: "70px 0",
        }}
      >
        <div
          className="container home-hero"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 50,
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#60a5fa",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              PS-05 · DISASTER MANAGEMENT
            </p>

            <h1
              style={{
                fontSize: 44,
                lineHeight: 1.15,
                marginBottom: 18,
                fontWeight: 800,
              }}
            >
              Faster Response.
              <br />
              Better Coordination.
            </h1>

            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 28,
              }}
            >
              ResQNet connects citizens, response teams and available
              resources to make disaster response faster and more organised.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/report"
                className="btn btn-primary"
                style={{
                  padding: "12px 22px",
                  fontSize: 14,
                }}
              >
                Report an Incident
              </Link>

              <Link
                to="/dashboard"
                style={{
                  padding: "11px 22px",
                  border: "1px solid rgba(255,255,255,0.5)",
                  borderRadius: 6,
                  color: "#fff",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          {/* Simple visual */}
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10,
              padding: 24,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                height: 260,
                borderRadius: 8,
                background: "#123964",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Map lines */}
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: 0,
                  width: "100%",
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "55%",
                  left: 0,
                  width: "100%",
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "30%",
                  width: 1,
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "65%",
                  width: 1,
                  height: "100%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              {/* Location points */}
              <MapPoint top="30%" left="25%" />
              <MapPoint top="52%" left="55%" />
              <MapPoint top="68%" left="35%" />
              <MapPoint top="40%" left="75%" />

              <div
                style={{
                  position: "absolute",
                  bottom: 15,
                  left: 15,
                  right: 15,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                <span>Live Incident Map</span>
                <span style={{ color: "#60a5fa" }}>
                  Monitoring Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "55px 0 30px",
        }}
      >
        <div className="container">
          <div style={{ marginBottom: 30 }}>
            <p
              style={{
                color: "#2563eb",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              WHAT RESQNET PROVIDES
            </p>

            <h2
              style={{
                color: "var(--navy)",
                fontSize: 27,
                marginBottom: 8,
              }}
            >
              Simple tools for faster response
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 14.5,
                maxWidth: 650,
              }}
            >
              Everything response teams need to receive information,
              understand incidents and coordinate available resources.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 18,
            }}
          >
            <FeatureCard
              title="Incident Reporting"
              text="Citizens can quickly report emergencies with their location and important incident details."
            />

            <FeatureCard
              title="Live Map"
              text="View reported incidents and available resources on a single interactive map."
            />

            <FeatureCard
              title="Resource Coordination"
              text="Identify nearby response teams and resources that can help with an incident."
            />

            <FeatureCard
              title="Emergency Alerts"
              text="Important updates can be shared with the concerned response teams when needed."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          padding: "30px 0 60px",
        }}
      >
        <div className="container">
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e4e7ec",
              borderRadius: 10,
              padding: 30,
            }}
          >
            <p
              style={{
                color: "#2563eb",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              RESPONSE PROCESS
            </p>

            <h2
              style={{
                color: "var(--navy)",
                fontSize: 24,
                marginBottom: 25,
              }}
            >
              How ResQNet Works
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 25,
              }}
            >
              <ProcessStep
                number="01"
                title="Report"
                text="An incident is reported by a citizen."
              />

              <ProcessStep
                number="02"
                title="Review"
                text="The incident is checked and prioritised."
              />

              <ProcessStep
                number="03"
                title="Assign"
                text="Suitable nearby resources are identified."
              />

              <ProcessStep
                number="04"
                title="Respond"
                text="The response team takes action."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section
        style={{
          padding: "0 0 60px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 35,
              alignItems: "center",
            }}
            className="overview-section"
          >
            <div>
              <p
                style={{
                  color: "#2563eb",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                THE PLATFORM
              </p>

              <h2
                style={{
                  color: "var(--navy)",
                  fontSize: 25,
                  marginBottom: 12,
                }}
              >
                One place for disaster coordination
              </h2>

              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                ResQNet brings incident reporting, live location
                information and resource coordination together in one
                platform.
              </p>

              <Link
                to="/about"
                style={{
                  color: "#2563eb",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Learn more about ResQNet →
              </Link>
            </div>

            <div
              style={{
                borderLeft: "3px solid #2563eb",
                paddingLeft: 25,
              }}
            >
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
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          background: "#0f2f57",
          color: "#fff",
          padding: "40px 0",
        }}
      >
        <div
          className="container"
          style={{
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              marginBottom: 10,
            }}
          >
            Help report. Help respond.
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            Together, better information can lead to faster action.
          </p>

          <Link
            to="/report"
            className="btn btn-primary"
            style={{
              padding: "11px 22px",
              fontSize: 14,
            }}
          >
            Report an Incident
          </Link>
        </div>
      </section>

    {/* Footer */}
      <footer
        style={{
          background: "#0a1f3d",
          color: "rgba(255,255,255,0.7)",
          padding: "50px 0 25px",
          fontSize: 14,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 40,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: 40,
              marginBottom: 25,
            }}
          >
            {/* Brand Info */}
            <div style={{ maxWidth: 320 }}>
              <strong
                style={{
                  color: "#fff",
                  fontSize: 20,
                  display: "block",
                  marginBottom: 15,
                  letterSpacing: 0.5,
                }}
              >
                ResQNet
              </strong>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                A centralized platform for disaster management, connecting citizens with emergency responders for rapid, organized action.
              </p>
            </div>

            {/* Navigation Links */}
            <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
              <div>
                <strong
                  style={{
                    color: "#fff",
                    display: "block",
                    marginBottom: 15,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Platform
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/report" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Report Incident
                  </Link>
                  <Link to="/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Live Dashboard
                  </Link>
                  <Link to="/about" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    About Us
                  </Link>
                </div>
              </div>

              <div>
                <strong
                  style={{
                    color: "#fff",
                    display: "block",
                    marginBottom: 15,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Legal
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link to="/privacy" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Privacy Policy
                  </Link>
                  <Link to="/terms" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Terms of Service
                  </Link>
                  <a href="mailto:support@resqnet.example" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Area */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 15,
              fontSize: 12.5,
            }}
          >
            <span>&copy; {new Date().getFullYear()} @2026 ResQNet. All rights reserved. Made by Team Altiora</span>
            <span>PS-05 · Disaster Management</span>
          </div>
        </div>
      </footer>
      
      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 800px) {
          .home-hero {
            grid-template-columns: 1fr !important;
          }

          .overview-section {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 500px) {
          .home-hero h1 {
            font-size: 34px !important;
          }
        }
      `}</style>
    </main>
  );
}


/* Feature Card */
function FeatureCard({ title, text }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #dbe3f0",
        borderRadius: 8,
        padding: 22,
      }}
    >
      <div
        style={{
          width: 30,
          height: 3,
          background: "#2563eb",
          marginBottom: 15,
        }}
      />

      <h3
        style={{
          color: "var(--navy)",
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 13.5,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* Process Step */
function ProcessStep({ number, title, text }) {
  return (
    <div>
      <div
        style={{
          color: "#2563eb",
          fontSize: 13,
          fontWeight: 800,
          marginBottom: 8,
        }}
      >
        {number}
      </div>

      <h3
        style={{
          color: "var(--navy)",
          fontSize: 15,
          marginBottom: 5,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 13,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* Information Row */
function InfoRow({ title, text }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        style={{
          color: "var(--navy)",
          fontSize: 15,
          marginBottom: 5,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 13.5,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* Map Point */
function MapPoint({ top, left }) {
  return (
    <span
      style={{
        position: "absolute",
        top,
        left,
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#60a5fa",
        border: "2px solid #fff",
        boxShadow: "0 0 0 5px rgba(96,165,250,0.15)",
      }}
    />
  );
}


export default Home;
 
