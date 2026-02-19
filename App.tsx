
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import MarketTracker from './components/MarketTracker';
import BotCard from './components/BotCard';
import AIPanel from './components/AIPanel';
import ApiTerminal from './components/ApiTerminal';
import ApiSettings from './components/ApiSettings';
import SentimentSentinel from './components/SentimentSentinel';
import BacktestModule from './components/BacktestModule';
import AcademyModule from './components/AcademyModule';
import StrategyModal from './components/StrategyModal';
import BillingVault from './components/BillingVault';
import SecurityStatusWidget from './components/SecurityStatusWidget';
import { INITIAL_BOTS, INITIAL_PAIRS } from './constants';
import { BotConfig, BotStatus, BotType, TradingPair, ApiLog, BillingTransaction } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bots, setBots] = useState<BotConfig[]>(() => {
    const saved = localStorage.getItem('aegis_bots');
    return saved ? JSON.parse(saved) : INITIAL_BOTS;
  });
  const [pairs, setPairs] = useState<TradingPair[]>(INITIAL_PAIRS);
  const [totalBalance, setTotalBalance] = useState(() => {
    const saved = localStorage.getItem('aegis_balance');
    return saved ? parseFloat(saved) : 42580.45;
  });
  const [aegisCredits, setAegisCredits] = useState(() => {
    const saved = localStorage.getItem('aegis_credits');
    return saved ? parseFloat(saved) : 250.00;
  });
  const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>(() => {
    const saved = localStorage.getItem('aegis_billing');
    return saved ? JSON.parse(saved) : [];
  });
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPanicMode, setIsPanicMode] = useState(() => {
    return localStorage.getItem('aegis_panic') === 'true';
  });
  const [notifications, setNotifications] = useState<{id: string, msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalError = (event: PromiseRejectionEvent) => {
      const errorMsg = event.reason?.message || "";
      if (errorMsg.includes("Gemini API") || errorMsg.includes("quota") || errorMsg.includes("429")) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleGlobalError);
    return () => window.removeEventListener('unhandledrejection', handleGlobalError);
  }, []);

  const showNotification = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const addLog = useCallback((source: ApiLog['source'], message: string, type: ApiLog['type'] = 'INFO') => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      source,
      message,
      type
    };
    setLogs(prev => [...prev.slice(-39), newLog]);
  }, []);

  const addBillingEntry = (amount: number, type: BillingTransaction['type'], botName?: string) => {
    const newEntry: BillingTransaction = {
      id: `TX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      amount,
      type,
      botName,
      status: 'COMPLETED'
    };
    setBillingHistory(prev => [newEntry, ...prev].slice(0, 50));
  };

  useEffect(() => {
    localStorage.setItem('aegis_bots', JSON.stringify(bots));
    localStorage.setItem('aegis_credits', aegisCredits.toString());
    localStorage.setItem('aegis_billing', JSON.stringify(billingHistory));
  }, [bots, aegisCredits, billingHistory]);

  useEffect(() => {
    localStorage.setItem('aegis_balance', totalBalance.toString());
  }, [totalBalance]);

  useEffect(() => {
    localStorage.setItem('aegis_panic', isPanicMode.toString());
  }, [isPanicMode]);

  const handlePanicStop = () => {
    setIsPanicMode(true);
    setBots(prev => prev.map(bot => ({ ...bot, status: BotStatus.PAUSED })));
    addLog('SYSTEM', '!!! EMERGENCY PANIC STOP ACTIVATED !!!', 'ERROR');
    showNotification("MODO DE PÂNICO ATIVADO", "error");
  };

  const handleResetPanic = () => {
    setIsPanicMode(false);
    addLog('SYSTEM', 'Protocolo de Emergência desativado.', 'SUCCESS');
    showNotification("Sistema reativado.", "success");
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    addLog('SYSTEM', 'Protocolo Aegis AI Elite ativo.', 'SUCCESS');
    return () => clearTimeout(timer);
  }, [addLog]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() * 0.0012 - 0.0006)),
        change24h: Number((p.change24h + (Math.random() * 0.06 - 0.03)).toFixed(2))
      })));
      
      const runningBots = bots.filter(b => b.status === BotStatus.RUNNING);
      
      if (!isPanicMode && aegisCredits > 0 && runningBots.length > 0) {
        const profitChange = (Math.random() * 1.5 - 0.2); 
        if (profitChange > 0.5) { 
          const fee = profitChange * 0.05;
          const randomBot = runningBots[Math.floor(Math.random() * runningBots.length)];
          setAegisCredits(prev => Math.max(0, prev - fee));
          addBillingEntry(fee, 'FEE_DEDUCTION', randomBot.name);
          addLog('FINANCE', `Taxa 5% deduzida: $${fee.toFixed(2)} (${randomBot.name})`, 'INFO');
        }
        setTotalBalance(prev => prev + profitChange);
      }
    }, 8000); 
    return () => clearInterval(interval);
  }, [isPanicMode, aegisCredits, bots, addLog]);

  const handleToggleBot = (id: string) => {
    if (isPanicMode) return;
    setBots(prev => prev.map(bot => {
      if (bot.id === id) {
        const isTurningOn = bot.status !== BotStatus.RUNNING;
        showNotification(`${bot.name} ${isTurningOn ? 'Iniciado' : 'Pausado'}`);
        return { ...bot, status: isTurningOn ? BotStatus.RUNNING : BotStatus.IDLE };
      }
      return bot;
    }));
  };

  const handleSaveStrategy = (updatedBot: BotConfig) => {
    setBots(prev => prev.map(b => b.id === updatedBot.id ? updatedBot : b));
    showNotification(`Estratégia atualizada.`, "success");
    setEditingBotId(null);
  };

  const handleAddCredits = () => {
    setAegisCredits(prev => prev + 100);
    addBillingEntry(100, 'DEPOSIT');
    showNotification("Créditos recarregados.", "success");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center animate-pulse mb-8">
          <span className="text-4xl text-white">🛡️</span>
        </div>
        <h2 className="text-white font-black text-xl uppercase tracking-[0.4em] mb-4">Aegis AI Core</h2>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 w-1/2 animate-progress"></div>
        </div>
      </div>
    );
  }

  const renderBotModule = (type: BotType) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {bots.filter(b => b.type === type).map(bot => (
        <BotCard 
          key={bot.id} 
          bot={bot} 
          onToggleStatus={handleToggleBot} 
          onEdit={(id) => setEditingBotId(id)} 
          aegisCredits={aegisCredits}
        />
      ))}
    </div>
  );

  const editingBot = bots.find(b => b.id === editingBotId);
  const totalGrossProfit = bots.reduce((acc, bot) => acc + bot.totalProfit, 0);
  const totalFeesProvisioned = totalGrossProfit * 0.05;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden">
      {editingBot && (
        <StrategyModal 
          bot={editingBot} 
          onClose={() => setEditingBotId(null)} 
          onSave={handleSaveStrategy} 
        />
      )}

      <div className="fixed top-6 right-6 z-[120] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-full pointer-events-auto ${
            n.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' :
            n.type === 'error' ? 'bg-rose-600 border-rose-400 text-white' :
            'bg-indigo-600 border-indigo-400 text-white'
          }`}>
            <span className="font-bold text-sm">{n.msg}</span>
          </div>
        ))}
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 min-h-screen transition-all duration-300 lg:pl-64`}>
        <header className="h-24 border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xl">☰</span>
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isPanicMode ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Aegis Status: {isPanicMode ? 'EMERGENCY' : 'OPTIMAL'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('billing')}>
               <div className="text-right hidden sm:block">
                 <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Vault Balance</p>
                 <p className="text-sm font-bold mono text-white">${totalBalance.toLocaleString()}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">💰</div>
            </div>
            <button onClick={handleAddCredits} className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-lg">+</button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-20">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard label="Capital Protegido" value={`$${totalBalance.toLocaleString()}`} icon="💰" />
                <StatsCard label="Performance Líquida" value={`+$${(totalGrossProfit - totalFeesProvisioned).toFixed(2)}`} icon="📈" />
                <StatsCard label="Créditos Aegis" value={`$${aegisCredits.toFixed(2)}`} icon="💳" />
                <StatsCard label="Fee Performance" value="5%" icon="📉" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <SentimentSentinel />
                  <MarketTracker pairs={pairs} />
                  <ApiTerminal logs={logs} />
                </div>
                <div className="space-y-8">
                  <SecurityStatusWidget />
                  <div className={`p-6 rounded-3xl border ${isPanicMode ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-900/50 border-slate-800'}`}>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">Panic Control</h4>
                    {isPanicMode ? (
                      <button onClick={handleResetPanic} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase text-[10px]">Reativar Aegis</button>
                    ) : (
                      <button onClick={handlePanicStop} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold uppercase text-[10px]">🚨 EMERGÊNCIA</button>
                    )}
                  </div>
                  <AIPanel botType={BotType.CRYPTO} marketData={JSON.stringify(pairs.slice(0, 3))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crypto-bots' && renderBotModule(BotType.CRYPTO)}
          {activeTab === 'meme-bots' && renderBotModule(BotType.MEMECOIN)}
          {activeTab === 'daytrade' && renderBotModule(BotType.DAYTRADE)}
          {activeTab === 'billing' && <BillingVault credits={aegisCredits} transactions={billingHistory} onDeposit={handleAddCredits} />}
          {activeTab === 'backtest' && <BacktestModule />}
          {activeTab === 'academy' && <AcademyModule />}
          {activeTab === 'settings' && <ApiSettings />}
        </div>
      </main>
    </div>
  );
};

export default App;
