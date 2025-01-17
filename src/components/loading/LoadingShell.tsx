import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingShellProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingShell({ className, children }: LoadingShellProps) {
  return (
    <div className={className}>
      <div className='space-y-3'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
      {children}
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className='space-y-3 rounded-lg border p-4'>
      <Skeleton className='h-5 w-[200px]' />
      <Skeleton className='h-4 w-[300px]' />
    </div>
  )
}

export function LoadingForm() {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[100px]' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[100px]' />
        <Skeleton className='h-10 w-full' />
      </div>
      <Skeleton className='h-10 w-[120px]' />
    </div>
  )
}

export function LoadingAuth() {
  return (
    <Card className='mx-auto max-w-[400px]'>
      <CardHeader className='space-y-4 text-center'>
        <Skeleton className='mx-auto size-12 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='mx-auto h-6 w-[200px]' />
          <Skeleton className='mx-auto h-4 w-[250px]' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
        <Skeleton className='mt-2 h-10 w-full' />
      </CardContent>
    </Card>
  )
}

export function LoadingGrid() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='space-y-3'>
          <Skeleton className='h-[125px] w-full rounded-lg' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[200px]' />
            <Skeleton className='h-4 w-[150px]' />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingHeader() {
  return (
    <div className='space-y-2'>
      <Skeleton className='h-8 w-[200px]' />
      <Skeleton className='h-4 w-[300px]' />
    </div>
  )
}

export function LoadingProfile() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-6'>
        <Skeleton className='size-24 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-8 w-[200px]' />
          <Skeleton className='h-4 w-[150px]' />
        </div>
      </div>
      <LoadingForm />
    </div>
  )
}
