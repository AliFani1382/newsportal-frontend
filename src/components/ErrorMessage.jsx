export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="admin-button">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
