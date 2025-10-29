import React, { useState, useEffect } from 'react';
// Re-importing icons for the stats
import { Users, GitFork, Star } from 'lucide-react';

export default function ContributorsWall() {
  const [contributors, setContributors] = useState([]);
  const [repoInfo, setRepoInfo] = useState(null); // State for repo info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch both contributors and repo info at the same time
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [repoRes, contributorsRes] = await Promise.all([
          fetch('https://api.github.com/repos/commitra/react-verse'),
          fetch('https://api.github.com/repos/commitra/react-verse/contributors?per_page=100')
        ]);

        // Check both responses
        if (!repoRes.ok) {
          throw new Error(`Failed to fetch repo info: ${repoRes.statusText}`);
        }
        if (!contributorsRes.ok) {
          throw new Error(`Failed to fetch contributors: ${contributorsRes.statusText}`);
        }

        const repoData = await repoRes.json();
        const contributorsData = await contributorsRes.json();

        setRepoInfo(repoData); // Set the repo info
        setContributors(contributorsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs once on mount

  // Style object for the new stat boxes
  // This uses variables from your main stylesheet
  const statBoxStyle = {
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text)'
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 className="loading">Loading contributors...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 className="error">Error: {error}</h2>
        <p>You may have hit the GitHub API rate limit. Please try again later.</p>
      </div>
    );
  }

  return (
    <main className="container page-transition">
      
      <h1 className="cards-title" style={{ marginTop: '2rem' }}>
        React-Verse Contributors
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', opacity: 0.8, marginTop: '-2rem', marginBottom: '3rem' }}>
        Honoring the amazing developers who made this project possible.
      </p>

      {/* --- NEW STATS SECTION --- */}
      {repoInfo && (
        // Uses .flex and .wrap from your stylesheet
        <div 
          className="flex wrap" 
          style={{ 
            justifyContent: 'center', 
            gap: '1rem', // .gap class is 1rem
            marginBottom: '3rem' 
          }}
        >
          {/* Stat Box for Stars */}
          <div style={statBoxStyle}>
            <Star size={18} style={{ color: 'var(--primary)' }} />
            <span>{repoInfo.stargazers_count} Stars</span>
          </div>
          
          {/* Stat Box for Forks */}
          <div style={statBoxStyle}>
            <GitFork size={18} style={{ color: 'var(--primary)' }} />
            <span>{repoInfo.forks_count} Forks</span>
          </div>
          
          {/* Stat Box for Contributors */}
          <div style={statBoxStyle}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <span>{contributors.length} Contributors</span>
          </div>
        </div>
      )}
      {/* --- END OF STATS SECTION --- */}

      {/* Uses the .grid class from your stylesheet */}
      <div className="grid">
        {contributors.map((contributor) => (
          <a
            key={contributor.id}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            {/* Uses the .card class from your "Recipe" styles */}
            <div className="card">
              {/* Styled by your ".card img" rule */}
              <img
                src={contributor.avatar_url}
                alt={`${contributor.login}'s avatar`}
                loading="lazy"
              />
              
              {/* Styled by your ".card h4" or ".card h3" rule */}
              <h4>{contributor.login}</h4>
              
              {/* Styled by your ".card p" rule */}
              <p>{contributor.contributions} contributions</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}