import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Tables } from '@/lib/database.types';
import { checkDeposit } from '@/lib/blockchain';
import { toast } from 'sonner';
import { sendExchangeCompletionWebhook, sendUncompletedExchangeWebhook, sendPaymentDetectedWebhook } from '@/lib/discord';

type Exchange = Tables<'exchanges'>;
type PaymentMethod = Tables<'payment_methods'>;

const REQUIRED_CONFIRMATIONS = 3;

export function useDepositWatcher(
    exchange: Exchange | null, 
    paymentMethod: PaymentMethod | null,
    setConfirmations: (confirmations: number | null) => void
) {
  const isWatching = useRef(true);
  const attempts = useRef(0);
  const maxAttempts = 120; // 120 attempts * 30 seconds = 60 minutes

  useEffect(() => {
    isWatching.current = true;
    attempts.current = 0;
    setConfirmations(null);

    if (!exchange || !paymentMethod || exchange.status !== 'pending') {
      return;
    }

    const watch = async () => {
      if (!isWatching.current) return;
      attempts.current++;

      try {
        const depositInfo = await checkDeposit(
          paymentMethod.details,
          exchange.from_currency,
          exchange.send_amount
        );

        if (depositInfo.status === 'found' || depositInfo.status === 'confirmed') {
          setConfirmations(depositInfo.confirmations);
          
          if (exchange.status === 'pending') {
            await supabase.from('exchanges').update({ status: 'confirming' }).eq('id', exchange.id);
            await sendPaymentDetectedWebhook(exchange, depositInfo.confirmations);
          }

          if (depositInfo.confirmations >= REQUIRED_CONFIRMATIONS) {
            isWatching.current = false;
            toast.success("Deposit confirmed! Processing your exchange.");

            await supabase.from('exchanges').update({ status: 'exchanging' }).eq('id', exchange.id);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            await supabase.from('exchanges').update({ status: 'sending' }).eq('id', exchange.id);
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const { data: finalData, error } = await supabase.from('exchanges').update({ status: 'completed' }).eq('id', exchange.id).select().single();
            if (!error && finalData) {
                await sendExchangeCompletionWebhook(finalData);
            }
          }
        }
      } catch (error) {
        console.error("Error watching deposit:", error);
      }

      if (isWatching.current) {
        if (attempts.current >= maxAttempts) {
            isWatching.current = false;
            toast.warning("Exchange timed out. No deposit detected after 60 minutes.");
            const { data: cancelledData, error } = await supabase.from('exchanges').update({ status: 'cancelled' }).eq('id', exchange.id).select().single();
            if (!error && cancelledData) {
                await sendUncompletedExchangeWebhook(cancelledData);
            }
        } else {
            setTimeout(watch, 30000);
        }
      }
    };

    const timeoutId = setTimeout(watch, 5000);

    return () => {
      isWatching.current = false;
      clearTimeout(timeoutId);
    };
  }, [exchange, paymentMethod, setConfirmations]);
}
