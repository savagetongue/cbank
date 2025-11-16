import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft } from 'lucide-react';
const createOfferSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }).max(100),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }).max(1000),
  price_credits: z.coerce.number().int({ message: 'Credits must be a whole number.' }).positive({ message: 'Credits must be positive.' }),
});
type CreateOfferFormValues = z.infer<typeof createOfferSchema>;
export function CreateOfferPage() {
  const navigate = useNavigate();
  const form = useForm<CreateOfferFormValues>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      title: '',
      description: '',
      price_credits: 1,
    },
  });
  const onSubmit = async (values: CreateOfferFormValues) => {
    try {
      await api('/api/offers-create', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      toast.success('Offer created successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to create offer: ${errorMessage}`);
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Button>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Create a New Service Offer</CardTitle>
                <CardDescription>Share your skills with the community. Fill out the details below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Professional Logo Design" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the service you are offering in detail..."
                              className="resize-y min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price_credits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price in Credits</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="e.g., 10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Creating Offer...' : 'Create Offer'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}