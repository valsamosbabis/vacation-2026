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

      <div style={{padding:'20px', textAlign:'center'}}>

        <h1>Login</h1>

        <div style={{display:'grid', gap:'10px'}}>{USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}}>{u}</button>)}</div>

      </div>

    );

  }



  return (

    <div style={{padding:'20px'}}>

      <h2>Καλώς ήρθες, {user}</h2>

      <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}}>Έξοδος</button>



      <h3>Έξοδα</h3>

      {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal(true)}>+ Προσθήκη Εξόδου</button>}



      {expenses.map(e => {

        const { gShare, othersShare } = calculateShare(e.amount);

        return (

          <div key={e.id} style={{border:'1px solid #ccc', margin:'10px 0', padding:'10px'}}>

            <p>{e.desc} - {e.amount}€ ({e.cat})</p>

            <small>Ημερ: {new Date(e.ts).toLocaleDateString()}</small>

            <p><strong>Μερίδια:</strong> Γιώργος: {gShare}€ | Υπόλοιποι: {othersShare}€</p>

            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => remove(ref(db, `expenses/${e.id}`))}>Διαγραφή</button>}

          </div>

        );

      })}



      {modal && (

        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)'}}>

          <form style={{background:'white', padding:'20px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() }); setModal(false); }}>

            <select onChange={e => setForm({...form, cat: e.target.value})}>{CATS.map(c => <option key={c}>{c}</option>)}</select>

            <input placeholder="Περιγραφή" onChange={e => setForm({...form, desc: e.target.value})} />

            <input type="number" placeholder="Ποσό" onChange={e => setForm({...form, amount: e.target.value})} />

            <button type="submit">Αποθήκευση</button>

            <button type="button" onClick={() => setModal(false)}>Άκυρο</button>

          </form>

        </div>

      )}

    </div>

  );

};

export default App;  

