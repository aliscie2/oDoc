import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../lib/theme-colors';
import { ChevronDown } from './Icons';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import UserAvatarMenu from '@/components/MainComponents/UserAvatarMenu';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { Tooltip } from '@mui/material';
import { Principal } from '@dfinity/principal';

interface UserSelectProps {
  value: string;
  onChange: (userName: string) => void;
  disabled?: boolean;
  showTooltip?: boolean;
}

export function UserSelect({ value, onChange, disabled, showTooltip = true }: UserSelectProps) {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const optionsListRef = useRef<HTMLDivElement>(null);
  
  const { all_friends, profile } = useSelector((state: RootState) => state.filesState);
  
  // Normalize value to string (in case it's a Principal object)
  const normalizedValue = (() => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'toString' in value) {
      return String(value);
    }
    return '';
  })();
  
  // Filter out current user from friends list and validate principals
  const availableFriends = (all_friends || [])
    .filter(friend => {
      if (friend.id === profile?.id) return false;
      // Validate that the ID is a valid principal
      try {
        Principal.fromText(friend.id);
        return true;
      } catch (error) {
        console.warn('Invalid principal in friends list:', friend.id, error);
        return false;
      }
    });
  
  // Filter friends based on search query
  const filteredFriends = availableFriends.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hasFriends = availableFriends.length > 0;
  const isDisabled = disabled || !hasFriends;

  // Add custom scrollbar styles when component mounts
  useEffect(() => {
    if (optionsListRef.current) {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .user-select-options::-webkit-scrollbar {
          width: 8px;
        }
        .user-select-options::-webkit-scrollbar-track {
          background: ${colors.bg};
          border-radius: 4px;
        }
        .user-select-options::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 4px;
        }
        .user-select-options::-webkit-scrollbar-thumb:hover {
          background: ${colors.textMuted};
        }
      `;
      document.head.appendChild(styleSheet);
      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, [colors]);

  const handleSelect = (userId: string) => {
    onChange(userId);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  const styles = getStyles(colors);

  const triggerButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!isDisabled) setIsOpen(!isOpen);
      }}
      disabled={isDisabled}
      style={{
        ...styles.trigger,
        ...(isDisabled ? styles.triggerDisabled : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
        <UserAvatarMenu
          key={normalizedValue}
          variant="caption"
          dispalyName={true}
          user_id={normalizedValue}
          disableMenu={true}
          sx={{ 
            width: 24, 
            height: 24,
            fontSize: '0.75rem'
          }}
        />
      </div>
      <ChevronDown size={14} style={{ marginLeft: '4px' }} />
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {!hasFriends && showTooltip ? (
          <Tooltip title="Make new friends to select from them" arrow>
            <span>{triggerButton}</span>
          </Tooltip>
        ) : (
          triggerButton
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-auto p-0"
        style={styles.dropdown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        {availableFriends.length > 2 && (
          <div style={styles.searchContainer}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                  } else if (e.key === 'Enter' && filteredFriends.length === 1) {
                    handleSelect(filteredFriends[0].id);
                  }
                }}
                style={styles.searchInput}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  style={styles.clearButton}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* Options List */}
        <div ref={optionsListRef} className="user-select-options" style={styles.optionsList}>
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(friend.id);
                }}
                onMouseEnter={() => setHoveredId(friend.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  ...styles.option,
                  ...(friend.id === normalizedValue ? styles.optionActive : {}),
                  ...(hoveredId === friend.id ? styles.optionHover : {}),
                }}
              >
                <UserAvatarMenu
                  variant="caption"
                  dispalyName={true}
                  user_id={friend.id}
                  disableMenu={true}
                  sx={{ 
                    width: 26, 
                    height: 26,
                    fontSize: '0.75rem'
                  }}
                />
              </button>
            ))
          ) : searchQuery ? (
            <div style={styles.emptyState}>
              No friends found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div style={styles.emptyState}>
              No friends available. Add friends to select them.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const getStyles = (colors: typeof lightTheme): Record<string, React.CSSProperties> => ({
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px 5px 5px',
    backgroundColor: colors.cardBg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    color: colors.text,
    minWidth: '140px',
    transition: 'all 0.2s ease',
  },
  triggerDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  avatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: colors.avatarBg,
    color: colors.avatarText,
    flexShrink: 0,
  },
  name: {
    flex: 1,
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dropdown: {
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
    minWidth: '220px',
    maxWidth: '320px',
  },
  searchContainer: {
    padding: '8px',
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky' as const,
    top: 0,
    backgroundColor: colors.cardBg,
    zIndex: 10,
  },
  searchInput: {
    width: '100%',
    padding: '6px 30px 6px 10px',
    fontSize: '13px',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    backgroundColor: colors.bg,
    color: colors.text,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  clearButton: {
    position: 'absolute' as const,
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: colors.textMuted,
    color: colors.bg,
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    transition: 'background-color 0.2s',
  },
  optionsList: {
    maxHeight: '280px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: colors.text,
    textAlign: 'left' as const,
    transition: 'background-color 0.15s',
  },
  optionActive: {
    backgroundColor: colors.accent,
    borderLeft: `2px solid ${colors.primary}`,
  },
  optionHover: {
    backgroundColor: colors.accentHover,
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: '13px',
  },
});
