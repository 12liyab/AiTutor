import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { IStorage } from './storage';
import type { User, Document, Question, InsertUser, InsertDocument, InsertQuestion } from './storage';

// Create a database client
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * PostgreSQL implementation of the Storage interface
 */
export class PostgresStorage implements IStorage {
  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users[0];
  }

  /**
   * Create a new user
   */
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: number): Promise<Document | undefined> {
    const documents = await db.select().from(schema.documents).where(eq(schema.documents.id, id));
    return documents[0];
  }

  /**
   * Get all documents for a user
   */
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return db.select().from(schema.documents).where(eq(schema.documents.userId, userId));
  }

  /**
   * Create a new document
   */
  async createDocument(document: InsertDocument): Promise<Document> {
    const result = await db.insert(schema.documents).values(document).returning();
    return result[0];
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: number): Promise<boolean> {
    // First delete all associated questions
    await this.deleteQuestionsByDocumentId(id);
    
    // Then delete the document
    const result = await db.delete(schema.documents).where(eq(schema.documents.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Get a question by ID
   */
  async getQuestion(id: number): Promise<Question | undefined> {
    const questions = await db.select().from(schema.questions).where(eq(schema.questions.id, id));
    return questions[0];
  }

  /**
   * Get all questions for a document
   */
  async getQuestionsByDocumentId(documentId: number): Promise<Question[]> {
    return db.select().from(schema.questions).where(eq(schema.questions.documentId, documentId));
  }

  /**
   * Create a new question
   */
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const result = await db.insert(schema.questions).values(question).returning();
    return result[0];
  }

  /**
   * Create multiple questions
   */
  async createQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    if (questions.length === 0) return [];
    const result = await db.insert(schema.questions).values(questions).returning();
    return result;
  }

  /**
   * Delete all questions for a document
   */
  async deleteQuestionsByDocumentId(documentId: number): Promise<boolean> {
    const result = await db.delete(schema.questions)
      .where(eq(schema.questions.documentId, documentId))
      .returning();
    return true;
  }
}

// Export an instance of the PostgreSQL storage
export const dbStorage = new PostgresStorage();