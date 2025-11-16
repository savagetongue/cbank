import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceRequest } from '@shared/types';
import { Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
type ServiceRequestWithOffer = ServiceRequest & {
  offers: { title: string } | null;
};
export function MyRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequestWithOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchRequests();
  }, []);
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await api<ServiceRequestWithOffer[]>('/api/requests');
      setRequests(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch your requests.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirmCompletion = async (escrowId: string, requestId: string) => {
    setIsConfirming(requestId);
    try {
      await api('/api/escrow/confirm', {
        method: 'POST',
        body: JSON.stringify({
          escrow_id: escrowId,
          idempotency_key: crypto.randomUUID(),
        }),
      });
      toast.success('Service completion confirmed!', {
        description: 'Credits have been released to the provider. Thank you!',
      });
      setRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: 'completed' } : req)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Confirmation failed: ${errorMessage}`);
    } finally {
      setIsConfirming(null);
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">My Requests</h1>
            <p className="text-muted-foreground">Track the status of all services you have requested.</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="shadow-md border-accent/20 flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-primary line-clamp-1">{request.offers?.title || request.title}</CardTitle>
                      <Badge variant={getStatusVariant(request.status)} className="capitalize">
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center pt-1 text-accent">
                      <Clock className="mr-2 h-4 w-4" /> {request.price_credits} Credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                  </CardContent>
                  {request.status === 'accepted' && request.escrow_id && (
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full btn-brand" disabled={isConfirming === request.id}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {isConfirming === request.id ? 'Confirming...' : 'Confirm Completion'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Service Completion?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will release the {request.price_credits} credits from escrow to the service provider. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleConfirmCompletion(request.escrow_id!, request.id)} className="btn-brand">
                              Confirm & Release Credits
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted">
              <h2 className="text-xl font-semibold text-primary">You haven't made any requests yet.</h2>
              <p className="text-muted-foreground mt-2">Browse the offers and find a service you need.</p>
              <Button onClick={() => navigate('/')} className="mt-4 btn-brand">
                Browse Offers
              </Button>
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}