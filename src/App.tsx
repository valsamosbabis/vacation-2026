import React, { useState, useEffect } from 'react';
import { db } from './firebase';
// @ts-ignore
import { ref, push, onValue } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  
  // Νέες καταστάσεις για έξοδα
  const [placeType, setPlaceType] = useState('🏖️ Παραλία');
  const [placeLink, setPlaceLink] = useState('');
  const [placeComment, setPlaceComment] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    // @ts-ignore
    const locRef = ref(db, 'locations');
    // @ts-ignore
    onValue(locRef, (snapshot: any) => {
      const data = snapshot.val();
      const loaded = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
      setLocations(loaded);
    });
  }, []);

  const saveLocation = () => {
    // @ts-ignore
    push(ref(db, 'locations'), { 
        type: placeType, link: placeLink, comment: placeComment, cost: cost, addedBy: user, date: new Date().toLocaleDateString('el-GR') 
    }).then(() => {
        setShowModal(false);
        setPlaceLink(''); setPlaceComment(''); setCost('');
    });
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui' }}>
      <h2>{AVATARS[user]} {user}</h2>
      
      {/* Χάρτης κεντραρισμένος στη Χίο */}
      <div style={{ height: '300px', background: '#eee', borderRadius: '15px', overflow: 'hidden' }}>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200845.54585501755!2d25.8647!3d38.3725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a012a524a87c53%3A0x6436665792945d83!2sChios!5e0!3m2!1sen!2sgr!4v1620000000000!5m2!1sen!2sgr" 
          width="100%" height="100%" style={{ border: 0 }} allowFullScreen></iframe>
      </div>

      <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '15px', marginTop: '10px', background: '#3b82f6', color: 'white', borderRadius: '10px' }}>+ Προσθήκη Σημείου</button>

      <h3>Αποθηκευμένα ({locations.length})</h3>
      {locations.map((loc) => (
        <div key={loc.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
          <strong>{loc.date} | {loc.type}</strong> - {loc.addedBy} ({loc.cost}€)<br />
          <small>{loc.comment}</small>
        </div>
      ))}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'white', padding: '20px' }}>
          <h3>Νέα Καταχώρηση</h3>
          <input placeholder="Κόστος (€)" type="number" value={cost} onChange={e => setCost(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <textarea placeholder="Σχόλια" value={placeComment} onChange={e => setPlaceComment(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={saveLocation} style={{ width: '100%', padding: '15px', background: 'green', color: 'white' }}>Αποθήκευση</button>
          <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '15px', marginTop: '10px' }}>Άκυρο</button>
        </div>
      )}
    </div>
  );
}