export default {
  meta: {
    /** Browser tab title (follows UI locale) */
    documentTitle: 'Pianotes',
  },
  defaults: {
    scalesLabel: 'Scales',
    blockOptALabel: 'Bach',
    blockOptBLabel: 'Maintenance',
    slotA: 'Slot A',
    slotB: 'Slot B',
  },
  /**
   * Global fixed scales rotation pool (14 rows; index = effectiveDays % length).
   * Used on Today when segment scalesNote is empty.
   */
  scales: {
    fallbackLabel: 'Scales',
    rotationPool: [
      { scale: 'C major / a minor' },
      { scale: 'F major / d minor' },
      { scale: 'B♭ major / g minor' },
      { scale: 'E♭ major / c minor' },
      { scale: 'A♭ major / f minor' },
      { scale: 'D♭ major / b♭ minor' },
      { scale: 'C major - D♭ major review' },
      { scale: 'G♭ major / e♭ minor' },
      { scale: 'B major / g♯ minor' },
      { scale: 'E major / c♯ minor' },
      { scale: 'A major / f♯ minor' },
      { scale: 'D major / b minor' },
      { scale: 'G major / e minor' }, 
      { scale: 'G♭ major - G major review' },
    ],
  },
  header: {
    /** Renders as one word “Pianotes”; accent span = red “notes” */
    titleBefore: 'Pia',
    titleAccent: 'notes',
    weekProgress: 'Week {current} / {total}',
    weekProgressNoPlan: 'No route yet — add segments under Plan',
    streakLine: '{n}-day streak',
    skippedLine: '{n} day(s) deferred',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystemWithAppearance: 'System — currently {appearance}',
    themeTitle: 'Theme: {name}',
    themeCycleHint: 'Tap to cycle: light → dark → system',
    langSwitchToEn: 'English',
    langSwitchToZh: '中文',
  },
  autoDeferBanner: 'Auto-deferred {n} day(s) · no log',
  tabs: { today: 'Today', progress: 'Progress', plan: 'Plan' },
  logModal: {
    title: 'Log practice',
    titleEdit: 'Edit today’s log',
    durationLabel: 'Duration (minutes)',
    durationMinusStepAria: 'Subtract {step} minutes',
    durationPlusStepAria: 'Add {step} minutes',
    durationSuffix: 'min',
    noteLabel: 'Notes (optional)',
    notePlaceholder: 'How it felt, blockers, wins…',
    save: 'Save',
  },
  today: {
    scalesRotationCaption: 'Scales rotation {current} / {total}',
    minutesAbbr: 'min',
    focusBadge: 'Focus · {slot}',
    slotA: 'Piece A',
    slotB: 'Piece B',
    focusToday: 'Today · ~{minutes} min',
    doneTitle: 'Done today · {minutes} min',
    doneStreak: '{n}-day logging streak',
    ctaDone: 'Mark today done',
    ctaDoneDisabledHint: 'Add practice segments under Plan first',
    deferHint: 'Deferrals are automatic only: if a practice day has no log before the next day at 04:00, one day is added (total shown in the header). Manual defer / undo is disabled.',
    reviewTitle: 'Suggested review',
    reviewIntro: 'Random pick from the repertoire pool (entries come from each segment’s checklist) — warm-up or closing polish.',
    reviewAnother: 'Pick another',
    reviewEmpty:
      'No repertoire items yet: after global progress passes a segment, only rows listed in that segment’s checklist are added; an empty checklist adds nothing.',
    emptyPlanHint: 'No practice segments yet. Add segments under Plan or import an archive with a route before using Today’s practice layout.',
    editLog: 'Edit log',
    undoLog: 'Undo log',
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  progress: {
    statWeek: 'Week',
    statStages: 'Segments done',
    statStreak: 'Streak',
    statHours: 'Total time',
    statDaysSuffix: 'd',
    statHoursSuffix: 'h',
    heatmapTitle: 'Heatmap · last 16 weeks',
    repertoireTitle: 'Repertoire · by tag',
    repertoireTotalCount: '{n} pieces total',
    repertoireTagCount: '{n} pieces',
    repertoireIntro:
      'Only rows from each segment’s checklist count (including per-row tags). If the checklist is empty, finishing that segment adds nothing here. Items appear after global progress passes the segment; duplicates merge under each tag. “Suggested review” draws from the same pool.',
    emptyPiecesHint: 'Nothing yet: edit a segment under Plan and fill its checklist (optional tags per row). Piece A/B and optional slots do not add repertoire by themselves.',
    tagUncategorized: 'Uncategorized',
    pieceStageHint: 'Wk {start}–{end}',
    stageHintJoiner: ' · ',
    noCompletedPiecesYet: 'Nothing yet from checklists — finish a segment with at least one checklist row to see items here.',
    curriculumDoneTitle: '🎹 Route finished',
    curriculumDoneHint: 'Finished repertoire by tag.',
  },
  heatmap: {
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    durationTitle: '{date} · {minutes} min',
    less: 'Less',
    more: 'More',
  },
  plan: {
    screenTitle: 'Segments',
    introItalic: 'Weeks are the smallest unit; edit each segment’s duration and pieces; keep adding after the built-in path.',
    fromCurrentExplain:
      '{weeks} weeks total. “Start here” aligns Today + week counter to week 1 of that segment; earlier weeks count as passed — Progress updates repertoire from each segment’s checklist (logs & heatmap unchanged). Tap another card to move the anchor.',
    addBlock: 'Add segment',
    weekRange: 'Week {start}–{end}',
    currentTag: '● Current segment',
    startHereTitle: 'Anchor route at this segment',
    startHere: 'Start here',
    edit: 'Edit',
    mainPlaceholder: '(piece A empty)',
    mainSep: ' · ',
    mainPlaceholderB: '(piece B empty)',
    cardMetaCore: '{weeks} wk · ~{focusMin} min/session',
    mainHeading: 'Main',
    optionalHeading: 'Optional',
    optNone: 'No optional slots filled',
    archiveTitle: 'Archive',
    archiveIntro:
      'Same schema as JSON; files use a .txt extension for easier saving and sharing on phones. Import from a file (.txt) or paste from notes/chat. Field docs + sample blocks: export “Archive template”.',
    exportBackup: 'Export backup (.txt)',
    importFile: 'Import file (.txt)',
    importPaste: 'Paste import',
    exportTemplate: 'Export archive template',
    deleteSegment: 'Delete',
    deleteSegmentTitle: 'Delete this segment',
  },
  editor: {
    addTitle: 'New segment',
    editTitle: 'Edit segment',
    titleLabel: 'Title (optional)',
    titlePlaceholder: 'e.g. Block 3',
    weeksLabel: 'Weeks',
    mainALabel: 'Piece A (odd practice-day index)',
    mainBLabel: 'Piece B (even practice-day index)',
    focusRotationHint:
      'Today’s main focus alternates A/B by effective practice-day index (days since start minus deferrals): days 1, 3, 5… → A; days 2, 4, 6… → B. Deferrals use the same day counter as week progress, so you still rotate through both pieces.',
    focusMinLabel: 'Session length (min)',
    scalesTitleLabel: 'Scales label',
    scalesTitlePlaceholder: 'Scales',
    scalesMinLabel: 'Scales (min)',
    scalesNoteLabel: 'Fixed scales note (optional)',
    scalesNotePlaceholder: 'Empty: rotate through the built-in scales pool by effective practice day; filled: fixed note for this segment.',
    opt1Title: 'Optional block 1',
    opt2Title: 'Optional block 2',
    optLabelPlaceholder: 'Label, e.g. Bach',
    optLabelPlaceholderB: 'Label, e.g. Maintenance',
    piecePlaceholder: 'Piece name',
    minutesLabel: 'Minutes',
    checklistTitle: 'Checklist (optional)',
    checklistHelp:
      'Progress repertoire reads only this list: after global progress passes the segment, only rows here (and their per-row tags) are recorded; an empty checklist means that segment contributes nothing. Use the button below to pre-fill from pieces above, then edit or type freely.',
    deriveChecklist: 'Generate from pieces',
    checklistTagsHint: 'Tags for this row (optional): group this entry on Progress; separate with commas.',
    checklistTagsPlaceholder: 'e.g. Bach or Chopin, etude',
    rowPlaceholder: 'Task / piece',
    deleteRow: 'Remove row',
    addRow: 'Add row',
    noteLabel: 'Segment notes',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
  },
  archive: {
    readme: 'Full Piano Notes snapshot: start date, plan, logs, auto-defer flags, route anchor, theme; import overwrites matching keys.',
    templateReadme:
      'Sample archive for AI / hand-authored plans: includes schemaGuide plus example blocks. Give this file to a model and ask for valid JSON with the same shape; then use Paste import or Import file.',
    downloadPrefix: 'piano-notes-archive-',
    downloadTemplatePrefix: 'piano-notes-archive-template-',
    pasteTitle: 'Paste archive',
    pasteHint:
      'Paste full JSON matching “Export backup”. Markdown ```json fences are stripped automatically.',
    pastePlaceholder: '{ "appId": "pianotes", "version": 2, ... }',
    pasteSubmit: 'Validate & import',
    importConfirm: 'Import overwrites logs, deferrals, and plan on this device. Continue?',
    importError: 'Could not parse: appId must be pianotes, version must be 2, body must be valid JSON (from this app or the archive template).',
    aiSchemaGuide: `[Piano Notes] Archive JSON schema (output strict UTF-8 JSON, no comments)

Top-level required fields:
• appId: string "pianotes"
• version: number 2 (must match this app)
• startDate: string "YYYY-MM-DD" practice start date (powers the header "deferred" stat and the default anchor)
• blocks: array; may be empty (no route); if non-empty each item is a segment (order = route order)
• completed: object keyed by "YYYY-MM-DD" with { duration, note? }; {} for new plans
• autoPostponed: object date keys → true; the header "N days deferred" stat is the entry count; {} for new plans
• theme: "light" | "dark" | "system" (follow OS light/dark)
• routeAnchor: null or { date: "YYYY-MM-DD", week: positive integer }; if set, "Start here" pinned today to that global week and progression continues from there; null means progress naturally from startDate (use null for new plans)

Each blocks[] segment:
• id: unique string (e.g. "b_" + random)
• weeks: positive integer
• title: string (optional empty)
• mainA / mainB: strings for alternating daily focus
• focusMinutes: integer
• scalesLabel, scalesMinutes, scalesNote: scales block
• optA / optB: { label, piece, minutes }; piece may be ""
• note: string
• checklist: array of { id, label, tags }; non-empty label rows join Progress repertoire; tags: string[]

Extra keys like readme, schemaGuide, keys, exportedAt are ignored on import if present.`,
  },
  confirm: {
    planDialogTitle: 'Please confirm',
    alertTitle: 'Notice',
    confirmBtn: 'Confirm',
    undoTodayLog: 'Remove today’s practice log? Heatmap and streak will update.',
    startFromBlock:
      'Week aligns to week 1 of this segment; earlier weeks count as passed — Progress updates repertoire from checklists; logs & heatmap unchanged. Continue?',
    deleteBlock: 'Delete this segment?',
  },
};
