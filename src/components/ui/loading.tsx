'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The size variant of the loading spinner */
  size?: 'sm' | 'default' | 'lg' | 'xl'
  /** Whether to show the loading text */
  showText?: boolean
  /** Custom text to show below the spinner */
  text?: string
  /** Whether this is a full page loading state */
  fullPage?: boolean
  /** Whether to center the loading spinner */
  center?: boolean
}

export function Loading({
  size = 'default',
  showText = true,
  text = 'Loading',
  fullPage = false,
  center = true,
  className,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: 'size-4',
    default: 'size-8',
    lg: 'size-12',
    xl: 'size-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage && 'fixed inset-0 bg-background/80 backdrop-blur-sm',
        center && !fullPage && 'my-8',
        className
      )}
      {...props}
    >
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeClasses[size])}
      />
      {showText && (
        <p
          className={cn(
            'text-muted-foreground animate-pulse',
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingPage() {
  return <Loading fullPage size='lg' />
}

export function LoadingCard() {
  return (
    <div className='rounded-lg border bg-card p-8 text-card-foreground shadow-sm'>
      <Loading />
    </div>
  )
}

export function LoadingInline() {
  return <Loading size='sm' showText={false} className='inline-flex' />
}

export function LoadingDialog() {
  return <Loading size='default' className='my-8' />
}
