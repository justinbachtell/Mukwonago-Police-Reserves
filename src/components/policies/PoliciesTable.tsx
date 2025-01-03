'use client'

import type { Policy } from '@/types/policy'
import type { ColumnDef } from '@tanstack/react-table'
import {
  deletePolicy,
  getPolicyUrl,
  updatePolicy,
  uploadPolicy
} from '@/actions/policy'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { EyeIcon, Trash2Icon, PencilIcon, ArrowUpDown } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { PDFViewer } from '@/components/ui/pdf-viewer'

interface PoliciesTableProps {
  data: Policy[]
}

export function PoliciesTable({ data }: PoliciesTableProps) {
  const { user } = useUser()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<number | null>(null)
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check file type
      if (
        !file.type.match(
          'application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ) {
        toast.error('Please upload a PDF or Word document')
        e.target.value = '' // Clear the input
        return
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        e.target.value = '' // Clear the input
        return
      }
      setSelectedFile(file)
    }
  }

  const handleViewClick = async (policy: Policy) => {
    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setViewPdfUrl(signedUrl)
      setViewingPolicy(policy)
      setIsViewOpen(true)
    } catch (error) {
      console.error('Error viewing policy:', error)
      toast.error('Failed to view policy')
    }
  }

  const handleDeleteClick = (id: number) => {
    setPolicyToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!policyToDelete) {
      return
    }

    try {
      await deletePolicy(policyToDelete)
      toast.success('Policy deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting policy:', error)
      toast.error('Failed to delete policy')
    } finally {
      setShowDeleteDialog(false)
      setPolicyToDelete(null)
    }
  }

  const handleUpdateSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    policy: Policy
  ) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      let policyUrl = policy.policy_url

      if (selectedFile) {
        // Create a blob from the file to ensure proper upload
        const fileBlob = new Blob([selectedFile], { type: selectedFile.type })
        policyUrl = await uploadPolicy(
          fileBlob as File,
          formData.get('policy_number') as string,
          formData.get('name') as string
        )
      }

      await updatePolicy(policy.id, {
        name: formData.get('name') as string,
        policy_number: formData.get('policy_number') as string,
        policy_type: formData.get('policy_type') as string,
        description: formData.get('description') as string,
        effective_date: new Date(formData.get('effective_date') as string),
        policy_url: policyUrl
      })

      toast.success('Policy updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating policy:', error)
      toast.error('Failed to update policy')
    }
  }

  const columns: ColumnDef<Policy>[] = [
    {
      accessorKey: 'policy_number',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Policy Number
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Name
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'policy_type',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Type
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'effective_date',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Effective Date
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.original.effective_date
        return date.toLocaleDateString()
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const policy = row.original

        return (
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8'
              onClick={() => handleViewClick(policy)}
            >
              <EyeIcon className='size-4' />
            </Button>

            {user?.role === 'admin' && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='sm' className='h-8'>
                      <PencilIcon className='size-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Policy</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={e => handleUpdateSubmit(e, policy)}
                      className='space-y-4'
                    >
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Policy Name</Label>
                        <Input
                          id='name'
                          name='name'
                          defaultValue={policy.name}
                          required
                        />
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='policy_number'>Policy Number</Label>
                          <Input
                            id='policy_number'
                            name='policy_number'
                            defaultValue={policy.policy_number}
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='policy_type'>Type</Label>
                          <Input
                            id='policy_type'
                            name='policy_type'
                            defaultValue={policy.policy_type}
                            required
                          />
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                          id='description'
                          name='description'
                          defaultValue={policy.description || ''}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='effective_date'>Effective Date</Label>
                        <Input
                          id='effective_date'
                          name='effective_date'
                          type='date'
                          defaultValue={
                            policy.effective_date.toISOString().split('T')[0]
                          }
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='policy_file'>
                          Replace Policy Document (Optional)
                        </Label>
                        <Input
                          id='policy_file'
                          name='policy_file'
                          type='file'
                          accept='.pdf,.doc,.docx'
                          onChange={handleFileChange}
                        />
                        <p className='text-sm text-gray-500'>
                          Accepted formats: PDF, DOC, DOCX (max 5MB)
                        </p>
                      </div>

                      <DialogFooter>
                        <Button type='submit'>Save Changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant='outline'
                  size='sm'
                  className='h-8'
                  onClick={() => handleDeleteClick(policy.id)}
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <>
      <DataTable columns={columns} data={data} />

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className='max-h-[90vh] w-[90vw] max-w-[90vw] p-0'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {viewingPolicy?.name} - {viewingPolicy?.policy_number}
            </DialogTitle>
          </DialogHeader>
          {viewPdfUrl && (
            <div className='overflow-hidden'>
              <PDFViewer url={viewPdfUrl} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              policy and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
