import { useState, useEffect } from 'react';
import { X } from './Icons';
import { Condition } from '../types/contract';
import { useTheme } from '../contexts/ThemeContext';
import { lightTheme, darkTheme } from '../lib/theme-colors';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ConditionCellProps {
  condition: Condition;
  onUpdate: (id: string, fieldName: string, value: string) => void;
  onDelete: (id: string) => void;
  editable: boolean;
}

export function ConditionCell({ condition, onUpdate, onDelete, editable }: ConditionCellProps) {
  const { theme } = useTheme();
  const colors = theme === 'light' ? lightTheme : darkTheme;
  const [isEditingField, setIsEditingField] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [fieldName, setFieldName] = useState(condition.fieldName);
  const [value, setValue] = useState(condition.value);
  const [hasChanged, setHasChanged] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (condition.fieldName !== fieldName || condition.value !== value) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 500);
      return () => clearTimeout(timer);
    }
  }, [condition.fieldName, condition.value, fieldName, value]);

  const handleFieldBlur = () => {
    setIsEditingField(false);
    if (fieldName !== condition.fieldName) {
      onUpdate(condition.id, fieldName, value);
    }
  };

  const handleValueBlur = () => {
    setIsEditingValue(false);
    if (value !== condition.value) {
      onUpdate(condition.id, fieldName, value);
    }
  };

  const styles = getStyles(colors, hasChanged, isNew);

  return (
    <div style={styles.row}>
      <div style={styles.grid}>
        {editable && isEditingField ? (
          <input
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            onBlur={handleFieldBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleFieldBlur()}
            autoFocus
            style={styles.input}
          />
        ) : editable ? (
          <div
            onClick={() => setIsEditingField(true)}
            style={{
              ...styles.cell,
              ...styles.cellEditable,
            }}
          >
            {condition.fieldName}
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                style={{
                  ...styles.cell,
                  opacity: 0.8,
                  cursor: 'not-allowed',
                }}
              >
                {condition.fieldName}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cannot edit conditions in this state</p>
            </TooltipContent>
          </Tooltip>
        )}
        {editable && isEditingValue ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleValueBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleValueBlur()}
            autoFocus
            style={styles.input}
          />
        ) : editable ? (
          <div
            onClick={() => setIsEditingValue(true)}
            style={{
              ...styles.cell,
              ...styles.cellEditable,
              transform: hasChanged ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            {condition.value}
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                style={{
                  ...styles.cell,
                  opacity: 0.8,
                  cursor: 'not-allowed',
                }}
              >
                {condition.value}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cannot edit conditions in this state</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {editable ? (
        <button onClick={() => onDelete(condition.id)} style={styles.deleteBtn}>
          <X size={14} />
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button style={{...styles.deleteBtn, opacity: 0.3, cursor: 'not-allowed'}} disabled>
              <X size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cannot delete conditions in this state</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

const getStyles = (colors: typeof lightTheme, hasChanged: boolean, isNew: boolean): Record<string, React.CSSProperties> => ({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderTop: `1px solid ${colors.borderLight}`,
    backgroundColor: hasChanged ? colors.accent : 'transparent',
    opacity: isNew ? 0 : 1,
    transform: isNew ? 'translateX(-20px)' : 'translateX(0)',
    transition: 'all 0.3s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '12px',
    flex: 1,
  },
  cell: {
    padding: '5px 8px',
    fontSize: '13px',
    color: colors.text,
    borderRadius: '4px',
    fontWeight: 500,
  },
  cellEditable: {
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '5px 8px',
    border: `2px solid ${colors.primary}`,
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: colors.inputBg,
    color: colors.text,
    fontWeight: 500,
    transition: 'border-color 0.2s ease',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    color: colors.textMuted,
    display: 'flex',
    alignItems: 'center',
  },
});
