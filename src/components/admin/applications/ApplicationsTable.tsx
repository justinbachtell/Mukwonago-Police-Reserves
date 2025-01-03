'use client';

import type { Application } from '@/types/application';
import type { ColumnDef } from '@tanstack/react-table';
import { updateApplicationStatus, getResumeUrl } from '@/actions/application'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CompletedApplicationForm } from '@/components/forms/completedApplicationForm'
import { toast } from 'sonner'
import { FileIcon, EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { PDFViewer } from '@/components/ui/pdf-viewer'

interface ApplicationsTableProps {
  data: Application[]
}

function ApplicationCell({ application }: { application: Application }) {
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
                Submitted on {application.created_at.toLocaleDateString()}
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
              ...application,
              clerk_id: '',
              created_at: application.created_at,
              driver_license_state: null,
              id: application.user_id,
              position: application.position,
              role: 'guest',
              updated_at: application.updated_at,
              callsign: null,
              radio_number: null
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
      if (!application.resume) {
        toast.error('No resume available')
        return
      }

      const signedUrl = await getResumeUrl(application.resume)
      setPdfUrl(signedUrl)
      setIsOpen(true)
    } catch (error) {
      console.error('Error viewing resume:', error)
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

const columns: ColumnDef<Application>[] = [
  {
    accessorKey: 'first_name',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='truncate'>{row.getValue('first_name')}</span>
      </div>
    ),
    header: 'First Name'
  },
  {
    accessorKey: 'last_name',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='truncate'>{row.getValue('last_name')}</span>
      </div>
    ),
    header: 'Last Name'
  },
  {
    accessorKey: 'email',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='truncate'>{row.getValue('email')}</span>
      </div>
    ),
    header: 'Email'
  },
  {
    accessorKey: 'phone',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='truncate'>{row.getValue('phone')}</span>
      </div>
    ),
    header: 'Phone'
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => {
      const position = row.getValue('position') as string
      return (
        <div className='flex flex-col'>
          <Badge variant='outline' className='w-fit capitalize'>
            {position.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    header: 'Position'
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className='flex flex-col'>
          <Badge
            variant={
              status === 'pending'
                ? 'outline'
                : status === 'approved'
                  ? 'default'
                  : 'destructive'
            }
            className='w-fit capitalize'
          >
            {status}
          </Badge>
        </div>
      )
    },
    header: 'Status'
  },
  {
    cell: ({ row }) => {
      const application = row.original
      return <ApplicationCell application={application} />
    },
    header: 'Application',
    id: 'application'
  },
  {
    accessorKey: 'resume',
    cell: ({ row }) => {
      const application = row.original
      return <ResumeCell application={application} />
    },
    header: 'Resume'
  },
  {
    cell: ({ row }) => {
      const application = row.original

      const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        try {
          await updateApplicationStatus(application.id, status)
          toast.success(`Application ${status} successfully`)
        } catch {
          toast.error('Failed to update application status')
        }
      }

      return (
        <div className='flex items-center justify-start gap-2'>
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
    header: 'Actions',
    id: 'actions'
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as Date
      return <span>{createdAt.toLocaleDateString()}</span>
    },
    header: 'Applied On'
  }
]

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      rowClassName={row => {
        switch (row.status) {
          case 'approved':
            return 'bg-green-50 hover:bg-green-100'
          case 'rejected':
            return 'bg-red-50 hover:bg-red-100'
          default:
            return 'hover:bg-gray-50'
        }
      }}
    />
  )
}
