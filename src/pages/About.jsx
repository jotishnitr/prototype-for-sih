function About() {
  return (
    <main
      className="container"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "50px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 45 }}>
        <p
          style={{
            color: "#2563eb",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          PS-05 · DISASTER MANAGEMENT
        </p>

        <h1
          style={{
            color: "#172033",
            fontSize: 36,
            marginBottom: 14,
          }}
        >
          About ResQNet
        </h1>

        <p
          style={{
            color: "#667085",
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 700,
          }}
        >
          ResQNet is a disaster response platform that helps citizens
          report emergencies and allows response teams to monitor
          incidents and coordinate resources from one place.
        </p>
      </div>

      {/* Why ResQNet */}
      <section
        style={{
          borderTop: "3px solid #2563eb",
          paddingTop: 25,
          marginBottom: 45,
        }}
      >
        <h2
          style={{
            color: "#172033",
            marginBottom: 12,
          }}
        >
          Why ResQNet?
        </h2>

        <p
          style={{
            color: "#667085",
            lineHeight: 1.7,
            fontSize: 14.5,
          }}
        >
          During a disaster, information needs to reach the right people
          quickly. ResQNet brings incident reports, location information
          and available resources together so that response teams can make
          faster decisions.
        </p>
      </section>

      {/* Key Features */}
      <section style={{ marginBottom: 45 }}>
        <h2
          style={{
            color: "#172033",
            marginBottom: 20,
          }}
        >
          Key Features
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 18,
          }}
        >
          <Feature
            title="Report Incidents"
            text="Citizens can report floods, fires, medical emergencies and other incidents with their location."
          />

          <Feature
            title="Live Map"
            text="Response teams can see reported incidents and available resources on a live map."
          />

          <Feature
            title="Resource Coordination"
            text="Nearby teams and resources can be identified and assigned to incidents."
          />

          <Feature
            title="Emergency Alerts"
            text="Important incident updates can be sent to the concerned response teams."
          />
        </div>
      </section>

      {/* How ResQNet Works */}
      <section style={{ marginBottom: 45 }}>
        <h2
          style={{
            color: "#172033",
            marginBottom: 20,
          }}
        >
          How ResQNet Works
        </h2>

        <Step
          number="01"
          title="Report"
          text="A citizen reports an emergency through the platform."
        />

        <Step
          number="02"
          title="Review"
          text="The incident is received and its priority is determined."
        />

        <Step
          number="03"
          title="Assign"
          text="Suitable nearby resources are identified for the incident."
        />

        <Step
          number="04"
          title="Respond"
          text="The response team receives the information and takes action."
        />
      </section>

      {/* Team */}
      <section style={{ marginBottom: 45 }}>
        <h2
          style={{
            color: "#172033",
            marginBottom: 10,
          }}
        >
          The Team
        </h2>

        <p
          style={{
            color: "#667085",
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 22,
          }}
        >
          ResQNet was designed and developed as a team project with a
          focus on making disaster response faster and more organised.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <TeamMember
            name="D. Jotish Kumar"
            role="Backend & Database"
          />
          
          <TeamMember
            name="Aryan Biswal"
            role="Frontend Development"
          />

          <TeamMember
            name="Nihal Kumar"
            role="Frontend Development"
          />

          <TeamMember
            name="Parjanya Soni"
            role="Research & Testing"
          />

          <TeamMember
            name="Charan Hadaginal"
            role="Research & Testing"
          />

          <TeamMember
            name="Nikita Kumari"
            role="Designer"
          />
        </div>
      </section>

      {/* Built With */}
      <section
        style={{
          borderTop: "1px solid #e4e7ec",
          paddingTop: 28,
        }}
      >
        <h2
          style={{
            color: "#172033",
            marginBottom: 15,
          }}
        >
          Built With
        </h2>

        <p
          style={{
            color: "#667085",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          React, Node.js, Express, MongoDB, Leaflet and Socket.io are
          used to build the platform and provide real-time incident
          monitoring and location-based resource coordination.
        </p>

        <p
          style={{
            color: "#2563eb",
            fontSize: 13,
            fontWeight: 600,
            marginTop: 18,
          }}
        >
          PS-05 · Disaster Management Platform
        </p>
      </section>
    </main>
  );
}


/* Feature Card */
function Feature({ title, text }) {
  return (
    <div
      style={{
        padding: 22,
        border: "1px solid #dbe3f0",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 32,
          height: 3,
          background: "#2563eb",
          marginBottom: 15,
        }}
      />

      <h3
        style={{
          fontSize: 16,
          color: "#172033",
          marginBottom: 8,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 13.5,
          color: "#667085",
          lineHeight: 1.6,
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* Workflow Step */
function Step({ number, title, text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "16px 0",
        borderBottom: "1px solid #e4e7ec",
      }}
    >
      <span
        style={{
          color: "#2563eb",
          fontSize: 13,
          fontWeight: 700,
          minWidth: 30,
        }}
      >
        {number}
      </span>

      <div>
        <h3
          style={{
            fontSize: 15,
            color: "#172033",
            marginBottom: 5,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 13.5,
            color: "#667085",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}


/* Team Member Card */
function TeamMember({ name, role }) {
  return (
    <div
      style={{
        padding: "18px 20px",
        border: "1px solid #dbe3f0",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {name.charAt(0)}
      </div>

      <h3
        style={{
          fontSize: 15,
          color: "#172033",
          marginBottom: 5,
        }}
      >
        {name}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "#667085",
          margin: 0,
        }}
      >
        {role}
      </p>
    </div>
  );
}


export default About;
```
