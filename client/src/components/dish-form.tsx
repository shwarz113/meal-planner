import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Dish, ingredientSchema } from "@shared/schema";

const dishFormSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner"], {
    required_error: "Выберите тип приема пищи"
  }),
  ingredients: z.array(ingredientSchema).min(1, "Добавьте хотя бы один ингредиент"),
});

type DishFormData = z.infer<typeof dishFormSchema>;

interface DishFormProps {
  dish?: Dish;
  onSave: (data: DishFormData) => void;
  onCancel: () => void;
}

const mealTypeOptions = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
];

export default function DishForm({ dish, onSave, onCancel }: DishFormProps) {
  const form = useForm<DishFormData>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: dish?.name || "",
      description: dish?.description || "",
      mealType: dish?.mealType as any || "breakfast",
      ingredients: dish?.ingredients || [{ name: "", quantity: "", unit: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const handleSubmit = (data: DishFormData) => {
    onSave(data);
  };

  const addIngredient = () => {
    append({ name: "", quantity: "", unit: "" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название блюда</FormLabel>
              <FormControl>
                <Input placeholder="Введите название блюда" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание (необязательно)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Описание блюда"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mealTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Ингредиенты</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-4">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Название</FormLabel>
                          <FormControl>
                            <Input placeholder="Ингредиент" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Количество</FormLabel>
                          <FormControl>
                            <Input placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Единица</FormLabel>
                          <FormControl>
                            <Input placeholder="г" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1">
            {dish ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
