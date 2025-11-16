import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { MemberProfile } from '@shared/types';
import { User, Mail, Wallet, Calendar } from 'lucide-react';
import { format } from 'date-fns';
export function MyProfilePage() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await api<MemberProfile>('/api/member/profile');
        setProfile(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch your profile.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">My Profile</h1>
            <p className="text-muted-foreground">View your account details and credit balance.</p>
          </div>
          <Card className="max-w-2xl mx-auto shadow-lg border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Account Information</CardTitle>
              <CardDescription>Your personal details and current standing in the community.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : profile ? (
                <>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span className="text-lg font-medium text-primary">{profile.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span className="text-lg text-primary">{profile.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <span className="text-lg text-primary">
                      Member since {format(new Date(profile.created_at), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="p-4 rounded-lg bg-background border border-accent/30 flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-8 w-8 mr-4 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold text-primary">{profile.credits} Credits</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Could not load your profile information.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}