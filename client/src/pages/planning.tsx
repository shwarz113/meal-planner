import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Sun, Sunrise, Moon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import CalendarView from "@/components/calendar-view";
import AddMealModal from "@/components/add-meal-modal";
import { type MealEvent, type Dish } from "@shared/schema";
import { formatDate } from "@/lib/date-utils";

export default function Planning() {
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const { toast } = useToast();

  // Fetch meal events
  const { data: mealEvents = [], isLoading: isLoadingEvents } = useQuery<MealEvent[]>({
    queryKey: ["/api/meal-events"],
  });

  // Fetch dishes
  const { data: dishes = [], isLoading: isLoadingDishes } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  // Create meal event mutation
  const createMealEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/meal-events", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-events"] });
      toast({
        title: "Блюдо добавлено",
        description: "Блюдо успешно добавлено в план питания",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить блюдо",
        variant: "destructive",
      });
    },
  });

  // Generate shopping list mutation
  const generateShoppingListMutation = useMutation({
    mutationFn: async () => {
      const currentDate = new Date();
      const startDate = formatDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
      const endDate = formatDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
      
      const response = await apiRequest("POST", "/api/shopping-list/generate", {
        startDate,
        endDate,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Список покупок создан",
        description: "Список покупок успешно создан на основе запланированных блюд",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать список покупок",
        variant: "destructive",
      });
    },
  });

  const handleAddMeal = (date: string, mealType?: string) => {
    setSelectedDate(date);
    setSelectedMealType(mealType || "");
    setIsAddMealModalOpen(true);
  };

  const handleSaveMeal = (data: any) => {
    createMealEventMutation.mutate(data);
  };

  const handleEditMeal = (event: MealEvent) => {
    // For now, just log the event. Can implement edit functionality later
    console.log("Edit meal:", event);
  };

  const handleQuickAddMeal = (mealType: string) => {
    const today = formatDate(new Date());
    handleAddMeal(today, mealType);
  };

  const handleGenerateShoppingList = () => {
    generateShoppingListMutation.mutate();
  };

  const isLoading = isLoadingEvents || isLoadingDishes;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-gray-900">Планирование</h1>
            <Button
              onClick={() => handleAddMeal(formatDate(new Date()))}
              className="p-2 bg-primary text-white rounded-full shadow-lg"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-6">
        {/* Calendar View */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : (
          <CalendarView
            mealEvents={mealEvents}
            dishes={dishes}
            onAddMeal={handleAddMeal}
            onEditMeal={handleEditMeal}
          />
        )}

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Быстрые действия</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="p-3 h-auto flex-col space-y-1 meal-breakfast"
                onClick={() => handleQuickAddMeal("breakfast")}
              >
                <Sunrise className="h-5 w-5" />
                <span className="text-sm font-medium">Завтрак</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-3 h-auto flex-col space-y-1 meal-lunch"
                onClick={() => handleQuickAddMeal("lunch")}
              >
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium">Обед</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-3 h-auto flex-col space-y-1 meal-dinner"
                onClick={() => handleQuickAddMeal("dinner")}
              >
                <Moon className="h-5 w-5" />
                <span className="text-sm font-medium">Ужин</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-3 h-auto flex-col space-y-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleGenerateShoppingList}
                disabled={generateShoppingListMutation.isPending}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {generateShoppingListMutation.isPending ? "Создание..." : "Список покупок"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={isAddMealModalOpen}
        onClose={() => setIsAddMealModalOpen(false)}
        onSave={handleSaveMeal}
        dishes={dishes}
        defaultDate={selectedDate}
        defaultMealType={selectedMealType}
      />
    </div>
  );
}
