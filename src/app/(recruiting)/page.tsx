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
    <div className='container mx-auto px-4 py-14'>
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
      <div className='bg-white dark:bg-gray-950'>
        {/* Hero Section - Render immediately */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* Department Overview - Load with Suspense */}
        <Suspense fallback={<LoadingCard />}>
          <DepartmentOverview />
        </Suspense>

        {/* Requirements Section - Load with Suspense */}
        <Suspense fallback={<LoadingCard />}>
          <RequirementsSection />
        </Suspense>

        {/* Reserve Program Section - Load with Suspense */}
        <Suspense fallback={<LoadingCard />}>
          <ReserveProgramSection />
        </Suspense>

        {/* CTA Section - Load with Suspense */}
        <Suspense fallback={<LoadingCard />}>
          <CTASection isAuthenticated={isAuthenticated} />
        </Suspense>
      </div>
    )
  } catch (error) {
    logger.error('Error in home page', logger.errorWithData(error), 'HomePage')
    throw error
  } finally {
    logger.timeEnd('home-page-load')
  }
}
