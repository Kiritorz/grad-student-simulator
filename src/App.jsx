import { useState, useEffect } from 'react';
import { BookOpen, Coffee, Skull, Heart, Award, Briefcase, Zap, Clock, AlertTriangle, ArrowRight, Sparkles, Flame, CheckCircle2, History, X, ChevronRight, Dices, Eye, Palette, Ghost, Link as LinkIcon, Target, Github, Trophy, Lock } from 'lucide-react';
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
  // 1. 优先处理连锁事件 (优先级最高)
  if (pendingChainEvents.length > 0) {
    const nextChain = pendingChainEvents[0];
    const fullEvent = EVENTS_POOL.find(e => e.id === nextChain.id);
    if (fullEvent) return { event: fullEvent, isChain: true };
  }

  // 2. 增加极小概率触发异象事件 (Anomaly) - 仅在非连锁时触发
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

  // 3. 随机池过滤 (必须排除 isChain: true 的事件)
  let pool = EVENTS_POOL.filter(e => !e.isChain && !recentEvents.includes(e.id) && e.risk !== 'ANOMALY');

  // 兜底
  if (pool.length === 0) pool = EVENTS_POOL.filter(e => !e.isChain && e.risk !== 'ANOMALY');

  // 安全返回，防止undefined
  const selected = pool[Math.floor(Math.random() * pool.length)];
  if (!selected) {
    // 极端兜底，返回第一个非链式事件
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
  // 追踪当前事件是否为连锁事件，用于UI渲染
  const [isCurrentEventChain, setIsCurrentEventChain] = useState(false);

  const [resultLog, setResultLog] = useState(null);
  const [endState, setEndState] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // 历史与逻辑控制
  const [historyLog, setHistoryLog] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 存档数据：分支 + 成就
  const [seenOutcomes, setSeenOutcomes] = useState(() => {
    try {
      const saved = localStorage.getItem('gradSim_seenOutcomes');
      if (saved) {
        const parsed = JSON.parse(saved);
        const reconstructed = {};
        Object.keys(parsed).forEach(key => {
          reconstructed[key] = new Set(parsed[key]);
        });
        return reconstructed;
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return {};
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());

  // 初始化加载成就
  useEffect(() => {
    try {
      const savedAch = localStorage.getItem('gradSim_achievements');
      if (savedAch) {
        setUnlockedAchievements(new Set(JSON.parse(savedAch)));
      }
    } catch (e) { console.error(e); }
  }, []);

  // 持久化保存
  useEffect(() => {
    try {
      const serializedOutcomes = {};
      Object.keys(seenOutcomes).forEach(key => serializedOutcomes[key] = Array.from(seenOutcomes[key]));
      localStorage.setItem('gradSim_seenOutcomes', JSON.stringify(serializedOutcomes));

      localStorage.setItem('gradSim_achievements', JSON.stringify(Array.from(unlockedAchievements)));
    } catch (e) { console.error(e); }
  }, [seenOutcomes, unlockedAchievements]);

  const [recentEvents, setRecentEvents] = useState([]);
  const [pendingChainEvents, setPendingChainEvents] = useState([]);

  const [isReviewingEvent, setIsReviewingEvent] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // 彻底重置游戏
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
    setPhase('CHARACTER_CREATION');
  };

  // 检测游戏结束状态 (返回true表示游戏结束)
  const checkGameOver = () => {
    const endingIds = getUnlockedEndingIds(turn, stats);

    if (endingIds.length > 0) {
      // 解锁新成就
      let newSet = new Set(unlockedAchievements);
      endingIds.forEach(id => newSet.add(id));
      setUnlockedAchievements(newSet);

      // 找到优先级最高的主结局
      let primaryEnding = null;
      for (const ach of ACHIEVEMENTS_DATA) {
        if (endingIds.includes(ach.id)) {
          primaryEnding = ach;
          break;
        }
      }

      // 获取所有本次解锁的成就详情
      const allUnlocked = ACHIEVEMENTS_DATA.filter(ach => endingIds.includes(ach.id));

      const isWin = stats.research >= 100;
      const type = isWin ? "HAPPY" : (primaryEnding.id === 'fish_master' || primaryEnding.id === 'deferred' ? "NEUTRAL" : "BAD");

      setPhase('END');
      setEndState({
        type,
        primary: primaryEnding,
        all: allUnlocked
      });
      return true;
    }
    return false;
  };

  // 结局判定函数 (返回所有达成的成就ID)
  const getUnlockedEndingIds = (turn, stats) => {
    const { sanity, health, affinity, knowledge, research } = stats;
    const ids = [];

    // 1. 成功结局
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

      // 保底
      if (ids.length === 0) ids.push('normal_grad');
      return ids;
    }

    // 2. 失败结局 (属性归零)
    if (sanity <= 0 || health <= 0 || affinity <= 0) {
      if (turn <= 1) ids.push('instant_death');
      if (research >= 95) ids.push('almost_there');

      if (sanity <= 0) ids.push('sanity_zero');
      if (health <= 0) ids.push('health_zero');
      if (affinity <= 0) ids.push('affinity_zero');
      return ids;
    }

    // 3. 时间耗尽
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
      newStats[key] = Math.max(0, newStats[key] + trait.stats[key]); // 确保初始不为负
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

    const result = choice.resolve();

    const idxKey = isGamble ? 999 : choiceIndex;
    const outcomeKey = `${currentEvent.id}_${idxKey}`;
    const newSeenOutcomes = { ...seenOutcomes };
    if (!newSeenOutcomes[outcomeKey]) {
      newSeenOutcomes[outcomeKey] = new Set();
    }
    newSeenOutcomes[outcomeKey].add(result.text);
    setSeenOutcomes(newSeenOutcomes);

    // 连锁事件 - 80% 概率触发，不是100%
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

  const nextTurn = () => {
    // 关键修复：点击下一月时才检查结局，确保用户能看到最后一次事件的结果
    if (checkGameOver()) return;

    const nextTurnNum = turn + 1;
    setTurn(nextTurnNum);
    generateNextEvent(nextTurnNum, recentEvents, pendingChainEvents);
    setPhase('EVENT_SELECTION');
    setResultLog(null);
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
                <p className="text-xs text-slate-500 mt-1">已解锁: {unlockedAchievements.size} / {ACHIEVEMENTS_DATA.length}</p>
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
          {/* Logo Icon (Clickable for Achievements) */}
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
              {/* 毕业要求展示 */}
              <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${isAnomaly ? 'border-purple-500/30 text-purple-400' : 'border-slate-200 text-slate-500'}`}>
                <Target size={10} />
                <span className="truncate">毕业要求: 科研 100%</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            <div className={`flex flex-col items-end md:hidden ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>
              <span className="text-[10px] font-bold opacity-60 uppercase">Knw.</span>
              <span className="font-mono text-sm font-black leading-none">{stats.knowledge}</span>
            </div>

            <div
              className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-help transition-colors ${isAnomaly ? 'bg-slate-900 border-purple-800' : 'bg-slate-50 border-slate-100'}`}
              title="知识储备作用：提高高级选项成功率、避免实验事故、解锁特殊结局。"
            >
              <div className={`p-1.5 rounded-lg border ${isAnomaly ? 'bg-slate-800 border-purple-800 text-purple-400' : 'bg-white border-slate-100 text-indigo-900'}`}>
                <Briefcase size={16} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isAnomaly ? 'text-purple-500' : 'text-slate-400'}`}>知识</span>
                <span className={`font-mono text-base font-black leading-none ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>{stats.knowledge}</span>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className={`lg:hidden p-2 border rounded-xl shadow-sm ${isAnomaly ? 'bg-slate-900 border-purple-800 text-purple-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {TRAITS.map((trait) => (
                  <button
                    key={trait.id}
                    onClick={() => applyTrait(trait)}
                    className="bg-white p-4 md:p-5 rounded-2xl border-2 border-slate-100 md:hover:border-indigo-300 md:hover:shadow-lg transition-all text-left group relative overflow-hidden flex flex-col h-full md:active:scale-100"
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${trait.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                    <div className="flex items-center mb-4 w-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${trait.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                        <trait.icon size={20} />
                      </div>
                      <div className="flex flex-col justify-between self-stretch ml-3">
                        <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight">
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

          {/* 阶段：开始游戏 (过渡) */}
          {phase === 'START' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-pop-in mt-4 md:mt-10">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-200 w-full max-w-md">
                <div className="mb-6 flex justify-center">
                  <div className="bg-slate-50 p-5 rounded-full border border-slate-100">
                    <Sparkles className="w-12 h-12 text-indigo-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-2 text-slate-800">入学手续办理完成</h2>
                <div className="text-slate-500 mb-8 text-sm">
                  你的身份是：<span className="font-bold text-indigo-600">{selectedTrait?.name}</span>
                </div>
                <button
                  onClick={startGame}
                  className="w-full bg-slate-900 md:hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 md:active:scale-100"
                >
                  <BookOpen size={20} />
                  开始研一生活
                </button>
              </div>
            </div>
          )}

          {/* 阶段：事件选择 */}
          {phase === 'EVENT_SELECTION' && currentEvent && (
            <div key={animKey} className="flex-1 flex flex-col animate-slide-up pb-2">

              {/* 事件卡片 */}
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

              {/* 选项区域 */}
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
                      {/* 背景大数字 */}
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

                {/* 第四个赌狗选项 */}
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
                  <div className="flex-1 flex flex-col justify-center p-6 animate-pop-in">
                    <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Event Review</h3>
                    <h2 className={`text-xl font-black mb-3 ${isAnomaly ? 'text-white' : 'text-slate-800'}`}>{currentEvent.title}</h2>
                    <p className={`leading-relaxed ${isAnomaly ? 'text-purple-200' : 'text-slate-600'}`}>{currentEvent.description}</p>
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