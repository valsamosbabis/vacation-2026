import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];
const ADMINS = ["ΔΗΜΗΤΡΗΣ", "ΓΙΩΡΓΟΣ", "ΜΠΑΜΠΗΣ", "ΚΩΣΤΑΣ"];
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
        {activeTab === 'Έξοδα' && <ExpensesView currentUser={user} />}
        {activeTab === 'Ημερολόγιο' && <CalendarView currentUser={user} />}
      </div>
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
  const unit = total / 15;

  return (
    <div>
      <div style={{background:'#fff', padding:'15px', borderRadius:'12px', marginBottom:'20px', border:'1px solid #e2e8f0'}}>
        <h4 style={{margin:'0 0 10px'}}>Οφειλές (Σύνολο: {total.toFixed(2)}€)</h4>
        <div style={{fontSize:'14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <p>Γιώργος (3/15): <strong>{(unit * 3).toFixed(2)}€</strong></p>
            <p>Δημήτρης (4/15): <strong>{(unit * 4).toFixed(2)}€</strong></p>
            <p>Μπάμπης (4/15): <strong>{(unit * 4).toFixed(2)}€</strong></p>
            <p>Κώστας (4/15): <strong>{(unit * 4).toFixed(2)}€</strong></p>
        </div>
      </div>

      {ADMINS.includes(currentUser) && (
        <button onClick={() => setModal(true)} style={{width:'100%', padding:'12px', background:'#22c55e', color:'white', border:'none', borderRadius:'8px', marginBottom:'20px', fontWeight:'bold'}}>+ Προσθήκη Εξόδου</button>
      )}

      {expenses.map(e => (
        <div key={e.id} style={{background:'white', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontWeight:'bold'}}>{e.desc}</div>
            <div style={{fontSize:'12px', color:'#64748b'}}>{e.date} • Πληρώθηκε από: {e.paidBy}</div>
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
            <input type="number" placeholder="Ποσό (€)" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <input placeholder="Περιγραφή" required value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}} />
            <button type="submit" style={{width:'100%', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px'}}>Καταχώρηση</button>
          </form>
        </div>
      )}
    </div>
  );
};

// ... SightsView και CalendarView παραμένουν όπως στο κ11 ...