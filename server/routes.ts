import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMedicationSchema, insertUserFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const storageInstance = storage();
      const existingUser = await storageInstance.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storageInstance.createUser(userData);
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const storageInstance = storage();
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Medication routes
  app.get("/api/medications", async (req, res) => {
    try {
      const { search, alertLevel, category, limit, offset } = req.query;
      
      const filters = {
        search: search as string,
        alertLevel: alertLevel as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      
      const storageInstance = storage();
      const medications = await storageInstance.getMedications(filters);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications", error });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storageInstance = storage();
      const medication = await storageInstance.getMedication(id);
      
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medication", error });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const medicationData = insertMedicationSchema.parse(req.body);
      const storageInstance = storage();
      const medication = await storageInstance.createMedication(medicationData);
      res.status(201).json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data", error });
    }
  });

  app.put("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertMedicationSchema.partial().parse(req.body);
      
      const storageInstance = storage();
      const medication = await storageInstance.updateMedication(id, updates);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data", error });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storageInstance = storage();
      const deleted = await storageInstance.deleteMedication(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Medication not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medication", error });
    }
  });

  // Favorites routes
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const storageInstance = storage();
      const favorites = await storageInstance.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites", error });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const favoriteData = insertUserFavoriteSchema.parse(req.body);
      const storageInstance = storage();
      const favorite = await storageInstance.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data", error });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const { userId, medicationId } = req.body;
      
      if (!userId || !medicationId) {
        return res.status(400).json({ message: "userId and medicationId are required" });
      }
      
      const storageInstance = storage();
      const removed = await storageInstance.removeFavorite(parseInt(userId), parseInt(medicationId));
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite", error });
    }
  });

  app.get("/api/favorites/check", async (req, res) => {
    try {
      const { userId, medicationId } = req.query;
      
      if (!userId || !medicationId) {
        return res.status(400).json({ message: "userId and medicationId are required" });
      }
      
      const storageInstance = storage();
      const isFavorite = await storageInstance.isFavorite(parseInt(userId as string), parseInt(medicationId as string));
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}