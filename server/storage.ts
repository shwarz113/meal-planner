import { 
  type Dish, 
  type InsertDish,
  type MealEvent,
  type InsertMealEvent,
  type ShoppingListItem,
  type InsertShoppingListItem 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Dishes
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;

  // Meal Events
  getMealEvents(): Promise<MealEvent[]>;
  getMealEvent(id: string): Promise<MealEvent | undefined>;
  getMealEventsByDateRange(startDate: string, endDate: string): Promise<MealEvent[]>;
  createMealEvent(mealEvent: InsertMealEvent): Promise<MealEvent>;
  updateMealEvent(id: string, mealEvent: Partial<InsertMealEvent>): Promise<MealEvent | undefined>;
  deleteMealEvent(id: string): Promise<boolean>;

  // Shopping List
  getShoppingListItems(): Promise<ShoppingListItem[]>;
  getShoppingListItem(id: string): Promise<ShoppingListItem | undefined>;
  createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem>;
  updateShoppingListItem(id: string, item: Partial<InsertShoppingListItem>): Promise<ShoppingListItem | undefined>;
  deleteShoppingListItem(id: string): Promise<boolean>;
  clearShoppingList(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private dishes: Map<string, Dish>;
  private mealEvents: Map<string, MealEvent>;
  private shoppingListItems: Map<string, ShoppingListItem>;

  constructor() {
    this.dishes = new Map();
    this.mealEvents = new Map();
    this.shoppingListItems = new Map();
    
    // Initialize with some sample dishes
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleDishes: InsertDish[] = [
      {
        name: "Плов",
        description: "Традиционный узбекский плов с рисом и мясом",
        mealType: "dinner",
        ingredients: [
          { name: "Рис", quantity: "300", unit: "г" },
          { name: "Говядина", quantity: "400", unit: "г" },
          { name: "Морковь", quantity: "2", unit: "шт" },
          { name: "Лук", quantity: "1", unit: "шт" },
          { name: "Масло растительное", quantity: "50", unit: "мл" }
        ]
      },
      {
        name: "Борщ",
        description: "Классический украинский борщ",
        mealType: "lunch",
        ingredients: [
          { name: "Свекла", quantity: "2", unit: "шт" },
          { name: "Капуста", quantity: "200", unit: "г" },
          { name: "Морковь", quantity: "1", unit: "шт" },
          { name: "Картофель", quantity: "3", unit: "шт" },
          { name: "Говяжий бульон", quantity: "1", unit: "л" }
        ]
      },
      {
        name: "Овсянка с ягодами",
        description: "Полезная овсяная каша с свежими ягодами",
        mealType: "breakfast",
        ingredients: [
          { name: "Овсяные хлопья", quantity: "100", unit: "г" },
          { name: "Молоко", quantity: "250", unit: "мл" },
          { name: "Ягоды", quantity: "100", unit: "г" },
          { name: "Мед", quantity: "1", unit: "ст.л." }
        ]
      }
    ];

    for (const dish of sampleDishes) {
      await this.createDish(dish);
    }
  }

  // Dishes
  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values());
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { 
      ...insertDish, 
      id,
      description: insertDish.description || null,
      createdAt: new Date()
    };
    this.dishes.set(id, dish);
    return dish;
  }

  async updateDish(id: string, dishUpdate: Partial<InsertDish>): Promise<Dish | undefined> {
    const existing = this.dishes.get(id);
    if (!existing) return undefined;

    const updated: Dish = { ...existing, ...dishUpdate };
    this.dishes.set(id, updated);
    return updated;
  }

  async deleteDish(id: string): Promise<boolean> {
    return this.dishes.delete(id);
  }

  // Meal Events
  async getMealEvents(): Promise<MealEvent[]> {
    return Array.from(this.mealEvents.values());
  }

  async getMealEvent(id: string): Promise<MealEvent | undefined> {
    return this.mealEvents.get(id);
  }

  async getMealEventsByDateRange(startDate: string, endDate: string): Promise<MealEvent[]> {
    return Array.from(this.mealEvents.values()).filter(event => {
      return event.startDate <= endDate && event.endDate >= startDate;
    });
  }

  async createMealEvent(insertMealEvent: InsertMealEvent): Promise<MealEvent> {
    const id = randomUUID();
    const mealEvent: MealEvent = { 
      ...insertMealEvent, 
      id,
      createdAt: new Date()
    };
    this.mealEvents.set(id, mealEvent);
    return mealEvent;
  }

  async updateMealEvent(id: string, mealEventUpdate: Partial<InsertMealEvent>): Promise<MealEvent | undefined> {
    const existing = this.mealEvents.get(id);
    if (!existing) return undefined;

    const updated: MealEvent = { ...existing, ...mealEventUpdate };
    this.mealEvents.set(id, updated);
    return updated;
  }

  async deleteMealEvent(id: string): Promise<boolean> {
    return this.mealEvents.delete(id);
  }

  // Shopping List
  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    return Array.from(this.shoppingListItems.values());
  }

  async getShoppingListItem(id: string): Promise<ShoppingListItem | undefined> {
    return this.shoppingListItems.get(id);
  }

  async createShoppingListItem(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const id = randomUUID();
    const item: ShoppingListItem = { 
      ...insertItem, 
      id,
      isCompleted: insertItem.isCompleted || "false",
      dishName: insertItem.dishName || null,
      plannedDate: insertItem.plannedDate || null,
      createdAt: new Date()
    };
    this.shoppingListItems.set(id, item);
    return item;
  }

  async updateShoppingListItem(id: string, itemUpdate: Partial<InsertShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const existing = this.shoppingListItems.get(id);
    if (!existing) return undefined;

    const updated: ShoppingListItem = { ...existing, ...itemUpdate };
    this.shoppingListItems.set(id, updated);
    return updated;
  }

  async deleteShoppingListItem(id: string): Promise<boolean> {
    return this.shoppingListItems.delete(id);
  }

  async clearShoppingList(): Promise<boolean> {
    this.shoppingListItems.clear();
    return true;
  }
}

export const storage = new MemStorage();
