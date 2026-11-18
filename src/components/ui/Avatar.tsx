import { tokens } from '../../config/tokens';
import { cn } from '../../lib/cn';

const sizes = {
  sm: 'h-10 w-10 rounded-xl text-xs',
  md: 'h-12 w-12 rounded-2xl text-sm',
  lg: 'h-[4.5rem] w-[4.5rem] rounded-3xl text-xl',
};

export function Avatar({
  initials,
  index,
  size = 'md',
}: {
  initials: string;
  index: number;
  size?: keyof typeof sizes;
}) {
  return (
    <div
      className={cn('grid shrink-0 place-items-center font-bold text-white shadow-sm', sizes[size])}
      style={{ backgroundImage: tokens.avatar[index % tokens.avatar.length] }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
