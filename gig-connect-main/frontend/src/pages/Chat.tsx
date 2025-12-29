// frontend/src/pages/Chat.tsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { ChatRoom } from '@/types/types';
import { PageLayout } from '@/components/layout/PageLayout';
import { MessageSquare, ChevronRight } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: chatRooms = [], isLoading, error } = useQuery({
    queryKey: ['userChats'],
    queryFn: async () => {
      const res = await apiClient.get('/chats');
      return res.data;
    },
    enabled: !!localStorage.getItem('accessToken'),
  });

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (isLoading)
    return (
      <PageLayout title="Messages" showLocation={false}>
        <div className="p-4 text-center">Loading chats...</div>
      </PageLayout>
    );

  if (error)
    return (
      <PageLayout title="Messages" showLocation={false}>
        <div className="p-4 text-center text-destructive">Failed to load chats</div>
      </PageLayout>
    );

  return (
    <PageLayout title="Messages" showLocation={false}>
      <div className="p-4">
        {chatRooms.length > 0 ? (
          <div className="space-y-3">
            {chatRooms.map((room: ChatRoom) => {
              const lastMessage = room.messages?.[room.messages.length - 1];

              return (
                <button
                  key={room._id}
                  onClick={() => navigate(`/chat/${room._id}`)}
                  className="w-full bg-card rounded-2xl p-4 shadow-card border border-border/50 flex items-center gap-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-mint/20 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-mint rounded-full border-2 border-card" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {room.post?.title || 'Group Chat'}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(lastMessage.createdAt.toString())}
                        </span>
                      )}
                    </div>

                    {lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage.sender._id === user?._id ? 'You: ' : `${lastMessage.sender?.name}: `}
                        {lastMessage.content}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {room.members.length} members
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1 text-foreground">No chats yet</p>
            <p className="text-sm text-muted-foreground">
              Group chats will appear here when you join events
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}