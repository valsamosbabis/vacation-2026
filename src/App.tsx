import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove } from 'firebase/database';

interface Expense { id: string; amount: number; description: string; location: string; user: string; timestamp: number; }
const USERS = ["ΜΠΑΜΠΗΣ", "ΓΙΩΡΓΟΣ", "ΚΩΣΤΑΣ", "ΔΗΜΗΤΡΗΣ", "ΜΑΡΙΛΗ", "ΦΩΦΗ", "ΛΙΤΣΑ", "ΒΑΣΙΛΙΚΗ"];

const App = () => {
  const [activeUser, setActiveUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [tab, setTab] = useState('USERS'); // USERS, MAP, EXPENSES
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
        const loaded = Object.entries(data).map(([id, val]: any) => ({ id, ...val })).sort((a, b) => b.timestamp - a.timestamp);
        setExpenses(loaded);
      }
    });
  }, []);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (!activeUser) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>ΧΙΟΣ 2026</h1>
        {USERS.map(name => <button key={name} onClick={() => {localStorage.setItem('chios_user', name); setActiveUser(name);}} style={{display:'block', width:'100%', padding:'15px', marginBottom:'10px'}}>{name}</button>)}
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', paddingBottom:'80px'}}>
      {/* Περιεχόμενο Tabs */}
      {tab === 'USERS' && (
        <div style={{padding:'20px'}}>
            <h2>Επίλεξε Χρήστη</h2>
            {USERS.map(name => <button key={name} onClick={() => localStorage.setItem('chios_user', name)} style={{padding:'10px', margin:'5px'}}>{name}</button>)}
        </div>
      )}
      {tab === 'MAP' && (
        <div style={{padding:'20px', textAlign:'center'}}>
            <h2>Χάρτης Χίου</h2>
            <div style={{height:'300px', background:'#e0f2fe', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'20px'}}>
                [Χάρτης με κέντρο τη Χίο]
            </div>
            <p>Εδώ θα εμφανίζονται τα σημεία των εξόδων.</p>
        </div>
      )}
      {tab === 'EXPENSES' && (
        <div style={{padding:'20px'}}>
            <h2>Έξοδα: €{totalSpent.toFixed(2)}</h2>
            {expenses.map(exp => (
                <div key={exp.id} style={{borderBottom:'1px solid #ccc', padding:'10px'}}>
                    {exp.description} - €{exp.amount} ({exp.user})
                    <button onClick={() => remove(ref(db, `expenses/${exp.id}`))}>✕</button>
                </div>
            ))}
        </div>
      )}

      {/* Bottom Tabs Navigation */}
      <div style={{position:'fixed', bottom:0, width:'100%', display:'flex', background:'#fff', borderTop:'1px solid #ccc'}}>
        <button onClick={() => setTab('USERS')} style={{flex:1, padding:'15px'}}>Ονόματα</button>
        <button onClick={() => setTab('MAP')} style={{flex:1, padding:'15px'}}>Χάρτης</button>
        <button onClick={() => setTab('EXPENSES')} style={{flex:1, padding:'15px'}}>Έξοδα</button>
      </div>

      {/* Add Button */}
      {tab === 'EXPENSES' && (
          <button onClick={() => setIsModalOpen(true)} style={{position:'fixed', bottom:'70px', right:'20px', width:'50px', height:'50px', borderRadius:'50%'}}>+</button>
      )}
    </div>
  );
};
export default App;