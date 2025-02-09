import './TimeStamp.css';

export function TimeStamp({ date }: { date?: string }) {
  if (!date) return null;

  return (
    <span className="timestamp">
      Last Update: {new Date(date).toLocaleString('en-US', { timeZone: 'UTC' })}
    </span>
  );
}
