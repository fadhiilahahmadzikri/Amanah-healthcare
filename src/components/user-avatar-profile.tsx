import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { AuthUser } from '@/lib/rbac/auth-context';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: Pick<AuthUser, 'name' | 'email' | 'image'> | null;
}

export function UserAvatarProfile({ className, showInfo = false, user }: UserAvatarProfileProps) {
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayImage = user?.image || DEFAULT_AVATAR_PATH;

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={displayImage} alt={displayName} />
        <AvatarFallback className='rounded-lg p-0 bg-transparent overflow-hidden'>
          <Image
            src={DEFAULT_AVATAR_PATH}
            alt={displayName}
            width={40}
            height={40}
            unoptimized
            className='size-full object-cover rounded-lg aspect-square'
          />
        </AvatarFallback>
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
