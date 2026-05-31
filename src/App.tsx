import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ALLOWED_TO_ADD = ["ΓΙΩΡΓΟΣ", "ΔΗΜΗΤΡΗΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const CATS = ["Supermarket", "Καύσιμα", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Supermarket', amount: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => {
        const d = s.val();
        setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  const calculateShare = (amount: number) => {
    const total = parseFloat(amount.toString());
    const gShare = (total / 15) * 3;
    const othersShare = (total / 15) * 4;
    return { gShare: gShare.toFixed(2), othersShare: othersShare.toFixed(2) };
  };

  if (!user) {
    return (
      <div style={{padding:'20px', textAlign:'center', fontFamily:'sans-serif'}}>
        <h1>Login</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', margin:'0 auto'}}>
          {USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}}>{u}</button>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px', fontFamily:'sans-serif'}}>
      <h2>Καλώς ήρθες, {user}</h2>
      <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}}>Έξοδος</button>

      <h3>Έξοδα</h3>
      {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal(true)}>+ Προσθήκη Εξόδου</button>}

      {expenses.sort((a:any, b:any) => b.ts - a.ts).map((e:any) => {
        const { gShare, othersShare } = calculateShare(e.amount);
        return (
          <div key={e.id} style={{border:'1px solid #ccc', margin:'10px 0', padding:'10px', borderRadius:'8px'}}>
            <p><strong>{e.desc}</strong> - {e.amount}€ ({e.cat})</p>
            <small>Ημερ: {new Date(e.ts).toLocaleDateString()}</small>
            <p>Μερίδια: Γιώργος (3/15): {gShare}€ | Υπόλοιποι (4/15): {othersShare}€</p>
            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => remove(ref(db, `expenses/${e.id}`))}>Διαγραφή</button>}
          </div>
        );
      })}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'10px', width:'90%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() }); setModal(false); }}>
            <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Περιγραφή" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', marginBottom:'10px'}} />
            <input type="number" placeholder="Ποσό" required onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', marginBottom:'10px'}} />
            <button type="submit" style={{width:'100%'}}>Αποθήκευση</button>
            <button type="button" onClick={() => setModal(false)} style={{width:'100%', marginTop:'5px'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;