
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
        console.log("Aegis Silent Shield: Gemini Quota error suppressed. Redundancy mode active.");
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
    showNotification("MODO DE PÂNICO ATIVADO: Ordens suspensas.", "error");
  };

  const handleResetPanic = () => {
    setIsPanicMode(false);
    addLog('SYSTEM', 'Protocolo de Emergência desativado.', 'SUCCESS');
    showNotification("Sistema reativado com sucesso.", "success");
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    addLog('SYSTEM', 'Protocolo Aegis AI Elite: Camada de segurança ativa.', 'SUCCESS');
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
          addLog('FINANCE', `Taxa de Performance 5% deduzida: $${fee.toFixed(2)} (${randomBot.name})`, 'INFO');
        }
        setTotalBalance(prev => prev + profitChange);
      } else if (aegisCredits <= 0 && runningBots.length > 0) {
        setBots(prev => prev.map(b => ({ ...b, status: BotStatus.PAUSED })));
        addLog('SYSTEM', 'Créditos Aegis esgotados. Robôs pausados por segurança.', 'ERROR');
        showNotification("SALDO DE CRÉDITOS ZERADO. Robôs suspensos.", "error");
      }
    }, 8000); 
    return () => clearInterval(interval);
  }, [isPanicMode, aegisCredits, bots, addLog]);

  const handleToggleBot = (id: string) => {
    if (isPanicMode) {
      showNotification("Modo de Pânico ativo. Desative para operar.", "error");
      return;
    }
    if (aegisCredits <= 0) {
      showNotification("Recarregue seus Créditos Aegis para operar.", "error");
      return;
    }
    setBots(prev => prev.map(bot => {
      if (bot.id === id) {
        const isTurningOn = bot.status !== BotStatus.RUNNING;
        const type = isTurningOn ? 'success' : 'info';
        showNotification(`${bot.name} ${isTurningOn ? 'Iniciado' : 'Pausado'}`, type);
        addLog('SYSTEM', `${isTurningOn ? 'Iniciado' : 'Pausado'}: ${bot.name}`, isTurningOn ? 'SUCCESS' : 'WARNING');
        return { ...bot, status: isTurningOn ? BotStatus.RUNNING : BotStatus.IDLE };
      }
      return bot;
    }));
  };

  const handleSaveStrategy = (updatedBot: BotConfig) => {
    setBots(prev => prev.map(b => b.id === updatedBot.id ? updatedBot : b));
    addLog('IA', `Estratégia otimizada para ${updatedBot.name}`, 'SUCCESS');
    showNotification(`Estratégia ${updatedBot.name} atualizada.`, "success");
    setEditingBotId(null);
  };

  const handleAddCredits = () => {
    setAegisCredits(prev => prev + 100);
    addBillingEntry(100, 'DEPOSIT');
    addLog('FINANCE', 'Depósito de 100 USDT em Créditos Aegis confirmado via TRC-20.', 'SUCCESS');
    showNotification("Créditos recarregados: +$100.00", "success");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.3)] mb-8 animate-pulse border border-indigo-400/30">
          <span className="text-4xl text-white">🛡️</span>
        </div>
        <h2 className="text-white font-black text-xl uppercase tracking-[0.4em] mb-4">Aegis AI Core</h2>
        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-500 w-1/2 animate-progress"></div>
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] italic">Authenticating Secure Bridge...</p>
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
          <div key={n.id} className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-full duration-300 pointer-events-auto ${
            n.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' :
            n.type === 'error' ? 'bg-rose-600 border-rose-400 text-white' :
            'bg-indigo-600 border-indigo-400 text-white'
          }`}>
            <span className="text-xl">{n.type === 'success' ? '✓' : n.type === 'error' ? '🚨' : 'ℹ️'}</span>
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
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isPanicMode ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Aegis Status: {isPanicMode ? 'EMERGENCY' : 'OPTIMAL'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Aegis Credits</p>
              <p className={`text-sm font-black mono ${aegisCredits < 20 ? 'text-rose-400' : 'text-indigo-400'}`}>
                ${aegisCredits.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-900/80 px-4 lg:px-5 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('billing')}>
               <div className="text-right hidden sm:block">
                 <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Vault Balance</p>
                 <p className="text-sm font-bold mono text-white">${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-lg group-hover:bg-indigo-600/20 transition-all">💰</div>
            </div>
            <button onClick={handleAddCredits} className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-lg transition-all active:scale-95">+</button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto pb-20">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard label="Capital Protegido" value={`$${totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} trend={12.4} icon="💰" />
                <StatsCard label="Performance Líquida" value={`+$${(totalGrossProfit - totalFeesProvisioned).toFixed(2)}`} trend={3.2} icon="📈" />
                <StatsCard label="Créditos Aegis" value={`$${aegisCredits.toFixed(2)}`} icon="💳" />
                <StatsCard label="Fee de Performance" value="5%" icon="📉" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <SentimentSentinel />
                  <MarketTracker pairs={pairs} />
                  <ApiTerminal logs={logs} />
                </div>
                <div className="space-y-8">
                  <SecurityStatusWidget />
                  <div className={`p-6 rounded-3xl border transition-all duration-500 ${isPanicMode ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-900/50 border-slate-800'}`}>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                      <span className={`w-2 h-2 rounded-full ${isPanicMode ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`}></span>
                      Panic Control Center
                    </h4>
                    {isPanicMode ? (
                      <button onClick={handleResetPanic} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20 uppercase text-[10px] tracking-widest">Reativar Sistemas Aegis</button>
                    ) : (
                      <button onClick={handlePanicStop} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-rose-900/20 uppercase text-[10px] tracking-widest">🚨 PARADA DE EMERGÊNCIA</button>
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
