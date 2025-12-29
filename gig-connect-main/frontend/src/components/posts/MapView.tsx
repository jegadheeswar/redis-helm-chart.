import { MapPin } from 'lucide-react';
import { Post } from '@/types/types';

interface MapViewProps {
  posts: Post[];
}

export function MapView({ posts }: MapViewProps) {
  return (
    <div className="relative bg-secondary/50 rounded-2xl overflow-hidden h-48 border border-border">
      {/* Map placeholder - would integrate with Mapbox/Google Maps */}
      <div className="absolute inset-0 bg-gradient-to-br from-mint-light/50 to-coral-light/50">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Map pins */}
      {posts.slice(0, 5).map((post, index) => (
        <div
          key={post.id}
          className="absolute animate-pulse-soft"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index % 3) * 20}%`,
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
          </div>
        </div>
      ))}
      
      {/* Overlay info */}
      <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-sm rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{posts.length} jobs nearby</p>
            <p className="text-xs text-muted-foreground">Within 20 km radius</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">View Map</p>
            <p className="text-xs text-muted-foreground">Interactive mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
