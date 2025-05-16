"use client";
import { ArrowRight, CalendarDays, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddHabit from "./AddHabit";
import { Button, buttonVariants } from "./ui/button";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="px-3 py-4 md:py-7 relative">
      <div className="flex justify-between items-center">
        <Link className="font-bold text-xl md:text-2xl" href="/">
          Habit Tracker
        </Link>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Desktop navigation */}
        <div className="hidden md:flex gap-2 flex-wrap">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/manage-habits"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage Habits
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/calendar"
            className={buttonVariants({ variant: "outline" })}
          >
            Calendar <CalendarDays className="ml-2 h-4 w-4" />
          </Link>

          <AddHabit />
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-50 py-3 px-4 flex flex-col gap-2 border-t">
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "justify-between",
            })}
            onClick={toggleMenu}
          >
            Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/manage-habits"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "justify-between",
            })}
            onClick={toggleMenu}
          >
            Manage Habits
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/calendar"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "justify-between",
            })}
            onClick={toggleMenu}
          >
            Calendar <CalendarDays className="ml-2 h-4 w-4" />
          </Link>

          <div className="mt-2">
            <AddHabit onComplete={toggleMenu} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
