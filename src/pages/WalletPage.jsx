import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift, Copy, Check, Tag, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCustomAuth } from '@/lib/CustomAuthContext';

const REFERRAL_BONUS = 100;

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, refreshUser } = useCustomAuth();
  const [copied, setCopied] = useState(false);
  const [referInput, setReferInput] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);

  const userEmail = currentUser?.email;

  const { data: transactions, refetch: refetchTxns } = useQuery({
    queryKey: ['wallet-transactions', userEmail],
    queryFn: () => base44.entities.WalletTransaction.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
    initialData: [],
  });

  const balance = transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + (t.amount || 0) : acc - (t.amount || 0);
  }, 0);

  // Generate a stable referral code from user data (or use stored one)
  const referralCode = currentUser?.referral_code
    || (userEmail ? userEmail.split('@')[0].toUpperCase().slice(0, 6) + 'REF' : '');

  // Ensure stored referral code exists on the UserAuth record
  // (handled at registration; no need to update here)

  const alreadyUsedReferral = !!currentUser?.referred_by || !!currentUser?.referral_rewarded;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyReferralCode = async () => {
    const code = referInput.trim().toUpperCase();
    if (!code) return;
    if (code === referralCode) {
      toast.error("You can't use your own referral code!");
      return;
    }
    if (alreadyUsedReferral) {
      toast.error('You have already used a referral code.');
      return;
    }

    setApplyingCode(true);
    try {
      // Find the referrer by their referral_code field
      const allUsers = await base44.entities.User.filter({ referral_code: code });
      if (!allUsers || allUsers.length === 0) {
        toast.error('Invalid referral code. Please check and try again.');
        setApplyingCode(false);
        return;
      }

      const referrer = allUsers[0];
      if (referrer.email === userEmail) {
        toast.error("You can't use your own referral code!");
        setApplyingCode(false);
        return;
      }

      // Mark current user as referred in UserAuth entity
      await base44.entities.UserAuth.update(currentUser.id, { referred_by: referrer.email, referral_rewarded: true });
      refreshUser({ referred_by: referrer.email, referral_rewarded: true });

      // Credit ₹100 to the referee (current user)
      await base44.entities.WalletTransaction.create({
        user_email: userEmail,
        type: 'credit',
        amount: REFERRAL_BONUS,
        description: `Referral bonus – joined via ${code}`,
        source: 'referral',
        reference_id: referrer.email,
      });

      // Credit ₹100 to the referrer
      await base44.entities.WalletTransaction.create({
        user_email: referrer.email,
        type: 'credit',
        amount: REFERRAL_BONUS,
        description: `Referral bonus – ${userEmail} joined with your code`,
        source: 'referral',
        reference_id: userEmail,
      });

      toast.success(`🎉 ₹${REFERRAL_BONUS} added to both wallets!`);
      setReferInput('');
      refetchTxns();
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
    setApplyingCode(false);
  };

  return (
    <div className="px-4 pt-6 pb-6">
      <h1 className="text-xl font-bold mb-4">Wallet</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 mb-6 border-0">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium opacity-80">Available Balance</span>
        </div>
        <p className="text-3xl font-bold">₹{balance.toFixed(0)}</p>
      </Card>

      {/* Refer & Earn */}
      <Card className="p-4 mb-4 border border-gold/30 bg-gold/5">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-gold" />
          <h3 className="font-semibold text-sm">Your Referral Code</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Share your code with friends. Both of you earn ₹{REFERRAL_BONUS} when they join!
        </p>
        <div className="flex gap-2">
          <Input
            readOnly
            value={referralCode}
            className="font-mono font-bold text-sm tracking-wider bg-card"
          />
          <Button size="icon" variant="outline" onClick={copyCode} className="shrink-0">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* Apply Referral Code */}
      {!alreadyUsedReferral ? (
        <Card className="p-4 mb-6 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Have a Referral Code?</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Enter a friend's code and both of you get ₹{REFERRAL_BONUS} instantly.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. PRIYAREF"
              value={referInput}
              onChange={e => setReferInput(e.target.value.toUpperCase())}
              className="font-mono font-bold text-sm tracking-wider"
              maxLength={10}
            />
            <Button onClick={applyReferralCode} disabled={applyingCode || !referInput.trim()} className="shrink-0 px-4">
              {applyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-3 mb-6 border border-emerald-200 bg-emerald-50 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">Referral bonus already applied to your account.</p>
        </Card>
      )}

      {/* Transaction History */}
      <h3 className="font-semibold text-sm mb-3">Transaction History</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No transactions yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(txn => (
            <div key={txn.id} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                txn.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-destructive/10 text-destructive'
              }`}>
                {txn.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{txn.description || txn.source}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(txn.created_date), 'MMM d, yyyy')}
                </p>
              </div>
              <span className={`font-bold text-sm ${txn.type === 'credit' ? 'text-emerald-600' : 'text-destructive'}`}>
                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}