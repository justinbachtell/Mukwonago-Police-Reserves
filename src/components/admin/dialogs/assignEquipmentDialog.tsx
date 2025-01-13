import { AssignEquipmentForm } from '@/components/admin/forms/assignEquipmentForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { getAvailableEquipment } from '@/actions/equipment'
import type { Equipment } from '@/types/equipment'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createLogger } from '@/lib/debug'
import { toast } from 'sonner'

const logger = createLogger({
  module: 'admin',
  file: 'dialogs/assignEquipmentDialog.tsx'
})

interface AssignEquipmentDialogProps {
  targetUserId?: string
}

export function AssignEquipmentDialog({
  targetUserId
}: AssignEquipmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])

  const handleOpen = async () => {
    try {
      const equipment = await getAvailableEquipment()
      setAvailableEquipment(equipment || [])
      setOpen(true)
    } catch (error) {
      logger.error(
        'Failed to fetch available equipment:',
        logger.errorWithData(error),
        'AssignEquipmentDialog'
      )
      toast.error('Failed to load available equipment')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        <Button
          variant='outline'
          size='icon'
          className='size-8'
          title='Assign Equipment'
        >
          <Plus className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Equipment</DialogTitle>
          <DialogDescription>
            {targetUserId
              ? 'Assign available equipment to this user'
              : 'Assign available equipment to a user'}
          </DialogDescription>
        </DialogHeader>
        <AssignEquipmentForm
          availableEquipment={availableEquipment}
          targetUserId={targetUserId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
