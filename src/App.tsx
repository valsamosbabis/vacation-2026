import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, push, onValue, remove, serverTimestamp } from 'firebase/database';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Wallet, 
  Calendar, 
  User as UserIcon,
  ChevronRight,
  X
} from 'lucide-react';

// --- Types ---
interface Expense {
  id: string;
  amount: number;
  description: string;
  location: string;
  user: string;
  timestamp: number;
}

const USERS = ["ΓΙΩΡΓΟΣ", "ΜΑΡΙΑ", "ΚΩΣΤΑΣ", "ΕΛΕΝΗ"];

const App = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('chios_user'));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [loc, setLoc] = useState('');

  // --- Firebase Sync ---
  useEffect(() => {
    const expensesRef = ref(db, 'expenses');
    return onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: any) => ({
          id,
          ...val,
        })).sort((a, b) => b.timestamp - a.timestamp);
        setExpenses(list);
      } else {
        setExpenses([]);
      }
    });
  }, []);

  // --- Actions ---
  const handleLogin = (name: string) => {
    setUser(name);
    localStorage.setItem('chios_user', name);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;

    const expensesRef = ref(db, 'expenses');
    push(expensesRef, {
      amount: parseFloat(amount),
      description: desc,
      location: loc || "Γενικά",
      user: user,
      timestamp: Date.now() // Χρησιμοποιούμε τοπικό timestamp για άμεση εμφάνιση
    });

    setAmount('');
    setDesc('');
    setLoc('');
    setIsModalOpen(false);
  };

  const deleteExpense = (id: string) => {
    if (window.confirm("Διαγραφή αυτής της εγγραφής;")) {
      remove(ref(db, `expenses/${id}`));
    }
  };

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // --- Sub-Components ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ΧΙΟΣ 2026</h1>
            <p className="text-slate-500 mt-2">Shared Expense Tracker</p>
          </div>
          <div className="grid gap-4">
            {USERS.map(name => (
              <button
                key={name}
                onClick={() => handleLogin(name)}
                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-blue-600 hover:text-white transition-all duration-300 group"
              >
                <span className="font-semibold text-lg">{name}</span>
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans pb-24">
      {/* Header */}
      <header className="bg-[#1e3a8a] text-white p-6 pt-12 rounded-b-[40px] shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest">Συνολικά Έξοδα</p>
            <h2 className="text-4xl font-bold mt-1">€{totalAmount.toFixed(2)}</h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-400/30">
              <UserIcon size={18} />
              <span className="font-medium">{user}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4">
        {/* Timeline List */}
        <div className="space-y-4">
          {expenses.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Wallet size={48} className="mx-auto mb-4 opacity-20" />
              <p>Δεν υπάρχουν εγγραφές ακόμα</p>
            </div>
          )}
          
          {expenses.map((exp) => (
            <div key={exp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex justify-between items-center group animate-in fade-in slide-in-from-bottom-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    {exp.user}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(exp.timestamp).toLocaleDateString('el-GR')}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800">{exp.description}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" />
                  {exp.location}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-slate-900">
                  €{exp.amount.toFixed(2)}
                </span>
                <button 
                  onClick={() => deleteExpense(exp.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 border-4 border-white"
      >
        <Plus size={32} />
      </button>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Προσθήκη Εξόδου</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ποσό (€)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Τι αγοράσατε;</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. Καφέδες, Ταβέρνα"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Τοποθεσία (Χάρτης)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="π.χ. Μεστά, Μαύρα Βόλια"
                  />
                  <MapPin className="absolute left-4 top-4 text-blue-500" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#1e3a8a] text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition-colors text-lg"
              >
                ΚΑΤΑΧΩΡΗΣΗ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;