import { MessageCircleIcon } from 'lucide-react';

export function HealthcareChatFab() {
  return (
    <a
      href='https://wa.me/6281392456664'
      className='
        fixed right-6 bottom-[92px] z-40 flex size-14 items-center justify-center
        rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20
        border border-primary-foreground/10
        transition-all duration-200 hover:bg-primary/90 hover:scale-105 active:scale-95
      '
      aria-label='Hubungi Amanah Healthcare via WhatsApp'
      title='Hubungi via WhatsApp'
    >
      <MessageCircleIcon className='size-6' aria-hidden />
    </a>
  );
}
