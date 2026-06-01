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
  const [modal, setModal] = useState<{open: boolean, type: string, extra?: any}>({open: false, type: ''});
  const [form, setForm] = useState({ desc: '', cat: 'Παραλία', amount: '', link: '' });

  useEffect(() => {
    if (user) {
      onValue(ref(db, 'expenses'), (s) => { const d = s.val(); setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'mapItems'), (s) => { const d = s.val(); setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
      onValue(ref(db, 'events'), (s) => { const d = s.val(); setEvents(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []); });
    }
  }, [user]);

  // Global styling για καθαρά γράμματα
  const globalStyle = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px', lineHeight: '1.5', color: '#1f2937' };

  if (!user) return (
    <div style={{...globalStyle, minHeight:'100vh', padding:'40px', background:'#f0f2f5', textAlign:'center'}}>
      <h1 style={{color:'#1e3a8a'}}>ΧΙΟΣ 2026</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', maxWidth:'500px', margin:'0 auto'}}>
        {USERS.map(u => <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} style={{padding:'15px', borderRadius:'10px', border:'none', background:'#fff', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', cursor:'pointer', fontWeight:'600'}}>{u}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{...globalStyle, minHeight:'100vh', background:'#f9fafb', paddingBottom:'60px'}}>
      <div style={{background:'#ffffff', padding:'15px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <span>Χρήστης: <strong>{user}</strong></span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{padding:'6px 12px', cursor:'pointer', borderRadius:'6px', border:'1px solid #ddd'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', background:'#fff', borderBottom:'1px solid #e5e7eb'}}>
        {['MAP', 'EXPENSES', 'CALENDAR'].map(t => <button key={t} onClick={() => setTab(t)} style={{flex:1, padding:'15px', border:'none', background: tab===t ? '#eef2ff' : 'transparent', color: tab===t ? '#4338ca' : '#6b7280', fontWeight:'700', cursor:'pointer'}}>{t}</button>)}
      </div>

      <div style={{padding:'20px', maxWidth:'600px', margin:'0 auto'}}>
        {tab === 'MAP' && (
          <div>
            <button onClick={() => setModal({open: true, type: 'MAP'})} style={{width:'100%', padding:'12px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', fontWeight:'600', cursor:'pointer'}}>+ Προσθήκη Σημείου</button>
            <iframe title="Chios Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196417.80786522548!2d25.8675!3d38.3725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a055d23b7b6c59%3A0x400bd2ce2b9c750!2sChios!5e0!3m2!1sen!2sgr!4v1620000000000" width="100%" height="250" style={{border:0, borderRadius:'12px', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}></iframe>
            <h3 style={{marginTop:'20px'}}>Αποθηκευμένα Σημεία</h3>
            {mapItems.map(m => (
              <div key={m.id} style={{background:'#fff', padding:'15px', borderRadius:'10px', marginTop:'10px', border:'1px solid #e5e7eb'}}>
                <div style={{fontWeight:'700', color:'#4338ca'}}>{m.cat}: {m.desc}</div>
                {m.link && <a href={m.link} target="_blank" rel="noreferrer" style={{color:'#6b7280', fontSize:'14px'}}>🔗 Δείτε εδώ</a>}
                <button onClick={() => remove(ref(db, `mapItems/${m.id}`))} style={{display:'block', marginTop:'10px', color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontSize:'12px'}}>Διαγραφή</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'EXPENSES' && (
          <div>
            {ALLOWED_TO_ADD.includes(user) && <button onClick={() => setModal({open: true, type: 'EXPENSE'})} style={{width:'100%', padding:'12px', background:'#059669', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', cursor:'pointer'}}>+ Προσθήκη Εξόδου</button>}
            {expenses.map(e => <div key={e.id} style={{background:'#fff', padding:'15px', borderRadius:'10px', marginBottom:'10px', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>{e.desc} - <strong>{e.amount}€</strong></div>)}
          </div>
        )}

        {tab === 'CALENDAR' && (
          <div>
            {[...Array(12)].map((_, i) => {
              const day = 10 + i;
              const dayEvents = events.filter(ev => ev.day === day);
              return (
                <div key={day} style={{background:'#fff', padding:'15px', borderRadius:'10px', marginBottom:'15px', boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                  <h4 style={{marginTop:0, marginBottom:'10px', color:'#374151'}}>Αύγουστος {day}</h4>
                  {[0, 1, 2].map(slot => {
                    const ev = dayEvents.find(e => e.slot === slot);
                    return (
                      <div key={slot} style={{borderBottom:'1px solid #f3f4f6', padding:'8px 0', fontSize:'14px'}}>
                        {ev ? (
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                            <span>{ev.desc}</span>
                            <button onClick={() => remove(ref(db, `events/${ev.id}`))} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>X</button>
                          </div>
                        ) : (
                          <button onClick={() => setModal({open: true, type: 'EVENT', extra: {day, slot}})} style={{fontSize:'12px', color:'#9ca3af', border:'none', background:'none', cursor:'pointer'}}>+ Προσθήκη δραστηριότητας</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal.open && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => { 
            e.preventDefault(); 
            if (modal.type === 'EXPENSE') push(ref(db, 'expenses'), { ...form, amount: parseFloat(form.amount), user, ts: Date.now() });
            else if (modal.type === 'MAP') push(ref(db, 'mapItems'), { ...form, user });
            else push(ref(db, 'events'), { ...form, day: modal.extra.day, slot: modal.extra.slot, user });
            setModal({open: false, type: ''}); setForm({desc:'', cat:'Παραλία', amount:'', link:''});
          }}>
            <h3 style={{marginTop:0}}>Προσθήκη</h3>
            {(modal.type === 'EXPENSE' || modal.type === 'MAP') && (
              <select onChange={e => setForm({...form, cat: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd'}}>{(modal.type === 'EXPENSE' ? CATS : MAP_CATS).map(c => <option key={c}>{c}</option>)}</select>
            )}
            <input placeholder="Περιγραφή ή Σχόλια" required onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box'}} />
            {modal.type === 'MAP' && <input placeholder="Link (URL)" onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box'}} />}
            {modal.type === 'EXPENSE' && <input type="number" placeholder="Ποσό (€)" required onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box'}} />}
            <div style={{display:'flex', gap:'10px'}}>
               <button type="submit" style={{flex:1, padding:'12px', background:'#4338ca', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>Αποθήκευση</button>
               <button type="button" onClick={() => setModal({open: false, type: ''})} style={{flex:1, padding:'12px', background:'#f3f4f6', border:'none', borderRadius:'8px', cursor:'pointer'}}>Άκυρο</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default App;