import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDishSchema, insertMealEventSchema, insertShoppingListItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dishes routes
  app.get("/api/dishes", async (req, res) => {
    const dishes = await storage.getDishes();
    res.json(dishes);
  });

  app.get("/api/dishes/:id", async (req, res) => {
    const dish = await storage.getDish(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: "Блюдо не найдено" });
    }
    res.json(dish);
  });

  app.post("/api/dishes", async (req, res) => {
    try {
      const dishData = insertDishSchema.parse(req.body);
      const dish = await storage.createDish(dishData);
      res.status(201).json(dish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.patch("/api/dishes/:id", async (req, res) => {
    try {
      const dishData = insertDishSchema.partial().parse(req.body);
      const dish = await storage.updateDish(req.params.id, dishData);
      if (!dish) {
        return res.status(404).json({ message: "Блюдо не найдено" });
      }
      res.json(dish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.delete("/api/dishes/:id", async (req, res) => {
    const success = await storage.deleteDish(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Блюдо не найдено" });
    }
    res.status(204).send();
  });

  // Meal Events routes
  app.get("/api/meal-events", async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
      const events = await storage.getMealEventsByDateRange(
        startDate as string, 
        endDate as string
      );
      res.json(events);
    } else {
      const events = await storage.getMealEvents();
      res.json(events);
    }
  });

  app.get("/api/meal-events/:id", async (req, res) => {
    const event = await storage.getMealEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "События питания не найдено" });
    }
    res.json(event);
  });

  app.post("/api/meal-events", async (req, res) => {
    try {
      const eventData = insertMealEventSchema.parse(req.body);
      const event = await storage.createMealEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.patch("/api/meal-events/:id", async (req, res) => {
    try {
      const eventData = insertMealEventSchema.partial().parse(req.body);
      const event = await storage.updateMealEvent(req.params.id, eventData);
      if (!event) {
        return res.status(404).json({ message: "События питания не найдено" });
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.delete("/api/meal-events/:id", async (req, res) => {
    const success = await storage.deleteMealEvent(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "События питания не найдено" });
    }
    res.status(204).send();
  });

  // Shopping List routes
  app.get("/api/shopping-list", async (req, res) => {
    const items = await storage.getShoppingListItems();
    res.json(items);
  });

  app.post("/api/shopping-list", async (req, res) => {
    try {
      const itemData = insertShoppingListItemSchema.parse(req.body);
      const item = await storage.createShoppingListItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.patch("/api/shopping-list/:id", async (req, res) => {
    try {
      const itemData = insertShoppingListItemSchema.partial().parse(req.body);
      const item = await storage.updateShoppingListItem(req.params.id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Элемент списка не найден" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  app.delete("/api/shopping-list/:id", async (req, res) => {
    const success = await storage.deleteShoppingListItem(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Элемент списка не найден" });
    }
    res.status(204).send();
  });

  app.delete("/api/shopping-list", async (req, res) => {
    await storage.clearShoppingList();
    res.status(204).send();
  });

  // Generate shopping list from meal events
  app.post("/api/shopping-list/generate", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Необходимо указать даты начала и окончания" });
      }

      // Get meal events in date range
      const mealEvents = await storage.getMealEventsByDateRange(startDate, endDate);
      
      // Clear existing shopping list
      await storage.clearShoppingList();
      
      // Group ingredients by dish with earliest planned date
      const dishIngredients = new Map<string, { dishName: string, ingredients: any[], earliestDate: string }>();
      
      for (const event of mealEvents) {
        const dish = await storage.getDish(event.dishId);
        if (dish && dish.ingredients) {
          if (!dishIngredients.has(dish.id)) {
            dishIngredients.set(dish.id, {
              dishName: dish.name,
              ingredients: [],
              earliestDate: event.startDate
            });
          }
          
          const dishData = dishIngredients.get(dish.id)!;
          
          // Update earliest date if this event is earlier
          if (event.startDate < dishData.earliestDate) {
            dishData.earliestDate = event.startDate;
          }
          
          for (const ingredient of dish.ingredients as any[]) {
            const existingIngredient = dishData.ingredients.find(ing => 
              ing.name === ingredient.name && ing.unit === ingredient.unit
            );
            
            if (existingIngredient) {
              existingIngredient.quantity = (parseFloat(existingIngredient.quantity) + parseFloat(ingredient.quantity)).toString();
            } else {
              dishData.ingredients.push({ ...ingredient });
            }
          }
        }
      }
      
      // Create shopping list items with dish information and planned date
      const items = [];
      for (const [dishId, dishData] of Array.from(dishIngredients.entries())) {
        for (const ingredient of dishData.ingredients) {
          const item = await storage.createShoppingListItem({
            name: ingredient.name,
            quantity: ingredient.quantity.toString(),
            unit: ingredient.unit,
            isCompleted: "false",
            dishName: dishData.dishName,
            plannedDate: dishData.earliestDate // Add planned date for sorting
          });
          items.push(item);
        }
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Ошибка генерации списка покупок" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
