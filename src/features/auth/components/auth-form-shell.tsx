import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormShellProps {
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthFormShell({ title, description, children, footer }: AuthFormShellProps) {
  return (
    <Card className='w-full max-w-[440px] gap-6 border-0 shadow-none bg-transparent sm:border sm:shadow-xl sm:bg-card sm:rounded-xl py-2 sm:py-8'>
      <CardHeader className='gap-2 text-left sm:text-center items-start sm:items-center p-2 sm:p-6'>
        <CardTitle className='text-left sm:text-center text-2xl font-bold tracking-tight w-full'>
          {title}
        </CardTitle>
        <CardDescription className='text-left sm:text-center mx-0 sm:mx-auto max-w-[38ch] text-sm leading-relaxed text-muted-foreground'>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5 p-2 sm:p-6 pt-0 sm:pt-0'>
        {children}
        {footer ? <div className='text-muted-foreground text-center text-sm'>{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
