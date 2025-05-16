const habits = [
  // DAILY HABITS
  {
    id: 1,
    name: "Drink 64 oz of water",
    description: "Stay hydrated throughout the day",
    creationDate: "5/10/2025",

    // Core scheduling properties
    recurrence: {
      type: "daily",
      timesPerDay: 1,
      specificTimes: ["09:00"], // Optional specific times for reminders
    },

    // Progress tracking
    progress: {
      currentPeriod: {
        periodStart: "5/16/2025", // Current day
        completions: 0, // Not completed today yet
        target: 1, // Only need to do this once per day
      },
      history: [
        {
          periodStart: "5/15/2025",
          periodEnd: "5/15/2025",
          completions: 1,
          target: 1,
          completed: true,
          notes: "Finished water bottle",
        },
        {
          periodStart: "5/14/2025",
          periodEnd: "5/14/2025",
          completions: 1,
          target: 1,
          completed: true,
        },
        // More history entries...
      ],
      streak: 5, // Days in a row
    },

    // Optional metadata
    category: "health",
    active: true,
    color: "#2ecc71",
    amount: {
      target: 64,
      unit: "oz",
    },
  },

  // A multiple-times-per-day habit
  {
    id: 2,
    name: "Take medication",
    description: "Blood pressure medication",
    creationDate: "3/15/2025",

    recurrence: {
      type: "daily",
      timesPerDay: 2,
      specificTimes: ["08:00", "20:00"], // Morning and evening
    },

    progress: {
      currentPeriod: {
        periodStart: "5/16/2025",
        completions: 1, // Taken morning pill but not evening pill
        target: 2,
        completionTimes: ["08:15"], // When the morning pill was taken
      },
      history: [
        {
          periodStart: "5/15/2025",
          periodEnd: "5/15/2025",
          completions: 2,
          target: 2,
          completed: true,
          completionTimes: ["08:10", "20:05"],
        },
        // More history entries...
      ],
      streak: 12,
    },

    category: "health",
    active: true,
    color: "#9b59b6",
  },

  // WEEKLY HABITS
  {
    id: 3,
    name: "Slow jog",
    description: "30 minute easy jog",
    creationDate: "5/10/2025",

    recurrence: {
      type: "weekly",
      timesPerWeek: 3, // 3 times per week, any day
      weekStart: "monday", // Define when the week starts
    },

    progress: {
      currentPeriod: {
        periodStart: "5/12/2025", // Current week's start date
        periodEnd: "5/18/2025", // Current week's end date
        completions: 1, // Completed once so far this week
        target: 3, // Need to do it 3 times total
        completionDates: ["5/14/2025"], // Which days it was completed
      },
      history: [
        {
          periodStart: "5/5/2025",
          periodEnd: "5/11/2025",
          completions: 3,
          target: 3,
          completed: true,
          completionDates: ["5/6/2025", "5/8/2025", "5/10/2025"],
        },
        // More history entries...
      ],
      streak: 2, // Weeks in a row where target was met
    },

    category: "exercise",
    active: true,
    color: "#3498db",
    duration: {
      target: 30,
      unit: "minutes",
    },
  },

  // SPECIFIC DAYS HABIT
  {
    id: 4,
    name: "Go to gym",
    description: "Weight training session",
    creationDate: "10/1/2024",

    recurrence: {
      type: "specific_days",
      daysOfWeek: ["monday", "tuesday", "thursday", "friday"],
      specificTimes: ["17:30"], // After work
    },

    progress: {
      currentPeriod: {
        periodStart: "5/12/2025", // Current week's start
        periodEnd: "5/18/2025", // Current week's end
        completions: 3, // Went Mon, Tue, Thu this week
        target: 4, // Should go 4 days if following schedule
        completionDates: ["5/12/2025", "5/13/2025", "5/15/2025"],
      },
      history: [
        {
          periodStart: "5/5/2025",
          periodEnd: "5/11/2025",
          completions: 4,
          target: 4,
          completed: true,
          completionDates: ["5/5/2025", "5/6/2025", "5/8/2025", "5/9/2025"],
        },
        // More history entries...
      ],
      streak: 3, // Weeks in a row where all scheduled days were completed
    },

    category: "exercise",
    active: true,
    color: "#e74c3c",
  },

  // MONTHLY HABIT
  {
    id: 5,
    name: "Budget review",
    description: "Review finances and adjust budget",
    creationDate: "1/15/2025",

    recurrence: {
      type: "monthly",
      timesPerMonth: 1,
      daysOfMonth: [1], // First day of each month
      // Alternative: lastDayOfMonth: true
    },

    progress: {
      currentPeriod: {
        periodStart: "5/1/2025", // Current month start
        periodEnd: "5/31/2025", // Current month end
        completions: 1, // Already done this month
        target: 1,
        completionDates: ["5/1/2025"],
      },
      history: [
        {
          periodStart: "4/1/2025",
          periodEnd: "4/30/2025",
          completions: 1,
          target: 1,
          completed: true,
          completionDates: ["4/2/2025"], // Did it a day late
        },
        // More history entries...
      ],
      streak: 5, // Months in a row
    },

    category: "finances",
    active: true,
    color: "#1abc9c",
  },

  // YEARLY HABIT
  {
    id: 6,
    name: "Annual health checkup",
    description: "Comprehensive physical examination",
    creationDate: "2/10/2024",

    recurrence: {
      type: "yearly",
      timesPerYear: 1,
      monthsOfYear: [9], // September
      daysOfMonth: [15], // 15th of September
    },

    progress: {
      currentPeriod: {
        periodStart: "1/1/2025", // Current year start
        periodEnd: "12/31/2025", // Current year end
        completions: 0, // Not done this year yet
        target: 1,
        completionDates: [],
      },
      history: [
        {
          periodStart: "1/1/2024",
          periodEnd: "12/31/2024",
          completions: 1,
          target: 1,
          completed: true,
          completionDates: ["9/16/2024"], // Did it a day late
        },
        // More history entries...
      ],
      streak: 1, // Years in a row
    },

    category: "health",
    active: true,
    color: "#f39c12",
  },

  // MULTIPLE TIMES PER MONTH HABIT
  {
    id: 7,
    name: "Deep house cleaning",
    description: "Thorough cleaning of the entire house",
    creationDate: "3/5/2025",

    recurrence: {
      type: "monthly",
      timesPerMonth: 2, // Twice a month
      // Optional: preferred days, but not required
      preferredDaysOfWeek: ["saturday", "sunday"],
    },

    progress: {
      currentPeriod: {
        periodStart: "5/1/2025",
        periodEnd: "5/31/2025",
        completions: 1, // Done once so far this month
        target: 2, // Need to do one more time
        completionDates: ["5/11/2025"],
      },
      history: [
        {
          periodStart: "4/1/2025",
          periodEnd: "4/30/2025",
          completions: 2,
          target: 2,
          completed: true,
          completionDates: ["4/6/2025", "4/20/2025"],
        },
        // More history entries...
      ],
      streak: 2, // Months in a row meeting the target
    },

    category: "home",
    active: true,
    color: "#34495e",
    // Estimated duration
    duration: {
      target: 120,
      unit: "minutes",
    },
  },

  // COMPLEX WEEKLY HABIT (WITH SUBTASKS)
  {
    id: 8,
    name: "Meal prep",
    description: "Prepare meals for the week",
    creationDate: "2/1/2025",

    recurrence: {
      type: "weekly",
      timesPerWeek: 1,
      daysOfWeek: ["sunday"], // Prefer Sunday
    },

    progress: {
      currentPeriod: {
        periodStart: "5/12/2025",
        periodEnd: "5/18/2025",
        completions: 0, // Not done this week yet
        target: 1,
        subtasksCompleted: [], // No subtasks completed yet
      },
      history: [
        {
          periodStart: "5/5/2025",
          periodEnd: "5/11/2025",
          completions: 1,
          target: 1,
          completed: true,
          completionDates: ["5/5/2025"],
          subtasksCompleted: ["breakfast", "lunch", "dinner"], // All subtasks done
        },
        // More history entries...
      ],
      streak: 14, // Weeks in a row
    },

    // Subtasks for this habit
    subtasks: [
      {
        id: "breakfast",
        name: "Breakfast prep",
        description: "Overnight oats and smoothie packs",
      },
      {
        id: "lunch",
        name: "Lunch prep",
        description: "Salads and grain bowls",
      },
      {
        id: "dinner",
        name: "Dinner prep",
        description: "Main dishes and sides",
      },
    ],

    category: "cooking",
    active: true,
    color: "#27ae60",
    duration: {
      target: 180,
      unit: "minutes",
    },
  },
];
