import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function FormCardSkeleton() {
  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <Skeleton className='h-8 w-48' /> {}
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {}
          <div className='space-y-6'>
            <Skeleton className='h-4 w-16' /> {}
            <Skeleton className='h-32 w-full rounded-lg' /> {}
          </div>

          {}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' /> {}
              <Skeleton className='h-10 w-full' /> {}
            </div>

            {}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' /> {}
              <Skeleton className='h-10 w-full' /> {}
            </div>

            {}
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' /> {}
              <Skeleton className='h-10 w-full' /> {}
            </div>
          </div>

          {}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' /> {}
            <Skeleton className='h-32 w-full' /> {}
          </div>

          {}
          <Skeleton className='h-10 w-28' />
        </div>
      </CardContent>
    </Card>
  );
}
