import { useMemo } from 'react';
import { segmentMixedScript } from '../mixedScript.js';
import { MIX_SCRIPT_CJK_EM, MIX_SCRIPT_LATIN_EM } from '../typography.js';

/**
 * Per-script em scaling so CJK does not tower over thin italic Latin in one line.
 */
export function MixedScriptBalance({ children, style, latinEm = MIX_SCRIPT_LATIN_EM, cjkEm = MIX_SCRIPT_CJK_EM }) {
  const str = children == null ? '' : String(children);
  const parts = useMemo(() => segmentMixedScript(str), [str]);

  return (
    <span style={style}>
      {parts.map((p, i) => (
        <span
          key={i}
          style={
            p.type === 'cjk'
              ? { fontSize: `${cjkEm}em`, letterSpacing: '0.02em' }
              : { fontSize: `${latinEm}em` }
          }
        >
          {p.text}
        </span>
      ))}
    </span>
  );
}
