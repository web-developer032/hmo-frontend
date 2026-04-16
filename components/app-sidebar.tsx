"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleSwitcher } from "@/components/role-switcher";
import { getNavSectionsForUser } from "@/lib/navigation/role-nav";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils/cn";

function isNavHrefActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  const activeNavRole = useAppSelector((s) => s.ui.activeNavRole);

  if (!user) return null;

  const sections = getNavSectionsForUser(user.roles, activeNavRole);

  return (
    <aside
      className="flex w-full shrink-0 flex-col gap-1 border-b border-(--border-design) bg-card px-4 py-5 md:sticky md:top-(--topnav-height) md:h-[calc(100vh-(--topnav-height))] md:w-(--sidebar-width) md:border-b-0 md:border-r md:py-6 md:overflow-y-auto"
      aria-label="Main navigation"
    >
      <RoleSwitcher />
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-1.5 mt-4 px-3 text-0.68rem font-semibold uppercase tracking-0.09em text-(--ink-4) first:mt-0">
            {section.title}
          </div>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isNavHrefActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[0.85rem] transition-colors",
                      active
                        ? "bg-(--accent-light) font-medium text-(--accent)"
                        : "text-(--ink-3) hover:bg-(--paper-2) hover:text-(--ink)"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
