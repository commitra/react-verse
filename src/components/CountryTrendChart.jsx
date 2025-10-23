import ChartPlaceholder from './ChartPlaceholder.jsx';

export default function CountryTrendChart({ slug }) {
  return <ChartPlaceholder label={`Country Trend for ${slug || 'N/A'} (legacy)`} />;
}
