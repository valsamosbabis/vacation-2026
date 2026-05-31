import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const CATS = ["Παραλία", "Εστιατόριο", "Άλλο"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('MAP');
  const [items, setItems] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', link: '' });

  useEffect(() => {
    if (user) {
      const itemsRef = ref(db, 'items');
      onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedItems = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
          setItems(loadedItems);
        } else {
          setItems([]);
        }
      });
    }
  }, [user]);

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{color:'#1e3a8a', marginBottom:'30px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxWidth:'400px', width:'100%'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => { localStorage.setItem('chios_user', u); setUser(u); }} style={{padding:'15px', borderRadius:'10px', border:'none', background:'#fff', color:'#1e3a8a', fontWeight:'bold', cursor:'pointer', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // APP SCREEN
  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      {/* TABS */}
      <div style={{display:'flex', background:'#fff', borderBottom:'1px solid #ddd'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab === t ? '#e0f2fe' : 'transparent', color: '#1e3a8a', fontWeight:'bold', cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <div style={{height:'250px', background:'#ddd', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', marginBottom:'20px'}}>
              ΧΑΡΤΗΣ ΧΙΟΥ
            </div>
            <button onClick={() => setModal(true)} style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>+ ΠΡΟΣΘΗΚΗ</button>
            
            <div style={{marginTop:'20px'}}>
              {items.map(i => (
                <div key={i.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #ddd'}}>
                  <strong>{i.desc}</strong> ({i.cat}) <br />
                  {i.link && <a href={i.link} target="_blank" rel="noreferrer" style={{color:'#0369a1'}}>Link</a>}
                  <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{display:'block', marginTop:'5px', color:'red', background:'none', border:'none', cursor:'pointer'}}>Διαγραφή</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'15px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'items'), { ...form, user }); setModal(false); }}>
            <select onChange={(e) => setForm({ ...form, cat: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια" onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Link" onChange={(e) => setForm({ ...form, link: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'10px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'5px'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={() => setModal(false)} style={{width:'100%', padding:'10px', marginTop:'5px', background:'none', border:'none', color:'red'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;