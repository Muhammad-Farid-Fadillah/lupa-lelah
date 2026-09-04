const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCHGJG7S93saeNBt8aodD-2CDKPcBBObW0",
  authDomain: "lupalelah.firebaseapp.com",
  projectId: "lupalelah",
  storageBucket: "lupalelah.firebasestorage.app",
  messagingSenderId: "117935108191",
  appId: "1:117935108191:web:ee78d7b90e4586178cabea"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usersToCreate = [
  { email: 'manager@lupalelah.com', password: 'password123', role: 'manager' },
  { email: 'leader@lupalelah.com', password: 'password123', role: 'barista' }, // leader barista
  { email: 'logistik@lupalelah.com', password: 'password123', role: 'logistik' }
];

async function createUsers() {
  console.log('Creating test accounts...');
  for (const u of usersToCreate) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: u.email,
        role: u.role,
        createdAt: new Date().toISOString()
      });
      console.log(`Created: ${u.email} (Role: ${u.role})`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`${u.email} already exists.`);
      } else {
        console.error(`Error creating ${u.email}:`, error.message);
      }
    }
  }
  console.log('Done!');
  process.exit(0);
}

createUsers();
