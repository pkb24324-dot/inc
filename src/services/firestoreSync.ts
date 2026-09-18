import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirebaseConnection } from '../firebase';
import { UserAccount, Transaction, UserInvestment, SystemSettings } from '../types';

export { testFirebaseConnection };

/**
 * Seeds initial mock data into Firestore if collections are empty.
 */
export async function seedInitialDataIfEmpty(
  initialUsers: UserAccount[],
  initialTransactions: Transaction[],
  initialInvestments: UserInvestment[],
  initialSettings: SystemSettings
): Promise<void> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      console.info('[Firestore] Seeding initial users into cloud database...');
      for (const user of initialUsers) {
        await setDoc(doc(db, 'users', user.id), user);
      }
    }

    const txSnapshot = await getDocs(collection(db, 'transactions'));
    if (txSnapshot.empty) {
      console.info('[Firestore] Seeding initial transactions into cloud database...');
      for (const tx of initialTransactions) {
        await setDoc(doc(db, 'transactions', tx.id), tx);
      }
    }

    const invSnapshot = await getDocs(collection(db, 'investments'));
    if (invSnapshot.empty) {
      console.info('[Firestore] Seeding initial investments into cloud database...');
      for (const inv of initialInvestments) {
        await setDoc(doc(db, 'investments', inv.id), inv);
      }
    }

    const settingsDoc = doc(db, 'settings', 'global');
    await setDoc(settingsDoc, initialSettings, { merge: true });
  } catch (error) {
    console.warn('[Firestore] Error while checking or seeding data:', error);
  }
}

/**
 * Subscribe to real-time users collection
 */
export function subscribeToUsers(
  onUpdate: (users: UserAccount[]) => void
): () => void {
  const path = 'users';
  try {
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: UserAccount[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as UserAccount);
          });
          onUpdate(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    console.warn('[Firestore] Failed to subscribe to users:', error);
    return () => {};
  }
}

/**
 * Subscribe to real-time transactions collection
 */
export function subscribeToTransactions(
  onUpdate: (txs: Transaction[]) => void
): () => void {
  const path = 'transactions';
  try {
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Transaction[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as Transaction);
          });
          // Sort latest first
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    console.warn('[Firestore] Failed to subscribe to transactions:', error);
    return () => {};
  }
}

/**
 * Subscribe to real-time investments collection
 */
export function subscribeToInvestments(
  onUpdate: (invs: UserInvestment[]) => void
): () => void {
  const path = 'investments';
  try {
    const unsub = onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: UserInvestment[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as UserInvestment);
          });
          onUpdate(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsub;
  } catch (error) {
    console.warn('[Firestore] Failed to subscribe to investments:', error);
    return () => {};
  }
}

/**
 * Persist user account to Firestore
 */
export async function syncUserToFirestore(user: UserAccount): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Persist transaction to Firestore
 */
export async function syncTransactionToFirestore(tx: Transaction): Promise<void> {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Persist investment to Firestore
 */
export async function syncInvestmentToFirestore(inv: UserInvestment): Promise<void> {
  const path = `investments/${inv.id}`;
  try {
    await setDoc(doc(db, 'investments', inv.id), inv);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Persist system settings to Firestore
 */
export async function syncSettingsToFirestore(settings: SystemSettings): Promise<void> {
  const path = 'settings/global';
  try {
    await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
