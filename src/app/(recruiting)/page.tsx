import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { DepartmentOverview } from '@/components/home/DepartmentOverview'
import { RequirementsSection } from '@/components/home/RequirementsSection'
import { ReserveProgramSection } from '@/components/home/ReserveProgramSection'
import { CTASection } from '@/components/home/CTASection'
import { LoadingCard } from '@/components/loading/LoadingShell'
import type { Route } from 'next'

const logger = createLogger({
  module: 'home',
  file: 'page.tsx'
})

export const metadata = {
  title: 'Join the Mukwonago Police Reserves',
  description:
    'Make a difference in your community by becoming a reserve police officer'
}

// Hero section component - No async operations, renders immediately
function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className='relative m-auto h-screen min-h-screen w-full items-center justify-center overflow-hidden border-b border-gray-600 bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-blue-950/40'>
      <div className='pt-18 container relative m-auto flex h-full items-center justify-center px-4 pb-32 sm:pb-44 sm:pt-24'>
        <div className='mx-auto max-w-4xl space-y-8 text-center'>
          <h1 className='mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl'>
            Join the Mukwonago Police Reserves
          </h1>
          <p className='mb-12 text-xl leading-relaxed text-gray-600 dark:text-gray-300 sm:text-2xl'>
            Make a difference in your community by becoming a reserve police
            officer
          </p>
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <Button asChild size='default' variant='default'>
              <Link
                href={(isAuthenticated ? '/application' : '/sign-up') as Route}
              >
                Apply Now
                <ArrowRight className='ml-2 transition-transform group-hover:translate-x-0.5' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function HomePage() {
  logger.info('Rendering home page', undefined, 'HomePage')
  logger.time('home-page-load')

  try {
    const user = await getCurrentUser()
    const isAuthenticated = !!user?.id

    logger.info(
      'Auth status checked',
      {
        isAuthenticated,
        userId: user?.id
      },
      'HomePage'
    )

    return (
      <div className='min-h-screen w-full bg-gradient-to-b from-white to-blue-50 dark:from-blue-950/60 dark:to-gray-950'>
        <HeroSection isAuthenticated={isAuthenticated} />

        <div className='relative'>
          {/* Department Overview Section */}
          <div className='relative overflow-hidden'>
            <div className='relative'>
              <Suspense fallback={<LoadingCard />}>
                <DepartmentOverview />
              </Suspense>
            </div>
          </div>

          {/* Requirements Section */}
          <div className='relative overflow-hidden'>
            <div className='relative'>
              <Suspense fallback={<LoadingCard />}>
                <RequirementsSection />
              </Suspense>
            </div>
          </div>

          {/* Reserve Program Section */}
          <div className='relative overflow-hidden'>
            <div className='relative'>
              <Suspense fallback={<LoadingCard />}>
                <ReserveProgramSection />
              </Suspense>
            </div>
          </div>

          {/* CTA Section */}
          <div className='relative overflow-hidden'>
            <Suspense fallback={<LoadingCard />}>
              <CTASection isAuthenticated={isAuthenticated} />
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error('Error in home page', logger.errorWithData(error), 'HomePage')
    throw error
  } finally {
    logger.timeEnd('home-page-load')
  }
}
