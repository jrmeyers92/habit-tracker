"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "./ui/checkbox";

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

interface AddHabitProps {
  onComplete?: () => void;
}

export default function AddHabit({ onComplete }: AddHabitProps) {
  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("anytime");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  const handleSubmit = () => {
    // Validate form
    if (!habitName.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    if (frequency === "specific-days" && selectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    // Create new habit object
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitName,
      description,
      frequency,
      specificDays: frequency === "specific-days" ? selectedDays : [],
      timeOfDay,
      createdAt: new Date().toISOString(),
      streak: 0,
      completedDates: [],
    };

    // Save to localStorage
    const existingHabits = JSON.parse(localStorage.getItem("habits") || "[]");
    localStorage.setItem(
      "habits",
      JSON.stringify([...existingHabits, newHabit])
    );

    // Show success message
    toast.success("Habit added successfully", {
      description: `You've added "${habitName}" to your habits`,
      action: {
        label: "View",
        onClick: () => console.log("View habit"),
      },
    });

    // Reset form and close dialog
    resetForm();
    setIsOpen(false);

    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }
  };

  const resetForm = () => {
    setHabitName("");
    setDescription("");
    setFrequency("daily");
    setTimeOfDay("anytime");
    setSelectedDays([]);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && onComplete) {
          onComplete();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={buttonVariants({
            variant: "outline",
            className: "w-full",
          })}
          onClick={() => setIsOpen(true)}
        >
          Add Habit
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track in your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="habit-name" className="sm:text-right">
              Name
            </Label>
            <Input
              id="habit-name"
              placeholder="Drink water"
              className="col-span-1 sm:col-span-3"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
            <Label htmlFor="description" className="sm:text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Drink 64oz of water a day"
              className="col-span-1 sm:col-span-3 min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="frequency" className="sm:text-right">
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="col-span-1 sm:col-span-3">
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

          {frequency === "specific-days" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label className="sm:text-right pt-2">Days</Label>
              <div className="col-span-1 sm:col-span-3 grid grid-cols-1 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <Label htmlFor={day.id} className="font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
            <Label className="sm:text-right pt-2">Time of Day</Label>
            <RadioGroup
              className="col-span-1 sm:col-span-3 flex flex-col space-y-1"
              defaultValue="anytime"
              value={timeOfDay}
              onValueChange={setTimeOfDay}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="anytime" id="anytime" />
                <Label htmlFor="anytime" className="font-normal">
                  Anytime
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning" className="font-normal">
                  Morning
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <Label htmlFor="afternoon" className="font-normal">
                  Afternoon
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evening" id="evening" />
                <Label htmlFor="evening" className="font-normal">
                  Evening
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="night" id="night" />
                <Label htmlFor="night" className="font-normal">
                  Night
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>
            Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
