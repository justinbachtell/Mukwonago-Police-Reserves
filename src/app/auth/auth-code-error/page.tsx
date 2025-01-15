import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'

export default function AuthCodeError() {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='size-5 text-destructive' />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            There was a problem with the authentication process
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            We were unable to complete the authentication process. This could be
            due to:
          </p>
          <ul className='list-inside list-disc space-y-2'>
            <li>An expired or invalid authentication code</li>
            <li>A cancelled authentication attempt</li>
            <li>A temporary system issue</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild className='w-full'>
            <Link href={'/sign-in' as Route}>Return to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
