import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string;
    image?: string | null;
    fullName?: string | null;
    name?: string | null;
    email?: string | null;
    emailAddresses?: Array<{ emailAddress: string }>;
  } | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const displayName = user?.name || user?.fullName || 'User';
  const displayEmail = user?.email || user?.emailAddresses?.[0]?.emailAddress || '';
  const displayImage = user?.image || user?.imageUrl || '';
  const initials = displayName.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={displayImage} alt={displayName} />
        <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{displayName}</span>
          <span className='truncate text-xs text-muted-foreground'>{displayEmail}</span>
        </div>
      )}
    </div>
  );
}
