import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
export function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Settings</h1>
            <p className="text-muted-foreground">Manage your account and notification preferences.</p>
          </div>
          <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold text-primary">Coming Soon</h2>
            <p className="text-muted-foreground mt-2">
              This section is under construction. You'll soon be able to manage your profile and settings here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}