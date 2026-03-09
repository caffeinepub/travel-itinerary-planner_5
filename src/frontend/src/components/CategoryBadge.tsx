import { Camera, Hotel, Plane, UtensilsCrossed } from "lucide-react";

type Category = "transport" | "accommodation" | "activity" | "food" | string;

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  transport: {
    label: "Transport",
    icon: <Plane className="h-3 w-3" />,
    className: "bg-transport/10 text-transport border-transport",
  },
  accommodation: {
    label: "Stay",
    icon: <Hotel className="h-3 w-3" />,
    className: "bg-accommodation/10 text-accommodation border-accommodation",
  },
  activity: {
    label: "Activity",
    icon: <Camera className="h-3 w-3" />,
    className: "bg-activity/10 text-activity border-activity",
  },
  food: {
    label: "Food",
    icon: <UtensilsCrossed className="h-3 w-3" />,
    className: "bg-food/10 text-food border-food",
  },
};

export function CategoryDot({ category }: { category: Category }) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.activity;
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full bg-${category}`}
      title={config.label}
    />
  );
}

export default function CategoryBadge({
  category,
  size = "sm",
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] ?? {
    label: category,
    icon: <Camera className="h-3 w-3" />,
    className: "bg-activity/10 text-activity border-activity",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-sans font-medium ${
        size === "sm" ? "text-xs" : "text-sm px-3 py-1"
      } ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
