import "dotenv/config";
import { 
  type Dish, 
  type InsertDish,
  type MealEvent,
  type InsertMealEvent,
  type ShoppingListItem,
  type InsertShoppingListItem,
  dishes,
  mealEvents,
  shoppingListItems
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, lte, gte } from "drizzle-orm";

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
      ingredients: insertDish.ingredients || [],
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

export class PgStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for PgStorage");
    }
    const connectionString = process.env.DATABASE_URL;

    // Determine SSL usage:
    // - Force SSL for any non-local host unless explicitly disabled via sslmode=disable or PGSSLMODE=disable
    // - Always respect explicit sslmode in the URL
    // - Keep special handling for common serverless providers
    let useSSL = /sslmode=require/.test(connectionString) || /supabase|neon\.tech/.test(connectionString);
    try {
      const parsed = new URL(connectionString);
      const host = parsed.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      const sslModeParam = parsed.searchParams.get("sslmode");
      const envSslMode = process.env.PGSSLMODE;
      const explicitlyDisabled = sslModeParam === "disable" || envSslMode === "disable";

      if (!isLocal && !explicitlyDisabled) {
        useSSL = true;
      }
    } catch {
      // If URL parsing fails, fall back to previous detection
    }

    const pool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    this.db = drizzle(pool);
  }

  // Dishes
  async getDishes(): Promise<Dish[]> {
    return await this.db.select().from(dishes);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const result = await this.db.select().from(dishes).where(eq(dishes.id, id));
    return result[0];
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const result = await this.db.insert(dishes).values(insertDish).returning();
    return result[0];
  }

  async updateDish(id: string, dishUpdate: Partial<InsertDish>): Promise<Dish | undefined> {
    const result = await this.db
      .update(dishes)
      .set(dishUpdate)
      .where(eq(dishes.id, id))
      .returning();
    return result[0];
  }

  async deleteDish(id: string): Promise<boolean> {
    const result = await this.db.delete(dishes).where(eq(dishes.id, id)).returning();
    return result.length > 0;
  }

  // Meal Events
  async getMealEvents(): Promise<MealEvent[]> {
    return await this.db.select().from(mealEvents);
  }

  async getMealEvent(id: string): Promise<MealEvent | undefined> {
    const result = await this.db.select().from(mealEvents).where(eq(mealEvents.id, id));
    return result[0];
  }

  async getMealEventsByDateRange(startDate: string, endDate: string): Promise<MealEvent[]> {
    return await this.db
      .select()
      .from(mealEvents)
      .where(and(
        lte(mealEvents.startDate, endDate),
        gte(mealEvents.endDate, startDate)
      ));
  }

  async createMealEvent(insertMealEvent: InsertMealEvent): Promise<MealEvent> {
    const result = await this.db.insert(mealEvents).values(insertMealEvent).returning();
    return result[0];
  }

  async updateMealEvent(id: string, mealEventUpdate: Partial<InsertMealEvent>): Promise<MealEvent | undefined> {
    const result = await this.db
      .update(mealEvents)
      .set(mealEventUpdate)
      .where(eq(mealEvents.id, id))
      .returning();
    return result[0];
  }

  async deleteMealEvent(id: string): Promise<boolean> {
    const result = await this.db.delete(mealEvents).where(eq(mealEvents.id, id)).returning();
    return result.length > 0;
  }

  // Shopping List
  async getShoppingListItems(): Promise<ShoppingListItem[]> {
    return await this.db.select().from(shoppingListItems);
  }

  async getShoppingListItem(id: string): Promise<ShoppingListItem | undefined> {
    const result = await this.db.select().from(shoppingListItems).where(eq(shoppingListItems.id, id));
    return result[0];
  }

  async createShoppingListItem(insertItem: InsertShoppingListItem): Promise<ShoppingListItem> {
    const result = await this.db.insert(shoppingListItems).values(insertItem).returning();
    return result[0];
  }

  async updateShoppingListItem(id: string, itemUpdate: Partial<InsertShoppingListItem>): Promise<ShoppingListItem | undefined> {
    const result = await this.db
      .update(shoppingListItems)
      .set(itemUpdate)
      .where(eq(shoppingListItems.id, id))
      .returning();
    return result[0];
  }

  async deleteShoppingListItem(id: string): Promise<boolean> {
    const result = await this.db.delete(shoppingListItems).where(eq(shoppingListItems.id, id)).returning();
    return result.length > 0;
  }

  async clearShoppingList(): Promise<boolean> {
    await this.db.delete(shoppingListItems);
    return true;
  }
}

// Choose storage based on environment
export const storage = process.env.DATABASE_URL 
  ? (() => {
      console.log("Using PostgreSQL storage with DATABASE_URL");
      return new PgStorage();
    })()
  : (() => {
      console.log("Using in-memory storage (no DATABASE_URL provided)");
      return new MemStorage();
    })();
