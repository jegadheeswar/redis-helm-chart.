// frontend/src/pages/Requests.tsx
import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PostCard } from '@/components/posts/PostCard';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';

type TabType = 'created' | 'interested';

export default function Requests() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('created');

  // Fetch posts created by the user
  const { data: myCreatedPosts = [], isLoading: isLoadingCreated } = useQuery({
    queryKey: ['posts', 'my', 'created'],
    queryFn: async () => {
      const response = await apiClient.get('/posts/my/created');
      return response.data;
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Fetch posts the user is interested in
  const { data: myInterestedPosts = [], isLoading: isLoadingInterested } = useQuery({
    queryKey: ['posts', 'my', 'interested'],
    queryFn: async () => {
      const response = await apiClient.get('/posts/my/interested');
      return response.data;
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Combine loading states if needed
  const isLoading = isLoadingCreated || isLoadingInterested;

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'created', label: 'My Posts', count: myCreatedPosts.length },
    { id: 'interested', label: 'Interested', count: myInterestedPosts.length },
  ];

  const displayedPosts = activeTab === 'created' ? myCreatedPosts : myInterestedPosts;

  return (
    <PageLayout title="Requests" showLocation={false}>
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        {/* Posts List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : displayedPosts.length > 0 ? (
            displayedPosts.map((post, index) => (
              <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <PostCard
                  post={post}
                  isInterested={post.interested?.some(u => u._id === user?._id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-foreground font-medium mb-1">
                {activeTab === 'created' ? 'No posts yet' : 'No interests yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'created'
                  ? 'Create a post to find workers for your event'
                  : 'Show interest in jobs to see them here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}