import React from 'react';

export default function HeroSection({ image, title, subtitle }) {
  return (
    <section
      className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 hero-section"
      style={image ? { backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="absolute inset-0 bg-black/10 hero-overlay" />
      <div className="relative max-w-7xl mx-auto px-4 py-10 flex items-center gap-6 hero-content">
        {image && (
          <img
            src={image}
            alt=""
            className="w-24 h-24 object-cover rounded-lg shadow-md hidden sm:block"
          />
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 hero-title">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-2 hero-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
