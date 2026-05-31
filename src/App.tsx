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
        setItems(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f0f9ff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'sans-serif'}}>
        <h1 style={{color:'#1e3a8a', marginBottom:'40px'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', width:'100%', maxWidth:'400px'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => { localStorage.setItem('chios_user', u); setUser(u); }} style={{padding:'20px', borderRadius:'15px', border:'2px solid #1e3a8a', background:'white', color:'#1e3a8a', fontWeight:'bold', cursor:'pointer'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:'sans-serif'}}>
      <div style={{background:'#1e3a8a', color:'white', padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>Χρήστης: <strong>{user}</strong></span>
        <button onClick={() => { localStorage.removeItem('chios_user'); setUser(null); }} style={{background:'#dc2626', color:'white', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer'}}>Έξοδος</button>
      </div>

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
            <iframe 
              title="Chios Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200405.35269792037!2d25.86435422891969!3d38.37525389658098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a01c34a2c91839%3A0x400bd2ceb9b8b00!2zQ2hpb3MsIEdyZWVjZQ!5e0!3m2!1sen!2sgr!4v1717180000000"
              width="100%" height="300" style={{border:'2px solid #1e3a8a', borderRadius:'15px', marginBottom:'20px'}} allowFullScreen loading="lazy">
            </iframe>
            
            <button onClick={() => setModal(true)} style={{width:'100%', padding:'18px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'12px', fontWeight:'bold', cursor:'pointer'}}>+ ΠΡΟΣΘΗΚΗ ΣΗΜΕΙΟΥ</button>
            
            <div style={{marginTop:'20px'}}>
              {items.map(i => (
                <div key={i.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #ddd'}}>
                  <strong>{i.desc}</strong> ({i.cat}) <br />
                  {i.link && <a href={i.link} target="_blank" rel="noreferrer" style={{color:'#0369a1'}}>🔗 Link</a>}
                  <button onClick={() => remove(ref(db, `items/${i.id}`))} style={{display:'block', marginTop:'5px', color:'red', background:'none', border:'none', cursor:'pointer'}}>Διαγραφή</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', padding:'20px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <form style={{background:'white', padding:'20px', borderRadius:'15px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { e.preventDefault(); push(ref(db, 'items'), { ...form, user }); setModal(false); }}>
            <h3 style={{marginTop:0}}>Προσθήκη</h3>
            <select onChange={(e) => setForm({ ...form, cat: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
            <input placeholder="Σχόλια" onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Link" onChange={(e) => setForm({ ...form, link: e.target.value })} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'10px', background:'#1e3a8a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
            <button type="button" onClick={() => setModal(false)} style={{width:'100%', padding:'10px', marginTop:'5px', background:'none', border:'none', color:'red', cursor:'pointer'}}>Άκυρο</button>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;