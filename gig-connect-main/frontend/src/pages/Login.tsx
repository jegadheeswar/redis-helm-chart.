// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length !== 10 || !formData.password) {
      toast.error('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    try {
      // Prepend '+91' for backend validation
      const phoneWithPrefix = `+91${formData.phone}`;

      const response = await apiClient.post('/auth/login', {
        phone: phoneWithPrefix,
        password: formData.password, // Include password
      });
      console.log('Login response:', response.data); // Debug log

      if (response.data.accessToken) {
        // Store tokens and user data in localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast.success(response.data.message || 'Login successful!');
        // Redirect to home
        navigate('/');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout title="Login" showLocation={false}>
      <div className="p-4 max-w-md mx-auto">
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
          <h2 className="text-xl font-bold text-foreground mb-4">Login to Catering-Boyzz</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number (10 digits)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
                inputMode="numeric" // Hint for numeric keyboard on mobile
                maxLength={10} // Limit to 10 characters
              />
              {formData.phone && formData.phone.length > 0 && formData.phone.length !== 10 && (
                <p className="text-xs text-destructive mt-1">Enter exactly 10 digits</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              variant="coral"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary underline hover:text-primary/80"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}