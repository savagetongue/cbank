import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceOffer, ServiceRequest } from '@shared/types';
import { ArrowLeft, Clock, Handshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export function OfferDetailsPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<ServiceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const user = useAuthStore(s => s.user);
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!offerId) return;
      try {
        setIsLoading(true);
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
  const handleRequestService = async () => {
    if (!offerId) return;
    setIsRequesting(true);
    try {
      await api<ServiceRequest>('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ offer_id: offerId }),
      });
      toast.success('Service requested successfully!', {
        description: 'The provider has been notified. You can track the status on your "My Requests" page.',
      });
      setTimeout(() => navigate('/my-requests'), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Request failed: ${errorMessage}`);
    } finally {
      setIsRequesting(false);
    }
  };
  const isOwner = user?.id === offer?.provider_member_id;
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
              <Card className="shadow-lg border-accent/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl font-bold text-primary">{offer.title}</CardTitle>
                      <CardDescription className="text-md mt-1 text-muted-foreground">
                        Offered by member: {offer.provider_member_id.substring(0, 8)}...
                      </CardDescription>
                    </div>
                    <Badge variant={offer.status === 'available' ? 'default' : 'secondary'} className="capitalize bg-accent text-accent-foreground">
                      {offer.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center text-lg font-semibold text-accent">
                    <Clock className="mr-2 h-5 w-5" />
                    <span>{offer.price_credits} Credits</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-primary">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full text-lg py-6 btn-brand" size="lg" disabled={isOwner || isRequesting}>
                        <Handshake className="mr-2 h-5 w-5" />
                        {isOwner ? "This is your offer" : (isRequesting ? "Requesting..." : "Request This Service")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Service Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          You are about to request "{offer.title}" for {offer.price_credits} credits.
                          The credits will be held in escrow upon acceptance. Do you wish to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRequestService} className="btn-brand">
                          Confirm Request
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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