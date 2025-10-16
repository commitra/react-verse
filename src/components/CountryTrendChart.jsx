import { useEffect, useState, useRef } from 'react';
import Loading from './Loading.jsx';
import ChartPlaceholder from './ChartPlaceholder.jsx';

// Tiny, dependency-free line chart that accepts array of {date, value}
function SimpleLineChart({ data, width = 600, height = 200 }) {
   if (!data || data.length === 0) return <ChartPlaceholder label="No data" />;

   const padding = 20;
   const dates = data.map(d => new Date(d.date));
   const values = data.map(d => d.value);
   const minY = Math.min(...values);
   const maxY = Math.max(...values);

   const x = i => {
      const t = i / (data.length - 1 || 1);
      return padding + t * (width - padding * 2);
   };
   const y = v => {
      const range = maxY - minY || 1;
      const t = (v - minY) / range;
      return height - padding - t * (height - padding * 2);
   };

   const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');

   return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
         <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
               <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
               <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
         </defs>
         <path d={`${path} L ${x(data.length - 1)} ${height - padding} L ${x(0)} ${height - padding} Z`} fill="url(#g)" />
         <path d={path} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
         {data.map((d, i) => (
            <circle key={d.date} cx={x(i)} cy={y(d.value)} r={i === data.length - 1 ? 3.5 : 2} fill="#1e3a8a" />
         ))}
      </svg>
   );
}

export default function CountryTrendChart({ slug }) {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [series, setSeries] = useState([]);
   const abortRef = useRef();
   const lastSlugRef = useRef(slug);

   useEffect(() => {
      if (!slug) {
         lastSlugRef.current = slug;
         setSeries([]);
         setError(null);
         setLoading(false);
         if (abortRef.current) abortRef.current.abort();
         return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      let mounted = true;

      async function load() {
         setLoading(true);
         setError(null);
         setSeries([]);
         try {
            const res = await fetch(`https://api.covid19api.com/dayone/country/${slug}`, { signal: controller.signal });
            if (!res.ok) throw new Error('Failed to fetch country trends');
            const json = await res.json();

            if (!mounted || lastSlugRef.current !== slug) return;

            const seriesData = json.map(item => ({ date: item.Date, value: Number(item.Confirmed || 0) }));

            seriesData.sort((a, b) => new Date(a.date) - new Date(b.date));

            setSeries(seriesData);
         } catch (e) {
            if (e.name === 'AbortError') return;
            setError(e);
         } finally {
            if (mounted) setLoading(false);
         }
      }

      lastSlugRef.current = slug;
      load();

      return () => {
         mounted = false;
         controller.abort();
      };
   }, [slug]);

   if (!slug) return <ChartPlaceholder label="Select a country to view trends" />;
   if (loading && series.length === 0) return <Loading />;
   if (error) return <ErrorMessage error={error} />;

   return (
      <div className="country-trend-chart">
         <h3>Confirmed Cases — Cumulative</h3>
         <SimpleLineChart data={series} />
      </div>
   );
}
