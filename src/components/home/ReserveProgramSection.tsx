import { Star, Shield, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ReserveProgramSection() {
  return (
    <section className='container relative mx-auto px-4 py-16 sm:px-8 sm:py-24'>
      <div className='mb-8 text-center sm:mb-16'>
        <h2 className='mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:mb-4 sm:text-5xl'>
          Reserve Officer Program
        </h2>
        <p className='mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg'>
          Our reserve officers are essential members of the Mukwonago Police
          Department, providing crucial support in various law enforcement
          activities.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Star className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Duties & Responsibilities
          </h3>
          <ul className='space-y-2 text-base text-gray-600 dark:text-gray-300 sm:space-y-3 sm:text-lg'>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Patrol support
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Traffic control
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Special events security
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Community outreach
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Emergency response
            </li>
          </ul>
        </Card>

        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Shield className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Requirements
          </h3>
          <ul className='space-y-2 text-base text-gray-600 dark:text-gray-300 sm:space-y-3 sm:text-lg'>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              18 years or older
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Valid driver's license
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Clean background
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              High school diploma/GED
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Physical fitness standards
            </li>
          </ul>
        </Card>

        <Card className='group relative overflow-hidden p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20 sm:p-8'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Award className='mb-4 size-10 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400 sm:mb-6 sm:size-12' />
          <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl'>
            Benefits
          </h3>
          <ul className='space-y-2 text-base text-gray-600 dark:text-gray-300 sm:space-y-3 sm:text-lg'>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Professional training
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Law enforcement experience
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Community service
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Team environment
            </li>
            <li className='flex items-center gap-2'>
              <div className='size-1.5 rounded-full bg-blue-600 dark:bg-blue-400' />
              Career development
            </li>
          </ul>
        </Card>
      </div>
    </section>
  )
}
