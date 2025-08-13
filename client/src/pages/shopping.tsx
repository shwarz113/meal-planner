import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type ShoppingListItem } from "@shared/schema";
import { formatDate } from "@/lib/date-utils";

const addItemSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  quantity: z.string().min(1, "Количество обязательно"),
  unit: z.string().min(1, "Единица измерения обязательна"),
  dishName: z.string().optional(),
});

type AddItemForm = z.infer<typeof addItemSchema>;

export default function Shopping() {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddItemForm>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unit: "",
      dishName: "",
    },
  });

  // Fetch shopping list items
  const { data: shoppingListItems = [], isLoading } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping-list"],
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/shopping-list", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Товар добавлен",
        description: "Товар успешно добавлен в список покупок",
      });
      setIsAddItemModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар",
        variant: "destructive",
      });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/shopping-list/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/shopping-list/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Товар удален",
        description: "Товар удален из списка покупок",
      });
    },
  });

  // Clear list mutation
  const clearListMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/shopping-list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Список очищен",
        description: "Список покупок очищен",
      });
    },
  });

  // Generate shopping list mutation
  const generateListMutation = useMutation({
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
        title: "Список обновлен",
        description: "Список покупок создан на основе запланированных блюд",
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

  const handleAddItem = (data: AddItemForm) => {
    addItemMutation.mutate({ 
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      dishName: data.dishName || undefined,
      isCompleted: "false" 
    });
  };

  const handleToggleItem = (item: ShoppingListItem) => {
    const newStatus = item.isCompleted === "true" ? "false" : "true";
    updateItemMutation.mutate({
      id: item.id,
      data: { isCompleted: newStatus },
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const handleClearCompleted = () => {
    const completedItems = shoppingListItems.filter(item => item.isCompleted === "true");
    completedItems.forEach(item => {
      deleteItemMutation.mutate(item.id);
    });
  };

  const handleGenerateList = () => {
    generateListMutation.mutate();
  };

  const completedCount = shoppingListItems.filter(item => item.isCompleted === "true").length;
  const totalCount = shoppingListItems.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-gray-900">Покупки</h1>
              {totalCount > 0 && (
                <p className="text-sm text-gray-600">
                  {completedCount} из {totalCount} выполнено
                </p>
              )}
            </div>
            <Button
              onClick={() => setIsAddItemModalOpen(true)}
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
        {/* Action Buttons */}
        {shoppingListItems.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleGenerateList}
              disabled={generateListMutation.isPending}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {generateListMutation.isPending ? "Создание..." : "Обновить из планов"}
            </Button>
            {completedCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCompleted}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить выполненные
              </Button>
            )}
          </div>
        )}

        {/* Shopping List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : shoppingListItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Список покупок пуст</div>
            <div className="space-x-2">
              <Button onClick={() => setIsAddItemModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
              <Button variant="outline" onClick={handleGenerateList}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Создать из планов
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              // Group items by dish
              const groupedItems = shoppingListItems.reduce((groups, item) => {
                const dishName = (item as any).dishName || "Прочие товары";
                if (!groups[dishName]) {
                  groups[dishName] = [];
                }
                groups[dishName].push(item);
                return groups;
              }, {} as Record<string, ShoppingListItem[]>);

              // Sort dishes by earliest planned date
              const sortedDishes = Object.entries(groupedItems).sort(([dishNameA, itemsA], [dishNameB, itemsB]) => {
                const earliestDateA = itemsA.reduce((earliest, item) => {
                  const itemDate = (item as any).plannedDate;
                  if (!itemDate) return earliest;
                  if (!earliest) return itemDate;
                  return itemDate < earliest ? itemDate : earliest;
                }, null as string | null);
                
                const earliestDateB = itemsB.reduce((earliest, item) => {
                  const itemDate = (item as any).plannedDate;
                  if (!itemDate) return earliest;
                  if (!earliest) return itemDate;
                  return itemDate < earliest ? itemDate : earliest;
                }, null as string | null);

                // Items without planned dates go to the end
                if (!earliestDateA && !earliestDateB) return 0;
                if (!earliestDateA) return 1;
                if (!earliestDateB) return -1;
                
                return earliestDateA.localeCompare(earliestDateB);
              });

              return sortedDishes.map(([dishName, items]) => {
                // Get the earliest planned date for this dish
                const earliestDate = items.reduce((earliest, item) => {
                  const itemDate = (item as any).plannedDate;
                  if (!itemDate) return earliest;
                  if (!earliest) return itemDate;
                  return itemDate < earliest ? itemDate : earliest;
                }, null as string | null);

                return (
                <Card key={dishName}>
                  <CardHeader className="p-6 pt-[0px] pb-[0px]">
                    <CardTitle className="text-lg text-gray-900">
                      {dishName}
                      {earliestDate && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          {formatDate(new Date(earliestDate))}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-[6px] pb-[6px]">
                    <div className="space-y-2">
                      {items.map((item) => {
                        const isCompleted = item.isCompleted === "true";
                        
                        return (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border transition-opacity bg-white pt-[0px] pb-[0px] text-[15px]">
                            <div className="flex items-center space-x-3 flex-1">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => handleToggleItem(item)}
                              />
                              <div className="flex-1">
                                <div className={`font-medium ${isCompleted ? "line-through text-gray-500" : ""}`}>
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.quantity} {item.unit}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
                );
              });
            })()}
          </div>
        )}

        {/* Progress Summary */}
        {totalCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {completedCount === totalCount ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium">
                    {completedCount === totalCount 
                      ? "Все покупки выполнены!" 
                      : `Прогресс: ${completedCount}/${totalCount}`
                    }
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round((completedCount / totalCount) * 100)}%
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      {/* Add Item Modal */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogContent className="w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название товара</FormLabel>
                    <FormControl>
                      <Input placeholder="Название товара" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dishName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Блюдо (необязательно)</FormLabel>
                    <FormControl>
                      <Input placeholder="К какому блюду относится" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Количество</FormLabel>
                      <FormControl>
                        <Input placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Единица</FormLabel>
                      <FormControl>
                        <Input placeholder="г" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsAddItemModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={addItemMutation.isPending}
                >
                  {addItemMutation.isPending ? "Добавление..." : "Добавить"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
