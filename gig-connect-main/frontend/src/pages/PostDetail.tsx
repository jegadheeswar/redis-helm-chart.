// frontend/src/pages/PostDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Clock, Users, IndianRupee, Star, Check, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>(); // Ensure id is typed
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return; // Guard clause if id is somehow undefined
      setIsLoading(true); // Set loading state
      try {
        const response = await apiClient.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Post not found:', error);
        toast.error('Failed to load post details.');
        // Optionally, redirect to home or previous page
        // navigate(-1);
      } finally {
        setIsLoading(false); // Always stop loading
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isCreator = post.creator?._id === user?._id;
  const isInterested = post.interested?.some((u: any) => u._id === user?._id);
  const interestedUsers = post.interested || [];
  const assignedUsers = post.assigned || [];

  const handleAcceptWorker = async (userId: string) => {
    if (!id) return; // Ensure id is available
    try {
      const response = await apiClient.patch(`/posts/${id}/assign`, { workerId: userId });
      // Re-fetch the post to ensure UI is up-to-date with backend state
      const updatedPostResponse = await apiClient.get(`/posts/${id}`);
      setPost(updatedPostResponse.data);

      toast.success('Worker accepted!');
      if (updatedPostResponse.data.status === 'FILLED') {
        toast.success('All workers assigned! Group chat created.');
        setTimeout(() => navigate('/chat'), 1500);
      }
    } catch (error: any) {
      console.error('Failed to accept worker:', error);
      toast.error(error.response?.data?.error || 'Failed to assign worker');
    }
  };

  const handleRejectWorker = async (userId: string) => {
    if (!isCreator) {
      toast.error("Only the creator can reject workers.");
      return;
    }
    if (!id) return; // Ensure id is available

    try {
      // Use the new dedicated endpoint for rejection
      const response = await apiClient.delete(`/posts/${id}/interested/${userId}`);
      // Re-fetch the post to ensure UI is up-to-date with backend state
      const updatedPostResponse = await apiClient.get(`/posts/${id}`);
      setPost(updatedPostResponse.data);

      toast.info('Worker rejected.');
    } catch (error: any) {
      console.error('Failed to reject worker:', error);
      toast.error(error.response?.data?.error || 'Failed to reject worker');
    }
  };

  const handleInterest = async () => {
    if (!id) return; // Ensure id is available
    try {
      const response = await apiClient.patch(`/posts/${id}/interest`);
      // Re-fetch the post to ensure UI is up-to-date with backend state
      const updatedPostResponse = await apiClient.get(`/posts/${id}`);
      setPost(updatedPostResponse.data);

      if (isInterested) {
        toast.info('Interest removed');
      } else {
        toast.success('Interest shown! Creator will be notified.');
      }
    } catch (error: any) {
      console.error('Failed to toggle interest:', error);
      toast.error(error.response?.data?.error || 'Failed to update interest');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">Event Details</h1>
        </div>
      </header>
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Main Info Card */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              post.status === 'OPEN' ? 'bg-mint-light text-mint' : 'bg-gold-light text-gold'
            )}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-4">{post.title}</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{post.location.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{post.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{post.assigned?.length || 0} / {post.requiredCount} workers assigned</span>
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold text-lg">₹{post.perPersonRate} / person</span>
            </div>
          </div>
          {post.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground">{post.description}</p>
            </div>
          )}
        </div>
        {/* Creator Info */}
        {post.creator && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Posted by</h3>
            <div className="flex items-center gap-3">
              <img
                src={post.creator.avatar}
                alt={post.creator.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{post.creator.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span>{post.creator.rating?.avg} ({post.creator.rating?.count} reviews)</span>
                </div>
              </div>
              {!isCreator && (
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}
        {/* Assigned Workers */}
        {assignedUsers.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Assigned Workers ({assignedUsers.length})</h3>
            <div className="space-y-3">
              {assignedUsers.map((user: any) => (
                <div key={user._id} className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span>{user.rating?.avg}</span>
                      <span>•</span>
                      <span>{user.completedJobs} jobs</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-mint bg-mint-light px-2 py-1 rounded-full">
                    Assigned
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Interested Workers (Creator View) */}
        {isCreator && interestedUsers.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Interested Workers ({interestedUsers.length})</h3>
            <div className="space-y-3">
              {interestedUsers.map((user: any) => (
                <div key={user._id} className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span>{user.rating?.avg}</span>
                      <span>•</span>
                      <span>{user.completedJobs} jobs</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRejectWorker(user._id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="mint"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAcceptWorker(user._id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Action Button (Non-creator) */}
        {!isCreator && post.status === 'OPEN' && (
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
            <div className="max-w-lg mx-auto">
              <Button
                variant={isInterested ? 'secondary' : 'coral'}
                size="xl"
                className="w-full"
                onClick={handleInterest}
              >
                {isInterested ? 'Remove Interest' : "I'm Interested"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}