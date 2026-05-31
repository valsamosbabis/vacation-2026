import React, { useState, useEffect } from 'react';
import { db } from './firebase';
// @ts-ignore
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
    // @ts-ignore
    const locRef = ref(db, 'locations');
    // @ts-ignore
    const unsubscribe = onValue(locRef, (snapshot: any) => {
      const data = snapshot.val();
      const loadedLocations = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
      setLocations(loadedLocations);
    });
    return () => unsubscribe();
  }, []);

  const saveLocation = () => {
    // @ts-ignore
    push(ref(db, 'locations'), { 
        type: placeType, link: placeLink, comment: placeComment, addedBy: user, date: new Date().toLocaleDateString('el-GR') 
    }).then(() => {
        setShowModal(false);
        setPlaceLink('');
        setPlaceComment('');
    }).catch((err: any) => alert("Σφάλμα: " + err.message));
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1>🚢 ΧΙΟΣ 2026 - UPDATE</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{...commonStyle.button, background: '#fff'}}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{...commonStyle.button, background: '#fee2e2', color: '#ef4444'}}>Έξοδος</button>
      </div>

      <div style={{ position: 'relative', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #e2e8f0', margin: '20px 0' }}>
        <iframe src="https://www.google.com/maps/embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
        <button onClick={() => setShowModal(true)} style={{...commonStyle.button, position: 'absolute', bottom: '20px', right: '20px', background: '#3b82f6', color: 'white', borderRadius: '50%', width: '65px', height: '65px', fontSize: '30px', zIndex: 10 }}>+</button>
      </div>

      <h3>Αποθηκευμένα Σημεία ({locations.length})</h3>
      {locations.map((loc: any) => (
        <div key={loc.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
          <strong>{loc.type}</strong> - {loc.addedBy}<br />
          <p style={{ margin: '5px 0', fontSize: '14px' }}>{loc.comment}</p>
          <a href={loc.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6' }}>Δες στον χάρτη</a>
        </div>
      ))}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '90%', maxWidth: '400px' }}>
            <h3>Νέα Τοποθεσία</h3>
            <select value={placeType} onChange={e => setPlaceType(e.target.value)} style={commonStyle.input}>
              <option>🏖️ Παραλία</option><option>🍴 Εστιατόριο</option><option>📌 Άλλο</option>
            </select>
            <input placeholder="Google Maps Link" value={placeLink} onChange={e => setPlaceLink(e.target.value)} style={commonStyle.input} />
            <textarea placeholder="Σχόλια" value={placeComment} onChange={e => setPlaceComment(e.target.value)} style={{...commonStyle.input, height: '80px'}} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{...commonStyle.button, flex: 1, background: '#ccc'}}>Άκυρο</button>
              <button onClick={saveLocation} style={{...commonStyle.button, flex: 1, background: '#3b82f6', color: 'white'}}>Αποθήκευση</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}