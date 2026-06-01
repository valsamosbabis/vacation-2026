import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ADMINS = ["ΔΗΜΗΤΡΗΣ", "ΓΙΩΡΓΟΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
const DATES = ["10/08", "11/08", "12/08", "13/08", "14/08", "15/08", "16/08", "17/08", "18/08", "19/08", "20/08", "21/08"];

const weights: Record<string, number> = { 
  "ΓΙΩΡΓΟΣ": 3, "ΔΗΜΗΤΡΗΣ": 4, "ΜΠΑΜΠΗΣ": 4, "ΚΩΣΤΑΣ": 4 
};
const totalWeight = 15;

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [activeTab, setActiveTab] = useState('Αξιοθέατα');

  if (!user) {
    return (
      <div style={{
        minHeight:'100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding:'20px', 
        fontFamily:'sans-serif', 
        textAlign:'center',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1598439210622-6803387d903e?q=80&w=2070&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{background:'rgba(255,255,255,0.95)', padding:'30px', borderRadius:'20px', maxWidth:'500px', width:'100%'}}>
          <h1 style={{fontSize:'2.5rem', marginBottom:'30px', color:'#1e293b'}}>ΧΙΟΣ 2026 (κ16)</h1>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
            {USERS.map(u => (
              <button key={u} onClick={() => {localStorage.setItem('chios_user', u); setUser(u);}} 
                style={{padding:'15px', borderRadius:'10px', border:'none', background:'#4f46e5', color:'white', cursor:'pointer', fontWeight:'bold', fontSize:'14px'}}>
                {u}
              </button>
            ))}
          </div>
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
        {activeTab === 'Έξοδα' && <ExpensesView currentUser={user} />}
        {activeTab === 'Ημερολόγιο' && <CalendarView currentUser={user} />}
      </div>
    </div>
  );
};

const SightsView = ({ currentUser }: { currentUser: string }) => {
  const [subTab, setSubTab] = useState('Παραλίες');
  const [modal, setModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ desc: '', link: '', comments: '' });

  useEffect(() => {
    onValue(ref(db, 'sights'), (s) => {
      const d = s.val();
      setItems(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  const filteredItems = items.filter(i => i.cat === subTab);

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
          {item.link && <a href={item.link} target="_blank" rel="noreferrer" style={{fontSize:'12px', display:'block', marginBottom:'5px'}}>Δες το link</a>}
          {item.comments && <p style={{fontSize:'13px', margin:'5px 0', color:'#475569'}}>{item.comments}</p>}
          <p style={{fontSize:'11px', color:'gray', margin:0}}>Από: {item.addedBy}</p>
          <button onClick={() => remove(ref(db, 'sights/' + item.id))} style={{background:'none', border:'none', color:'red', cursor:'pointer', marginTop:'10px'}}>Διαγραφή</button>
        </div>
      ))}
      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'25px', borderRadius:'16px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'sights'), { ...form, cat: subTab, addedBy: currentUser });
            setModal(false); setForm({desc:'', link:'', comments:''});
          }}>
            <h3>Προσθήκη στο {subTab}</h3>
            <input required placeholder="Όνομα" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Link (url)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <textarea placeholder="Σχόλια" value={form.comments} onChange={e => setForm({...form, comments: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box', height:'80px'}} />
            <div style={{display:'flex', gap:'10px'}}>
              <button type="submit" style={{flex:1, padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Αποθήκευση</button>
              <button type="button" onClick={() => setModal(false)} style={{flex:1, padding:'10px', background:'#e2e8f0', border:'none', borderRadius:'8px'}}>Άκυρο</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const ExpensesView = ({ currentUser }: { currentUser: string }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ amount: '', desc: '' });

  useEffect(() => {
    onValue(ref(db, 'expenses'), (s) => {
      const d = s.val();
      setExpenses(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
    });
  }, []);

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const paidBy: Record<string, number> = {};
  expenses.forEach(e => {
    paidBy[e.paidBy] = (paidBy[e.paidBy] || 0) + parseFloat(e.amount);
  });

  const allInvolvedUsers = Array.from(new Set([...USERS, ...Object.keys(paidBy)]));
  const balances: Record<string, number> = {};
  
  allInvolvedUsers.forEach(u => {
    const paid = paidBy[u] || 0;
    const share = (weights[u] || 0) / totalWeight * total;
    balances[u] = paid - share;
  });

  const settlements: { from: string, to: string, amount: number }[] = [];
  const debtors = Object.entries(balances).filter(([_, bal]) => bal < -0.01).map(([n, b]) => ({ name: n, val: Math.abs(b) }));
  const creditors = Object.entries(balances).filter(([_, bal]) => bal > 0.01).map(([n, b]) => ({ name: n, val: b }));

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].val, creditors[j].val);
    settlements.push({ from: debtors[i].name, to: creditors[j].name, amount });
    debtors[i].val -= amount;
    creditors[j].val -= amount;
    if (debtors[i].val < 0.01) i++;
    if (creditors[j].val < 0.01) j++;
  }

  return (
    <div>
      <div style={{background:'#fff', padding:'15px', borderRadius:'12px', marginBottom:'20px', border:'1px solid #e2e8f0'}}>
        <h4 style={{margin:'0 0 10px'}}>Πλάνο Εξόφλησης</h4>
        <div style={{fontSize:'14px'}}>
          {settlements.length === 0 ? <p>Όλοι είναι "τακτοποιημένοι"!</p> :
            settlements.map((s, idx) => (
                <div key={idx} style={{padding:'5px 0', borderBottom:'1px solid #f8fafc'}}>
                    <strong>{s.from}</strong> χρωστάει <strong>{s.amount.toFixed(2)}€</strong> στον <strong>{s.to}</strong>
                </div>
            ))
          }
        </div>
      </div>

      {ADMINS.includes(currentUser) && (
        <button onClick={() => setModal(true)} style={{width:'100%', padding:'12px', background:'#22c55e', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', fontWeight:'bold'}}>+ Προσθήκη Εξόδου</button>
      )}

      {expenses.map(e => (
        <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:'bold'}}>{e.desc}</div>
            <div style={{fontSize:'12px', color:'#64748b'}}>{e.date} • Πλήρωσε: {e.paidBy}</div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <span style={{fontWeight:'bold'}}>{e.amount}€</span>
            {ADMINS.includes(currentUser) && <button onClick={() => remove(ref(db, 'expenses/' + e.id))} style={{border:'none', background:'none', color:'red', cursor:'pointer'}}>x</button>}
          </div>
        </div>
      ))}
      
      {modal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
          <form style={{background:'white', padding:'20px', borderRadius:'10px', width:'100%', maxWidth:'400px'}} onSubmit={(e) => {
            e.preventDefault();
            push(ref(db, 'expenses'), { ...form, date: new Date().toLocaleDateString(), paidBy: currentUser });
            setModal(false); setForm({amount:'', desc:''});
          }}>
            <h3>Προσθήκη Εξόδου</h3>
            <input type="number" required placeholder="Ποσό (€)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input required placeholder="Περιγραφή" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <div style={{display:'flex', gap:'10px'}}>
              <button type="submit" style={{flex:1, padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Καταχώρηση</button>
              <button type="button" onClick={() => setModal(false)} style={{flex:1, padding:'10px', background:'#e2e8f0', border:'none', borderRadius:'8px'}}>Άκυρο</button>
            </div>
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
        onValue(ref(db, 'calendar'), (s) => {
            const d = s.val();
            setEntries(d ? Object.entries(d).map(([id, v]: any) => ({ id, ...v })) : []);
        });
    }, []);

    const addEntry = () => {
        if (!text || !selectedDate) return;
        push(ref(db, 'calendar'), { date: selectedDate, text, addedBy: currentUser });
        setText(''); setSelectedDate(null);
    };

    return (
        <div>
            {DATES.map(date => (
                <div key={date} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px'}}>
                    <h4 style={{margin:0}}>Αύγουστος {date}</h4>
                    <button onClick={() => setSelectedDate(date)} style={{background:'#e0e7ff', color:'#4f46e5', border:'none', padding:'5px', cursor:'pointer', marginTop:'5px'}}>+ Προσθήκη</button>
                    {entries.filter(e => e.date === date).map(e => (
                        <div key={e.id} style={{fontSize:'14px', marginTop:'5px', display:'flex', justifyContent:'space-between'}}>
                            {e.text} <button onClick={() => remove(ref(db, 'calendar/' + e.id))} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>x</button>
                        </div>
                    ))}
                </div>
            ))}
            {selectedDate && (
                <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', zIndex:100}}>
                    <div style={{background:'white', padding:'20px', borderRadius:'10px', width:'300px'}}>
                        <h3>{selectedDate}</h3>
                        <input value={text} onChange={e => setText(e.target.value)} style={{width:'100%', marginBottom:'10px', padding:'10px', boxSizing:'border-box'}} />
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={addEntry} style={{flex:1, padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Προσθήκη</button>
                            <button onClick={() => setSelectedDate(null)} style={{flex:1, padding:'10px', background:'#e2e8f0', border:'none', borderRadius:'8px'}}>Άκυρο</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;