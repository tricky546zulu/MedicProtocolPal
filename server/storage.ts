import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, medications, userFavorites, type User, type InsertUser, type Medication, type InsertMedication, type UserFavorite, type InsertUserFavorite } from "@shared/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Medications
  getMedications(filters?: {
    search?: string;
    alertLevel?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<boolean>;
  
  // Favorites
  getUserFavorites(userId: number): Promise<Medication[]>;
  addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFavorite(userId: number, medicationId: number): Promise<boolean>;
  isFavorite(userId: number, medicationId: number): Promise<boolean>;
}

// Database instance
let db: ReturnType<typeof drizzle> | null = null;
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return db;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not provided");
    }
    
    console.log("Attempting to connect to Supabase database...");
    
    // Configure postgres client for Supabase
    const client = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1, // Single connection for transaction pooler
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    db = drizzle(client);
    
    // Test the connection
    console.log("Testing database connection...");
    await db.select().from(users).limit(1);
    console.log("✅ Supabase database connection successful");
    dbInitialized = true;
    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("Check that your DATABASE_URL has the correct password and format");
    db = null;
    dbInitialized = true;
    return null;
  }
}

export class PostgresStorage implements IStorage {
  private async getDb() {
    const database = await initializeDatabase();
    if (!database) {
      throw new Error("Database not available");
    }
    return database;
  }

  async getUser(id: number): Promise<User | undefined> {
    const database = await this.getDb();
    const result = await database.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      licenseNumber: insertUser.licenseNumber ?? null,
      role: insertUser.role ?? "user"
    };
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async getMedications(filters?: {
    search?: string;
    alertLevel?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Medication[]> {
    let query = db.select().from(medications);
    
    const conditions = [];
    
    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(medications.name, searchPattern),
          ilike(medications.indications, searchPattern),
          ilike(medications.contraindications, searchPattern),
          ilike(medications.classification, searchPattern)
        )
      );
    }

    if (filters?.alertLevel) {
      conditions.push(eq(medications.alertLevel, filters.alertLevel));
    }

    if (filters?.category) {
      conditions.push(eq(medications.category, filters.category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return await query.offset(offset).limit(limit).orderBy(medications.name);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const result = await db.select().from(medications).where(eq(medications.id, id)).limit(1);
    return result[0];
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const medicationData = {
      ...insertMedication,
      category: insertMedication.category ?? null,
      pediatricDosage: insertMedication.pediatricDosage ?? null,
      routeOfAdministration: insertMedication.routeOfAdministration ?? null,
      onsetDuration: insertMedication.onsetDuration ?? null,
      specialConsiderations: insertMedication.specialConsiderations ?? null,
      sideEffects: insertMedication.sideEffects ?? null,
      createdBy: insertMedication.createdBy ?? null
    };
    const result = await db.insert(medications).values(medicationData).returning();
    return result[0];
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const updateData = {
      ...updates,
      category: updates.category ?? null,
      pediatricDosage: updates.pediatricDosage ?? null,
      routeOfAdministration: updates.routeOfAdministration ?? null,
      onsetDuration: updates.onsetDuration ?? null,
      specialConsiderations: updates.specialConsiderations ?? null,
      sideEffects: updates.sideEffects ?? null,
      createdBy: updates.createdBy ?? null,
      updatedAt: new Date()
    };
    
    const result = await db.update(medications)
      .set(updateData)
      .where(eq(medications.id, id))
      .returning();
    return result[0];
  }

  async deleteMedication(id: number): Promise<boolean> {
    const result = await db.delete(medications).where(eq(medications.id, id)).returning();
    return result.length > 0;
  }

  async getUserFavorites(userId: number): Promise<Medication[]> {
    const result = await db
      .select({
        id: medications.id,
        name: medications.name,
        classification: medications.classification,
        alertLevel: medications.alertLevel,
        category: medications.category,
        indications: medications.indications,
        contraindications: medications.contraindications,
        adultDosage: medications.adultDosage,
        pediatricDosage: medications.pediatricDosage,
        routeOfAdministration: medications.routeOfAdministration,
        onsetDuration: medications.onsetDuration,
        specialConsiderations: medications.specialConsiderations,
        sideEffects: medications.sideEffects,
        createdBy: medications.createdBy,
        createdAt: medications.createdAt,
        updatedAt: medications.updatedAt
      })
      .from(userFavorites)
      .innerJoin(medications, eq(userFavorites.medicationId, medications.id))
      .where(eq(userFavorites.userId, userId));
    
    return result;
  }

  async addFavorite(insertFavorite: InsertUserFavorite): Promise<UserFavorite> {
    const result = await db.insert(userFavorites).values(insertFavorite).returning();
    return result[0];
  }

  async removeFavorite(userId: number, medicationId: number): Promise<boolean> {
    const result = await db.delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.medicationId, medicationId)
      ))
      .returning();
    return result.length > 0;
  }

  async isFavorite(userId: number, medicationId: number): Promise<boolean> {
    const result = await db.select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.medicationId, medicationId)
      ))
      .limit(1);
    return result.length > 0;
  }
}

// Fallback in-memory storage for development/testing
class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private medications: Map<number, Medication> = new Map();
  private userFavorites: Map<string, UserFavorite> = new Map();
  private currentUserId = 1;
  private currentMedicationId = 1;
  private currentFavoriteId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      licenseNumber: insertUser.licenseNumber ?? null,
      role: insertUser.role ?? "user",
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getMedications(filters?: {
    search?: string;
    alertLevel?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Medication[]> {
    let results = Array.from(this.medications.values());

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(med => 
        med.name.toLowerCase().includes(searchLower) ||
        med.indications.toLowerCase().includes(searchLower) ||
        med.contraindications.toLowerCase().includes(searchLower) ||
        med.classification.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.alertLevel) {
      results = results.filter(med => med.alertLevel === filters.alertLevel);
    }

    if (filters?.category) {
      results = results.filter(med => med.category === filters.category);
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return results.slice(offset, offset + limit);
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async createMedication(insertMedication: InsertMedication): Promise<Medication> {
    const medication: Medication = {
      ...insertMedication,
      id: this.currentMedicationId++,
      category: insertMedication.category ?? null,
      pediatricDosage: insertMedication.pediatricDosage ?? null,
      routeOfAdministration: insertMedication.routeOfAdministration ?? null,
      onsetDuration: insertMedication.onsetDuration ?? null,
      specialConsiderations: insertMedication.specialConsiderations ?? null,
      sideEffects: insertMedication.sideEffects ?? null,
      createdBy: insertMedication.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medications.set(medication.id, medication);
    return medication;
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | undefined> {
    const existing = this.medications.get(id);
    if (!existing) return undefined;

    const updated: Medication = {
      ...existing,
      ...updates,
      category: updates.category ?? existing.category,
      pediatricDosage: updates.pediatricDosage ?? existing.pediatricDosage,
      routeOfAdministration: updates.routeOfAdministration ?? existing.routeOfAdministration,
      onsetDuration: updates.onsetDuration ?? existing.onsetDuration,
      specialConsiderations: updates.specialConsiderations ?? existing.specialConsiderations,
      sideEffects: updates.sideEffects ?? existing.sideEffects,
      createdBy: updates.createdBy ?? existing.createdBy,
      updatedAt: new Date(),
    };
    this.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<boolean> {
    return this.medications.delete(id);
  }

  async getUserFavorites(userId: number): Promise<Medication[]> {
    const favorites = Array.from(this.userFavorites.values())
      .filter(fav => fav.userId === userId);
    
    return favorites
      .map(fav => this.medications.get(fav.medicationId))
      .filter(med => med !== undefined) as Medication[];
  }

  async addFavorite(insertFavorite: InsertUserFavorite): Promise<UserFavorite> {
    const favorite: UserFavorite = {
      ...insertFavorite,
      id: this.currentFavoriteId++,
      createdAt: new Date(),
    };
    this.userFavorites.set(`${insertFavorite.userId}-${insertFavorite.medicationId}`, favorite);
    return favorite;
  }

  async removeFavorite(userId: number, medicationId: number): Promise<boolean> {
    return this.userFavorites.delete(`${userId}-${medicationId}`);
  }

  async isFavorite(userId: number, medicationId: number): Promise<boolean> {
    return this.userFavorites.has(`${userId}-${medicationId}`);
  }

  // Initialize with sample Saskatchewan EMS protocol medications
  async initializeSampleData() {
    if (this.medications.size > 0) return; // Already initialized
    
    const sampleMedications = [
      {
        name: "EPINEPHrine/Adrenalin",
        classification: "Sympathomimetic",
        alertLevel: "HIGH_ALERT" as const,
        category: "cardiac" as const,
        indications: "Anaphylaxis, Severe asthma/bronchospasm, Cardiac arrest (VF/pVT, Asystole, PEA), Symptomatic bradycardia",
        contraindications: "None in life-threatening situations. Relative: Hypertension, coronary artery disease, cerebrovascular disease",
        adultDosage: "Anaphylaxis: 0.3-0.5 mg IM (1:1000). Cardiac arrest: 1 mg IV/IO q3-5min. Severe asthma: 0.3-0.5 mg IM",
        pediatricDosage: "Anaphylaxis: 0.01 mg/kg IM (max 0.5 mg). Cardiac arrest: 0.01 mg/kg IV/IO q3-5min",
        routeOfAdministration: "IV, IO, IM, Endotracheal",
        onsetDuration: "IV: 1-2 min onset, 5-10 min duration. IM: 5-10 min onset, 10-30 min duration",
        specialConsiderations: "HIGH ALERT medication. Double-check concentration and dose. Monitor for arrhythmias.",
        sideEffects: "Tachycardia, hypertension, anxiety, tremor, headache, pulmonary edema"
      },
      {
        name: "Morphine",
        classification: "Opioid Analgesic",
        alertLevel: "HIGH_ALERT" as const,
        category: "analgesics" as const,
        indications: "Moderate to severe pain, Acute myocardial infarction, Acute pulmonary edema",
        contraindications: "Respiratory depression, Head injury with altered LOC, Hypotension, Known allergy",
        adultDosage: "2-4 mg IV q5-10min PRN pain. Max 10 mg in 1 hour. Titrate to effect.",
        pediatricDosage: "0.1 mg/kg IV q5-10min PRN. Max 0.2 mg/kg total dose",
        routeOfAdministration: "IV, IO, IM",
        onsetDuration: "IV: 2-5 min onset, 3-4 hr duration. IM: 15-30 min onset, 4-6 hr duration",
        specialConsiderations: "HIGH ALERT medication. Monitor respiratory status. Have naloxone readily available.",
        sideEffects: "Respiratory depression, hypotension, nausea, vomiting, constipation, sedation"
      },
      {
        name: "DimenhyDRINATE/Gravol",
        classification: "Antihistamine/Antiemetic",
        alertLevel: "ELDER_ALERT" as const,
        category: "neurological" as const,
        indications: "Nausea and vomiting, Motion sickness, Vertigo",
        contraindications: "Known hypersensitivity, Narrow-angle glaucoma, Severe liver disease",
        adultDosage: "25-50 mg IV/IM q4-6h PRN. Max 300 mg/24h",
        pediatricDosage: "1-1.25 mg/kg IV/IM q6h PRN. Max 75 mg/dose",
        routeOfAdministration: "IV, IM, PO",
        onsetDuration: "IV: 15-30 min onset, 4-6 hr duration. IM: 30-60 min onset",
        specialConsiderations: "ELDER ALERT: Increased risk of anticholinergic effects in elderly. Use lower doses and monitor closely.",
        sideEffects: "Drowsiness, dry mouth, blurred vision, constipation, urinary retention"
      },
      {
        name: "Salbutamol/Albuterol/Ventolin",
        classification: "Beta-2 Agonist Bronchodilator",
        alertLevel: "STANDARD" as const,
        category: "respiratory" as const,
        indications: "Bronchospasm, Asthma, COPD exacerbation, Hyperkalemia",
        contraindications: "Known hypersensitivity to salbutamol",
        adultDosage: "2.5-5 mg nebulized q20min PRN. MDI: 4-8 puffs q20min PRN",
        pediatricDosage: "2.5 mg nebulized q20min PRN if >20kg. MDI: 4-8 puffs with spacer",
        routeOfAdministration: "Inhalation (nebulizer, MDI)",
        onsetDuration: "Onset: 5-15 min, Peak: 30-60 min, Duration: 4-6 hr",
        specialConsiderations: "Monitor for tachycardia and tremor. Use spacer device for MDI in children.",
        sideEffects: "Tachycardia, tremor, nervousness, headache, muscle cramps"
      },
      {
        name: "Naloxone/Narcan",
        classification: "Opioid Antagonist",
        alertLevel: "HIGH_ALERT" as const,
        category: "neurological" as const,
        indications: "Opioid overdose with respiratory depression, Coma of unknown origin",
        contraindications: "Known hypersensitivity to naloxone",
        adultDosage: "0.4-2 mg IV/IM/IN q2-3min. Titrate to adequate respirations. Max 10 mg",
        pediatricDosage: "0.01 mg/kg IV/IM/IN q2-3min. Max 0.4 mg/dose",
        routeOfAdministration: "IV, IM, IO, Intranasal, Endotracheal",
        onsetDuration: "IV: 1-2 min onset, 30-60 min duration. IM/IN: 2-5 min onset",
        specialConsiderations: "HIGH ALERT: May precipitate withdrawal in opioid-dependent patients. Short duration - repeat dosing may be needed.",
        sideEffects: "Withdrawal symptoms, nausea, vomiting, tachycardia, hypertension"
      }
    ];

    for (const med of sampleMedications) {
      await this.createMedication(med);
    }
  }
}

// Try to use PostgreSQL, fall back to in-memory storage
let storage: IStorage;

async function initializeStorage() {
  try {
    if (process.env.DATABASE_URL) {
      const dbConnection = await initializeDatabase();
      if (dbConnection) {
        storage = new PostgresStorage();
        console.log("✅ Using PostgreSQL database");
        return;
      }
    }
    throw new Error("No database connection available");
  } catch (error) {
    console.warn("⚠️ Falling back to in-memory storage:", error.message);
    const memStorage = new MemStorage();
    await memStorage.initializeSampleData();
    storage = memStorage;
    console.log("✅ Initialized in-memory storage with sample Saskatchewan EMS medication data");
  }
}

// Initialize storage immediately
initializeStorage().catch(console.error);

// Export storage (will be set by initializeStorage)
const getStorage = (): IStorage => {
  if (!storage) {
    // Fallback synchronous initialization
    const memStorage = new MemStorage();
    storage = memStorage;
    // Initialize sample data asynchronously
    memStorage.initializeSampleData().catch(console.error);
  }
  return storage;
};

export { getStorage as storage };
