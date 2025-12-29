// frontend/src/pages/Profile.tsx
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Star, Briefcase, Calendar, Phone, LogOut } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { EditProfileForm } from './EditProfileForm'; // ✅ Correct relative path

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <PageLayout title="Profile" showLocation={false}>
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </PageLayout>
    );
  }

  const handleLogout = () => logout();

  return (
    <PageLayout title="Profile" showLocation={false}>
      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center">
          <div className="relative inline-block mb-4">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-coral-light"
            />
            <span className="absolute bottom-1 right-1 w-6 h-6 bg-mint rounded-full border-3 border-card flex items-center justify-center">
              <span className="text-xs text-accent-foreground">✓</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-1 mb-4">
            <Phone className="w-4 h-4" />
            {user.phone}
          </p>
          <div className="flex items-center justify-center gap-6">
           <div className="text-center">
  <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
    <Star className="w-5 h-5 text-gold fill-gold" />
    {user.rating?.avg?.toFixed(1) ?? '0.0'}
  </div>
  <p className="text-xs text-muted-foreground">
    {user.rating?.count ?? 0} reviews
  </p>
</div>

            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
                <Briefcase className="w-5 h-5 text-primary" />
                {user.completedJobs}
              </div>
              <p className="text-xs text-muted-foreground">Jobs done</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
                <Calendar className="w-5 h-5 text-mint" />
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: '2-digit',
                })}
              </div>
              <p className="text-xs text-muted-foreground">Joined</p>
            </div>
          </div>

          {/* ✅ EDIT FORM PLACED INSIDE JSX */}
          <div className="mt-6">
            <EditProfileForm />
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </PageLayout>
  );
}