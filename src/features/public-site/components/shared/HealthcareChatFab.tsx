import { MessageCircleIcon } from 'lucide-react';

export function HealthcareChatFab() {
  return (
    <a
      href='https://wa.me/6281392456664'
      className='
        fixed right-4 bottom-4 z-50 flex size-11 items-center justify-center
        rounded-xl bg-primary text-primary-foreground shadow-xs
        transition-colors hover:bg-primary/90
        md:right-6 md:bottom-6 md:size-12
      '
      aria-label='Hubungi Amanah Healthcare via WhatsApp'
    >
      <MessageCircleIcon aria-hidden />
    </a>
  );
}
