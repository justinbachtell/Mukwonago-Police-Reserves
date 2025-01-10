import { Card } from '@/components/ui/card'
import { Clock, Shield, Users } from 'lucide-react'

export function RequirementsSection() {
  return (
    <section className='container relative mx-auto px-4 py-16 sm:px-8 sm:py-24'>
      <h2 className='mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-center text-3xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-16 sm:text-5xl'>
        Requirements & Expectations
      </h2>

      <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Clock className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Time Commitment
          </h3>
          <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Flexible scheduling with minimum monthly hour requirements to
            maintain active status.
          </p>
        </Card>

        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Shield className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Qualifications
          </h3>
          <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Must be 18+, have a valid driver's license, and pass background
            checks.
          </p>
        </Card>

        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Users className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-2 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Team Integration
          </h3>
          <p className='text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
            Work alongside full-time officers and participate in department
            activities.
          </p>
        </Card>
      </div>
    </section>
  )
}
