import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceOffer, ServiceRequest } from '@shared/types';
import { PlusCircle, Inbox, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
export function MyOffersPage() {
  const [myOffers, setMyOffers] = useState<ServiceOffer[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [offersData, requestsData] = await Promise.all([
        api<ServiceOffer[]>('/api/offers/my'),
        api<ServiceRequest[]>('/api/requests/incoming'),
      ]);
      setMyOffers(offersData);
      setIncomingRequests(requestsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleAcceptRequest = async (requestId: string) => {
    setIsAccepting(requestId);
    try {
      await api('/api/request-accept', {
        method: 'POST',
        body: JSON.stringify({
          request_id: requestId,
          idempotency_key: crypto.randomUUID(),
        }),
      });
      toast.success('Request accepted!', {
        description: 'Credits are now held in escrow until the service is confirmed complete.',
      });
      // Optimistically update UI or refetch
      setIncomingRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: 'accepted' } : req)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to accept request: ${errorMessage}`);
    } finally {
      setIsAccepting(null);
    }
  };
  const getRequestsForOffer = (offerId: string) => {
    return incomingRequests.filter(req => req.offer_id === offerId);
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">My Offers</h1>
              <p className="text-muted-foreground">Manage your offers and view incoming requests.</p>
            </div>
            <Button onClick={() => navigate('/create-offer')} className="btn-brand">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Offer
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : myOffers.length > 0 ? (
            <div className="space-y-6">
              {myOffers.map((offer) => {
                const requests = getRequestsForOffer(offer.id);
                return (
                  <Card key={offer.id} className="shadow-md border-accent/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-primary">{offer.title}</CardTitle>
                        <Badge variant={offer.status === 'available' ? 'default' : 'secondary'} className="capitalize bg-accent text-accent-foreground">
                          {offer.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center pt-1 text-accent">
                        <Clock className="mr-2 h-4 w-4" /> {offer.price_credits} Credits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {requests.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="item-1">
                            <AccordionTrigger>
                              <div className="flex items-center text-primary">
                                <Inbox className="mr-2 h-4 w-4" />
                                View {requests.length} Incoming Request(s)
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 pt-2">
                                {requests.map(req => (
                                  <li key={req.id} className="p-2 rounded-md bg-background flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-medium">Request from: {req.member_id.substring(0, 8)}...</p>
                                      <p className="text-xs text-muted-foreground">Status: <span className="capitalize">{req.status}</span></p>
                                    </div>
                                    {req.status === 'pending' && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="sm" className="btn-brand" disabled={isAccepting === req.id}>
                                            {isAccepting === req.id ? 'Accepting...' : 'Accept'}
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Accept Service Request?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Accepting this request will deduct {offer.price_credits} credits from the requester and hold them in escrow. This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleAcceptRequest(req.id)} className="btn-brand">
                                              Confirm & Accept
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ) : (
                        <p className="text-sm text-muted-foreground">No incoming requests for this offer yet.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted">
              <h2 className="text-xl font-semibold text-primary">You haven't created any offers yet.</h2>
              <p className="text-muted-foreground mt-2">Share your skills with the community!</p>
              <Button onClick={() => navigate('/create-offer')} className="mt-4 btn-brand">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Offer
              </Button>
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}