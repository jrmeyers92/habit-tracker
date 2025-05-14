"use client";

import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
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

export default function TodayHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [today, setToday] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>("anytime");

  // Update current time period based on hour of day
  useEffect(() => {
    const hour = new Date().getHours();
    let timePeriod = "anytime";

    if (hour >= 5 && hour < 12) {
      timePeriod = "morning";
    } else if (hour >= 12 && hour < 17) {
      timePeriod = "afternoon";
    } else if (hour >= 17 && hour < 21) {
      timePeriod = "evening";
    } else {
      timePeriod = "night";
    }

    setCurrentTime(timePeriod);
  }, []);

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

  // Filter habits for today whenever habits change
  useEffect(() => {
    if (habits.length === 0) {
      setTodayHabits([]);
      return;
    }

    // Get current date info
    const currentDate = new Date();
    const todayStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayOfWeek = currentDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayOfMonth = currentDate.getDate();

    // Filter habits that should appear today
    const relevantHabits = habits.filter((habit) => {
      // Check if already completed today
      const completedToday = habit.completedDates.includes(todayStr);
      if (completedToday) return false;

      // Check frequency type
      switch (habit.frequency) {
        case "daily":
          return true;
        case "weekly":
          // For weekly habits, check if it's been completed this week
          const lastCompletedDate =
            habit.completedDates.length > 0
              ? new Date(habit.completedDates[habit.completedDates.length - 1])
              : null;

          if (!lastCompletedDate) return true;

          // Calculate the start of the current week (Sunday)
          const startOfWeek = new Date(currentDate);
          startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          return lastCompletedDate < startOfWeek;

        case "monthly":
          // For monthly habits, check if it's been completed this month
          const lastCompletedMonth =
            habit.completedDates.length > 0
              ? new Date(
                  habit.completedDates[habit.completedDates.length - 1]
                ).getMonth()
              : -1;

          return lastCompletedMonth !== currentDate.getMonth();

        case "specific-days":
          // For specific days, check if today is one of the selected days
          return habit.specificDays.includes(dayOfWeek);

        default:
          return false;
      }
    });

    // Sort habits by time of day
    const timePriority = {
      anytime: 0,
      morning: 1,
      afternoon: 2,
      evening: 3,
      night: 4,
    };

    const sortedHabits = [...relevantHabits].sort((a, b) => {
      // First sort by matching current time period
      if (a.timeOfDay === currentTime && b.timeOfDay !== currentTime) return -1;
      if (a.timeOfDay !== currentTime && b.timeOfDay === currentTime) return 1;

      // Then sort by time of day priority
      return (
        timePriority[a.timeOfDay as keyof typeof timePriority] -
        timePriority[b.timeOfDay as keyof typeof timePriority]
      );
    });

    setTodayHabits(sortedHabits);
  }, [habits, currentTime]);

  // Mark habit as completed
  const completeHabit = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Update the habit
    const updatedHabit = {
      ...habit,
      completedDates: [...habit.completedDates, today],
      streak: habit.streak + 1,
    };

    // Update habits array
    const updatedHabits = habits.map((h) =>
      h.id === habit.id ? updatedHabit : h
    );

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabits(updatedHabits);

    // Show success message
    toast.success(`Completed "${habit.name}"`, {
      description: `Current streak: ${updatedHabit.streak} days`,
    });
  };

  // Get time period badge color
  const getTimeBadgeColor = (timeOfDay: string) => {
    if (timeOfDay === currentTime) {
      return "bg-primary text-primary-foreground";
    }

    switch (timeOfDay) {
      case "morning":
        return "bg-yellow-200 text-yellow-800";
      case "afternoon":
        return "bg-orange-200 text-orange-800";
      case "evening":
        return "bg-blue-200 text-blue-800";
      case "night":
        return "bg-indigo-200 text-indigo-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get frequency display text
  const getFrequencyText = (habit: Habit) => {
    switch (habit.frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "specific-days":
        if (habit.specificDays.length === 0) return "Specific days";
        if (habit.specificDays.length === 1) {
          return (
            habit.specificDays[0].charAt(0).toUpperCase() +
            habit.specificDays[0].slice(1)
          );
        }
        return `${habit.specificDays.length} days/week`;
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

  const getCurrentTimeOfDay = () => {
    const timeMap: Record<string, string> = {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      anytime: "Today",
    };

    return timeMap[currentTime] || "Today";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getCurrentTimeOfDay()} Habits</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {todayHabits.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No habits for today</h2>
          <p className="text-muted-foreground mb-4">
            {habits.length === 0
              ? "You haven't created any habits yet. Start by adding your first habit."
              : "You've completed all your habits for today. Great job!"}
          </p>
          {habits.length === 0 && (
            <Button asChild>
              <Link href="/manage-habits">Add your first habit</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayHabits.map((habit) => (
            <Card
              key={habit.id}
              className={`overflow-hidden ${
                habit.timeOfDay === currentTime ? "border-primary" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {habit.name}
                    </CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="outline">{getFrequencyText(habit)}</Badge>
                      {habit.timeOfDay !== "anytime" && (
                        <Badge className={getTimeBadgeColor(habit.timeOfDay)}>
                          {habit.timeOfDay.charAt(0).toUpperCase() +
                            habit.timeOfDay.slice(1)}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-xl font-bold">
                    {habit.streak}
                    <span className="text-xs font-normal ml-1">streak</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {habit.description && (
                  <p className="text-sm text-muted-foreground">
                    {habit.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => completeHabit(habit)}
                >
                  <Circle className="h-4 w-4" />
                  Mark as completed
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
