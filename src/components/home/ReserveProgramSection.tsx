import { Star, Shield, Award } from 'lucide-react'

export function ReserveProgramSection() {
  return (
    <div className='py-20'>
      <div className='container mx-auto px-4'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
            Reserve Officer Program
          </h2>
          <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
            Our reserve officers are essential members of the Mukwonago Police
            Department, providing crucial support in various law enforcement
            activities.
          </p>
        </div>
        <div className='grid gap-8 md:grid-cols-3'>
          <div className='rounded-xl bg-gray-50 p-8 dark:bg-gray-800'>
            <Star className='mb-4 size-12 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
              Duties & Responsibilities
            </h3>
            <ul className='list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300'>
              <li>Patrol support</li>
              <li>Traffic control</li>
              <li>Special events security</li>
              <li>Community outreach</li>
              <li>Emergency response</li>
            </ul>
          </div>
          <div className='rounded-xl bg-gray-50 p-8 dark:bg-gray-800'>
            <Shield className='mb-4 size-12 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
              Requirements
            </h3>
            <ul className='list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300'>
              <li>18 years or older</li>
              <li>Valid driver's license</li>
              <li>Clean background</li>
              <li>High school diploma/GED</li>
              <li>Physical fitness standards</li>
            </ul>
          </div>
          <div className='rounded-xl bg-gray-50 p-8 dark:bg-gray-800'>
            <Award className='mb-4 size-12 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
              Benefits
            </h3>
            <ul className='list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300'>
              <li>Professional training</li>
              <li>Law enforcement experience</li>
              <li>Community service</li>
              <li>Team environment</li>
              <li>Career development</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
