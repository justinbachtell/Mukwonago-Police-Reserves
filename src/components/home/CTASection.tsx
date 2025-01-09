import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CTASectionProps {
  isAuthenticated: boolean
}

export function CTASection({ isAuthenticated }: CTASectionProps) {
  return (
    <div className='container mx-auto px-4 pb-20'>
      <Card className='rounded-2xl bg-blue-700 p-12 text-center dark:bg-blue-800'>
        <h2 className='mb-4 text-3xl font-bold text-white'>
          Ready to Make a Difference?
        </h2>
        <p className='mx-auto mb-8 max-w-2xl text-blue-100'>
          Join our team of dedicated reserve officers and help serve the
          Mukwonago community
        </p>
        <div className='flex justify-center gap-4'>
          <Button
            asChild
            variant='secondary'
            className='rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100'
          >
            <Link href={isAuthenticated ? '/application' : '/sign-up'}>
              {isAuthenticated ? 'Apply Now' : 'Sign Up'}
              <ArrowRight className='ml-2' />
            </Link>
          </Button>
          <Button
            asChild
            variant='secondary'
            className='rounded-lg bg-white px-8 py-6 text-lg text-blue-700 hover:bg-gray-100'
          >
            <Link href='tel:2623632400'>Contact Us</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
