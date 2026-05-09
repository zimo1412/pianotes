/**
 * Plan tab: segments list, reorder/edit entrypoints, archive import/export.
 */

import { Plus, ArrowUp, ArrowDown, Download, Upload, ClipboardPaste } from 'lucide-react';
import { useI18n } from '../../locales/I18nProvider.jsx';
import { iconButton, primaryButton, secondaryButton } from '../ui/buttonStyles.js';

export function PlanScreen({
  styles,
  blocks,
  weekNumber,
  moveBlock,
  setPlanEditor,
  onRequestStartFromBlock,
  onRequestDeletePlanBlock,
  onExportArchive,
  onPickImportArchive,
  onOpenArchivePaste,
  onExportAiTemplate,
}) {
  const { t } = useI18n();
  let cumulative = 0;
  const totalWeeksAll = blocks.reduce((s, b) => s + b.weeks, 0);

  function optSlotSummary(block) {
    const a = (block.optA?.piece || '').trim();
    const b = (block.optB?.piece || '').trim();
    if (a && b) return t('plan.optTwo');
    if (a || b) return t('plan.optOne');
    return t('plan.optNone');
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.15em', color: styles.textFaint, marginBottom: 16, fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}>
        {t('plan.screenTitle')}
      </div>
      <p style={{ fontSize: 14, color: styles.textMuted, marginBottom: 16, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 700 }}>
        {t('plan.introItalic')}
      </p>
      <p style={{ fontSize: 12, color: styles.textFaint, marginBottom: 12, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: 1.65 }}>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', fontFamily: '"Noto Serif SC", serif', fontWeight: 700 }}>
                    <span style={{ fontSize: 11, color: styles.textFaint }}>{t('plan.weekRange', { start: startWeek, end: endWeek })}</span>
                    {isCurrent && <span style={{ fontSize: 11, color: styles.primary }}>{t('plan.currentTag')}</span>}
                  </div>
                  {block.title ? <div style={{ fontSize: 13, color: styles.textMuted, marginTop: 6, fontWeight: 700 }}>{block.title}</div> : null}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setPlanEditor({ mode: 'edit', id: block.id })}
                      style={{ fontSize: 11, color: styles.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}
                    >
                      {t('plan.edit')}
                    </button>
                    <button
                      type="button"
                      title={t('plan.deleteSegmentTitle')}
                      onClick={() => onRequestDeletePlanBlock(block.id)}
                      style={{
                        fontSize: 11,
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
                    <button
                      type="button"
                      title={t('plan.startHereTitle')}
                      onClick={() => onRequestStartFromBlock(bi)}
                      style={{
                        fontSize: 10,
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
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" title={t('plan.moveUp')} onClick={() => moveBlock(bi, -1)} disabled={bi === 0} style={{ ...iconButton(styles), width: 34, height: 34, opacity: bi === 0 ? 0.35 : 1 }}>
                      <ArrowUp size={16} strokeWidth={3} />
                    </button>
                    <button type="button" title={t('plan.moveDown')} onClick={() => moveBlock(bi, 1)} disabled={bi === blocks.length - 1} style={{ ...iconButton(styles), width: 34, height: 34, opacity: bi === blocks.length - 1 ? 0.35 : 1 }}>
                      <ArrowDown size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 16, marginBottom: 6, color: styles.text, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 700 }}>
                {(block.mainA || t('plan.mainPlaceholder')) + t('plan.mainSep') + (block.mainB || t('plan.mainPlaceholderB'))}
              </div>
              <div style={{ fontSize: 12, color: styles.textFaint, marginBottom: 4 }}>
                {t('plan.cardMeta', { weeks: block.weeks, focusMin: block.focusMinutes ?? 60, opts: optSlotSummary(block) })}
              </div>
              <div style={{ fontSize: 13, color: styles.textMuted, fontStyle: 'italic', fontWeight: 600, lineHeight: 1.45 }}>{block.note || 'ù'}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${styles.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', color: styles.textFaint, marginBottom: 10, fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}>
          {t('plan.archiveTitle')}
        </div>
        <p style={{ fontSize: 13, color: styles.textMuted, marginBottom: 16, lineHeight: 1.5, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
          {t('plan.archiveIntro')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onExportArchive} style={{ ...secondaryButton(styles), flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16} strokeWidth={3} /> {t('plan.exportBackup')}
            </button>
            <button type="button" onClick={onPickImportArchive} style={{ ...secondaryButton(styles), flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={16} strokeWidth={3} /> {t('plan.importFile')}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={onOpenArchivePaste} style={{ ...secondaryButton(styles), flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ClipboardPaste size={16} strokeWidth={3} /> {t('plan.importPaste')}
            </button>
            <button type="button" onClick={onExportAiTemplate} style={{ ...secondaryButton(styles), flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16} strokeWidth={3} /> {t('plan.exportTemplate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
