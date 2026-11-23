interface BadgeProps { variant?: 'success' | 'danger' | 'warning' | 'muted'; children: React.ReactNode; }

export function Badge({ variant = 'muted', children }: BadgeProps) {
  const cls = `badge badge-${variant}`;
  return <span className={cls}>{children}</span>;
}
