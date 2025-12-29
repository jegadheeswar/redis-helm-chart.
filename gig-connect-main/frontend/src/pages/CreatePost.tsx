// frontend/src/pages/CreatePost.tsx
import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, IndianRupee, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient'; // Ensure apiClient is imported
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function CreatePost() {
  const navigate = useNavigate(); // Get the navigate function
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    location: '', // This will be the address string
    requiredCount: '',
    perPersonRate: '',
    date: '',
    time: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.location || !form.requiredCount || !form.perPersonRate || !form.date || !form.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare the data object matching the backend schema
      // For now, use dummy coordinates based on the address or a default location
      // In a real app, you'd use a geocoding service
      let lat = 11.9489; // Default lat for Pondicherry
      let lng = 79.8090; // Default lng for Pondicherry
      if (form.location.toLowerCase().includes('chennai')) {
        lat = 13.0827;
        lng = 80.2707;
      }
      // Add more conditions for other cities if needed

      const postData = {
        ...form,
        location: { // Send location as an object
          lat: parseFloat(lat.toFixed(6)), // Ensure lat is a number
          lng: parseFloat(lng.toFixed(6)), // Ensure lng is a number
          address: form.location, // Use the address string from the form
        },
        requiredCount: parseInt(form.requiredCount, 10), // Ensure requiredCount is a number
        perPersonRate: parseInt(form.perPersonRate, 10), // Ensure perPersonRate is a number
        // date and time are already strings, which is correct
      };

      console.log('Sending post data:', postData); // Debug log

      const response = await apiClient.post('/posts', postData); // Use apiClient to send the request
      console.log('Post creation response:', response.data); // Debug log

      toast.success('Post created successfully!');
      // Navigate to requests page after successful creation
      navigate('/requests'); // Use navigate instead of window.location.href
    } catch (error: any) { // Use 'any' type for error to access response
      console.error('Post creation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to create post'); // Show backend error message if available
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Create Post" showLocation={false}>
      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        {/* Event Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Event Title *</label>
          <input
            type="text"
            placeholder="e.g., Wedding Reception Catering"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Location *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter venue address"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Time *</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
        {/* Workers & Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Required Workers *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="number"
                placeholder="e.g., 5"
                min="1"
                value={form.requiredCount}
                onChange={(e) => setForm({ ...form, requiredCount: e.target.value })}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rate/Person (₹) *</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="number"
                placeholder="e.g., 800"
                min="1"
                value={form.perPersonRate}
                onChange={(e) => setForm({ ...form, perPersonRate: e.target.value })}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            placeholder="Add details about the event, dress code, duties, etc."
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Images (Optional)</label>
          <button
            type="button"
            className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tap to add images</span>
          </button>
        </div>
        {/* Submit Button */}
        <Button
          type="submit"
          variant="coral"
          size="xl"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </PageLayout>
  );
}