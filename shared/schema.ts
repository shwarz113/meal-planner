import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dishes = pgTable("dishes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  ingredients: jsonb("ingredients").notNull().default([]), // array of ingredient objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const mealEvents = pgTable("meal_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dishId: varchar("dish_id").notNull(),
  startDate: text("start_date").notNull(), // ISO date string
  endDate: text("end_date").notNull(), // ISO date string
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner
  createdAt: timestamp("created_at").defaultNow(),
});

export const shoppingListItems = pgTable("shopping_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  isCompleted: text("is_completed").notNull().default("false"), // stored as string for simplicity
  dishName: text("dish_name"), // optional field to group by dish
  plannedDate: text("planned_date"), // ISO date string for sorting by planned date
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  createdAt: true,
}).extend({
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string(),
  })).default([]),
});

export const insertMealEventSchema = createInsertSchema(mealEvents).omit({
  id: true,
  createdAt: true,
});

export const insertShoppingListItemSchema = createInsertSchema(shoppingListItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertDish = z.infer<typeof insertDishSchema>;
export type Dish = typeof dishes.$inferSelect;

export type InsertMealEvent = z.infer<typeof insertMealEventSchema>;
export type MealEvent = typeof mealEvents.$inferSelect;

export type InsertShoppingListItem = z.infer<typeof insertShoppingListItemSchema>;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;

// Ingredient type for dish ingredients
export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
