import { getCurrentUser, getUserById } from '@/actions/user'
import { notFound, redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Radio,
  Shield,
  PenSquare
} from 'lucide-react'
import type { Route } from 'next'

const logger = createLogger({
  module: 'admin',
  file: 'users/[id]/page.tsx'
})

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: PageProps) {
  logger.info('Initializing user profile page', undefined, 'UserProfilePage')
  logger.time('user-profile-page-load')

  try {
    // Get current user with error handling
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('No authenticated user found', undefined, 'UserProfilePage')
      return redirect('/sign-in')
    }

    // Check admin role
    if (currentUser.role !== 'admin') {
      logger.warn(
        'Non-admin user attempted to access profile page',
        { userId: currentUser.id },
        'UserProfilePage'
      )
      return redirect('/user/dashboard')
    }

    // Validate and parse user ID
    const { id } = await params
    if (!id || typeof id !== 'string') {
      logger.error('Invalid user ID', { id }, 'UserProfilePage')
      return notFound()
    }

    // Get user to view with error handling
    const userToView = await getUserById(id)
    if (!userToView) {
      logger.error('User not found', { id }, 'UserProfilePage')
      return notFound()
    }

    logger.info(
      'User data retrieved successfully',
      {
        userId: userToView.id,
        email: userToView.email,
        role: userToView.role
      },
      'UserProfilePage'
    )

    return (
      <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              User Profile
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              View detailed information about {userToView.first_name}{' '}
              {userToView.last_name}
            </p>
          </div>
          <Link href={`/admin/users/${id}/edit` as Route}>
            <Button className='gap-2'>
              <PenSquare className='size-4' />
              Edit User
            </Button>
          </Link>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='size-5 text-blue-500' />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Full Name</p>
                <p className='text-lg font-medium'>
                  {userToView.first_name} {userToView.last_name}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Driver's License
                </p>
                <p className='font-medium'>
                  {userToView.driver_license || 'Not provided'}{' '}
                  {userToView.driver_license_state &&
                    `(${userToView.driver_license_state})`}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Member Since</p>
                <p className='font-medium'>
                  {formatDistanceToNow(new Date(userToView.created_at), {
                    addSuffix: true
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='size-5 text-green-500' />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Mail className='size-4 text-muted-foreground' />
                <p>{userToView.email}</p>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='size-4 text-muted-foreground' />
                <p>{userToView.phone || 'No phone number'}</p>
              </div>
              <div className='flex items-start gap-2'>
                <MapPin className='size-4 text-muted-foreground' />
                <div>
                  <p>{userToView.street_address || 'No address provided'}</p>
                  {userToView.city &&
                    userToView.state &&
                    userToView.zip_code && (
                      <p>
                        {userToView.city}, {userToView.state}{' '}
                        {userToView.zip_code}
                      </p>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Position */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='size-5 text-purple-500' />
                Role & Position
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Role</p>
                <Badge variant='secondary' className='mt-1'>
                  {userToView.role}
                </Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Position</p>
                <Badge variant='secondary' className='mt-1'>
                  {userToView.position}
                </Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <Badge variant='secondary' className='mt-1'>
                  {userToView.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Police Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Radio className='size-5 text-rose-500' />
                Police Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Callsign</p>
                <p className='font-medium'>{userToView.callsign || 'None'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Radio Number</p>
                <p className='font-medium'>
                  {userToView.radio_number || 'None'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in user profile page',
      logger.errorWithData(error),
      'UserProfilePage'
    )
    return redirect('/error')
  } finally {
    logger.timeEnd('user-profile-page-load')
  }
}
