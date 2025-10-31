/**
 * GITHUB ANALYZER DASHBOARD TODOs
 * -------------------------------
 * Easy:
 *  - [ ] Add input validation for username
 *  - [ ] Show loading skeleton for profile data
 *  - [ ] Add error handling for invalid usernames
 *  - [ ] Display user avatar and basic info
 * Medium:
 *  - [ ] Implement advanced stats (languages, stars, forks)
 *  - [ ] Add repository list with pagination
 *  - [ ] Show contribution graph/calendar
 *  - [ ] Add profile comparison feature
 * Advanced:
 *  - [ ] Add GitHub API rate limit handling
 *  - [ ] Implement caching for API responses
 *  - [ ] Add export functionality (PDF/JSON)
 *  - [ ] Add analytics and insights
 */

import { useState, useEffect } from "react";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Card from "../components/Card.jsx";
import HeroSection from "../components/HeroSection.jsx";
import GitHubImg from "../Images/GitHub.jpg"; // Assuming you have a GitHub image

export default function GitHubAnalyzer() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareUsername, setCompareUsername] = useState("");
  const [compareProfile, setCompareProfile] = useState(null);
  const [compareRepos, setCompareRepos] = useState([]);

  useEffect(() => {
    // Load from localStorage if available
    const savedUsername = localStorage.getItem("githubUsername");
    console.log('Loading from localStorage:', savedUsername);
    if (savedUsername) {
      setUsername(savedUsername);
      fetchProfile(savedUsername);
    }
  }, []);

  async function fetchProfile(user) {
    console.log('fetchProfile called with user:', user);
    if (!user.trim()) {
      console.log('User is empty, returning');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Starting fetch for profile');

      // Fetch user profile
      const profileRes = await fetch(`https://api.github.com/users/${user}`);
      console.log('Profile response status:', profileRes.status);
      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch profile");
      }
      const profileData = await profileRes.json();
      console.log('Profile data received:', profileData);
      setProfile(profileData);
      localStorage.setItem("githubUsername", user);

      // Fetch repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
      );
      console.log('Repos response status:', reposRes.status);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        console.log('Repos data received, count:', reposData.length);
        setRepos(reposData);
      } else {
        console.log('Failed to fetch repos');
      }
    } catch (e) {
      console.log('Error in fetchProfile:', e);
      setError(e.message);
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
      console.log('fetchProfile completed');
    }
  }

  async function fetchCompareProfile(user) {
    if (!user.trim()) return;

    try {
      const profileRes = await fetch(`https://api.github.com/users/${user}`);
      if (!profileRes.ok) {
        if (profileRes.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch profile");
      }
      const profileData = await profileRes.json();
      setCompareProfile(profileData);

      const reposRes = await fetch(
        `https://api.github.com/users/${user}/repos?sort=updated&per_page=100`
      );
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setCompareRepos(reposData);
      }
    } catch (e) {
      setError(e.message);
      setCompareProfile(null);
      setCompareRepos([]);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with username:', username);
    fetchProfile(username);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    fetchCompareProfile(compareUsername);
  };

  const calculateStats = (userRepos) => {
    console.log('Calculating stats for repos count:', userRepos.length);
    const stats = {
      totalStars: 0,
      totalForks: 0,
      languages: {},
      topLanguages: [],
    };

    userRepos.forEach((repo) => {
      stats.totalStars += repo.stargazers_count || 0;
      stats.totalForks += repo.forks_count || 0;

      if (repo.language) {
        stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
      }
    });

    // Get top 5 languages
    stats.topLanguages = Object.entries(stats.languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log('Calculated stats:', stats);
    return stats;
  };

  const profileStats = profile ? calculateStats(repos) : null;
  console.log('Profile stats:', profileStats);
  const compareStats = compareProfile ? calculateStats(compareRepos) : null;
  console.log('Compare stats:', compareStats);

  return (
    <div>
      <HeroSection
        image={GitHubImg}
        title={
          <>
            GitHub <span style={{ color: "black" }}>Profile Analyzer</span>
          </>
        }
        subtitle="Analyze GitHub profiles with advanced statistics and comparison tools"
      />

      <h2>🔍 GitHub Profile Analyzer</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          style={{ marginRight: "1rem" }}
        />
        <button type="submit">Analyze Profile</button>
      </form>

      {loading && <Loading />}
      <ErrorMessage error={error} />

      {profile && (
        <div className="grid">
          {/* Profile Overview */}
          <Card title="Profile Overview" size="large">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={profile.avatar_url}
                alt={profile.login}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid #ddd",
                }}
              />
              <div>
                <h3>{profile.name || profile.login}</h3>
                <p>@{profile.login}</p>
                {profile.bio && <p>{profile.bio}</p>}
                {profile.location && <p>📍 {profile.location}</p>}
                {profile.company && <p>🏢 {profile.company}</p>}
                <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {/* Basic Stats */}
          <Card title="Basic Statistics">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <div>
                <strong>Followers:</strong> {profile.followers?.toLocaleString()}
              </div>
              <div>
                <strong>Following:</strong> {profile.following?.toLocaleString()}
              </div>
              <div>
                <strong>Public Repos:</strong> {profile.public_repos?.toLocaleString()}
              </div>
              <div>
                <strong>Public Gists:</strong> {profile.public_gists?.toLocaleString()}
              </div>
            </div>
          </Card>

          {/* Advanced Stats */}
          {profileStats && (
            <Card title="Advanced Statistics">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                <div>
                  <strong>Total Stars:</strong> {profileStats.totalStars.toLocaleString()}
                </div>
                <div>
                  <strong>Total Forks:</strong> {profileStats.totalForks.toLocaleString()}
                </div>
                <div>
                  <strong>Top Languages:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                    {profileStats.topLanguages.map(([lang, count]) => (
                      <li key={lang}>
                        {lang}: {count} repos
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Average Stars per Repo:</strong>{" "}
                  {(profileStats.totalStars / repos.length).toFixed(1)}
                </div>
              </div>
            </Card>
          )}

          {/* Recent Repositories */}
          <Card title="Recent Repositories">
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {repos.slice(0, 10).map((repo) => (
                <div
                  key={repo.id}
                  style={{
                    padding: "0.5rem",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none", color: "#0366d6" }}
                    >
                      {repo.name}
                    </a>
                    {repo.language && (
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "#586069" }}>
                        {repo.language}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Profile Comparison Section */}
      {profile && (
        <div style={{ marginTop: "3rem" }}>
          <h3>🔄 Profile Comparison</h3>
          <form onSubmit={handleCompare} style={{ marginBottom: "2rem" }}>
            <input
              value={compareUsername}
              onChange={(e) => setCompareUsername(e.target.value)}
              placeholder="Enter username to compare"
              style={{ marginRight: "1rem" }}
            />
            <button type="submit">Compare</button>
          </form>

          {compareProfile && (
            <div className="grid">
              <Card title={`@${profile.login} vs @${compareProfile.login}`}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem" }}>
                  <div>
                    <h4>{profile.name || profile.login}</h4>
                    <p>Followers: {profile.followers}</p>
                    <p>Following: {profile.following}</p>
                    <p>Repos: {profile.public_repos}</p>
                    {profileStats && (
                      <>
                        <p>Total Stars: {profileStats.totalStars}</p>
                        <p>Total Forks: {profileStats.totalForks}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <h4>{compareProfile.name || compareProfile.login}</h4>
                    <p>Followers: {compareProfile.followers}</p>
                    <p>Following: {compareProfile.following}</p>
                    <p>Repos: {compareProfile.public_repos}</p>
                    {compareStats && (
                      <>
                        <p>Total Stars: {compareStats.totalStars}</p>
                        <p>Total Forks: {compareStats.totalForks}</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}