import { Suspense } from 'react'
import { LoadingShell } from '@/components/loading/LoadingShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowRight,
  Badge,
  Building2,
  Clock,
  Shield,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'

const logger = createLogger({
  module: 'home',
  file: 'page.tsx'
})

// Force static rendering for faster FCP
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

// Split the page into smaller components for better code splitting
function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className='container mx-auto px-4 pb-16 pt-20'>
      <div className='mx-auto max-w-4xl text-center'>
        <h1 className='mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white'>
          Join the Mukwonago Police Reserves
        </h1>
        <p className='mb-8 text-xl text-gray-600 dark:text-gray-300'>
          Make a difference in your community by becoming a reserve police
          officer
        </p>
        <div className='flex justify-center gap-4'>
          <Button
            asChild
            className='rounded-lg bg-blue-700 px-8 py-6 text-lg text-white hover:bg-blue-800'
          >
            <Link href={isAuthenticated ? '/application' : '/sign-up'}>
              Apply Now
              <ArrowRight className='ml-2' />
            </Link>
          </Button>
          <Button
            asChild
            variant='outline'
            className='rounded-lg border-blue-700 px-8 py-6 text-lg text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950'
          >
            <Link href='/about'>Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Async component for user authentication
async function AuthSection() {
  const user = await getCurrentUser()
  return <HeroSection isAuthenticated={!!user?.id} />
}

export default async function HomePage() {
  logger.info('Rendering home page', undefined, 'HomePage')
  logger.time('home-page-load')

  try {
    return (
      <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900'>
        {/* Hero Section with Suspense */}
        <Suspense
          fallback={
            <LoadingShell className='mx-auto max-w-4xl px-4 pt-20 text-center'>
              <div className='mt-8 flex justify-center gap-4'>
                <div className='h-14 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
                <div className='h-14 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              </div>
            </LoadingShell>
          }
        >
          <AuthSection />
        </Suspense>

        {/* Department Overview Section */}
        <section className='bg-white py-20 dark:bg-gray-900'>
          <div className='container mx-auto px-4'>
            <div className='mb-16 text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
                About Our Department
              </h2>
              <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
                The Mukwonago Police Department provides 24/7 police protection
                to over 8,000 residents across 8.2 square miles. Located at 627
                S Rochester Street, our department is committed to providing
                professional law enforcement services.
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2'>
              <Card className='p-8'>
                <Building2 className='mb-4 size-12 text-blue-700 dark:text-blue-400' />
                <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                  Our Department
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Dedicated to serving and protecting our community with
                  professionalism and integrity.
                </p>
              </Card>

              <Card className='p-8'>
                <Badge className='mb-4 size-12 text-blue-700 dark:text-blue-400' />
                <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
                  Reserve Program
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Join our team of volunteer officers and make a real difference
                  in your community.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='py-20'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white'>
              Program Features
            </h2>
            <div className='grid gap-8 md:grid-cols-3'>
              <Card className='p-6'>
                <Clock className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
                <h3 className='mb-2 text-xl font-semibold'>
                  Flexible Schedule
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Work alongside full-time officers on various shifts.
                </p>
              </Card>

              <Card className='p-6'>
                <Shield className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
                <h3 className='mb-2 text-xl font-semibold'>
                  Professional Training
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Receive comprehensive law enforcement training.
                </p>
              </Card>

              <Card className='p-6'>
                <Users className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
                <h3 className='mb-2 text-xl font-semibold'>Team Environment</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  Join a supportive team dedicated to community service.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='container mx-auto px-4 pb-20'>
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
                <Link href='/sign-up'>
                  Get Started
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
        </section>
      </div>
    )
  } catch (error) {
    logger.error('Error in home page', logger.errorWithData(error), 'HomePage')
    throw error
  } finally {
    logger.timeEnd('home-page-load')
  }
}
