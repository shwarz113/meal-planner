import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  getWeekDays, 
  getMonthWeeks, 
  formatDateRange, 
  formatDate, 
  formatDateDisplay, 
  formatMonthYear,
  nextWeek, 
  previousWeek, 
  getDayNames,
  isWeekend 
} from "@/lib/date-utils";
import { type MealEvent, type Dish } from "@shared/schema";
import MealCard from "./meal-card";

interface CalendarViewProps {
  mealEvents: MealEvent[];
  dishes: Dish[];
  onAddMeal: (date: string, mealType?: string) => void;
  onEditMeal: (event: MealEvent) => void;
}

type ViewMode = "week" | "month";

export default function CalendarView({ mealEvents, dishes, onAddMeal, onEditMeal }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const handlePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(previousWeek(currentDate));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setCurrentDate(nextWeek(currentDate));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return mealEvents.filter(event => {
      return dateStr >= event.startDate && dateStr <= event.endDate;
    });
  };

  const getDishById = (dishId: string) => {
    return dishes.find(dish => dish.id === dishId);
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const dayNames = getDayNames();

    return (
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((dayName, index) => (
            <div key={dayName} className="p-3 text-center text-sm font-medium text-gray-700">
              <span className={isWeekend(weekDays[index]) ? "text-red-600" : ""}>{dayName}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const dayStr = formatDate(day);
            const isWeekendDay = isWeekend(day);

            return (
              <div key={dayStr} className="calendar-day bg-white p-2 relative border-r border-b border-gray-100 last:border-r-0">
                <div className={`text-sm font-medium mb-2 ${isWeekendDay ? "text-red-600" : "text-gray-900"}`}>
                  {formatDateDisplay(day)}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => {
                    const dish = getDishById(event.dishId);
                    if (!dish) return null;

                    return (
                      <MealCard
                        key={`${event.id}-${dayStr}`}
                        event={event}
                        dish={dish}
                        onClick={() => onEditMeal(event)}
                      />
                    );
                  })}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    onClick={() => onAddMeal(dayStr)}
                  >
                    +
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderMonthView = () => {
    const monthWeeks = getMonthWeeks(currentDate);
    const dayNames = getDayNames();

    return (
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((dayName) => (
            <div key={dayName} className="p-3 text-center text-sm font-medium text-gray-700">
              {dayName}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {monthWeeks.map((weekStart, weekIndex) => {
          const weekDays = getWeekDays(weekStart);
          
          return (
            <div key={weekIndex} className="grid grid-cols-7">
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day);
                const dayStr = formatDate(day);
                const isWeekendDay = isWeekend(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div key={dayStr} className={`calendar-day p-2 relative border-r border-b border-gray-100 last:border-r-0 ${!isCurrentMonth ? "bg-gray-50" : "bg-white"}`}>
                    <div className={`text-sm font-medium mb-2 ${!isCurrentMonth ? "text-gray-400" : isWeekendDay ? "text-red-600" : "text-gray-900"}`}>
                      {formatDateDisplay(day)}
                    </div>
                    {isCurrentMonth && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const dish = getDishById(event.dishId);
                          if (!dish) return null;

                          return (
                            <MealCard
                              key={`${event.id}-${dayStr}`}
                              event={event}
                              dish={dish}
                              onClick={() => onEditMeal(event)}
                              compact
                            />
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-4 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          onClick={() => onAddMeal(dayStr)}
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {viewMode === "week" 
              ? formatDateRange(getWeekDays(currentDate)[0], getWeekDays(currentDate)[6])
              : formatMonthYear(currentDate)
            }
          </h2>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleToday} className="text-accent">
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "week" ? "month" : "week")}
            className="flex items-center space-x-1"
          >
            {viewMode === "week" ? <CalendarIcon className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            <span>{viewMode === "week" ? "Месяц" : "Неделя"}</span>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "week" ? renderWeekView() : renderMonthView()}
    </div>
  );
}
