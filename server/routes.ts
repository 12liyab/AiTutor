import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { extractTextFromFile } from "./lib/textExtractor";
import { generateQuestionsFromText } from "./lib/openai";
import { 
  insertUserSchema, 
  insertDocumentSchema, 
  insertQuestionSchema 
} from "@shared/schema";
import { z } from "zod";

// Set up multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(import.meta.dirname, "..", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only PDF, PNG, and JPG files
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

export async function registerRoutes(app: express.Express): Promise<Server> {
  const httpServer = createServer(app);

  // User Authentication Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't send the password back
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Don't send the password back
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Document Routes
  app.post("/api/documents/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Extract text from the uploaded file
      const filePath = req.file.path;
      const fileType = req.file.mimetype;
      const extractedText = await extractTextFromFile(filePath, fileType);

      // Create document in storage
      const documentData = {
        userId: parseInt(userId),
        name: req.file.originalname,
        fileType: fileType,
        fileSize: req.file.size,
        content: extractedText
      };

      // Validate with schema
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Store document
      const newDocument = await storage.createDocument(validatedData);
      
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to upload document", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/documents/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const documents = await storage.getDocumentsByUserId(userId);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      await storage.deleteDocument(documentId);
      res.status(200).json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Question Routes
  app.post("/api/questions/generate", async (req: Request, res: Response) => {
    try {
      const { documentId, count } = req.body;
      
      if (!documentId) {
        return res.status(400).json({ message: "Document ID is required" });
      }

      const document = await storage.getDocument(parseInt(documentId));
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Generate questions using OpenAI
      const questionsCount = count ? parseInt(count) : 5;
      const generatedQuestions = await generateQuestionsFromText(document.content, questionsCount);
      
      // Save the generated questions
      const questionInserts = generatedQuestions.map(qa => ({
        documentId: parseInt(documentId),
        question: qa.question,
        answer: qa.answer
      }));

      // Delete existing questions for this document before adding new ones
      await storage.deleteQuestionsByDocumentId(parseInt(documentId));
      
      // Create the new questions
      const savedQuestions = await storage.createQuestions(questionInserts);
      
      res.status(201).json(savedQuestions);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate questions", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.get("/api/questions/:documentId", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.documentId);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const questions = await storage.getQuestionsByDocumentId(documentId);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  return httpServer;
}
