import { MongoClient, ObjectId } from 'mongodb';
import { IStorage } from './storage';
import type { User, InsertUser, Document, InsertDocument, Question, InsertQuestion } from './storage';

// MongoDB connection string should be provided in environment variables
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; 
const dbName = 'aiTutorDb';

// Create a MongoDB client
const client = new MongoClient(uri);

/**
 * MongoDB implementation of the Storage interface
 */
export class MongoStorage implements IStorage {
  private db: any;
  private users: any;
  private documents: any;
  private questions: any;

  private isConnected = false;

  constructor() {
    // Don't wait for connection to complete in constructor
    this.setupConnection().catch(err => {
      console.error('Failed to initialize MongoDB:', err);
    });
  }

  private async setupConnection() {
    try {
      // Set a timeout for connection to avoid hanging
      const connectWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('MongoDB connection timeout after 5000ms')), 5000);
        });
        
        await Promise.race([client.connect(), timeoutPromise]);
      };
      
      await connectWithTimeout();
      console.log('Connected to MongoDB');
      this.db = client.db(dbName);
      this.users = this.db.collection('users');
      this.documents = this.db.collection('documents');
      this.questions = this.db.collection('questions');
      
      // Create indexes
      await this.users.createIndex({ username: 1 }, { unique: true });
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.documents.createIndex({ userId: 1 });
      await this.questions.createIndex({ documentId: 1 });
      
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
    }
  }

  /**
   * Convert MongoDB _id to id in returned objects
   */
  private formatDocument(doc: any): any {
    if (!doc) return undefined;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }

  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.users.findOne({ _id: new ObjectId(id.toString()) });
    return user ? this.formatDocument(user) : undefined;
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.users.findOne({ username });
    return user ? this.formatDocument(user) : undefined;
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.users.findOne({ email });
    return user ? this.formatDocument(user) : undefined;
  }

  /**
   * Create a new user
   */
  async createUser(user: InsertUser): Promise<User> {
    const result = await this.users.insertOne(user);
    return { ...user, id: result.insertedId.toString() };
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: number): Promise<Document | undefined> {
    const document = await this.documents.findOne({ _id: new ObjectId(id.toString()) });
    return document ? this.formatDocument(document) : undefined;
  }

  /**
   * Get all documents for a user
   */
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    const documents = await this.documents.find({ userId: parseInt(userId.toString()) }).toArray();
    return documents.map(this.formatDocument);
  }

  /**
   * Create a new document
   */
  async createDocument(document: InsertDocument): Promise<Document> {
    const now = new Date();
    const documentWithDate = { ...document, uploadDate: now };
    const result = await this.documents.insertOne(documentWithDate);
    return { ...documentWithDate, id: result.insertedId.toString() };
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: number): Promise<boolean> {
    // First delete all associated questions
    await this.deleteQuestionsByDocumentId(id);
    
    // Then delete the document
    const result = await this.documents.deleteOne({ _id: new ObjectId(id.toString()) });
    return result.deletedCount > 0;
  }

  /**
   * Get a question by ID
   */
  async getQuestion(id: number): Promise<Question | undefined> {
    const question = await this.questions.findOne({ _id: new ObjectId(id.toString()) });
    return question ? this.formatDocument(question) : undefined;
  }

  /**
   * Get all questions for a document
   */
  async getQuestionsByDocumentId(documentId: number): Promise<Question[]> {
    const questions = await this.questions.find({ documentId: parseInt(documentId.toString()) }).toArray();
    return questions.map(this.formatDocument);
  }

  /**
   * Create a new question
   */
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const now = new Date();
    const questionWithDate = { ...question, createdAt: now };
    const result = await this.questions.insertOne(questionWithDate);
    return { ...questionWithDate, id: result.insertedId.toString() };
  }

  /**
   * Create multiple questions
   */
  async createQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    if (questions.length === 0) return [];
    
    const now = new Date();
    const questionsWithDate = questions.map(q => ({ ...q, createdAt: now }));
    
    const result = await this.questions.insertMany(questionsWithDate);
    
    return Object.keys(result.insertedIds).map(index => {
      const id = result.insertedIds[parseInt(index)].toString();
      return { ...questionsWithDate[parseInt(index)], id };
    });
  }

  /**
   * Delete all questions for a document
   */
  async deleteQuestionsByDocumentId(documentId: number): Promise<boolean> {
    const result = await this.questions.deleteMany({ documentId: parseInt(documentId.toString()) });
    return result.deletedCount > 0;
  }
}

// Export an instance of the MongoDB storage
export const mongoStorage = new MongoStorage();