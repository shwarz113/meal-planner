import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Sun, Sunrise, Moon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Dish } from "@shared/schema";

const mealEventSchema = z.object({
  dishId: z.string().min(1, "Выберите блюдо"),
  mealType: z.enum(["breakfast", "lunch", "dinner"], {
    required_error: "Выберите тип приема пищи"
  }),
  startDate: z.string().min(1, "Выберите дату начала"),
  endDate: z.string().min(1, "Выберите дату окончания"),
});

type MealEventForm = z.infer<typeof mealEventSchema>;

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MealEventForm) => void;
  dishes: Dish[];
  defaultDate?: string;
  defaultMealType?: string;
}

const mealTypes = [
  { value: "breakfast", label: "Завтрак", icon: Sunrise, color: "meal-breakfast" },
  { value: "lunch", label: "Обед", icon: Sun, color: "meal-lunch" },
  { value: "dinner", label: "Ужин", icon: Moon, color: "meal-dinner" },
];

export default function AddMealModal({
  isOpen,
  onClose,
  onSave,
  dishes,
  defaultDate,
  defaultMealType,
}: AddMealModalProps) {
  const [selectedMealType, setSelectedMealType] = useState<string>(defaultMealType || "");

  const form = useForm<MealEventForm>({
    resolver: zodResolver(mealEventSchema),
    defaultValues: {
      dishId: "",
      mealType: defaultMealType as any || "breakfast",
      startDate: defaultDate || "",
      endDate: defaultDate || "",
    },
  });

  const handleSubmit = (data: MealEventForm) => {
    onSave(data);
    form.reset();
    setSelectedMealType("");
    onClose();
  };

  const handleClose = () => {
    form.reset();
    setSelectedMealType("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Добавить блюдо</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dishId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Выберите блюдо</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите блюдо" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dishes.map((dish) => (
                        <SelectItem key={dish.id} value={dish.id}>
                          {dish.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип приема пищи</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {mealTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      
                      return (
                        <Button
                          key={type.value}
                          type="button"
                          variant="outline"
                          className={`p-2 h-auto flex-col space-y-1 ${
                            isSelected ? type.color : "bg-gray-50"
                          }`}
                          onClick={() => {
                            field.onChange(type.value);
                            setSelectedMealType(type.value);
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{type.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата начала</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата окончания</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Отмена
              </Button>
              <Button type="submit" className="flex-1">
                Добавить
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
