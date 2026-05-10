/**
 * Mixed Latin + CJK: Latin uses Cormorant Garamond (italic); Han uses Noto Serif SC.
 * Kaiti stacks (e.g. LXGW) looked heavier than Cormorant—Noto Serif SC balances better.
 * Pair with fontStyle: 'italic' and fontSynthesis: 'none' so CJK stays upright.
 */
export const FONT_DISPLAY_MIXED = '"Cormorant Garamond", "Noto Serif SC", serif';

export const FONT_UI = '"Noto Serif SC", serif';

/** Default mixed display: modest weight so Chinese does not overpower thin italic Latin. */
export const displayMixedItalic = {
  fontFamily: FONT_DISPLAY_MIXED,
  fontStyle: 'italic',
  fontSynthesis: 'none',
  fontWeight: 500,
};

/** Inside MixedScriptBalance: slightly enlarge Latin, shrink CJK vs parent font-size. */
export const MIX_SCRIPT_LATIN_EM = 1.08;
export const MIX_SCRIPT_CJK_EM = 0.82;

/** Tab bodies: tighter default leading (was ~1.5–1.65). */
export const TAB_LH_TIGHT = 1.32;
export const TAB_LH_BODY = 1.38;
export const TAB_LH_META = 1.28;

/**
 * Plan card left rail (Main / Optional): fixed width + left align so short EN strings
 * don’t sit oddly when paired with longer labels.
 */
export function planSideLabelColumnStyle(styles, locale) {
  return {
    fontSize: 12,
    letterSpacing: locale === 'en' ? '0.05em' : '0.12em',
    color: styles.textFaint,
    fontFamily: '"Noto Serif SC", serif',
    fontWeight: 800,
    lineHeight: 1.25,
    flexShrink: 0,
    paddingTop: 2,
    width: locale === 'en' ? 84 : 52,
    textAlign: 'left',
    boxSizing: 'border-box',
  };
}
