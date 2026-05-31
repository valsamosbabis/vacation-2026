import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', link: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => {
        const d = s.val();
        setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px'}}>
          {USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px', borderRadius:'10px', border:'none', background:'white'}}>{u}</button>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', paddingBottom:'20px'}}>
      {/* TABS ΠΑΝΩ */}
      <div style={{display:'flex', background:'white', borderBottom:'1px solid #ddd'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e0f2fe' : 'white'}}>{t}</button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d195641.56477114296!2d25.969116744047648!3d38.366755459392265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14be3c16262452c9%3A0x6b445e999942a690!2zQ2hpb3MgMzgyIDAw!5e0!3m2!1sel!2sgr!4v1717171717171!5m2!1sel!2sgr" 
              width="100%" height="300" style={{borderRadius:'20px'}} allowFullScreen></iframe>
            
            <button onClick={() => setModal(true)} style={{width:'100%', marginTop:'20px', padding:'15px', background:'#0369a1', color:'white', borderRadius:'10px', border:'none'}}>+ Προσθήκη</button>
            
            <h3 style={{marginTop:'20px'}}>Αποθηκευμένα Σημεία</h3>
            {expenses.map(e => (
              <div key={e.id} style={{background:'white', padding:'10px', borderRadius:'10px', marginBottom:'10px'}}>
                <strong>📍 {e.desc}</strong> ({e.cat}) <a href={e.link} target="_blank">Link</a>
                <button onClick={() => remove(ref(db, `expenses/${e.id}`))} style={{marginLeft:'10px', color:'red'}}>Διαγραφή</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'20px', width:'100%'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'expenses'), {...form, user, ts:Date.now()}); setModal(false);}}>
            <select onChange={e=>setForm({...form, cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια/Τοποθεσία" onChange={e=>setForm({...form, desc:e.target.value})} style={{display:'block', width:'100%', margin:'10px 0'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{display:'block', width:'100%', margin:'10px 0'}} />
            <button type="submit">Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;