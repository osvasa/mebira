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
      <img
        src="/images/osvasa-logo.png"
        alt="Osvasa"
        style={{ height: '65px', width: 'auto' }}
      />
    </Link>
  );
}
