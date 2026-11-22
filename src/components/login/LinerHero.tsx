import React from "react";

const GROOVES = [280, 230, 180];

/** The sleeve art: the stacked app name beside a record. */
const LinerHero: React.FC = () => (
  <header className="liner-hero">
    <h1 className="liner-name" aria-label="Cascade">
      <span>CAS</span>
      <span>CA</span>
      <span>DE</span>
    </h1>
    <svg className="liner-record" viewBox="0 0 660 660" aria-hidden="true">
      <circle cx="330" cy="330" r="328" className="liner-record-vinyl" />
      {GROOVES.map((r) => (
        <circle key={r} cx="330" cy="330" r={r} className="liner-record-groove" />
      ))}
      <circle cx="330" cy="330" r="110" className="liner-record-label" />
      <circle cx="330" cy="330" r="12" className="liner-record-hole" />
    </svg>
    <div className="liner-tagline">Your library · your server</div>
  </header>
);

export default LinerHero;
