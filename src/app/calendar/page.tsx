"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "specific-days";
  specificDays: string[];
  timeOfDay: string;
  createdAt: string;
  streak: number;
  completedDates: string[];
  description: string;
  reminderEnabled: boolean;
}

export default function page() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateHabits, setSelectedDateHabits] = useState<Habit[]>([]);

  // Load habits from localStorage
  useEffect(() => {
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
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

  // Get all days in current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days of the week (Sunday to Saturday)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Function to determine if a date has any habits
  const getHabitsForDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    return habits.filter((habit) => {
      // Check if habit was completed on this date
      if (habit.completedDates.includes(formattedDate)) {
        return true;
      }

      // Check if habit should appear on this date based on frequency
      const dayOfWeek = format(date, "EEEE").toLowerCase();

      if (habit.frequency === "daily") {
        return true;
      }

      if (habit.frequency === "weekly") {
        // Assuming weekly means the day it was created
        const createdDay = format(
          parseISO(habit.createdAt),
          "EEEE"
        ).toLowerCase();
        return dayOfWeek === createdDay;
      }

      if (habit.frequency === "specific-days") {
        return habit.specificDays.includes(dayOfWeek);
      }

      return false;
    });
  };

  // Function to handle clicking on a day
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateHabits(getHabitsForDate(date));
  };

  // Function to toggle habit completion
  const toggleHabitCompletion = (habit: Habit, date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const isCompleted = habit.completedDates.includes(formattedDate);

    const updatedHabit = { ...habit };
    if (isCompleted) {
      // Remove date from completedDates
      updatedHabit.completedDates = updatedHabit.completedDates.filter(
        (d) => d !== formattedDate
      );
      // Adjust streak if needed
      if (updatedHabit.streak > 0) {
        updatedHabit.streak -= 1;
      }
    } else {
      // Add date to completedDates if not already present
      if (!updatedHabit.completedDates.includes(formattedDate)) {
        updatedHabit.completedDates.push(formattedDate);
        updatedHabit.completedDates.sort();
        updatedHabit.streak += 1;
      }
    }

    // Update habits state and localStorage
    const updatedHabits = habits.map((h) =>
      h.id === habit.id ? updatedHabit : h
    );
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));

    // Update selected date habits
    setSelectedDateHabits(getHabitsForDate(date));
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

          {/* Calendar days */}
          {Array(
            new Date(
              monthStart.getFullYear(),
              monthStart.getMonth(),
              1
            ).getDay()
          )
            .fill(null)
            .map((_, index) => (
              <div
                key={`empty-${index}`}
                className="p-2 border border-gray-100 min-h-[100px]"
              ></div>
            ))}

          {daysInMonth.map((day) => {
            const habitsForDay = getHabitsForDate(day);
            const hasCompletedHabits = habitsForDay.some((habit) =>
              habit.completedDates.includes(format(day, "yyyy-MM-dd"))
            );

            return (
              <div
                key={format(day, "yyyy-MM-dd")}
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

                  {hasCompletedHabits && (
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  )}
                </div>

                {/* Show first 2 habits for this day */}
                <div className="mt-1 space-y-1">
                  {habitsForDay.slice(0, 2).map((habit) => {
                    const isCompleted = habit.completedDates.includes(
                      format(day, "yyyy-MM-dd")
                    );
                    return (
                      <div
                        key={habit.id}
                        className={`text-xs truncate px-1 py-0.5 rounded ${
                          isCompleted
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {habit.name}
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
          onOpenChange={() => setSelectedDate(null)}
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
                    const formattedDate = format(selectedDate, "yyyy-MM-dd");
                    const isCompleted =
                      habit.completedDates.includes(formattedDate);

                    return (
                      <div
                        key={habit.id}
                        className="p-3 border rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{habit.name}</h3>
                            {habit.description && (
                              <p className="text-sm text-gray-500">
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

                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                          <span>Streak: {habit.streak} days</span>
                          <span>
                            {habit.frequency === "daily"
                              ? "Daily"
                              : habit.frequency === "weekly"
                              ? "Weekly"
                              : habit.specificDays
                                  .map(
                                    (d) =>
                                      d.charAt(0).toUpperCase() + d.slice(1)
                                  )
                                  .join(", ")}
                          </span>
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
