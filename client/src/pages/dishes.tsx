import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Sunrise, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import DishForm from "@/components/dish-form";
import { type Dish } from "@shared/schema";

const mealTypeLabels = {
  breakfast: "Завтрак",
  lunch: "Обед", 
  dinner: "Ужин",
};

const mealTypeIcons = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
};

const mealTypeColors = {
  breakfast: "meal-breakfast",
  lunch: "meal-lunch",
  dinner: "meal-dinner",
};

export default function Dishes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);
  const { toast } = useToast();

  // Fetch dishes
  const { data: dishes = [], isLoading } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  // Create dish mutation
  const createDishMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/dishes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Блюдо создано",
        description: "Новое блюдо успешно добавлено",
      });
      setIsAddDishModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать блюдо",
        variant: "destructive",
      });
    },
  });

  // Update dish mutation
  const updateDishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/dishes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Блюдо обновлено",
        description: "Изменения успешно сохранены",
      });
      setEditingDish(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    },
  });

  // Delete dish mutation
  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/dishes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dishes"] });
      toast({
        title: "Блюдо удалено",
        description: "Блюдо успешно удалено",
      });
      setDeletingDish(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить блюдо",
        variant: "destructive",
      });
    },
  });

  const handleCreateDish = (data: any) => {
    createDishMutation.mutate(data);
  };

  const handleUpdateDish = (data: any) => {
    if (editingDish) {
      updateDishMutation.mutate({ id: editingDish.id, data });
    }
  };

  const handleDeleteDish = () => {
    if (deletingDish) {
      deleteDishMutation.mutate(deletingDish.id);
    }
  };

  // Filter dishes based on search and meal type
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMealType = !selectedMealType || dish.mealType === selectedMealType;
    
    return matchesSearch && matchesMealType;
  });

  const mealTypeFilters = [
    { value: "", label: "Все" },
    { value: "breakfast", label: "Завтрак" },
    { value: "lunch", label: "Обед" },
    { value: "dinner", label: "Ужин" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-gray-900">Блюда</h1>
            <Button
              onClick={() => setIsAddDishModalOpen(true)}
              className="p-2 bg-primary text-white rounded-full shadow-lg"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto">
            {mealTypeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedMealType === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMealType(filter.value)}
                className="whitespace-nowrap"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Dishes List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchQuery || selectedMealType ? "Блюда не найдены" : "Нет добавленных блюд"}
            </div>
            <Button onClick={() => setIsAddDishModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить первое блюдо
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDishes.map((dish) => {
              const Icon = mealTypeIcons[dish.mealType as keyof typeof mealTypeIcons];
              const mealTypeColor = mealTypeColors[dish.mealType as keyof typeof mealTypeColors];
              
              return (
                <Card key={dish.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{dish.name}</CardTitle>
                        {dish.description && (
                          <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge className={`${mealTypeColor} text-xs`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {mealTypeLabels[dish.mealType as keyof typeof mealTypeLabels]}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingDish(dish)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingDish(dish)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="text-sm text-gray-600">
                        <div className="font-medium mb-1">Ингредиенты:</div>
                        <div className="text-xs space-y-1">
                          {dish.ingredients.slice(0, 3).map((ingredient, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{ingredient.name}</span>
                              <span>{ingredient.quantity} {ingredient.unit}</span>
                            </div>
                          ))}
                          {dish.ingredients.length > 3 && (
                            <div className="text-gray-400">
                              +{dish.ingredients.length - 3} ещё
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Dish Modal */}
      <Dialog open={isAddDishModalOpen} onOpenChange={setIsAddDishModalOpen}>
        <DialogContent className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать новое блюдо</DialogTitle>
          </DialogHeader>
          <DishForm
            onSave={handleCreateDish}
            onCancel={() => setIsAddDishModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dish Modal */}
      <Dialog open={!!editingDish} onOpenChange={() => setEditingDish(null)}>
        <DialogContent className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать блюдо</DialogTitle>
          </DialogHeader>
          {editingDish && (
            <DishForm
              dish={editingDish}
              onSave={handleUpdateDish}
              onCancel={() => setEditingDish(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDish} onOpenChange={() => setDeletingDish(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить блюдо?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить блюдо "{deletingDish?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDish}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
