import "./App.css";
import React, { useState } from "react";

function App() {
  // State for the mail form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Function when mail is sent
  const sendMail = (e) => {
    e.preventDefault();

    alert("Mail sent successfully!");

    // Clear the form
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="app">

      {/* ---------------- NAVBAR ---------------- */}
      <nav className="navbar">
        <div className="logo">
          My Project
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#project">Project</a>
          <a href="#team">Team</a>
          <a href="#mail">Mail</a>
        </div>
      </nav>


      {/* ---------------- HOME SECTION ---------------- */}
      <section id="home" className="home">
        <h1>Welcome to My Project</h1>

        <p>
          A simple project website with information about our
          project, team members and a basic mail system.
        </p>

        <button>
          Explore Project
        </button>
      </section>


      {/* ---------------- ABOUT SECTION ---------------- */}
      <section id="about" className="section">
        <h2>About Us</h2>

        <p>
          We are a team working together to create a simple and
          useful project. Our goal is to learn, build and improve
          our technical skills.
        </p>
      </section>


      {/* ---------------- PROJECT SECTION ---------------- */}
      <section id="project" className="section project-section">
        <h2>Project Details</h2>

        <div className="project-card">
          <h3>Project Name</h3>

          <p>
            Our project is a simple web-based system designed to
            provide useful information and communication features.
          </p>

          <h3>Technologies Used</h3>

          <ul>
            <li>React.js</li>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
        </div>
      </section>


      {/* ---------------- TEAM SECTION ---------------- */}
      <section id="team" className="section">
        <h2>Our Team</h2>

        <div className="team-container">

          <div className="team-card">
            <h3>Member 1</h3>
            <p>Project Leader</p>
          </div>

          <div className="team-card">
            <h3>Member 2</h3>
            <p>Frontend Developer</p>
          </div>

          <div className="team-card">
            <h3>Member 3</h3>
            <p>Backend Developer</p>
          </div>

        </div>
      </section>


      {/* ---------------- MAIL SECTION ---------------- */}
      <section id="mail" className="section mail-section">
        <h2>Contact / Mail System</h2>

        <form onSubmit={sendMail} className="mail-form">

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />


          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />


          <label>Message</label>

          <textarea
            placeholder="Write your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            required
          ></textarea>


          <button type="submit">
            Send Mail
          </button>

        </form>
      </section>


      {/* ---------------- FOOTER ---------------- */}
      <footer>
        <p>© 2026 My Project. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;