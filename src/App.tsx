import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const DATES = ["10/08", "11/08", "12/08", "13/08", "14/08", "15/08", "16/08", "17/08", "18/08", "19/08", "20/08", "21/08"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [activeTab, setActiveTab] = useState('Αξιοθέατα');

  if (!user) {
    return (
      <div style={{minHeight:'100vh', background:'#f8fafc', padding:'40px 20px', fontFamily:'sans-serif', textAlign:'center'}}>
        <h1 style={{fontSize:'2.5rem', marginBottom:'40px', color:'#1e293b'}}>ΧΙΟΣ 2026</h1>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', maxWidth:'500px', margin:'0 auto'}}>
          {USERS.map(u => (
            <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
              style={{padding:'20px', borderRadius:'15px', border:'none', background:'#fff', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', cursor:'pointer', fontWeight:'bold', fontSize:'16px', color:'#334155'}}>
              {u}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#f1f5f9', fontFamily:'sans-serif'}}>
      <div style={{background:'#fff', padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0'}}>
        <span style={{fontWeight:'bold', color:'#475569'}}>Χρήστης: {user}</span>
        <button onClick={() => {localStorage.removeItem('chios_user'); setUser(null);}} style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'12px'}}>Έξοδος</button>
      </div>

      <div style={{display:'flex', gap:'5px', padding:'10px'}}>
        {['Αξιοθέατα', 'Έξοδα', 'Ημερολόγιο'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{flex:1, padding:'12px', border:'none', borderRadius:'8px', background: activeTab === tab ? '#4f46e5' : '#fff', color: activeTab === tab ? '#fff' : '#64748b', cursor:'pointer', fontWeight:'600'}}>{tab}</button>
        ))}
      </div>

      <div style={{padding:'20px'}}>
        {activeTab === 'Αξιοθέατα' && <SightsView currentUser={user} />}
        {activeTab === 'Έξοδα' && <div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}>Σελίδα Εξόδων υπό κατασκευή...</div>}
        {activeTab === 'Ημερολόγιο' && <CalendarView currentUser={user} />}
      </div>
    </div>
  );
};

const SightsView = ({ currentUser }: { currentUser: string }) => {
  const [subTab, setSubTab] = useState('Παραλίες');
  const [modal, setModal] = useState(false);
  const [mapItems, setMapItems] = useState<any[]>([]);
  const [form, setForm] = useState({ desc: '', link: '', comments: '' });

  useEffect(() => {
    onValue(ref(db, 'mapItems'), (s) => {
      const d = s.val();
      setMapItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  const filteredItems = mapItems.filter(i => i.cat === subTab);

  return (
    <div>
      <div style={{display:'flex', gap:'5px', marginBottom:'20px'}}>
        {['Παραλίες', 'Εστιατόρια', 'Άλλο'].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{flex:1, padding:'10px', background: subTab === t ? '#6366f1' : '#fff', border:'1px solid #e2e8f0', borderRadius:'6px', cursor:'pointer', color: subTab === t ? '#fff' : '#475569'}}>{t}</button>
        ))}
      </div>

      <button onClick={() => setModal(true)} style={{width:'100%', padding:'12px', background:'#22c55e', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', fontWeight:'bold'}}>+ Προσθήκη</button>

      {filteredItems.map(item => (
        <div key={item.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
          <h4 style={{margin:'0 0 5px 0'}}>{item.desc}</h4>
          <p style={{fontSize:'12px', color:'#64748b', margin:'0 0 5px 0'}}>Προστέθηκε από: {item.addedBy}</p>
          {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{color:'#4f46e5', fontSize:'13px'}}>Link τοποθεσίας</a>}
          <p style={{fontSize:'14px', color:'#475569', margin:'5px 0'}}>{item.comments}</p>
          <button onClick={() => remove(ref(db, 'mapItems/' + item.id))} style={{background:'none', border:'none', color:'#ef4444', fontSize:'12px', cursor:'pointer', padding:0, marginTop:'5px'}}>Διαγραφή</button>
        </div>
      ))}

      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'mapItems'), { ...form, cat: subTab, addedBy: currentUser });
            setModal(false); setForm({desc:'', link:'', comments:''});
          }}>
            <h3>Προσθήκη στο {subTab}</h3>
            <input placeholder="Όνομα/Περιγραφή" required value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Google Maps Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <textarea placeholder="Σχόλια" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box', height:'80px'}} />
            <button type="submit" style={{width:'100%', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Αποθήκευση</button>
          </form>
        </div>
      )}
    </div>
  );
};

const CalendarView = ({ currentUser }: { currentUser: string }) => {
    const [entries, setEntries] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [text, setText] = useState('');

    useEffect(() => {
        onValue(ref(db, 'calendarItems'), (s) => {
            const d = s.val();
            setEntries(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
        });
    }, []);

    const addEntry = () => {
        if (!text || !selectedDate) return;
        push(ref(db, 'calendarItems'), { date: selectedDate, text, addedBy: currentUser });
        setText(''); setSelectedDate(null);
    };

    return (
        <div>
            {DATES.map(date => (
                <div key={date} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <h4 style={{margin:0}}>Αύγουστος {date}</h4>
                        <button onClick={() => setSelectedDate(date)} style={{background:'#e0e7ff', color:'#4f46e5', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>+ Προσθήκη</button>
                    </div>
                    {entries.filter(e => e.date === date).map(e => (
                        <div key={e.id} style={{fontSize:'14px', padding:'5px 0', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between'}}>
                            <span>{e.text} <small style={{color:'#94a3b8'}}>({e.addedBy})</small></span>
                            <button onClick={() => remove(ref(db, 'calendarItems/' + e.id))} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>x</button>
                        </div>
                    ))}
                </div>
            ))}

            {selectedDate && (
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
                    <div style={{background:'white', padding:'20px', borderRadius:'10px', width:'100%', maxWidth:'300px'}}>
                        <h3>{selectedDate}</h3>
                        <input value={text} onChange={e => setText(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} placeholder="Τι θα κάνουμε;" />
                        <button onClick={addEntry} style={{width:'100%', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Προσθήκη</button>
                        <button onClick={() => setSelectedDate(null)} style={{width:'100%', padding:'10px', marginTop:'10px', background:'none', border:'none'}}>Άκυρο</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;