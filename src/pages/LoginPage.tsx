import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from '@/components/ui/sonner';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Banknote } from 'lucide-react';
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await api<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      login(data.accessToken, data.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Login failed: ${errorMessage}`);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="flex items-center gap-2 mb-4">
        <div className="h-10 w-10 rounded-lg bg-[hsl(var(--brand-primary))] flex items-center justify-center">
          <Banknote className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-semibold text-primary">ChronoBank</span>
      </div>
      <Card className="w-full max-w-sm shadow-lg border-accent/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your ChronoBank account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full btn-brand" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="underline text-accent">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster richColors closeButton />
    </div>
  );
}