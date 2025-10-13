export default function ErrorMessage({ error }) {
  if (!error) return null;
  return <div className="error">Error: {error.toString()}</div>;
}
