'use client'

import type { Application } from '@/types/application'
import type { ColumnDef } from '@tanstack/react-table'
import { updateApplicationStatus, getResumeUrl } from '@/actions/application'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CompletedApplicationForm } from '@/components/forms/completedApplicationForm'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { toast } from 'sonner'
import { ArrowUpDown, FileIcon, EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'applications/columns.tsx'
})

function ApplicationCell({ application }: { application: Application }) {
  logger.debug(
    'Rendering application cell',
    {
      id: application.id,
      name: `${application.first_name} ${application.last_name}`,
      status: application.status
    },
    'ApplicationCell'
  )

  return (
    <div className='flex items-center justify-start gap-2'>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline' size='sm' className='h-8 w-fit'>
            <EyeIcon className='size-4' />
            View Application
          </Button>
        </DialogTrigger>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[800px]'>
          <DialogHeader className='flex flex-col gap-2'>
            <DialogTitle>
              Application for {application.first_name} {application.last_name}
            </DialogTitle>
            <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
              <span className='flex flex-col'>
                Submitted on{' '}
                {new Date(application.created_at).toLocaleDateString()}
              </span>
              <span className='flex flex-row items-center gap-2'>
                Status:{' '}
                <Badge
                  variant={
                    application.status === 'approved'
                      ? 'default'
                      : application.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </Badge>
              </span>
            </div>
          </DialogHeader>
          <CompletedApplicationForm
            application={application}
            user={{
              id: application.user_id,
              email: application.email,
              first_name: application.first_name,
              last_name: application.last_name,
              role: 'guest',
              position: application.position,
              phone: application.phone,
              street_address: application.street_address,
              city: application.city,
              state: application.state,
              zip_code: application.zip_code,
              driver_license: application.driver_license,
              driver_license_state: null,
              callsign: null,
              radio_number: null,
              status: 'active' as const,
              created_at: toISOString(application.created_at),
              updated_at: toISOString(application.updated_at)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResumeCell({ application }: { application: Application }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleResumeView = async () => {
    try {
      logger.info(
        'Viewing resume',
        { applicationId: application.id },
        'handleResumeView'
      )

      if (!application.resume) {
        logger.warn(
          'No resume available',
          { applicationId: application.id },
          'handleResumeView'
        )
        toast.error('No resume available')
        return
      }

      const signedUrl = await getResumeUrl(application.resume)
      setPdfUrl(signedUrl)
      setIsOpen(true)
      logger.info(
        'Resume URL generated',
        { applicationId: application.id },
        'handleResumeView'
      )
    } catch (error) {
      logger.error(
        'Failed to load resume',
        logger.errorWithData(error),
        'handleResumeView'
      )
      toast.error('Failed to load resume')
    }
  }

  return (
    <div className='flex flex-col'>
      {application.resume ? (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={handleResumeView}
            className='flex items-center gap-2'
          >
            <FileIcon className='size-4' />
            View Resume
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='max-h-[90vh] w-[90vw] max-w-[90vw] p-0'>
              <DialogHeader className='border-b px-6 py-4'>
                <DialogTitle>
                  Resume - {application.first_name} {application.last_name}
                </DialogTitle>
              </DialogHeader>
              {pdfUrl && (
                <div className='overflow-hidden'>
                  <PDFViewer url={pdfUrl} />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <span className='text-muted-foreground'>No resume</span>
      )}
    </div>
  )
}

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: 'first_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          First Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      logger.debug(
        'Rendering first name cell',
        { value: row.getValue('first_name') },
        'columns'
      )
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.first_name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'last_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.last_name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.email}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Phone
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.phone}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => {
      const position = row.getValue('position') as string
      return (
        <div className='flex flex-col px-4'>
          {position
            .replace('_', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Position
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className='flex flex-col px-4'>
          <Badge
            variant={
              status === 'pending'
                ? 'outline'
                : status === 'approved'
                  ? 'success'
                  : 'destructive'
            }
            className='w-fit capitalize'
          >
            {status}
          </Badge>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'application',
    cell: ({ row }) => {
      const application = row.original
      return <ApplicationCell application={application} />
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Application
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    id: 'application'
  },
  {
    accessorKey: 'resume',
    cell: ({ row }) => {
      const application = row.original
      return <ResumeCell application={application} />
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Resume
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const createdAt = toISOString(new Date(row.getValue('created_at')))
      return (
        <div className='flex flex-col px-4'>
          <span>{createdAt}</span>
        </div>
      )
    },
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Applied On
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
  },
  {
    cell: ({ row }) => {
      const application = row.original

      logger.debug(
        'Rendering actions cell',
        { applicationId: application.id },
        'columns'
      )

      const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        try {
          logger.info(
            'Updating application status',
            { id: application.id, newStatus: status },
            'handleStatusUpdate'
          )

          await updateApplicationStatus(application.id, status)
          toast.success(`Application ${status} successfully`)
          window.location.reload()
        } catch (error) {
          logger.error(
            'Status update failed',
            logger.errorWithData(error),
            'handleStatusUpdate'
          )
          toast.error('Failed to update application status')
        }
      }

      return (
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleStatusUpdate('approved')}
            className='h-8 w-20'
          >
            Approve
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleStatusUpdate('rejected')}
            className='h-8 w-20 text-destructive'
          >
            Reject
          </Button>
        </div>
      )
    },
    id: 'actions'
  }
]
