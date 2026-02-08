import React, { useState, useEffect } from 'react';
import { Activity, GitBranch, GitCommit, Users, Star, GitFork, Code2, Zap, TrendingUp, Clock, Eye, Calendar, Award, Target, Flame } from 'lucide-react';

export default function GitHubAnalyticsHub() {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const extractUsername = (input) => {
    const trimmed = input.trim();
    if (trimmed.includes('github.com/')) {
      const match = trimmed.match(/github\.com\/([^\/\s?]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const fetchGitHubData = async () => {
    const user = extractUsername(input);
    if (!user) {
      setError('Please enter a GitHub username or profile URL');
      return;
    }

    setLoading(true);
    setError('');
    setUsername(user);

    try {
      const [userRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=100`),
        fetch(`https://api.github.com/users/${user}/events/public?per_page=100`)
      ]);

      if (!userRes.ok) throw new Error('User not found');
      
      const userData = await userRes.json();
      const reposData = await reposRes.json();
      const eventsData = await eventsRes.json();

      // Calculate advanced stats
      const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((acc, repo) => acc + repo.forks_count, 0);
      const totalWatchers = reposData.reduce((acc, repo) => acc + repo.watchers_count, 0);
      const totalSize = reposData.reduce((acc, repo) => acc + repo.size, 0);

      // Language statistics
      const langMap = {};
      reposData.forEach(repo => {
        if (repo.language) {
          langMap[repo.language] = (langMap[repo.language] || 0) + 1;
        }
      });
      
      const langArray = Object.entries(langMap)
        .map(([name, count]) => ({ name, count, percentage: (count / reposData.length * 100).toFixed(1) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Recent activity
      const pushEvents = eventsData.filter(e => e.type === 'PushEvent').length;
      const prEvents = eventsData.filter(e => e.type === 'PullRequestEvent').length;
      const issueEvents = eventsData.filter(e => e.type === 'IssuesEvent').length;

      setStats({
        repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        stars: totalStars,
        forks: totalForks,
        watchers: totalWatchers,
        size: totalSize,
        avatar: userData.avatar_url,
        bio: userData.bio,
        name: userData.name,
        company: userData.company,
        location: userData.location,
        blog: userData.blog,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        pushEvents,
        prEvents,
        issueEvents,
        totalEvents: eventsData.length
      });

      setLanguages(langArray);
      setRepos(reposData.slice(0, 20));
    } catch (err) {
      setError(err.message);
      setStats(null);
      setRepos([]);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchGitHubData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 animate-pulse">
            <Zap className="w-10 h-10 md:w-14 md:h-14 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              GitHub Analytics Hub
            </h1>
          </div>
          <p className="text-gray-300 text-base md:text-xl font-light">Advanced system integration & intelligence platform</p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter username or paste profile URL..."
              className="w-full px-6 py-5 bg-gray-900/70 border-2 border-purple-500/40 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 backdrop-blur-xl transition-all text-lg"
            />
          </div>
          <button
            onClick={fetchGitHubData}
            disabled={loading}
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
          >
            <Target className="w-6 h-6" />
            {loading ? 'Analyzing...' : 'Scan Profile'}
          </button>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-5 bg-red-500/10 border-2 border-red-500/50 rounded-2xl text-red-200 backdrop-blur-xl">
            <strong>Error:</strong> {error}
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-gray-900/60 to-purple-900/40 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <img src={stats.avatar} alt="avatar" className="w-32 h-32 rounded-3xl border-4 border-cyan-400/70 shadow-xl shadow-cyan-500/50" />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2 border-4 border-gray-900">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                    {stats.name || username}
                  </h2>
                  <div className="text-cyan-300 font-mono text-lg mb-3">@{username}</div>
                  {stats.bio && <p className="text-gray-300 text-lg mb-4">{stats.bio}</p>}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-400">
                    {stats.company && <span className="flex items-center gap-1">🏢 {stats.company}</span>}
                    {stats.location && <span className="flex items-center gap-1">📍 {stats.location}</span>}
                    {stats.blog && <a href={stats.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400">🔗 {stats.blog}</a>}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['overview', 'repositories', 'languages', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <MetricCard icon={<GitBranch />} label="Repositories" value={stats.repos} color="from-purple-600 to-purple-800" />
                <MetricCard icon={<Star />} label="Total Stars" value={stats.stars} color="from-yellow-500 to-orange-600" />
                <MetricCard icon={<GitFork />} label="Total Forks" value={stats.forks} color="from-blue-500 to-cyan-600" />
                <MetricCard icon={<Eye />} label="Watchers" value={stats.watchers} color="from-green-500 to-emerald-600" />
                <MetricCard icon={<Users />} label="Followers" value={stats.followers} color="from-pink-500 to-rose-600" />
                <MetricCard icon={<TrendingUp />} label="Following" value={stats.following} color="from-indigo-500 to-violet-600" />
              </div>
            )}

            {/* Repositories Tab */}
            {activeTab === 'repositories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Code2 className="w-7 h-7 text-cyan-400" />
                    Top Repositories ({repos.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {repos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div className="bg-gray-900/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Code2 className="w-7 h-7 text-cyan-400" />
                  Language Distribution
                </h3>
                <div className="space-y-4">
                  {languages.map((lang, idx) => (
                    <div key={lang.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white font-semibold">{lang.name}</span>
                        <span className="text-gray-400">{lang.count} repos ({lang.percentage}%)</span>
                      </div>
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getLanguageGradient(idx)} transition-all duration-1000`}
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActivityCard icon={<GitCommit />} label="Push Events" value={stats.pushEvents} color="from-cyan-600 to-blue-700" />
                <ActivityCard icon={<GitBranch />} label="Pull Requests" value={stats.prEvents} color="from-purple-600 to-pink-700" />
                <ActivityCard icon={<Activity />} label="Issue Events" value={stats.issueEvents} color="from-green-600 to-emerald-700" />
                <ActivityCard icon={<Zap />} label="Total Activity" value={stats.totalEvents} color="from-orange-600 to-red-700" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 border-2 border-white/10 shadow-2xl hover:scale-105 hover:shadow-cyan-500/30 transition-all`}>
      <div className="text-white/90 mb-3">{icon}</div>
      <div className="text-3xl md:text-4xl font-black text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-xs md:text-sm text-white/80 font-medium">{label}</div>
    </div>
  );
}

function ActivityCard({ icon, label, value, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 border-2 border-white/10 shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-white">{icon}</div>
        <Award className="w-6 h-6 text-white/50" />
      </div>
      <div className="text-4xl font-black text-white mb-2">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  );
}

function RepoCard({ repo }) {
  const updatedDate = new Date(repo.updated_at).toLocaleDateString();
  
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-900/60 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-6 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2 mb-2">
            <GitCommit className="w-5 h-5" />
            {repo.name}
          </h4>
          {repo.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{repo.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
        {repo.language && (
          <span className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-4 h-4 text-blue-400" />
          {repo.forks_count}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {updatedDate}
        </span>
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {repo.topics.slice(0, 4).map(topic => (
            <span key={topic} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-lg">
              {topic}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}

function getLanguageGradient(idx) {
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-emerald-600',
    'from-yellow-500 to-orange-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-violet-600',
    'from-teal-500 to-cyan-600',
    'from-pink-500 to-fuchsia-600'
  ];
  return gradients[idx % gradients.length];
}
