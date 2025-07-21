'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Code, Terminal, Clock } from 'lucide-react';
import { SnippetCard } from '@/components/snippet/SnippetCard';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Full-stack developer passionate about web technologies.',
        createdAt: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      setName(data.name);
      setBio(data.bio || '');
    }
  });

  // Fetch execution statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['execution-stats'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        totalExecutions: 152,
        successfulExecutions: 135,
        failedExecutions: 17,
        averageExecutionTime: 1.2,
        mostUsedLanguage: 'JavaScript'
      };
    }
  });

  // Fetch user snippets
  const { data: snippets, isLoading: snippetsLoading } = useQuery({
    queryKey: ['user-snippets'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        snippets: [
          {
            id: '1',
            title: 'My First Snippet',
            language: 'javascript',
            createdAt: new Date().toISOString(),
            user: { name: 'John Doe' },
            stars: 3,
            commentCount: 1
          }
        ]
      };
    }
  });

  const handleSaveProfile = () => {
    // This would be replaced with actual API call
    console.log('Saving profile', { name, bio });
    setIsEditing(false);
  };

  if (profileLoading) {
    return <div className="container py-8">Loading profile...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-heading-2-mobile desktop:text-heading-2-desktop mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 desktop:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profile.name}</span>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div>{profile.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bio</div>
                <div>{profile.bio || 'No bio provided'}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </Card>

        {/* Execution Statistics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Execution Statistics</h2>
          {statsLoading ? (
            <div className="text-center py-4">Loading stats...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Total Executions: {stats?.totalExecutions}</span>
              </div>
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-success" />
                <span>Successful: {stats?.successfulExecutions}</span>
              </div>
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-destructive" />
                <span>Failed: {stats?.failedExecutions}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Avg. Execution Time: {stats?.averageExecutionTime}s</span>
              </div>
              <div className="flex items-center">
                <Code className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Most Used Language: {stats?.mostUsedLanguage}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Account Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notification Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* User Snippets */}
      <div className="mt-12">
        <h2 className="text-heading-3-mobile desktop:text-heading-3-desktop mb-6">My Snippets</h2>
        
        {snippetsLoading ? (
          <div className="text-center py-8">Loading snippets...</div>
        ) : snippets?.snippets.length === 0 ? (
          <Card className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">No snippets yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any snippets yet. Create your first snippet to see it here.
            </p>
            <Button>Create Snippet</Button>
          </Card>
        ) : (
          <div className="responsive-grid">
            {snippets?.snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 