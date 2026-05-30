import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

const commonStyle = {
  button: { padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: '0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', marginBottom: '10px', boxSizing: 'border-box' as 'border-box' }
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [placeType, setPlaceType] = useState('🏖️ Παραλία');
  const [placeLink, setPlaceLink] = useState('');
  const [placeComment, setPlaceComment] = useState('');

  useEffect(() => {
    console.log("DEBUG: Ξεκινάει η σύνδεση με το Firebase...");
    const locRef = ref(db, 'locations');
    
    const unsubscribe = onValue(locRef, (snapshot) => {
      const data = snapshot.val();
      console.log("DEBUG: Δεδομένα από Firebase:", data);
      
      if (!data) {
        console.log("DEBUG: Η βάση είναι άδεια ή το path 'locations' δεν υπάρχει.");
        setLocations([]);
        return;
      }

      const loadedLocations = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
      console.log("DEBUG: Επεξεργασμένα δεδομένα:", loadedLocations);
      setLocations(loadedLocations);
    }, (error) => {
      console.error("DEBUG: Σφάλμα ανάγνωσης από Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  const saveLocation = () => {
    console.log("DEBUG: Προσπάθεια αποθήκευσης στο 'locations'...");
    push(ref(db, 'locations'), { 
        type: placeType, 
        link: placeLink, 
        comment: placeComment, 
        addedBy: user, 
        date: new Date().toLocaleDateString('el-GR') 
    }).then(() => {
        console.log("DEBUG: Επιτυχής αποθήκευση!");
        setShowModal(false);
    }).catch((err) => {
        console.error("DEBUG: Σφάλμα κατά την αποθήκευση:", err);
        alert("Σφάλμα: " + err.message);
    });
  };

  if (!user) return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Επίλεξε Χρήστη:</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={commonStyle.button}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui' }}>
      <h2>{AVATARS[user]} {user}</h2>
      
      <div style={{ position: 'relative', height: '200px', background: '#eee', borderRadius: '10px', marginBottom: '20px' }}>
        <button onClick={() => setShowModal(true)} style={{...commonStyle.button, position: 'absolute', bottom: '10px', right: '10px'}}>+ Προσθήκη</button>
      </div>

      <h3>Λίστα ({locations.length} σημεία):</h3>
      {locations.map((loc) => (
        <div key={loc.id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '5px', borderRadius: '8px' }}>
          <strong>{loc.type}</strong> - {loc.addedBy}
          <p>{loc.comment}</p>
        </div>
      ))}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', width: '80%' }}>
            <input placeholder="Link" onChange={e => setPlaceLink(e.target.value)} style={commonStyle.input} />
            <input placeholder="Σχόλιο" onChange={e => setPlaceComment(e.target.value)} style={commonStyle.input} />
            <button onClick={saveLocation} style={{...commonStyle.button, background: '#3b82f6', color: 'white'}}>Αποθήκευση</button>
          </div>
        </div>
      )}
    </div>
  );
}