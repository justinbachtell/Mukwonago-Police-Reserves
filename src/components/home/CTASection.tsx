import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CTASectionProps {
  isAuthenticated: boolean
}

export function CTASection({ isAuthenticated }: CTASectionProps) {
  return (
    <section className='container relative mx-auto px-4 py-24 sm:px-8 sm:py-32'>
      <Card className='group relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white p-8 shadow-lg dark:bg-gray-950 sm:p-12'>
        <div className='mx-auto max-w-4xl text-center'>
          <h2 className='mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-blue-600 sm:text-5xl'>
            Ready to Make a Difference?
          </h2>
          <p className='mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl'>
            Join our team of dedicated reserve officers and help serve the
            Mukwonago community
          </p>
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <Button asChild size='default' variant='default'>
              <Link href={isAuthenticated ? '/application' : '/sign-up'}>
                Apply Now
                <ArrowRight className='ml-2 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </Button>
            <Button asChild size='default' variant='outline'>
              <Link href='tel:2623632400'>Contact Us</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}
