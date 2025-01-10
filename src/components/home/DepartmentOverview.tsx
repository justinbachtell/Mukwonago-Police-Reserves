import { Card } from '@/components/ui/card'
import { Building2, Badge } from 'lucide-react'

export function DepartmentOverview() {
  return (
    <section className='container relative mx-auto px-4 py-24 sm:py-32 md:px-8'>
      <div className='mb-16 text-center'>
        <h2 className='mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-gray-300 sm:text-5xl'>
          About Our Department
        </h2>
        <p className='mx-auto max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 sm:text-xl'>
          The Mukwonago Police Department provides 24/7 police protection to
          over 8,000 residents across 8.2 square miles. Located at 627 S
          Rochester Street, our department is committed to providing
          professional law enforcement services.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card className='group relative overflow-hidden p-8 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Building2 className='mb-6 size-12 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400' />
          <h3 className='mb-4 text-2xl font-semibold text-gray-900 dark:text-white'>
            Our Department
          </h3>
          <p className='text-lg leading-relaxed text-gray-600 dark:text-gray-300'>
            Dedicated to serving and protecting our community with
            professionalism and integrity.
          </p>
        </Card>

        <Card className='group relative overflow-hidden p-8 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-blue-900/20'>
          <div className='absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/50' />
          <Badge className='mb-6 size-12 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400' />
          <h3 className='mb-4 text-2xl font-semibold text-gray-900 dark:text-white'>
            Reserve Program
          </h3>
          <p className='text-lg leading-relaxed text-gray-600 dark:text-gray-300'>
            Join our team of volunteer officers and make a real difference in
            your community.
          </p>
        </Card>
      </div>
    </section>
  )
}
