import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Coffee, Skull, Heart, Award, Briefcase, Zap, Clock, AlertTriangle, ArrowRight, GraduationCap, Sparkles, Frown, Smile, Flame, CheckCircle2, History, X, ChevronRight, Dices, Eye, Crown, Palette, Brain, ZapOff, Ghost, Link as LinkIcon, Target } from 'lucide-react';

// --- 游戏配置 ---
const MAX_TURNS = 36; // 36个月 (3年制)

// --- 特征系统 ---
const TRAITS = [
  { 
    id: 'roll_king', 
    name: '学术卷王', 
    desc: '初始科研+15，但发量-20。', 
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    stats: { research: 15, health: -20, sanity: 0, affinity: 5, knowledge: 5 }
  },
  { 
    id: 'social_star', 
    name: '社交达人', 
    desc: '初始导师好感+20，SAN值+10，科研-10。', 
    icon: Smile,
    color: 'from-pink-500 to-rose-500',
    stats: { research: -10, health: 0, sanity: 10, affinity: 20, knowledge: 0 }
  },
  { 
    id: 'rich_kid', 
    name: '带资进组', 
    desc: '初始资源丰富（知识+10, 发量+10），好感-10。', 
    icon: Crown,
    color: 'from-yellow-400 to-amber-600',
    stats: { research: 0, health: 10, sanity: 10, affinity: -10, knowledge: 10 }
  },
  { 
    id: 'buddha', 
    name: '佛系青年', 
    desc: 'SAN值极高(+30)，但导师好感初始较低。', 
    icon: Coffee,
    color: 'from-emerald-400 to-teal-600',
    stats: { research: -5, health: 10, sanity: 30, affinity: -15, knowledge: 0 }
  }
];

const INITIAL_STATS_BASE = {
  sanity: 70,      
  health: 70,      
  research: 0,     
  affinity: 40,    
  knowledge: 0     
};

// 危险等级配置
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

// --- 事件库 ---
// isChain: true 表示这是一个连锁事件，不会被随机抽到，只能由前置事件触发
const EVENTS_POOL = [
  // --- ANOMALY EVENTS (异象 - 极低概率) ---
  {
    id: 'anomaly_loop',
    risk: 'ANOMALY',
    title: '时间循环',
    description: '你醒来时发现日历倒退回了三个月前，但你的记忆保留了下来。是利用这个机会重来，还是陷入崩溃？',
    choices: [
      {
        text: '利用先知优势疯狂发论文',
        resolve: () => { return { text: "你避开了所有坑，进度飞快！但你的SAN值因时空错乱而恶化。", stats: { research: +25, sanity: -20, knowledge: +10 } }; }
      },
      {
        text: '告诉导师这周的彩票号码',
        resolve: () => { return { text: "导师中奖了！心情大好，直接给你发了巨额劳务费，也不催你干活了。", stats: { affinity: +50, health: +10, research: -5 } }; }
      },
      {
        text: '这一定是在做梦，接着睡',
        resolve: () => { return { text: "你睡醒后发现一切正常，仿佛什么都没发生，但身体感觉异常轻松。", stats: { health: +30, sanity: +30 } }; }
      }
    ]
  },
  
  // --- HIGH RISK ---
  {
    id: 'server_crash',
    risk: 'HIGH',
    title: '服务器大爆炸',
    description: '跑到一半的深度学习模型突然报错，机房传来焦糊味，显卡似乎冒烟了。',
    gambleOption: {
       text: '用灭火器物理降温 (赌一把)',
       resolve: () => {
          const r = Math.random();
          if (r > 0.8) return { text: "神迹！你在火灾边缘拯救了显卡，不仅修好了，还超频了！", stats: { research: +20, affinity: +20, sanity: +10 } };
          return { text: "你喷坏了整个机柜的服务器，赔偿金让你破产...", stats: { affinity: -50, sanity: -30, research: -10 } };
       }
    },
    choices: [
      {
        text: '自己动手修',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.6) return { text: "你居然修好了！顺便优化了环境配置，全组都视你为神。", stats: { affinity: +15, research: +5, sanity: +10 } };
          return { text: "你越修越坏，最后整个实验室的数据都丢了... 导师暴怒。", stats: { affinity: -30, research: -10, sanity: -20 } };
        }
      },
      {
        text: '立刻报告管理员',
        resolve: () => {
          return { text: "管理员修了一个月才修好，这月你只能被迫摸鱼，进度停滞。", stats: { research: -5, sanity: +10, health: +5 } };
        }
      },
      {
        text: '假装没看见，悄悄溜走',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "第二天别人修好了，没人发现是你弄坏的。", stats: { sanity: +15, health: +10 } };
          return { text: "监控拍到你是最后一个离开机房的人... 全院通报批评。", stats: { affinity: -40, sanity: -20 }, chain: 'disciplinary_action' };
        }
      }
    ]
  },
  // 连锁后续事件：通报批评 (isChain: true)
  {
    id: 'disciplinary_action',
    risk: 'HIGH', 
    isChain: true, 
    title: '【连锁】行政处罚',
    description: '因为之前的事故，学院下达了处分通知。你需要公开检讨，这是一段至暗时刻。',
    choices: [
      {
        text: '诚恳检讨，痛哭流涕',
        resolve: () => { return { text: "导师看你态度诚恳，帮你压下了一部分责任，但对你很失望。", stats: { sanity: -10, affinity: +5 } }; }
      },
      {
        text: '依然嘴硬，那是设备老化',
        resolve: () => { return { text: "行政老师被激怒了，你的奖学金没了，导师也跟着丢脸。", stats: { sanity: -20, health: -5, affinity: -15 } }; }
      },
      {
        text: '请病假躲避风头',
        resolve: () => { return { text: "虽然躲过了检讨会，但大家都在背后议论你，你在实验室被孤立了。", stats: { sanity: -5, affinity: -10 } }; }
      }
    ]
  },

  {
    id: 'paper_writing',
    risk: 'MEDIUM',
    title: 'DDL惊魂夜',
    description: '距离截稿日期还有3天，你的论文正文还是一片空白。',
    choices: [
      {
        text: '通宵肝爆 (3天不睡)',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.3) return { text: "奇迹发生了！你赶在最后一分钟提交了。", stats: { research: +20, health: -25, sanity: -15 } };
          return { text: "你晕倒在了电脑前，被室友送进了校医院。", stats: { health: -50, research: +5, sanity: -10 } };
        }
      },
      {
        text: '申请延期/放弃这次',
        resolve: () => {
           return { text: "你放弃了这次投稿，心情轻松了不少，但毕业又遥遥无期了。", stats: { sanity: +15, health: +5, research: -5 } };
        }
      },
      {
        text: '找同门师兄帮忙',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "师兄是大神，帮你改出了花，作为交换你要帮他带一周饭。", stats: { research: +15, sanity: +5, affinity: +5 } };
          return { text: "师兄自己也忙得要死，不仅没帮你，还嘲笑了你的进度。", stats: { sanity: -15, affinity: -2 } };
        }
      }
    ]
  },
  
  // --- LOW RISK ---
  {
    id: 'crush',
    risk: 'LOW',
    title: '实验室恋情',
    description: '新来的师妹/师弟似乎对你有意思，经常找你问问题。',
    choices: [
      {
        text: '热情辅导，发展感情',
        hasRandom: true,
        resolve: () => { 
           const r = Math.random();
           if(r > 0.5) return { text: "你们在一起了！实验室变成了充满粉色泡泡的乐园。", stats: { sanity: +20, research: -5 }, chain: 'break_up' }; // 连锁分手
           return { text: "你想多了，人家只是想让你帮忙跑代码。", stats: { sanity: -15, knowledge: +2 } };
        }
      },
      {
        text: '心中无女人，拔刀自然神',
        resolve: () => { return { text: "你冷酷地拒绝了所有暗示，科研进度提升了！", stats: { research: +10, affinity: +2 } }; }
      },
      {
        text: '介绍给同门师兄',
        resolve: () => { return { text: "你成了月老，同门对你感激涕零。", stats: { sanity: +10, affinity: +5 } }; }
      }
    ]
  },
  // 连锁事件 - 感情破裂 (isChain: true)
  {
    id: 'break_up',
    isChain: true,
    risk: 'HIGH',
    title: '【连锁】感情危机',
    description: '之前建立的恋爱关系，因为你太忙于科研，忽略了另一半，对方提出了分手。',
    choices: [
      {
        text: '苦苦挽留',
        resolve: () => { return { text: "这月都在吵架，什么也没干，最后还是分了。", stats: { research: -10, sanity: -20 } }; }
      },
      {
        text: '同意分手，专注科研',
        resolve: () => { return { text: "化悲愤为力量！你在实验室住了一个月，产出惊人。", stats: { research: +20, sanity: -10, health: -10 } }; }
      },
      {
        text: '拉黑删除',
        resolve: () => { return { text: "长痛不如短痛。你迅速调整了状态。", stats: { sanity: +5 } }; }
      }
    ]
  },
  
  // 更多常规事件...
  {
    id: 'paper_reading',
    risk: 'LOW',
    title: '文献阅读月',
    description: '导师发来了一个文件夹，里面有20篇"必读"的最新顶会论文。',
    choices: [
      {
        text: '通宵精读每一篇',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.3) return { text: "虽然头发掉了一把，但你感觉打通了任督二脉！", stats: { sanity: -15, health: -10, knowledge: +15, affinity: +5 } };
          return { text: "你读得太累睡着了，口水流在了键盘上，什么都没记住。", stats: { sanity: -10, health: -5, knowledge: +2 } };
        }
      },
      {
        text: '只读摘要和图表',
        resolve: () => { return { text: "效率很高！你掌握了核心思想，还有时间打游戏。", stats: { sanity: +5, knowledge: +8, research: +2 } }; }
      },
      {
        text: '扔给AI总结',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "AI总结得头头是道，你在组会上侃侃而谈。", stats: { affinity: +10, knowledge: +5, sanity: +5 } };
          return { text: "AI一本正经地胡说八道，你信了，结果被导师当场揭穿。", stats: { affinity: -20, research: -2 } };
        }
      }
    ]
  },
  {
    id: 'funding_cut',
    risk: 'HIGH',
    title: '经费断裂',
    description: '导师脸色铁青地告诉你，组里的国家自然科学基金申请挂了，下个月开始可能发不出劳务费了。',
    choices: [
      { text: '与实验室共存亡', resolve: () => { return { text: "导师感动得热泪盈眶，承诺以后有钱了双倍补给你（画饼）。", stats: { affinity: +30, health: -10 } }; } },
      { text: '找兼职补贴家用', resolve: () => { return { text: "虽然缓解了经济压力，但科研时间大幅减少，导师不太高兴。", stats: { research: -10, health: -5, sanity: +10, affinity: -10 } }; } },
      { text: '帮导师写新本子', hasRandom: true, resolve: () => { 
           const r = Math.random();
           if(r > 0.4) return { text: "你写的本子居然中了！你是实验室的救世主！", stats: { affinity: +40, research: +10, knowledge: +10 } };
           return { text: "写废了，浪费了时间，还被嫌弃文笔差。", stats: { sanity: -10, research: -5 } };
        } 
      }
    ]
  },
  {
    id: 'cat_in_lab',
    risk: 'LOW',
    title: '实验室进猫了',
    description: '一只流浪猫溜进了实验室，趴在你的服务器上取暖。',
    choices: [
      { text: '撸猫', resolve: () => { return { text: "治愈了！所有的烦恼都消失了。", stats: { sanity: +20, research: -2 } }; } },
      { text: '赶走它，怕弄坏设备', resolve: () => { return { text: "猫猫委屈地走了，你有点不忍心。", stats: { sanity: -2 } }; } },
      { text: '收养它作为实验室神兽', resolve: () => { return { text: "全实验室一起养猫，氛围变得异常和谐。", stats: { affinity: +5, sanity: +10 } }; } }
    ]
  }
].filter(Boolean); // 过滤空值以防万一

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
  const [endReason, setEndReason] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  // 历史与逻辑控制
  const [historyLog, setHistoryLog] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [seenOutcomes, setSeenOutcomes] = useState({});
  const [recentEvents, setRecentEvents] = useState([]); 
  const [pendingChainEvents, setPendingChainEvents] = useState([]);
  
  const [isReviewingEvent, setIsReviewingEvent] = useState(false);

  // 彻底重置游戏
  const resetGame = () => {
    // 强制重置所有状态
    setStats({ ...INITIAL_STATS_BASE });
    setTurn(1);
    setHistoryLog([]);
    setRecentEvents([]);
    setPendingChainEvents([]);
    setSeenOutcomes({});
    setSelectedTrait(null);
    setResultLog(null);
    setCurrentEvent(null);
    setEndReason(null);
    setPhase('CHARACTER_CREATION');
  };

  // 检测游戏结束状态
  const checkGameOver = () => {
    // 优先检查属性是否耗尽
    if (stats.sanity <= 0) {
      endGame("BAD", "精神崩溃", "你在这个周一的早晨选择了退学。也许卖炒粉才是你的归宿？");
      return true;
    } 
    if (stats.health <= 0) {
      endGame("BAD", "ICU 预定", "救护车的声音响彻校园。长期熬夜让你倒在了实验室的地板上。");
      return true;
    }
    if (stats.affinity <= 0) {
      endGame("BAD", "逐出师门", "导师把你叫到办公室，冷冷地通知你：'你另请高明吧'。");
      return true;
    }

    // 检查是否达到胜利条件
    if (stats.research >= 100) {
      if (stats.knowledge >= 90) {
          endGame("HAPPY", "一代宗师", "你的研究不仅发表了，还开创了一个新的流派。你被誉为百年难遇的学术天才。");
      } else {
          endGame("HAPPY", "顺利毕业", "论文被顶刊接收！你成为了学术界的新星，所有痛苦都变成了荣耀。");
      }
      return true;
    }

    // 检查时间是否耗尽 (注意：这里是在nextTurn时检查，所以用>而非>=，给用户看最后一回合结果)
    if (turn > MAX_TURNS) {
      if (stats.research > 80 && stats.health > 80) {
          endGame("NEUTRAL", "摸鱼大师", "虽然没毕业，但你身体倍儿棒，心态超好。导师拿你没办法，只能让你延毕。");
      } else {
          endGame("NEUTRAL", "被迫延毕", "时间到了。你的成果平平无奇，只能延期毕业，继续在这个炼狱里挣扎。");
      }
      return true;
    }

    return false;
  };

  const applyTrait = (trait) => {
    setSelectedTrait(trait);
    const newStats = { ...INITIAL_STATS_BASE };
    Object.keys(trait.stats).forEach(key => {
      newStats[key] += trait.stats[key];
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
    
    if (isChain) {
        setPendingChainEvents(prev => prev.slice(1));
    }
  };

  const endGame = (type, title, reason) => {
    setPhase('END');
    setEndReason({ type, title, text: reason });
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
                <History size={18} className={isAnomaly ? 'text-purple-400' : 'text-indigo-500'}/> 
                研究日志
            </h2>
            <p className={`text-xs mt-1 ${isAnomaly ? 'text-purple-400/60' : 'text-slate-400'}`}>记录你的每一步抉择</p>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {historyLog.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-10 italic">暂无记录</div>
            ) : (
                historyLog.slice().reverse().map((log, i) => (
                    <HistoryItem key={i} log={log} isAnomaly={isAnomaly} />
                ))
            )}
         </div>
      </aside>

      {/* 移动端历史记录 Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
            <div className="bg-white w-full sm:w-96 h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><History size={18}/> 历史记录</h3>
                    <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {historyLog.slice().reverse().map((log, i) => (
                        <HistoryItem key={i} log={log} isMobile={true}/>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* 主游戏区域 */}
      <div className="max-w-3xl w-full p-4 md:p-8 flex flex-col min-h-screen gap-5 relative">
        
        {/* 顶部栏 */}
        <header className={`grid grid-cols-[auto_1fr_auto] md:flex md:items-center items-center gap-3 p-4 rounded-2xl shadow-sm border transition-colors duration-500 ${isAnomaly ? 'bg-slate-900 border-purple-700' : 'bg-white border-slate-200'}`}>
          {/* Logo Icon */}
          <div className={`p-2 rounded-xl shadow-lg text-white ${isAnomaly ? 'bg-purple-900 shadow-purple-900' : 'bg-gradient-to-br from-indigo-900 to-slate-800 shadow-indigo-200'}`}>
             {isAnomaly ? <Ghost className="w-6 h-6 animate-bounce" /> : <GraduationCap className="w-6 h-6" />}
          </div>

          {/* Title & Info */}
          <div className="flex flex-col min-w-0">
             <h1 className={`font-extrabold text-base md:text-lg leading-tight truncate ${isAnomaly ? 'text-purple-200' : 'text-slate-800'}`}>研究生模拟器</h1>
             <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-medium mt-1">
                <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${isAnomaly ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-100 text-slate-500'}`}>
                  <Clock size={10} className={isAnomaly ? 'text-purple-400' : 'text-indigo-600'}/> 
                  <span>Month <span className={`font-bold ${isAnomaly ? 'text-purple-400' : 'text-indigo-700'}`}>{turn}</span>/{MAX_TURNS}</span>
                </div>
                <div className={`hidden sm:flex px-2 py-0.5 rounded-full items-center gap-1 border ${isAnomaly ? 'border-purple-500/30 text-purple-400' : 'border-slate-200 text-slate-500'}`}>
                  <Target size={10} />
                  <span>毕业要求: 科研 100%</span>
                </div>
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
              {/* Mobile Knowledge (Compact) */}
              <div className={`flex flex-col items-end md:hidden ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>
                 <span className="text-[10px] font-bold opacity-60 uppercase">Knw.</span>
                 <span className="font-mono text-sm font-black leading-none">{stats.knowledge}</span>
              </div>

              {/* Desktop Knowledge */}
              <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-help transition-colors ${isAnomaly ? 'bg-slate-900 border-purple-800' : 'bg-slate-50 border-slate-100'}`} title="知识储备影响高级选项成功率">
                <div className={`p-1.5 rounded-lg border ${isAnomaly ? 'bg-slate-800 border-purple-800 text-purple-400' : 'bg-white border-slate-100 text-indigo-900'}`}>
                  <Briefcase size={16}/>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isAnomaly ? 'text-purple-500' : 'text-slate-400'}`}>知识</span>
                  <span className={`font-mono text-base font-black leading-none ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>{stats.knowledge}</span>
                </div>
              </div>

              {/* Mobile History Btn */}
              <button 
                onClick={() => setShowHistoryModal(true)}
                className={`lg:hidden p-2 border rounded-xl shadow-sm ${isAnomaly ? 'bg-slate-900 border-purple-800 text-purple-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                  <History size={18}/>
              </button>
          </div>
        </header>

        {/* 状态面板 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard icon={Zap} label="SAN值" value={stats.sanity} isAnomaly={isAnomaly} color="text-yellow-600" barColor="bg-yellow-500" borderColor="border-yellow-200" shadow="shadow-yellow-100" />
            <StatCard icon={Skull} label="发量" value={stats.health} isAnomaly={isAnomaly} color="text-rose-600" barColor="bg-rose-500" borderColor="border-rose-200" shadow="shadow-rose-100" />
            <StatCard icon={Award} label="科研" value={stats.research} isAnomaly={isAnomaly} color="text-blue-600" barColor="bg-blue-500" borderColor="border-blue-200" shadow="shadow-blue-100" />
            <StatCard icon={Heart} label="导师好感" value={stats.affinity} isAnomaly={isAnomaly} color="text-pink-600" barColor="bg-pink-500" borderColor="border-pink-200" shadow="shadow-pink-100" />
        </div>

        {/* 游戏内容区 */}
        <main className="flex-1 flex flex-col relative min-h-0"> 
          {/* min-h-0 is crucial for nested scrolling if needed, though here we rely on page scroll */}
          
          {/* 阶段：特征选择 (开局) */}
          {phase === 'CHARACTER_CREATION' && (
             <div className="flex-1 flex flex-col animate-pop-in mt-2 pb-6">
                <div className="text-center mb-4">
                   <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
                     <Palette className="text-indigo-500" size={24} /> 选择你的人设
                   </h2>
                   <p className="text-slate-500 text-xs md:text-sm mt-1">不同的特质决定了你的初始属性和生存策略</p>
                </div>
                
                {/* Mobile: Use a simpler flex-col layout or just grid-cols-1.
                   Prevent height overflow issues by allowing the main container to expand naturally 
                   and page to scroll. 
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                   {TRAITS.map((trait) => (
                      <button 
                        key={trait.id}
                        onClick={() => applyTrait(trait)}
                        className="bg-white p-4 md:p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-300 hover:shadow-lg transition-all text-left group relative overflow-hidden flex flex-col h-full"
                      >
                         <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${trait.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                         <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${trait.color} text-white flex items-center justify-center mb-3 shadow-md shrink-0`}>
                            <trait.icon size={18} />
                         </div>
                         <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">{trait.name}</h3>
                         <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{trait.desc}</p>
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <BookOpen size={20} />
                  开始研一生活
                </button>
              </div>
            </div>
          )}

          {/* 阶段：事件选择 */}
          {phase === 'EVENT_SELECTION' && currentEvent && (
            <div key={animKey} className="flex-1 flex flex-col animate-slide-up pb-6">
              
              {/* 事件卡片 */}
              {(() => {
                  let risk = RISK_CONFIG[currentEvent.risk || 'LOW'];
                  // 如果是连锁事件，覆盖样式为CHAIN (除非本身是ANOMALY)
                  if (isCurrentEventChain && currentEvent.risk !== 'ANOMALY') {
                      risk = RISK_CONFIG.CHAIN;
                  }
                  
                  const RiskIcon = risk.icon;
                  return (
                    <div className={`bg-gradient-to-br ${risk.bgGradient} p-5 md:p-8 rounded-[2rem] shadow-sm ${risk.cardShadow} border ${risk.cardBorder} mb-4 relative overflow-hidden transition-all duration-500`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
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

              {/* 选项区域 
                  Use min-h to reserve space for 4 items to prevent layout jump.
                  Approx height calc: 3 items * (height + gap) + 1 gamble item. 
                  On mobile, items are stacked. A gamble item adds height.
                  User request: "Mobile... avoid this problem".
                  Solution: Always reserve space for gamble option or make container flex-grow.
                  Let's use a min-height that accommodates 4 items comfortably.
              */}
              <div className="flex flex-col gap-3 mt-auto min-h-[320px] md:min-h-[180px] justify-end">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentEvent.choices.map((choice, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleChoice(choice, idx)}
                        className={`h-full border-2 p-4 md:p-5 rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md group relative overflow-hidden flex flex-col justify-between 
                        ${isAnomaly 
                            ? 'bg-slate-800 border-purple-800 hover:border-purple-500 hover:bg-slate-700' 
                            : `bg-white hover:bg-slate-50 border-slate-100 hover:border-indigo-200 ${choice.hasRandom ? 'border-indigo-50/50' : ''}`
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
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isAnomaly ? 'text-purple-300 bg-purple-900/50' : 'text-indigo-400 bg-indigo-50'}`}><Dices size={12}/> 概率</span>
                            ) : <span></span>}
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                        </div>
                    </button>
                    ))}
                </div>

                {/* 第四个赌狗选项 Placeholder to prevent jump if not present? 
                    Actually, making the container min-height is better.
                    If gambleOption is present, it renders. If not, space is just empty or filled by above.
                    Wait, if I use min-height on parent `flex-col`, items will stretch or leave gap.
                    Better: Render an invisible spacer if gambleOption is missing, but only if we want perfect stability.
                    However, `justify-end` with `min-h` works well.
                */}
                {currentEvent.gambleOption ? (
                    <button
                        onClick={() => handleChoice(currentEvent.gambleOption, 999, true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white p-4 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-between group relative overflow-hidden shrink-0"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg"><Dices size={18} className="animate-pulse"/></div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-sm">放手一搏</span>
                                <span className="text-xs text-indigo-100">{currentEvent.gambleOption.text}</span>
                            </div>
                        </div>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform"/>
                    </button>
                ) : (
                    // Spacer to reserve height for Gamble option
                    <div className="h-[76px] w-full shrink-0 hidden md:block" aria-hidden="true"></div>
                )}
                {/* On mobile, reserving 76px of empty space might look like a bug. 
                    Let's only reserve it on Desktop where alignment matters more, 
                    or just accept the jump on mobile? 
                    User said "Mobile... avoid this problem". 
                    So we must reserve it or keep layout stable.
                    Let's use an invisible div that takes up the space.
                */}
                 {!currentEvent.gambleOption && (
                    <div className="h-[76px] w-full shrink-0 md:hidden" aria-hidden="true"></div>
                )}
              </div>
            </div>
          )}

          {/* 阶段：事件结果 */}
          {phase === 'EVENT_RESULT' && resultLog && (
            <div key={animKey} className="flex-1 flex flex-col animate-pop-in pb-4">
              <div className={`p-6 md:p-8 rounded-[2rem] shadow-xl border flex-1 flex flex-col relative overflow-hidden ${isAnomaly ? 'bg-slate-800 border-purple-800' : 'bg-white border-slate-200'}`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isAnomaly ? 'bg-purple-900' : 'bg-slate-100'}`}>
                   <div className={`h-full w-full animate-[loading_2s_ease-in-out] ${isAnomaly ? 'bg-purple-500' : 'bg-indigo-600'}`}></div>
                </div>

                <button 
                    onClick={() => setIsReviewingEvent(!isReviewingEvent)}
                    className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-20 ${isAnomaly ? 'text-purple-600 hover:bg-purple-900 hover:text-purple-300' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
                    title="查看原事件"
                >
                    <Eye size={20} />
                </button>

                {isReviewingEvent ? (
                    <div className="flex-1 flex flex-col justify-center animate-pop-in">
                        <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Event Review</h3>
                        <h2 className={`text-xl font-black mb-3 ${isAnomaly ? 'text-white' : 'text-slate-800'}`}>{currentEvent.title}</h2>
                        <p className={`leading-relaxed ${isAnomaly ? 'text-purple-200' : 'text-slate-600'}`}>{currentEvent.description}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 mt-2">
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>
                            <CheckCircle2 size={14}/> 你的决定
                        </h3>
                        <p className={`font-bold text-xl ${isAnomaly ? 'text-white' : 'text-slate-800'}`}>{resultLog.choiceText}</p>
                        </div>
                        
                        <div className={`mb-6 flex-1 p-5 rounded-2xl border relative ${isAnomaly ? 'bg-slate-900/50 border-purple-700' : 'bg-slate-50/80 border-slate-200'}`}>
                        <div className={`absolute -left-1 top-6 w-1 h-10 rounded-r-full ${isAnomaly ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>
                        
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isAnomaly ? 'text-purple-400' : 'text-slate-400'}`}>当前结果</h3>
                        <p className={`text-lg leading-relaxed font-medium mb-4 ${isAnomaly ? 'text-purple-100' : 'text-slate-800'}`}>
                            {resultLog.outcomeText}
                        </p>

                        {seenOutcomes[resultLog.outcomeKey] && seenOutcomes[resultLog.outcomeKey].size > 1 && (
                            <div className={`mt-4 pt-4 border-t ${isAnomaly ? 'border-purple-800' : 'border-slate-200/50'}`}>
                                <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${isAnomaly ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    <Sparkles size={10}/> 已探索的其他分支
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
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                            {Object.entries(resultLog.statsChange)
                            .filter(([_, val]) => val !== 0)
                            .map(([key, val]) => (
                            <span key={key} className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-default ${
                                val > 0 
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

                <button 
                  onClick={nextTurn}
                  className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] text-base ${isAnomaly ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                >
                  <span>{isReviewingEvent ? '返回结果' : '进入下一月'}</span>
                  {!isReviewingEvent && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* 阶段：结局 */}
          {phase === 'END' && endReason && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up p-4">
               <div className="bg-white p-6 rounded-[2rem] shadow-2xl border-2 border-slate-100 w-full max-w-lg">
                  <div className="mb-4 flex justify-center">
                    {endReason.type === 'HAPPY' ? 
                      <div className="p-4 bg-yellow-50 border-4 border-yellow-100 rounded-full animate-bounce">
                         <Smile className="w-16 h-16 text-yellow-500" />
                      </div> : 
                      <div className="p-4 bg-slate-50 border-4 border-slate-100 rounded-full">
                         <Frown className="w-16 h-16 text-slate-400" />
                      </div>
                    }
                  </div>
                  <h2 className={`text-2xl font-black mb-2 ${endReason.type === 'HAPPY' ? 'text-yellow-600' : 'text-slate-800'}`}>
                    {endReason.title}
                  </h2>
                  <p className="text-slate-500 text-base mb-6 leading-relaxed font-medium px-4">{endReason.text}</p>
                  
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
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
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

// 历史记录单项组件
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
        <div className={`text-sm ${isMobile ? 'bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3' : `border-l-2 pl-3 py-2 transition-colors ${isAnomaly ? 'border-purple-800 hover:border-purple-500 text-purple-200' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}`}>
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
                        <span key={k} className={`text-[10px] px-1.5 rounded flex items-center ${
                            v > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
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

// 数值卡片组件
const StatCard = ({ icon: Icon, label, value, color, barColor, borderColor, shadow, isAnomaly }) => (
  <div className={`p-3 rounded-2xl border flex flex-col justify-between transition-transform duration-300 ${isAnomaly ? 'bg-slate-800 border-purple-800 shadow-none' : `bg-white ${borderColor} ${shadow}`}`}>
    <div className="flex justify-between items-center mb-2">
      <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg ${isAnomaly ? 'bg-slate-900 text-purple-300' : `bg-slate-50 ${color}`}`}>
        <Icon size={14} strokeWidth={2.5} />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 scale-90 origin-left">{label}</span>
      </div>
      <span className={`text-sm font-mono font-black ${isAnomaly ? 'text-white' : (value < 20 ? 'text-red-500 animate-pulse' : 'text-slate-700')}`}>{value}</span>
    </div>
    <div className={`h-1.5 rounded-full overflow-hidden border ${isAnomaly ? 'bg-slate-900 border-purple-900' : 'bg-slate-100 border-slate-200/50'}`}>
      <div className={`h-full transition-all duration-700 ease-out rounded-full ${isAnomaly ? 'bg-purple-500' : barColor}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

export default GradStudentSimulator;