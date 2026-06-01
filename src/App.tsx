import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ALLOWED_TO_ADD = ["ΓΙΩΡΓΟΣ", "ΔΗΜΗΤΡΗΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const CATS = ["Supermarket", "Καύσιμα", "Εστιατόριο", "Άλλο"];
const MAP_CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modal, setModal] = useState<{open: boolean, type: string}>({open: false, type: ''});
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', amount: '', link: '', date: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => { const d = s.val(); setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'mapItems'), (s) => { const d = s.val(); setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'events'), (s) => { const d = s.val(); setEvents(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
    }
  }, [user]);

  if (!user) return (
    <div style={{padding:'20px', textAlign:'center', fontFamily:'Arial, sans-serif'}}>
      <h1>ΧΙΟΣ 2026</h1>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', margin:'0 auto'}}>
        {USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px', cursor:'pointer'}}>{u}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{fontFamily:'Arial, sans-serif', padding:'20px', maxWidth:'600px', margin:'0 auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
        <span>Χρήστης: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{cursor:'pointer'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', marginBottom:'20px'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'10px', background: tab===t ? '#ddd' : '#f9f9f9', cursor:'pointer'}}>{t}</button>)}
      </div>

      {tab === 'MAP' && (
        <div>
          <button onClick={() => setModal({open: true, type: 'MAP'})} style={{width:'100%', padding:'10px', marginBottom:'10px', cursor:'pointer'}}>+ Προσθήκη Σημείου</button>
          {mapItems.map(m => (
            <div key={m.id} style={{padding:'10px', border:'1px solid #ccc', margin:'5px 0'}}>
              <strong>{m.cat}:</strong> {m.desc} {m.link && <a href={m.link} target="_blank" rel="noreferrer">🔗Link</a>}
              <button onClick={() => remove(ref(db, `mapItems/${m.id}`))} style={{marginLeft:'10px', cursor:'pointer', color:'red'}}>Διαγραφή</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'EXPENSES' && (
        <div>
          {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal({open: true, type: 'EXPENSE'})} style={{width:'100%', marginBottom:'10px', cursor:'pointer'}}>+ Προσθήκη Εξόδου</button>}
          {expenses.map(e => <div key={e.id} style={{padding:'10px', border:'1px solid #ccc', margin:'5px 0'}}>{e.desc} - {e.amount}€</div>)}
        </div>
      )}

      {modal.open && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', width:'300px'}} onSubmit={(e) => { 
            e.preventDefault(); 
            if (modal.type === 'EXPENSE') push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() });
            else push(ref(db, 'mapItems'), { ...form, user });
            setModal({open: false, type: ''}); 
          }}>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%'}}>{(modal.type === 'EXPENSE' ? CATS : MAP_CATS).map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια / Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%'}} />
            {modal.type === 'MAP' && <input placeholder="Link (URL)" onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%'}} />}
            {modal.type === 'EXPENSE' && <input type="number" placeholder="Ποσό" onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%'}} />}
            <button type="submit" style={{width:'100%', marginTop:'10px', cursor:'pointer'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;