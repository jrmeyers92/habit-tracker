import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AddHabit from "./AddHabit";
import { Button, buttonVariants } from "./ui/button";

const Nav = () => {
  return (
    <nav className="flex justify-between items-center px-3 py-7">
      <Link className="font-bold text-2xl" href="/">
        Habit Tracker
      </Link>
      <div className="flex gap-3">
        <Link
          href="/manage-habits"
          className={buttonVariants({ variant: "outline" })}
        >
          Manage Habits
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>

        <AddHabit />
      </div>
    </nav>
  );
};

export default Nav;
