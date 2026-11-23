import { Avatar } from './Avatar';
import { cn } from '../../lib/cn';

const sizes = {
  sm: 'h-10 w-10 rounded-xl',
  md: 'h-12 w-12 rounded-2xl',
  lg: 'h-[4.5rem] w-[4.5rem] rounded-3xl',
};

export function WorkerPortrait({
  initials,
  index,
  photoDataUrl,
  color,
  size = 'md',
  alt = '',
}: {
  initials: string;
  index: number;
  photoDataUrl?: string | null;
  color?: string;
  size?: keyof typeof sizes;
  alt?: string;
}) {
  const ring = color ? { boxShadow: `0 0 0 3px #fff, 0 0 0 6px ${color}` } : undefined;
  if (photoDataUrl) {
    return (
      <img
        src={photoDataUrl}
        alt={alt}
        className={cn('shrink-0 object-cover', sizes[size])}
        style={ring}
      />
    );
  }
  return (
    <span className="inline-flex shrink-0" style={ring}>
      <Avatar initials={initials} index={index} size={size} />
    </span>
  );
}
