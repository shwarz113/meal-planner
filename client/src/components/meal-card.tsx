import { type MealEvent, type Dish } from "@shared/schema";

interface MealCardProps {
  event: MealEvent;
  dish: Dish;
  onClick: () => void;
  compact?: boolean;
}

const mealTypeClasses = {
  breakfast: "meal-breakfast",
  lunch: "meal-lunch",
  dinner: "meal-dinner",
};

export default function MealCard({ event, dish, onClick, compact = false }: MealCardProps) {
  const mealTypeClass = mealTypeClasses[event.mealType as keyof typeof mealTypeClasses] || "bg-gray-100";

  return (
    <div
      className={`${mealTypeClass} rounded text-xs cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "p-1" : "p-2"
      }`}
      onClick={onClick}
    >
      <div className={`font-medium truncate ${compact ? "text-xs" : ""}`}>
        {dish.name}
      </div>
    </div>
  );
}
