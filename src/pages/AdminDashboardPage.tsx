import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import type { Dispute, Escrow, ServiceRequest, ServiceOffer } from '@shared/types';
import { Shield, Inbox, Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
type FullDispute = Dispute & {
  escrows: Escrow & {
    requests: ServiceRequest & {
      offers: ServiceOffer | null;
    };
  };
};
export function AdminDashboardPage() {
  const [disputes, setDisputes] = useState<FullDispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<FullDispute | null>(null);
  const [decision, setDecision] = useState<'release' | 'refund' | 'split'>('refund');
  const [splitPercentage, setSplitPercentage] = useState(50);
  const [isResolving, setIsResolving] = useState(false);
  useEffect(() => {
    fetchDisputes();
  }, []);
  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const data = await api<FullDispute[]>('/api/admin/disputes/open');
      setDisputes(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch disputes.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResolve = async () => {
    if (!selectedDispute) return;
    setIsResolving(true);
    try {
      await api('/api/admin/disputes/resolve', {
        method: 'POST',
        body: JSON.stringify({
          escrow_id: selectedDispute.escrow_id,
          admin_decision: decision,
          offer_share: decision === 'split' ? splitPercentage : 50,
          idempotency_key: crypto.randomUUID(),
        }),
      });
      toast.success('Dispute resolved successfully.');
      setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id));
      setSelectedDispute(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to resolve dispute: ${errorMessage}`);
    } finally {
      setIsResolving(false);
    }
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary flex items-center"><Shield className="mr-3 h-8 w-8" /> Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and resolve open disputes in the community.</p>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : disputes.length > 0 ? (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <Card key={dispute.id} className="shadow-md border-destructive/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-primary">Dispute on: "{dispute.escrows.requests.offers?.title || 'Untitled Service'}"</CardTitle>
                      <Badge variant="destructive" className="capitalize">{dispute.status}</Badge>
                    </div>
                    <CardDescription>
                      Amount in Escrow: {dispute.escrows.amount} Credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold mb-1">Reason provided:</p>
                    <blockquote className="border-l-2 pl-4 italic text-muted-foreground">{dispute.reason}</blockquote>
                    <Dialog onOpenChange={(open) => !open && setSelectedDispute(null)}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 btn-brand" onClick={() => setSelectedDispute(dispute)}>
                          <Gavel className="mr-2 h-4 w-4" /> Resolve Dispute
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Resolve Dispute</DialogTitle>
                          <DialogDescription>Review the case and make a final decision on the escrowed credits.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <Label>Decision</Label>
                          <RadioGroup value={decision} onValueChange={(value) => setDecision(value as any)}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="release" id="release" /><Label htmlFor="release">Release to Provider</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="refund" id="refund" /><Label htmlFor="refund">Refund to Requester</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="split" id="split" /><Label htmlFor="split">Split Credits</Label></div>
                          </RadioGroup>
                          {decision === 'split' && (
                            <div className="pt-4 space-y-2">
                              <Label>Provider's Share: {splitPercentage}%</Label>
                              <Slider defaultValue={[50]} max={100} step={5} onValueChange={(v) => setSplitPercentage(v[0])} />
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="secondary" onClick={() => setSelectedDispute(null)}>Cancel</Button>
                          <Button onClick={handleResolve} disabled={isResolving} className="btn-brand">
                            {isResolving ? 'Submitting...' : 'Submit Decision'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-muted">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-6 text-xl font-semibold text-primary">All Clear!</h2>
              <p className="text-muted-foreground mt-2">There are no open disputes at this time.</p>
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}