/**
 * Today tab: main focus card, review picker, practice completion CTA.
 * ItemRow is colocated (only used here).
 */

import { useMemo, useState } from 'react';
import { Check, Shuffle, Flame } from 'lucide-react';
import { useI18n } from '../../locales/I18nProvider.jsx';
import { getDedupedCompletedPieceTitles } from '../repertoire.js';
import { getDayOfWeek } from '../routeFocus.js';
import { primaryButton, secondaryButton } from '../ui/buttonStyles.js';
import { MixedScriptBalance } from '../ui/MixedScriptBalance.jsx';
import { FONT_UI, displayMixedItalic, TAB_LH_BODY, TAB_LH_META, TAB_LH_TIGHT } from '../typography.js';

function ItemRow({ styles, label, content, italic }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 0', borderBottom: `1px solid ${styles.borderSoft}` }}>
      <div style={{ fontSize: 12, letterSpacing: '0.08em', color: styles.textFaint, width: 148, flexShrink: 0, fontFamily: '"Noto Serif SC", serif', fontWeight: 700, lineHeight: TAB_LH_META }}>
        {label}
      </div>
      <div style={{ color: styles.text, flex: 1, minWidth: 0, fontSize: italic ? 16 : 14, lineHeight: TAB_LH_TIGHT }}>
        <MixedScriptBalance
          style={
            italic
              ? { ...displayMixedItalic, fontWeight: 600 }
              : { fontFamily: FONT_UI, fontStyle: 'normal', fontSynthesis: 'none', fontWeight: 600 }
          }
          latinEm={italic ? 1.1 : 1.06}
          cjkEm={italic ? 0.78 : 0.87}
        >
          {content}
        </MixedScriptBalance>
      </div>
    </div>
  );
}

export function TodayScreen({
  styles,
  todayInfo,
  completedToday,
  onOpenNewLog,
  onEditLog,
  onUndoLog,
  today,
  streak,
  blocks,
  weekNumber,
  totalWeeks,
}) {
  const { t, locale, messages } = useI18n();
  const [reviewNonce, setReviewNonce] = useState(0);
  const reviewPool = useMemo(() => getDedupedCompletedPieceTitles(blocks, weekNumber, totalWeeks), [blocks, weekNumber, totalWeeks]);
  const reviewPick = useMemo(() => {
    if (!reviewPool.length) return null;
    let h = (reviewNonce + 1) * 2654435761;
    const idx = (h >>> 0) % reviewPool.length;
    return reviewPool[idx];
  }, [reviewPool, reviewNonce]);
  const {
    focus,
    focusType,
    scaleDetail,
    scaleRotation,
    scalesMinutes,
    scalesLabel,
    focusMinutes,
    block,
  } = todayInfo;
  const dayName = messages.today.dayNames[getDayOfWeek(today)];
  const dateLabel = today.toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const hasPracticeTask = Boolean(block);
  const dot = '\u00B7';

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ fontSize: 13, letterSpacing: '0.15em', color: styles.textFaint, marginBottom: 4, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
        {scaleRotation
          ? `${dayName} ${dot} ${t('today.scalesRotationCaption', { current: scaleRotation.current, total: scaleRotation.total })}`
          : dayName}
      </div>
      <div style={{ ...displayMixedItalic, fontSize: 17, color: styles.textSoft, marginBottom: 20, lineHeight: TAB_LH_TIGHT }}>
        <MixedScriptBalance>{dateLabel}</MixedScriptBalance>
      </div>

      {!block ? (
        <div
          style={{
            padding: 20,
            marginBottom: 16,
            border: `1px dashed ${styles.border}`,
            background: styles.bgCard,
            fontSize: 15,
            color: styles.textMuted,
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 600,
            lineHeight: TAB_LH_BODY,
          }}
        >
          {t('today.emptyPlanHint')}
        </div>
      ) : (
        <>
          <div style={{ background: styles.bgCard, border: `1px solid ${styles.border}`, padding: '22px 24px 26px', marginBottom: 16, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 13, color: styles.textFaint, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
              {t('today.focusBadge', { slot: focusType === 'A' ? t('today.slotA') : t('today.slotB') })}
            </div>
            <div style={{ fontSize: 13, letterSpacing: '0.15em', color: styles.primary, marginBottom: 8, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
              {t('today.focusToday', { minutes: focusMinutes })}
            </div>
            <div style={{ ...displayMixedItalic, fontSize: 22, color: styles.text, lineHeight: TAB_LH_TIGHT, fontWeight: 600 }}>
              <MixedScriptBalance latinEm={1.09} cjkEm={0.8}>
                {focus}
              </MixedScriptBalance>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <ItemRow styles={styles} label={`${scalesLabel} ${dot} ${scalesMinutes} ${t('today.minutesAbbr')}`} content={scaleDetail} italic />
            {(block.optA?.piece || '').trim() !== '' && (
              <ItemRow styles={styles} label={`${block.optA.label || t('defaults.slotA')} ${dot} ${block.optA.minutes ?? 15} ${t('today.minutesAbbr')}`} content={block.optA.piece} />
            )}
            {(block.optB?.piece || '').trim() !== '' && (
              <ItemRow styles={styles} label={`${block.optB.label || t('defaults.slotB')} ${dot} ${block.optB.minutes ?? 20} ${t('today.minutesAbbr')}`} content={block.optB.piece} />
            )}
          </div>

          <div style={{ ...displayMixedItalic, borderLeft: `3px solid ${styles.accent}`, paddingLeft: 16, paddingTop: 8, paddingBottom: 8, marginBottom: 18, fontSize: 15.5, color: styles.textMuted, lineHeight: TAB_LH_BODY }}>
            <MixedScriptBalance latinEm={1.07} cjkEm={0.83}>
              {block.note}
            </MixedScriptBalance>
          </div>
        </>
      )}

      <div style={{ marginBottom: 22, padding: 16, border: `1px solid ${styles.border}`, background: styles.bgCard }}>
        <div style={{ fontSize: 13, letterSpacing: '0.12em', color: styles.accent, marginBottom: 6, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, lineHeight: TAB_LH_META }}>
          {t('today.reviewTitle')}
        </div>
        <p style={{ fontSize: 13, color: styles.textFaint, margin: '0 0 10px', lineHeight: TAB_LH_BODY, fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>
          {t('today.reviewIntro')}
        </p>
        {reviewPick ? (
          <>
            <div style={{ ...displayMixedItalic, fontSize: 17, color: styles.text, lineHeight: TAB_LH_TIGHT, marginBottom: 10 }}>
              <MixedScriptBalance>{reviewPick}</MixedScriptBalance>
            </div>
            <button
              type="button"
              onClick={() => setReviewNonce((n) => n + 1)}
              style={{
                ...secondaryButton(styles),
                width: '100%',
                padding: '11px 0',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Shuffle size={16} strokeWidth={3} /> {t('today.reviewAnother')}
            </button>
          </>
        ) : (
          <div style={{ fontSize: 14, color: styles.textMuted, fontFamily: '"Noto Serif SC", serif', fontWeight: 600, lineHeight: TAB_LH_BODY }}>
            {t('today.reviewEmpty')}
          </div>
        )}
      </div>

      {completedToday ? (
        <>
          <div style={{ background: styles.bgDone, border: `1px solid ${styles.borderDone}`, padding: 20, textAlign: 'center' }}>
            <Check size={26} style={{ color: styles.textDone, margin: '0 auto 8px', display: 'block' }} strokeWidth={3} />
            <div style={{ fontSize: 15, color: styles.textDone, fontWeight: 800, letterSpacing: '0.02em', lineHeight: TAB_LH_META }}>
              {t('today.doneTitle', { minutes: completedToday.duration })}
            </div>
            {streak > 0 && (
              <div style={{ fontSize: 13, color: styles.textDone, marginTop: 5, fontFamily: '"Noto Serif SC", serif', fontWeight: 800, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 4, lineHeight: TAB_LH_META }}>
                <Flame size={13} strokeWidth={3} /> {t('today.doneStreak', { n: streak })}
              </div>
            )}
            {completedToday.note && (
              <div style={{ ...displayMixedItalic, fontSize: 15, color: styles.textMuted, marginTop: 8, lineHeight: TAB_LH_BODY }}>
                &ldquo;
                <MixedScriptBalance>{completedToday.note}</MixedScriptBalance>
                &rdquo;
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="button" onClick={onEditLog} style={{ flex: 1, ...secondaryButton(styles), padding: '12px 8px', fontSize: 14 }}>
              {t('today.editLog')}
            </button>
            <button type="button" onClick={onUndoLog} style={{ flex: 1, ...secondaryButton(styles), padding: '12px 8px', fontSize: 14, color: styles.primary, borderColor: styles.primary }}>
              {t('today.undoLog')}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={!hasPracticeTask}
          title={!hasPracticeTask ? t('today.ctaDoneDisabledHint') : undefined}
          onClick={onOpenNewLog}
          style={{
            ...primaryButton(styles),
            fontSize: 15,
            padding: '16px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            ...(hasPracticeTask
              ? {}
              : {
                  opacity: 0.42,
                  cursor: 'not-allowed',
                  background: styles.bgHighlight,
                  color: styles.textFaint,
                  border: `1px solid ${styles.border}`,
                }),
          }}
        >
          <Check size={16} strokeWidth={3} /> {t('today.ctaDone')}
        </button>
      )}

      <div style={{ marginTop: completedToday ? 16 : 14, fontSize: 12, color: styles.textFaint, textAlign: 'center', fontFamily: '"Noto Serif SC", serif', fontWeight: 600, letterSpacing: '0.06em', lineHeight: TAB_LH_BODY }}>
        {t('today.deferHint')}
      </div>
    </div>
  );
}
