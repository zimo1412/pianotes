/**
 * Modal overlay + bottom-tab row button (kept together to reduce tiny modules).
 */

import { X } from 'lucide-react';

export function Modal({ styles, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding:
          'max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: styles.bg,
          width: '100%',
          maxWidth: 448,
          padding: 24,
          maxHeight: 'calc(85vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
          overflowY: 'auto',
          borderRadius: 16,
          border: `1px solid ${styles.borderSoft}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{ float: 'right', color: styles.textFaint, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} strokeWidth={3} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function TabButton({ styles, icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        color: active ? styles.text : styles.textFaint,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 0.2s',
      }}
    >
      {icon}
      <span style={{ fontSize: 10, letterSpacing: '0.12em', fontFamily: '"Noto Serif SC", serif', fontWeight: 800 }}>
        {label}
      </span>
    </button>
  );
}
