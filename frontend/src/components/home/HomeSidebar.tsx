import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HOME_NAV_ITEMS, type HomeNavId } from "./homeNavItems";
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
   * Desktop Vertical sidebar (w-64 <-> w-16, full height under top bar)
   * Subtle vertical gradient: white -> very light blue -> slightly deeper blue
   * ========================================================================= */
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sky-100/90 lg:flex lg:flex-col justify-between overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-in-out",
        "bg-gradient-to-b from-white via-[#F0F6FF] to-[#E3EEFF]",
        isCollapsed ? "w-16" : "w-72",
      )}
      aria-label="Dashboard navigation"
    >
      <div className="flex flex-col gap-2 p-3">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label="Dashboard sections"
          className="space-y-1.5"
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
                  "group relative flex items-center overflow-hidden rounded-xl font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
                  isCollapsed ? "h-11 w-11 mx-auto justify-center" : "w-full gap-3 px-4 py-3.5 text-base font-semibold",
                  isSelected
                    ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-sm font-bold"
                    : "text-slate-600 hover:bg-sky-50/80 hover:text-primary",
                )}
              >
                {/* Diagonal shine sweep on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 transition-transform duration-700 ease-out group-hover:translate-x-full"
                />

                {/* Left accent bar on hover when not selected */}
                {!isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                )}

                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    isSelected ? "text-white" : "text-slate-500 group-hover:text-primary",
                  )}
                />

                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse/Expand Toggle Button */}
      <div className="p-3 border-t border-sky-100/80">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex w-full items-center rounded-xl p-2.5 text-xs sm:text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
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
