// A card with a soft light that follows the cursor. Pass as={Link} to make it a link.
export default function SpotlightCard({ as: Tag = 'div', className = '', children, ...props }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return (
    <Tag onMouseMove={onMove} className={`group relative overflow-hidden ${className}`} {...props}>
      <span aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative block h-full">{children}</span>
    </Tag>
  );
}
