import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onClick?: () => void;
  onRate?: (rating: number) => void;
}

const StarRating = ({ 
  rating, 
  maxRating = 5, 
  interactive = false,
  onClick,
  onRate
}) => {
  return (
    <div className="flex" onClick={onClick}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
        />
      ))}
    </div>
  );
};

export default StarRating;