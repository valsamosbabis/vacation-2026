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
      onValue(ref(db, 'items'), (s) => {
        const d = s.val();
        setItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
      });
    }
  }, [user]);

  // ΑΡΧΙΚΗ ΟΘΟΝΗ LOGIN
  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', padding:'20px', textAlign:'center', color:'#1e3a8a', fontFamily:'sans-serif', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1 style={{marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'16px', borderRadius:'12px', border:'none', background:'white', color:'#1e3a8a', fontWeight:'bold', boxShadow:'0 2px 4px rgba(0,0,0,0.1)', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ΚΥΡΙΑ ΟΘΟΝΗ
  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', color:'#1e3a8a', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', background:'white', borderBottom:'2px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#e0f2fe' : 'white', color: tab===t ? '#0369a1' : '#64748b', fontWeight:'bold', cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <div style={{height:'300px', background:'#bae6fd', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0369a1', fontWeight:'bold', border:'2px dashed #0369a1', marginBottom:'20px'}}>
              ΧΑΡΤΗΣ ΧΙΟΥ
            </div>
            <button onClick={() => setModal(true)} style={{width:'100%', padding:'18px', background:'#0369a1', color:'white', borderRadius:'12px', border:'none', fontWeight:'bold', cursor:'pointer'}}>+ ΠΡΟΣΘΗΚΗ</button>
            <div style={{marginTop:'20px'}}>
              {items.map(i => (
                <div key={i.id} style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'10px', border:'1px solid #e2e8f0'}}>
                  <strong>{i.desc}</strong> ({i.cat}) <br/>
                  {i.link && <a href={i.link} target="_blank" style={{color:'#0369a1'}}>🔗 Link</a>}
                  <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{display:'block', marginTop:'10px', color:'red', border:'none', background:'none', cursor:'pointer'}}>Διαγραφή</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <form style={{background:'white', padding:'20px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'items'), {...form, user}); setModal(false);}}>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'8px'}}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ccc', boxSizing:'border-box'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'8px', border:'1px solid #ccc', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'15px', background:'#0369a1', color:'white', border:'none', borderRadius:'10px', cursor:'pointer'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', color:'red', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;