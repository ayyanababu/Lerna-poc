import './title.css';

export function Title({ title }: { title?: string }) {
  if (!title) return null;

  return <h4 className="title">{title}</h4>;
}
