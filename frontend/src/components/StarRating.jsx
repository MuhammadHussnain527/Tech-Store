import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'}
        />
      ))}
    </div>
  );
}
