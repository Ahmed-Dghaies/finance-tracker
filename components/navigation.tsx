"use client";

import {
  BarChart3,
  LayoutDashboard,
  Landmark,
  LogOut,
  Menu,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { withBasePath } from "@/lib/site-path";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses/", label: "Expenses", icon: Wallet },
  { href: "/income/", label: "Income", icon: TrendingUp },
  { href: "/investments/", label: "Investments", icon: Landmark },
  { href: "/possessions/", label: "Possessions", icon: PiggyBank },
  { href: "/statistics/", label: "Statistics", icon: BarChart3 },
];

interface NavigationProps {
  userEmail?: string;
  onSignOut?: () => Promise<void> | void;
}

function getInitial(email?: string) {
  return email?.trim().charAt(0)?.toUpperCase() || "?";
}

export function Navigation({ userEmail, onSignOut }: NavigationProps) {
  const pathname = usePathname();
  const initial = getInitial(userEmail);

  const handleSignOut = async () => {
    if (!onSignOut) {
      return;
    }

    await onSignOut();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src={withBasePath("/icon.svg")}
            alt="Finance Tracker"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl"
            priority
          />
          <span className="hidden text-base font-semibold sm:inline-flex">Finance Tracker</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            console.log({
              pathname,
              href: item.href,
              isActive,
            });

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {userEmail && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground">
              {initial}
            </div>
          )}
          {onSignOut && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void handleSignOut()}
              aria-label="Sign out"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[82vw] sm:w-88">
                <SheetHeader className="pb-2 pr-10">
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src={withBasePath("/icon.svg")}
                      alt="Finance Tracker"
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-lg"
                    />
                    <span>Finance Tracker</span>
                  </SheetTitle>
                </SheetHeader>

              <div className="space-y-3 px-4">
                {userEmail && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{userEmail}</p>
                      <p className="text-xs text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>

                {onSignOut && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
