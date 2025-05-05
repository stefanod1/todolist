import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'todos';

export const todoService = {
  // Create a new todo
  async createTodo(text: string): Promise<Todo> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      text,
      completed: false,
      createdAt: Timestamp.now()
    });
    
    return {
      id: docRef.id,
      text,
      completed: false,
      createdAt: Timestamp.now()
    };
  },

  // Get all todos
  async getTodos(): Promise<Todo[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Todo));
  },

  // Update a todo
  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const todoRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(todoRef, updates);
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<void> {
    const todoRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(todoRef);
  }
}; 