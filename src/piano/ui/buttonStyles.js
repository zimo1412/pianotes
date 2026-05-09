/**
 * Inline button style factories (expect palette keys from `createAppStyles`).
 */

export function iconButton(styles) {
  return {
    width: 40,
    height: 40,
    borderRadius: 20,
    border: `1px solid ${styles.border}`,
    background: 'transparent',
    color: styles.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };
}

export function primaryButton(styles) {
  return {
    width: '100%',
    padding: '14px 0',
    background: styles.primaryBg,
    color: styles.primaryBgText,
    letterSpacing: '0.12em',
    fontSize: 14,
    fontFamily: '"Noto Serif SC", serif',
    fontWeight: 800,
    border: 'none',
    cursor: 'pointer',
  };
}

export function secondaryButton(styles) {
  return {
    flex: 1,
    padding: '14px 0',
    border: `1px solid ${styles.border}`,
    color: styles.text,
    background: 'transparent',
    letterSpacing: '0.12em',
    fontSize: 14,
    fontFamily: '"Noto Serif SC", serif',
    fontWeight: 800,
    cursor: 'pointer',
  };
}
