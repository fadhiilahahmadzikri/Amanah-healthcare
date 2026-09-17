import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthFormShell({ title, description, children, footer }: AuthFormShellProps) {
  return (
    <Card className='w-full max-w-[440px] gap-6 rounded-xl py-8 shadow-xl shadow-black/5'>
      <CardHeader className='gap-2 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>{title}</CardTitle>
        <CardDescription className='mx-auto max-w-[34ch] text-sm leading-relaxed'>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        {children}
        <div className='text-muted-foreground text-center text-sm'>{footer}</div>
      </CardContent>
    </Card>
  );
}
