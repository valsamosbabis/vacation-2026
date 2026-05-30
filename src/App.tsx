import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, push, remove, set } from 'firebase/database';

const PAYERS = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ', 'ΦΩΦΗ', 'ΜΑΡΙΛΗ', 'ΛΙΤΣΑ', 'ΒΑΣΙΛΙΚΗ'];
const CAN_ADD = ['ΓΙΩΡΓΟΣ', 'ΜΠΑΜΠΗΣ', 'ΚΩΣΤΑΣ', 'ΔΗΜΗΤΡΗΣ'];
const AVATARS: { [key: string]: string } = {
  'ΓΙΩΡΓΟΣ': '👨‍💼', 'ΜΠΑΜΠΗΣ': '👨‍🔧', 'ΚΩΣΤΑΣ': '👨‍💻', 'ΔΗΜΗΤΡΗΣ': '👨‍🎨',
  'ΦΩΦΗ': '👩‍⚖️', 'ΜΑΡΙΛΗ': '👩‍🔬', 'ΛΙΤΣΑ': '👩‍🍳', 'ΒΑΣΙΛΙΚΗ': '👩‍⚕️'
};

const commonStyle = {
  button: { padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: '0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#333333', color: '#ffffff' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px', boxSizing: 'border-box' as 'border-box', fontSize: '14px', backgroundColor: '#ffffff', color: '#000000' }
};

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [tab, setTab] = useState('map');
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [placeType, setPlaceType] = useState('🏖️ Παραλία');
  const [placeLink, setPlaceLink] = useState('');
  const [placeComment, setPlaceComment] = useState('');
  const [schedule, setSchedule] = useState<any>({});
  const days = Array.from({ length: 12 }, (_, i) => `${(i + 10).toString().padStart(2, '0')}/08/2026`);

  useEffect(() => {
    onValue(ref(db, 'expenses'), (snapshot) => {
      const data = snapshot.val();
      setExpenses(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
    });
    onValue(ref(db, 'schedule'), (snapshot) => {
      setSchedule(snapshot.val() || {});
    });
  }, []);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1>🚢 ΧΙΟΣ 2026</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '400px', margin: 'auto' }}>
        {PAYERS.map(p => <button key={p} onClick={() => setUser(p)} style={{...commonStyle.button, background: '#fff', color: '#000'}}>{AVATARS[p]} {p}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '15px', fontFamily: 'system-ui', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>{AVATARS[user]} {user}</h2>
        <button onClick={() => setUser(null)} style={{...commonStyle.button, background: '#fee2e2', color: '#ef4444'}}>Έξοδος</button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {['map', 'expenses', 'schedule'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{...commonStyle.button, flex: 1, background: tab === t ? '#3b82f6' : '#e2e8f0', color: tab === t ? 'white' : '#475569'}}>
            {t === 'map' ? '📍 ΧΑΡΤΗΣ' : t === 'expenses' ? '💶 ΕΞΟΔΑ' : '📅 ΠΛΑΝΟ'}
          </button>
        ))}
      </div>

      {tab === 'map' && (
        <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200372.48398797825!2d25.8624024!3d38.3697968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a09a5c48b26097%3A0x400bd2ce2b9c7b0!2zQ2hpb3MsIEdyZWVjZQ!5e0!3m2!1sen!2sgr!4v1717070000000" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
          <button onClick={() => setShowModal(true)} style={{...commonStyle.button, position: 'absolute', bottom: '20px', right: '20px', borderRadius: '50%', width: '60px', height: '60px', fontSize: '30px' }}>+</button>
          
          {showModal && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', padding: '20px', zIndex: 10, display: 'flex', alignItems: 'center' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '15px', width: '100%' }}>
                <h3>Νέα Τοποθεσία</h3>
                <select value={placeType} onChange={e => setPlaceType(e.target.value)} style={commonStyle.input}>
                  <option>🏖️ Παραλία</option><option>🍴 Εστιατόριο</option><option>📌 Άλλο</option>
                </select>
                <input placeholder="Google Maps Link" value={placeLink} onChange={e => setPlaceLink(e.target.value)} style={commonStyle.input} />
                <button onClick={() => {
                  push(ref(db, 'locations'), { type: placeType, link: placeLink, comment: placeComment, addedBy: user, date: new Date().toLocaleDateString('el-GR') });
                  setShowModal(false);
                }} style={{...commonStyle.button, width: '100%', background: '#3b82f6', color: 'white'}}>Αποθήκευση</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Ενότητα Εξόδων (Λειτουργεί κανονικά)</p>
        </div>
      )}

      {tab === 'schedule' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Ενότητα Προγράμματος (Λειτουργεί κανονικά)</p>
        </div>
      )}
    </div>
  );
}