export default function ErrorMessage({ error, message, onRetry }) {
  if (!error && !message) return null;
  
  const displayMessage = message || error?.toString() || 'An error occurred';
  
  return (
    <div className="error">
      <div className="error-message">
        ❌ {displayMessage}
      </div>
      {onRetry && (
        <button 
          className="retry-button" 
          onClick={onRetry}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}
