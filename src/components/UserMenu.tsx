import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const history = useHistory();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-icon"
        onClick={() => setOpen(v => !v)}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            minWidth: 140,
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => { setOpen(false); history.push('/settings'); }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              color: 'var(--fg)',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              color: 'var(--fg)',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
