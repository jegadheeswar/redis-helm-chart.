// frontend/src/components/posts/PostCard.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, IndianRupee, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Post } from 'src/types/types'; // adjust the path as needed

interface PostCardProps {
  post: Post;
  onInterest?: () => void;
  isInterested?: boolean;
}

export function PostCard({ post, onInterest, isInterested }: PostCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const statusColors = {
    OPEN: 'bg-mint-light text-mint',
    FILLED: 'bg-gold-light text-gold',
    COMPLETED: 'bg-secondary text-muted-foreground',
    CANCELLED: 'bg-destructive/10 text-destructive',
  };

  // ✅ SAFE ACCESS — NO ?? 0 NEEDED AFTER BACKEND FIX (but kept for dev safety)
 const creator = post.creator;

const creatorName = creator?.name ?? 'Unknown';
const creatorAvatar = creator?.avatar ?? null;

const creatorRatingAvg = creator?.rating?.avg ?? 0;
const creatorRatingCount = creator?.rating?.count ?? 0;


  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-card border border-border/50"
      onClick={() => navigate(`/post/${post._id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
            <MapPin className="w-4 h-4" />
            <span>{post.location.address || 'Address not available'}</span>
          </div>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            statusColors[post.status] || 'bg-secondary text-foreground',
          )}
        >
          {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
        </span>
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{formatDate(post.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {post.assigned.length}/{post.requiredCount}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">
                {creatorName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{creatorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-gold fill-gold" />
              <span>
                {creatorRatingAvg.toFixed(1)} ({creatorRatingCount})
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">₹{post.perPersonRate}/person</p>
          <p className="text-xs text-muted-foreground">{post.time}</p>
        </div>
      </div>
      <div className="pt-3">
        <Button
          variant={isInterested ? 'secondary' : 'coral'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onInterest?.();
          }}
          disabled={post.status !== 'OPEN'}
        >
          {isInterested ? 'Interested ✓' : "I'm Interested"}
        </Button>
      </div>
    </div>
  );
}