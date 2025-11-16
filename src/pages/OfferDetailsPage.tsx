import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceOffer } from '@shared/types';
import { ArrowLeft, Clock, User, Handshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
export function OfferDetailsPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<ServiceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!offerId) return;
      try {
        setIsLoading(true);
        // Inefficient: fetching all offers to find one.
        // TODO: Backend should provide an endpoint to fetch a single offer by ID.
        const allOffers = await api<ServiceOffer[]>('/api/offers');
        const foundOffer = allOffers.find((o) => o.id === offerId);
        if (foundOffer) {
          setOffer(foundOffer);
        } else {
          toast.error('Offer not found.');
          navigate('/');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch offer details.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOfferDetails();
  }, [offerId, navigate]);
  const handleRequestService = () => {
    // TODO: Implement service request logic
    toast.info('Service request functionality is not yet implemented.');
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offers
            </Button>
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
              </Card>
            ) : offer ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl font-bold">{offer.title}</CardTitle>
                      <CardDescription className="text-md mt-1">
                        Service offered by Member ID: {offer.provider_member_id.substring(0, 8)}...
                      </CardDescription>
                    </div>
                    <Badge variant={offer.status === 'available' ? 'default' : 'secondary'}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center text-lg font-semibold text-primary">
                    <Clock className="mr-2 h-5 w-5" />
                    <span>{offer.price_credits} Credits</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
                  </div>
                  <Button onClick={handleRequestService} className="w-full text-lg py-6" size="lg">
                    <Handshake className="mr-2 h-5 w-5" />
                    Request This Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-xl font-semibold">Offer Not Found</h2>
                <p className="text-muted-foreground mt-2">This offer may have been removed or is no longer available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}