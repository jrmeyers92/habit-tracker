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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function TodayHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabits, setActiveHabits] = useState<{
    daily: Habit[];
    weekly: Habit[];
    monthly: Habit[];
    yearly: Habit[];
  }>({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [today, setToday] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>("anytime");
  const [activeTab, setActiveTab] = useState<string>("daily");

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

  // Filter and categorize habits whenever habits change
  useEffect(() => {
    if (habits.length === 0) {
      setActiveHabits({
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
      });
      return;
    }

    // Get current date info
    const currentDate = new Date();
    const todayStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayOfWeek = currentDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const dayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Helper function to check if habit is due today
    const isHabitDueToday = (habit: Habit): boolean => {
      // Skip inactive habits
      if (!habit.active) return false;

      // For specific_days recurrence, check if today is one of the selected days
      if (
        habit.recurrence.type === "specific_days" &&
        habit.recurrence.daysOfWeek
      ) {
        return habit.recurrence.daysOfWeek.includes(dayOfWeek);
      }

      // For daily habits, they're always due
      if (habit.recurrence.type === "daily") {
        return true;
      }

      // For other types, check if target is already met for the current period
      return (
        habit.progress.currentPeriod.completions <
        habit.progress.currentPeriod.target
      );
    };

    // Filter and organize habits by frequency
    const dailyHabits: Habit[] = [];
    const weeklyHabits: Habit[] = [];
    const monthlyHabits: Habit[] = [];
    const yearlyHabits: Habit[] = [];

    habits.forEach((habit) => {
      // Only include active habits
      if (!habit.active) return;

      // Specific days that match today go into daily
      if (
        habit.recurrence.type === "specific_days" &&
        habit.recurrence.daysOfWeek?.includes(dayOfWeek)
      ) {
        dailyHabits.push(habit);
        return;
      }

      // Otherwise sort by recurrence type if the target hasn't been met for the current period
      if (
        habit.progress.currentPeriod.completions <
        habit.progress.currentPeriod.target
      ) {
        switch (habit.recurrence.type) {
          case "daily":
            dailyHabits.push(habit);
            break;
          case "weekly":
            weeklyHabits.push(habit);
            break;
          case "monthly":
            monthlyHabits.push(habit);
            break;
          case "yearly":
            yearlyHabits.push(habit);
            break;
        }
      }
    });

    // Sort habits by time of day if available
    const sortByTimeOfDay = (habitList: Habit[]): Habit[] => {
      const timePriority = {
        anytime: 0,
        morning: 1,
        afternoon: 2,
        evening: 3,
        night: 4,
      };

      return [...habitList].sort((a, b) => {
        // First sort by matching current time period
        const aTime = a.timeOfDay || "anytime";
        const bTime = b.timeOfDay || "anytime";

        if (aTime === currentTime && bTime !== currentTime) return -1;
        if (aTime !== currentTime && bTime === currentTime) return 1;

        // Then sort by time of day priority
        return (
          timePriority[aTime as keyof typeof timePriority] -
          timePriority[bTime as keyof typeof timePriority]
        );
      });
    };

    setActiveHabits({
      daily: sortByTimeOfDay(dailyHabits),
      weekly: sortByTimeOfDay(weeklyHabits),
      monthly: sortByTimeOfDay(monthlyHabits),
      yearly: sortByTimeOfDay(yearlyHabits),
    });
  }, [habits, currentTime]);

  // Mark habit as completed
  const completeHabit = (habit: Habit) => {
    const today = new Date().toISOString();

    // Create updated habit with new completion
    const updatedHabit = {
      ...habit,
      progress: {
        ...habit.progress,
        currentPeriod: {
          ...habit.progress.currentPeriod,
          completions: habit.progress.currentPeriod.completions + 1,
          completionDates: [
            ...(habit.progress.currentPeriod.completionDates || []),
            today,
          ],
          completionTimes: [
            ...(habit.progress.currentPeriod.completionTimes || []),
            today,
          ],
        },
        streak: habit.progress.streak + 1,
      },
    };

    // Update habits array
    const updatedHabits = habits.map((h) =>
      h.id === habit.id ? updatedHabit : h
    );

    // Save to localStorage
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
    setHabits(updatedHabits);

    // Show success message
    const remaining =
      updatedHabit.progress.currentPeriod.target -
      updatedHabit.progress.currentPeriod.completions;
    const message =
      remaining <= 0
        ? "All done for this period!"
        : `${remaining} more to go for this period`;

    toast.success(`Completed "${habit.name}"`, {
      description: `Streak: ${updatedHabit.progress.streak} | ${message}`,
    });
  };

  // Get time period badge color
  const getTimeBadgeColor = (timeOfDay: string = "anytime") => {
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

  // Get habit recurrence display text
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

  // Count total habits across all categories
  const totalActiveHabits =
    activeHabits.daily.length +
    activeHabits.weekly.length +
    activeHabits.monthly.length +
    activeHabits.yearly.length;

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

      {totalActiveHabits === 0 ? (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="daily" className="relative">
              Daily
              {activeHabits.daily.length > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {activeHabits.daily.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="relative">
              Weekly
              {activeHabits.weekly.length > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {activeHabits.weekly.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="relative">
              Monthly
              {activeHabits.monthly.length > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {activeHabits.monthly.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="yearly" className="relative">
              Yearly
              {activeHabits.yearly.length > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {activeHabits.yearly.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Daily Habits */}
          <TabsContent value="daily">
            {activeHabits.daily.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  No daily habits for today
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHabits.daily.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    currentTime={currentTime}
                    getTimeBadgeColor={getTimeBadgeColor}
                    getRecurrenceText={getRecurrenceText}
                    getProgressText={getProgressText}
                    getProgressPercentage={getProgressPercentage}
                    completeHabit={completeHabit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Weekly Habits */}
          <TabsContent value="weekly">
            {activeHabits.weekly.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No weekly habits due</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHabits.weekly.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    currentTime={currentTime}
                    getTimeBadgeColor={getTimeBadgeColor}
                    getRecurrenceText={getRecurrenceText}
                    getProgressText={getProgressText}
                    getProgressPercentage={getProgressPercentage}
                    completeHabit={completeHabit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Monthly Habits */}
          <TabsContent value="monthly">
            {activeHabits.monthly.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No monthly habits due</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHabits.monthly.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    currentTime={currentTime}
                    getTimeBadgeColor={getTimeBadgeColor}
                    getRecurrenceText={getRecurrenceText}
                    getProgressText={getProgressText}
                    getProgressPercentage={getProgressPercentage}
                    completeHabit={completeHabit}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Yearly Habits */}
          <TabsContent value="yearly">
            {activeHabits.yearly.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">No yearly habits due</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeHabits.yearly.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    currentTime={currentTime}
                    getTimeBadgeColor={getTimeBadgeColor}
                    getRecurrenceText={getRecurrenceText}
                    getProgressText={getProgressText}
                    getProgressPercentage={getProgressPercentage}
                    completeHabit={completeHabit}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Extract the HabitCard component for cleaner code
interface HabitCardProps {
  habit: Habit;
  currentTime: string;
  getTimeBadgeColor: (timeOfDay?: string) => string;
  getRecurrenceText: (habit: Habit) => string;
  getProgressText: (habit: Habit) => string;
  getProgressPercentage: (habit: Habit) => number;
  completeHabit: (habit: Habit) => void;
}

function HabitCard({
  habit,
  currentTime,
  getTimeBadgeColor,
  getRecurrenceText,
  getProgressText,
  getProgressPercentage,
  completeHabit,
}: HabitCardProps) {
  return (
    <Card
      className={`overflow-hidden ${
        habit.timeOfDay === currentTime ? "border-primary" : ""
      }`}
      style={{
        borderLeftColor: habit.color || "",
        borderLeftWidth: habit.color ? "4px" : "",
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">{habit.name}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap gap-2">
              <Badge variant="outline">{getRecurrenceText(habit)}</Badge>
              {habit.category && (
                <Badge variant="secondary">{habit.category}</Badge>
              )}
              {habit.timeOfDay && habit.timeOfDay !== "anytime" && (
                <Badge className={getTimeBadgeColor(habit.timeOfDay)}>
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
        {habit.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {habit.description}
          </p>
        )}

        {/* Progress display */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{getProgressText(habit)}</span>
          </div>
          <Progress value={getProgressPercentage(habit)} className="h-2" />
        </div>

        {/* Amount display if applicable */}
        {habit.amount && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground mr-1">Target:</span>
            <span className="font-medium">
              {habit.amount.target} {habit.amount.unit}
            </span>
          </div>
        )}

        {/* Duration display if applicable */}
        {habit.duration && (
          <div className="mt-1 text-sm">
            <span className="text-muted-foreground mr-1">Duration:</span>
            <span className="font-medium">
              {habit.duration.target} {habit.duration.unit}
            </span>
          </div>
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
  );
}
