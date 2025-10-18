export default function ErrorMessage({ message, error, onRetry }) {
  const errorText = message || error?.toString() || "An error occurred";
  
  if (!message && !error) return null;
  
  return (
    <div className="error" style={{ 
      padding: '16px', 
      margin: '16px 0',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <span style={{ flex: 1 }}>
        ⚠️ <strong>Error:</strong> {errorText}
      </span>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
        >
          🔄 Retry
        </button>
      )}
    </div>
  );
}
