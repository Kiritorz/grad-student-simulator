import { Flame, Smile, Crown, Coffee } from "lucide-react";

// --- 特征系统 --
export const TRAITS = [
    {
        id: 'roll_king',
        name: '学术卷王',
        desc: '只要学不死，就往死里学。',
        icon: Flame,
        color: 'from-orange-500 to-red-600',
        stats: { research: 25, health: -20, sanity: 0, affinity: 15, knowledge: 20 },
        statsDesc: '科研+25，发量-20，导师好感+15，知识+20'
    },
    {
        id: 'social_star',
        name: '社交达人',
        desc: '比起实验室，更常出现在联谊会。',
        icon: Smile,
        color: 'from-pink-500 to-rose-500',
        stats: { research: 0, health: 0, sanity: 0, affinity: 35, knowledge: 5 },
        statsDesc: '导师好感+35，知识+5'
    },
    {
        id: 'rich_kid',
        name: '带资进组',
        desc: '经费？我自己带。',
        icon: Crown,
        color: 'from-yellow-400 to-amber-600',
        stats: { research: 0, health: 20, sanity: 10, affinity: 0, knowledge: 10 },
        statsDesc: '发量+20，SAN值+10，知识+10'
    },
    {
        id: 'buddha',
        name: '佛系青年',
        desc: '缘分到了，论文自然就有了。',
        icon: Coffee,
        color: 'from-emerald-400 to-teal-600',
        stats: { research: 0, health: 10, sanity: 30, affinity: -5, knowledge: 5 },
        statsDesc: '发量+10，SAN值+30，导师好感-5，知识+5'
    }
];