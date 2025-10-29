let GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || null;

export function setGitHubToken(token) {
  GITHUB_TOKEN = token;
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export async function fetchProfileData(username) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        avatarUrl
        name
        login
        bio
        location
        company
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories {
          totalCount
        }
        url
      }
    }
  `;

  if (!GITHUB_TOKEN) throw new Error('GitHub token is required. Please provide a valid token.');
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.user;
}

export async function fetchRepoStats(username) {
  const query = `
    query($username: String!, $first: Int!) {
      user(login: $username) {
        repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            description
            stargazerCount
            forkCount
            primaryLanguage {
              name
            }
            updatedAt
            url
          }
        }
      }
    }
  `;

  if (!GITHUB_TOKEN) throw new Error('GitHub token is required. Please provide a valid token.');
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables: { username, first: 100 } }),
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.user.repositories.nodes;
}

export async function fetchRecentActivity(username) {
  // Fetch recent commits, PRs, issues
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          commitContributionsByRepository {
            repository {
              name
            }
            contributions {
              totalCount
            }
          }
        }
        pullRequests(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            title
            url
            createdAt
          }
        }
        issues(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            title
            url
            createdAt
          }
        }
      }
    }
  `;

  if (!GITHUB_TOKEN) throw new Error('GitHub token is required. Please provide a valid token.');
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.user;
}

export function calculateLanguageUsage(repos) {
  const languageMap = {};
  repos.forEach(repo => {
    const lang = repo.primaryLanguage?.name || 'Unknown';
    languageMap[lang] = (languageMap[lang] || 0) + 1;
  });
  return Object.entries(languageMap).map(([language, count]) => ({ language, count }));
}

export function sortRepos(repos, sortBy) {
  return [...repos].sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.stargazerCount - a.stargazerCount;
      case 'forks':
        return b.forkCount - a.forkCount;
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      default:
        return 0;
    }
  });
}

export function filterRepos(repos, language) {
  if (!language) return repos;
  return repos.filter(repo => repo.primaryLanguage?.name === language);
}

export async function fetchContributionCalendar(username) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  if (!GITHUB_TOKEN) throw new Error('GitHub token is required. Please provide a valid token.');
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data.user.contributionsCollection.contributionCalendar;
}

export function getTopLanguages(languages, topN = 5) {
  return languages.sort((a, b) => b.count - a.count).slice(0, topN);
}

export function calculateRepoStats(repos) {
  const stats = {
    totalStars: 0,
    totalForks: 0,
    totalSize: 0,
    languages: {},
    mostStarred: null,
    mostForked: null,
    averageStars: 0,
    averageForks: 0,
  };

  repos.forEach(repo => {
    stats.totalStars += repo.stargazerCount;
    stats.totalForks += repo.forkCount;
    stats.totalSize += repo.size || 0;
    const lang = repo.primaryLanguage?.name || 'Unknown';
    stats.languages[lang] = (stats.languages[lang] || 0) + 1;

    if (!stats.mostStarred || repo.stargazerCount > stats.mostStarred.stargazerCount) {
      stats.mostStarred = repo;
    }
    if (!stats.mostForked || repo.forkCount > stats.mostForked.forkCount) {
      stats.mostForked = repo;
    }
  });

  stats.averageStars = stats.totalStars / repos.length;
  stats.averageForks = stats.totalForks / repos.length;

  return stats;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Error';
  }
}

export function formatNumber(num) {
  return num.toLocaleString();
}

export function getContributionLevel(count) {
  if (count === 0) return 'none';
  if (count < 5) return 'low';
  if (count < 10) return 'medium';
  if (count < 20) return 'high';
  return 'very-high';
}