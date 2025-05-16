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

// Updated Habit type based on the new data structure
type Habit = {
  id: string;
  name: string;
  description: string;
  creationDate: string;
  category?: string;
  active: boolean;

  // Core scheduling properties
  recurrence: {
    type: "daily" | "weekly" | "monthly" | "yearly" | "specific_days";
    timesPerDay?: number;
    timesPerWeek?: number;
    timesPerMonth?: number;
    timesPerYear?: number;
    daysOfWeek?: string[];
    daysOfMonth?: number[];
    monthsOfYear?: number[];
    weekStart?: string;
    specificTimes?: string[];
    preferredDaysOfWeek?: string[];
  };

  // Progress tracking
  progress: {
    currentPeriod: {
      periodStart: string;
      periodEnd: string;
      completions: number;
      target: number;
      completionDates?: string[];
      completionTimes?: string[];
      subtasksCompleted?: string[];
    };
    history: Array<{
      periodStart: string;
      periodEnd: string;
      completions: number;
      target: number;
      completed: boolean;
      completionDates?: string[];
      completionTimes?: string[];
      subtasksCompleted?: string[];
      notes?: string;
    }>;
    streak: number;
  };

  // Optional properties
  color?: string;
  subtasks?: Array<{ id: string; name: string; description?: string }>;
  duration?: { target: number; unit: string };
  amount?: { target: number; unit: string };
  timeOfDay?: string;
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

// Available categories
const CATEGORIES = [
  { id: "health", label: "Health" },
  { id: "exercise", label: "Exercise" },
  { id: "personal", label: "Personal" },
  { id: "finances", label: "Finances" },
  { id: "work", label: "Work" },
  { id: "learning", label: "Learning" },
  { id: "home", label: "Home" },
  { id: "relationships", label: "Relationships" },
  { id: "other", label: "Other" },
];

// Available colors
const COLORS = [
  { id: "#3498db", label: "Blue" },
  { id: "#2ecc71", label: "Green" },
  { id: "#e74c3c", label: "Red" },
  { id: "#9b59b6", label: "Purple" },
  { id: "#f39c12", label: "Orange" },
  { id: "#1abc9c", label: "Teal" },
  { id: "#34495e", label: "Dark Gray" },
  { id: "#27ae60", label: "Emerald" },
];

interface AddHabitProps {
  onComplete?: () => void;
}

export default function AddHabit({ onComplete }: AddHabitProps) {
  const [habitName, setHabitName] = useState("");
  const [description, setDescription] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<string>("daily");
  const [timesPerPeriod, setTimesPerPeriod] = useState<number>(1);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState("anytime");
  const [category, setCategory] = useState("health");
  const [color, setColor] = useState("#3498db");
  const [isOpen, setIsOpen] = useState(false);
  const [isTrackable, setIsTrackable] = useState(false);
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [amountUnit, setAmountUnit] = useState("");
  const [hasDuration, setHasDuration] = useState(false);
  const [targetDuration, setTargetDuration] = useState<number>(0);
  const [durationUnit, setDurationUnit] = useState("minutes");

  const handleDayToggle = (day: string) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  // Helper function to get the current period dates based on recurrence type
  const getCurrentPeriodDates = () => {
    const today = new Date();

    if (recurrenceType === "daily") {
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      return {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      };
    }

    if (recurrenceType === "weekly" || recurrenceType === "specific_days") {
      // Start week on Monday by default
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday

      const startOfWeek = new Date(today);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
      };
    }

    if (recurrenceType === "monthly") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      return {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      };
    }

    if (recurrenceType === "yearly") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

      return {
        start: startOfYear.toISOString(),
        end: endOfYear.toISOString(),
      };
    }

    // Default to daily if no match
    return {
      start: today.toISOString(),
      end: today.toISOString(),
    };
  };

  const handleSubmit = () => {
    // Validate form
    if (!habitName.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    if (recurrenceType === "specific_days" && selectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    if (isTrackable && (targetAmount <= 0 || !amountUnit)) {
      toast.error("Please enter a valid target amount and unit");
      return;
    }

    if (hasDuration && targetDuration <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    // Get current period dates
    const { start, end } = getCurrentPeriodDates();

    // Build the recurrence object based on selected type
    const recurrence: any = {
      type:
        recurrenceType === "specific-days" ? "specific_days" : recurrenceType,
    };

    // Add specific properties based on recurrence type
    switch (recurrenceType) {
      case "daily":
        recurrence.timesPerDay = timesPerPeriod;
        break;
      case "weekly":
        recurrence.timesPerWeek = timesPerPeriod;
        recurrence.weekStart = "monday"; // Default
        break;
      case "monthly":
        recurrence.timesPerMonth = timesPerPeriod;
        break;
      case "yearly":
        recurrence.timesPerYear = timesPerPeriod;
        break;
      case "specific-days":
        recurrence.daysOfWeek = selectedDays;
        recurrence.type = "specific_days";
        break;
    }

    // Add time of day preference if not "anytime"
    if (timeOfDay !== "anytime") {
      // Map timeOfDay to specific time (just for example)
      const timeMap: Record<string, string> = {
        morning: "08:00",
        afternoon: "13:00",
        evening: "18:00",
        night: "21:00",
      };

      if (timeMap[timeOfDay]) {
        recurrence.specificTimes = [timeMap[timeOfDay]];
      }
    }

    // Calculate target completions for the period
    let target = timesPerPeriod;
    if (recurrenceType === "specific-days") {
      target = selectedDays.length; // Target is how many specific days are selected
    }

    // Create new habit object with our updated schema
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitName,
      description,
      creationDate: new Date().toISOString(),
      category,
      active: true,

      // Core scheduling
      recurrence,

      // Progress tracking
      progress: {
        currentPeriod: {
          periodStart: start,
          periodEnd: end,
          completions: 0,
          target,
          completionDates: [],
          completionTimes: [],
        },
        history: [],
        streak: 0,
      },

      color,
      timeOfDay,
    };

    // Add optional properties if enabled
    if (isTrackable) {
      newHabit.amount = {
        target: targetAmount,
        unit: amountUnit,
      };
    }

    if (hasDuration) {
      newHabit.duration = {
        target: targetDuration,
        unit: durationUnit,
      };
    }

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
    setRecurrenceType("daily");
    setTimesPerPeriod(1);
    setSelectedDays([]);
    setTimeOfDay("anytime");
    setCategory("health");
    setColor("#3498db");
    setIsTrackable(false);
    setTargetAmount(0);
    setAmountUnit("");
    setHasDuration(false);
    setTargetDuration(0);
    setDurationUnit("minutes");
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
            className: "w-full md:w-auto",
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
          {/* Basic Info */}
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

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="category" className="sm:text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-1 sm:col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="color" className="sm:text-right">
              Color
            </Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="col-span-1 sm:col-span-3">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  ></div>
                  <SelectValue placeholder="Select color" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {COLORS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: col.id }}
                        ></div>
                        {col.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence Type */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="recurrence-type" className="sm:text-right">
              Frequency
            </Label>
            <Select value={recurrenceType} onValueChange={setRecurrenceType}>
              <SelectTrigger className="col-span-1 sm:col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="specific-days">Specific Days</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Times Per Period (except for specific days) */}
          {recurrenceType !== "specific-days" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="times-per-period" className="sm:text-right">
                {recurrenceType === "daily"
                  ? "Times per day"
                  : recurrenceType === "weekly"
                  ? "Times per week"
                  : recurrenceType === "monthly"
                  ? "Times per month"
                  : "Times per year"}
              </Label>
              <Input
                id="times-per-period"
                type="number"
                min="1"
                max={recurrenceType === "daily" ? "10" : "31"}
                className="col-span-1 sm:col-span-3"
                value={timesPerPeriod}
                onChange={(e) =>
                  setTimesPerPeriod(parseInt(e.target.value) || 1)
                }
              />
            </div>
          )}

          {/* Specific Days Selection */}
          {recurrenceType === "specific-days" && (
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

          {/* Time of Day */}
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

          {/* Track Amount Option */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="track-amount" className="sm:text-right">
              Track Amount
            </Label>
            <div className="col-span-1 sm:col-span-3 flex items-center">
              <Checkbox
                id="track-amount"
                checked={isTrackable}
                onCheckedChange={(checked) => setIsTrackable(checked === true)}
              />
              <Label htmlFor="track-amount" className="ml-2 font-normal">
                This habit has a measurable target
              </Label>
            </div>
          </div>

          {/* Amount Tracking Fields */}
          {isTrackable && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="target-amount" className="sm:text-right">
                Target Amount
              </Label>
              <div className="col-span-1 sm:col-span-3 flex gap-2">
                <Input
                  id="target-amount"
                  type="number"
                  min="1"
                  className="flex-1"
                  value={targetAmount || ""}
                  onChange={(e) =>
                    setTargetAmount(parseInt(e.target.value) || 0)
                  }
                  placeholder="64"
                />
                <Input
                  id="amount-unit"
                  className="flex-1"
                  value={amountUnit}
                  onChange={(e) => setAmountUnit(e.target.value)}
                  placeholder="oz, pages, glasses, etc."
                />
              </div>
            </div>
          )}

          {/* Track Duration Option */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="track-duration" className="sm:text-right">
              Track Duration
            </Label>
            <div className="col-span-1 sm:col-span-3 flex items-center">
              <Checkbox
                id="track-duration"
                checked={hasDuration}
                onCheckedChange={(checked) => setHasDuration(checked === true)}
              />
              <Label htmlFor="track-duration" className="ml-2 font-normal">
                This habit takes a specific amount of time
              </Label>
            </div>
          </div>

          {/* Duration Fields */}
          {hasDuration && (
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="target-duration" className="sm:text-right">
                Target Duration
              </Label>
              <div className="col-span-1 sm:col-span-3 flex gap-2">
                <Input
                  id="target-duration"
                  type="number"
                  min="1"
                  className="flex-1"
                  value={targetDuration || ""}
                  onChange={(e) =>
                    setTargetDuration(parseInt(e.target.value) || 0)
                  }
                  placeholder="30"
                />
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
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
