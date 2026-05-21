export default {
  meta: {
    /** 浏览器标签标题（与界面语言同步） */
    documentTitle: '练琴手记',
  },
  defaults: {
    scalesLabel: '音阶',
    blockOptALabel: '巴赫',
    blockOptBLabel: '保养曲目',
    slotA: '分类甲',
    slotB: '分类乙',
  },
  /**
   * 全局固定音阶轮换池（14 项；下标 = effectiveDays % length）。
   * 今日在未填写分段 scalesNote 时用池中条目轮换。
   */
  scales: {
    fallbackLabel: '音阶',
    rotationPool: [
      { scale: 'C大调 / a小调' },
      { scale: 'F大调 / d小调' },
      { scale: '降B大调 / g小调' },
      { scale: '降E大调 / c小调' },
      { scale: '降A大调 / f小调' },
      { scale: '降D大调 / 降b小调' },
      { scale: 'C大调 - 降D大调 复习' },
      { scale: '降G大调 / 降e小调' },
      { scale: 'B大调 / 升g小调' },
      { scale: 'E大调 / 升c小调' },
      {scale: 'A大调 / 升f小调' },
      {scale: 'D大调 / b小调' },
      {scale: 'G大调 / e小调' },
      {scale: '降G大调 - G大调 复习'}
    ],
  },
  header: {
    titleBefore: '练琴',
    titleAccent: '手记',
    weekProgress: '第 {current} / {total} 周',
    weekProgressNoPlan: '暂无路线（请到「计划」添加分段）',
    streakLine: '连续 {n} 天',
    skippedLine: '已顺延 {n} 天',
    themeDark: '深色',
    themeLight: '浅色',
    themeSystemWithAppearance: '跟随系统（当前{appearance}）',
    themeTitle: '主题：{name}',
    themeCycleHint: '点击切换：浅色 → 深色 → 跟随系统',
    langSwitchToEn: 'English',
    langSwitchToZh: '中文',
  },
  autoDeferBanner: '已自动顺延 {n} 天 · 未打卡',
  tabs: { today: '今日', progress: '进度', plan: '计划' },
  logModal: {
    title: '记录今日练习',
    titleEdit: '编辑今日打卡',
    durationLabel: '练习时长（分钟）',
    durationMinusStepAria: '减 {step} 分钟',
    durationPlusStepAria: '加 {step} 分钟',
    durationSuffix: '分钟',
    noteLabel: '备注（可选）',
    notePlaceholder: '今天的感受、卡点、收获...',
    save: '保存',
  },
  today: {
    scalesRotationCaption: '音阶轮换 \u00B7 第 {current} / {total} 项',
    minutesAbbr: '分钟',
    focusBadge: '主攻 · {slot}',
    slotA: '曲目 A',
    slotB: '曲目 B',
    focusToday: '今日主攻 · 约 {minutes} 分钟',
    doneTitle: '今日已完成 · {minutes} 分钟',
    doneStreak: '连续打卡 {n} 天',
    ctaDone: '标记今日已完成',
    ctaDoneDisabledHint: '请先添加练习分段',
    deferHint: '仅在错过打卡时自动顺延：某一练习日若在次日 04:00 前仍未记录，会自动 +1 天（顶部可查看累计顺延天数；不支持手动顺延或撤销）。',
    reviewTitle: '推荐复习',
    reviewIntro: '从「已学曲目」池中随机抽一首（池中条目来自各分段勾选清单）；可作热身或收尾巩固。',
    reviewAnother: '换一首',
    reviewEmpty: '还没有已学曲目：某分段在全局进度走过之后，只有该分段勾选清单里登记过的条目才会进入池中；清单为空则该分段不会贡献条目。',
    emptyPlanHint: '当前还没有任何练习分段。请到「计划」里新增分段，或导入含路线的档案后再开始今日练习。',
    editLog: '编辑打卡',
    undoLog: '撤销打卡',
    dayNames: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  progress: {
    statWeek: '路线周数',
    statStages: '已学完分段',
    statStreak: '连续打卡',
    statHours: '累计时长',
    statDaysSuffix: '天',
    statHoursSuffix: '小时',
    heatmapTitle: '练习热力图 · 最近 16 周',
    repertoireTitle: '已学曲目 · 按标签',
    repertoireTotalCount: '共 {n} 首',
    repertoireTagCount: '{n} 首',
    repertoireIntro:
      '列表仅来自各分段「勾选清单」里登记的条目（含每行标签）；清单为空时，该分段完成后也不会向这里写入任何曲目。仅在全局进度走过该分段后才计入；同名在各标签下去重合并。「今日」推荐复习从同一池子抽取。',
    emptyPiecesHint: '还没有条目：请在「计划 → 编辑」里为分段填写勾选清单（可加每行标签）；主曲目与自选不会自动进入已学曲目。',
    tagUncategorized: '未分类',
    pieceStageHint: '第 {start}–{end} 周',
    stageHintJoiner: ' · ',
    noCompletedPiecesYet: '暂无来自勾选清单的已学条目；完成分段且清单非空后，这里会按标签显示。',
    curriculumDoneTitle: '🎹 全程学完',
    curriculumDoneHint: '以下为按标签整理的已学曲目。',
  },
  heatmap: {
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    durationTitle: '{date} · {minutes}分',
    less: '少',
    more: '多',
  },
  plan: {
    screenTitle: '练习分段',
    introItalic: '以周为最小单位；在编辑中调整各分段周数与曲目；内置路线跑完后仍可继续添加。',
    fromCurrentExplain: '全程 {weeks} 周。在任一分段卡片点「从当前开始」会把「今日」与顶部周序号对齐到该分段的第一周；更早的周序视为已过，进度页会按勾选清单更新「已学曲目」（打卡与热力图不变）。换起点可换卡片再点。',
    addBlock: '新增分段',
    weekRange: '第 {start}–{end} 周',
    currentTag: '● 当前分段',
    startHereTitle: '从该分段当周序起点',
    startHere: '从当前开始',
    edit: '编辑',
    mainPlaceholder: '（未填主曲 A）',
    mainSep: ' · ',
    mainPlaceholderB: '（未填主曲 B）',
    cardMetaCore: '{weeks} 周 · 单次约 {focusMin} 分',
    mainHeading: '主曲目',
    optionalHeading: '自选',
    optNone: '无自选条目',
    archiveTitle: '练习档案',
    archiveIntro:
      '内容与合法 JSON 相同；备份文件扩展名为 .txt，便于手机保存与分享。可从文件导入（.txt），或使用「粘贴导入」从备忘录 / 聊天窗口粘贴。字段说明与示例见「导出存档模板」。',
    exportBackup: '导出备份 (.txt)',
    importFile: '从文件导入（.txt）',
    importPaste: '粘贴导入',
    exportTemplate: '导出存档模板',
    deleteSegment: '删除',
    deleteSegmentTitle: '删除该分段',
  },
  editor: {
    addTitle: '新增阶段',
    editTitle: '编辑阶段',
    titleLabel: '分段标题（可选）',
    titlePlaceholder: '如：第三期',
    weeksLabel: '持续周数',
    mainALabel: '主曲目 A（单数日序）',
    mainBLabel: '主曲目 B（双数日序）',
    focusRotationHint:
      '「今日」主攻按「有效练习日」单双交替：从练习起点算起的经过天数减去顺延天数；第 1、3、5… 日主攻 A，第 2、4、6… 日主攻 B。顺延或与日历不同步练琴时也会轮到两种主攻。',
    focusMinLabel: '单次练习（分钟）',
    scalesTitleLabel: '音阶标题',
    scalesTitlePlaceholder: '音阶',
    scalesMinLabel: '音阶时长（分钟）',
    scalesNoteLabel: '固定音阶说明（可选）',
    scalesNotePlaceholder: '留空则按全局固定音阶池与有效练习日依次轮换；填写则本阶段始终显示此说明。',
    opt1Title: '自选区块一',
    opt2Title: '自选区块二',
    optLabelPlaceholder: '区块名称，如：巴赫',
    optLabelPlaceholderB: '区块名称，如：保养曲目',
    piecePlaceholder: '曲目名',
    minutesLabel: '时长（分钟）',
    checklistTitle: '勾选清单（可选）',
    checklistHelp:
      '「进度」里的已学曲目只读这份清单：阶段在全局进度走过之后，只有此处登记的条目（及每行标签）会入库；清空清单则该阶段不向已学曲目贡献任何条目。可用下方按钮根据主曲目与自选预填行，再按需删改或手写。',
    deriveChecklist: '按主曲目与自选生成',
    checklistTagsHint: '本行标签（可选）：用于「进度」里归类该条目，逗号或顿号分隔多个。',
    checklistTagsPlaceholder: '例：巴赫 或 肖邦，练习曲',
    rowPlaceholder: '曲目或任务描述',
    deleteRow: '删除此行',
    addRow: '添加勾选行',
    noteLabel: '分段备忘',
    save: '保存',
    delete: '删除',
    cancel: '取消',
  },
  archive: {
    readme: '练琴手记完整快照：含练习起点、阶段计划、打卡记录、自动顺延标记、路线锚点与主题；导入会覆盖本机同名键。',
    templateReadme:
      'AI / 手工编写计划用示例档案：内含 schemaGuide（字段说明）与示例 blocks。可将本文件提供给大模型，要求其输出同结构的合法 JSON；再用「粘贴导入」或「从文件导入」写入本应用。',
    downloadPrefix: '练琴手记-档案-',
    downloadTemplatePrefix: '练琴手记-存档模板-',
    pasteTitle: '粘贴档案',
    pasteHint:
      '粘贴与「导出备份」相同结构的完整 JSON。若内容包在 ```json 代码块里，无需手动删除，导入时会自动剥离外层。',
    pastePlaceholder: '{ "appId": "pianotes", "version": 2, ... }',
    pasteSubmit: '校验并导入',
    importConfirm: '导入将覆盖本机当前的打卡记录、顺延天数与阶段计划，确定继续？',
    importError: '无法解析：请确认 appId 为 pianotes 为 2，且为合法 JSON（可由本应用导出或按存档模板生成）。',
    aiSchemaGuide: `【练琴手记】档案 JSON 字段说明（生成时必须输出合法 UTF-8 JSON，不要包含注释）

必填顶层字段：
• appId：固定字符串 "pianotes"
• version：数字 2（与本应用一致方可导入）
• startDate：字符串 "YYYY-MM-DD"，练习路线起点日（用于显示「累计顺延」与默认锚点）
• blocks：数组；可为空表示尚未配置路线；非空时每项为一个阶段对象（顺序即路线顺序）
• completed：对象，键为 "YYYY-MM-DD"，值为 { duration, note? }；新计划可为 {}
• autoPostponed：对象，键为日期字符串，值为 true（顶部「已顺延 N 天」即此对象的条目数；新计划可为 {}）
• theme：字符串 "light"、"dark" 或 "system"（跟随系统深浅色）
• routeAnchor：null 或 { date: "YYYY-MM-DD", week: 正整数 }；非 null 表示「从当前开始」时把今天对齐到该全局周；为 null 时按 startDate 自然推进（新计划一般用 null）

阶段对象 blocks[] 常用字段：
• id：字符串，唯一，建议 "b_" 前缀 + 随机字符
• weeks：正整数，该阶段持续周数
• title：字符串，阶段标题（可为空）
• mainA / mainB：字符串，主攻曲目（单双日轮换）
• focusMinutes：整数，单次练习默认主攻时长（分钟）
• scalesLabel / scalesMinutes / scalesNote：音阶区块
• optA / optB：{ label, piece, minutes }，自选曲目区块；piece 可为空字符串
• note：字符串，阶段备忘
• checklist：数组；每项 { id, label, tags }；label 非空才会计入「已学曲目」。tags 为字符串数组，可为 []

导入前请校验 JSON；可同时保留顶层 readme / schemaGuide / keys / exportedAt 等说明字段（应用会读取所需字段并忽略其余）。`,
  },
  confirm: {
    planDialogTitle: '请确认',
    alertTitle: '提示',
    confirmBtn: '确定',
    undoTodayLog: '撤销今天的打卡？热力图与连续天数会随之更新。',
    startFromBlock: '「今日」的周序号会对齐到该分段的第一周；更早的周序视为已过，进度页会按勾选清单更新已学曲目；打卡与热力图不变。确定吗？',
    deleteBlock: '确定删除该分段？',
  },
};
