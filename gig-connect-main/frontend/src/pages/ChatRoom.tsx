// frontend/src/pages/ChatRoom.tsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Info, Phone, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { ChatRoom as ChatRoomType, Message, User as UserType } from '@/types/types';
import useAuth from '@/hooks/useAuth';

/* ===========================
   Utils
=========================== */
const formatTime = (date?: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ===========================
   Chat Content Component
=========================== */
function ChatRoomContent({
  chatRoom,
  user,
  queryClient,
  _id,
}: {
  chatRoom: ChatRoomType;
  user: UserType;
  queryClient: any;
  _id: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatRoom.messages]);

  /* Send message */
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!content.trim()) return;
      const res = await apiClient.post(`/chats/${_id}/messages`, { content });
      return res.data;
    },
    onSuccess: (newMessageData) => {
      queryClient.setQueryData(['chatRoom', _id], (old: ChatRoomType | undefined) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, newMessageData],
        };
      });
      setNewMessage('');
    },
    onError: (err) => {
      console.error('Send message failed:', err);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const members = chatRoom.members || [];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">
              {chatRoom.post?.title || 'Group Chat'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {members.length} members
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Event banner */}
      {chatRoom.post && (
        <div className="border-b border-border px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {chatRoom.post.location?.address || 'Event Location'}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(chatRoom.post.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                • {chatRoom.post.time}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        {chatRoom.messages.map((message: Message, index: number) => {
          const isOwn = message.sender?._id === user?._id;
          const showAvatar =
            index === 0 ||
            chatRoom.messages[index - 1].sender?._id !== message.sender?._id;

          return (
            <div
              key={message._id || message._id}
              className={cn('flex gap-2', isOwn ? 'justify-end' : 'justify-start')}
            >
              {!isOwn && showAvatar && (
                <img
                  src={message.sender?.avatar}
                  alt={message.sender?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              {!isOwn && !showAvatar && <div className="w-8" />}

              <div className={cn('max-w-[75%]', isOwn && 'order-first')}>
                {!isOwn && showAvatar && (
                  <p className="text-xs text-muted-foreground mb-1 ml-1">
                    {message.sender?.name}
                  </p>
                )}

                <div
                  className={cn(
                    'px-4 py-2 rounded-2xl',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-secondary rounded-bl-md'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>

                <p
                  className={cn(
                    'text-xs text-muted-foreground mt-1',
                    isOwn ? 'text-right mr-1' : 'ml-1'
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border p-4 bg-background">
        <form onSubmit={handleSendMessage} className="max-w-lg mx-auto flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-12 px-4 rounded-xl bg-secondary border border-border focus:outline-none"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </>
  );
}

/* ===========================
   Page Component
=========================== */
export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Call useQuery unconditionally at the top
  const { data: chatRoom, isLoading, error } = useQuery({
    queryKey: ['chatRoom', id],
    queryFn: async () => {
      const res = await apiClient.get(`/chats/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Show loading or error states AFTER hooks
  if (authLoading) {
    return (
      <PageLayout title="Chat" showLocation={false}>
        <div className="min-h-screen flex items-center justify-center">
          Checking access...
        </div>
      </PageLayout>
    );
  }

  if (!id) {
    return (
      <PageLayout title="Chat" showLocation={false}>
        <div className="min-h-screen flex items-center justify-center">
          Chat ID missing
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title="Chat" showLocation={false}>
        <div className="min-h-screen flex items-center justify-center">
          Loading chat...
        </div>
      </PageLayout>
    );
  }

  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) {
      return (
        <PageLayout title="Chat" showLocation={false}>
          <div className="min-h-screen flex items-center justify-center">
            Access denied
          </div>
        </PageLayout>
      );
    }
    return (
      <PageLayout title="Chat" showLocation={false}>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          Chat not found
          <Button onClick={() => navigate('/chat')}>Go back</Button>
        </div>
      </PageLayout>
    );
  }

 if (!user) {
  return (
    <PageLayout title="Chat" showLocation={false}>
      <div className="min-h-screen flex items-center justify-center">
        Please login to continue
      </div>
    </PageLayout>
  );
}


  return (
    <PageLayout title="Chat" showLocation={false}>
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <ChatRoomContent
          chatRoom={chatRoom}
          user={user as UserType}
          queryClient={queryClient}
          _id={id}
        />
      </div>
    </PageLayout>
  );
}

