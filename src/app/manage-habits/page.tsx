"use client";

import { BarChart3, Calendar, Clock, Edit, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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

// Updated Habit type based on the comprehensive data structure
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

export default function EditHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editRecurrenceType, setEditRecurrenceType] = useState("");
  const [editTimesPerPeriod, setEditTimesPerPeriod] = useState<number>(1);
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editTimeOfDay, setEditTimeOfDay] = useState("anytime");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsTrackable, setEditIsTrackable] = useState(false);
  const [editTargetAmount, setEditTargetAmount] = useState<number>(0);
  const [editAmountUnit, setEditAmountUnit] = useState("");
  const [editHasDuration, setEditHasDuration] = useState(false);
  const [editTargetDuration, setEditTargetDuration] = useState<number>(0);
  const [editDurationUnit, setEditDurationUnit] = useState("minutes");

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

  // Filter habits based on active tab
  useEffect(() => {
    if (habits.length === 0) {
      setFilteredHabits([]);
      return;
    }

    if (activeTab === "all") {
      setFilteredHabits(
        [...habits].sort((a, b) => a.name.localeCompare(b.name))
      );
      return;
    }

    if (activeTab === "inactive") {
      setFilteredHabits(
        habits
          .filter((habit) => !habit.active)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return;
    }

    // Filter by recurrence type
    setFilteredHabits(
      habits
        .filter((habit) => habit.active && habit.recurrence.type === activeTab)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [habits, activeTab]);

  // Helper function to get the current period dates based on recurrence type
  const getCurrentPeriodDates = (recurrenceType: string) => {
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

  // Function to prepare habit for editing
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);

    // Set basic fields
    setEditName(habit.name);
    setEditDescription(habit.description || "");
    setEditCategory(habit.category || "health");
    setEditColor(habit.color || "#3498db");
    setEditRecurrenceType(habit.recurrence.type);
    setEditIsActive(habit.active);
    setEditTimeOfDay(habit.timeOfDay || "anytime");

    // Set recurrence details based on type
    switch (habit.recurrence.type) {
      case "daily":
        setEditTimesPerPeriod(habit.recurrence.timesPerDay || 1);
        break;
      case "weekly":
        setEditTimesPerPeriod(habit.recurrence.timesPerWeek || 1);
        break;
      case "monthly":
        setEditTimesPerPeriod(habit.recurrence.timesPerMonth || 1);
        break;
      case "yearly":
        setEditTimesPerPeriod(habit.recurrence.timesPerYear || 1);
        break;
      case "specific_days":
        setEditSelectedDays(habit.recurrence.daysOfWeek || []);
        break;
    }

    // Set tracking options
    setEditIsTrackable(!!habit.amount);
    if (habit.amount) {
      setEditTargetAmount(habit.amount.target);
      setEditAmountUnit(habit.amount.unit);
    } else {
      setEditTargetAmount(0);
      setEditAmountUnit("");
    }

    setEditHasDuration(!!habit.duration);
    if (habit.duration) {
      setEditTargetDuration(habit.duration.target);
      setEditDurationUnit(habit.duration.unit);
    } else {
      setEditTargetDuration(0);
      setEditDurationUnit("minutes");
    }

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

    if (
      editRecurrenceType === "specific_days" &&
      editSelectedDays.length === 0
    ) {
      toast.error("Please select at least one day of the week");
      return;
    }

    if (editIsTrackable && (editTargetAmount <= 0 || !editAmountUnit)) {
      toast.error("Please enter a valid target amount and unit");
      return;
    }

    if (editHasDuration && editTargetDuration <= 0) {
      toast.error("Please enter a valid duration");
      return;
    }

    // Get current period dates if the recurrence type has changed
    let currentPeriod = editingHabit.progress.currentPeriod;

    if (editingHabit.recurrence.type !== editRecurrenceType) {
      const { start, end } = getCurrentPeriodDates(editRecurrenceType);
      currentPeriod = {
        ...currentPeriod,
        periodStart: start,
        periodEnd: end,
        completions: 0,
        // Target will be updated below
      };
    }

    // Build the recurrence object based on selected type
    const recurrence: any = {
      type:
        editRecurrenceType === "specific-days"
          ? "specific_days"
          : editRecurrenceType,
    };

    // Add specific properties based on recurrence type
    switch (editRecurrenceType) {
      case "daily":
        recurrence.timesPerDay = editTimesPerPeriod;
        break;
      case "weekly":
        recurrence.timesPerWeek = editTimesPerPeriod;
        recurrence.weekStart = "monday"; // Default
        break;
      case "monthly":
        recurrence.timesPerMonth = editTimesPerPeriod;
        break;
      case "yearly":
        recurrence.timesPerYear = editTimesPerPeriod;
        break;
      case "specific-days":
        recurrence.daysOfWeek = editSelectedDays;
        recurrence.type = "specific_days";
        break;
    }

    // Calculate target completions for the period
    let target = editTimesPerPeriod;
    if (editRecurrenceType === "specific-days") {
      target = editSelectedDays.length; // Target is how many specific days are selected
    }

    // Update the target in the current period
    currentPeriod.target = target;

    // Create updated habit object
    const updatedHabit: Habit = {
      ...editingHabit,
      name: editName,
      description: editDescription,
      category: editCategory,
      active: editIsActive,
      color: editColor,
      recurrence,
      progress: {
        ...editingHabit.progress,
        currentPeriod,
      },
      timeOfDay: editTimeOfDay,
    };

    // Add optional properties if enabled
    if (editIsTrackable) {
      updatedHabit.amount = {
        target: editTargetAmount,
        unit: editAmountUnit,
      };
    } else {
      delete updatedHabit.amount;
    }

    if (editHasDuration) {
      updatedHabit.duration = {
        target: editTargetDuration,
        unit: editDurationUnit,
      };
    } else {
      delete updatedHabit.duration;
    }

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

  // Function to toggle habit active state
  const toggleHabitActive = (habit: Habit) => {
    const updatedHabit = {
      ...habit,
      active: !habit.active,
    };

    // Update habits array
    const updatedHabits = habits.map((h) =>
      h.id === habit.id ? updatedHabit : h
    );

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabits(updatedHabits);

    // Show success message
    toast.success(
      `${updatedHabit.active ? "Activated" : "Paused"} "${habit.name}"`
    );
  };

  // Get recurrence text
  const getRecurrenceText = (habit: Habit) => {
    const {
      type,
      timesPerDay,
      timesPerWeek,
      timesPerMonth,
      timesPerYear,
      daysOfWeek,
    } = habit.recurrence;

    switch (type) {
      case "daily":
        return timesPerDay && timesPerDay > 1
          ? `${timesPerDay}x daily`
          : "Daily";
      case "weekly":
        return timesPerWeek && timesPerWeek > 1
          ? `${timesPerWeek}x weekly`
          : "Weekly";
      case "monthly":
        return timesPerMonth && timesPerMonth > 1
          ? `${timesPerMonth}x monthly`
          : "Monthly";
      case "yearly":
        return timesPerYear && timesPerYear > 1
          ? `${timesPerYear}x yearly`
          : "Yearly";
      case "specific_days":
        if (!daysOfWeek || daysOfWeek.length === 0) return "Specific days";
        if (daysOfWeek.length === 1) {
          return daysOfWeek[0].charAt(0).toUpperCase() + daysOfWeek[0].slice(1);
        }
        if (daysOfWeek.length <= 3) {
          return daysOfWeek.map((day) => day.slice(0, 3)).join(", ");
        }
        return `${daysOfWeek.length} days/week`;
    }
  };

  // Get progress text
  const getProgressText = (habit: Habit) => {
    const { completions, target } = habit.progress.currentPeriod;

    if (completions >= target) {
      return "Complete!";
    }

    const remaining = target - completions;
    return `${completions}/${target} · ${remaining} to go`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (habit: Habit) => {
    const { completions, target } = habit.progress.currentPeriod;
    if (target === 0) return 0;
    return Math.min(Math.round((completions / target) * 100), 100);
  };

  // Count habits by type for the tab badges
  const habitCounts = {
    all: habits.length,
    daily: habits.filter((h) => h.active && h.recurrence.type === "daily")
      .length,
    weekly: habits.filter((h) => h.active && h.recurrence.type === "weekly")
      .length,
    monthly: habits.filter((h) => h.active && h.recurrence.type === "monthly")
      .length,
    yearly: habits.filter((h) => h.active && h.recurrence.type === "yearly")
      .length,
    specific_days: habits.filter(
      (h) => h.active && h.recurrence.type === "specific_days"
    ).length,
    inactive: habits.filter((h) => !h.active).length,
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
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No habits found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't created any habits yet. Start by adding your first
            habit.
          </p>
        </div>
      ) : (
        <>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mb-6"
          >
            <TabsList className="grid grid-cols-7">
              <TabsTrigger value="all" className="relative">
                All
                {habitCounts.all > 0 && (
                  <Badge className="ml-1">{habitCounts.all}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="daily" className="relative">
                Daily
                {habitCounts.daily > 0 && (
                  <Badge className="ml-1">{habitCounts.daily}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="weekly" className="relative">
                Weekly
                {habitCounts.weekly > 0 && (
                  <Badge className="ml-1">{habitCounts.weekly}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="monthly" className="relative">
                Monthly
                {habitCounts.monthly > 0 && (
                  <Badge className="ml-1">{habitCounts.monthly}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                Yearly
                {habitCounts.yearly > 0 && (
                  <Badge className="ml-1">{habitCounts.yearly}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="specific_days" className="relative">
                Specific
                {habitCounts.specific_days > 0 && (
                  <Badge className="ml-1">{habitCounts.specific_days}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="inactive" className="relative">
                Inactive
                {habitCounts.inactive > 0 && (
                  <Badge className="ml-1">{habitCounts.inactive}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHabits.map((habit) => (
              <Card
                key={habit.id}
                className={`overflow-hidden ${
                  !habit.active ? "opacity-70" : ""
                }`}
                style={{
                  borderLeftColor: habit.color || "",
                  borderLeftWidth: habit.color ? "4px" : "",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-1">
                        {habit.name}
                        {!habit.active && (
                          <Badge variant="outline" className="ml-2">
                            Paused
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {getRecurrenceText(habit)}
                        </Badge>
                        {habit.category && (
                          <Badge variant="secondary">{habit.category}</Badge>
                        )}
                        {habit.timeOfDay && habit.timeOfDay !== "anytime" && (
                          <Badge variant="outline">
                            {habit.timeOfDay.charAt(0).toUpperCase() +
                              habit.timeOfDay.slice(1)}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-xl font-bold">
                      {habit.progress.streak}
                      <span className="text-xs font-normal ml-1">streak</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {habit.description || "No description"}
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-2 mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {getProgressText(habit)}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(habit)}
                      className="h-2"
                    />
                  </div>

                  {/* Additional Metadata */}
                  <div className="grid grid-cols-2 gap-1 mt-3">
                    {habit.amount && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {habit.amount.target} {habit.amount.unit}
                        </span>
                      </div>
                    )}
                    {habit.duration && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {habit.duration.target} {habit.duration.unit}
                        </span>
                      </div>
                    )}
                    {habit.recurrence.type === "specific_days" &&
                      habit.recurrence.daysOfWeek && (
                        <div className="flex items-center text-sm text-muted-foreground col-span-2">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {habit.recurrence.daysOfWeek
                              .map((day) => day.slice(0, 3))
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5 mr-1" />
                      <span>
                        Started{" "}
                        {new Date(habit.creationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      habit.active ? "text-yellow-600" : "text-emerald-600"
                    }
                    onClick={() => toggleHabitActive(habit)}
                  >
                    {habit.active ? "Pause" : "Activate"}
                  </Button>

                  <div className="flex gap-2">
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
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
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

            {/* Category and Color */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="col-span-3">
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                Color
              </Label>
              <Select value={editColor} onValueChange={setEditColor}>
                <SelectTrigger className="col-span-3">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: editColor }}
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

            {/* Active State */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Status
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="edit-active"
                  checked={editIsActive}
                  onCheckedChange={(checked) =>
                    setEditIsActive(checked === true)
                  }
                />
                <Label htmlFor="edit-active" className="ml-2 font-normal">
                  Active (uncheck to pause)
                </Label>
              </div>
            </div>

            {/* Recurrence Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-recurrence-type" className="text-right">
                Frequency
              </Label>
              <Select
                value={
                  editRecurrenceType === "specific_days"
                    ? "specific-days"
                    : editRecurrenceType
                }
                onValueChange={setEditRecurrenceType}
              >
                <SelectTrigger className="col-span-3">
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
            {editRecurrenceType !== "specific-days" &&
              editRecurrenceType !== "specific_days" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-times-per-period" className="text-right">
                    {editRecurrenceType === "daily"
                      ? "Times per day"
                      : editRecurrenceType === "weekly"
                      ? "Times per week"
                      : editRecurrenceType === "monthly"
                      ? "Times per month"
                      : "Times per year"}
                  </Label>
                  <Input
                    id="edit-times-per-period"
                    type="number"
                    min="1"
                    max={editRecurrenceType === "daily" ? "10" : "31"}
                    className="col-span-3"
                    value={editTimesPerPeriod}
                    onChange={(e) =>
                      setEditTimesPerPeriod(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              )}

            {/* Specific Days Selection */}
            {(editRecurrenceType === "specific-days" ||
              editRecurrenceType === "specific_days") && (
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

            {/* Time of Day */}
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

            {/* Track Amount Option */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-track-amount" className="text-right">
                Track Amount
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="edit-track-amount"
                  checked={editIsTrackable}
                  onCheckedChange={(checked) =>
                    setEditIsTrackable(checked === true)
                  }
                />
                <Label htmlFor="edit-track-amount" className="ml-2 font-normal">
                  This habit has a measurable target
                </Label>
              </div>
            </div>

            {/* Amount Tracking Fields */}
            {editIsTrackable && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-target-amount" className="text-right">
                  Target Amount
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="edit-target-amount"
                    type="number"
                    min="1"
                    className="flex-1"
                    value={editTargetAmount || ""}
                    onChange={(e) =>
                      setEditTargetAmount(parseInt(e.target.value) || 0)
                    }
                    placeholder="64"
                  />
                  <Input
                    id="edit-amount-unit"
                    className="flex-1"
                    value={editAmountUnit}
                    onChange={(e) => setEditAmountUnit(e.target.value)}
                    placeholder="oz, pages, glasses, etc."
                  />
                </div>
              </div>
            )}

            {/* Track Duration Option */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-track-duration" className="text-right">
                Track Duration
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="edit-track-duration"
                  checked={editHasDuration}
                  onCheckedChange={(checked) =>
                    setEditHasDuration(checked === true)
                  }
                />
                <Label
                  htmlFor="edit-track-duration"
                  className="ml-2 font-normal"
                >
                  This habit takes a specific amount of time
                </Label>
              </div>
            </div>

            {/* Duration Fields */}
            {editHasDuration && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-target-duration" className="text-right">
                  Target Duration
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="edit-target-duration"
                    type="number"
                    min="1"
                    className="flex-1"
                    value={editTargetDuration || ""}
                    onChange={(e) =>
                      setEditTargetDuration(parseInt(e.target.value) || 0)
                    }
                    placeholder="30"
                  />
                  <Select
                    value={editDurationUnit}
                    onValueChange={setEditDurationUnit}
                  >
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
