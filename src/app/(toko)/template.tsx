export default function StorefrontTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="tk-page-enter">{children}</div>;
}
