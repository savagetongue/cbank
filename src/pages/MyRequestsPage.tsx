import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { ServiceRequest } from '@shared/types';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [isDisputing, setIsDisputing] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
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
  const handleOpenDispute = async (escrowId: string, requestId: string) => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      toast.error('Please provide a reason for the dispute (minimum 10 characters).');
      return;
    }
    setIsDisputing(requestId);
    try {
      await api('/api/escrow/dispute', {
        method: 'POST',
        body: JSON.stringify({
          escrow_id: escrowId,
          reason: disputeReason,
        }),
      });
      toast.success('Dispute opened successfully.', {
        description: 'An administrator will review the case. We will notify you of any updates.',
      });
      setRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: 'disputed' } : req)
      );
      setDisputeReason('');
      // Find the close button and click it programmatically
      document.getElementById(`close-dispute-dialog-${requestId}`)?.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to open dispute: ${errorMessage}`);
    } finally {
      setIsDisputing(null);
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'disputed':
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
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
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
                    <CardFooter className="flex flex-col sm:flex-row gap-2">
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Open Dispute
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Open a Dispute</DialogTitle>
                            <DialogDescription>
                              If you have an issue with the service provided, please explain the situation below. An admin will review your case.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="dispute-reason">Reason for Dispute</Label>
                              <Textarea
                                id="dispute-reason"
                                placeholder="Please describe the issue in detail (min 10 characters)..."
                                className="min-h-[100px]"
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary" id={`close-dispute-dialog-${request.id}`}>
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => handleOpenDispute(request.escrow_id!, request.id)}
                              disabled={isDisputing === request.id}
                            >
                              {isDisputing === request.id ? 'Submitting...' : 'Submit Dispute'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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