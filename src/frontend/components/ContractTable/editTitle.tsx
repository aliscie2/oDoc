import React, { memo, useCallback, useState } from "react";
import { Box, TextField, Tooltip, Typography } from "@mui/material";
import { debounce } from "lodash";

// Metadata tooltip component
const MetadataTooltip = memo(({ metadata }) => (
  <Box>
    {Object.entries(metadata).map(([key, val]) => (
      <Typography key={key} variant="body2">
        {key}: {val instanceof Date ? val.toLocaleDateString() : val.toString()}
      </Typography>
    ))}
  </Box>
));

// Editable input component with debounced saving
const EditableInput = memo(({ value, onSave }) => {
  const [localValue, setLocalValue] = useState(value);

  const debouncedSave = useCallback(
    debounce((val) => onSave(val), 500),
    [onSave],
  );

  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedSave(newValue);
    },
    [debouncedSave],
  );

  const handleBlur = useCallback(() => {
    onSave(localValue);
  }, [localValue, onSave]);

  return (
    <TextField
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      size="small"
      variant="standard"
      autoFocus
      sx={{
        "& .MuiInputBase-input": {
          fontSize: "h6.fontSize",
          fontWeight: "h6.fontWeight",
        },
      }}
    />
  );
});

// Main editable title component
export const EditableTitle = memo(({ value, onChange, metadata }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = useCallback(
    (newValue) => {
      onChange(newValue);
      setIsEditing(false);
    },
    [onChange],
  );

  const handleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <Tooltip
      title={<MetadataTooltip metadata={metadata} />}
      placement="bottom-start"
    >
      <Box>
        {isEditing ? (
          <EditableInput value={value} onSave={handleSave} />
        ) : (
          <Typography
            variant="subtitle1"
            onClick={handleClick}
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
                borderRadius: 1,
                px: 1,
              },
              px: 1,
              fontWeight: 500,
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
});
