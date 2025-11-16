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
import { ThemeToggle } from '@/components/ThemeToggle';
import { Banknote } from 'lucide-react';
const registerSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  contact: z.string().optional(),
});
type RegisterFormValues = z.infer<typeof registerSchema>;
export function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      contact: '',
    },
  });
  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Registration successful!', {
        description: 'Please check your email to verify your account, then log in.',
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Registration failed: ${errorMessage}`);
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
          <CardTitle className="text-2xl font-bold text-primary">Create an Account</CardTitle>
          <CardDescription>Join ChronoBank and start exchanging skills.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="underline text-accent">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster richColors closeButton />
    </div>
  );
}