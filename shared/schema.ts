import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  licenseNumber: text("license_number"),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  classification: text("classification").notNull(),
  alertLevel: text("alert_level").notNull(), // HIGH_ALERT, ELDER_ALERT, STANDARD
  category: text("category"),
  indications: text("indications").notNull(),
  contraindications: text("contraindications").notNull(),
  adultDosage: text("adult_dosage").notNull(),
  pediatricDosage: text("pediatric_dosage"),
  routeOfAdministration: text("route_of_administration"),
  onsetDuration: text("onset_duration"),
  specialConsiderations: text("special_considerations"),
  sideEffects: text("side_effects"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  medicationId: integer("medication_id").references(() => medications.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  alertLevel: z.enum(["HIGH_ALERT", "ELDER_ALERT", "STANDARD"]),
  category: z.enum(["analgesics", "cardiac", "respiratory", "neurological", "endocrine"]).optional(),
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
