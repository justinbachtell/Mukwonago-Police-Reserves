import { Card } from '@/components/ui/card'
import { Clock, Shield, Users } from 'lucide-react'

export function RequirementsSection() {
  return (
    <div className='py-20'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white'>
          Requirements & Expectations
        </h2>
        <div className='grid gap-8 md:grid-cols-3'>
          <Card className='p-6'>
            <Clock className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-2 text-xl font-semibold'>Time Commitment</h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Flexible scheduling with minimum monthly hour requirements to
              maintain active status.
            </p>
          </Card>

          <Card className='p-6'>
            <Shield className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-2 text-xl font-semibold'>Qualifications</h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Must be 18+, have a valid driver's license, and pass background
              checks.
            </p>
          </Card>

          <Card className='p-6'>
            <Users className='mb-4 size-8 text-blue-700 dark:text-blue-400' />
            <h3 className='mb-2 text-xl font-semibold'>Team Integration</h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Work alongside full-time officers and participate in department
              activities.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
