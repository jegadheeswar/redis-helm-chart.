// frontend/src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PostCard } from '@/components/posts/PostCard';
import { MapView } from '@/components/posts/MapView';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Post, User } from 'src/types/types';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { data: userResponse, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.get('/users/me').then((res) => res.data),
    enabled: !!localStorage.getItem('accessToken'),
  });

  const { data: postsResponse = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.get('/posts').then((res) => res.data),
  });

  useEffect(() => {
    if (userResponse) {
      setCurrentUser(userResponse);
    }
  }, [userResponse]);

  if (userLoading || postsLoading) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <p>Loading...</p>
        </div>
      </PageLayout>
    );
  }

  const filteredPosts = (postsResponse ?? []).filter((post) => {
  if (!post || !post.creator || !post.creator._id) return false;

  const notMyPost = post.creator._id !== currentUser?._id;

  const matchesSearch =
    (post.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.location?.address ?? '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

  return notMyPost && matchesSearch;
});


  const handleInterest = async (postId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to show interest.');
      return;
    }

    try {
      await apiClient.patch(`/posts/${postId}/interest`);
      toast.success('Interest shown! Creator will be notified.');
    } catch (error) {
      console.error('Failed to toggle interest:', error);
      toast.error('Failed to update interest');
    }
  };

  return (
    <PageLayout>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
        <MapView posts={filteredPosts} />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Nearby Jobs</h2>
            <span className="text-sm text-muted-foreground">{filteredPosts.length} available</span>
          </div>
          <div className="space-y-3">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard
                    post={post}
                    onInterest={() => handleInterest(post._id)}
isInterested={
  Array.isArray(post.interested) &&
  post.interested.some((u) => u && u._id === currentUser?._id)
}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No jobs found nearby</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}