import { useEffect } from 'react';
import { Howl } from 'howler';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { runSimulationWorkflow } from '@/features/commerce-simulator/api/workflow';

const notificationSound = new Howl({
  src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
  volume: 0.5
});

interface SimulatorParams {
  enabled: boolean;
  intervalMs: number;
  volume: number;
  soundEnabled: boolean;
}

export function useSimulator({ enabled, intervalMs, volume, soundEnabled }: SimulatorParams) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) return;

    const interval = setInterval(() => {
      const numOrders = Math.max(1, Math.min(volume, 10));

      void Promise.all(Array.from({ length: numOrders }, () => runSimulationWorkflow())).then(
        (workflows) => {
          workflows.filter(Boolean).forEach((workflow) => {
            if (!workflow) {
              return;
            }

            toast.custom(
              (t) => (
                <div className='flex flex-col gap-4 w-[356px] p-5 bg-background text-foreground border border-border rounded-xl shadow-lg relative overflow-hidden group'>
                  <div className='flex flex-col gap-1.5'>
                    <div className='font-semibold text-sm'>
                      New order from {workflow.order.customerName}
                    </div>
                    <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                      {workflow.order.countryFlagUrl ? (
                        <img
                          src={workflow.order.countryFlagUrl}
                          alt={workflow.order.countryName}
                          className='h-3.5 w-5 object-cover rounded-[2px]'
                        />
                      ) : (
                        <span>{workflow.order.countryFlag}</span>
                      )}
                      <span>{workflow.order.countryName ?? 'Unknown origin'}</span>
                      <span>·</span>
                      <span className='font-mono text-xs'>{workflow.order.orderNumber}</span>
                      <span>·</span>
                      <span className='font-medium text-foreground'>
                        ${workflow.order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 mt-2'>
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        router.push(`/dashboard/orders/${workflow.order.id}`);
                      }}
                      className='w-full justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-md transition-colors'
                    >
                      Open Details
                    </button>
                    <button
                      onClick={() => {
                        toast.dismiss(t);
                        router.push('/dashboard/orders');
                      }}
                      className='w-full justify-center px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium rounded-md transition-colors'
                    >
                      Orders
                    </button>
                  </div>
                </div>
              ),
              { duration: 6000 }
            );
          });
        }
      );

      if (soundEnabled) {
        notificationSound.play();
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, volume, router, soundEnabled]);
}
