import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import useAuth from '@/hooks/useAuth';

export function EditProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  /* ---------------- UPDATE NAME ---------------- */
  const updateProfile = useMutation({
    mutationFn: (data: { name: string }) =>
      apiClient.patch('/users/me', data).then(res => res.data),
    onSuccess: (updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  /* ---------------- UPLOAD AVATAR ---------------- */
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await apiClient.patch('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return res.data;
    },
    onSuccess: (updatedUser) => {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Profile image updated!');
    },
    onError: () => toast.error('Failed to upload image'),
  });

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile.mutate({ name });

    if (avatarFile) {
      uploadAvatar.mutate(avatarFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* NAME */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* AVATAR UPLOAD */}
      <div className="space-y-2">
        <Label htmlFor="avatar">Profile Image</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={updateProfile.isPending || uploadAvatar.isPending}
      >
        {(updateProfile.isPending || uploadAvatar.isPending)
          ? 'Saving...'
          : 'Save Changes'}
      </Button>
    </form>
  );
}
