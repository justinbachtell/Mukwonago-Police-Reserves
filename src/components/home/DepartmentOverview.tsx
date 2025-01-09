import { Card } from '@/components/ui/card'
import { Building2, Badge } from 'lucide-react'

export function DepartmentOverview() {
  return (
    <div className='bg-white py-20 dark:bg-gray-900'>
      <div className='container mx-auto px-4'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900 dark:text-white'>
            About Our Department
          </h2>
          <p className='mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300'>
            The Mukwonago Police Department provides 24/7 police protection to
            over 8,000 residents across 8.2 square miles. Located at 627 S
            Rochester Street, our department is committed to providing
            professional law enforcement services.
          </p>
        </div>

        <div className='mb-16 grid gap-8 md:grid-cols-2'>
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
              Join our team of volunteer officers and make a real difference in
              your community.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
