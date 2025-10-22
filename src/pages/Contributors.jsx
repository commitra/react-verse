import React, { useState, useEffect } from 'react';
import { Users, GitFork, Star, ExternalLink } from 'lucide-react';

export default function ContributorsWall() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);

  useEffect(() => {
    fetchContributors();
    fetchRepoInfo();
  }, []);

  const fetchRepoInfo = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/commitra/react-verse');
      const data = await response.json();
      setRepoInfo(data);
    } catch (err) {
      console.error('Error fetching repo info:', err);
    }
  };

  const fetchContributors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://api.github.com/repos/commitra/react-verse/contributors?per_page=100'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch contributors');
      }
      
      const data = await response.json();
      setContributors(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading contributors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-6 max-w-md">
          <p className="text-red-200 text-center">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-purple-500 bg-opacity-20 rounded-full px-6 py-2 mb-4">
            <Users className="inline-block mr-2 text-purple-300" size={24} />
            <span className="text-purple-200 font-semibold">Wall of Contributors</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            React-Verse Contributors
          </h1>
          <p className="text-blue-200 text-lg mb-6">
            Honoring the amazing developers who made this project possible
          </p>
          
          {repoInfo && (
            <div className="flex justify-center gap-6 text-white">
              <div className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-full">
                <Star size={20} className="text-yellow-400" />
                <span>{repoInfo.stargazers_count} Stars</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-full">
                <GitFork size={20} className="text-blue-400" />
                <span>{repoInfo.forks_count} Forks</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-full">
                <Users size={20} className="text-green-400" />
                <span>{contributors.length} Contributors</span>
              </div>
            </div>
          )}
        </div>

        {/* Repository Link */}
        <div className="text-center mb-12">
          <a
            href="https://github.com/commitra/react-verse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            View Repository
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Contributors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {contributors.map((contributor, index) => (
            <a
              key={contributor.id}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white border-opacity-20">
                <div className="relative mb-3">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-full aspect-square rounded-full border-4 border-purple-400 group-hover:border-pink-400 transition-colors duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                    #{index + 1}
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm text-center truncate mb-1">
                  {contributor.login}
                </h3>
                <p className="text-blue-200 text-xs text-center">
                  {contributor.contributions} contributions
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-blue-300 text-sm">
            Thank you to all our contributors for making React-Verse awesome! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}