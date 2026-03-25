import Link from 'next/link';

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className = '', href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      className={`flex items-center select-none ${className}`}
    >
      <span
        style={{ color: '#C8102E', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}
      >
        Mebira
      </span>
    </Link>
  );
}
