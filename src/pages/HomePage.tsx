import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceOffer } from '@shared/types';
import { PlusCircle, Clock } from 'lucide-react';
export function HomePage() {
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const data = await api<ServiceOffer[]>('/api/offers');
        setOffers(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch offers.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffers();
  }, []);
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Service Offers</h1>
              <p className="text-muted-foreground">Browse and request services from the community.</p>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Offer
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <Card key={offer.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>{offer.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {offer.price_credits} Credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View & Request</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">No Offers Available</h2>
              <p className="text-muted-foreground mt-2">Check back later or be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}