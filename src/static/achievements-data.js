import { Briefcase, Crown, Sparkles, Target, Zap, Heart, Smile, Coffee, Skull, Ghost, Frown, Dices, GraduationCap, ZapOff, AlertTriangle, HeartCrack, Clock } from "lucide-react";

// --- 成就系统定义 (顺序即优先级) 
export const ACHIEVEMENTS_DATA = [
    // T0: 传说级
    { id: 'god_mode', title: '学术之神', desc: '各项指标全部拉满！人类的学术评价体系已经无法定义你的存在。', condition: '所有属性满值毕业', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-300' },
    { id: 'speed_run_6', title: '光速逃逸', desc: '半年就毕业？你就是学术界的博尔特！建议直接申请火星移民计划。', condition: '6个月内毕业', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-300' },

    // T1: 卓越级
    { id: 'speed_run_12', title: '天才少年', desc: '一年毕业的神童，你的名字将永远刻在学院的荣誉墙上。', condition: '12个月内毕业', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-300' },
    { id: 'hexagon', title: '六边形战士', desc: '德智体美劳全面发展，你就是导师口中那个“别人家的研究生”。', condition: '所有属性高于80毕业', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'border-indigo-300' },

    // T2: 专精级
    { id: 'nobel_reserve', title: '诺奖预备役', desc: '你的知识储备令人恐惧，答辩现场变成了你的个人科普讲座。', condition: '知识>=90毕业', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' },
    { id: 'head_disciple', title: '掌门大弟子', desc: '导师看你的眼神比看亲儿子还亲，甚至想把实验室钥匙传给你。', condition: '好感>=90毕业', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100', border: 'border-pink-300' },
    { id: 'health_master', title: '养生宗师', desc: '读研三年，头发没少，反而练出了八块腹肌。你来读研是顺便健个身？', condition: '发量>=90毕业', icon: Smile, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' },
    { id: 'zen_master', title: '心如止水', desc: '泰山崩于前而色不变，拒稿信砸在脸上而心不惊。你已修成正果。', condition: 'SAN值>=90毕业', icon: Coffee, color: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-300' },

    // T3: 生存级/特殊
    { id: 'battle_scarred', title: '战损版毕业', desc: '你是被担架抬进答辩现场的。虽然毕业了，但建议先去ICU挂个号。', condition: '发量<=20毕业', icon: Skull, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
    { id: 'cthulhu', title: '克苏鲁学者', desc: '你毕业了，但你也疯了。你的论文充满了不可名状的低语...', condition: 'SAN值<=20毕业', icon: Ghost, color: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-300' },
    { id: 'lone_wolf', title: '孤狼学者', desc: '全靠自己单打独斗发顶刊，导师在答辩会上全程黑脸，但不得不让你过。', condition: '好感<=20毕业', icon: Frown, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
    { id: 'lucky_dog', title: '天选之子', desc: '你也搞不懂这论文是怎么写出来的，反正模型就是收敛了，这大概就是玄学吧。', condition: '知识<30毕业', icon: Dices, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300' },
    { id: 'normal_grad', title: '顺利毕业', desc: '普普通通的毕业，平平淡淡的幸福。你战胜了99%的同龄人。', condition: '正常毕业', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },

    // T4: 失败/特殊结局
    { id: 'instant_death', title: '落地成盒', desc: '开局第一个月就退学了，这也算是一种速通吧？', condition: '第1个月即失败', icon: ZapOff, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-300' },
    { id: 'almost_there', title: '倒在黎明前', desc: '明明只差一点点... 科研进度都95%了，心态却先崩了。', condition: '科研>=95时失败', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' },
    { id: 'sanity_zero', title: '精神崩溃', desc: '你在这个周一的早晨选择了退学。也许卖炒粉才是你的归宿？', condition: 'SAN值归零', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' },
    { id: 'health_zero', title: 'ICU 预定', desc: '救护车的声音响彻校园。长期熬夜让你倒在了实验室的地板上。', condition: '发量归零', icon: Skull, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' },
    { id: 'affinity_zero', title: '逐出师门', desc: '导师把你叫到办公室，冷冷地通知你：“你另请高明吧”。', condition: '好感归零', icon: HeartCrack, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-300' },
    { id: 'fish_master', title: '摸鱼大师', desc: '虽然没毕业，但你身体倍儿棒，心态超好。导师拿你没办法，只能让你延毕。', condition: '延毕且健康与SAN值均>80', icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-300' },
    { id: 'deferred', title: '被迫延毕', desc: '时间到了。你的成果平平无奇，只能延期毕业，继续在这个炼狱里挣扎。', condition: '时间耗尽未毕业', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300' },
];