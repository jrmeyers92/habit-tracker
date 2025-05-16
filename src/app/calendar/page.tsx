"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateHabits, setSelectedDateHabits] = useState<Habit[]>([]);
  const [completionsByDate, setCompletionsByDate] = useState<
    Record<string, string[]>
  >({});

  // Load habits from localStorage
  useEffect(() => {
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
      try {
        const parsedHabits = JSON.parse(storedHabits);
        setHabits(parsedHabits);

        // Build a map of completions by date for quick lookup
        const completionsMap: Record<string, string[]> = {};

        parsedHabits.forEach((habit: Habit) => {
          if (habit.progress.currentPeriod.completionDates) {
            habit.progress.currentPeriod.completionDates.forEach(
              (dateString) => {
                const formattedDate = format(
                  new Date(dateString),
                  "yyyy-MM-dd"
                );
                if (!completionsMap[formattedDate]) {
                  completionsMap[formattedDate] = [];
                }
                completionsMap[formattedDate].push(habit.id);
              }
            );
          }

          // Also include completions from history
          habit.progress.history.forEach((period) => {
            if (period.completionDates) {
              period.completionDates.forEach((dateString) => {
                const formattedDate = format(
                  new Date(dateString),
                  "yyyy-MM-dd"
                );
                if (!completionsMap[formattedDate]) {
                  completionsMap[formattedDate] = [];
                }
                completionsMap[formattedDate].push(habit.id);
              });
            }
          });
        });

        setCompletionsByDate(completionsMap);
      } catch (error) {
        console.error("Error parsing habits from localStorage:", error);
      }
    }
  }, []);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get all days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days of the week (Sunday to Saturday)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Function to determine if a habit should appear on a specific date
  const shouldHabitAppearOnDate = (habit: Habit, date: Date): boolean => {
    if (!habit.active) return false;

    const dayOfWeek = format(date, "EEEE").toLowerCase();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1; // 1-12

    switch (habit.recurrence.type) {
      case "daily":
        return true;

      case "weekly":
        // For frequency-based weekly, it can be done any day of the week
        // but we'll only show it if the target hasn't been met for the period
        // or if this date is when it was actually completed
        const dateStr = format(date, "yyyy-MM-dd");
        const wasCompletedOnDate =
          habit.progress.currentPeriod.completionDates?.some(
            (completionDate) =>
              format(new Date(completionDate), "yyyy-MM-dd") === dateStr
          );

        // Show on the day it was actually completed
        if (wasCompletedOnDate) return true;

        // Otherwise only show if still needs to be done for the period
        return (
          habit.progress.currentPeriod.completions <
          habit.progress.currentPeriod.target
        );

      case "monthly":
        // For monthly habits, check if it's specific days of month or frequency-based
        if (
          habit.recurrence.daysOfMonth &&
          habit.recurrence.daysOfMonth.includes(dayOfMonth)
        ) {
          return true;
        }
        // For frequency-based monthly, only show if target not met or this is a completion date
        return (
          habit.progress.currentPeriod.completions <
          habit.progress.currentPeriod.target
        );

      case "yearly":
        // Only show yearly habits on their specific dates
        if (habit.recurrence.monthsOfYear && habit.recurrence.daysOfMonth) {
          return (
            habit.recurrence.monthsOfYear.includes(month) &&
            habit.recurrence.daysOfMonth.includes(dayOfMonth)
          );
        }
        return false;

      case "specific_days":
        // Show habits scheduled for this specific day of the week
        return habit.recurrence.daysOfWeek?.includes(dayOfWeek) || false;

      default:
        return false;
    }
  };

  // Function to get habits for a specific date
  const getHabitsForDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    return habits.filter((habit) => {
      // Always include habits that were completed on this date
      const wasCompletedOnDate =
        habit.progress.currentPeriod.completionDates?.some(
          (completionDate) =>
            format(new Date(completionDate), "yyyy-MM-dd") === formattedDate
        );

      if (wasCompletedOnDate) return true;

      // Include habits that should appear on this date based on recurrence
      return shouldHabitAppearOnDate(habit, date);
    });
  };

  // Function to handle clicking on a day
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateHabits(getHabitsForDate(date));
  };

  // Function to check if a habit was completed on a specific date
  const wasHabitCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const formattedDate = format(date, "yyyy-MM-dd");

    // Check current period completions
    if (habit.progress.currentPeriod.completionDates) {
      const wasCompletedInCurrentPeriod =
        habit.progress.currentPeriod.completionDates.some((completionDate) => {
          const completionDateStr = format(
            new Date(completionDate),
            "yyyy-MM-dd"
          );
          return completionDateStr === formattedDate;
        });
      if (wasCompletedInCurrentPeriod) return true;
    }

    // Check history for older completions
    for (const period of habit.progress.history) {
      if (period.completionDates) {
        const wasCompletedInPeriod = period.completionDates.some(
          (completionDate) => {
            const completionDateStr = format(
              new Date(completionDate),
              "yyyy-MM-dd"
            );
            return completionDateStr === formattedDate;
          }
        );
        if (wasCompletedInPeriod) return true;
      }
    }

    return false;
  };

  // Function to toggle habit completion
  const toggleHabitCompletion = (habit: Habit, date: Date) => {
    const isCompleted = wasHabitCompletedOnDate(habit, date);
    const now = new Date().toISOString();
    const formattedDate = format(date, "yyyy-MM-dd");

    // Create a copy of the habit to update
    const updatedHabit = { ...habit };

    if (isCompleted) {
      // Remove this date from completions
      if (updatedHabit.progress.currentPeriod.completionDates) {
        updatedHabit.progress.currentPeriod.completionDates =
          updatedHabit.progress.currentPeriod.completionDates.filter(
            (completionDate) => !isSameDay(new Date(completionDate), date)
          );
      }

      if (updatedHabit.progress.currentPeriod.completionTimes) {
        updatedHabit.progress.currentPeriod.completionTimes =
          updatedHabit.progress.currentPeriod.completionTimes.filter(
            (completionTime) => !isSameDay(new Date(completionTime), date)
          );
      }

      // Decrement completions count
      updatedHabit.progress.currentPeriod.completions = Math.max(
        0,
        updatedHabit.progress.currentPeriod.completions - 1
      );

      // Adjust streak if it's today's completion being removed
      if (isToday(date) && updatedHabit.progress.streak > 0) {
        updatedHabit.progress.streak -= 1;
      }
    } else {
      // Add this date to completions
      if (!updatedHabit.progress.currentPeriod.completionDates) {
        updatedHabit.progress.currentPeriod.completionDates = [];
      }

      if (!updatedHabit.progress.currentPeriod.completionTimes) {
        updatedHabit.progress.currentPeriod.completionTimes = [];
      }

      updatedHabit.progress.currentPeriod.completionDates.push(now);
      updatedHabit.progress.currentPeriod.completionTimes.push(now);

      // Increment completions count if not already met target
      if (
        updatedHabit.progress.currentPeriod.completions <
        updatedHabit.progress.currentPeriod.target
      ) {
        updatedHabit.progress.currentPeriod.completions += 1;

        // Increase streak if it's today
        if (isToday(date)) {
          updatedHabit.progress.streak += 1;
        }
      }
    }

    // Update habits state
    const updatedHabits = habits.map((h) =>
      h.id === habit.id ? updatedHabit : h
    );
    setHabits(updatedHabits);

    // Update selected date habits
    setSelectedDateHabits(
      updatedHabits.filter(
        (h) =>
          shouldHabitAppearOnDate(h, date) || wasHabitCompletedOnDate(h, date)
      )
    );

    // Update completions map
    const newCompletionsByDate = { ...completionsByDate };
    if (isCompleted) {
      // Remove habit ID from completions for this date
      if (newCompletionsByDate[formattedDate]) {
        newCompletionsByDate[formattedDate] = newCompletionsByDate[
          formattedDate
        ].filter((id) => id !== habit.id);
        if (newCompletionsByDate[formattedDate].length === 0) {
          delete newCompletionsByDate[formattedDate];
        }
      }
    } else {
      // Add habit ID to completions for this date
      if (!newCompletionsByDate[formattedDate]) {
        newCompletionsByDate[formattedDate] = [];
      }
      if (!newCompletionsByDate[formattedDate].includes(habit.id)) {
        newCompletionsByDate[formattedDate].push(habit.id);
      }
    }
    setCompletionsByDate(newCompletionsByDate);

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(updatedHabits));

    // Show toast notification
    toast.success(
      isCompleted ? "Habit marked as incomplete" : "Habit marked as complete",
      { description: habit.name }
    );
  };

  // Calculate progress for a habit
  const getProgressPercentage = (habit: Habit) => {
    const { completions, target } = habit.progress.currentPeriod;
    if (target === 0) return 0;
    return Math.min(Math.round((completions / target) * 100), 100);
  };

  // Get a concise display of the recurrence pattern
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
          return daysOfWeek[0].slice(0, 3);
        }
        if (daysOfWeek.length <= 3) {
          return daysOfWeek.map((d) => d.slice(0, 3)).join(", ");
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">
          {/* Weekday headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-semibold text-gray-600 border-b bg-gray-50"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before the start of the month */}
          {Array(monthStart.getDay())
            .fill(null)
            .map((_, index) => (
              <div
                key={`empty-${index}`}
                className="p-2 border border-gray-100 min-h-[100px]"
              ></div>
            ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const formattedDate = format(day, "yyyy-MM-dd");
            const habitsForDay = getHabitsForDate(day);
            const hasCompletedHabits =
              completionsByDate[formattedDate]?.length > 0;
            const totalHabits = habitsForDay.length;
            const completedHabits = habitsForDay.filter((habit) =>
              wasHabitCompletedOnDate(habit, day)
            ).length;

            return (
              <div
                key={formattedDate}
                className={`p-2 border border-gray-100 min-h-[100px] ${
                  isToday(day) ? "bg-blue-50" : ""
                } hover:bg-gray-50 cursor-pointer transition-colors`}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                      isToday(day) ? "bg-blue-500 text-white" : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {totalHabits > 0 && (
                    <span
                      className={`text-xs font-medium ${
                        completedHabits === totalHabits && totalHabits > 0
                          ? "text-green-600"
                          : completedHabits > 0
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      {completedHabits}/{totalHabits}
                    </span>
                  )}
                </div>

                {/* Progress bar for day completion if there are habits */}
                {totalHabits > 0 && (
                  <div className="mt-1">
                    <Progress
                      value={
                        totalHabits > 0
                          ? (completedHabits / totalHabits) * 100
                          : 0
                      }
                      className="h-1"
                    />
                  </div>
                )}

                {/* Show first 2 habits for this day */}
                <div className="mt-2 space-y-1">
                  {habitsForDay.slice(0, 2).map((habit) => {
                    const isCompleted = wasHabitCompletedOnDate(habit, day);
                    return (
                      <div
                        key={habit.id}
                        className={`text-xs truncate px-1 py-0.5 rounded flex items-center ${
                          isCompleted
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                        style={{
                          borderLeftColor: habit.color || "",
                          borderLeftWidth: habit.color ? "2px" : "",
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />
                        ) : (
                          <Circle className="h-3 w-3 mr-1 shrink-0" />
                        )}
                        <span className="truncate">{habit.name}</span>
                      </div>
                    );
                  })}

                  {habitsForDay.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{habitsForDay.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail dialog */}
      {selectedDate && (
        <Dialog
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="mt-4 max-h-[60vh]">
              <div className="space-y-3 p-1">
                {selectedDateHabits.length > 0 ? (
                  selectedDateHabits.map((habit) => {
                    const isCompleted = wasHabitCompletedOnDate(
                      habit,
                      selectedDate
                    );
                    const progressPercent = getProgressPercentage(habit);

                    return (
                      <div
                        key={habit.id}
                        className="p-3 border rounded-lg transition-colors"
                        style={{
                          borderLeftColor: habit.color || "",
                          borderLeftWidth: habit.color ? "4px" : "",
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium flex items-center">
                              {habit.name}
                              {habit.category && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  {habit.category}
                                </Badge>
                              )}
                            </h3>
                            {habit.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {habit.description}
                              </p>
                            )}
                          </div>

                          <Button
                            variant={isCompleted ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              toggleHabitCompletion(habit, selectedDate)
                            }
                          >
                            {isCompleted ? "Completed" : "Mark Complete"}
                          </Button>
                        </div>

                        {/* Progress section */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">
                              {getProgressText(habit)}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>

                        {/* Details section */}
                        <div className="mt-3 text-xs text-gray-500 flex justify-between">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {getRecurrenceText(habit)}
                            </Badge>
                            <span>Streak: {habit.progress.streak}</span>
                          </div>

                          {/* Additional info */}
                          <div>
                            {habit.duration && (
                              <span className="mr-2">
                                {habit.duration.target} {habit.duration.unit}
                              </span>
                            )}
                            {habit.amount && (
                              <span>
                                {habit.amount.target} {habit.amount.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No habits for this day</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Habit
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
