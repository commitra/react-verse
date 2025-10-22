import { useEffect, useState, useCallback, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, AlertCircle, TrendingUp, Globe, RefreshCw, Calendar } from 'lucide-react';

export default function Covid() {
  const [summary, setSummary] = useState(null);
  const [historical, setHistorical] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [country, setCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const isFetchingRef = useRef(false);

  const fetchSummary = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://disease.sh/v3/covid-19/countries');
      if (!res.ok) throw new Error('Failed to fetch country data');
      const json = await res.json();
      setSummary(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const fetchHistorical = useCallback(async (countryName) => {
    if (!countryName) return;
    try {
      const res = await fetch(`https://disease.sh/v3/covid-19/historical/${countryName}?lastdays=30`);
      if (!res.ok) throw new Error('Failed to fetch historical data');
      const json = await res.json();
      setHistorical(json);
    } catch (e) {
      console.error('Historical data error:', e);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (country) {
      fetchHistorical(country);
    }
  }, [country, fetchHistorical]);

  const countries = summary || [];
  const filteredCountries = countries.filter(c => 
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selected = countries.find(c => c.country === country);

  const global = countries.reduce(
    (acc, c) => {
      acc.cases += c.cases;
      acc.todayCases += c.todayCases;
      acc.deaths += c.deaths;
      acc.todayDeaths += c.todayDeaths;
      acc.recovered += c.recovered;
      acc.active += c.active;
      return acc;
    },
    { cases: 0, todayCases: 0, deaths: 0, todayDeaths: 0, recovered: 0, active: 0 }
  );

  const topCountries = [...countries]
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10)
    .map(c => ({
      name: c.country,
      cases: c.cases,
      deaths: c.deaths,
      recovered: c.recovered
    }));

  const globalPieData = [
    { name: 'Active', value: global.active, color: '#f59e0b' },
    { name: 'Recovered', value: global.recovered, color: '#10b981' },
    { name: 'Deaths', value: global.deaths, color: '#ef4444' }
  ];

  const historicalChartData = historical?.timeline ? 
    Object.keys(historical.timeline.cases).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cases: historical.timeline.cases[date],
      deaths: historical.timeline.deaths[date],
      recovered: historical.timeline.recovered?.[date] || 0
    })) : [];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <Activity className="text-red-500" size={40} />
              COVID-19 Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Real-time global pandemic statistics</p>
          </div>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {loading && !summary && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {countries.length > 0 && (
          <>
            {/* Global Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-semibold uppercase">Total Cases</h3>
                  <Globe className="text-blue-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(global.cases)}</p>
                <p className="text-sm text-blue-600 mt-1">+{formatNumber(global.todayCases)} today</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-semibold uppercase">Active Cases</h3>
                  <TrendingUp className="text-yellow-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(global.active)}</p>
                <p className="text-sm text-gray-500 mt-1">Currently infected</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-semibold uppercase">Recovered</h3>
                  <Users className="text-green-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(global.recovered)}</p>
                <p className="text-sm text-green-600 mt-1">{((global.recovered/global.cases)*100).toFixed(1)}% recovery rate</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-semibold uppercase">Deaths</h3>
                  <AlertCircle className="text-red-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{formatNumber(global.deaths)}</p>
                <p className="text-sm text-red-600 mt-1">+{formatNumber(global.todayDeaths)} today</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top 10 Countries Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top 10 Countries by Cases</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCountries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Bar dataKey="cases" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Global Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Global Case Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={globalPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {globalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Country Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Country Analysis</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
                >
                  <option value="">Select a country</option>
                  {filteredCountries.map((c) => (
                    <option key={c.countryInfo._id || c.country} value={c.country}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>

              {selected && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={selected.countryInfo.flag} alt={selected.country} className="w-12 h-8 object-cover rounded shadow" />
                    <h4 className="text-2xl font-bold text-gray-800">{selected.country}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Cases</p>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(selected.cases)}</p>
                      <p className="text-xs text-blue-500 mt-1">+{formatNumber(selected.todayCases)} today</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Active</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatNumber(selected.active)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Recovered</p>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(selected.recovered)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Deaths</p>
                      <p className="text-2xl font-bold text-red-600">{formatNumber(selected.deaths)}</p>
                      <p className="text-xs text-red-500 mt-1">+{formatNumber(selected.todayDeaths)} today</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>Last updated: {new Date(selected.updated).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Historical Trend Chart */}
            {historicalChartData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">30-Day Trend for {selected?.country}</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historicalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatNumber(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Cases" />
                    <Line type="monotone" dataKey="deaths" stroke="#ef4444" strokeWidth={2} dot={false} name="Deaths" />
                    <Line type="monotone" dataKey="recovered" stroke="#10b981" strokeWidth={2} dot={false} name="Recovered" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Data Source */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Data source: <a href="https://disease.sh" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">disease.sh API</a></p>
              <p className="mt-1">Data may have delays. For official information, consult WHO and local health authorities.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}