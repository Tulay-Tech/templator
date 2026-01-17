import { useLocation, Link } from "@tanstack/react-router";
import { useMemo } from "react";

// shadcn/ui Breadcrumb components
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
  label: string;
  href: string;
  isLast: boolean;
}

function formatSegment(segment: string): string {
  // Handle common patterns

  // Convert kebab-case and snake_case to Title Case
  return segment
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DynamicBreadcrumb({ maxItems = 3 }: { maxItems?: number }) {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    const items: BreadcrumbItemType[] = [
      {
        label: "Home",
        href: "/",
        isLast: segments.length === 0,
      },
    ];

    segments.forEach((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      items.push({
        label: formatSegment(segment),
        href: path,
        isLast: index === segments.length - 1,
      });
    });

    return items;
  }, [location.pathname]);

  // Handle collapsed breadcrumbs when there are too many
  const displayBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    // Show: home / ... / second latest / latest
    const first = breadcrumbs[0];
    const secondLast = breadcrumbs[breadcrumbs.length - 2];
    const last = breadcrumbs[breadcrumbs.length - 1];

    return [
      first,
      { label: "ellipsis", href: "#", isLast: false },
      secondLast,
      last,
    ];
  }, [breadcrumbs, maxItems]);

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayBreadcrumbs.map((item, index) => (
          <div key={`${item.href}-${index}`} className="contents">
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : item.label === "ellipsis" ? (
                <BreadcrumbEllipsis />
              ) : (
                <BreadcrumbLink href={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator
                className={index === 0 ? "hidden md:block" : ""}
              />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
