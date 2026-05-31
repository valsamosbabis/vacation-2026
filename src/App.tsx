import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

interface Expense {
  id: string;
  amount: number;
  description: string;
  location: string;
  user: string;
  timestamp: number;
}

const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];

const App = () => {
  const [activeUser, setActiveUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const expensesRef = ref(db, 'expenses');
    return onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedExpenses = Object.entries(data).map(([id, val]: any) => ({
          id,
          ...val,
        })).sort((a, b) => b.timestamp - a.timestamp);
        setExpenses(loadedExpenses);
      } else {
        setExpenses([]);
      }
    });
  }, []);

  const login = (name: string) => {
    setActiveUser(name);
    localStorage.setItem('chios_user', name);
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    push(ref(db, 'expenses'), {
      amount: parseFloat(amount),
      description: description,
      location: location || "Χίος",
      user: activeUser,
      timestamp: Date.now()
    });
    setAmount(''); setDescription(''); setLocation(''); setIsModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    if (window.confirm("Διαγραφή αυτής της εγγραφής;")) {
      remove(ref(db, `expenses/${id}`));
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (!activeUser) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px', fontFamily: 'sans-serif'}}>
        <h1 style={{color: '#1e3a8a', marginBottom: '30px', fontWeight: 'bold'}}>ΧΙΟΣ 2026</h1>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '400px'}}>
          {USERS.map(name => (
            <button key={name} onClick={() => login(name)} style={{padding: '16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'}}>
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '100px'}}>
      <header style={{background: '#1e3a8a', color: 'white', padding: '40px 20px', borderRadius: '0 0 30px 30px', textAlign: 'center'}}>
        <p style={{fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px'}}>Συνολικά Έξοδα</p>
        <h2 style={{fontSize: '40px', fontWeight: 'bold', margin: '10px 0'}}>€{totalSpent.toFixed(2)}</h2>
        <div style={{background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '13px'}}>
          Χρήστης: {activeUser}
        </div>
      </header>

      <main style={{padding: '20px', maxWidth: '500px', margin: '0 auto'}}>
        {expenses.map((exp) => (
          <div key={exp.id} style={{background: 'white', padding: '16px', borderRadius: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
            <div>
              <div style={{fontWeight: 'bold', fontSize: '16px'}}>{exp.description}</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                {exp.location} • {new Date(exp.timestamp).toLocaleDateString('el-GR')} • {exp.user}
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              <span style={{fontWeight: '900', fontSize: '16px'}}>€{exp.amount.toFixed(2)}</span>
              <button onClick={() => deleteExpense(exp.id)} style={{background: '#fee2e2', border: 'none', color: '#dc2626', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px'}}>✕</button>
            </div>
          </div>
        ))}
      </main>

      <button onClick={() => setIsModalOpen(true)} style={{position: 'fixed', bottom: '25px', right: '25px', width: '65px', height: '65px', borderRadius: '50%', background: '#1e3a8a', color: 'white', fontSize: '32px', border: 'none', boxShadow: '0 6px 20px rgba(30,58,138,0.4)', cursor: 'pointer'}}>
        +
      </button>

      {isModalOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', zIndex: 100}}>
          <form onSubmit={submitExpense} style={{background: 'white', width: '100%', padding: '30px', borderRadius: '30px 30px 0 0', boxSizing: 'border-box'}}>
            <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '20px'}}>Νέα Καταχώρηση</h3>
            <input type="number" step="0.01" placeholder="Ποσό (€)" value={amount} onChange={e => setAmount(e.target.value)} required style={{width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px'}} />
            <input type="text" placeholder="Περιγραφή" value={description} onChange={e => setDescription(e.target.value)} required style={{width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px'}} />
            <input type="text" placeholder="Τοποθεσία" value={location} onChange={e => setLocation(e.target.value)} style={{width: '100%', padding: '16px', marginBottom: '25px', borderRadius: '14px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '16px'}} />
            <button type="submit" style={{width: '100%', padding: '18px', background: '#1e3a8a', color: 'white', borderRadius: '14px', border: 'none', fontWeight: 'bold', fontSize: '16px'}}>ΑΠΟΘΗΚΕΥΣΗ</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;