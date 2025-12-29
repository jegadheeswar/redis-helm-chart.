// frontend/src/components/posts/PostStatusActions.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import apiClient from '@/lib/apiClient';

interface PostStatusActionsProps {
  postId: string;
  currentStatus: string;
  creatorId: string; // ✅ Explicit prop
}

export function PostStatusActions({ postId, currentStatus, creatorId }: PostStatusActionsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiClient.patch(`/posts/${postId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Status updated!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const handleStatusChange = (status: string) => {
    updateStatus.mutate(status);
  };

  if (!user) return null;

  // ✅ CORRECT CREATOR CHECK
  const isCreator = user._id === creatorId;

  if (!isCreator) return null;

  const statusOptions = [
    { value: 'OPEN', label: 'Reopen', disabled: currentStatus === 'OPEN' },
    { value: 'COMPLETED', label: 'Mark Completed', disabled: ['COMPLETED', 'CANCELLED'].includes(currentStatus) },
    { value: 'CANCELLED', label: 'Cancel Job', disabled: ['COMPLETED', 'CANCELLED'].includes(currentStatus) },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map(({ value, label, disabled }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleStatusChange(value)}
            disabled={disabled}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}