
import React from 'react';


const HeroSection = ({ image, title, subtitle }) => {
  return (
    <section
      className="hero-section"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
