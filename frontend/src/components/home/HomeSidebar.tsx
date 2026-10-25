import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { HOME_NAV_ITEMS, type HomeNavId } from "./homeNavItems";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface HomeSidebarProps {
  selectedId: HomeNavId;
  onSelect: (id: HomeNavId) => void;
  isMobileLayout?: boolean;
}

/**
 * Sidebar navigation:
 * - Desktop: Animated collapsible sidebar (w-64 <-> w-16) with subtle vertical gradient
 *   matching the page background (white -> light blue -> deeper blue).
 * - Hover: soft blue tint + diagonal shine sweep + small left accent bar.
 * - Selected: blue gradient pill with white text.
 * - Mobile: Horizontal scrollable tab bar under top bar.
 */
export function HomeSidebar({ selectedId, onSelect, isMobileLayout = false }: HomeSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const itemRefs = useRef<Map<HomeNavId, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    // Keep ref mapping aligned
  }, [selectedId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const total = HOME_NAV_ITEMS.length;
    let nextIndex = currentIndex;

    const isPrev = isMobileLayout
      ? event.key === "ArrowLeft"
      : event.key === "ArrowUp" || event.key === "ArrowLeft";
    const isNext = isMobileLayout
      ? event.key === "ArrowRight"
      : event.key === "ArrowDown" || event.key === "ArrowRight";

    if (isPrev) {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + total) % total;
    } else if (isNext) {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % total;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = total - 1;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(HOME_NAV_ITEMS[currentIndex]!.id);
      return;
    } else {
      return;
    }

    const nextItem = HOME_NAV_ITEMS[nextIndex];
    if (!nextItem) return;
    onSelect(nextItem.id);
    const el = itemRefs.current.get(nextItem.id);
    el?.focus();
  };

  /* =========================================================================
   * Horizontal bar for < 1024px screens (under top bar)
   * ========================================================================= */
  if (isMobileLayout) {
    return (
      <nav
        role="tablist"
        aria-orientation="horizontal"
        aria-label="Dashboard sections"
        className="w-full shrink-0 border-b border-sky-100 bg-white/80 px-3 py-2 backdrop-blur-sm overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-1.5 min-w-max">
          {HOME_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current.set(item.id, el);
                }}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${item.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onSelect(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
                  isSelected
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-sky-50/80 hover:text-primary",
                )}
              >
                <Icon className={cn("size-4", isSelected ? "text-white" : "text-slate-500")} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  /* =========================================================================
   * Desktop vertical sidebar (collapsible), full height under the top bar.
   * Items: icon tile + label; the selected item is a blue gradient pill with an arrow.
   * Bottom: round Logout button + collapse toggle.
   * ========================================================================= */
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sky-100/90 lg:flex lg:flex-col justify-between overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out",
        "bg-gradient-to-b from-white via-[#EEF5FF] to-[#DCE9FF]",
        isCollapsed ? "w-20" : "w-80",
      )}
      aria-label="Dashboard navigation"
    >
      <div className="flex flex-col gap-2 p-4">
        {!isCollapsed && (
          <p className="px-3 pb-1 pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Menu
          </p>
        )}
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Dashboard sections"
          className="space-y-2"
        >
          {HOME_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current.set(item.id, el);
                }}
                id={`tab-${item.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${item.id}`}
                tabIndex={isSelected ? 0 : -1}
                title={isCollapsed ? item.label : undefined}
                onClick={() => onSelect(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "group relative flex items-center overflow-hidden rounded-2xl text-base font-semibold transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
                  isCollapsed ? "mx-auto size-12 justify-center" : "w-full gap-3 py-2.5 pl-2.5 pr-2.5",
                  isSelected
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/25"
                    : "text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm",
                )}
              >
                {/* Diagonal shine sweep on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />

                <span
                  className={cn(
                    "relative grid shrink-0 place-items-center rounded-xl transition-colors",
                    isCollapsed ? "size-10" : "size-11",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-sky-100/80 text-primary group-hover:bg-primary/10",
                  )}
                >
                  <Icon className="size-5" />
                </span>

                {!isCollapsed && <span className="relative flex-1 truncate text-left">{item.label}</span>}

                {!isCollapsed && isSelected && (
                  <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 border-t border-sky-100/80 p-4">
        {/* Logout */}
        <button
          type="button"
          onClick={() => navigate({ to: ROUTES.auth })}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "group flex w-full items-center gap-3 rounded-2xl p-1.5 text-left font-semibold text-slate-700 transition-colors hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
            isCollapsed && "justify-center",
          )}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <LogOut className="size-5" />
          </span>
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse/Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex w-full items-center rounded-xl p-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
            isCollapsed ? "justify-center" : "justify-between",
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {!isCollapsed && <span>Collapse</span>}
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
    </aside>
  );
}
