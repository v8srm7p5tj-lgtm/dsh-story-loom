/**
 * 织世 · 数据骨架
 *
 * 这里只放「世界应该长什么样」：默认板块、字段、示例世界与初始条目。
 * 校验、一致性检查、上下文抽取在 canon.js；落盘在 store.js。
 *
 * 设计原则：
 * 1. 板块是数据，不是代码。用户随时可以加板块/字段，图鉴只是其中一种。
 * 2. 所有跨条目引用都存 entry id，名称只做展示。改名不会断链。
 * 3. 系统板块可以改字段、改顺序，但默认不许删除；自定义板块完全自由。
 */

export const STORE_VERSION = 1

export const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'select',
  'ref',
  'refs',
  'relations',
  'tags',
  'date',
  'checkbox',
  'rating'
]

export const VIEW_KINDS = [
  'overview',
  'cards',
  'list',
  'timeline',
  'power',
  'outline',
  'threads',
  'map',
  'notes',
  'codex'
]

export const DEFAULT_GROUPS = [
  { name: '核心', order: 10 },
  { name: '人物', order: 20 },
  { name: '地理', order: 30 },
  { name: '力量', order: 40 },
  { name: '剧情', order: 50 },
  { name: '设定资料', order: 60 },
  { name: '图鉴', order: 70 }
]

function f(id, label, type, extra = {}) {
  return { id, label, type, ...extra }
}

const STATUS_ALIVE = ['存活', '重伤', '失踪', '死亡', '封印', '未登场']
const STATUS_CHAPTER = ['未写', '写作中', '已完成', '已修订']
const STATUS_OUTLINE = ['构思', '大纲', '草稿', '已定稿']
const STATUS_THREAD = ['待埋', '已埋', '推进中', '待回收', '已回收', '废弃']
const IMPORTANCE = ['核心', '重要', '一般']

export const DEFAULT_BOARDS = [
  {
    id: 'overview',
    name: '世界总览',
    icon: 'compass',
    group: '核心',
    kind: 'overview',
    order: 10,
    singleton: true,
    system: true,
    description: '一句话故事、核心冲突、世界法则与叙事坐标。所有生成的起点。',
    entryLabel: '总览',
    fields: [
      f('tagline', '一句话故事', 'text', { placeholder: '用一句话抓住整本书的冲突与钩子' }),
      f('genre', '题材类型', 'text', { placeholder: '例如：东方玄幻 / 悬疑 / 群像' }),
      f('tone', '整体基调', 'select', { options: ['热血', '冷峻', '诡谲', '温暖', '悲壮', '轻松', '暗黑', '史诗'] }),
      f('coreConflict', '核心冲突', 'textarea', { placeholder: '谁想要什么，谁/什么在阻止，失败的代价是什么' }),
      f('worldRules', '世界法则', 'textarea', { placeholder: '这个世界最不容动摇的三条规则' }),
      f('themes', '主题母题', 'text', { placeholder: '例如：自由与代价、记忆与身份' }),
      f('pov', '叙事视角', 'select', { options: ['第一人称', '第三人称限知', '第三人称全知', '多视角'] }),
      f('tense', '叙述时态', 'select', { options: ['过去时', '现在时'] }),
      f('targetWords', '目标字数（万）', 'number'),
      f('status', '项目状态', 'select', { options: ['构思中', '连载中', '已完结', '暂停'] })
    ]
  },
  {
    id: 'lore',
    name: '设定集',
    icon: 'book',
    group: '核心',
    kind: 'cards',
    order: 20,
    system: true,
    description: '历史、种族、国家、宗教、科技、风俗——世界运转的零件。',
    entryLabel: '设定',
    fields: [
      f('category', '分类', 'select', { options: ['历史', '种族', '国家', '宗教', '科技', '魔法', '经济', '语言', '风俗', '其他'] }),
      f('keywords', '关键词', 'text'),
      f('oneLine', '一句话定义', 'text'),
      f('related', '关联条目', 'refs')
    ]
  },
  {
    id: 'rules',
    name: '规则与禁忌',
    icon: 'scale',
    group: '核心',
    kind: 'list',
    order: 30,
    system: true,
    description: '不可违背的世界法则。写作与生成时优先级最高。',
    entryLabel: '规则',
    fields: [
      f('ruleType', '规则类型', 'select', { options: ['世界法则', '力量代价', '社会禁忌', '叙事约束', '物理规则'] }),
      f('force', '约束力', 'select', { options: ['绝对', '强', '弱'] }),
      f('consequence', '违反后果', 'textarea'),
      f('related', '关联条目', 'refs')
    ]
  },
  {
    id: 'characters',
    name: '人物档案',
    icon: 'user',
    group: '人物',
    kind: 'cards',
    order: 10,
    system: true,
    description: '欲望、恐惧、秘密、弧光。每个重要人物都要有一个不能说的东西。',
    entryLabel: '人物',
    fields: [
      f('aliases', '别名/称号', 'text'),
      f('role', '叙事角色', 'select', { options: ['主角', '女主', '男主', '反派', '盟友', '导师', '对手', '群像', '路人'] }),
      f('faction', '所属势力', 'ref', { refBoards: ['factions'] }),
      f('tier', '当前境界', 'ref', { refBoards: ['power'] }),
      f('age', '年龄', 'text'),
      f('gender', '性别', 'text'),
      f('appearance', '外貌', 'textarea'),
      f('personality', '性格', 'textarea'),
      f('desire', '想要什么', 'textarea'),
      f('fear', '害怕什么', 'textarea'),
      f('secret', '秘密', 'textarea'),
      f('arc', '人物弧光', 'textarea'),
      f('status', '当前状态', 'select', { options: STATUS_ALIVE }),
      f('deathChapter', '死亡/退场章节', 'ref', { refBoards: ['chapters'] }),
      f('firstChapter', '首次登场', 'ref', { refBoards: ['outline', 'chapters'] })
    ]
  },
  {
    id: 'factions',
    name: '势力与组织',
    icon: 'flag',
    group: '地理',
    kind: 'cards',
    order: 10,
    system: true,
    description: '谁在掌权，谁在暗处，谁的利益和谁撞上了。',
    entryLabel: '势力',
    fields: [
      f('type', '类型', 'select', { options: ['国家', '城邦', '宗门', '教团', '商会', '军队', '结社', '家族', '其他'] }),
      f('leader', '领袖', 'ref', { refBoards: ['characters'] }),
      f('stance', '立场', 'select', { options: ['守序', '中立', '混乱', '隐世', '敌对'] }),
      f('territory', '势力范围', 'ref', { refBoards: ['locations'] }),
      f('resources', '资源与底牌', 'textarea'),
      f('goal', '目标', 'textarea'),
      f('weakness', '弱点', 'textarea')
    ]
  },
  {
    id: 'locations',
    name: '地点',
    icon: 'pin',
    group: '地理',
    kind: 'cards',
    order: 20,
    system: true,
    description: '城市、街道、秘境、海沟。地点要能被写进场景，也要能钉在地图上。',
    entryLabel: '地点',
    fields: [
      f('type', '类型', 'select', { options: ['城邦', '街区', '地标', '秘境', '海域', '建筑', '遗迹', '其他'] }),
      f('faction', '控制势力', 'ref', { refBoards: ['factions'] }),
      f('region', '所在区域', 'text'),
      f('climate', '气候/氛围', 'text'),
      f('danger', '危险等级', 'select', { options: ['安全', '低危', '中危', '高危', '禁区'] }),
      f('firstChapter', '首次出现', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('mapX', '地图 X', 'number', { hidden: true }),
      f('mapY', '地图 Y', 'number', { hidden: true })
    ]
  },
  {
    id: 'map',
    name: '世界地图',
    icon: 'map',
    group: '地理',
    kind: 'map',
    order: 30,
    system: true,
    virtual: true,
    description: '上传地图，把地点钉上去。点击图钉即可回到地点档案。',
    entryLabel: '地图',
    fields: []
  },
  {
    id: 'power',
    name: '力量体系',
    icon: 'bolt',
    group: '力量',
    kind: 'power',
    order: 10,
    system: true,
    description: '阶位阶梯、突破条件与战力边界。境界只能沿阶梯走。',
    entryLabel: '境界',
    fields: [
      f('rank', '阶位序号', 'number', { required: true, help: '数字越小越弱；用于比较战力，不要用文字排序' }),
      f('aliases', '别称', 'text'),
      f('power', '战力描述', 'textarea'),
      f('breakthrough', '突破条件', 'textarea'),
      f('lifespan', '寿元/代价', 'text'),
      f('prevTier', '上一阶', 'ref', { refBoards: ['power'] }),
      f('representatives', '代表人物', 'refs', { refBoards: ['characters'] })
    ]
  },
  {
    id: 'abilities',
    name: '能力与招式',
    icon: 'spark',
    group: '力量',
    kind: 'list',
    order: 20,
    system: true,
    description: '功法、神通、血脉、武器。每条能力都要有最低境界与代价。',
    entryLabel: '能力',
    fields: [
      f('type', '类型', 'select', { options: ['功法', '神通', '血脉', '武器', '禁术', '天赋', '其他'] }),
      f('minTier', '最低境界', 'ref', { refBoards: ['power'] }),
      f('owners', '拥有者', 'refs', { refBoards: ['characters'] }),
      f('cost', '代价', 'textarea'),
      f('effect', '效果', 'textarea'),
      f('counter', '克制方式', 'textarea'),
      f('limits', '限制/副作用', 'textarea')
    ]
  },
  {
    id: 'outline',
    name: '主线大纲',
    icon: 'branch',
    group: '剧情',
    kind: 'outline',
    order: 10,
    system: true,
    hierarchy: true,
    description: '卷 → 幕 → 章。用父级组织层级，用序号控制顺序。',
    entryLabel: '节点',
    fields: [
      f('level', '层级', 'select', { options: ['卷', '幕', '章'] }),
      f('number', '序号', 'text', { placeholder: '例如 1-01' }),
      f('order', '排序', 'number'),
      f('status', '状态', 'select', { options: STATUS_OUTLINE }),
      f('logline', '一句话梗概', 'text'),
      f('conflict', '核心冲突', 'textarea'),
      f('hooks', '爽点/钩子', 'textarea'),
      f('cast', '出场人物', 'refs', { refBoards: ['characters'] }),
      f('locations', '发生地点', 'refs', { refBoards: ['locations'] }),
      f('timePoint', '故事内时间', 'text'),
      f('threads', '关联伏笔', 'refs', { refBoards: ['threads'] }),
      f('targetWords', '预计字数', 'number'),
      f('actualWords', '实际字数', 'number'),
      f('chapterRecord', '章节档案', 'ref', { refBoards: ['chapters'] })
    ]
  },
  {
    id: 'timeline',
    name: '时间线',
    icon: 'clock',
    group: '剧情',
    kind: 'timeline',
    order: 20,
    system: true,
    description: '按「排序值」排列世界事件。时间可以倒叙，但顺序不能算错。',
    entryLabel: '事件',
    fields: [
      f('era', '纪元', 'text'),
      f('dateLabel', '时间标签', 'text', { placeholder: '例如：潮历 312 年 · 春' }),
      f('sort', '排序值', 'number', { required: true, help: '数字越大越晚。例如 100、110、120。' }),
      f('eventType', '事件类型', 'select', { options: ['开端', '战争', '政变', '灾变', '相遇', '揭露', '死亡', '转折', '结局'] }),
      f('cast', '涉及人物', 'refs', { refBoards: ['characters'] }),
      f('place', '地点', 'refs', { refBoards: ['locations'] }),
      f('chapter', '关联章节', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('impact', '结果/影响', 'textarea')
    ]
  },
  {
    id: 'threads',
    name: '伏笔与回收',
    icon: 'thread',
    group: '剧情',
    kind: 'threads',
    order: 30,
    system: true,
    description: '挖过的坑都要有账。待埋、已埋、推进、待回收、已回收。',
    entryLabel: '伏笔',
    fields: [
      f('type', '类型', 'select', { options: ['主线伏笔', '支线伏笔', '人物秘密', '道具线索', '预言', '悬念'] }),
      f('status', '状态', 'select', { options: STATUS_THREAD }),
      f('importance', '重要度', 'select', { options: IMPORTANCE }),
      f('plantChapter', '埋设章节', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('payoffChapter', '回收章节', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('plan', '计划回收', 'text', { placeholder: '例如：第 5 章前后 / 第二卷结尾' }),
      f('cast', '牵涉人物', 'refs', { refBoards: ['characters'] }),
      f('known', '读者已知', 'textarea'),
      f('truth', '真相（作者可见）', 'textarea')
    ]
  },
  {
    id: 'chapters',
    name: '章节档案',
    icon: 'scroll',
    group: '剧情',
    kind: 'list',
    order: 40,
    system: true,
    description: '每写一章，就把「发生了什么、谁在场、状态变了什么」记下来。这是防崩坏的核心账本。',
    entryLabel: '章节',
    fields: [
      f('number', '章节序号', 'number', { required: true }),
      f('outlineRef', '对应大纲', 'ref', { refBoards: ['outline'] }),
      f('status', '状态', 'select', { options: STATUS_CHAPTER }),
      f('timePoint', '故事内时间', 'text'),
      f('places', '发生地点', 'refs', { refBoards: ['locations'] }),
      f('cast', '出场人物', 'refs', { refBoards: ['characters'] }),
      f('events', '本章发生', 'textarea'),
      f('stateChanges', '状态变更', 'textarea', { help: '受伤、死亡、突破、关系变化、秘密揭露……' }),
      f('newLore', '新增设定', 'refs', { refBoards: ['lore', 'rules'] }),
      f('advanceThreads', '推进伏笔', 'refs', { refBoards: ['threads'] }),
      f('payoffThreads', '回收伏笔', 'refs', { refBoards: ['threads'] }),
      f('wordCount', '字数', 'number')
    ]
  },
  {
    id: 'style',
    name: '文风样本',
    icon: 'quill',
    group: '设定资料',
    kind: 'notes',
    order: 10,
    system: true,
    description: '把用户发来的网文范例粘贴到这里，标注要学习的点。生成时会优先模仿。',
    entryLabel: '样本',
    fields: [
      f('source', '来源', 'text'),
      f('learn', '要学习的点', 'textarea', { placeholder: '短句 / 口语化 / 独立成段 / 情绪 / 节奏 / 爽点' })
    ]
  },
  {
    id: 'glossary',
    name: '名词表',
    icon: 'quote',
    group: '设定资料',
    kind: 'list',
    order: 20,
    system: true,
    description: '专有名词、称谓、货币、招式名。统一叫法，避免前后不一。',
    entryLabel: '名词',
    fields: [
      f('category', '类别', 'select', { options: ['人物', '地点', '组织', '力量', '物品', '称谓', '货币', '其他'] }),
      f('definition', '释义', 'textarea'),
      f('firstChapter', '首次出现', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('related', '关联条目', 'refs')
    ]
  },
  {
    id: 'notes',
    name: '备忘录',
    icon: 'note',
    group: '设定资料',
    kind: 'notes',
    order: 30,
    system: true,
    description: '灵感、待办、决策、问题。先记下来，再决定它属于哪里。',
    entryLabel: '备忘',
    fields: [
      f('type', '类型', 'select', { options: ['灵感', '待办', '决策', '问题', '参考'] }),
      f('status', '状态', 'select', { options: ['收件箱', '进行中', '已归档'] }),
      f('importance', '重要度', 'select', { options: IMPORTANCE }),
      f('dueChapter', '相关章节', 'ref', { refBoards: ['outline', 'chapters'] }),
      f('related', '关联条目', 'refs')
    ]
  },
  {
    id: 'codex',
    name: '怪物图鉴',
    icon: 'paw',
    group: '图鉴',
    kind: 'codex',
    order: 10,
    system: false,
    description: '自定义板块示例：妖魔、异种、神裔。可随时改字段，也可再加「道具图鉴」。',
    entryLabel: '条目',
    fields: [
      f('category', '分类', 'select', { options: ['野兽', '妖魔', '亡灵', '异种', '神裔', '机关', '其他'] }),
      f('danger', '危险等级', 'select', { options: ['无害', '低危', '中危', '高危', '灭城'] }),
      f('habitat', '栖息地', 'refs', { refBoards: ['locations'] }),
      f('tier', '战力对标', 'ref', { refBoards: ['power'] }),
      f('weakness', '弱点', 'textarea'),
      f('drops', '素材/掉落', 'textarea'),
      f('behavior', '习性', 'textarea'),
      f('firstChapter', '首次出现', 'ref', { refBoards: ['outline', 'chapters'] })
    ]
  }
]

export const BOARD_TEMPLATES = {
  blank: {
    name: '空白板块',
    kind: 'cards',
    description: '从零开始，自己加字段。',
    fields: [f('note', '备注', 'textarea')]
  },
  cards: {
    name: '卡片档案',
    kind: 'cards',
    description: '适合人物、组织、地点等需要一眼抓住重点的条目。',
    fields: [f('summary', '一句话', 'text'), f('tags', '标签', 'tags'), f('related', '关联条目', 'refs')]
  },
  list: {
    name: '清单',
    kind: 'list',
    description: '适合规则、名词、能力等可以逐条查阅的内容。',
    fields: [f('category', '分类', 'text'), f('note', '备注', 'textarea')]
  },
  codex: {
    name: '图鉴',
    kind: 'codex',
    description: '怪物、道具、生物、植物……任何需要收集与编号的条目。',
    fields: [
      f('category', '分类', 'text'),
      f('danger', '危险/等级', 'select', { options: ['无害', '低危', '中危', '高危', '灭城'] }),
      f('habitat', '栖息地', 'refs', { refBoards: ['locations'] }),
      f('weakness', '弱点', 'textarea')
    ]
  },
  timeline: {
    name: '事件线',
    kind: 'timeline',
    description: '按排序值排列的事件。适合战争史、家族史、案件时间线。',
    fields: [
      f('era', '纪元', 'text'),
      f('dateLabel', '时间标签', 'text'),
      f('sort', '排序值', 'number', { required: true }),
      f('impact', '影响', 'textarea')
    ]
  },
  threads: {
    name: '线索板',
    kind: 'threads',
    description: '任何需要「埋下—推进—回收」的线索。',
    fields: [
      f('status', '状态', 'select', { options: STATUS_THREAD }),
      f('importance', '重要度', 'select', { options: IMPORTANCE }),
      f('plan', '计划', 'text')
    ]
  },
  notes: {
    name: '便签墙',
    kind: 'notes',
    description: '灵感、参考、碎片。',
    fields: [f('status', '状态', 'select', { options: ['收件箱', '进行中', '已归档'] }), f('tags', '标签', 'tags')]
  }
}

export function emptyProjectState(id, title = '未命名世界') {
  const now = new Date().toISOString()
  const boards = JSON.parse(JSON.stringify(DEFAULT_BOARDS))
  const groups = DEFAULT_GROUPS.map((g) => ({ ...g }))
  return {
    schema: STORE_VERSION,
    revision: 0,
    project: {
      id,
      title,
      subtitle: '',
      author: '',
      genre: '',
      logline: '',
      createdAt: now,
      updatedAt: now,
      groups,
      map: { image: '', width: 0, height: 0, uploadedAt: '' }
    },
    boards,
    entries: [
      {
        id: 'main_overview',
        boardId: 'overview',
        name: '世界总览',
        subtitle: '',
        summary: '',
        body: [
          '# 欢迎来到织世',
          '',
          '这里不是一份写完就锁进抽屉的设定文档，而是一张会跟着故事一起生长的地图。',
          '',
          '## 先做四件事',
          '',
          '1. 在「世界总览」写下一句话故事、核心冲突和世界法则。',
          '2. 去「人物档案」建一个主角：他最想要什么，最怕什么，藏着什么秘密。',
          '3. 去「力量体系」把境界阶梯排出来，再给主角定一个当前阶位。',
          '4. 去「主线大纲」建第一卷和前三章，然后把第一个坑登记进「伏笔与回收」。',
          '',
          '> 写正文之前，让 AI 运行 `node dsh-story-loom/bin/storyctl.mjs context --chapter 1`。',
          '> 它会把这章需要遵守的设定、人物状态、时间线和未回收的坑，整理成一份写作上下文。',
          '',
          '## 两个约定',
          '',
          '- 跨条目引用用双链语法（两个方括号包住条目名），改名不会断链。',
          '- 已经确认的设定，点开条目右上角的锁。锁住后 AI 不会擅自改。'
        ].join('\n'),
        fields: {
          tagline: '',
          genre: '',
          tone: '史诗',
          coreConflict: '',
          worldRules: '',
          themes: '',
          pov: '第三人称限知',
          tense: '过去时',
          targetWords: 80,
          status: '构思中'
        },
        tags: ['起点'],
        locked: true,
        relations: [],
        parentId: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'main_start_note',
        boardId: 'notes',
        name: '开始之前：四件事',
        subtitle: '',
        summary: '',
        body: [
          '- [ ] 写一句话故事',
          '- [ ] 建主角，填「想要 / 害怕 / 秘密」',
          '- [ ] 排出力量阶梯，给主角定阶',
          '- [ ] 建第一卷大纲，登记第一个伏笔',
          '',
          '做完这四件，就可以让我根据大纲写第一章了。'
        ].join('\n'),
        fields: { type: '待办', status: '收件箱', importance: '核心', related: [] },
        tags: ['onboarding'],
        locked: false,
        relations: [],
        parentId: null,
        createdAt: now,
        updatedAt: now
      }
    ],
    settings: {
      styleGuide: '',
      theme: 'auto',
      density: 'comfortable',
      aiNotes: ''
    },
    log: [
      {
        at: now,
        action: '创建世界',
        detail: '织世已就绪，等待第一个故事。'
      }
    ]
  }
}

function e(id, boardId, name, fields, body = '', extra = {}) {
  const now = extra.createdAt || new Date().toISOString()
  return {
    id,
    boardId,
    name,
    subtitle: extra.subtitle || '',
    summary: extra.summary || '',
    body,
    fields,
    tags: extra.tags || [],
    locked: extra.locked ?? false,
    relations: extra.relations || [],
    parentId: extra.parentId ?? null,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * 示例世界「雾港夜航」。
 * 刻意保留两处矛盾（顾临越阶、老周死后仍在第三章出场），用来演示检查器。
 */
export function demoProjectState(id = 'demo') {
  const now = new Date().toISOString()
  const state = emptyProjectState(id, '雾港夜航')
  state.project.subtitle = '一部关于潮汐、旧神与走私者的暗潮史诗'
  state.project.author = '示例'
  state.project.genre = '奇幻 / 悬疑 / 航海'
  state.project.logline =
    '雾港的潮水每晚带来一具没有影子的尸体，而唯一能听见潮声秘密的走私船长，必须在下一次大潮前找出凶手——否则整座城将被海底的旧神拖入深渊。'
  state.project.map = {
    image: '/story-loom/media/demo/map.svg',
    width: 1200,
    height: 800,
    uploadedAt: now
  }
  state.entries = []
  const entries = []

  entries.push(
    e(
      'demo_overview',
      'overview',
      '世界总览',
      {
        tagline: '潮水会记住每一具没有影子的尸体。',
        genre: '奇幻 / 悬疑 / 航海',
        tone: '诡谲',
        coreConflict:
          '沈雾想带着妹妹离开雾港，但她的血脉是打开旧神沉眠的钥匙；雾港议会想处决她平息潮灾，深渊教团想献祭她唤醒旧神。她必须在下一次大潮前，证明凶手不是自己。',
        worldRules: '潮声不可伪造；死者不渡无光海沟；旧神入梦时，所有影子会朝同一个方向倾斜。',
        themes: '自由与代价；记忆与身份；人能否选择自己的血脉',
        pov: '第三人称限知',
        tense: '过去时',
        targetWords: 80,
        status: '构思中'
      },
      [
        '## 一句话',
        '',
        '一座靠潮汐活着的城，一个能听见潮声的走私船长，一具没有影子的尸体。',
        '',
        '## 故事的发动机',
        '',
        '- 表层悬疑：谁杀了无影者？为什么尸体没有影子？',
        '- 中层权谋：议会要找一个替罪羊，教团要一场献祭，守潮人想捂住十年前的真相。',
        '- 深层人物：沈雾越想逃离血脉，越发现血脉是她唯一能救人的东西。',
        '',
        '## 示例说明',
        '',
        '这个示例世界故意留了两处连续性错误：顾临以凡人之身掌握「守潮印」，老周死后仍在第三章大纲出场。',
        '打开右侧「连续性」就能看到检查器如何抓它们。'
      ].join('\n'),
      { tags: ['示例'], locked: true }
    )
  )

  entries.push(
    e('demo_lore_tide', 'lore', '潮汐历法', {
      category: '历史',
      keywords: '潮历、计时、雾港',
      oneLine: '雾港以潮汐涨落计时，而不是日月。',
      related: ['demo_loc_harbor']
    }, '潮历把一天分成四潮：涨、满、退、枯。没有潮的时辰被称为「死水」，所有契约在死水时辰签订都无效。\n\n雾港人不说「明天见」，说「下一潮见」。', { tags: ['基础设定'] })
  )
  entries.push(
    e('demo_lore_god', 'lore', '旧神沉眠', {
      category: '宗教',
      keywords: '旧神、梦、无光海沟',
      oneLine: '旧神没有死，只是在海底做梦。',
      related: ['demo_loc_trench', 'demo_fac_cult']
    }, '旧神的梦会从无光海沟向上渗，先污染潮水，再污染人的记忆。\n\n教团相信，只要献上一具「没有影子的容器」，旧神就会醒。议会则相信，只要把容器烧掉，梦就会继续睡。', { tags: ['核心谜团'] })
  )
  entries.push(
    e('demo_lore_stateless', 'lore', '无籍者', {
      category: '风俗',
      keywords: '船籍、葬礼、潮水',
      oneLine: '没有船籍的人，死后不能被潮水带走。',
      related: ['demo_char_shenwu']
    }, '雾港的死人会被放进潮棺，由退潮带回海里。无籍者的潮棺会被港口拒绝，只能停在沉钟街的义庄，等一场永远不会来的潮。\n\n沈雾的妹妹就是无籍者。', { tags: ['人物动机'] })
  )

  entries.push(
    e('demo_rule_voice', 'rules', '潮声不可伪造', {
      ruleType: '世界法则',
      force: '绝对',
      consequence: '任何伪造潮声的人会被旧神标记；第三次之后，会溺死在陆地上。',
      related: ['demo_char_shenwu', 'demo_abil_listen']
    }, '潮声只能被听见，不能被制造。留声贝、口技、幻术都只能模仿外壳，模仿不了潮水里的「名字」。\n\n沈雾的能力之所以可怕，是因为她能让潮声以为她是自己人。', { locked: true, tags: ['铁律'] })
  )
  entries.push(
    e('demo_rule_dead', 'rules', '死者不渡无光海沟', {
      ruleType: '社会禁忌',
      force: '强',
      consequence: '把死者送进海沟的人，会在地图上失去自己的名字。',
      related: ['demo_loc_trench']
    }, '这是雾港唯一一条连教团都不敢公开违反的规矩。十年前的守潮人失踪案，就有人被指控把活人送进了海沟。', { tags: ['十年前'] })
  )

  entries.push(
    e('demo_char_shenwu', 'characters', '沈雾', {
      aliases: '雾姐、无籍船长',
      role: '主角',
      faction: 'demo_fac_guild',
      tier: 'demo_pow_3',
      age: '二十四',
      gender: '女',
      appearance: '总穿一件洗得发白的黑雨衣，左手腕有一圈像鳞片的旧疤。',
      personality: '嘴上不饶人，心里把所有人的债都记着。越害怕，越要笑。',
      desire: '攒够钱，带妹妹离开雾港，去一个没有潮声的内陆城。',
      fear: '有一天醒来，发现自己已经不会为死人难过。',
      secret: '她是旧神血裔。每一次「听潮」，都会失去一段与妹妹有关的记忆。',
      arc: '从「逃离血脉」到「用血脉赎回自己欠下的名字」。',
      status: '存活',
      deathChapter: '',
      firstChapter: 'demo_out_ch1',
      relations: [
        { id: 'rel_sw_gl', targetId: 'demo_char_gulin', type: '互相利用', note: '她需要顾临的船籍，顾临需要她的耳朵。' },
        { id: 'rel_sw_bl', targetId: 'demo_char_bailin', type: '血脉共鸣', note: '白鳞能听见她听不见的那一半潮声。' },
        { id: 'rel_sw_lz', targetId: 'demo_char_laozhou', type: '师徒', note: '老周教她听潮，也教她不要听太深。' }
      ]
    }, [
      '## 出场第一幕',
      '',
      '沈雾蹲在船头，用匕首刮掉甲板上的藤壶。',
      '',
      '潮水在船底翻了个身。',
      '',
      '她听见有人叫她的名字。',
      '',
      '她没有回头。',
      '',
      '回头的人，都留在了雾里。'
    ].join('\n'), { tags: ['主角', '旧神血裔'], locked: true })
  )
  entries.push(
    e('demo_char_gulin', 'characters', '顾临', {
      aliases: '顾调查官、断桅',
      role: '盟友',
      faction: 'demo_fac_council',
      tier: 'demo_pow_1',
      age: '三十一',
      gender: '男',
      appearance: '右手戴一只从不摘下的黑手套，说话时习惯先看人的影子。',
      personality: '守规矩，但只守自己认的那一套。',
      desire: '查清十年前守潮人失踪的真相，找回自己的名字。',
      fear: '再次被潮水「忘掉」。',
      secret: '他就是十年前失踪的守潮人，只是所有人都忘了。',
      arc: '从「借规矩复仇」到「承认自己也可能是凶手」。',
      status: '存活',
      deathChapter: '',
      firstChapter: 'demo_out_ch1',
      relations: [
        { id: 'rel_gl_sw', targetId: 'demo_char_shenwu', type: '互相利用', note: '他给她船籍，她给他潮声。' }
      ]
    }, '顾临第一次登上「夜鸢号」时，先数了一遍船上的人。\n\n七个。\n\n可他记得，自己上船前，甲板上站着八个。', { tags: ['调查官', '十年前'] })
  )
  entries.push(
    e('demo_char_bailin', 'characters', '白鳞', {
      aliases: '白祭司、潮底的新娘',
      role: '反派',
      faction: 'demo_fac_cult',
      tier: 'demo_pow_4',
      age: '看不出',
      gender: '女',
      appearance: '银发，眼白比眼黑多。裙摆永远在滴水，走过的地面却不会湿。',
      personality: '温柔得让人发冷。从不威胁，只给选择。',
      desire: '让旧神醒来看她一眼。',
      fear: '旧神醒来后，仍然不看她。',
      secret: '她与沈雾的婚约不是婚姻，是献祭的契约。',
      arc: '从「替神选新娘」到「替自己选一次」。',
      status: '存活',
      deathChapter: '',
      firstChapter: 'demo_out_ch3',
      relations: [
        { id: 'rel_bl_sw', targetId: 'demo_char_shenwu', type: '婚约/献祭', note: '她称沈雾为「妹妹」，从不叫名字。' }
      ]
    }, '白鳞把请柬放在桌上。\n\n红纸。金粉。没有新郎的名字。\n\n「妹妹，」她说，「这一次，你不用逃。」', { tags: ['反派', '教团'] })
  )
  entries.push(
    e('demo_char_laozhou', 'characters', '老周', {
      aliases: '周守潮、聋子周',
      role: '导师',
      faction: 'demo_fac_keepers',
      tier: 'demo_pow_2',
      age: '五十七',
      gender: '男',
      appearance: '右耳被割掉，常年披一件补了七次的蓑衣。',
      personality: '沉默，喝醉后会对着海骂人。',
      desire: '把十年前的债还清。',
      fear: '沈雾听见他藏起来的那段潮声。',
      secret: '十年前是他把沈雾从海沟里捞上来，也是他把她的名字写进了无籍册。',
      arc: '用死把真相推到沈雾面前。',
      status: '死亡',
      deathChapter: 'demo_chap_1',
      firstChapter: 'demo_out_ch1',
      relations: [
        { id: 'rel_lz_sw', targetId: 'demo_char_shenwu', type: '师徒', note: '他教她听潮，也教她不要听太深。' }
      ]
    }, '老周死的时候，手里还攥着半枚铜钱。\n\n铜钱上没有字。\n\n只有一道被潮水磨平的刻痕。', { tags: ['导师', '已死亡'] })
  )

  entries.push(
    e('demo_fac_council', 'factions', '雾港议会', {
      type: '城邦',
      leader: '',
      stance: '守序',
      territory: 'demo_loc_harbor',
      resources: '港口税、三艘铁壳巡潮舰、守潮人的旧档案。',
      goal: '在下一次大潮前处决「无影者」，平息市民恐慌。',
      weakness: '议会内部有人与教团做潮棺生意。',
      relations: [
        { id: 'rel_fac_1', targetId: 'demo_fac_cult', type: '暗中交易', note: '明面上通缉，暗地里买他们的潮盐。' },
        { id: 'rel_fac_2', targetId: 'demo_fac_keepers', type: '利用', note: '需要守潮人背锅。' }
      ]
    }, '议会厅没有窗。\n\n十二把椅子，十二个人，十二票。\n\n沈雾的名字被念出来时，只有一把椅子空着。', { tags: ['官方势力'] })
  )
  entries.push(
    e('demo_fac_cult', 'factions', '深渊教团', {
      type: '教团',
      leader: 'demo_char_bailin',
      stance: '混乱',
      territory: 'demo_loc_trench',
      resources: '潮盐、梦引、无光海沟里的旧神残响。',
      goal: '献祭一具没有影子的容器，让旧神醒来。',
      weakness: '教团内部对「谁有资格做新娘」并不统一。',
      relations: [
        { id: 'rel_fac_3', targetId: 'demo_char_shenwu', type: '猎物', note: '白鳞称她为「最干净的容器」。' }
      ]
    }, '教团不建神庙。\n\n他们只在退潮时，把椅子搬到海滩上，面朝海沟坐下。', { tags: ['反派势力'] })
  )
  entries.push(
    e('demo_fac_keepers', 'factions', '守潮人', {
      type: '结社',
      leader: 'demo_char_laozhou',
      stance: '隐世',
      territory: 'demo_loc_lighthouse',
      resources: '潮钟、听潮术、一份被撕掉三页的守潮人名册。',
      goal: '让旧神继续睡，让雾港继续假装什么都不知道。',
      weakness: '人丁凋零，只剩下一个聋子、一个死人和一个不肯回头的姑娘。',
      relations: [
        { id: 'rel_fac_4', targetId: 'demo_char_gulin', type: '失踪', note: '名册上仍有他的名字，但所有人都当他死了。' }
      ]
    }, '守潮人没有誓词。\n\n他们只在第一天上岗时，把自己的名字念给潮水听。', { tags: ['隐秘结社'] })
  )
  entries.push(
    e('demo_fac_guild', 'factions', '夜鸢号', {
      type: '商会',
      leader: 'demo_char_shenwu',
      stance: '中立',
      territory: 'demo_loc_harbor',
      resources: '一条改过三次船籍的旧快船、一张只认沈雾的潮图、七个欠她工钱的船员。',
      goal: '攒够钱，买一张不记名的内陆通行证。',
      weakness: '没有船籍，不能进官港；船一沉，所有人都会变成无籍者。',
      relations: [
        { id: 'rel_fac_5', targetId: 'demo_char_shenwu', type: '船长', note: '船员们怕她，但更怕没有她。' },
        { id: 'rel_fac_6', targetId: 'demo_fac_council', type: '走私', note: '议会一边通缉，一边买她的货。' }
      ]
    }, '夜鸢号没有旗帜。\n\n沈雾说，挂旗太贵。\n\n其实是因为，没有一面旗愿意认他们。', { tags: ['主角团'] })
  )

  entries.push(
    e('demo_loc_harbor', 'locations', '雾港', {
      type: '城邦',
      faction: 'demo_fac_council',
      region: '北境海岸',
      climate: '终年有雾，潮气重，盐蚀一切铁器。',
      danger: '中危',
      firstChapter: 'demo_out_ch1',
      mapX: 46,
      mapY: 55
    }, '雾港建在一头搁浅的巨鲸骨架上。\n\n涨潮时，整座城会轻轻往上浮一寸。\n\n老人们说，那是鲸还活着。', { tags: ['主城'] })
  )
  entries.push(
    e('demo_loc_lighthouse', 'locations', '黑礁灯塔', {
      type: '地标',
      faction: 'demo_fac_keepers',
      region: '雾港外海',
      climate: '风大，礁石黑得像烧过。',
      danger: '高危',
      firstChapter: 'demo_out_ch2',
      mapX: 68,
      mapY: 38
    }, '灯塔已经三十年没有亮过。\n\n可每到退潮，礁石缝里会传出钟声。\n\n一下。两下。三下。', { tags: ['第二章节地点'] })
  )
  entries.push(
    e('demo_loc_bellstreet', 'locations', '沉钟街', {
      type: '街区',
      faction: 'demo_fac_council',
      region: '雾港旧城',
      climate: '窄、湿、终年不见太阳。',
      danger: '低危',
      firstChapter: 'demo_out_ch3',
      mapX: 41,
      mapY: 61
    }, '沉钟街的钟从来不响。\n\n但每一场婚礼，都要在钟下走过。', { tags: ['第三章节地点'] })
  )
  entries.push(
    e('demo_loc_trench', 'locations', '无光海沟', {
      type: '海域',
      faction: 'demo_fac_cult',
      region: '雾港以东四十海里',
      climate: '没有风，没有光，潮水在这里是温的。',
      danger: '禁区',
      firstChapter: 'demo_out_ch2',
      mapX: 79,
      mapY: 68
    }, '海沟深得没有底。\n\n扔下去的东西不会落到底，只会一直往下掉。\n\n包括名字。', { tags: ['核心地点'] })
  )

  entries.push(
    e('demo_pow_1', 'power', '凡人', {
      rank: 1,
      aliases: '无潮者',
      power: '与常人无异。看不见潮声，也听不见旧神的梦。',
      breakthrough: '出生时没有被潮水祝福，就永远是凡人。',
      lifespan: '六十年上下',
      prevTier: '',
      representatives: ['demo_char_gulin']
    }, '雾港九成的人都是凡人。\n\n这不是贬义。\n\n这意味着他们还能安稳地做梦。', { tags: ['阶位 1'] })
  )
  entries.push(
    e('demo_pow_2', 'power', '引潮者', {
      rank: 2,
      aliases: '听潮人',
      power: '能感知潮水的方向与情绪，可在短距离内借潮水发力。',
      breakthrough: '在海难中活下来，并且没有忘记自己的名字。',
      lifespan: '八十年上下',
      prevTier: 'demo_pow_1',
      representatives: ['demo_char_laozhou']
    }, '引潮者能让一条船在逆风里多走半里。\n\n代价是，他们开始听见海里的声音。', { tags: ['阶位 2'] })
  )
  entries.push(
    e('demo_pow_3', 'power', '潮听者', {
      rank: 3,
      aliases: '潮语者、无籍之耳',
      power: '能听见潮水记住的名字，分辨活人与死人的影子。',
      breakthrough: '被潮水「认领」一次，并付出一样自己不想给的东西。',
      lifespan: '一百二十年，但记忆会先死',
      prevTier: 'demo_pow_2',
      representatives: ['demo_char_shenwu']
    }, '潮听者不是海的主人。\n\n他们是海的耳朵。\n\n耳朵不能决定自己听见什么。', { tags: ['阶位 3'] })
  )
  entries.push(
    e('demo_pow_4', 'power', '深渊眷者', {
      rank: 4,
      aliases: '梦行者',
      power: '能把旧神的梦带到岸上，让一片区域短暂地「不属于人间」。',
      breakthrough: '在无光海沟底部，被旧神看一眼而不疯。',
      lifespan: '三百年，或者直到旧神醒来',
      prevTier: 'demo_pow_3',
      representatives: ['demo_char_bailin']
    }, '眷者走进房间时，影子会先到。\n\n如果影子没有到，说明房间里有别的东西。', { tags: ['阶位 4'] })
  )
  entries.push(
    e('demo_pow_5', 'power', '旧神化身', {
      rank: 5,
      aliases: '潮底之物',
      power: '整片海域成为身体。一个念头可以改写一座城的记忆。',
      breakthrough: '旧神主动睁眼。没有已知的活人完成过。',
      lifespan: '与海同寿',
      prevTier: 'demo_pow_4',
      representatives: []
    }, '不要描写祂的全貌。\n\n所有见过全貌的人，都会变成别人故事里的一个名字。', { tags: ['阶位 5'] })
  )

  entries.push(
    e('demo_abil_listen', 'abilities', '听潮', {
      type: '血脉',
      minTier: 'demo_pow_2',
      owners: ['demo_char_shenwu'],
      cost: '每听一次，失去一段与妹妹有关的记忆。',
      effect: '听见潮水里残留的名字、情绪与死亡回响。',
      counter: '盐、钟声、以及另一个潮听者的「静默」。',
      limits: '不能在死水时辰使用；听见旧神的梦时，会短暂失去影子。'
    }, '沈雾闭上眼睛。\n\n潮水开始说话。\n\n它说的不是海的语言，是死人的语言。', { tags: ['主角能力'] })
  )
  entries.push(
    e('demo_abil_blade', 'abilities', '潮刃', {
      type: '神通',
      minTier: 'demo_pow_3',
      owners: ['demo_char_shenwu'],
      cost: '抽走周围十步内所有活物的体温。',
      effect: '把退潮的水压成一把半透明的薄刃，可切断影子。',
      counter: '强光会让刃提前蒸发。',
      limits: '一次只能维持三息。'
    }, '', { tags: ['战斗'] })
  )
  entries.push(
    e('demo_abil_seal', 'abilities', '守潮印', {
      type: '功法',
      minTier: 'demo_pow_2',
      owners: ['demo_char_gulin'],
      cost: '每次使用，都会让一个人忘记施术者的名字。',
      effect: '在物体上留下只有潮水能读懂的印记，用于追踪与封存。',
      counter: '用盐水洗掉印记，或者让一个无籍者触碰它。',
      limits: '必须用右手结印；顾临的右手一直戴着手套。'
    }, '', { tags: ['越阶示例'] })
  )
  entries.push(
    e('demo_abil_whisper', 'abilities', '深渊低语', {
      type: '禁术',
      minTier: 'demo_pow_4',
      owners: ['demo_char_bailin'],
      cost: '每说一句，自己的影子会变薄一分。',
      effect: '让听见的人短暂地把旧神的声音当成自己的心声。',
      counter: '捂住耳朵没有用；必须让另一个人叫出自己的真名。',
      limits: '不能在阳光下使用。'
    }, '', { tags: ['反派能力'] })
  )

  entries.push(
    e('demo_out_vol1', 'outline', '第一卷 · 潮声', {
      level: '卷',
      number: '第一卷',
      order: 1,
      status: '大纲',
      logline: '一具无影尸首把沈雾卷进十年前的旧案，她必须在潮灾前证明自己不是凶手。',
      conflict: '沈雾想逃，议会要她背锅，教团要她做新娘。',
      hooks: '开篇无影尸首；老周之死；白鳞的请柬。',
      cast: ['demo_char_shenwu', 'demo_char_gulin', 'demo_char_laozhou'],
      locations: ['demo_loc_harbor'],
      timePoint: '潮历 312 年 · 春',
      threads: ['demo_thr_body', 'demo_thr_memory'],
      targetWords: 120000,
      actualWords: 3200,
      chapterRecord: ''
    }, '第一卷的任务：让沈雾没有退路。\n\n她每解决一个问题，就多一个不能离开的理由。', { tags: ['第一卷'] })
  )
  entries.push(
    e('demo_out_ch1', 'outline', '第一章 · 无影之尸', {
      level: '章',
      number: '1-01',
      order: 101,
      status: '已定稿',
      logline: '沈雾在船头捡到一具没有影子的尸体，老周认出尸体上的守潮印。',
      conflict: '报警会被当成凶手；不报，尸体背后的东西会找上船。',
      hooks: '尸体没有影子；老周说「别回头」；潮水叫出沈雾的名字。',
      cast: ['demo_char_shenwu', 'demo_char_gulin', 'demo_char_laozhou'],
      locations: ['demo_loc_harbor'],
      timePoint: '潮历 312 年 · 春 · 第一潮',
      threads: ['demo_thr_body', 'demo_thr_memory'],
      targetWords: 3200,
      actualWords: 3200,
      chapterRecord: 'demo_chap_1'
    }, [
      '## 节拍',
      '',
      '1. 沈雾在夜鸢号船头听见潮水叫她的名字。',
      '2. 甲板下浮出一具没有影子的尸体。',
      '3. 老周认出尸体上的守潮印，脸色变了。',
      '4. 顾临登船调查，说他上船前看见八个人，现在只有七个。',
      '5. 老周支开沈雾，独自留下。',
      '6. 结尾：老周死在灯塔下，手里攥着半枚无字铜钱。'
    ].join('\n'), { parentId: 'demo_out_vol1', tags: ['第一章'] })
  )
  entries.push(
    e('demo_out_ch2', 'outline', '第二章 · 黑礁灯塔', {
      level: '章',
      number: '1-02',
      order: 102,
      status: '大纲',
      logline: '沈雾与顾临夜探灯塔，发现守潮人的名册被撕掉三页。',
      conflict: '顾临要证据，沈雾要掩盖自己听见的名字。',
      hooks: '灯塔三十年不亮却传出钟声；名册上有顾临的名字。',
      cast: ['demo_char_shenwu', 'demo_char_gulin'],
      locations: ['demo_loc_lighthouse', 'demo_loc_trench'],
      timePoint: '潮历 312 年 · 春 · 第二潮',
      threads: ['demo_thr_seal', 'demo_thr_body'],
      targetWords: 3500,
      actualWords: 0,
      chapterRecord: ''
    }, [
      '## 节拍',
      '',
      '1. 两人趁退潮登礁。',
      '2. 灯塔里没有人，却有新鲜的脚印。',
      '3. 顾临找到守潮人名册，自己的名字出现在十年前那一页。',
      '4. 沈雾听见海沟深处有人叫她「妹妹」。',
      '5. 结尾：灯塔亮了。'
    ].join('\n'), { parentId: 'demo_out_vol1', tags: ['第二章'] })
  )
  entries.push(
    e('demo_out_ch3', 'outline', '第三章 · 沉钟街的婚礼', {
      level: '章',
      number: '1-03',
      order: 103,
      status: '构思',
      logline: '白鳞送来一张没有新郎名字的婚帖，沈雾必须在婚礼上做出选择。',
      conflict: '去，是献祭；不去，妹妹会被议会带走。',
      hooks: '没有新郎的名字；老周出现在宾客名单上；钟响了。',
      cast: ['demo_char_shenwu', 'demo_char_bailin', 'demo_char_laozhou'],
      locations: ['demo_loc_bellstreet'],
      timePoint: '潮历 312 年 · 春 · 第三潮',
      threads: ['demo_thr_wedding', 'demo_thr_memory'],
      targetWords: 3800,
      actualWords: 0,
      chapterRecord: ''
    }, [
      '## 节拍',
      '',
      '1. 白鳞送请柬，称沈雾为「妹妹」。',
      '2. 沈雾发现宾客名单上有老周的名字。',
      '3. 顾临阻止她赴约，两人决裂。',
      '4. 婚礼上，沉钟第一次响了。',
      '5. 结尾：白鳞掀开盖头，下面没有脸。'
    ].join('\n'), { parentId: 'demo_out_vol1', tags: ['第三章'] })
  )

  entries.push(
    e('demo_time_1', 'timeline', '旧神沉眠', {
      era: '前潮历',
      dateLabel: '三十年前 · 大潮灾',
      sort: 0,
      eventType: '灾变',
      cast: [],
      place: ['demo_loc_trench'],
      chapter: '',
      impact: '无光海沟闭合，旧神停止翻身。雾港重建，守潮人成立。'
    }, '那一年，雾港沉了三分之一。\n\n剩下的人决定不再提这件事。', { tags: ['背景'] })
  )
  entries.push(
    e('demo_time_2', 'timeline', '守潮人失踪案', {
      era: '潮历',
      dateLabel: '十年前 · 死水月',
      sort: 10,
      eventType: '死亡',
      cast: ['demo_char_gulin', 'demo_char_laozhou'],
      place: ['demo_loc_lighthouse'],
      chapter: 'demo_out_ch1',
      impact: '守潮人一夜之间少了七个，名册被撕掉三页。顾临被所有人遗忘。'
    }, '官方说法是海难。\n\n但海难不会让一个人的名字从所有人的嘴里消失。', { tags: ['十年前'] })
  )
  entries.push(
    e('demo_time_3', 'timeline', '无影尸首出现', {
      era: '潮历',
      dateLabel: '潮历 312 年 · 春 · 第一潮',
      sort: 20,
      eventType: '开端',
      cast: ['demo_char_shenwu', 'demo_char_gulin', 'demo_char_laozhou'],
      place: ['demo_loc_harbor'],
      chapter: 'demo_out_ch1',
      impact: '沈雾被卷入案件，老周被杀。'
    }, '', { tags: ['第一章'] })
  )
  entries.push(
    e('demo_time_4', 'timeline', '灯塔复明', {
      era: '潮历',
      dateLabel: '潮历 312 年 · 春 · 第二潮',
      sort: 30,
      eventType: '揭露',
      cast: ['demo_char_shenwu', 'demo_char_gulin'],
      place: ['demo_loc_lighthouse'],
      chapter: 'demo_out_ch2',
      impact: '守潮人名册重见天日，顾临开始怀疑自己的身份。'
    }, '', { tags: ['第二章'] })
  )

  entries.push(
    e('demo_thr_body', 'threads', '无影尸体的身份', {
      type: '主线伏笔',
      status: '待回收',
      importance: '核心',
      plantChapter: 'demo_out_ch1',
      payoffChapter: '',
      plan: '第 5 章前后揭示：尸体是沈雾自己的「影子」',
      cast: ['demo_char_shenwu', 'demo_char_gulin'],
      known: '尸体没有影子；身上有守潮印；老周看到后脸色大变。',
      truth: '尸体是沈雾十年前被剥离的影子。旧神用它做容器，正在一点点爬回岸上。'
    }, '', { tags: ['主线', '核心谜团'] })
  )
  entries.push(
    e('demo_thr_memory', 'threads', '沈雾失去的记忆', {
      type: '人物秘密',
      status: '推进中',
      importance: '重要',
      plantChapter: 'demo_out_ch1',
      payoffChapter: '',
      plan: '每卷回收一段，第三卷拼出完整真相',
      cast: ['demo_char_shenwu'],
      known: '她记得妹妹，却想不起妹妹的脸。',
      truth: '她每一次听潮，都用与妹妹有关的记忆支付代价。妹妹可能已经不存在。'
    }, '', { tags: ['人物线'] })
  )
  entries.push(
    e('demo_thr_seal', 'threads', '顾临的守潮印', {
      type: '道具线索',
      status: '已埋',
      importance: '重要',
      plantChapter: 'demo_out_ch2',
      payoffChapter: '',
      plan: '第二卷揭示他是失踪的守潮人',
      cast: ['demo_char_gulin'],
      known: '他右手戴手套；名册上有他的名字。',
      truth: '他就是十年前失踪的守潮人，守潮印封住了他自己的记忆。'
    }, '', { tags: ['顾临线'] })
  )
  entries.push(
    e('demo_thr_wedding', 'threads', '白鳞的婚约', {
      type: '预告',
      status: '待埋',
      importance: '一般',
      plantChapter: '',
      payoffChapter: '',
      plan: '第三章埋下，第一卷结尾回收第一层',
      cast: ['demo_char_bailin', 'demo_char_shenwu'],
      known: '暂无。',
      truth: '婚约是献祭契约；白鳞真正想嫁的不是沈雾，是沈雾体内的旧神碎片。'
    }, '', { tags: ['教团线'] })
  )

  entries.push(
    e('demo_chap_1', 'chapters', '第一章 · 无影之尸', {
      number: 1,
      outlineRef: 'demo_out_ch1',
      status: '已完成',
      timePoint: '潮历 312 年 · 春 · 第一潮',
      places: ['demo_loc_harbor'],
      cast: ['demo_char_shenwu', 'demo_char_gulin', 'demo_char_laozhou'],
      events: '沈雾在夜鸢号发现无影尸首；老周认出守潮印；顾临登船调查；老周独自留在灯塔。',
      stateChanges: '老周死亡；沈雾成为嫌疑人；顾临开始调查十年前的旧案。',
      newLore: ['demo_lore_stateless', 'demo_rule_voice'],
      advanceThreads: ['demo_thr_body', 'demo_thr_memory'],
      payoffThreads: [],
      wordCount: 3200
    }, '## 本章定稿摘要\n\n老周死前说的最后一句话是：「别回头。」\n\n沈雾回头了。\n\n她看见自己的影子，站在灯塔下面，没有跟她一起走。', { tags: ['第 1 章'] })
  )

  entries.push(
    e('demo_codex_1', 'codex', '潮骸', {
      category: '异种',
      danger: '高危',
      habitat: ['demo_loc_trench'],
      tier: 'demo_pow_4',
      weakness: '盐与钟声。听到真正的潮钟会短暂僵直。',
      drops: '潮骨、无影鳞、一截还在跳动的鳃。',
      behavior: '只在退潮时上岸，模仿死者的声音引诱活人回头。',
      firstChapter: 'demo_out_ch2'
    }, '潮骸没有脸。\n\n它会借你的脸。\n\n所以雾港人走路时，从不看水里的倒影。', { tags: ['怪物'] })
  )
  entries.push(
    e('demo_codex_2', 'codex', '雾鸦', {
      category: '野兽',
      danger: '低危',
      habitat: ['demo_loc_harbor'],
      tier: 'demo_pow_1',
      weakness: '火光。',
      drops: '雾羽（可做占卜签）',
      behavior: '成群停在沉钟街的钟架上，只在有人撒谎时叫。',
      firstChapter: 'demo_out_ch1'
    }, '', { tags: ['怪物'] })
  )

  entries.push(
    e('demo_style_1', 'style', '示例样本 · 冷雾', {
      source: '织世内置示例',
      learn: '短句独立成段；用动作代替情绪形容词；每段只推进一个信息；在「听见名字」处留下钩子；不解释规则，让读者自己拼。',
      tags: ['短句', '悬疑', '冷感']
    }, [
      '雾从海面爬上来。',
      '',
      '不是飘。是爬。',
      '',
      '沈雾站在船头，听见水底有人叫她的名字。',
      '',
      '她没有回头。',
      '',
      '回头的人，都留在了雾里。'
    ].join('\n'), { tags: ['文风'] })
  )

  entries.push(
    e('demo_note_1', 'notes', '待办：给沈雾设计一个必须说谎的场景', {
      type: '待办',
      status: '收件箱',
      importance: '重要',
      dueChapter: 'demo_out_ch3',
      related: ['demo_char_shenwu']
    }, '要求：\n\n- 她说谎的对象必须是顾临。\n- 谎言必须有一半是真的。\n- 顾临必须看穿，但选择不拆穿。', { tags: ['待办'] })
  )
  entries.push(
    e('demo_note_2', 'notes', '决策：全书不出现现代枪械', {
      type: '决策',
      status: '进行中',
      importance: '一般',
      dueChapter: '',
      related: []
    }, '雾港的武力以冷兵器、潮术、海兽为主。\n\n火药存在，但受潮严重，只有议会礼仪队在用。', { tags: ['世界观'] })
  )
  entries.push(
    e('demo_note_3', 'notes', '问题：顾临为何隐瞒守潮印？', {
      type: '问题',
      status: '收件箱',
      importance: '核心',
      dueChapter: 'demo_out_ch2',
      related: ['demo_char_gulin', 'demo_thr_seal']
    }, '也许他自己也不记得。\n\n更好的答案：他不是隐瞒，是害怕一旦摘下手套，就会想起自己做过什么。', { tags: ['待解'] })
  )

  state.entries = entries
  state.log = [
    { at: now, action: '创建示例世界', detail: '雾港夜航已就绪，含两处刻意保留的矛盾用于演示检查器。' }
  ]
  return state
}
