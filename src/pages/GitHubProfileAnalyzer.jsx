import { useState } from 'react';
import { fetchProfileData, fetchRepoStats, fetchRecentActivity, calculateLanguageUsage, sortRepos, filterRepos, fetchContributionCalendar, getTopLanguages, calculateRepoStats, formatDate, formatNumber, getContributionLevel, setGitHubToken } from '../utilities/githubUtils';
import ErrorMessage from '../components/ErrorMessage';
import './GitHubProfileAnalyzer.css';

const GitHubProfileAnalyzer = () => {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [activity, setActivity] = useState(null);
  const [contributionCalendar, setContributionCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [languages, setLanguages] = useState([]);
  const [compareUsername, setCompareUsername] = useState('');
  const [compareProfile, setCompareProfile] = useState(null);
  const [compareRepos, setCompareRepos] = useState([]);
  const [compareActivity, setCompareActivity] = useState(null);
  const [compareContributionCalendar, setCompareContributionCalendar] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSearch = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    try {
      const [profileData, repoData, activityData, calendarData] = await Promise.all([
        fetchProfileData(username),
        fetchRepoStats(username),
        fetchRecentActivity(username),
        fetchContributionCalendar(username),
      ]);
      setProfile(profileData);
      setRepos(repoData);
      setActivity(activityData);
      setContributionCalendar(calendarData);
      setLanguages(calculateLanguageUsage(repoData));
      if (!profileData) {
        setError('Profile not found');
      }
    } catch (err) {
      if (err.message && err.message.includes('GitHub token is required')) {
        setShowTokenModal(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        const contentElement = document.querySelector('.content-container');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleCompareSearch = async () => {
    if (!compareUsername) return;
    setLoading(true);
    setError('');
    try {
      const [profileData, repoData, activityData, calendarData] = await Promise.all([
        fetchProfileData(compareUsername),
        fetchRepoStats(compareUsername),
        fetchRecentActivity(compareUsername),
        fetchContributionCalendar(compareUsername),
      ]);
      setCompareProfile(profileData);
      setCompareRepos(repoData);
      setCompareActivity(activityData);
      setCompareContributionCalendar(calendarData);
    } catch (err) {
      if (err.message && err.message.includes('GitHub token is required')) {
        setShowTokenModal(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (userToken.trim()) {
      setGitHubToken(userToken.trim());
      setShowTokenModal(false);
      setError('');
      // Retry last search after token is set
      if (username) handleSearch();
      if (compareUsername) handleCompareSearch();
    }
  };

  const sortedRepos = sortRepos(filterRepos(repos, filterLanguage), sortBy);
  const repoStats = calculateRepoStats(repos);
  const topLanguages = getTopLanguages(languages);

  const compareSortedRepos = sortRepos(filterRepos(compareRepos, filterLanguage), sortBy);
  const compareRepoStats = calculateRepoStats(compareRepos);
  const compareTopLanguages = getTopLanguages(calculateLanguageUsage(compareRepos));

  return (
    <div className="github-profile-analyzer">
      {showTokenModal && (
        <div className="token-modal-overlay">
          <div className="token-modal">
            <h2>GitHub Token Required</h2>
            <p>Please enter your GitHub Personal Access Token to continue.</p>
            <p>
              Need help? <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank" rel="noopener noreferrer">Learn how to create a GitHub token</a>
            </p>
            <form onSubmit={handleTokenSubmit}>
              <input
                type="password"
                value={userToken}
                onChange={e => setUserToken(e.target.value)}
                placeholder="Paste your GitHub token here"
                className="search-input"
                required
              />
              <button type="submit" className="search-button">Submit Token</button>
            </form>
          </div>
        </div>
      )}
      <div className="hero-section">
        <h1 className="main-title">GitHub Profile Analyzer</h1>
        <p className="subtitle">Discover, analyze, and compare GitHub profiles with advanced stats and insights</p>
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">Search</button>
          </div>
          <div className="compare-toggle">
            <label>
              <input
                type="checkbox"
                checked={showCompare}
                onChange={(e) => setShowCompare(e.target.checked)}
              />
              Compare Profiles
            </label>
          </div>
          {showCompare && (
            <div className="compare-search">
              <input
                type="text"
                placeholder="Enter second GitHub username"
                value={compareUsername}
                onChange={(e) => setCompareUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCompareSearch()}
                className="search-input"
              />
              <button onClick={handleCompareSearch} className="search-button">Compare</button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-container">
            <div className="loader"></div>
            <p className='legend-color very-high subtitle'>Loading GitHub profile...</p>
          </div>
        </div>
      )}

      {(profile || error) && (
        <div className="content-container">
          {error && <ErrorMessage error={error} />}
          {profile && (
            <>
              <div className="tabs">
                <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</button>
                <button className={activeTab === 'repos' ? 'active' : ''} onClick={() => setActiveTab('repos')}>Repositories</button>
                <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Stats</button>
                <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>Activity</button>
                <button className={activeTab === 'calendar' ? 'active' : ''} onClick={() => setActiveTab('calendar')}>Contributions</button>
                {showCompare && <button className={activeTab === 'compare' ? 'active' : ''} onClick={() => setActiveTab('compare')}>Compare</button>}
              </div>

              {activeTab === 'profile' && (
                <div className="tab-content">
                  {showCompare && compareProfile ? (
                    <div className="compare-container">
                      <div className="profile-section">
                        <h3>{profile.name || profile.login}</h3>
                        <ProfileHeader profile={profile} />
                      </div>
                      <div className="profile-section">
                        <h3>{compareProfile.name || compareProfile.login}</h3>
                        <ProfileHeader profile={compareProfile} isCompare />
                      </div>
                    </div>
                  ) : (
                    <ProfileHeader profile={profile} />
                  )}
                </div>
              )}

              {activeTab === 'repos' && (
                <div className="tab-content">
                  {showCompare && compareProfile ? (
                    <div className="compare-container">
                      <div className="profile-section">
                        <h3>{profile.name || profile.login}'s Repositories</h3>
                        <RepoList
                          repos={sortedRepos}
                          sortBy={sortBy}
                          setSortBy={setSortBy}
                          filterLanguage={filterLanguage}
                          setFilterLanguage={setFilterLanguage}
                          allLanguages={languages.map(l => l.language)}
                        />
                      </div>
                      <div className="profile-section">
                        <h3>{compareProfile.name || compareProfile.login}'s Repositories</h3>
                        <RepoList
                          repos={compareSortedRepos}
                          sortBy={sortBy}
                          setSortBy={setSortBy}
                          filterLanguage={filterLanguage}
                          setFilterLanguage={setFilterLanguage}
                          allLanguages={calculateLanguageUsage(compareRepos).map(l => l.language)}
                          isCompare
                        />
                      </div>
                    </div>
                  ) : (
                    <RepoList
                      repos={sortedRepos}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      filterLanguage={filterLanguage}
                      setFilterLanguage={setFilterLanguage}
                      allLanguages={languages.map(l => l.language)}
                    />
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="tab-content">
                  {showCompare && compareProfile ? (
                    <div className="compare-container">
                      <div className="profile-section">
                        <h3>{profile.name || profile.login}'s Stats</h3>
                        <StatsPanel repoStats={repoStats} activity={activity} topLanguages={topLanguages} />
                        <LanguageChart languages={languages} />
                      </div>
                      <div className="profile-section">
                        <h3>{compareProfile.name || compareProfile.login}'s Stats</h3>
                        <StatsPanel repoStats={compareRepoStats} activity={compareActivity} topLanguages={compareTopLanguages} isCompare />
                        <LanguageChart languages={calculateLanguageUsage(compareRepos)} isCompare />
                      </div>
                    </div>
                  ) : (
                    <>
                      <StatsPanel repoStats={repoStats} activity={activity} topLanguages={topLanguages} />
                      <LanguageChart languages={languages} />
                    </>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="tab-content">
                  {showCompare && compareProfile ? (
                    <div className="compare-container">
                      <div className="profile-section">
                        <h3>{profile.name || profile.login}'s Activity</h3>
                        <ActivityFeed activity={activity} />
                      </div>
                      <div className="profile-section">
                        <h3>{compareProfile.name || compareProfile.login}'s Activity</h3>
                        <ActivityFeed activity={compareActivity} isCompare />
                      </div>
                    </div>
                  ) : (
                    <ActivityFeed activity={activity} />
                  )}
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="tab-content">
                  <ContributionCalendar calendar={contributionCalendar} />
                  {showCompare && compareProfile && <ContributionCalendar calendar={compareContributionCalendar} isCompare />}
                </div>
              )}

              {activeTab === 'compare' && showCompare && (
                <div className="tab-content">
                  <CompareProfiles profile1={profile} profile2={compareProfile} repoStats1={repoStats} repoStats2={compareRepoStats} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileHeader = ({ profile, isCompare = false }) => (
  <div className={`profile-header ${isCompare ? 'compare' : ''}`}>
    <div className="profile-avatar">
      <img src={profile.avatarUrl} alt={profile.name} className="avatar-image" />
      <div className="avatar-overlay"></div>
    </div>
    <div className="profile-info">
      <h2 className="profile-name">{profile.name || profile.login}</h2>
      <p className="profile-username">@{profile.login}</p>
      <p className="profile-bio">{profile.bio}</p>
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <span>{profile.location || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">🏢</span>
          <span>{profile.company || 'Not specified'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">🔗</span>
          <a href={profile.url} target="_blank" rel="noopener noreferrer" className="profile-link">View Profile</a>
        </div>
      </div>
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{formatNumber(profile.followers.totalCount)}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{formatNumber(profile.following.totalCount)}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{formatNumber(profile.repositories.totalCount)}</span>
          <span className="stat-label">Repositories</span>
        </div>
      </div>
    </div>
  </div>
);

const StatsPanel = ({ repoStats, activity, topLanguages, isCompare = false }) => (
  <div className={`stats-panel ${isCompare ? 'compare' : ''}`}>
    <h3 className="panel-title">Advanced Stats</h3>
    <div className="stats-grid">
      <div className="stat-item">
        <span className="stat-value">{formatNumber(repoStats.totalStars)}</span>
        <span className="stat-desc">Total Stars</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{formatNumber(repoStats.totalForks)}</span>
        <span className="stat-desc">Total Forks</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{activity?.contributionsCollection?.totalCommitContributions || 0}</span>
        <span className="stat-desc">Commits (Last Year)</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{activity?.contributionsCollection?.totalPullRequestContributions || 0}</span>
        <span className="stat-desc">PRs (Last Year)</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{activity?.contributionsCollection?.totalIssueContributions || 0}</span>
        <span className="stat-desc">Issues (Last Year)</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{repoStats.averageStars.toFixed(1)}</span>
        <span className="stat-desc">Avg Stars/Repo</span>
      </div>
    </div>
    {repoStats.mostStarred && (
      <div className="highlight-repo">
        <h4>Most Starred Repository</h4>
        <p>{repoStats.mostStarred.name} ({formatNumber(repoStats.mostStarred.stargazerCount)} stars)</p>
      </div>
    )}
    {repoStats.mostForked && (
      <div className="highlight-repo">
        <h4>Most Forked Repository</h4>
        <p>{repoStats.mostForked.name} ({formatNumber(repoStats.mostForked.forkCount)} forks)</p>
      </div>
    )}
    <div className="top-languages">
      <h4>Top Languages</h4>
      <ul>
        {topLanguages.map((lang, index) => (
          <li key={lang.language} className={`lang-item lang-${index + 1}`}>
            <span className="lang-name">{lang.language}</span>
            <span className="lang-count">{lang.count} repos</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const LanguageChart = ({ languages, isCompare = false }) => {
  const maxCount = Math.max(...languages.map(l => l.count));
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
  return (
    <div className={`language-chart ${isCompare ? 'compare' : ''}`}>
      <h3 className="chart-title">Language Usage</h3>
      <div className="chart-container">
        <svg width="500" height="300" className="bar-chart">
          {languages.map((lang, index) => {
            const height = (lang.count / maxCount) * 200;
            const y = 250 - height;
            return (
              <g key={lang.language}>
                <rect
                  x={index * 60 + 20}
                  y={y}
                  width="40"
                  height={height}
                  fill={colors[index % colors.length]}
                  className="bar"
                />
                <text x={index * 60 + 40} y={y - 10} textAnchor="middle" className="bar-label">
                  {lang.language}
                </text>
                <text x={index * 60 + 40} y={y + height + 20} textAnchor="middle" className="bar-value">
                  {lang.count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="legend">
        {languages.map((lang, index) => (
          <div key={lang.language} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
            <span>{lang.language}: {lang.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RepoList = ({ repos, sortBy, setSortBy, filterLanguage, setFilterLanguage, allLanguages, isCompare = false }) => (
  <div className={`repo-list ${isCompare ? 'compare' : ''}`}>
    <h3 className="panel-title">Repositories</h3>
    <div className="controls">
      <div className="control-group">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select">
          <option value="updated">Updated</option>
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
        </select>
      </div>
      <div className="control-group">
        <label>Filter by language:</label>
        <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} className="control-select">
          <option value="">All Languages</option>
          {allLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
      </div>
    </div>
    <div className="repo-grid">
      {repos.map(repo => (
        <div key={repo.name} className="repo-card">
          <div className="repo-header">
            <h4 className="repo-name">
              <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
            </h4>
            <span className="repo-language">{repo.primaryLanguage?.name || 'N/A'}</span>
          </div>
          <p className="repo-description">{repo.description}</p>
          <div className="repo-stats">
            <span className="repo-stat">⭐ {formatNumber(repo.stargazerCount)}</span>
            <span className="repo-stat">🍴 {formatNumber(repo.forkCount)}</span>
            <span className="repo-stat">📅 {formatDate(repo.updatedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActivityFeed = ({ activity, isCompare = false }) => (
  <div className={`activity-feed ${isCompare ? 'compare' : ''}`}>
    <h3 className="panel-title">Recent Activity</h3>
    <div className="activity-sections">
      <div className="activity-section">
        <h4>Recent Pull Requests</h4>
        <ul className="activity-list">
          {activity?.pullRequests?.nodes?.map(pr => (
            <li key={pr.url} className="activity-item">
              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="activity-link">{pr.title}</a>
              <span className="activity-date">{formatDate(pr.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="activity-section">
        <h4>Recent Issues</h4>
        <ul className="activity-list">
          {activity?.issues?.nodes?.map(issue => (
            <li key={issue.url} className="activity-item">
              <a href={issue.url} target="_blank" rel="noopener noreferrer" className="activity-link">{issue.title}</a>
              <span className="activity-date">{formatDate(issue.createdAt)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="activity-section">
        <h4>Top Contributing Repositories</h4>
        <ul className="activity-list">
          {activity?.contributionsCollection?.commitContributionsByRepository
            ?.sort((a, b) => b.contributions.totalCount - a.contributions.totalCount)
            ?.slice(0, 5)
            .map(contrib => (
              <li key={contrib.repository.name} className="activity-item">
                <span className="activity-repo">{contrib.repository.name}</span>
                <span className="activity-count">{contrib.contributions.totalCount} commits</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  </div>
);

const ContributionCalendar = ({ calendar, isCompare = false }) => {
  if (!calendar) return <div>No contribution data available</div>;

  const weeks = calendar.weeks.slice(-52); // Last 52 weeks
  const maxContributions = Math.max(...weeks.flatMap(w => w.contributionDays.map(d => d.contributionCount)));

  return (
    <div className={`contribution-calendar ${isCompare ? 'compare' : ''}`}>
      <h3 className="panel-title">Contribution Calendar</h3>
      <p className="calendar-total">Total contributions in the last year: {formatNumber(calendar.totalContributions)}</p>
      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="calendar-week">
            {week.contributionDays.map((day, dayIndex) => (
              <div
                key={day.date}
                className={`calendar-day ${getContributionLevel(day.contributionCount)}`}
                title={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <span>Less</span>
        <div className="legend-colors">
          <div className="legend-color none"></div>
          <div className="legend-color low"></div>
          <div className="legend-color medium"></div>
          <div className="legend-color high"></div>
          <div className="legend-color very-high"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

const CompareProfiles = ({ profile1, profile2, repoStats1, repoStats2 }) => (
  <div className="compare-profiles">
    <h3 className="panel-title">Profile Comparison</h3>
    <div className="compare-grid">
      <div className="compare-item">
        <h4>{profile1.name || profile1.login}</h4>
        <div className="compare-stats">
          <p>Followers: {formatNumber(profile1.followers.totalCount)}</p>
          <p>Following: {formatNumber(profile1.following.totalCount)}</p>
          <p>Repos: {formatNumber(profile1.repositories.totalCount)}</p>
          <p>Total Stars: {formatNumber(repoStats1.totalStars)}</p>
          <p>Total Forks: {formatNumber(repoStats1.totalForks)}</p>
        </div>
      </div>
      <div className="compare-item">
        <h4>{profile2.name || profile2.login}</h4>
        <div className="compare-stats">
          <p>Followers: {formatNumber(profile2.followers.totalCount)}</p>
          <p>Following: {formatNumber(profile2.following.totalCount)}</p>
          <p>Repos: {formatNumber(profile2.repositories.totalCount)}</p>
          <p>Total Stars: {formatNumber(repoStats2.totalStars)}</p>
          <p>Total Forks: {formatNumber(repoStats2.totalForks)}</p>
        </div>
      </div>
    </div>
  </div>
);

export default GitHubProfileAnalyzer;