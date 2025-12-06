import { useState, useEffect } from 'react';
import { BookOpen, Coffee, Skull, Heart, Award, Briefcase, Zap, Clock, AlertTriangle, ArrowRight, Sparkles, Flame, CheckCircle2, History, X, ChevronRight, Dices, Eye, Palette, Ghost, Link as LinkIcon, Target, Github, Trophy, Lock, RotateCcw, Infinity, Wrench } from 'lucide-react';
import { EVENTS_POOL } from './static/event-pool';
import { ACHIEVEMENTS_DATA } from './static/achievements-data';
import { TRAITS } from './static/traits';

// --- 游戏配置 ---
const MAX_TURNS = 36; // 36个月 (3年制)

const INITIAL_STATS_BASE = {
  sanity: 70,
  health: 70,
  research: 0,
  affinity: 40,
  knowledge: 0
};

// --- 新增：隐藏人设配置 ---
const HIDDEN_TRAIT = {
  id: 'hidden_chosen_one',
  name: '事无巨细',
  desc: '你似乎洞悉了这个世界的因果律...（探索分支超 20 条）',
  statsDesc: '全属性小幅提升，初始自带大量知识',
  icon: Sparkles,
  color: 'from-fuchsia-600 to-purple-600', // 独特的紫色系
  stats: {
    sanity: 20,    // 基础70+20=90
    health: 20,    // 基础70+20=90
    research: 20,  // 初始自带科研进度
    affinity: 10,
    knowledge: 50  // 高额初始知识
  }
};

// 危险等级样式配置
const RISK_CONFIG = {
  LOW: {
    label: '日常琐事',
    icon: Coffee,
    color: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cardBorder: 'border-emerald-200',
    cardShadow: 'shadow-emerald-100',
    bgGradient: 'from-emerald-50/40 to-white'
  },
  MEDIUM: {
    label: '关键节点',
    icon: AlertTriangle,
    color: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    cardBorder: 'border-amber-200',
    cardShadow: 'shadow-amber-100',
    bgGradient: 'from-amber-50/40 to-white'
  },
  HIGH: {
    label: '高危警报',
    icon: Flame,
    color: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    cardBorder: 'border-rose-300',
    cardShadow: 'shadow-rose-100',
    bgGradient: 'from-rose-50/40 to-white'
  },
  ANOMALY: {
    label: '时空异象',
    icon: Ghost,
    color: 'text-purple-300',
    badge: 'bg-purple-900/80 text-purple-200 border-purple-500 animate-pulse',
    cardBorder: 'border-purple-500',
    cardShadow: 'shadow-purple-900',
    bgGradient: 'from-slate-900 to-slate-800'
  },
  CHAIN: { // 专属连锁事件样式
    label: '因果连锁',
    icon: LinkIcon,
    color: 'text-indigo-100',
    badge: 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-200',
    cardBorder: 'border-indigo-500 border-4',
    cardShadow: 'shadow-2xl shadow-indigo-900/50',
    bgGradient: 'from-slate-800 to-indigo-950'
  }
};

// --- 辅助函数 ---
const getRandomEvent = (currentTurn, recentEvents, pendingChainEvents) => {
  // 1. 优先处理连锁事件
  if (pendingChainEvents.length > 0) {
    const nextChain = pendingChainEvents[0];
    const fullEvent = EVENTS_POOL.find(e => e.id === nextChain.id);
    if (fullEvent) return { event: fullEvent, isChain: true };
  }

  // 2. 增加极小概率触发异象事件
  const anomalyChance = Math.random();
  if (anomalyChance < 0.05) {
    const anomalyEvents = EVENTS_POOL.filter(e => e.risk === 'ANOMALY');
    if (anomalyEvents.length > 0) {
      const anomaly = anomalyEvents[Math.floor(Math.random() * anomalyEvents.length)];
      if (!recentEvents.includes(anomaly.id)) {
        return { event: anomaly, isChain: false };
      }
    }
  }

  // 3. 随机池过滤
  let pool = EVENTS_POOL.filter(e => !e.isChain && !recentEvents.includes(e.id) && e.risk !== 'ANOMALY');
  if (pool.length === 0) pool = EVENTS_POOL.filter(e => !e.isChain && e.risk !== 'ANOMALY');

  const selected = pool[Math.floor(Math.random() * pool.length)];
  if (!selected) {
    return { event: EVENTS_POOL.find(e => !e.isChain) || EVENTS_POOL[0], isChain: false };
  }

  return { event: selected, isChain: false };
};

const GradStudentSimulator = () => {
  // 游戏主状态
  const [phase, setPhase] = useState('CHARACTER_CREATION');
  const [turn, setTurn] = useState(1);
  const [stats, setStats] = useState(INITIAL_STATS_BASE);
  const [selectedTrait, setSelectedTrait] = useState(null);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [isCurrentEventChain, setIsCurrentEventChain] = useState(false);

  const [resultLog, setResultLog] = useState(null);
  const [endState, setEndState] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // --- 本地调试模式检测 ---
  const isDebugMode = typeof window !== 'undefined' && window.location.hostname.startsWith('localhost');

  // --- 回溯相关状态 ---
  const [hasUnlockedRewind, setHasUnlockedRewind] = useState(() => {
    try {
      return localStorage.getItem('gradSim_hasUnlockedRewind') === 'true';
    } catch { return false; }
  });

  const [rewindCount, setRewindCount] = useState(() => {
    try {
      const saved = localStorage.getItem('gradSim_rewindCount');
      return saved ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  });

  const [backupState, setBackupState] = useState(null);

  // 用于播放回溯特效的状态
  const [isRewinding, setIsRewinding] = useState(false);

  // 历史与逻辑控制
  const [historyLog, setHistoryLog] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 存档数据
  const [seenOutcomes, setSeenOutcomes] = useState(() => {
    try {
      const saved = localStorage.getItem('gradSim_seenOutcomes');
      if (saved) {
        const parsed = JSON.parse(saved);
        const reconstructed = {};
        Object.keys(parsed).forEach(key => reconstructed[key] = new Set(parsed[key]));
        return reconstructed;
      }
    } catch { }
    return {};
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const totalExploredBranches = Object.values(seenOutcomes).reduce((acc, set) => acc + set.size, 0);

  // 初始化加载成就
  useEffect(() => {
    try {
      const savedAch = localStorage.getItem('gradSim_achievements');
      if (savedAch) setUnlockedAchievements(new Set(JSON.parse(savedAch)));
    } catch { }
  }, []);

  // 持久化保存
  useEffect(() => {
    try {
      const serializedOutcomes = {};
      Object.keys(seenOutcomes).forEach(key => serializedOutcomes[key] = Array.from(seenOutcomes[key]));
      localStorage.setItem('gradSim_seenOutcomes', JSON.stringify(serializedOutcomes));
      localStorage.setItem('gradSim_achievements', JSON.stringify(Array.from(unlockedAchievements)));

      localStorage.setItem('gradSim_rewindCount', rewindCount.toString());
      localStorage.setItem('gradSim_hasUnlockedRewind', hasUnlockedRewind.toString());
    } catch { }
  }, [seenOutcomes, unlockedAchievements, rewindCount, hasUnlockedRewind]);

  const [recentEvents, setRecentEvents] = useState([]);
  const [pendingChainEvents, setPendingChainEvents] = useState([]);

  const [isReviewingEvent, setIsReviewingEvent] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const resetGame = () => {
    setStats({ ...INITIAL_STATS_BASE });
    setTurn(1);
    setHistoryLog([]);
    setRecentEvents([]);
    setPendingChainEvents([]);
    setSelectedTrait(null);
    setResultLog(null);
    setCurrentEvent(null);
    setEndState(null);
    setBackupState(null);
    setPhase('CHARACTER_CREATION');
  };

  const checkGameOver = () => {
    const endingIds = getUnlockedEndingIds(turn, stats);

    if (endingIds.length > 0) {
      let newSet = new Set(unlockedAchievements);
      endingIds.forEach(id => newSet.add(id));
      setUnlockedAchievements(newSet);

      let primaryEnding = null;
      for (const ach of ACHIEVEMENTS_DATA) {
        if (endingIds.includes(ach.id)) {
          primaryEnding = ach;
          break;
        }
      }

      const allUnlocked = ACHIEVEMENTS_DATA.filter(ach => endingIds.includes(ach.id));
      const isWin = stats.research >= 100;
      const type = isWin ? "HAPPY" : (primaryEnding.id === 'fish_master' || primaryEnding.id === 'deferred' ? "NEUTRAL" : "BAD");

      // --- 结算奖励处理 ---
      let gainedRewinds = 0;
      let firstUnlock = false;

      if (isWin) {
        // 如果是第一次赢，解锁功能
        if (!hasUnlockedRewind) {
          setHasUnlockedRewind(true);
          firstUnlock = true;
        }
        // 每次毕业都 +2
        setRewindCount(prev => prev + 2);
        gainedRewinds = 2;
      }

      setPhase('END');
      setEndState({
        type,
        primary: primaryEnding,
        all: allUnlocked,
        gainedRewinds,
        firstUnlock
      });
      return true;
    }
    return false;
  };

  // 结局判定函数
  const getUnlockedEndingIds = (turn, stats) => {
    const { sanity, health, affinity, knowledge, research } = stats;
    const ids = [];
    if (research >= 100) {
      if (turn <= 6) ids.push('speed_run_6');
      if (sanity >= 100 && health >= 100 && affinity >= 100 && knowledge >= 100) ids.push('god_mode');
      if (turn <= 12) ids.push('speed_run_12');
      if (sanity >= 80 && health >= 80 && affinity >= 80 && knowledge >= 80) ids.push('hexagon');
      if (knowledge >= 90) ids.push('nobel_reserve');
      if (affinity >= 90) ids.push('head_disciple');
      if (health >= 90) ids.push('health_master');
      if (sanity >= 90) ids.push('zen_master');
      if (health <= 20) ids.push('battle_scarred');
      if (sanity <= 20) ids.push('cthulhu');
      if (affinity <= 20) ids.push('lone_wolf');
      if (knowledge < 30) ids.push('lucky_dog');
      if (ids.length === 0) ids.push('normal_grad');
      return ids;
    }
    if (sanity <= 0 || health <= 0 || affinity <= 0) {
      if (turn <= 1) ids.push('instant_death');
      if (research >= 95) ids.push('almost_there');
      if (sanity <= 0) ids.push('sanity_zero');
      if (health <= 0) ids.push('health_zero');
      if (affinity <= 0) ids.push('affinity_zero');
      return ids;
    }
    if (turn > MAX_TURNS) {
      if (sanity > 80 && health > 80) ids.push('fish_master');
      else ids.push('deferred');
      return ids;
    }
    return [];
  };

  const applyTrait = (trait) => {
    setSelectedTrait(trait);
    const newStats = { ...INITIAL_STATS_BASE };
    Object.keys(trait.stats).forEach(key => {
      newStats[key] = Math.max(0, newStats[key] + trait.stats[key]);
    });
    setStats(newStats);
    setPhase('START');
  };

  const startGame = () => {
    setTurn(1);
    setHistoryLog([]);
    setRecentEvents([]);
    setPendingChainEvents([]);
    generateNextEvent(1, [], []);
    setPhase('EVENT_SELECTION');
    setAnimKey(prev => prev + 1);
  };

  const generateNextEvent = (turnNum, recent, pending) => {
    const { event, isChain } = getRandomEvent(turnNum, recent, pending);
    setCurrentEvent(event);
    setIsCurrentEventChain(isChain);
    if (isChain) setPendingChainEvents(prev => prev.slice(1));
  };

  const handleChoice = (choice, choiceIndex, isGamble = false) => {
    if (!currentEvent) return;

    // --- 保存快照 ---
    setBackupState({
      stats: { ...stats },
      historyLog: [...historyLog],
      recentEvents: [...recentEvents],
      pendingChainEvents: [...pendingChainEvents]
    });

    const result = choice.resolve();

    const idxKey = isGamble ? 999 : choiceIndex;
    const outcomeKey = `${currentEvent.id}_${idxKey}`;
    const newSeenOutcomes = { ...seenOutcomes };
    if (!newSeenOutcomes[outcomeKey]) {
      newSeenOutcomes[outcomeKey] = new Set();
    }
    newSeenOutcomes[outcomeKey].add(result.text);
    setSeenOutcomes(newSeenOutcomes);

    if (result.chain && Math.random() < 0.8) {
      setPendingChainEvents(prev => [...prev, { id: result.chain }]);
    }

    const newRecent = [currentEvent.id, ...recentEvents].slice(0, 5);
    setRecentEvents(newRecent);

    setHistoryLog(prev => [...prev, {
      turn,
      eventTitle: currentEvent.title,
      choiceText: choice.text,
      outcomeText: result.text,
      statsChange: result.stats || {},
      isBad: (result.stats?.sanity < 0 || result.stats?.health < 0)
    }]);

    setStats(prev => ({
      ...prev,
      sanity: Math.min(100, Math.max(0, prev.sanity + (result.stats?.sanity || 0))),
      health: Math.min(100, Math.max(0, prev.health + (result.stats?.health || 0))),
      research: Math.min(100, Math.max(0, prev.research + (result.stats?.research || 0))),
      affinity: Math.min(100, Math.max(0, prev.affinity + (result.stats?.affinity || 0))),
      knowledge: Math.max(0, prev.knowledge + (result.stats?.knowledge || 0)),
    }));

    setResultLog({
      choiceText: choice.text,
      outcomeText: result.text,
      statsChange: result.stats || {},
      outcomeKey: outcomeKey
    });
    setPhase('EVENT_RESULT');
    setIsReviewingEvent(false);
    setAnimKey(prev => prev + 1);
  };

  // --- 调试功能：修改当前事件结果 ---
  const handleDebugUpdate = (key, delta) => {
    // 1. 更新实际属性值
    setStats(prev => ({
      ...prev,
      // 知识没有上限，其他属性0-100
      [key]: key === 'knowledge'
        ? Math.max(0, prev[key] + delta)
        : Math.min(100, Math.max(0, prev[key] + delta))
    }));

    // 2. 更新结果日志显示
    if (resultLog) {
      setResultLog(prev => ({
        ...prev,
        statsChange: {
          ...prev.statsChange,
          [key]: (prev.statsChange[key] || 0) + delta
        }
      }));
    }

    // 3. 更新历史记录一致性
    setHistoryLog(prev => {
      const newLog = [...prev];
      const lastIdx = newLog.length - 1;
      if (lastIdx >= 0) {
        const lastEntry = { ...newLog[lastIdx] };
        lastEntry.statsChange = {
          ...lastEntry.statsChange,
          [key]: (lastEntry.statsChange[key] || 0) + delta
        };
        newLog[lastIdx] = lastEntry;
      }
      return newLog;
    });
  };

  // --- 时光回溯逻辑 ---
  const handleRewind = () => {
    if (rewindCount <= 0 || !backupState) return;

    // 播放全屏特效
    setIsRewinding(true);

    // 延迟执行实际回滚，让特效展示
    setTimeout(() => {
      setRewindCount(prev => Math.max(0, prev - 1));

      // 恢复状态
      setStats(backupState.stats);
      setHistoryLog(backupState.historyLog);
      setRecentEvents(backupState.recentEvents);
      setPendingChainEvents(backupState.pendingChainEvents);

      setResultLog(null);
      setPhase('EVENT_SELECTION');
      setIsReviewingEvent(false);
      setBackupState(null);
      setIsRewinding(false);
    }, 1500); // 1.5秒后完成回溯
  };

  const nextTurn = () => {
    if (checkGameOver()) return;

    const nextTurnNum = turn + 1;
    setTurn(nextTurnNum);
    generateNextEvent(nextTurnNum, recentEvents, pendingChainEvents);
    setPhase('EVENT_SELECTION');
    setResultLog(null);
    setBackupState(null);
    setAnimKey(prev => prev + 1);
  };

  const isAnomaly = currentEvent?.risk === 'ANOMALY';

  // --- 样式定义 ---
  const styles = `
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.95) translateY(5px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes slideUp {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes anomalyPulse {
      0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
      50% { background-position: 100% 50%; filter: hue-rotate(15deg); }
      100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
    }
    @keyframes rewindFlash {
        0% { opacity: 0; transform: scale(1.1); filter: hue-rotate(0deg); }
        20% { opacity: 1; background: white; }
        100% { opacity: 0; transform: scale(1); filter: hue-rotate(-90deg); }
    }
    .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .anomaly-bg {
        background: linear-gradient(270deg, #1a1a2e, #16213e, #2d1b4e);
        background-size: 600% 600%;
        animation: anomalyPulse 8s ease infinite;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `;

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row justify-center transition-colors duration-1000 ${isAnomaly ? 'anomaly-bg text-purple-100' : 'bg-[#f1f5f9] text-slate-800'}`}>
      <style>{styles}</style>

      {/* 回溯全屏特效 */}
      {isRewinding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900 pointer-events-none animate-[rewindFlash_1.5s_ease-in-out_forwards]">
          <div className="text-center text-white space-y-4">
            <RotateCcw size={64} className="mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.5s' }} />
            <h2 className="text-2xl font-black tracking-widest uppercase">Time Rewind</h2>
            <p className="text-indigo-200">检测到时空因果逆转...</p>
          </div>
        </div>
      )}

      {/* 左侧历史记录栏 (PC端) */}
      <aside className={`hidden lg:flex w-72 flex-col h-screen sticky top-0 border-r shadow-sm z-10 transition-colors duration-500 ${isAnomaly ? 'bg-slate-900/50 border-purple-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b ${isAnomaly ? 'border-purple-800 bg-purple-900/20' : 'border-slate-100 bg-slate-50/50'}`}>
          <h2 className={`font-bold flex items-center gap-2 ${isAnomaly ? 'text-purple-300' : 'text-slate-700'}`}>
            <History size={18} className={isAnomaly ? 'text-purple-400' : 'text-indigo-500'} />
            研究日志
          </h2>
          <p className={`text-xs mt-1 ${isAnomaly ? 'text-purple-400/60' : 'text-slate-400'}`}>记录你的每一步抉择</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {historyLog.slice().reverse().map((log, i) => (
            <HistoryItem key={i} log={log} isAnomaly={isAnomaly} />
          ))}
        </div>
      </aside>

      {/* 移动端历史记录 Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
          <div className="bg-white w-full sm:w-96 h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18} /> 历史记录</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {historyLog.slice().reverse().map((log, i) => (
                <HistoryItem key={i} log={log} isMobile={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 成就墙 Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4" onClick={() => setShowAchievementModal(false)}>
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col shadow-2xl animate-pop-in overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500" /> 成就墙</h3>
                <p className="text-xs text-slate-500 mt-1">
                  已解锁: {unlockedAchievements.size} / {ACHIEVEMENTS_DATA.length}
                  <span className="mx-2">|</span>
                  <span className="text-xs text-slate-500">已探索分支: {totalExploredBranches}</span>
                </p>
              </div>
              <button onClick={() => setShowAchievementModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {ACHIEVEMENTS_DATA.map((ach) => {
                  const isUnlocked = unlockedAchievements.has(ach.id);
                  return (
                    <div key={ach.id} className={`p-4 rounded-xl border-2 flex flex-col h-full transition-all duration-300 ${isUnlocked ? `bg-white ${ach.border} shadow-sm` : 'bg-slate-100 border-slate-200 opacity-80'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${isUnlocked ? ach.bg : 'bg-slate-200'}`}>
                          {isUnlocked ? <ach.icon size={20} className={ach.color.replace('text-', 'text-')} /> : <Lock size={20} className="text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>{isUnlocked ? ach.title : '???'}</h4>
                        </div>
                      </div>
                      {isUnlocked ? (
                        <>
                          <p className="text-xs text-slate-600 mb-2 flex-1">{ach.desc}</p>
                          <div className="mt-auto pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{ach.condition}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-xs text-slate-400 text-center italic">解锁条件:<br />{ach.condition}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主游戏区域 */}
      <div className="max-w-3xl w-full p-2 md:p-8 flex flex-col min-h-screen gap-3 relative pb-safe">

        {/* 顶部栏 */}
        <header className={`grid grid-cols-[auto_1fr_auto] md:flex md:items-center items-center gap-2 md:gap-3 p-3 rounded-2xl shadow-sm border transition-colors duration-500 ${isAnomaly ? 'bg-slate-900 border-purple-700' : 'bg-white border-slate-200'}`}>
          {/* Logo Icon */}
          <button
            onClick={() => setShowAchievementModal(true)}
            className={`p-2 rounded-xl shadow-lg text-white hover:scale-105 active:scale-95 transition-transform ${isAnomaly ? 'bg-purple-900 shadow-purple-900' : 'bg-gradient-to-br from-amber-300 to-amber-600 shadow-amber-400/50'}`}
            title="查看成就墙"
          >
            {isAnomaly ? <Ghost className="w-5 h-5 animate-bounce" /> : <Trophy className="w-5 h-5" />}
          </button>

          {/* Title & Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-extrabold text-sm md:text-lg leading-tight truncate ${isAnomaly ? 'text-purple-200' : 'text-slate-800'}`}>研究生模拟器</h1>
              <a href="https://github.com/Kiritorz" target="_blank" rel="noopener noreferrer" className={`opacity-50 hover:opacity-100 transition-opacity ${isAnomaly ? 'text-purple-300' : 'text-slate-400 hover:text-slate-700'}`}>
                <Github size={16} />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-medium mt-0.5">
              <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 ${isAnomaly ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-100 text-slate-500'}`}>
                <Clock size={10} className={isAnomaly ? 'text-purple-400' : 'text-indigo-600'} />
                <span>M <span className={`font-bold ${isAnomaly ? 'text-purple-400' : 'text-indigo-700'}`}>{turn}</span>/{MAX_TURNS}</span>
              </div>
              <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${isAnomaly ? 'border-purple-500/30 text-purple-400' : 'border-slate-200 text-slate-500'}`}>
                <Target size={10} />
                <span className="truncate">毕业要求: 科研 100%</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            {/* 已移除顶部栏回溯次数显示 */}

            <div className={`flex flex-col items-end md:hidden ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>
              <span className="text-[10px] font-bold opacity-60 uppercase">Knw.</span>
              <span className="font-mono text-sm font-black leading-none">{stats.knowledge}</span>
            </div>

            <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-help transition-colors ${isAnomaly ? 'bg-slate-900 border-purple-800' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`p-1.5 rounded-lg border ${isAnomaly ? 'bg-slate-800 border-purple-800 text-purple-400' : 'bg-white border-slate-100 text-indigo-900'}`}>
                <Briefcase size={16} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isAnomaly ? 'text-purple-500' : 'text-slate-400'}`}>知识</span>
                <span className={`font-mono text-base font-black leading-none ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>{stats.knowledge}</span>
              </div>
            </div>

            <button onClick={() => setShowHistoryModal(true)} className={`lg:hidden p-2 border rounded-xl shadow-sm ${isAnomaly ? 'bg-slate-900 border-purple-800 text-purple-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <History size={18} />
            </button>
          </div>
        </header>

        {/* 状态面板 */}
        {phase !== 'CHARACTER_CREATION' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard icon={Zap} label="SAN值" value={stats.sanity} isAnomaly={isAnomaly} color="text-yellow-600" barColor="bg-yellow-500" borderColor="border-yellow-200" shadow="shadow-yellow-100" />
            <StatCard icon={Skull} label="发量" value={stats.health} isAnomaly={isAnomaly} color="text-rose-600" barColor="bg-rose-500" borderColor="border-rose-200" shadow="shadow-rose-100" />
            <StatCard icon={Award} label="科研" value={stats.research} isAnomaly={isAnomaly} color="text-blue-600" barColor="bg-blue-500" borderColor="border-blue-200" shadow="shadow-blue-100" />
            <StatCard icon={Heart} label="导师好感" value={stats.affinity} isAnomaly={isAnomaly} color="text-pink-600" barColor="bg-pink-500" borderColor="border-pink-200" shadow="shadow-pink-100" />
          </div>
        )}

        {/* 游戏内容区 */}
        <main className="flex-1 flex flex-col relative min-h-0">

          {/* 阶段：特征选择 (开局) */}
          {phase === 'CHARACTER_CREATION' && (
            <div className="flex-1 flex flex-col animate-pop-in mt-2 pb-6">
              <div className="text-center mb-4">
                <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
                  <Palette className="text-indigo-500" size={24} /> 选择你的人设
                </h2>
                <p className="text-slate-500 text-xs md:text-sm mt-1">不同的特质决定了你的初始属性和生存策略</p>
                {/* 已移除此处的回溯次数显示 */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 md:grid-cols-2">
                {(totalExploredBranches > 20 ? [HIDDEN_TRAIT, ...TRAITS] : TRAITS).map((trait) => (
                  <button
                    key={trait.id}
                    onClick={() => applyTrait(trait)}
                    className={`bg-white p-4 md:p-5 rounded-2xl border-2 border-slate-100 md:hover:border-indigo-300 md:hover:shadow-lg transition-all text-left group relative overflow-hidden flex flex-col h-full md:active:scale-100 
        ${trait.id === HIDDEN_TRAIT.id ? 'border-fuchsia-200 shadow-fuchsia-100 md:col-span-2' : 'md:col-span-1'}
      `}
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${trait.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                    <div className="flex items-center mb-4 w-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trait.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                        <trait.icon size={20} />
                      </div>
                      <div className="flex flex-col justify-between self-stretch ml-3">
                        <h3 className={`font-bold text-base md:text-lg leading-tight ${trait.id === HIDDEN_TRAIT.id ? 'text-fuchsia-700' : 'text-slate-800'}`}>
                          {trait.name}
                        </h3>
                        <p className="text-slate-500 text-xs font-medium">
                          {trait.desc}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                      {trait.statsDesc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 阶段：开始游戏 */}
          {phase === 'START' && (
            <div className="flex-1 flex flex-col animate-pop-in mt-4">
              {/* 移除了 text-center 和 items-center，让卡片自然填充宽度 */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 w-full text-center">
                <div className="mb-6 flex justify-center">
                  <div className="bg-slate-50 p-5 rounded-full border border-slate-100">
                    <Sparkles className="w-12 h-12 text-indigo-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-2 text-slate-800">入学手续办理完成</h2>
                <div className="text-slate-500 mb-8 text-sm">
                  你的身份是：<span className="font-bold text-indigo-600">{selectedTrait?.name}</span>
                </div>
                <button onClick={startGame} className="w-full bg-slate-900 md:hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 md:active:scale-100">
                  <BookOpen size={20} />
                  开始研一生活
                </button>
              </div>
            </div>
          )}

          {/* 阶段：事件选择 */}
          {phase === 'EVENT_SELECTION' && currentEvent && (
            <div key={animKey} className="flex-1 flex flex-col animate-slide-up pb-2">
              {(() => {
                let risk = RISK_CONFIG[currentEvent.risk || 'LOW'];
                if (isCurrentEventChain && currentEvent.risk !== 'ANOMALY') {
                  risk = RISK_CONFIG.CHAIN;
                }
                const RiskIcon = risk.icon;
                return (
                  <div className={`bg-gradient-to-br ${risk.bgGradient} p-4 md:p-8 rounded-[2rem] shadow-sm ${risk.cardShadow} border ${risk.cardBorder} mb-2 relative overflow-hidden transition-all duration-500`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit border ${risk.badge}`}>
                        <RiskIcon size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{risk.label}</span>
                      </div>
                    </div>
                    <h2 className={`text-lg md:text-2xl font-black mb-2 md:mb-3 leading-tight ${isAnomaly ? 'text-purple-100' : (isCurrentEventChain ? 'text-indigo-100' : 'text-slate-800')}`}>
                      {currentEvent.title}
                    </h2>
                    <p className={`leading-relaxed text-sm md:text-base font-medium ${isAnomaly ? 'text-purple-200/80' : (isCurrentEventChain ? 'text-indigo-200' : 'text-slate-600')}`}>
                      {currentEvent.description}
                    </p>
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2 mt-auto min-h-[260px] md:min-h-[180px] justify-end pb-6 md:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                  {currentEvent.choices.map((choice, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChoice(choice, idx)}
                      className={`h-full border-2 p-3 md:p-5 rounded-2xl text-left transition-all duration-200 md:hover:-translate-y-1 shadow-sm md:hover:shadow-md group relative overflow-hidden flex flex-col justify-between md:active:scale-100 
                        ${isAnomaly
                          ? 'bg-slate-800 border-purple-800 md:hover:border-purple-500 md:hover:bg-slate-700'
                          : `bg-white md:hover:bg-slate-50 border-slate-100 md:hover:border-indigo-200 ${choice.hasRandom ? 'border-indigo-50/50' : ''}`
                        }`}
                    >
                      <span className={`absolute -right-2 -bottom-6 text-[60px] md:text-[80px] font-black pointer-events-none transition-colors select-none ${isAnomaly ? 'text-purple-900/20 group-hover:text-purple-700/20' : 'text-slate-100/50 group-hover:text-indigo-50/80'}`}>
                        {idx + 1}
                      </span>
                      <div className={`font-bold relative z-10 text-sm md:text-base mb-2 md:mb-4 leading-snug pr-2 ${isAnomaly ? 'text-purple-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {choice.text}
                      </div>
                      <div className={`flex items-center justify-between font-bold text-xs z-10 ${isAnomaly ? 'text-purple-400 group-hover:text-purple-200' : 'text-slate-300 group-hover:text-indigo-600'}`}>
                        {choice.hasRandom ? (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isAnomaly ? 'text-purple-300 bg-purple-900/50' : 'text-indigo-400 bg-indigo-50'}`}><Dices size={12} /> 概率</span>
                        ) : <span></span>}
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>

                {currentEvent.gambleOption ? (
                  <button
                    onClick={() => handleChoice(currentEvent.gambleOption, 999, true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 md:hover:from-violet-500 md:hover:to-indigo-500 text-white p-4 rounded-xl shadow-lg md:hover:shadow-indigo-200 transition-all flex items-center justify-between group relative overflow-hidden shrink-0 md:active:scale-100"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg"><Dices size={18} className="animate-pulse" /></div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm">放手一搏</span>
                        <span className="text-xs text-indigo-100">{currentEvent.gambleOption.text}</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="h-[76px] w-full shrink-0 hidden md:block" aria-hidden="true"></div>
                )}
                {!currentEvent.gambleOption && (
                  <div className="h-[76px] w-full shrink-0 md:hidden" aria-hidden="true"></div>
                )}
              </div>
            </div>
          )}

          {/* 阶段：事件结果 */}
          {phase === 'EVENT_RESULT' && resultLog && (
            <div key={animKey} className="flex-1 flex flex-col animate-pop-in pb-4">

              <div className={`mb-6 flex-1 flex flex-col rounded-2xl border relative ${isAnomaly ? 'bg-slate-900/50 border-purple-700' : 'bg-slate-50/80 border-slate-200'} overflow-hidden min-h-0`}>
                <div className={`absolute -left-1 top-6 w-1 h-10 rounded-r-full ${isAnomaly ? 'bg-purple-500' : 'bg-indigo-500'} z-10`}></div>
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isAnomaly ? 'bg-purple-900' : 'bg-slate-100'}`}>
                  <div className={`h-full w-full animate-[loading_2s_ease-in-out] ${isAnomaly ? 'bg-purple-500' : 'bg-indigo-600'}`}></div>
                </div>

                <button
                  onClick={() => setIsReviewingEvent(!isReviewingEvent)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors z-20 ${isAnomaly ? 'text-purple-600 md:hover:bg-purple-900 md:hover:text-purple-300' : 'text-slate-400 md:hover:text-indigo-600 md:hover:bg-slate-50'}`}
                  title="查看原事件"
                >
                  <Eye size={20} />
                </button>

                {isReviewingEvent ? (
                  <div className="flex-1 flex flex-col justify-center p-6 animate-pop-in relative">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Event Review</h3>
                    <h2 className={`text-xl font-black mb-3 ${isAnomaly ? 'text-white' : 'text-slate-800'}`}>{currentEvent.title}</h2>
                    <p className={`leading-relaxed mb-6 ${isAnomaly ? 'text-purple-200' : 'text-slate-600'}`}>{currentEvent.description}</p>

                    {/* 回溯按钮 - 仅在回顾模式且已解锁时显示 */}
                    {hasUnlockedRewind && rewindCount > 0 && (
                      <div className="mt-auto pt-4 border-t border-dashed border-slate-200/50 animate-slide-up">
                        <button
                          onClick={handleRewind}
                          className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] text-sm border
                                ${isAnomaly
                              ? 'bg-slate-800 border-purple-500 text-purple-300 hover:bg-slate-700'
                              : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                        >
                          <RotateCcw size={16} />
                          <span>发动因果重置 (剩余: {rewindCount})</span>
                        </button>
                        <p className="text-[10px] text-center mt-2 opacity-60">消耗 1 次机会，回到选择前的时间点</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                      <div className="mb-6 mt-2">
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>
                          <CheckCircle2 size={14} /> 你的决定
                        </h3>
                        <p className={`font-bold text-xl ${isAnomaly ? 'text-white' : 'text-slate-800'}`}>{resultLog.choiceText}</p>
                      </div>

                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>当前结果</h3>
                      <p className={`text-lg leading-relaxed font-medium mb-4 ${isAnomaly ? 'text-purple-100' : 'text-slate-800'}`}>
                        {resultLog.outcomeText}
                      </p>

                      {seenOutcomes[resultLog.outcomeKey] && seenOutcomes[resultLog.outcomeKey].size > 1 && (
                        <div className={`mt-4 pt-4 border-t ${isAnomaly ? 'border-purple-800' : 'border-slate-200/50'}`}>
                          <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isAnomaly ? 'text-purple-400' : 'text-indigo-400'}`}>
                            <Sparkles size={10} /> 已探索的其他分支
                          </h4>
                          <ul className="space-y-1.5">
                            {Array.from(seenOutcomes[resultLog.outcomeKey])
                              .filter(text => text !== resultLog.outcomeText)
                              .map((text, i) => (
                                <li key={i} className={`text-xs flex items-start gap-2 p-1.5 rounded border ${isAnomaly ? 'bg-slate-800 border-purple-800 text-purple-300' : 'bg-white/60 border-slate-100 text-slate-500'}`}>
                                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                  <span>{text}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* 本地调试控制面板 */}
                      {isDebugMode && (
                        <div className="mt-6 pt-4 border-t-2 border-red-200 border-dashed">
                          <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-3">
                            <Wrench size={14} /> Localhost Debug Mode
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 bg-red-50 rounded-lg overflow-hidden border border-red-200">
                            {Object.keys(INITIAL_STATS_BASE).map(key => (
                              <div key={key} className="flex items-center justify-between p-2">
                                <span className="text-xs font-bold text-red-700 capitalize w-16">{key}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDebugUpdate(key, -10)}
                                    className="w-10 h-6 flex items-center justify-center bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-100"
                                  >-10</button>
                                  <span className="text-sm text-slate-700 font-bold font-mono w-6 text-center">{stats[key]}</span>
                                  <button
                                    onClick={() => handleDebugUpdate(key, 10)}
                                    className="w-10 h-6 flex items-center justify-center bg-white border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-100"
                                  >+10</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className={`p-3 md:p-4 border-t ${isAnomaly ? 'border-purple-800 bg-slate-900/30' : 'border-slate-200/50 bg-white/40'} shrink-0`}>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(resultLog.statsChange)
                          .filter(([_, val]) => val !== 0)
                          .map(([key, val]) => (
                            <span key={key} className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-default ${val > 0
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}>
                              {key === 'sanity' && 'SAN值'}
                              {key === 'health' && '发量'}
                              {key === 'research' && '科研'}
                              {key === 'affinity' && '导师好感'}
                              {key === 'knowledge' && '知识'}
                              <span className="font-mono bg-white/60 px-1 rounded ml-0.5">{val > 0 ? `+${val}` : val}</span>
                            </span>
                          ))}
                        {Object.values(resultLog.statsChange).every(v => v === 0) && (
                          <span className={`text-xs font-medium italic ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>无属性变化</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => isReviewingEvent ? setIsReviewingEvent(false) : nextTurn()}
                className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] text-base ${isAnomaly ? 'bg-purple-600 md:hover:bg-purple-500 shadow-purple-900' : 'bg-indigo-600 md:hover:bg-indigo-700 shadow-indigo-200'}`}
              >
                <span>{isReviewingEvent ? '返回结果' : '进入下一月'}</span>
                {!isReviewingEvent && <ArrowRight size={18} />}
              </button>
            </div>
          )}

          {/* 阶段：结局 */}
          {phase === 'END' && endState && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up p-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-slate-100 w-full max-w-lg">
                <div className="mb-4 flex justify-center">
                  <div className={`p-4 border-4 rounded-full ${endState.primary.bg} ${endState.primary.border} ${endState.type === 'HAPPY' ? 'animate-bounce' : ''}`}>
                    <endState.primary.icon className={`w-16 h-16 ${endState.primary.color}`} />
                  </div>
                </div>
                <h2 className={`text-2xl font-black mb-2 ${endState.type === 'HAPPY' ? 'text-yellow-600' : 'text-slate-800'}`}>
                  {endState.primary.title}
                </h2>
                <p className="text-slate-500 text-base mb-6 leading-relaxed font-medium px-4">{endState.primary.desc}</p>

                {/* 首次解锁回溯提示 */}
                {endState.firstUnlock && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-blue-200 text-left animate-pulse">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold mb-1">
                      <Infinity size={20} />
                      <span>高维智慧觉醒</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      你在攀登学术巅峰的过程中，无意间触碰到了世界的底层代码。你获得了<b>「观测并重置因果」</b>的能力。
                      <br /><br />
                      <span className="text-indigo-600 font-bold">现在起，每次成功毕业将补充 2 次回溯机会。</span>
                      <br />
                      <span className="text-[10px] opacity-75">（使用方法：在事件结果页面点击“眼睛”回顾事件时使用）</span>
                    </p>
                  </div>
                )}

                {/* 非首次解锁，但获得了奖励 - 样式弱化 */}
                {!endState.firstUnlock && endState.gainedRewinds > 0 && (
                  <div className="mb-6 flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                    <RotateCcw size={12} />
                    <span>时光回溯次数 +{endState.gainedRewinds}</span>
                  </div>
                )}

                {/* 同时解锁的其他成就 */}
                {endState.all.length > 1 && (
                  <div className="mb-6 px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">同时解锁</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {endState.all.filter(a => a.id !== endState.primary.id).map(ach => (
                        <div key={ach.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${ach.bg} ${ach.border} ${ach.color}`}>
                          <ach.icon size={12} />
                          <span className="text-xs font-bold">{ach.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 gap-4 text-sm mb-6 border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">生存时长</span>
                    <span className="text-slate-800 font-mono font-black text-xl">{turn} <span className="text-xs font-normal">Month</span></span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">科研进度</span>
                    <span className="text-slate-800 font-mono font-black text-xl">{stats.research}%</span>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full bg-slate-900 md:hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 md:active:scale-100"
                >
                  重读研究生
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

// ... HistoryItem 和 StatCard 组件保持不变 ...
const HistoryItem = ({ log, isMobile = false, isAnomaly = false }) => {
  const changes = Object.entries(log.statsChange).filter(([_, v]) => v !== 0);

  const labelMap = {
    sanity: 'SAN值',
    health: '发量',
    research: '科研',
    affinity: '导师好感',
    knowledge: '知识'
  };

  return (
    <div className={`text-sm ${isMobile ? 'bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3' : `border-l-2 pl-3 py-2 transition-colors ${isAnomaly ? 'border-purple-800 md:hover:border-purple-500 text-purple-200' : 'border-slate-200 md:hover:border-indigo-300 text-slate-600'}`}`}>
      <div className={`flex justify-between text-xs mb-1 ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>
        <span className="font-mono">Month {log.turn}</span>
        {isMobile && log.isBad && <span className="text-rose-500 font-bold">危机</span>}
      </div>
      <div className={`font-bold mb-0.5 truncate ${isAnomaly ? 'text-white' : 'text-slate-700'}`}>{log.eventTitle}</div>
      <div className={`text-xs mb-1.5 line-clamp-2 ${isAnomaly ? 'text-purple-300' : 'text-slate-500'}`}>
        <span className={`${isAnomaly ? 'text-purple-500' : 'text-indigo-400'} mr-1`}>选择:</span>{log.choiceText}
      </div>

      {changes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {changes.map(([k, v]) => (
            <span key={k} className={`text-[10px] px-1.5 rounded flex items-center ${v > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
              {labelMap[k] || k}
              <span className="ml-0.5 font-mono">{v > 0 ? `+${v}` : v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, barColor, borderColor, shadow, isAnomaly }) => (
  <div className={`p-2 md:p-3 rounded-2xl border flex flex-col justify-between transition-transform duration-300 ${isAnomaly ? 'bg-slate-800 border-purple-800 shadow-none' : `bg-white ${borderColor} ${shadow}`}`}>
    <div className="flex justify-between items-center mb-1 md:mb-2">
      <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg ${isAnomaly ? 'bg-slate-900 text-purple-300' : `bg-slate-50 ${color}`}`}>
        <Icon size={14} strokeWidth={2.5} />
        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider opacity-90 scale-90 origin-left">{label}</span>
      </div>
      <span className={`text-xs md:text-sm font-mono font-black ${isAnomaly ? 'text-white' : (value < 20 ? 'text-red-500 animate-pulse' : 'text-slate-700')}`}>{value}</span>
    </div>
    <div className={`h-1.5 rounded-full overflow-hidden border ${isAnomaly ? 'bg-slate-900 border-purple-900' : 'bg-slate-100 border-slate-200/50'}`}>
      <div className={`h-full transition-all duration-700 ease-out rounded-full ${isAnomaly ? 'bg-purple-500' : barColor}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

export default GradStudentSimulator;