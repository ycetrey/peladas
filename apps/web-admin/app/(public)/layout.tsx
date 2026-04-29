export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell">
      <div className="public-inner">{children}</div>
    </div>
  );
}
