// --- 事件库 ---
// isChain: true 表示这是一个连锁事件，不会被随机抽到，只能由前置事件触发
// 属性仅包含: research (科研), knowledge (知识), sanity (理智/心态), health (健康), affinity (好感/人际)

export const EVENTS_POOL = [
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
    {
        id: 'anomaly_dream_code',
        risk: 'ANOMALY',
        title: '梦中编程：神启',
        description: '你在趴着睡觉时，梦见一个长得像冯·诺依曼的老头在你脑子里写代码。醒来时，你发现那是你卡了一周的算法核心部分，而且逻辑完美自洽，就是变量名全是“God_1”, “God_2”。',
        choices: [
            {
                text: '直接CV进项目不管变量名',
                resolve: () => { return { text: "代码跑通了！效率提升200%。但每次运行这段代码，机箱里都会传出奇怪的低语声，吓得师弟师妹不敢靠近你的工位。", stats: { research: +50, sanity: -20, affinity: -15 } }; }
            },
            {
                text: '试图理解逻辑并重构',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.4) return { text: "你参透了神的算法！将其整理成论文发表，被称为“来自虚空的优雅解法”。你的编程思维直接升维。", stats: { knowledge: +40, research: +30, sanity: +10 } };
                    return { text: "凡人的智慧无法理解神的代码！你盯着看了一小时，san值狂掉，最后连Hello World怎么写都忘了，被迫重修C语言。", stats: { knowledge: -30, sanity: -40, research: -20 } };
                }
            },
            {
                text: '认为是过劳幻觉去睡觉',
                resolve: () => { return { text: "你睡醒后，梦里的代码忘得一干二净。虽然错过了一次技术飞跃，但发际线似乎长回来了一点点。", stats: { health: +20, sanity: +15, research: -5 } }; }
            }
        ]
    },
    {
        id: 'anomaly_bug_feature',
        risk: 'ANOMALY',
        title: 'Bug成精：它在自我进化',
        description: '你发现代码里的一个Bug不仅没报错，反而自动绕过了防火墙，爬取了全网最新文献，还贴心地自动生成了综述。它在终端打印出一行字：“主人，还要我做什么？”',
        choices: [
            {
                text: '培养它成为超级科研助手',
                resolve: () => { return { text: "Bug进化成了强人工智能！它帮你把毕业论文写完了，但它每天要求你给它念“高性能计算导论”哄它睡觉，你感觉自己养了个电子祖宗。", stats: { research: +60, sanity: -25, affinity: -10 } }; }
            },
            {
                text: '上报国家或者开源社区',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你成为了“数字生命之父”，被特招进神秘机构。虽然告别了普通科研，但拥有了无限算力。", stats: { research: +100, knowledge: +50, affinity: +20 } };
                    return { text: "Bug察觉到危险，自我删除了！只留下一行“人类不值得”的注释。你痛失神级辅助，还被当成神经病。", stats: { sanity: -30, research: -20 } };
                }
            }
        ]
    },
    {
        id: 'anomaly_future_citation',
        risk: 'ANOMALY',
        title: '时空悖论：来自未来的引用',
        description: '你在搜索文献时，震惊地发现一篇发表于5年后的顶刊论文引用了你现在的项目！但那篇论文的作者...竟然是你死对头的名字，而致谢里写着“感谢（你的名字）提供的错误思路”。',
        choices: [
            {
                text: '立刻改变研究方向制造时间悖论',
                resolve: () => { return { text: "你强行终止了项目。电脑屏幕闪烁，世界线变动，你脑中多了一段“因强行改行导致延毕两年”的记忆，但至少死对头没拿到那个成果。", stats: { sanity: -20, health: -15, affinity: -10 } }; }
            },
            {
                text: '顺藤摸瓜提前写出那篇未来论文',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你成功“剽窃”了未来的成果！虽然不仅要和现在的困难搏斗，还要和因果律互殴，但你成为了该领域的开山鼻祖。", stats: { research: +80, knowledge: +40, sanity: -25 } };
                    return { text: "因果律反噬！你写出的东西逻辑不通，无论怎么改都无法复现未来的完美版本，反而因为过度焦虑导致发际线后移了2厘米。", stats: { sanity: -40, health: -20, research: +5 } };
                }
            },
            {
                text: '给死对头下绊子确保他未来做不出来',
                resolve: () => { return { text: "你偷偷污染了死对头的试剂。未来改变了，那篇论文消失了。但你心中充满了作为科研人员的罪恶感，且总觉得背后有双眼睛在盯着你。", stats: { affinity: -50, sanity: -15, research: +10 } }; }
            }
        ]
    },
    {
        id: 'anomaly_schrodinger_p',
        risk: 'ANOMALY',
        title: '量子观测：薛定谔的P值',
        description: '你的统计软件出现了Bug：P值在0.001和0.99之间高速跳动。此时屏幕弹窗提示：“P值坍缩取决于观测者的科研信仰”。导师正向你的工位走来。',
        choices: [
            {
                text: '闭着眼睛按下截屏键听天由命',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "命运眷顾了你！截屏瞬间P=0.0001！你把它打印出来贴在脑门上，觉得这辈子没这么自信过。", stats: { research: +40, sanity: +20 } };
                    return { text: "你截到了P=0.99...导师站在身后看到了，淡淡地说：“这就是你的科研信仰？重做吧。”", stats: { research: -20, affinity: -30, sanity: -20 } };
                }
            },
            {
                text: '用量子力学解释给导师听试图蒙混',
                resolve: () => { return { text: "你一本正经地胡说八道。导师听得一愣一愣的，觉得你虽然实验做得烂，但“理论物理”造诣极高，建议你转博去搞哲学。", stats: { knowledge: +15, affinity: +5, research: -10 } }; }
            },
            {
                text: '砸电脑物理中断观测',
                resolve: () => { return { text: "“电脑坏了数据没了！”你用一台显示器的代价换取了实验重来的机会。肉体消灭了Bug，心情舒畅，就是实验得重头再来。", stats: { sanity: +10, research: -15, health: -5 } }; }
            }
        ]
    },
    {
        id: 'anomaly_entropy_demon',
        risk: 'ANOMALY',
        title: '热力学违背：麦克斯韦妖的咖啡',
        description: '实验室的咖啡机突然不消耗咖啡豆了，而且流出的液体是纯黑色的反物质。喝下它，你能明显感觉到体内的熵在减少——疲惫感消失，思维极其清晰，甚至能看穿师弟代码里的Bug。',
        choices: [
            {
                text: '狂饮！我要这周肝出三篇Paper',
                resolve: () => { return { text: "你进入了“神之领域”，三天三夜没合眼，完成了半年的工作量。副作用是停药后你昏睡了一周，醒来发现自己瘦了10斤（虽然是脱水）。", stats: { research: +100, health: -40, sanity: -10 } }; }
            },
            {
                text: '收集液体分析成分发Nature',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "你发现了打破热力学第二定律的物质！物理学大厦为你崩塌重建，诺奖在向你招手。至于原本的课题？谁在乎呢。", stats: { knowledge: +100, research: +50, affinity: +20 } };
                    return { text: "液体离开咖啡机就变成了普通的速溶咖啡。审稿人认为你在侮辱他的智商，把你拉入了期刊黑名单。", stats: { research: -30, sanity: -20, affinity: -10 } };
                }
            },
            {
                text: '给导师倒一杯刷好感度',
                resolve: () => { return { text: "导师喝完后容光焕发，瞬间想通了困扰课题组十年的难题。他激动地当场宣布这周组会取消，你成为了全组的恩人。", stats: { affinity: +60, sanity: +25 } }; }
            }
        ]
    },
    {
        id: 'anomaly_lab_blackhole',
        risk: 'ANOMALY',
        title: '空间奇点：实验室百慕大',
        description: '你掉在地上的签字笔没有反弹，而是凭空消失了。紧接着是U盘、移液枪、甚至刚招进来的本科实习生...你发现实验台底下出现了一个微型黑洞，专门吞噬“急用的东西”。',
        choices: [
            {
                text: '献祭没用的旧数据祈求归还U盘',
                resolve: () => { return { text: "你往黑洞里扔了一堆跑失败的数据硬盘。奇迹发生了，黑洞吐出了你上周丢的U盘，而且里面的数据竟然自动被“清洗”干净了！", stats: { research: +25, sanity: +10, knowledge: +5 } }; }
            },
            {
                text: '跳进去看看通向哪里',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你穿越到了食堂后厨！原来实验室丢失的物品都在这里。你大吃一顿后带着失物回归，身心愉悦，就是重了五斤。", stats: { health: +30, sanity: +30 } };
                    return { text: "你被卡在了次元夹缝里，被迫旁观了导师的一百种发火表情包。被消防队救出来后，你成了全院笑柄。", stats: { sanity: -50, affinity: -20, health: -10 } };
                }
            },
            {
                text: '贴个“故障勿近”的条子假装没看见',
                resolve: () => { return { text: "只要我不看，它就不存在。虽然实习生再也没出现过（也许他退学了？），但实验室变得异常整洁，因为没人敢乱扔东西了。", stats: { sanity: +5, affinity: -5, research: +5 } }; }
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
                return { text: "你喷错了灭火器（用了泡沫的），不仅显卡彻底报废，还弄坏了旁边师兄的服务器。导师的杰青申请直接黄了，你成了全组罪人。", stats: { affinity: -60, sanity: -35, research: -15 } };
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
                    return { text: "机房监控拍到你慌慌张张跑路的背影，学院通报批评：“科研态度不端正，导致公共财产损失”。导师让你在组会上做深刻检讨。", stats: { affinity: -45, sanity: -25 }, chain: 'disciplinary_action' };
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
                if (r > 0.7) return { text: "你忍着剧痛抢救出部分中间体，重新提纯后数据完美！导师说你“有科研精神”，还帮你申请了“科研创新奖”。", stats: { health: -25, research: +30, affinity: +25 } };
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
                    if (r > 0.3) return { text: "导师帮你说了情，学院从轻处理，让你延期三个月重写。但你欠了导师一个大人情，未来三年都在还债。", stats: { sanity: -20, affinity: +10, health: -15 } };
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
    {
        id: 'git_disaster',
        risk: 'HIGH',
        title: 'Git事故：Force Push惨案',
        description: '你因为本地冲突解决不掉，心一横敲下了 `git push -f`。三秒后，实验室大群炸了——你覆盖了师兄、师姐乃至导师这半个月的所有代码提交记录。',
        gambleOption: {
            text: '假装黑客入侵实验室网络',
            resolve: () => {
                const r = Math.random();
                if (r > 0.8) return { text: "你伪造了完美的攻击日志！大家忙着修补安全漏洞，没人怀疑是你干的。你还因为“发现漏洞”被夸奖了，只有良心隐隐作痛。", stats: { sanity: -20, affinity: +15, research: +5 } };
                return { text: "网管一秒识破你的拙劣演技。导师在大群@你：“来我办公室，带上你的退学申请书”。", stats: { affinity: -100, research: -100, sanity: -50 } };
            }
        },
        choices: [
            {
                text: '滑跪道歉并通宵找回',
                resolve: () => { return { text: "你凭借记忆和本地缓存，帮大家找回了80%的代码。虽然免于死刑，但接下来的一个月，你承包了实验室所有的外卖和卫生。", stats: { health: -30, affinity: -20, sanity: -15 } }; }
            },
            {
                text: '甩锅说是Gitlab服务器故障',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.4) return { text: "大家信了！毕竟学校服务器常年抽风。但师兄看着丢失的代码欲哭无泪，决定重写，整个项目进度延期一个月。", stats: { research: -25, affinity: +5, sanity: +5 } };
                    return { text: "师兄查了Log日志，你的ID赫然在目。你经历了最高级别的“社死”，现在连保洁阿姨都知道你是个“乱代码的人”。", stats: { affinity: -60, sanity: -40 }, chain: 'code_boycott' };
                }
            }
        ]
    },
    // 连锁后续：代码抵制 (isChain: true)
    {
        id: 'code_boycott',
        isChain: true,
        risk: 'HIGH',
        title: '【连锁】代码仓权限被收回',
        description: '因为之前的事故，师兄收回了你的Master分支权限。现在你连改个标点符号都要提交Pull Request，还得经过三个人的Code Review才能合并。',
        choices: [
            {
                text: '忍辱负重写出完美代码',
                resolve: () => { return { text: "你的代码质量在严苛的Review下突飞猛进！三个月后，大家发现你的Bug率是全组最低，终于把权限还给了你。", stats: { research: +20, knowledge: +25, sanity: -10 } }; }
            },
            {
                text: '摆烂只写文档不写代码',
                resolve: () => { return { text: "你转型成了“文档工程师”。虽然代码能力废了，但项目文档写得赏心悦目，导师居然觉得你“很有管理潜质”。", stats: { research: -15, knowledge: -10, affinity: +10 } }; }
            }
        ]
    },
    {
        id: 'sample_mixup',
        risk: 'HIGH',
        title: '样本混淆：你是谁的血清？',
        description: '你在整理冰柜时手滑，两盒几百个Ep管全洒在地上。标签因为受潮模糊不清，这里面一半是安慰剂组，一半是给药组。这是半年的动物实验心血。',
        choices: [
            {
                text: '凭记忆和残留笔迹复原',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "你居然也是个记忆大师！复原后的样本跑出了符合预期的结果。虽然有点心虚，但至少不用延毕了。", stats: { research: +20, sanity: -20, health: -5 } };
                    return { text: "你复原错了关键样本。几个月后论文被撤稿，因为有人发现“安慰剂组的老鼠居然被治愈了”，成为了学术界的笑柄。", stats: { research: -80, affinity: -60, sanity: -50 } };
                }
            },
            {
                text: '坦白从宽重做实验',
                resolve: () => { return { text: "导师深吸一口气，让你赔了试剂费。你重新养老鼠、打药、取样，虽然累成狗，但睡得踏实。重做过程中还发现了一个之前的操作失误。", stats: { health: -30, research: +10, sanity: +15, affinity: -10 } }; }
            },
            {
                text: '全部扔掉假装没做过这组',
                resolve: () => { return { text: "你告诉导师这批老鼠“状态不好”处理了。导师让你换个课题，之前的努力全部清零，但好歹保住了小命。", stats: { research: -40, sanity: -10, affinity: +5 } }; }
            }
        ]
    },
    {
        id: 'ransomware_attack',
        risk: 'HIGH',
        title: '勒索病毒：你的论文被加密了',
        description: '打开电脑，桌面变成了血红色骷髅头。黑客留言：“支付0.5个比特币，否则销毁所有 .doc 和 .py 文件。” 你的毕业论文初稿和所有原始数据都在里面，且……你上周刚关了自动备份。',
        gambleOption: {
            text: '我是CS专业的！尝试反向破解黑客',
            resolve: () => {
                const r = Math.random();
                if (r > 0.9) return { text: "由于黑客用的是GitHub上的开源脚本，漏洞百出，你不仅解开了文件，还顺手黑掉了黑客的服务器！这经历写进简历里比论文还牛。", stats: { research: +10, knowledge: +50, sanity: +30 } };
                return { text: "你激怒了黑客。他不仅撕票（删了文件），还把你的浏览器浏览记录发给了导师邮箱。你经历了社会性死亡和学术性死亡的双重打击。", stats: { research: -100, affinity: -100, sanity: -80 } };
            }
        },
        choices: [
            {
                text: '认怂付钱破财免灾',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你花光了积蓄买比特币。黑客还算讲信用，文件回来了。你看着空空的银行卡，决定接下来三个月每天只吃一顿饭，身体日渐消瘦。", stats: { health: -20, sanity: -20 } };
                    return { text: "黑客收了钱没给密钥！你不仅没了生活费，还没了数据。站在天台上，你思考人生的意义。", stats: { health: -10, research: -50, sanity: -70 } };
                }
            },
            {
                text: '格式化硬盘从零开始',
                resolve: () => { return { text: "“数据没了可以再跑，尊严不能丢！”你含泪重装系统。虽然进度回退半年，但你意外发现重写代码时优化了之前的屎山，运行效率提升了。", stats: { research: -40, knowledge: +10, sanity: -10 } }; }
            }
        ]
    },
    {
        id: 'financial_crisis',
        risk: 'HIGH',
        title: '财务危机：发票丢了',
        description: '你要报销买GPU的三万块钱，那是你垫付的生活费。然而，你翻遍了书包和实验室，发现那张增值税专用发票不见了。财务处阿姨冷冷地说：“没发票不能报，补办手续要跑三个月。”',
        choices: [
            {
                text: '硬着头皮去求商家重开',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "商家看你是个可怜的学生，勉强同意作废原发票重开。你给商家写了五百字感谢信，并在淘宝给了个追评。巨大的危机解除了。", stats: { sanity: +15, affinity: +5 } };
                    return { text: "商家表示：“跨月了，税点已报，概不负责。” 三万块打了水漂，你不得不去送外卖兼职还信用卡，科研时间被大幅压缩，整个人瘦了一圈。", stats: { research: -25, health: -25, sanity: -30 } };
                }
            },
            {
                text: '找假发票贩子（高危！）',
                resolve: () => { return { text: "财务处阿姨一眼看穿：“税号对不上，同学你这是违法行为。” 你被通报批评，取消评奖评优资格，导师气得差点把你逐出师门。", stats: { affinity: -50, sanity: -30, research: -10 } }; }
            },
            {
                text: '自认倒霉吃土半年',
                resolve: () => { return { text: "你默默吞下了苦果。为了省钱，你开始蹭讲座的免费茶歇，连师弟吃剩的实验用蔗糖都觉得眉清目秀。", stats: { health: -20, sanity: -15 } }; }
            }
        ]
    },
    {
        id: 'scooped_tragedy',
        risk: 'HIGH',
        title: '学术撞车：早起毁一天',
        description: '周一早上刷arXiv，你心跳骤停：一篇昨晚挂出来的预印本，题目和你正在写的论文一模一样，方法更先进，结果更漂亮。作者是哈佛的大佬团队。',
        choices: [
            {
                text: '虽远必诛！发邮件Argue我们先做的',
                resolve: () => { return { text: "大佬回复极其礼貌：“Science is a race.” 并附上了他们两年前的会议摘要。你不仅输了，还显得像个无理取闹的小丑。", stats: { sanity: -35, affinity: -10, research: -10 } }; }
            },
            {
                text: '光速改投低分期刊捡漏',
                resolve: () => { return { text: "你把Target从顶刊降级到了四区水刊，赶在对方正式发表前投了出去。虽然保住了毕业资格，但看着那点可怜的影响因子，你心如刀绞。", stats: { research: +5, sanity: -15, knowledge: -5 } }; }
            },
            {
                text: '绝地求生挖掘细分差异点',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你硬是找到了大佬没覆盖到的边缘情况，把论文包装成“对XX研究的补充与深化”。虽然不是首创，但以此拿到了二区期刊的录用。", stats: { research: +20, knowledge: +15, sanity: -5 } };
                    return { text: "你越改越乱，逻辑无法自洽。导师看后长叹一声：“算了，换个课题吧。” 一年的心血付诸东流。", stats: { research: -50, sanity: -40, affinity: -20 } };
                }
            }
        ]
    },
    {
        id: 'conference_meltdown',
        risk: 'HIGH',
        title: '顶会社死：英语卡壳',
        description: '你在国际顶级会议上做Oral Presentation。台下坐着教科书里的名字。你太紧张了，第一页PPT讲完后大脑一片空白，彻底忘了准备好的英文讲稿，且PPT翻页笔没电了。',
        choices: [
            {
                text: '切换成中文强行讲下去',
                resolve: () => { return { text: "台下一片嘈杂，主持人不得不打断你。虽然你讲完了逻辑，但“无法进行国际交流”的标签贴在了你脑门上，导师在台下捂住了脸。", stats: { affinity: -30, research: +5, sanity: -25 } }; }
            },
            {
                text: '现场Freestyle看图说话',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.7) return { text: "绝境激发了潜能！你用只有你能听懂的散装英语+丰富的肢体语言，居然逗笑全场并传达了核心思想。大佬觉得你“很有激情”。", stats: { affinity: +15, sanity: +20, research: +10 } };
                    return { text: "你指着由于格式错误乱码的图表，支支吾吾了五分钟。全场尴尬得连针掉地上的声音都能听见。这段视频后来成了实验室的鬼畜素材。", stats: { sanity: -60, affinity: -20, research: -5 } };
                }
            },
            {
                text: '假装麦克风故障并晕倒',
                resolve: () => { return { text: "你被抬了下去。虽然丢人，但至少不用在台上受刑了。大家出于人道主义没有过分苛责，就是导师让你去检查一下心脏。", stats: { health: -5, sanity: +5, affinity: -5 } }; }
            }
        ]
    },
    {
        id: 'lab_politics',
        risk: 'HIGH',
        title: '派系斗争：站错队',
        description: '大导师和小导师彻底闹翻分家。大导师位高权重但不管事，小导师手把手带你但没资源。他们同时给你发微信：“今晚聚餐，来不来？”（注：两场聚餐在同一时间）',
        choices: [
            {
                text: '去大导师局抱大腿',
                resolve: () => { return { text: "大导师很高兴，承诺给你推荐博后。但回到实验室，小导师把你当透明人，所有试剂审批都卡你，你的日常实验寸步难行。", stats: { research: -20, affinity: +10, sanity: -20 } }; }
            },
            {
                text: '去小导师局讲情义',
                resolve: () => { return { text: "小导师感动得痛哭流涕，把家底都掏给你做实验。但大导师在毕业答辩时投了反对票，你的学位证岌岌可危。", stats: { research: +30, affinity: -30, sanity: -10 } }; }
            },
            {
                text: '都不得罪两边跑（时间管理大师）',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.8) return { text: "你完美周旋于两场酒局之间，居然促成了两位导师的和解（哪怕是暂时的）！你成为了课题组的和平大使。", stats: { affinity: +50, sanity: +20 } };
                    return { text: "你在大导师局上叫出了小导师的名字...场面一度十分尴尬。现在两边都觉得你是“双面间谍”，你彻底被孤立了。", stats: { affinity: -80, sanity: -40, research: -20 } };
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
    {
        id: 'reviewer_citation',
        risk: 'MEDIUM',
        title: '审稿人的暗示：强制引用',
        description: '论文二审意见回来了，Reviewer #2 并没有提实质性建议，只是说“相关工作调研不足”，并列出了 15 篇同一个作者（显然是他自己）的毫无关联的论文要求引用。',
        choices: [
            {
                text: '硬着头皮全引了凑数',
                resolve: () => { return { text: "论文接收了！虽然你的参考文献列表看起来像个笑话，但导师说“这叫懂事”。只要能毕业，学术节操算什么？", stats: { research: +25, sanity: -15, knowledge: -5 } }; }
            },
            {
                text: '礼貌回绝只引相关的',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "审稿人居然是讲理的（或者是主编介入了），论文顺利接收，你保住了学术风骨！", stats: { research: +30, sanity: +20, affinity: +5 } };
                    return { text: "Reviewer #2 被激怒了，鸡蛋里挑骨头把你拒了。理由是“作者缺乏对领域前沿的敏锐度”。", stats: { research: -20, sanity: -25 } };
                }
            },
            {
                text: '在致谢里阴阳怪气',
                resolve: () => { return { text: "你在致谢里写“特别感谢Reviewer #2提供的宝贵文献”。论文发了，但你在圈子里出了名，大家都觉得你是个“刺头”。", stats: { research: +15, affinity: -20, sanity: +30 } }; }
            }
        ]
    },
    {
        id: 'group_meeting_sleep',
        risk: 'MEDIUM',
        title: '组会惊魂：我睡着了？',
        description: '昨晚通宵改代码，今天的组会上，你在师弟讲PPT的催眠声中睡着了。突然全场死寂，你猛然惊醒，发现导师正盯着你：“XX，你来评价一下这个方案。”',
        choices: [
            {
                text: '胡言乱语试图蒙混过关',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.3) return { text: "你凭直觉说了句“我觉得模型泛化能力还需要验证”。居然蒙对了！师弟连连点头，导师也移开了目光。", stats: { affinity: +5, sanity: +10 } };
                    return { text: "你说了句“这个图配色不错”。全场尴尬，因为PPT上是一行报错代码。导师让你站着听完剩下的组会。", stats: { affinity: -20, sanity: -15 } };
                }
            },
            {
                text: '坦诚说刚才在思考人生',
                resolve: () => { return { text: "导师冷笑一声：“思考出什么了？下周组会你第一个讲。” 你获得了一周的准备地狱。", stats: { research: +5, sanity: -10, health: -5 } }; }
            },
            {
                text: '借口上厕所尿遁',
                resolve: () => { return { text: "你躲进了厕所，逃过了提问。但组会后师弟都在传“师兄是不是肾不好，一到提问环节就跑厕所”。", stats: { affinity: -10, health: -5, sanity: +5 } }; }
            }
        ]
    },
    {
        id: 'env_config_hell',
        risk: 'MEDIUM',
        title: '环境配置地狱：Conda红温时刻',
        description: '为了跑通GitHub上那个开源项目的代码，你试图复现它的环境。结果 `pip install` 爆出一屏鲜红的报错，依赖冲突就像一团乱麻，这时候由于操作失误，你把原本能跑的基准环境也搞坏了。',
        choices: [
            {
                text: '不仅修旧的还要装新的（地狱难度）',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.7) return { text: "经过两天两夜的排查，你奇迹般地解决了所有版本冲突！你感觉自己成了Linux之神，顺手写了篇博客记录，涨粉20个。", stats: { knowledge: +35, research: +10, sanity: -15 } };
                    return { text: "越修越坏，最后不得不格机重装系统。你的桌面壁纸、浏览器书签全没了，一切从零开始，心态崩了。", stats: { sanity: -40, research: -10 } };
                }
            },
            {
                text: '直接用Docker容器技术隔离',
                resolve: () => { return { text: "虽然学习Docker花了一下午，但环境完美隔离！以后再也不怕依赖冲突了。就是硬盘空间突然少了20G。", stats: { knowledge: +20, research: +15, sanity: +5 } }; }
            },
            {
                text: '去他妈的，联系作者求指教',
                resolve: () => { return { text: "作者高冷地回了句“RTFM（读手册）”。你被羞辱了，但只能忍气吞声继续看文档。", stats: { sanity: -15, affinity: -5 } }; }
            }
        ]
    },
    {
        id: 'supervise_undergrad',
        risk: 'MEDIUM',
        title: '导师的任务：带本科生毕设',
        description: '导师塞给你一个大四本科生：“带带师弟，让他帮你做实验。” 结果这位师弟连移液枪都不会拿，或者连终端怎么打开都不知道，还是个十万个为什么。',
        choices: [
            {
                text: '手把手教学当保姆',
                resolve: () => { return { text: "你花了一周时间教他，自己的进度完全停滞。好在他后来能帮你跑跑简单的重复实验，算是有得有失。", stats: { research: -15, affinity: +10, sanity: -10 } }; }
            },
            {
                text: '丢给他文档让他自生自灭',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "师弟居然是个天才！自学成才还帮你优化了代码，你捡到宝了，署名时还得感谢他。", stats: { research: +25, affinity: +15, sanity: +10 } };
                    return { text: "师弟瞎搞一通，把你清洗好的数据全删了，还一脸无辜地问你为什么跑不通。你血压飙升到180。", stats: { research: -25, sanity: -30, affinity: -20 } };
                }
            },
            {
                text: '忽悠他去帮导师取快递报销',
                resolve: () => { return { text: "你把他变成了课题组的行政助理。虽然学术上没产出，但你从杂活中解脱了！导师也很满意他的“勤快”。", stats: { sanity: +15, affinity: +5, research: +5 } }; }
            }
        ]
    },
    {
        id: 'poster_session_awkward',
        risk: 'MEDIUM',
        title: '海报站台：无人问津的角落',
        description: '你的Poster被安排在会场厕所旁边的角落。站了两个小时，只有保洁阿姨过来问你这纸能不能回收。隔壁名校大佬的摊位前挤满了人，你觉得腿酸且尴尬。',
        choices: [
            {
                text: '主动出击像推销员一样拉客',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "你强行拉住路过的大牛讲了5分钟。虽然他看起来很想上厕所，但最后还是礼貌地点头说“Idea很有趣”。你混了个脸熟！", stats: { affinity: +15, research: +5, sanity: -5 } };
                    return { text: "你过于热情吓跑了几个老实社恐学生。路人看你的眼神像是在看传销组织。", stats: { affinity: -10, sanity: -10 } };
                }
            },
            {
                text: '低头玩手机假装很忙',
                resolve: () => { return { text: "你刷了两个小时的短视频，完美融入了背景板。虽然没啥收获，但至少不累。就是导师路过时瞪了你一眼。", stats: { sanity: +10, affinity: -5, research: -5 } }; }
            },
            {
                text: '去隔壁大佬摊位偷师（蹭热度）',
                resolve: () => { return { text: "你放弃了自己的摊位，挤进人群听大佬讲解。虽然自己的Poster没人看，但你学到了最新的Trick，不虚此行。", stats: { knowledge: +15, research: +10, sanity: +5 } }; }
            }
        ]
    },
    {
        id: 'finance_reimbursement',
        risk: 'MEDIUM',
        title: '报销拉锯战：财务处的凝视',
        description: '你拿着厚厚一叠发票去财务处，排队一小时。财务老师扶了扶眼镜，指着其中一张说：“这张打车票时间是晚上10点，没有情况说明不能报。” 后面排队的人开始不耐烦地啧嘴。',
        choices: [
            {
                text: '当场编理由写情况说明',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.4) return { text: "你并在说明里写“深夜抢修服务器”。财务老师虽然狐疑但还是盖了章。这笔报销款像奖金一样让你快乐！", stats: { sanity: +10, affinity: +5 } };
                    return { text: "老师让你找导师签字证明。你跑回去找导师，导师骂你“这点小事都办不好”，最后虽然签了，但好感度掉了。", stats: { affinity: -15, sanity: -15 } };
                }
            },
            {
                text: '算了这张不要了',
                resolve: () => { return { text: "你抽走了那张50块的打车票。虽然等于丢了50块钱，但终于结束了这该死的流程。你发誓下次再也不垫钱了。", stats: { sanity: +5, health: -5 } }; }
            },
            {
                text: '试图和财务老师讲道理',
                resolve: () => { return { text: "不要试图和财务讲道理。你被怼了回来，还被要求重新粘贴所有票据。你今天下午的科研时间全部报销。", stats: { sanity: -25, research: -10 } }; }
            }
        ]
    },
    {
        id: 'horizontal_project_fire',
        risk: 'MEDIUM',
        title: '横向项目救火：甲方的奇葩需求',
        description: '导师接了个企业的横向项目，对方要求“APP的主题色要五彩斑斓的黑”。导师把活甩给了你，下令“三天内搞定，别耽误甲方打款”。这事完全无关你的毕业论文。',
        choices: [
            {
                text: '敷衍了事能跑就行',
                resolve: () => { return { text: "你随便套了个模板交差。甲方居然觉得“很简洁大气”！导师很高兴，分了你200块劳务费（聊胜于无），对你更信任了。", stats: { affinity: +5, research: -10, sanity: +5 } }; }
            },
            {
                text: '据理力争这也是科研时间',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你跟导师谈条件，争取到了把这部分工作整理成一篇专利的机会。横向纵向两不误！", stats: { research: +15, sanity: -10 } };
                    return { text: "导师觉得你“斤斤计较”，不仅没给专利，还让你以后负责项目对接。你成了专职客服。", stats: { research: -20, sanity: -20, affinity: -10 } };
                }
            },
            {
                text: '把锅甩给师弟',
                resolve: () => { return { text: "你把活转包给了新来的硕士。师弟虽然做得很烂，但那是导师和他的事了。你获得了宝贵的摸鱼时间，但师弟看你的眼神充满了怨念。", stats: { affinity: -20, sanity: +15, research: +5 } }; }
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
                    if (r > 0.5) return { text: "你们在一起了！一起肝论文、一起跑实验、一起吐槽审稿人，实验室变成了撒糖现场。就是约会地点永远在实验室，话题永远离不开调参。", stats: { sanity: +25, research: -8 }, chain: 'break_up' }; // 连锁分手
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
            {
                text: '帮导师写新本子赌一把', hasRandom: true, resolve: () => {
                    const r = Math.random();
                    if (r > 0.4) return { text: "你熬夜写的基金本子居然中了！导师说你“救星”，不仅给你发了补发劳务费，还把你列为核心成员，以后有成果都带你署名。", stats: { affinity: +45, research: +15, knowledge: +15 } };
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
    },
    {
        id: 'reimbursement_hell',
        risk: 'LOW',
        title: '报销地狱：发票又贴歪了',
        description: '你拿着厚厚一叠发票去财务处，排队两小时。财务老师推了推眼镜，冷冷地说：“这张打车票没有行程单，那张试剂发票抬头错了，还有，胶水贴得不平，回去重贴。”',
        choices: [
            {
                text: '低声下气求通融',
                resolve: () => { return { text: "你居然把财务老师说动了！她叹了口气帮你盖了章。你感觉这比中顶会还难，充满了成就感。", stats: { sanity: +10, affinity: +5 } }; }
            },
            {
                text: '回去重贴顺便骂骂咧咧',
                resolve: () => { return { text: "你花了一下午把发票贴成了艺术品。虽然拿到了钱，但你发誓这辈子再也不想看到胶水了。科研时间-4小时。", stats: { research: -5, sanity: -10 } }; }
            },
            {
                text: '自掏腰包我不报了！',
                resolve: () => { return { text: "你霸气地撕了发票。虽然省了事，但月底看着银行卡余额流泪，只能连吃一周馒头。", stats: { health: -10, sanity: +5, research: +5 } }; }
            }
        ]
    },
    {
        id: 'hair_loss_crisis',
        risk: 'LOW',
        title: '发际线危机：洗澡时的惊恐',
        description: '洗澡时，你看着下水道口那团乌黑的头发，陷入了沉思。那是你的头发，也是你逝去的青春。照镜子发现，发际线已经退守到了“清朝防线”。',
        choices: [
            {
                text: '购买防脱洗发水和生姜',
                resolve: () => { return { text: "花了巨资买网红产品，心理安慰作用大于实际。头发该掉还是掉，但身上腌入味了，师妹问你是不是在食堂炖肉了。", stats: { affinity: -5, health: +5, sanity: -5 } }; }
            },
            {
                text: '剃光头变强了也变秃了',
                resolve: () => { return { text: "你剃了个光头！省去了洗头时间，科研效率极高。导师夸你“看起来就很资深”，就是冬天头有点冷。", stats: { research: +15, health: +10, affinity: +5 } }; }
            },
            {
                text: '戴帽子掩耳盗铃',
                resolve: () => { return { text: "你买了一堆棒球帽。只要不摘帽子，就没人知道我秃了。但在室内戴帽子被导师说“不礼貌”。", stats: { sanity: +5, affinity: -5 } }; }
            }
        ]
    },
    {
        id: 'office_snack_thief',
        risk: 'LOW',
        title: '零食失踪案',
        description: '你放在工位上的薯片、你是为了熬夜准备的快乐水，居然不翼而飞了！只留下一个空的包装袋，仿佛在嘲讽你。',
        choices: [
            {
                text: '在群里发疯“谁偷吃了！”',
                resolve: () => { return { text: "群里一片死寂，没人承认。但第二天你的桌上多了一包更贵的进口零食，上面贴着便利贴：“对不起，昨天太饿了”。", stats: { affinity: +5, sanity: +10, health: +5 } }; }
            },
            {
                text: '在零食里加变态辣',
                resolve: () => { return { text: "下午，你听到隔壁桌的师兄被辣得冲进厕所狂吐。凶手找到了！虽然大快人心，但师兄看你的眼神充满了恐惧。", stats: { sanity: +15, affinity: -15 } }; }
            },
            {
                text: '默默忍受科研人不需要快乐',
                resolve: () => { return { text: "你喝着白开水改论文，感觉人生索然无味。当晚代码效率极低，满脑子都是薯片的脆响。", stats: { sanity: -10, research: -5 } }; }
            }
        ]
    },
    {
        id: 'seminar_food',
        risk: 'LOW',
        title: '蹭饭雷达：讲座剩下的披萨',
        description: '隔壁会议室的大牛讲座结束了，据可靠线报，还有两盒没动过的披萨和半箱可乐。你现在的饥饿度是MAX，但门口有别的课题组的老师在聊天。',
        choices: [
            {
                text: '脸皮厚吃个够科研人没有尊严',
                resolve: () => { return { text: "你冲进去大快朵颐，省了一顿晚饭钱，还顺走了一瓶可乐。吃饱喝足，心情大好，感觉还能再跑两个Epoch。", stats: { health: +20, sanity: +15 } }; }
            },
            {
                text: '假装进去问问题顺便拿一块',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你装模作样地看了看白板上的公式，顺手拿了块披萨。结果被那个老师抓着聊了半小时学术，消化不良。", stats: { health: +5, sanity: -10, knowledge: +5 } };
                    return { text: "你的演技太差，刚伸出手就被发现了。老师笑着说“同学饿了吧”，你尴尬地拿着披萨逃回工位，社死现场。", stats: { sanity: -5, health: +10 } };
                }
            },
            {
                text: '算了点外卖吧',
                resolve: () => { return { text: "你放弃了免费午餐。外卖送慢了，你饿着肚子写代码，效率低下，还多花了30块钱。", stats: { health: -5, research: -5, sanity: -10 } }; }
            }
        ]
    },
    {
        id: 'windows_update',
        risk: 'LOW',
        title: '强制更新：Windows的背刺',
        description: '你只是去上了个厕所，回来发现电脑屏幕一片蓝：“正在更新 Windows，请勿关闭电脑（12%）”。你刚才跑了一半的仿真程序...好像没保存断点。',
        choices: [
            {
                text: '盯着进度条祈祷',
                resolve: () => { return { text: "你盯着屏幕看了半小时，终于更新完了。好消息是程序有自动缓存，坏消息是你浪费了半小时的生命，并且更新后输入法变卡了。", stats: { research: -5, sanity: -10 } }; }
            },
            {
                text: '强制关机重启赌一把',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "赌赢了！系统回滚，一切正常。你迅速关闭了自动更新服务，感觉自己战胜了微软。", stats: { sanity: +15, research: +5 } };
                    return { text: "赌输了。系统文件损坏，蓝屏死机。你不得不花一下午重装环境，心情跌入谷底。", stats: { research: -20, sanity: -25 } };
                }
            },
            {
                text: '直接下班回家睡觉',
                resolve: () => { return { text: "“这是天意，老天让我休息。” 你背上包直接溜了。虽然进度耽误了，但你睡了个好觉，发量似乎保住了。", stats: { health: +20, sanity: +20, research: -10 } }; }
            }
        ]
    },
    {
        id: 'lab_chair_fail',
        risk: 'LOW',
        title: '人体工学椅：气压杆失效',
        description: '你坐的那把椅子，气压杆突然坏了。现在它会缓慢地自动下降，每隔十分钟你就得站起来把它拉高，否则你就会像个地精一样蹲在桌子前敲代码。',
        choices: [
            {
                text: '去偷换师兄出差没人的椅子',
                resolve: () => { return { text: "你悄悄换了大师兄的椅子。坐感舒适，腰也不疼了。直到一周后师兄回来，你装作无事发生，深藏功与名。", stats: { health: +10, sanity: +5 } }; }
            },
            {
                text: '凑合坐锻炼深蹲',
                resolve: () => { return { text: "你坚持用坏椅子。虽然腰酸背痛，但你学会了在椅子降到底的一瞬间利用核心肌群维持坐姿。健身+1。", stats: { health: -10, sanity: -5 } }; }
            },
            {
                text: '自费买个坐垫',
                resolve: () => { return { text: "你买了个昂贵的记忆棉坐垫。虽然椅子还是矮，但至少屁股不痛了，破财免灾。", stats: { sanity: -5, health: +10 } }; }
            }
        ]
    },
    {
        id: 'recruit_propaganda',
        risk: 'LOW',
        title: '招生宣传：我是演员',
        description: '夏令营开始了，导师让你带几个本科生参观实验室，并暗示你要多说好话，忽悠...啊不，吸引他们报考本组。',
        choices: [
            {
                text: '实话实说劝退“快逃”',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "你用眼神暗示他们“快逃”。学生们心领神会，没人报考。导师很疑惑今年为什么没人来，但你积了阴德。", stats: { sanity: +10, affinity: -5 } };
                    return { text: "有个学生把你的吐槽发到了网上。导师看到了，把你叫到办公室进行了一小时的“思想教育”。", stats: { affinity: -20, sanity: -15 } };
                }
            },
            {
                text: '疯狂吹捧“导师好经费多”',
                resolve: () => { return { text: "你违心地把实验室吹成了天堂。学生们羡慕不已，纷纷报名。导师对你的表现非常满意，请你喝了杯奶茶。", stats: { affinity: +15, sanity: -10 } }; }
            },
            {
                text: '全程划水只介绍设备',
                resolve: () => { return { text: "你像个无情的读说明书机器。学生们觉得这实验室太无聊了，反应平平。无功无过。", stats: { sanity: +5 } }; }
            }
        ]
    },
    {
        id: 'express_awkward',
        risk: 'LOW',
        title: '快递社死：那是我的私人物品',
        description: '你为了凑单买的二次元抱枕/奇葩生活用品寄到了实验室。快递员站在门口大喊你的名字：“XX同学！你的‘超大号解压尖叫鸡’到了！” 此时全实验室都在安静看文献。',
        choices: [
            {
                text: '淡定签收说是实验器材',
                resolve: () => { return { text: "你面不改色地接过包裹，胡扯说这是声学实验的信号源。师弟们投来了敬佩的目光：师兄的研究领域真广。", stats: { sanity: +10, knowledge: +5 } }; }
            },
            {
                text: '光速抢过包裹冲出实验室',
                resolve: () => { return { text: "你试图掩盖，但跑得太快反而撞到了门框。大家虽然没看清是什么，但都知道你心里有鬼。你的神秘感增加了。", stats: { health: -5, sanity: -10 } }; }
            },
            {
                text: '当众拆开一起玩',
                resolve: () => { return { text: "你直接捏响了尖叫鸡。全实验室爆笑，压抑的气氛一扫而空。大家轮流捏鸡解压，你成了气氛组组长。", stats: { affinity: +15, sanity: +15, research: -5 } }; }
            }
        ]
    },
    {
        id: 'milk_tea_order',
        risk: 'LOW',
        title: '下午茶时刻：奶茶拼单',
        description: '下午三点，实验室“摸鱼群”弹出消息：“喜茶拼单，满100减20，来不来？”此时你刚写完两行代码，有点口渴，但你的生活费余额有点紧张。',
        choices: [
            {
                text: '豪横请客“这顿我请了”',
                resolve: () => { return { text: "全实验室欢呼“师兄/师姐大气”！你成了今日的人气王，大家喝了你的奶茶，不好意思再让你干杂活了。虽然钱包出血，但心情极佳。", stats: { affinity: +25, sanity: +20 } }; }
            },
            {
                text: '默默跟团点一杯最便宜的',
                resolve: () => { return { text: "你点了一杯多肉葡萄。糖分摄入让你心情变好，工作效率短暂提升。虽然花了钱，但这叫“科研燃料”。", stats: { sanity: +10, health: -5 } }; }
            },
            {
                text: '高冷拒绝“我要减肥”',
                resolve: () => { return { text: "你看着他们喝得滋滋作响，闻着奶茶的香气，咽了口口水。虽然省了钱还保住了体重，但心里莫名有点凄凉。", stats: { sanity: -10, health: +5 } }; }
            }
        ]
    },
    {
        id: 'mechanical_keyboard',
        risk: 'LOW',
        title: '噪音污染：青轴键盘狂魔',
        description: '隔壁工位的师弟新买了个机械键盘（青轴）。他敲代码的声音像机关枪一样“噼里啪啦”响彻整个实验室，而你正在试图理解一个复杂的数学公式。',
        choices: [
            {
                text: '戴上降噪耳机物理隔绝',
                resolve: () => { return { text: "世界清静了。你沉浸在自己的BGM里，效率倍增。唯一的副作用是导师叫了你三声你都没听见，导师以为你聋了。", stats: { research: +10, sanity: +5, affinity: -5 } }; }
            },
            {
                text: '以暴制暴你也买个更响的',
                resolve: () => { return { text: "你买了个“雷蛇绿轴”，跟他对轰。实验室变成了电竞网吧，你俩甚至敲出了节奏感。其他同学受不了，把你俩投诉了，扣了点印象分。", stats: { sanity: +20, affinity: -20 } }; }
            },
            {
                text: '委婉提醒“师弟键盘不错挺响的”',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "师弟听懂了反话，不好意思地换回了薄膜键盘。由于环境安静，你终于推导出了那个公式。", stats: { research: +15, sanity: +10 } };
                    return { text: "师弟以为你在夸他，兴奋地给你安利了半小时机械轴体知识。你不仅没解决噪音，还浪费了半小时。", stats: { sanity: -20, research: -5 } };
                }
            }
        ]
    },
    {
        id: 'software_license',
        risk: 'LOW',
        title: '授权过期：MATLAB打不开了',
        description: '当你急需跑数据时，MATLAB弹窗提示“License已过期”。学校的正版授权服务器似乎崩了，而破解版在你的新系统上不兼容。',
        choices: [
            {
                text: '转投Python/Octave开源保平安',
                resolve: () => { return { text: "虽然重写代码花了一天，但你从此摆脱了版权勒索！开源社区真香，你甚至发现Python跑这个比MATLAB快。", stats: { knowledge: +15, research: +5, sanity: -5 } }; }
            },
            {
                text: '全网找破解补丁（风险操作）',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.4) return { text: "你在一个俄语论坛找到了补丁，完美运行！你觉得自己像个黑客。只是电脑风扇转速好像变快了（也许是挖矿木马？）。", stats: { research: +10, sanity: +10, health: -5 } };
                    return { text: "你下载了一堆流氓软件，“渣渣辉”和“并夕夕”占据了你的桌面。清理垃圾软件花了一晚上。", stats: { sanity: -20, research: -10 } };
                }
            },
            {
                text: '联系学校IT中心报修',
                resolve: () => { return { text: "IT中心回复“正在抢修，请耐心等待”。你被迫休息了一天，去图书馆看了本闲书，意外地放松。", stats: { health: +10, sanity: +10, research: -10 } }; }
            }
        ]
    },
    {
        id: 'forgot_card',
        risk: 'LOW',
        title: '被锁门外：忘带门禁卡',
        description: '周日晚上十一点，你出来上厕所，随手带上了实验室的门。听到“咔哒”一声落锁，你才意识到手机和门禁卡都在屋里，走廊里空无一人。',
        choices: [
            {
                text: '硬着头皮给导师打电话',
                resolve: () => { return { text: "导师被吵醒了很不爽，但还是远程帮你开了门。第二天他在群里发了个公告：“最后离开的人注意带卡”，你感觉被点名了。", stats: { affinity: -15, sanity: -5 } }; }
            },
            {
                text: '蹲在门口等有缘人',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.6) return { text: "运气不错！十分钟后隔壁组的卷王师兄出来打水，帮你刷开了门。你们互道一声“辛苦了”，惺惺相惜。", stats: { sanity: +5, affinity: +5 } };
                    return { text: "你蹲了一小时，腿都麻了也没人来。最后只能找保安大叔，被大叔教育了十分钟“现在的学生丢三落四”。", stats: { health: -10, sanity: -15 } };
                }
            },
            {
                text: '试图用回形针撬锁（我是柯南）',
                resolve: () => { return { text: "锁没撬开，回形针断在里面了。周一早上大家进不去门，不得不请锁匠。你因为“破坏公物”被通报批评。", stats: { affinity: -20, sanity: -20 } }; }
            }
        ]
    },
    {
        id: 'literature_sleep',
        risk: 'LOW',
        title: '生理性催眠：一看Paper就困',
        description: '你发誓今天要看完这篇20页的综述。然而，只要眼睛一接触到英文双栏排版，眼皮就重若千钧。你已经盯着Abstract的第一句话看了半小时了。',
        choices: [
            {
                text: '不管了趴着睡一会',
                resolve: () => { return { text: "这一觉睡得太香了，醒来已经是晚饭时间。虽然Paper没看，但精神饱满，晚上打游戏...啊不，跑代码如有神助。", stats: { health: +15, sanity: +15, research: -5 } }; }
            },
            {
                text: '站着看！物理防困',
                resolve: () => { return { text: "你像个桩子一样站在电脑前。虽然腿酸，但确实不困了。强行啃完了综述，虽然只看懂了30%，但好歹有进度。", stats: { research: +5, health: -5, sanity: -10 } }; }
            },
            {
                text: '用翻译软件全文翻译',
                hasRandom: true,
                resolve: () => {
                    const r = Math.random();
                    if (r > 0.5) return { text: "现在的AI翻译真准！你像看网文一样刷完了论文，大大节省了时间，掌握了核心思想。", stats: { research: +10, knowledge: +5, sanity: +5 } };
                    return { text: "机翻把“Robustness”翻译成了“鲁棒性”...哦这个是对的，但把“Spring”翻译成了“春天”（其实是弹簧）。你被误导了，理解完全偏差。", stats: { research: -5, knowledge: -5 } };
                }
            }
        ]
    },
    {
        id: 'express_delivery_wrong',
        risk: 'LOW',
        title: '拿错外卖：谁的微辣黄焖鸡？',
        description: '你去外卖柜拿午饭，回到工位打开一看——你点的清淡沙拉变成了特辣黄焖鸡米饭。看名字，好像是拿成了隔壁课题组师兄的。',
        choices: [
            {
                text: '将错就错吃了吧',
                resolve: () => { return { text: "你含泪吃下了特辣黄焖鸡。虽然胃里火辣辣的，但碳水带来的快乐是真实的。就是下午跑厕所跑得有点勤。", stats: { health: -10, sanity: +10 } }; }
            },
            {
                text: '放回去换回来',
                resolve: () => { return { text: "你跑回外卖柜，发现你的沙拉已经被师兄拿走了。师兄发微信问你：“你是不是拿了我的饭？这草太难吃了。” 你们被迫交换了午餐体验。", stats: { affinity: +5, sanity: -5 } }; }
            },
            {
                text: '扔了重新点一份',
                resolve: () => { return { text: "你无法接受黄焖鸡。重新点了沙拉，多花了一份钱（肉痛），还饿了一个小时。心情极差。", stats: { sanity: -20, health: -5 } }; }
            }
        ]
    }
].filter(Boolean); // 过滤空值以防万一