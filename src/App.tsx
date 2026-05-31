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

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'sans-serif'}}>
        <h1 style={{color:'#1e3a8a', marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'20px', borderRadius:'15px', border:'2px solid #1e3a8a', background:'white', color:'#1e3a8a', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#fff', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', borderBottom:'2px solid #e2e8f0'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => (
          <button key={t} onClick={() => setTab(t)} 
            style={{flex:1, padding:'20px', border:'none', background: tab===t ? '#1e3a8a' : '#f8fafc', color: tab===t ? '#fff' : '#1e3a8a', fontWeight:'bold', cursor:'pointer'}}>
            {t}
          </button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {tab === 'MAP' && (
          <div>
            <div style={{height:'250px', background:'#bae6fd', borderRadius:'15px', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e3a8a', fontWeight:'bold', border:'2px dashed #1e3a8a', marginBottom:'20px'}}>
              ΧΑΡΤΗΣ ΧΙΟΥ
            </div>
            <button onClick={() => setModal(true)} style={{width:'100%', padding:'18px', background:'#1e3a8a', color:'white', borderRadius:'12px', border:'none', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}>
              + ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΟΥ
            </button>
            <div style={{marginTop:'30px'}}>
              <h2 style={{color:'#1e3a8a', marginBottom:'20px'}}>Αποθηκευμένα Σημεία</h2>
              {items.map(i => (
                <div key={i.id} style={{background:'#f8fafc', padding:'20px', borderRadius:'15px', marginBottom:'15px', border:'1px solid #1e3a8a', color:'#1e3a8a'}}>
                  <strong style={{fontSize:'18px'}}>{i.desc}</strong>
                  <div style={{margin:'5px 0', opacity:'0.8'}}>{i.cat}</div>
                  {i.link && <a href={i.link} target="_blank" rel="noreferrer" style={{color:'#0369a1', display:'block', marginBottom:'10px', fontWeight:'bold'}}>🔗 Link</a>}
                  <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{background:'#dc2626', color:'white', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer'}}>Διαγραφή</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'30px', borderRadius:'20px', width:'100%', maxWidth:'400px'}} onSubmit={(e)=>{e.preventDefault(); push(ref(db, 'items'), {...form, user}); setModal(false);}}>
            <h3 style={{marginTop:0, color:'#1e3a8a'}}>Νέα Καταχώρηση</h3>
            <select onChange={e=>setForm({...form, cat:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px'}}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Σχόλια" onChange={e=>setForm({...form, desc:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid #ccc'}} />
            <input placeholder="Link" onChange={e=>setForm({...form, link:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', boxSizing:'border-box', border:'1px solid #ccc'}} />
            <button type="submit" style={{width:'100%', padding:'15px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={()=>setModal(false)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none', color:'#64748b', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;