import { AssignEquipmentForm } from '@/components/admin/equipment/assignEquipmentForm'
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
import type { DBUser } from '@/types/user'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createLogger } from '@/lib/debug'
import { toast } from 'sonner'

const logger = createLogger({
  module: 'admin',
  file: 'dialogs/assignEquipmentToUserDialog.tsx'
})

interface AssignEquipmentToUserDialogProps {
  user: DBUser
}

export function AssignEquipmentToUserDialog({
  user
}: AssignEquipmentToUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])

  const handleOpen = async () => {
    try {
      logger.info('Fetching available equipment for user', { userId: user.id })
      const equipment = await getAvailableEquipment()
      setAvailableEquipment(equipment || [])
      setOpen(true)
    } catch (error) {
      logger.error(
        'Failed to fetch available equipment',
        logger.errorWithData(error)
      )
      toast.error('Failed to load available equipment')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='size-8'
          title='Assign Equipment'
          onClick={handleOpen}
        >
          <Plus className='size-4' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Equipment</DialogTitle>
          <DialogDescription>
            Assign available equipment to {user.first_name} {user.last_name}
          </DialogDescription>
        </DialogHeader>
        <AssignEquipmentForm
          availableEquipment={availableEquipment}
          targetUserId={user.id}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
