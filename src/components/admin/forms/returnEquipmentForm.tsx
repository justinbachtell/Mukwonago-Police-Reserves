'use client';

import { returnEquipment } from '@/actions/assignedEquipment';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const returnEquipmentSchema = z.object({
  condition: z.enum(['new', 'good', 'fair', 'poor', 'damaged/broken']),
  notes: z.string().optional(),
});

type ReturnEquipmentFormValues = z.infer<typeof returnEquipmentSchema>;

type ReturnEquipmentFormProps = {
  assignmentId: number;
  currentCondition: string;
};

export function ReturnEquipmentForm({ assignmentId, currentCondition }: ReturnEquipmentFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ReturnEquipmentFormValues>({
    resolver: zodResolver(returnEquipmentSchema),
    defaultValues: {
      condition: currentCondition as ReturnEquipmentFormValues['condition'],
      notes: '',
    },
  });

  const onSubmit = async (data: ReturnEquipmentFormValues) => {
    try {
      await returnEquipment(assignmentId, data.condition, data.notes);
      toast({
        title: 'Equipment returned',
        description: 'Equipment has been returned successfully.',
      });
      setOpen(false);
      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to return equipment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Equipment</DialogTitle>
          <DialogDescription>
            Update the condition and add any notes before returning the equipment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="damaged/broken">Damaged/Broken</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any notes about the condition or return"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Return Equipment</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
