import React, { useState } from 'react';
import { db } from './firebase';
import { ref, push } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const saveToFirebase = () => {
    console.log("Προσπάθεια αποθήκευσης...");
    try {
      const locationRef = ref(db, 'locations');
      push(locationRef, {
        type: 'test',
        addedBy: user,
        timestamp: Date.now()
      }).then(() => alert("Επιτυχία!"))
        .catch(err => alert("Error: " + err.message));
    } catch (err) {
      alert("Critical Error: " + err);
    }
  };

  if (!user) return (
    <div style={{ padding: '20px' }}>
      <h1>Επίλεξε Χρήστη:</h1>
      {PAYERS.map(p => <button key={p} onClick={() => setUser(p)}>{p}</button>)}
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>Χρήστης: {user}</h2>
      
      {/* ΔΟΚΙΜΑΣΤΙΚΟ ΚΟΥΜΠΙ - ΠΑΤΑ ΑΥΤΟ ΠΡΩΤΑ */}
      <button onClick={saveToFirebase} style={{ background: 'red', color: 'white', padding: '20px' }}>
        ΔΟΚΙΜΑΣΤΙΚΟ PUSH (Αν δουλεύει αυτό, φταίει το Modal)
      </button>

      <div style={{ marginTop: '50px', height: '300px', background: '#eee', position: 'relative' }}>
        <button onClick={() => setShowModal(true)}>+ ΑΝΟΙΓΜΑ MODAL</button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 999999 }}>
          <div style={{ background: 'white', padding: '50px', margin: '50px' }}>
            <h3>Modal</h3>
            <button onClick={() => { setShowModal(false); saveToFirebase(); }}>ΑΠΟΘΗΚΕΥΣΗ (Μέσα στο Modal)</button>
            <button onClick={() => setShowModal(false)}>ΚΛΕΙΣΙΜΟ</button>
          </div>
        </div>
      )}
    </div>
  );
}