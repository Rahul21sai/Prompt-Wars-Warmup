/**
 * Firebase Firestore Service
 * Handles saving, loading, and sharing itineraries via Firebase Firestore.
 * Uses the Firebase JavaScript SDK (v9+ modular imports).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type { ParsedItinerary } from './geminiService';
import { getConfig } from '../utils/config';

/**
 * Gets Firebase configuration from runtime config.
 * Uses getConfig() which supports both build-time and runtime injection.
 */
function getFirebaseConfig() {
  const config = getConfig();
  return {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
    appId: config.FIREBASE_APP_ID,
  };
}

/** Lazily initialized Firestore instance */
let db: Firestore | null = null;

/**
 * Initializes or returns the Firebase Firestore instance.
 * Uses singleton pattern to avoid multiple initializations.
 * @returns Firestore instance
 */
function getDb(): Firestore {
  if (db) return db;

  const app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApp();
  db = getFirestore(app);
  return db;
}

/** Structure of a saved itinerary document in Firestore */
export interface SavedItinerary {
  id: string;
  destination: string;
  itinerary: ParsedItinerary;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Saves an itinerary to Firestore.
 * Generates a unique UUID for the document ID.
 * @param itinerary - The parsed itinerary to save
 * @param destination - The travel destination
 * @param preferences - User's travel preferences
 * @returns The generated document ID for sharing
 */
export async function saveItinerary(
  itinerary: ParsedItinerary,
  destination: string,
  preferences: Record<string, unknown>
): Promise<string> {
  const firestore = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  const document: SavedItinerary = {
    id,
    destination,
    itinerary,
    preferences,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(collection(firestore, 'itineraries'), id), document);

  return id;
}

/**
 * Loads a saved itinerary from Firestore by document ID.
 * Used when loading a shared trip URL with ?id=xxx parameter.
 * @param id - Firestore document ID
 * @returns The saved itinerary or null if not found
 */
export async function loadItinerary(id: string): Promise<SavedItinerary | null> {
  const firestore = getDb();

  const docRef = doc(collection(firestore, 'itineraries'), id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return docSnap.data() as SavedItinerary;
}

/**
 * Generates a shareable URL for a saved itinerary.
 * @param docId - The Firestore document ID
 * @returns Full URL with the itinerary ID as a query parameter
 */
export function getShareableUrl(docId: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?id=${docId}`;
}
