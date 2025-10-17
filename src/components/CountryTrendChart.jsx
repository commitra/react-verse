import { useEffect, useState, useRef, useMemo, useState as useLocalState } from 'react';
import Loading from './Loading.jsx';
import ChartPlaceholder from './ChartPlaceholder.jsx';
import ErrorMessage from './ErrorMessage.jsx';

function SimpleLineChart({ data, width = 600, height = 250 }) {
   const [hover, setHover] = useLocalState(null);
   if (!data || data.length === 0) return <ChartPlaceholder label="No data" />;

   const padding = 40;
   const dates = data.map(d => new Date(d.date));
   const values = data.map(d => d.value);

   const minY = Math.min(...values);
   const maxY = Math.max(...values);
   const yRange = maxY - minY || 1;

   const x = i => padding + (i / (data.length - 1)) * (width - padding * 2);
   const y = v => height - padding - ((v - minY) / yRange) * (height - padding * 2);

   // Smooth path using quadratic curves
   const path = data.reduce((acc, d, i, arr) => {
      const px = x(i);
      const py = y(d.value);
      if (i === 0) return `M ${px} ${py}`;
      const prevX = x(i - 1);
      const prevY = y(arr[i - 1].value);
      const midX = (px + prevX) / 2;
      const midY = (py + prevY) / 2;
      return acc + ` Q ${prevX} ${prevY}, ${midX} ${midY}`;
   }, '');

   const yTicks = 5;
   const yStep = yRange / yTicks;
   const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => minY + i * yStep);

   return (
      <svg
         width="100%"
         viewBox={`0 0 ${width} ${height}`}
         preserveAspectRatio="none"
         style={{ background: 'transparent', borderRadius: 6 }}// give it trasparent background
         onMouseLeave={() => setHover(null)}
      >
         {/* Grid lines */}
         {yLabels.map((v, i) => (
            <line
               key={i}
               x1={padding + 10}
               x2={width - padding}
               y1={y(v)}
               y2={y(v)}
               stroke="#e5e7eb"
               strokeWidth="1"
            />
         ))}

         {/* Y-axis labels */}
         {yLabels.map((v, i) => (
            <text
               key={i}
               x={padding + 2}
               y={y(v) + 4}
               textAnchor="end"
               fontSize="10"
               fill="#6b7280"
            >
               {Math.round(v).toLocaleString()}
            </text>
         ))}

         {/* Area fill */}
         <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
               <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
               <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
         </defs>
         <path
            d={`${path} L ${x(data.length - 1)} ${height - padding} L ${x(0)} ${height - padding} Z`}
            fill="url(#g)"
         />
         <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
         />

         {/* Data points */}
         {data.map((d, i) => {
            const cx = x(i);
            const cy = y(d.value);
            return (
               <circle
                  key={d.date}
                  cx={cx}
                  cy={cy}
                  r={hover === i ? 4 : 2.5}
                  fill={hover === i ? '#1e40af' : '#1d4ed8'}
                  onMouseEnter={() => setHover(i)}
               />
            );
         })}

         {/* Tooltip */}
         {hover !== null && (
            <>
               <rect
                  x={x(hover) - 45}
                  y={y(data[hover].value) - 45}
                  width="90"
                  height="32"
                  rx="4"
                  fill="#111827"
                  opacity="0.85"
               />
               <text
                  x={x(hover)}
                  y={y(data[hover].value) - 28}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
               >
                  {new Date(data[hover].date).toLocaleDateString()}
               </text>
               <text
                  x={x(hover)}
                  y={y(data[hover].value) - 15}
                  textAnchor="middle"
                  fill="#a5b4fc"
                  fontSize="11"
                  fontWeight="bold"
               >
                  {data[hover].value.toLocaleString()}
               </text>
            </>
         )}
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
            const res = await fetch(
               `https://disease.sh/v3/covid-19/historical/${slug}?lastdays=all`,
               { signal: controller.signal }
            );
            if (!res.ok) throw new Error('Failed to fetch country trends');
            const json = await res.json();

            if (!mounted || lastSlugRef.current !== slug) return;

            const cases = json.timeline?.cases || {};
            const seriesData = Object.entries(cases).map(([date, value]) => ({
               date,
               value: Number(value || 0),
            }));

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
