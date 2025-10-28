import React, { useState, useEffect } from 'react';

export default function ContributorsWall() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'https://api.github.com/repos/commitra/react-verse/contributors?per_page=100'
        );

        if (!response.ok) {
          // This will catch API rate-limit errors (403)
          throw new Error(`Failed to fetch contributors: ${response.statusText}`);
        }

        const data = await response.json();
        setContributors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []); // Empty dependency array ensures this runs once on mount

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        {/* Uses the .loading class from your stylesheet */}
        <h2 className="loading">Loading contributors...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        {/* Uses the .error class from your stylesheet */}
        <h2 className="error">Error: {error}</h2>
        <p>You may have hit the GitHub API rate limit. Please try again later.</p>
      </div>
    );
  }

  return (
    // Uses .container for padding and .page-transition for the animation
    <main className="container page-transition">
      
      {/* Uses .cards-title from your "Recipe" styles for a nice centered header */}
      <h1 className="cards-title" style={{ marginTop: '2rem' }}>
        React-Verse Contributors
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', opacity: 0.8, marginTop: '-2rem', marginBottom: '3rem' }}>
        Honoring the amazing developers who made this project possible.
      </p>

      {/* Uses the .grid class from your stylesheet for the responsive layout */}
      <div className="grid">
        {contributors.map((contributor) => (
          <a
            key={contributor.id}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }} // Prevents underline on the card
          >
            {/* Uses the .card class from your "Recipe" styles.
              Your CSS file already makes this:
              - text-align: center
              - have a background, border, and shadow
              - animate on hover
            */}
            <div className="card">
              {/* This <img> tag will be styled by your ".card img" rule:
                - 130px width/height
                - 50% border-radius (a circle)
              */}
              <img
                src={contributor.avatar_url}
                alt={`${contributor.login}'s avatar`}
                loading="lazy"
              />
              
              {/* This <h3> will be styled by your ".card h4" or ".card h3" rule */}
              <h4>{contributor.login}</h4>
              
              {/* This <p> will be styled by your ".card p" rule */}
              <p>{contributor.contributions} contributions</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}