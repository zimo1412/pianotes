/**
 * Plan tab: segments list, edit entrypoints, archive import/export.
 */

import { Plus, Download, Upload, ClipboardPaste } from 'lucide-react';
import { useI18n } from '../../locales/I18nProvider.jsx';
import { primaryButton, secondaryButton } from '../ui/buttonStyles.js';
import { MixedScriptBalance } from '../ui/MixedScriptBalance.jsx';
import { FONT_UI, displayMixedItalic, planSideLabelColumnStyle, TAB_LH_BODY, TAB_LH_META, TAB_LH_TIGHT } from '../typography.js';

/** Middle dot separator (use Unicode literal so editors never swap it for `?`). */
const DOT = '\u00B7';

/** Optional slots: one row per slot; omitted when custom title & piece both empty. Format ??? ? ???. */
function optionalSlotLines(block, t) {
  const rows = [];
  function push(key, opt, defaultTitle) {
    const title = (opt?.label || '').trim();
    const piece = (opt?.piece || '').trim();
    if (!title && !piece) return;
    let line;
    if (title && piece) line = `${title} ${DOT} ${piece}`;
    else if (piece) line = `${defaultTitle} ${DOT} ${piece}`;
    else line = title;
    rows.push({ key, line });
  }
  push('a', block.optA, t('defaults.slotA'));
  push('b', block.optB, t('defaults.slotB'));
  return rows;
}

function archiveRowButton(styles) {
  return {
    ...secondaryButton(styles),
    flex: '1 1 120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.05em',
    padding: '8px 10px',
  };
}

export function PlanScreen({
  styles,
  blocks,
  weekNumber,
  setPlanEditor,
  onRequestStartFromBlock,
  onRequestDeletePlanBlock,
  onExportArchive,
  onPickImportArchive,
  onOpenArchivePaste,
  onExportAiTemplate,
}) {
  const { t, locale } = useI18n();
  let cumulative = 0;
  const totalWeeksAll = blocks.reduce((s, b) => s + b.weeks, 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 12, letterSpacing: '0.15em', color: styles.textFaint, marginBottom: 14, fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}>
        {t('plan.screenTitle')}
      </div>
      <p style={{ ...displayMixedItalic, fontSize: 15, color: styles.textMuted, marginBottom: 14, fontWeight: 600, lineHeight: TAB_LH_BODY }}>
        <MixedScriptBalance>{t('plan.introItalic')}</MixedScriptBalance>
      </p>
      <p style={{ fontSize: 13, color: styles.textFaint, marginBottom: 12, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: TAB_LH_BODY }}>
        {t('plan.fromCurrentExplain', { weeks: totalWeeksAll })}
      </p>

      <button type="button" onClick={() => setPlanEditor({ mode: 'add' })} style={{ ...primaryButton(styles), marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Plus size={18} strokeWidth={3} /> {t('plan.addBlock')}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {blocks.map((block, bi) => {
          const startWeek = cumulative + 1;
          cumulative += block.weeks;
          const endWeek = cumulative;
          const isCurrent = weekNumber >= startWeek && weekNumber <= endWeek;
          const isPast = weekNumber > endWeek;
          const optionalRows = optionalSlotLines(block, t);

          return (
            <div
              key={block.id}
              style={{
                border: `1px solid ${isCurrent ? styles.text : styles.border}`,
                padding: 16,
                background: isCurrent ? styles.bgHighlight : isPast ? 'transparent' : styles.bgCard,
                opacity: isPast ? 0.65 : 1,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: block.title ? 6 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 0, fontFamily: '"Noto Serif SC", serif', fontWeight: 700 }}>
                    <span style={{ fontSize: 12, color: styles.textFaint }}>{t('plan.weekRange', { start: startWeek, end: endWeek })}</span>
                    {isCurrent && <span style={{ fontSize: 12, color: styles.primary }}>{t('plan.currentTag')}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexShrink: 0 }}>
                    <button
                      type="button"
                      title={t('plan.startHereTitle')}
                      onClick={() => onRequestStartFromBlock(bi)}
                      style={{
                        fontSize: 12,
                        color: styles.textFaint,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: '"Noto Serif SC", serif',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('plan.startHere')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlanEditor({ mode: 'edit', id: block.id })}
                      style={{ fontSize: 12, color: styles.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}
                    >
                      {t('plan.edit')}
                    </button>
                    <button
                      type="button"
                      title={t('plan.deleteSegmentTitle')}
                      onClick={() => onRequestDeletePlanBlock(block.id)}
                      style={{
                        fontSize: 12,
                        color: styles.accent,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: '"Noto Serif SC", serif',
                        fontWeight: 800,
                        padding: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t('plan.deleteSegment')}
                    </button>
                  </div>
                </div>
                {block.title ? (
                  <div style={{ fontSize: 13.5, color: styles.textMuted, fontWeight: 600, lineHeight: TAB_LH_TIGHT }}>
                    <MixedScriptBalance style={{ fontFamily: FONT_UI, fontStyle: 'normal', fontSynthesis: 'none', fontWeight: 600 }}>
                      {block.title}
                    </MixedScriptBalance>
                  </div>
                ) : null}
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={planSideLabelColumnStyle(styles, locale)}>{t('plan.mainHeading')}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        ...displayMixedItalic,
                        fontSize: 15.5,
                        marginBottom: 2,
                        color: styles.text,
                        lineHeight: TAB_LH_TIGHT,
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <MixedScriptBalance latinEm={1.09} cjkEm={0.8}>
                        {(block.mainA || t('plan.mainPlaceholder')) + t('plan.mainSep') + (block.mainB || t('plan.mainPlaceholderB'))}
                      </MixedScriptBalance>
                    </div>
                    <div style={{ fontSize: 13, color: styles.textFaint, lineHeight: TAB_LH_META, fontFamily: FONT_UI, fontWeight: 600 }}>
                      {t('plan.cardMetaCore', { weeks: block.weeks, focusMin: block.focusMinutes ?? 60 })}
                      {optionalRows.length === 0 ? ` ${DOT} ${t('plan.optNone')}` : null}
                    </div>
                  </div>
                </div>
              </div>

              {optionalRows.length > 0 ? (
                <div
                  style={{
                    marginBottom: 4,
                    paddingTop: 5,
                    borderTop: `1px solid ${styles.borderSoft}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={planSideLabelColumnStyle(styles, locale)}>{t('plan.optionalHeading')}</span>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {optionalRows.map((row) => (
                        <div
                          key={row.key}
                          style={{
                            ...displayMixedItalic,
                            fontSize: 15.5,
                            color: styles.text,
                            lineHeight: 1.26,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                          }}
                        >
                          <MixedScriptBalance latinEm={1.08} cjkEm={0.82}>{row.line}</MixedScriptBalance>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {(block.note || '').trim() ? (
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 5,
                    borderTop: `1px solid ${styles.borderSoft}`,
                    ...displayMixedItalic,
                    fontSize: 15.5,
                    color: styles.textMuted,
                    lineHeight: 1.34,
                  }}
                >
                  <MixedScriptBalance latinEm={1.07} cjkEm={0.82}>{block.note.trim()}</MixedScriptBalance>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${styles.border}` }}>
        <div style={{ fontSize: 12, letterSpacing: '0.12em', color: styles.textFaint, marginBottom: 8, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, lineHeight: 1.25 }}>
          {t('plan.archiveTitle')}
        </div>
        <p style={{ fontSize: 12, color: styles.textFaint, marginBottom: 10, lineHeight: 1.42, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
          {t('plan.archiveIntro')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={onExportArchive} style={archiveRowButton(styles)}>
              <Download size={13} strokeWidth={2} /> {t('plan.exportBackup')}
            </button>
            <button type="button" onClick={onPickImportArchive} style={archiveRowButton(styles)}>
              <Upload size={13} strokeWidth={2} /> {t('plan.importFile')}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={onOpenArchivePaste} style={archiveRowButton(styles)}>
              <ClipboardPaste size={13} strokeWidth={2} /> {t('plan.importPaste')}
            </button>
            <button type="button" onClick={onExportAiTemplate} style={archiveRowButton(styles)}>
              <Download size={13} strokeWidth={2} /> {t('plan.exportTemplate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
