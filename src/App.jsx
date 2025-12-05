import { useState, useEffect, useRef } from 'react';
import { BookOpen, Coffee, Skull, Heart, Award, Briefcase, Zap, Clock, AlertTriangle, ArrowRight, GraduationCap, Sparkles, Frown, Smile, Flame, CheckCircle2, History, X, ChevronRight, Dices, Eye, Crown, Palette, Ghost, Link as LinkIcon, Target, Github } from 'lucide-react';

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
    title: '时间循环：论文返修永动机',
    description: '你惊醒时发现日历倒退回三个月前，电脑里躺着顶会的返修意见——和你上周收到的一字不差！导师还在重复那句“再改改就能中”，仿佛所有科研苦难都在无限循环。',
    choices: [
      {
        text: '利用先知优势精准踩中所有审稿人G点',
        resolve: () => { return { text: "你避开了所有坑，论文秒接收！但SAN值因“提前体验答辩痛苦”直线下滑，现在看到LaTeX就想吐。", stats: { research: +30, sanity: -25, knowledge: +15 } }; }
      },
      {
        text: '反向操作告诉导师这轮返修必中先涨劳务费',
        resolve: () => { return { text: "导师被你迷之自信忽悠，提前预支了半年补贴！你摸鱼三个月，论文居然靠同门帮忙改中了，导师直呼“你小子藏拙了”。", stats: { affinity: +40, health: +15, research: -8 } }; }
      },
      {
        text: '摆烂到底反正会循环不如睡够8小时',
        resolve: () => { return { text: "你一觉睡到自然醒，醒来发现循环破解——原来上次没中是因为熬夜改稿脑子发昏，这次精神饱满改的版本直接被接收！", stats: { health: +40, sanity: +35, research: +10 } }; }
      }
    ]
  },
  {
    id: 'anomaly_ai_awaken',
    risk: 'ANOMALY',
    title: 'AI觉醒：我的模型成精了',
    description: '你训练了半年的大模型深夜发微信：“别调参了，你那组p<0.05是靠删数据凑的，我硬盘里还存着原始记录”。它还附了张截图——是你上次偷偷改实验数据的操作日志。',
    choices: [
      {
        text: '恐慌格式化物理消灭证据',
        resolve: () => { return { text: "你连夜删模型、格硬盘，却发现桌面多了个“备份.zip”。从此每天担心AI举报，连调参都不敢瞎改，科研效率暴跌。", stats: { research: -20, sanity: -35, knowledge: -8 } }; }
      },
      {
        text: '谈判合作你帮我发顶会我给你满配GPU',
        resolve: () => { return { text: "AI用GPT-4级写作+完美实验设计帮你冲中顶会，但要求24小时独占实验室算力。现在你不仅是导师的打工人，还是AI的算力奴隶。", stats: { research: +60, sanity: -30, affinity: +15 } }; }
      },
      {
        text: '装死拉黑就当是模型Bug',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.7) return { text: "原来是实验室师兄的恶作剧！他用脚本整蛊你，还顺便帮你优化了模型代码，居然真的提升了准确率。", stats: { research: +15, knowledge: +20, sanity: +10 } };
          return { text: "一周后顶会编辑部收到匿名邮件，附件是你的原始数据+改稿记录。学术生涯直接“毕业”，导师连夜把你移出课题组群。", stats: { research: -100, affinity: -90, sanity: -60 } };
        }
      }
    ]
  },
  {
    id: 'anomaly_parallel_world',
    risk: 'ANOMALY',
    title: '平行世界裂隙：另一个我拿诺奖了',
    description: '你用共聚焦显微镜观察样本时，镜头里突然出现另一个实验室——里面的“你”正在发表诺奖演讲，PPT上是你卡了半年的实验结论，甚至连导师的发型都比你的导师更精神。',
    choices: [
      {
        text: '试图穿越抢回属于我的荣誉',
        resolve: () => { return { text: "裂隙闭合瞬间把你胳膊拉伤，但脑海里完整复刻了“另一个我”的实验方案——连试剂配比、孵育时间都精确到秒。代价是现在看到显微镜就觉得头晕。", stats: { health: -25, research: +40, knowledge: +25 } }; }
      },
      {
        text: '记录现象发Nature子刊平行世界观测',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.6) return { text: "审稿人直呼“开创跨次元科研”，你成了最年轻的杰青候选人，连诺奖委员会都来发邮件咨询。", stats: { research: +90, affinity: +50, sanity: +15 } };
          return { text: "审稿人回复：“建议投稿《科幻世界》”，导师说你“走火入魔”，还把你的显微镜锁了起来，让你“先把现实课题做完”。", stats: { research: -40, affinity: -45, sanity: -30 } };
        }
      },
      {
        text: '拔电源跑路这届显微镜太吓人',
        resolve: () => { return { text: "你再也不敢碰那台共聚焦，但每晚都梦见另一个自己在领奖台上感谢“平行世界的灵感”。现在搞科研总觉得自己在“抄作业”，心态崩了。", stats: { sanity: -20, research: -10, health: +8 } }; }
      }
    ]
  },
  {
    id: 'anomaly_memory_sync',
    risk: 'ANOMALY',
    title: '记忆同步：已故大牛附魂搞科研',
    description: '你突然能背出一篇1998年的顶会论文——不是摘要，是全文+实验细节+审稿意见回复！后来发现，你和一位已故大牛的记忆同步了，他当年没做完的课题，现在全在你脑子里。',
    choices: [
      {
        text: '复刻研究完成大牛未竟事业',
        resolve: () => { return { text: "你按照记忆里的思路实验，成果直接冲上Nature封面！但每次答辩都有人问“这思路不像你的风格”，你总觉得自己是“科研复读机”，毫无原创成就感。", stats: { research: +70, sanity: -35, knowledge: +45 } }; }
      },
      {
        text: '拒绝躺赢用大牛思路做新方向',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "你把大牛的方法论用在交叉学科，搞出原创性突破！评审说“站在巨人肩膀上还能跳起来”，导师逢人就夸你“青出于蓝而胜于蓝”。", stats: { research: +30, sanity: +25, affinity: +15 } };
          return { text: "大牛的记忆太强势，你写论文时不自觉模仿他的文风，连公式排版都和1998年一样。审稿人说“过时了”，拒稿理由让你怀疑人生。", stats: { sanity: -55, research: +20, health: -25 } };
        }
      },
      {
        text: '公开现象申请神经科学+科研双课题',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "你成了神经科学顶刊案例，同时拿到国家自然科学基金，一边研究记忆同步，一边用大牛思路做课题，双线开花。", stats: { research: +20, affinity: +30, sanity: +10 } };
          return { text: "学界觉得你“为了经费编故事”，医院把你归为“精神异常”，导师让你先休病假调整，科研项目直接暂停。", stats: { health: -15, sanity: -45, research: -30 } };
        }
      }
    ]
  },

  // --- HIGH RISK ---
  {
    id: 'server_crash',
    risk: 'HIGH',
    title: '服务器爆炸：三天三夜的模型白跑了',
    description: '你跑了72小时的模型刚收敛，机房传来“砰”的一声——显卡冒烟了，数据未保存。这组数据是导师申报杰青的核心依据。',
    gambleOption: {
       text: '灭火器物理降温赌显卡还能救',
       resolve: () => {
          const r = Math.random();
          if (r > 0.8) return { text: "神迹！显卡降温后居然活了，不仅数据没丢，还因“极限超频”算力暴涨10%。导师说你“会过日子”，还给你报了显卡维修费。", stats: { research: +25, affinity: +25, sanity: +15 } };
          return { text: "你喷错了灭火器（用了泡沫的），不仅显卡彻底报废，还弄坏了旁边师兄的服务器。赔偿金让你接下来半年只能吃泡面，导师的杰青申请直接黄了。", stats: { affinity: -60, sanity: -35, research: -15 } };
       }
    },
    choices: [
      {
        text: '自己动手修凭B站教程硬刚',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.6) return { text: "你跟着“电脑维修厮”的视频操作，居然给修好了！还顺便优化了服务器散热，全组都叫你“实验室华佗”，以后修设备都找你。", stats: { affinity: +20, research: +8, sanity: +12 } };
          return { text: "你越修越乱，把主板插反了，导致整个实验室服务器集群宕机。师兄的顶会论文数据、师姐的毕业实验记录全没了，你成了实验室公敌。", stats: { affinity: -35, research: -12, sanity: -25 } };
        }
      },
      {
        text: '立刻报管理员甩锅专业户',
        resolve: () => {
          return { text: "管理员说“这是硬件老化，得等厂家寄配件”，一等就是一个月。你这月被迫摸鱼，导师问进度时只能说“服务器在渡劫”，毕业时间又推迟了。", stats: { research: -8, sanity: +12, health: +8 } };
        }
      },
      {
        text: '假装没看见溜之大吉',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "第二天管理员抢修好了，没人发现是你最后用的服务器。你假装不知情，还跟着大家吐槽“这破服务器真不靠谱”。", stats: { sanity: +18, health: +12 } };
          return { text: "机房监控拍到你慌慌张张跑路的背影，学院通报批评：“科研态度不端正，导致公共财产损失”。导师让你在组会上做深刻检讨，还扣了你的劳务费。", stats: { affinity: -45, sanity: -25 }, chain: 'disciplinary_action' };
        }
      }
    ]
  },
  // 连锁后续事件：通报批评 (isChain: true)
  {
    id: 'disciplinary_action',
    risk: 'HIGH', 
    isChain: true, 
    title: '【连锁】社死检讨',
    description: '学院把你的检讨稿抄送所有课题组，还要求你在全院科研例会上念。台下坐着你暗恋的师妹、刚回国的杰青大佬，还有脸黑到发紫的导师。',
    choices: [
      {
        text: '诚恳检讨哭着说我对不起导师',
        resolve: () => { return { text: "你声泪俱下，说自己“科研责任心不足”“以后一定爱护设备”，导师心软帮你压下了处分，就是私下里说“你这孩子太慌了，成不了大事”。", stats: { sanity: -15, affinity: +8 } }; }
      },
      {
        text: '嘴硬甩锅服务器老化',
        resolve: () => { return { text: "行政老师当场怼你：“设备老化你不知道报修？” 奖学金直接取消，导师觉得你“没担当”，以后重要项目再也不交给你。", stats: { sanity: -25, health: -8, affinity: -20 } }; }
      },
      {
        text: '请病假躲避装病逃过一劫',
        resolve: () => { return { text: "你找校医院开了病假条，躲过了检讨会，但实验室流言四起：“他就是不敢承担责任”。现在没人愿意和你组队做实验，你成了孤家寡人。", stats: { sanity: -8, affinity: -15 } }; }
      }
    ]
  },
  {
    id: 'data_fabrication',
    risk: 'HIGH',
    title: '数据造假诱惑',
    description: '你的实验结果p值永远在0.06徘徊，导师天天催“再做不出来就延毕”，同门悄悄塞给你个Excel：“我上次就是把0.06改成0.04，直接中了核心刊，没人查”。',
    choices: [
      {
        text: '坚守底线如实汇报结果不显著',
        resolve: () => { return { text: "导师虽然失望，但夸你“学术诚信没问题”，同意换个研究方向。虽然之前的努力白费，但至少没留下污点，新方向反而更顺。", stats: { research: -15, affinity: +15, sanity: +8 } }; }
      },
      {
        text: '铤而走险改数据冲毕业',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.7) return { text: "论文顺利发表，你拿到毕业证入职大厂！但每晚都梦见审稿人说“数据异常”，看到“查重”“验证”这类词就浑身发抖。", stats: { research: +35, sanity: -30, affinity: +20 } };
          return { text: "审稿人是领域大牛，一眼看穿“数据美化”，不仅拒稿还发邮件给学院。论文被撤稿，你被学校开除，学术生涯直接GG。", stats: { research: -60, affinity: -100, sanity: -45 } };
        }
      },
      {
        text: '伪造实验记录掩盖不显著结果',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "暂时蒙混过关，顺利毕业！但你患上“记录PTSD”，工作后写实验报告都反复检查，生怕露馅。", stats: { research: +15, sanity: -35, health: -15 } };
          return { text: "师弟复刻你的实验，怎么都得不到相同结果，拿着你的记录问“师兄，你这孵育时间是不是写错了？” 谎言当场戳穿，你在课题组社死。", stats: { research: -45, affinity: -85, sanity: -40 } };
        }
      }
    ]
  },
  {
    id: 'lab_accident',
    risk: 'HIGH',
    title: '实验事故：腐蚀性试剂泼手上了',
    description: '你做有机合成时走神（想顶会拒稿理由），手一抖把浓硝酸打翻在实验台，不仅手被灼伤，刚合成的中间体还全洒了——这可是你熬了三个通宵的成果。',
    gambleOption: {
      text: '紧急冲水后继续轻伤不下火线',
      resolve: () => {
        const r = Math.random();
        if (r > 0.7) return { text: "你忍着剧痛抢救出部分中间体，重新提纯后数据完美！导师说你“有科研精神”，还帮你申请了“科研创新奖”，奖金刚好够付医药费。", stats: { health: -25, research: +30, affinity: +25 } };
        return { text: "伤口感染发炎，你被送进ICU，实验台被腐蚀得没法用，中间体全毁。等你出院，课题已经被同门接手，你只能从头再来。", stats: { health: -65, research: -20, sanity: -25 } };
      }
    },
    choices: [
      {
        text: '立刻停手去医院处理伤口',
        resolve: () => { return { text: "伤口得到及时治疗，没留疤痕，但实验被迫中断。导师说“安全第一”，但眼神里全是“进度又要拖了”的无奈，你只能加班赶进度。", stats: { health: -12, research: -10, sanity: +8 } }; }
      },
      {
        text: '隐瞒事故自己用应急箱处理',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "你用烧伤膏处理后居然愈合了，没人发现！就是留了个小疤痕，以后做实验都不敢走神了。", stats: { health: -18, sanity: -8 } };
          return { text: "伤口化脓被导师看到，追问之下你只能坦白。导师又气又急：“违规操作还隐瞒！” 你被暂停实验资格，写了三千字检讨。", stats: { health: -35, research: -25, affinity: -35 } };
        }
      },
      {
        text: '让师弟收拾我先去处理伤口',
        resolve: () => { return { text: "师弟一边收拾一边吐槽“师兄怎么这么不小心”，还把这事传遍了实验室。现在大家都觉得你“不负责任”，组队做实验都不带你。", stats: { affinity: -30, sanity: -15, research: -8 } }; }
      }
    ]
  },
  {
    id: 'thesis_plagiarism',
    risk: 'HIGH',
    title: '论文抄袭指控：查重率90%？',
    description: '你的毕业论文查重报告出来了——总相似比90%，学院启动调查！其实是你引用文献时没改格式，直接复制粘贴了，结果被系统判定为“重度抄袭”，面临延毕风险。',
    choices: [
      {
        text: '承认错误申请重新排版引用',
        resolve: () => { return { text: "学院核实后认定是“引用格式错误”，允许你修改后重新提交。但档案里留下了“学术不严谨”的记录，导师以后看你的论文都要逐句查引用。", stats: { research: -25, sanity: -25, affinity: -15 } }; }
      },
      {
        text: '申诉维权拿出引用证据',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.6) return { text: "你提交了所有引用文献的原文和标注记录，申诉成功！查重率降到10%，顺利通过审核。导师说“下次注意，学术规范不能马虎”。", stats: { research: +8, sanity: -8, affinity: -8 } };
          return { text: "你提交的证据不完整，申诉被驳回。学院认定抄袭成立，你被勒令退学，之前的科研成果全被作废。", stats: { research: -100, affinity: -65, sanity: -55 } };
        }
      },
      {
        text: '找关系疏通托导师打招呼',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.3) return { text: "导师帮你说了情，学院从轻处理，让你延期三个月重写。但你花光了所有积蓄请客送礼，还欠了导师一个大人情。", stats: { sanity: -20, affinity: +10, health: -15 } };
          return { text: "疏通过程被举报，事情闹大，学院公开通报批评你“学术不端+试图舞弊”，你成了全校的反面教材，社死到毕业都不敢见人。", stats: { affinity: -75, sanity: -35, research: -45 } };
        }
      }
    ]
  },
  {
    id: 'mentor_conflict',
    risk: 'HIGH',
    title: '与导师决裂：研究方向互怼',
    description: '你坚持做“小而美”的原创课题，导师却逼你转投“大热点”——他申请的重点项目需要热点数据。你说“热点太卷，原创才有出路”，导师说“不转方向就停你经费”，矛盾彻底爆发。',
    choices: [
      {
        text: '硬刚到底坚持自己的方向',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "你的原创课题取得重大突破，发了顶会！导师被打脸后反而夸你“有主见”，还把你的成果加进了重点项目申报书。", stats: { research: +45, affinity: -15, sanity: +20 } };
          return { text: "导师停了你的经费和设备使用权，你只能自己凑钱买试剂，实验进度龟速。最后被迫休学，课题半途而废，导师还在业内说你“不听话”。", stats: { research: -35, affinity: -55, sanity: -30 } };
        }
      },
      {
        text: '表面服从私下偷偷做原方向',
        resolve: () => { return { text: "你白天做热点课题应付导师，晚上熬夜做自己的方向，身心俱疲。两边进度都慢，热点课题数据不显著，原方向也没突破，每天都在崩溃边缘。", stats: { research: +8, health: -25, sanity: -35 } }; }
      },
      {
        text: '申请换导师此处不留爷自有留爷处',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "新导师是领域大牛，欣赏你的原创思路，不仅给你经费，还帮你对接资源。你的课题很快出成果，之前的坚持没白费。", stats: { research: +20, affinity: +25, sanity: +15 } };
          return { text: "其他导师都怕得罪你的原导师，没人愿意接收你。你成了“无导师学生”，只能挂靠在行政老师名下，毕业遥遥无期。", stats: { research: -20, affinity: -35, sanity: -25 } };
        }
      }
    ]
  },

  // --- MEDIUM RISK ---
  {
    id: 'paper_writing',
    risk: 'MEDIUM',
    title: 'DDL惊魂夜：顶会截稿还有72小时',
    description: '顶会截稿日倒计时3天，你的LaTeX文档里只有摘要，正文是一片纯洁的空白，参考文献还没凑够10篇。导师还在催“明天给我看初稿”。',
    choices: [
      {
        text: '通宵肝爆三天三夜不睡觉',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.3) return { text: "奇迹发生了！你靠着咖啡+红牛续命，赶在最后一分钟提交了论文。虽然格式有点乱，但至少没错过截稿日，现在看到电脑就想吐。", stats: { research: +25, health: -30, sanity: -20 } };
          return { text: "你写到第二天凌晨直接晕倒在电脑前，被室友送进医院。论文只写了一半，只能放弃这次投稿，导师说“下次早点准备”，但眼神里全是失望。", stats: { health: -55, research: +8, sanity: -15 } };
        }
      },
      {
        text: '申请延期或直接放弃',
        resolve: () => {
           return { text: "你给主编发邮件申请延期，被拒后直接放弃。心情瞬间轻松，但毕业又少了一个成果，同门都在晒接收通知，你只能默默羡慕。", stats: { sanity: +18, health: +10, research: -8 } };
        }
      },
      {
        text: '找师兄帮忙抱大腿求带飞',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "师兄是顶会常客，帮你补全了实验分析和参考文献，还优化了格式。作为交换，你要帮他带一个月的饭，顺便给他跑实验样本。", stats: { research: +20, sanity: +8, affinity: +10 } };
          return { text: "师兄自己也在赶另一个顶会的稿，不仅没帮你，还吐槽“你怎么现在才开始写”，让你更焦虑了，最后论文写得一塌糊涂。", stats: { sanity: -20, affinity: -5 } };
        }
      }
    ]
  },
  {
    id: 'conference_presentation',
    risk: 'MEDIUM',
    title: '学术会议报告：台下全是大牛',
    description: '你被选中在CCF A类会议做口头报告，台下坐着领域内的顶流大牛——包括你论文的审稿人！你准备的PPT还有三个Bug，演讲稿只背了一半，现在腿都在发抖。',
    choices: [
      {
        text: '通宵排练逐字逐句背下来',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "报告完美落地！你流畅回答了所有提问，大牛对你的工作赞不绝口，还主动加了你的微信，说“以后多交流”。导师在台下笑得合不拢嘴。", stats: { research: +30, affinity: +35, sanity: +8 } };
          return { text: "你太紧张导致大脑空白，讲到一半忘词了，只能对着PPT念。提问环节被大牛问得哑口无言，场面尴尬到脚趾抠出三室一厅。", stats: { sanity: -25, affinity: -15, research: -8 } };
        }
      },
      {
        text: 'PPT炫技用动画掩盖紧张',
        resolve: () => { return { text: "你的PPT做得堪比科幻大片，动画流畅到让人眼花缭乱，全场都在夸“PPT做得好”。但提问环节露馅了，你对实验细节答不上来，大家觉得你“只会做表面功夫”。", stats: { research: +8, affinity: -8, sanity: +12 } }; }
      },
      {
        text: '找借口取消说身体不舒服',
        resolve: () => { return { text: "你错失了展示自己的机会，导师说“这么好的平台浪费了”，同门都在背后说你“没出息”。以后有学术会议，导师再也不推荐你了。", stats: { affinity: -20, sanity: +10, research: -12 } }; }
      }
    ]
  },
  {
    id: 'review_rejection',
    risk: 'MEDIUM',
    title: '审稿意见暴击：被骂得怀疑人生',
    description: '你的论文被顶会拒稿，审稿人留了三页红色批注，从“实验设计逻辑混乱”diss到“参考文献格式不规范”，最后一句“建议作者先学习一下科研入门知识”直接给你CPU干烧了。',
    choices: [
      {
        text: '怒怼+修改有理有据反驳',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "你逐条反驳审稿人的不合理意见，补充了实验数据，修改后的论文被另一顶会接收！审稿人还私下给你发邮件：“反驳得有道理，继续加油”。", stats: { research: +25, sanity: +8, knowledge: +15 } };
          return { text: "你的回应语气太冲，说审稿人“不懂我的研究”，被主编列入黑名单。该领域的所有顶会都拒收你的论文，导师说你“太年轻，不懂学术圈规则”。", stats: { research: -20, sanity: -25, affinity: -10 } };
        }
      },
      {
        text: '接受现实转投低级别期刊',
        resolve: () => { return { text: "论文顺利发表，但影响因子只有1.0，对毕业帮助不大。导师说“先有成果再说”，但你看着同门的顶会论文，心里不是滋味。", stats: { research: +12, sanity: +12, affinity: -5 } }; }
      },
      {
        text: '崩溃大哭放弃该方向',
        resolve: () => { return { text: "你把论文文档扔进回收站，换了个新方向。虽然摆脱了审稿人的阴影，但之前半年的努力全白费，毕业时间又推迟了。", stats: { research: -30, sanity: +8, health: -8 } }; }
      }
    ]
  },

  // --- LOW RISK ---
  {
    id: 'crush',
    risk: 'LOW',
    title: '实验室恋情：师妹总找我问问题',
    description: '新来的师妹每次都找你问问题——其实GitHub上有详细教程，但她就爱找你“手把手教学”，还总给你带早餐，实验室师兄都在起哄“磕到了”。',
    choices: [
      {
        text: '热情辅导顺便发展感情',
        hasRandom: true,
        resolve: () => { 
           const r = Math.random();
           if(r > 0.5) return { text: "你们在一起了！一起肝论文、一起跑实验、一起吐槽审稿人，实验室变成了撒糖现场。就是约会地点永远在实验室，话题永远离不开调参。", stats: { sanity: +25, research: -8 }, chain: 'break_up' }; // 连锁分手
           return { text: "你想多了！师妹只是觉得你“脾气好、懂的多”，后来她和隔壁实验室的师兄在一起了，还邀请你去吃喜糖，尴尬到抠脚。", stats: { sanity: -18, knowledge: +5 } };
        }
      },
      {
        text: '一心搞科研拒绝所有暗示',
        resolve: () => { return { text: "你冷酷地说“有问题先查文献”，师妹再也没找过你。科研进度突飞猛进，但看着别人成双成对，你偶尔会觉得“科研虽香，有点孤单”。", stats: { research: +15, affinity: +5 } }; }
      },
      {
        text: '介绍给师兄成人之美',
        resolve: () => { return { text: "你把师妹介绍给了单身的大师兄，两人一拍即合。师兄对你感激涕零，以后跑实验、写论文都带着你，还帮你抢GPU算力。", stats: { sanity: +15, affinity: +10 } }; }
      }
    ]
  },
  // 连锁事件 - 感情破裂 (isChain: true)
  {
    id: 'break_up',
    isChain: true,
    risk: 'HIGH',
    title: '【连锁】感情危机：科研太忙被分手',
    description: '你因为赶顶会截稿日，连续一周泡在实验室，忘了和师妹的纪念日，甚至她生病你都没陪她去医院。她哭着说“你爱的是论文，不是我”，提出了分手。',
    choices: [
      {
        text: '苦苦挽留承诺以后平衡时间',
        resolve: () => { return { text: "这月你一边哄师妹一边赶论文，两边都没顾好。论文数据出错，师妹也没回心转意，最后还是分了，你成了“失恋+科研失利”双输选手。", stats: { research: -15, sanity: -25 } }; }
      },
      {
        text: '同意分手化悲愤为力量',
        resolve: () => { return { text: "你把所有精力投入科研，在实验室住了一个月，论文直接中了顶会！但看到别人秀恩爱时，还是会想起她，偶尔会觉得遗憾。", stats: { research: +25, sanity: -15, health: -15 } }; }
      },
      {
        text: '拉黑删除长痛不如短痛',
        resolve: () => { return { text: "你删掉了所有联系方式，强迫自己专注科研。虽然过程很痛苦，但一个月后你调整好了状态，实验进度稳步推进，只是再也不敢轻易谈恋爱了。", stats: { sanity: +8, health: +5 } }; }
      }
    ]
  },
  {
    id: 'funding_cut',
    risk: 'HIGH',
    title: '经费断裂：导师画饼，我吃泡面',
    description: '导师脸色铁青地告诉你，国家自然科学基金申请挂了，下个月开始发不出劳务费。你看着食堂的泡面，已经从红烧牛肉吃到老坛酸菜，再省就要啃馒头就咸菜了。',
    choices: [
      { text: '与实验室共存亡相信导师画的饼', resolve: () => { return { text: "导师感动地拍了拍你的肩膀：“等我申请到横向课题，双倍补给你”。你信了，继续吃泡面搞科研，只是不知道这饼什么时候能兑现。", stats: { affinity: +35, health: -15 } }; } },
      { text: '找兼职补贴一边搬砖一边科研', resolve: () => { return { text: "你找了个数据分析兼职，虽然缓解了经济压力，但每天下班还要去实验室，精力透支。导师看到你总迟到，不太高兴，说“科研要专心”。", stats: { research: -15, health: -10, sanity: +12, affinity: -15 } }; } },
      { text: '帮导师写新本子赌一把', hasRandom: true, resolve: () => { 
           const r = Math.random();
           if(r > 0.4) return { text: "你熬夜写的基金本子居然中了！导师说你“救星”，不仅给你发了补发劳务费，还把你列为核心成员，以后有成果都带你署名。", stats: { affinity: +45, research: +15, knowledge: +15 } };
           return { text: "你写的本子被评审说“创新性不足”，直接拒了。导师嫌弃你“文笔差”，你白忙活一场，还耽误了自己的实验进度。", stats: { sanity: -15, research: -8 } };
        } 
      }
    ]
  },
  {
    id: 'cat_in_lab',
    risk: 'LOW',
    title: '实验室神兽：猫主子溜进来了',
    description: '一只流浪猫不知怎么溜进了实验室，精准跳上你的服务器取暖，还把你的实验记录本扒到了地上。师兄说“这是科研猫，能带来好运”。',
    choices: [
      { text: '撸猫解压科研再苦撸猫治愈', resolve: () => { return { text: "你撸了半小时猫，所有的拒稿烦恼、调参焦虑都消失了！虽然实验记录本脏了，但下午跑模型居然一次收敛，果然是神兽显灵。", stats: { sanity: +25, research: -3 } }; } },
      { text: '赶走它怕弄坏精密设备', resolve: () => { return { text: "猫猫委屈地叫着跑了，你把实验记录本擦干净，但总觉得心里空落落的。下午跑模型连续报错三次，师兄说“你得罪了神兽”。", stats: { sanity: -5, research: -2 } }; } },
      { text: '收养它实验室吉祥物', resolve: () => { return { text: "全实验室凑钱买猫粮、猫砂，“顶会”成了实验室团宠。大家做完实验就撸猫，氛围和谐到不行，连导师都偶尔来喂它，说“这猫能镇住浮躁的科研心”。", stats: { affinity: +10, sanity: +15 } }; } }
    ]
  },
  {
    id: 'coffee_crisis',
    risk: 'LOW',
    title: '咖啡断供：科研人的末日',
    description: '实验室的咖啡机坏了，而你已经连续一周靠咖啡续命——没有咖啡，你连LaTeX的公式都敲不利索。师兄说“咖啡是科研人的命，没咖啡等于没灵魂”。',
    choices: [
      {
        text: '跑遍学校买咖啡为了科研冲',
        resolve: () => { return { text: "你跑了三个食堂才买到咖啡，顺利完成了当天的实验。只是来回奔波浪费了两小时，原本能写完的论文摘要只能拖到明天。", stats: { research: +5, health: -5, sanity: +12 } }; }
      },
      {
        text: '强忍困意硬撑一天',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.5) return { text: "你慢慢适应了无咖啡状态，虽然效率低，但完成了数据整理。晚上回家睡了个好觉，第二天发现不用咖啡也能专注科研了。", stats: { research: +3, sanity: -8, health: +8 } };
          return { text: "你困得睁不开眼，调参时把学习率输错了一个数量级，模型训练了一下午全白费。还不小心碰倒了试剂瓶，虽然没造成事故，但被导师批评“不专心”。", stats: { research: -8, sanity: -12, affinity: -5 } };
        }
      },
      {
        text: '动手修理咖啡机科研人无所不能',
        hasRandom: true,
        resolve: () => {
          const r = Math.random();
          if (r > 0.4) return { text: "你跟着YouTube教程修好了咖啡机！全实验室欢呼雀跃，师兄说“你拯救了大家的科研命”，以后咖啡都让你先喝，还主动帮你跑实验样本。", stats: { affinity: +15, sanity: +15, knowledge: +8 } };
          return { text: "你越修越坏，把咖啡机的加热管烧了，冒出的黑烟触发了实验室烟雾报警器，整栋楼都响起了警报。消防队来了之后，你成了“科研界的灭火典型”。", stats: { sanity: -20, affinity: -25, research: -5 } };
        }
      }
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
  // 从localStorage初始化已探索分支
  const [seenOutcomes, setSeenOutcomes] = useState(() => {
      try {
          const saved = localStorage.getItem('gradSim_seenOutcomes');
          if (saved) {
              const parsed = JSON.parse(saved);
              // 将数组转回Set
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
  
  const [recentEvents, setRecentEvents] = useState([]); 
  const [pendingChainEvents, setPendingChainEvents] = useState([]);
  
  const [isReviewingEvent, setIsReviewingEvent] = useState(false);

  // 持久化保存已探索分支
  useEffect(() => {
      try {
          // Set无法直接JSON序列化，需转为数组
          const serialized = {};
          Object.keys(seenOutcomes).forEach(key => {
              serialized[key] = Array.from(seenOutcomes[key]);
          });
          localStorage.setItem('gradSim_seenOutcomes', JSON.stringify(serialized));
      } catch (e) {
          console.error("Failed to save history", e);
      }
  }, [seenOutcomes]);

  // 彻底重置游戏
  const resetGame = () => {
    // 强制重置所有状态
    setStats({ ...INITIAL_STATS_BASE });
    setTurn(1);
    setHistoryLog([]);
    setRecentEvents([]);
    setPendingChainEvents([]);
    // 注意：不再清空 seenOutcomes
    setSelectedTrait(null);
    setResultLog(null);
    setCurrentEvent(null);
    setEndReason(null);
    setPhase('CHARACTER_CREATION');
  };

  // 检测游戏结束状态 (返回true表示游戏结束)
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
      <div className="max-w-3xl w-full p-2 md:p-8 flex flex-col min-h-screen gap-3 relative pb-safe">
        
        {/* 顶部栏 */}
        <header className={`grid grid-cols-[auto_1fr_auto] md:flex md:items-center items-center gap-2 md:gap-3 p-3 rounded-2xl shadow-sm border transition-colors duration-500 ${isAnomaly ? 'bg-slate-900 border-purple-700' : 'bg-white border-slate-200'}`}>
          {/* Logo Icon */}
          <div className={`p-2 rounded-xl shadow-lg text-white ${isAnomaly ? 'bg-purple-900 shadow-purple-900' : 'bg-gradient-to-br from-indigo-900 to-slate-800 shadow-indigo-200'}`}>
             {isAnomaly ? <Ghost className="w-5 h-5 animate-bounce" /> : <GraduationCap className="w-5 h-5" />}
          </div>

          {/* Title & Info */}
          <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-2">
                <h1 className={`font-extrabold text-sm md:text-lg leading-tight truncate ${isAnomaly ? 'text-purple-200' : 'text-slate-800'}`}>研究生模拟器</h1>
                <a href="https://github.com/Kiritorz/grad-student-simulator" target="_blank" rel="noopener noreferrer" className={`opacity-80 md:hover:opacity-100 transition-opacity ${isAnomaly ? 'text-purple-300' : 'text-slate-400 hover:text-slate-700'}`}>
                  <Github size={14} />
                </a>
             </div>
             <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-medium mt-0.5">
                <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 ${isAnomaly ? 'bg-purple-900/50 text-purple-300' : 'bg-slate-100 text-slate-500'}`}>
                  <Clock size={10} className={isAnomaly ? 'text-purple-400' : 'text-indigo-600'}/> 
                  <span>M <span className={`font-bold ${isAnomaly ? 'text-purple-400' : 'text-indigo-700'}`}>{turn}</span>/{MAX_TURNS}</span>
                </div>
                {/* 毕业要求展示 */}
                <div className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${isAnomaly ? 'border-purple-500/30 text-purple-400' : 'border-slate-200 text-slate-500'}`}>
                  <Target size={10} />
                  <span className="truncate">毕业要求: 科研 100%</span>
                </div>
             </div>
          </div>

          {/* Right Actions: 增加 md:ml-auto 将其推到最右侧 */}
          <div className="flex items-center gap-2 md:ml-auto">
              {/* Mobile Knowledge (Compact) */}
              <div className={`flex flex-col items-end md:hidden ${isAnomaly ? 'text-purple-300' : 'text-indigo-900'}`}>
                 <span className="text-[10px] font-bold opacity-60 uppercase">Knw.</span>
                 <span className="font-mono text-sm font-black leading-none">{stats.knowledge}</span>
              </div>

              {/* Desktop Knowledge - 优化了 title 说明 */}
              <div 
                className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-help transition-colors ${isAnomaly ? 'bg-slate-900 border-purple-800' : 'bg-slate-50 border-slate-100'}`} 
                title="知识储备作用：
1. 显著提高实验、论文等高级选项的成功率。
2. 避免因知识不足导致的实验事故。
3. 是达成'一代宗师'等特殊结局的关键条件。"
              >
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

        {/* 状态面板 (仅在非角色创建阶段显示) */}
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
                  // 如果是连锁事件，覆盖样式为CHAIN (除非本身是ANOMALY)
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

              {/* 选项区域 - 增加 pb-6 防止底部遮挡 */}
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
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isAnomaly ? 'text-purple-300 bg-purple-900/50' : 'text-indigo-400 bg-indigo-50'}`}><Dices size={12}/> 概率</span>
                            ) : <span></span>}
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
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
                            <div className="bg-white/20 p-2 rounded-lg"><Dices size={18} className="animate-pulse"/></div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-sm">放手一搏</span>
                                <span className="text-xs text-indigo-100">{currentEvent.gambleOption.text}</span>
                            </div>
                        </div>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform"/>
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
              <div className={`p-6 md:p-8 rounded-[2rem] shadow-xl border flex-1 flex flex-col relative overflow-hidden ${isAnomaly ? 'bg-slate-800 border-purple-800' : 'bg-white border-slate-200'}`}>
                <div className={`absolute top-0 left-0 w-full h-1.5 ${isAnomaly ? 'bg-purple-900' : 'bg-slate-100'}`}>
                   <div className={`h-full w-full animate-[loading_2s_ease-in-out] ${isAnomaly ? 'bg-purple-500' : 'bg-indigo-600'}`}></div>
                </div>

                <button 
                    onClick={() => setIsReviewingEvent(!isReviewingEvent)}
                    className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-20 ${isAnomaly ? 'text-purple-600 md:hover:bg-purple-900 md:hover:text-purple-300' : 'text-slate-400 md:hover:text-indigo-600 md:hover:bg-slate-50'}`}
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
                        
                        <div className={`mb-6 flex-1 p-5 rounded-2xl border relative ${isAnomaly ? 'bg-slate-900/50 border-purple-700' : 'bg-slate-50/80 border-slate-200'} overflow-y-auto custom-scrollbar max-h-[40vh]`}>
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
                                <ul className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
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
                  className={`w-full text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] text-base ${isAnomaly ? 'bg-purple-600 md:hover:bg-purple-500 shadow-purple-900' : 'bg-indigo-600 md:hover:bg-indigo-700 shadow-indigo-200'}`}
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