import { 
  User, InsertUser, 
  Document, InsertDocument,
  Question, InsertQuestion 
} from "@shared/schema";

// Export these types for use in other modules
export type { User, InsertUser, Document, InsertDocument, Question, InsertQuestion };

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Question methods
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByDocumentId(documentId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  deleteQuestionsByDocumentId(documentId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private questions: Map<number, Question>;
  
  private userId: number;
  private documentId: number;
  private questionId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.questions = new Map();
    
    this.userId = 1;
    this.documentId = 1;
    this.questionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...insertUser, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const now = new Date();
    const newDocument: Document = {
      ...insertDocument,
      id,
      uploadDate: now
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    // Delete associated questions first
    await this.deleteQuestionsByDocumentId(id);
    return this.documents.delete(id);
  }

  // Question methods
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByDocumentId(documentId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.documentId === documentId
    );
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const now = new Date();
    const newQuestion: Question = {
      ...insertQuestion,
      id,
      createdAt: now
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async createQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    const questions: Question[] = [];
    for (const question of insertQuestions) {
      questions.push(await this.createQuestion(question));
    }
    return questions;
  }

  async deleteQuestionsByDocumentId(documentId: number): Promise<boolean> {
    const questionsToDelete = Array.from(this.questions.values())
      .filter(q => q.documentId === documentId);
    
    for (const question of questionsToDelete) {
      this.questions.delete(question.id);
    }
    
    return true;
  }
}

// Import MongoDB storage implementation (commented out for now)
// import { mongoStorage } from './db-mongo';

// Create in-memory storage instance
const memStorage = new MemStorage();

// For now, use in-memory storage to ensure the app works
// When MongoDB is properly configured, uncomment the mongoDB import and 
// change this to mongoStorage
const storage: IStorage = memStorage;
console.log('Using in-memory storage');

export { storage };
