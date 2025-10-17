import { MouseEvent, ReactNode, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Box, ListItemIcon, ListItemText, Divider } from "@mui/material";

interface MenuOption {
  content: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  preventClose?: boolean;
  pure?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  options: MenuOption[];
  onClick?: (event: MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

export default function ContextMenu({
  children,
  options,
  onClick,
  className,
  disabled = false,
}: ContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (event: MouseEvent) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX + 2, y: event.clientY - 6 });
  };

  const handleClose = () => setContextMenu(null);

  const handleItemClick = (item: MenuOption) => {
    if (!item.preventClose) handleClose();
    item.onClick?.();
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      style={{ cursor: disabled ? "default" : "context-menu" }}
      className={className}
    >
      {children}
      <Menu
        open={!!contextMenu}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined
        }
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 2,
              py: 0.5,
            },
          },
        }}
      >
        {options.map((item, i) => (
          <Box key={i}>
            {item.pure ? (
              <Box onClick={() => handleItemClick(item)} sx={{ px: 2, py: 1 }}>
                {item.content}
              </Box>
            ) : (
              <MenuItem
                onClick={() => handleItemClick(item)}
                sx={{ px: 2, gap: 1.5 }}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: "auto" }}>
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText primary={item.content} />
              </MenuItem>
            )}
            {item.divider && <Divider />}
          </Box>
        ))}
      </Menu>
    </div>
  );
}
