import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  formatDate, getTwoWeekDays
} from "@/lib/date-utils";
import { type MealEvent, type Dish } from "@shared/schema";
import MealCard from "./meal-card";

interface CalendarViewProps {
  mealEvents: MealEvent[];
  dishes: Dish[];
  onEditMeal: (event: MealEvent) => void;
}

const weekDays = getTwoWeekDays(new Date());

export default function CalendarListView({ mealEvents, dishes, onEditMeal }: CalendarViewProps) {

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return mealEvents.filter(event => {
      return dateStr >= event.startDate && dateStr <= event.endDate;
    }).sort((a, b) => a.mealType.localeCompare(b.mealType));
  };

  const getDishById = (dishId: string) => {
    return dishes.find(dish => dish.id === dishId);
  };

  console.log({
    weekDays,
    mealEvents
  })

  return (
    <div>
      {weekDays.map((day, index) => {
        const dayEvents = getEventsForDate(day);
        return (
          <div>
            <div><b>{format(day, "d MMMM yyyy (eeee)", { locale: ru })}</b></div>
            {dayEvents.map((event) => {
              const dish = getDishById(event.dishId);
              if (!dish) return null;

              return (
                <MealCard
                  key={`${event.id}`}
                  event={event}
                  dish={dish}
                  onClick={() => onEditMeal(event)}
                />
              );
            })}
          </div>
        )
      })}
    </div>
  )
}
