/**
 * Segment editor modal (pieces, scales, checklist, tags).
 * PieceTagsInput is colocated (only used here).
 */

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../../locales/I18nProvider.jsx';
import {
  clampNum,
  createEmptyBlock,
  createEmptyBlockForEditor,
  deriveChecklistFromPieces,
  newChecklistRowId,
  normalizeBlock,
  normalizeTags,
  tagsFromCommaInput,
} from '../blockModel.js';
import { Modal } from '../ui/Modal.jsx';
import { iconButton, primaryButton, secondaryButton } from '../ui/buttonStyles.js';

function PieceTagsInput({ styles, isDark, tags, onChange, hint, placeholder }) {
  const inp = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${styles.border}`,
    borderRadius: 2,
    background: isDark ? styles.bgCard : '#fff',
    color: styles.text,
    fontSize: 13,
    fontFamily: '"Noto Serif SC", serif',
    boxSizing: 'border-box',
  };
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: styles.textFaint, marginBottom: 6, lineHeight: 1.45, fontWeight: 600 }}>{hint}</div>
      <input type="text" value={normalizeTags(tags).join(', ')} onChange={(e) => onChange(tagsFromCommaInput(e.target.value))} placeholder={placeholder} style={inp} />
    </div>
  );
}

export function BlockEditorModal({ styles, isDark, planEditor, blocks, onClose, onSave, onDelete }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(() => createEmptyBlock());

  useEffect(() => {
    if (!planEditor) return;
    if (planEditor.mode === 'add') setDraft(createEmptyBlockForEditor(t));
    else {
      const found = blocks.find((b) => b.id === planEditor.id);
      setDraft(normalizeBlock(found || createEmptyBlock()));
    }
  }, [planEditor, blocks, t]);

  if (!planEditor) return null;

  const inp = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${styles.border}`,
    borderRadius: 2,
    background: isDark ? styles.bgCard : '#fff',
    color: styles.text,
    fontSize: 14,
    fontFamily: '"Noto Serif SC", serif',
    boxSizing: 'border-box',
  };
  const lbl = { fontSize: 11, color: styles.textFaint, marginBottom: 6, display: 'block', fontWeight: 700 };

  function patchDraft(partial) {
    setDraft((d) => ({ ...d, ...partial }));
  }
  function patchOpt(slot, partial) {
    setDraft((d) => ({
      ...d,
      [slot]: { ...d[slot], ...partial },
    }));
  }
  return (
    <Modal styles={styles} onClose={onClose}>
      <h3 style={{ fontSize: 22, marginBottom: 16, color: styles.text, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 700 }}>
        {planEditor.mode === 'add' ? t('editor.addTitle') : t('editor.editTitle')}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <div>
          <label style={lbl}>{t('editor.titleLabel')}</label>
          <input value={draft.title} onChange={(e) => patchDraft({ title: e.target.value })} style={inp} placeholder={t('editor.titlePlaceholder')} />
        </div>
        <div>
          <label style={lbl}>{t('editor.weeksLabel')}</label>
          <input type="number" min={1} max={520} value={draft.weeks} onChange={(e) => patchDraft({ weeks: clampNum(e.target.value, 1, 520, 4) })} style={inp} />
        </div>
        <p style={{ fontSize: 11, color: styles.textFaint, margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
          {t('editor.focusRotationHint')}
        </p>
        <div>
          <label style={lbl}>{t('editor.mainALabel')}</label>
          <textarea value={draft.mainA} onChange={(e) => patchDraft({ mainA: e.target.value })} style={{ ...inp, minHeight: 44, resize: 'vertical' }} rows={2} />
        </div>
        <div>
          <label style={lbl}>{t('editor.mainBLabel')}</label>
          <textarea value={draft.mainB} onChange={(e) => patchDraft({ mainB: e.target.value })} style={{ ...inp, minHeight: 44, resize: 'vertical' }} rows={2} />
        </div>
        <div>
          <label style={lbl}>{t('editor.focusMinLabel')}</label>
          <input type="number" min={5} value={draft.focusMinutes} onChange={(e) => patchDraft({ focusMinutes: clampNum(e.target.value, 5, 300, 60) })} style={inp} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>{t('editor.scalesTitleLabel')}</label>
            <input value={draft.scalesLabel} onChange={(e) => patchDraft({ scalesLabel: e.target.value })} style={inp} placeholder={t('editor.scalesTitlePlaceholder')} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>{t('editor.scalesMinLabel')}</label>
            <input type="number" min={0} value={draft.scalesMinutes} onChange={(e) => patchDraft({ scalesMinutes: clampNum(e.target.value, 0, 120, 15) })} style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>{t('editor.scalesNoteLabel')}</label>
          <textarea value={draft.scalesNote} onChange={(e) => patchDraft({ scalesNote: e.target.value })} style={{ ...inp, minHeight: 52, resize: 'vertical' }} rows={2} placeholder={t('editor.scalesNotePlaceholder')} />
        </div>

        <div style={{ paddingTop: 8, borderTop: `1px solid ${styles.border}` }}>
          <div style={{ fontSize: 12, color: styles.accent, fontWeight: 800, marginBottom: 10 }}>{t('editor.opt1Title')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={draft.optA.label} onChange={(e) => patchOpt('optA', { label: e.target.value })} style={inp} placeholder={t('editor.optLabelPlaceholder')} />
            <textarea value={draft.optA.piece} onChange={(e) => patchOpt('optA', { piece: e.target.value })} style={{ ...inp, minHeight: 40 }} rows={2} placeholder={t('editor.piecePlaceholder')} />
            <label style={lbl}>{t('editor.minutesLabel')}</label>
            <input type="number" min={0} value={draft.optA.minutes} onChange={(e) => patchOpt('optA', { minutes: clampNum(e.target.value, 0, 180, 15) })} style={inp} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: styles.accent, fontWeight: 800, marginBottom: 10 }}>{t('editor.opt2Title')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={draft.optB.label} onChange={(e) => patchOpt('optB', { label: e.target.value })} style={inp} placeholder={t('editor.optLabelPlaceholderB')} />
            <textarea value={draft.optB.piece} onChange={(e) => patchOpt('optB', { piece: e.target.value })} style={{ ...inp, minHeight: 40 }} rows={2} placeholder={t('editor.piecePlaceholder')} />
            <label style={lbl}>{t('editor.minutesLabel')}</label>
            <input type="number" min={0} value={draft.optB.minutes} onChange={(e) => patchOpt('optB', { minutes: clampNum(e.target.value, 0, 180, 20) })} style={inp} />
          </div>
        </div>

        <div style={{ paddingTop: 8, borderTop: `1px solid ${styles.border}` }}>
          <div style={{ fontSize: 12, color: styles.accent, fontWeight: 800, marginBottom: 6 }}>{t('editor.checklistTitle')}</div>
          <p style={{ fontSize: 11, color: styles.textFaint, marginBottom: 12, lineHeight: 1.55, fontWeight: 600 }}>
            {t('editor.checklistHelp')}
          </p>
          <button type="button" onClick={() => patchDraft({ checklist: deriveChecklistFromPieces(draft) })} style={{ ...secondaryButton(styles), width: '100%', marginBottom: 12 }}>
            {t('editor.deriveChecklist')}
          </button>
          {(draft.checklist || []).map((row, idx) => (
            <div key={row.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input
                  value={row.label}
                  onChange={(e) => {
                    const rows = [...(draft.checklist || [])];
                    rows[idx] = { ...rows[idx], label: e.target.value };
                    patchDraft({ checklist: rows });
                  }}
                  style={{ ...inp, flex: 1 }}
                  placeholder={t('editor.rowPlaceholder')}
                />
                <button type="button" title={t('editor.deleteRow')} onClick={() => patchDraft({ checklist: (draft.checklist || []).filter((_, i) => i !== idx) })} style={{ ...iconButton(styles), width: 40, height: 40, flexShrink: 0, color: styles.textFaint }}>
                  <Trash2 size={16} strokeWidth={3} />
                </button>
              </div>
              <PieceTagsInput
                styles={styles}
                isDark={isDark}
                tags={normalizeTags(row.tags)}
                onChange={(next) => {
                  const rows = [...(draft.checklist || [])];
                  rows[idx] = { ...rows[idx], tags: next };
                  patchDraft({ checklist: rows });
                }}
                hint={t('editor.checklistTagsHint')}
                placeholder={t('editor.checklistTagsPlaceholder')}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => patchDraft({ checklist: [...(draft.checklist || []), { id: newChecklistRowId(), label: '', tags: [] }] })}
            style={{ ...secondaryButton(styles), width: '100%', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Plus size={16} strokeWidth={3} /> {t('editor.addRow')}
          </button>
        </div>

        <div>
          <label style={lbl}>{t('editor.noteLabel')}</label>
          <textarea value={draft.note} onChange={(e) => patchDraft({ note: e.target.value })} style={{ ...inp, minHeight: 64, resize: 'vertical' }} rows={3} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={() => onSave(draft)} style={primaryButton(styles)}>
          {t('editor.save')}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {planEditor.mode === 'edit' && (
            <button type="button" onClick={() => onDelete(draft.id)} style={{ ...secondaryButton(styles), flex: 1, color: styles.primary, borderColor: styles.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trash2 size={14} strokeWidth={3} /> {t('editor.delete')}
            </button>
          )}
          <button type="button" onClick={onClose} style={{ ...secondaryButton(styles), flex: planEditor.mode === 'edit' ? 1 : undefined, width: planEditor.mode === 'add' ? '100%' : undefined }}>
            {t('editor.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
