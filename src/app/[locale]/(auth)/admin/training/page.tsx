import type { Training } from "@/types/training";
import { getAllTraining } from "@/actions/training";
import { TrainingManagementTable } from "@/components/admin/training/TrainingManagementTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrainingForm } from "@/components/admin/training/TrainingForm";
import { Plus } from "lucide-react";

export default async function TrainingManagementPage() {
  const rawTraining = await getAllTraining();

  const trainings: Training[] = rawTraining.map((training) => ({
    ...training,
    created_at: new Date(training.created_at),
    training_date: new Date(training.training_date),
    training_end_time: new Date(training.training_end_time),
    training_start_time: new Date(training.training_start_time),
    updated_at: new Date(training.updated_at),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Training Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create and manage training sessions for reserve
            officers.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Training</DialogTitle>
            </DialogHeader>
            <TrainingForm />
          </DialogContent>
        </Dialog>
      </div>

      <TrainingManagementTable data={trainings} />
    </div>
  );
}
