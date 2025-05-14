"use client";

import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define habit type for TypeScript
type Habit = {
  id: string;
  name: string;
  description: string;
  frequency: string;
  specificDays: string[];
  timeOfDay: string;

  createdAt: string;
  streak: number;
  completedDates: string[];
};

export default function EditHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] = useState("");
  const [editTimeOfDay, setEditTimeOfDay] = useState("");
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);

  // Days of the week for the specific days option
  const DAYS_OF_WEEK = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  // Load habits from localStorage on component mount
  useEffect(() => {
    const loadHabits = () => {
      try {
        // Get habits from localStorage
        const storedHabits = localStorage.getItem("habits");
        if (storedHabits) {
          const parsedHabits = JSON.parse(storedHabits);
          setHabits(parsedHabits);
        }
      } catch (error) {
        console.error("Error loading habits:", error);
        toast.error("Failed to load habits");
      } finally {
        setIsLoading(false);
      }
    };

    // Use setTimeout to avoid hydration issues
    const timer = setTimeout(() => {
      loadHabits();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Function to prepare habit for editing
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditName(habit.name);
    setEditDescription(habit.description || "");
    setEditFrequency(habit.frequency);
    setEditTimeOfDay(habit.timeOfDay);
    setEditSelectedDays(habit.specificDays || []);
    setIsEditDialogOpen(true);
  };

  // Function to save edited habit
  const saveEditedHabit = () => {
    if (!editingHabit) return;

    // Validate form
    if (!editName.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    if (editFrequency === "specific-days" && editSelectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    // Create updated habit object
    const updatedHabit: Habit = {
      ...editingHabit,
      name: editName,
      description: editDescription,
      frequency: editFrequency,
      specificDays: editFrequency === "specific-days" ? editSelectedDays : [],
      timeOfDay: editTimeOfDay,
    };

    // Update habits array
    const updatedHabits = habits.map((habit) =>
      habit.id === updatedHabit.id ? updatedHabit : habit
    );

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabits(updatedHabits);

    // Show success message
    toast.success("Habit updated successfully");

    // Close dialog and reset
    setIsEditDialogOpen(false);
    setEditingHabit(null);
  };

  // Function to confirm delete
  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit);
    setIsDeleteDialogOpen(true);
  };

  // Function to perform deletion
  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;

    // Filter out the habit to delete
    const filteredHabits = habits.filter(
      (habit) => habit.id !== habitToDelete.id
    );

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(filteredHabits));
    setHabits(filteredHabits);

    // Show success message
    toast.success(`Deleted "${habitToDelete.name}"`);

    // Close dialog and reset
    setIsDeleteDialogOpen(false);
    setHabitToDelete(null);
  };

  // Function to handle day toggle in edit mode
  const handleEditDayToggle = (day: string) => {
    setEditSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  // Function to get frequency display text
  const getFrequencyText = (habit: Habit) => {
    switch (habit.frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "specific-days":
        return habit.specificDays.length > 0
          ? `${habit.specificDays
              .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
              .join(", ")}`
          : "Specific days";
      default:
        return habit.frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Loading habits...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Your Habits</h1>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No habits found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't created any habits yet. Start by adding your first
            habit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <Card key={habit.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{habit.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getFrequencyText(habit)}
                      {habit.timeOfDay !== "anytime" &&
                        ` • ${
                          habit.timeOfDay.charAt(0).toUpperCase() +
                          habit.timeOfDay.slice(1)
                        }`}
                    </CardDescription>
                  </div>
                  <div className="text-xl font-bold">
                    {habit.streak}
                    <span className="text-xs font-normal ml-1">streak</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground min-h-12">
                  {habit.description || "No description"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => handleEditHabit(habit)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => handleDeleteHabit(habit)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-habit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-habit-name"
                placeholder="Drink water"
                className="col-span-3"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Why this habit is important to you..."
                className="col-span-3 min-h-24"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-frequency" className="text-right">
                Frequency
              </Label>
              <Select value={editFrequency} onValueChange={setEditFrequency}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="specific-days">Specific Days</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {editFrequency === "specific-days" && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Days</Label>
                <div className="col-span-3 grid grid-cols-1 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${day.id}`}
                        checked={editSelectedDays.includes(day.id)}
                        onCheckedChange={() => handleEditDayToggle(day.id)}
                      />
                      <Label htmlFor={`edit-${day.id}`} className="font-normal">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Time of Day</Label>
              <RadioGroup
                className="col-span-3 flex flex-col space-y-1"
                value={editTimeOfDay}
                onValueChange={setEditTimeOfDay}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anytime" id="edit-anytime" />
                  <Label htmlFor="edit-anytime" className="font-normal">
                    Anytime
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="edit-morning" />
                  <Label htmlFor="edit-morning" className="font-normal">
                    Morning
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="edit-afternoon" />
                  <Label htmlFor="edit-afternoon" className="font-normal">
                    Afternoon
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="edit-evening" />
                  <Label htmlFor="edit-evening" className="font-normal">
                    Evening
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="night" id="edit-night" />
                  <Label htmlFor="edit-night" className="font-normal">
                    Night
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="sm:justify-between flex flex-row">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={saveEditedHabit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the habit
              {habitToDelete && (
                <span className="font-medium"> "{habitToDelete.name}"</span>
              )}{" "}
              and all of its tracking data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHabit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
