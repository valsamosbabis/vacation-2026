import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ALLOWED_TO_ADD = ["ΓΙΩΡΓΟΣ", "ΔΗΜΗΤΡΗΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const CATS = ["Supermarket", "Καύσιμα", "Εστιατόριο", "Άλλο"];
const MAP_CATS = ["Παραλία", "Εστιατόριο", "Αξιοθέατο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modal, setModal] = useState<{open: boolean, type: string}>({open: false, type: ''});
  const [form, setForm] = useState({ desc: '', cat: 'Supermarket', amount: '', link: '', date: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => { const d = s.val(); setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'mapItems'), (s) => { const d = s.val(); setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'events'), (s) => { const d = s.val(); setEvents(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
    }
  }, [user]);

  const calculateShare = (amount: number) => {
    const total = parseFloat(amount.toString());
    return { gShare: ((total / 15) * 3).toFixed(2), othersShare: ((total / 15) * 4).toFixed(2) };
  };

  if (!user) return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', padding:'20px', fontFamily:'sans-serif'}}>
      <h1>ΧΙΟΣ 2026</h1>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', width:'100%'}}>
        {USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px'}}>{u}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'sans-serif'}}>
      <div style={{background:'#1e3a8a', color:'white', padding:'20px', display:'flex', justifyContent:'space-between'}}>
        <span>User: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', background:'white'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e0f2fe' : 'transparent'}}>{t}</button>)}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <button onClick={() => setModal({open: true, type: 'MAP'})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>+ Προσθήκη Σημείου</button>
            <iframe title="Chios" src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d101235.3524673891!2d26.00!3d38.37!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sel!2sgr!4v1" width="100%" height="300" style={{border:0}}></iframe>
            {mapItems.map(m => <div key={m.id} style={{padding:'10px', border:'1px solid #ccc', margin:'5px 0'}}>{m.desc} {m.link && <a href={m.link} target="_blank">Link</a>}</div>)}
          </div>
        )}

        {tab === 'CALENDAR' && (
          <div>
            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal({open: true, type: 'EVENT'})} style={{width:'100%'}}>+ Προσθήκη Εκδήλωσης (10-21 Αυγ)</button>}
            {events.map(ev => (
              <div key={ev.id} style={{padding:'10px', border:'1px solid #ccc', margin:'5px 0'}}>
                <strong>{ev.date} Αυγούστου:</strong> {ev.desc}
                {ALLOWED_TO_ADD.includes(user) && <button onClick={() => remove(ref(db, `events/${ev.id}`))}>Διαγραφή</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.open && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', width:'300px'}} onSubmit={(e) => { 
            e.preventDefault(); 
            if (modal.type === 'EXPENSE') push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() });
            else if (modal.type === 'MAP') push(ref(db, 'mapItems'), { ...form, user });
            else push(ref(db, 'events'), { ...form, user });
            setModal({open: false, type: ''}); 
          }}>
            <input placeholder="Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%'}} />
            {modal.type === 'MAP' && <input placeholder="Link" onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%'}} />}
            {modal.type === 'EXPENSE' && <input type="number" placeholder="Ποσό" onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%'}} />}
            {modal.type === 'EVENT' && <input type="number" min="10" max="21" placeholder="Ημέρα Αυγούστου (10-21)" onChange={e => setForm({...form, date: e.target.value})} style={{width:'100%'}} />}
            <button type="submit">Αποθήκευση</button>
            <button type="button" onClick={() => setModal({open: false, type: ''})}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;