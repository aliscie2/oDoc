import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Button, 
  LinearProgress, 
  BottomNavigationAction,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from "@mui/material";
import { 
  Person2 as Person2Icon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { RootState } from "../../../redux/reducers";
import { useBackendContext } from "../../../contexts/BackendContext";
import DfnIcon from "@/assets/dfn.svg";


interface LoginButtonProps {
  isMobile?: boolean;
  sx?: React.CSSProperties | any;
}

const LoginButton: React.FC<LoginButtonProps> = (props) => {
  const {isMobile = false,sx = {}} = props;
  const { login } = useBackendContext();
  const { isFetching } = useSelector((state: RootState) => state.uiState);
  
  
  // For dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);


  const styles = {
    loginButton: {
      fontWeight: "bold",
      textTransform: "none",
      marginLeft: 1,
      borderRadius: 2,
      ...sx,
    },
    progressBar: {
      width: isMobile ? "100%" : 70,
      borderRadius: 2,
    },
    menuIcon: {
      width: 24,
      height: 24,
      marginRight: 1
    },
    disabledMenuItem: {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInternetIdentityLogin = async () => {
    await login();
    handleClose();
  };

  const handleMetaMaskLogin = async () => {
    // Disabled - do nothing
    return;
  };

  if (isFetching) {
    return <LinearProgress sx={styles.progressBar} />;
  }

  if (isMobile) {
    return (
      <>
        <BottomNavigationAction
          label="Login"
          icon={<Person2Icon />}
          onClick={handleClick}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={handleInternetIdentityLogin}>
            <ListItemIcon>
              <img 
                src={DfnIcon} 
                alt="Internet Identity" 
                style={styles.menuIcon} 
              />
            </ListItemIcon>
            <ListItemText>Internet Identity</ListItemText>
          </MenuItem>
          <Tooltip title="This feature coming soon" placement="left">
            <MenuItem 
              disabled
              sx={styles.disabledMenuItem}
            >
              <ListItemIcon>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png" 
                  alt="Ethereum" 
                  style={styles.menuIcon} 
                />
              </ListItemIcon>
              <ListItemText>Ethereum</ListItemText>
            </MenuItem>
          </Tooltip>
        </Menu>
      </>
    );
  }


  return (
    <>
      <Button
        
        variant="outlined"
        className="login"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={styles.loginButton}
        {...props}
      >
        Login
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleInternetIdentityLogin}>
          <ListItemIcon>
            <img 
              src={DfnIcon} 
              alt="Internet Identity" 
              style={styles.menuIcon} 
            />
          </ListItemIcon>
          <ListItemText>Internet Identity</ListItemText>
        </MenuItem>
        <Tooltip title="This feature coming soon" placement="left">
          <MenuItem 
            disabled
            sx={styles.disabledMenuItem}
          >
            <ListItemIcon>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png" 
                alt="Ethereum" 
                style={styles.menuIcon} 
              />
            </ListItemIcon>
            <ListItemText>Ethereum</ListItemText>
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
};
export default LoginButton;