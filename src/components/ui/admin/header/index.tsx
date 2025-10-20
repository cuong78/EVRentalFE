import {
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

export const AdminHeader = () => {
  const { user, logout } = useAuth();
  
  // State cho menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(); 
    handleCloseMenu();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        px: 3,
        py: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left: User Info */}
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton onClick={handleOpenMenu}>
          <Avatar
            alt="User Avatar"
            src={user?.avatarUrl || 'https://i.pravatar.cc/40'}
             className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full shadow-md border border-gray-200"
          />
        </IconButton>
        <Box>
          <Typography fontWeight={600} color="text.primary">
            {user?.fullName || 'Không có tên'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.roles?.[0]?.roleName || 'Không rõ vai trò'}
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          px={1.5}
          py={0.5}
          bgcolor="grey.100"
          borderRadius="999px"
        >
          <CalendarTodayIcon fontSize="small" color="action" />
          <Typography variant="caption">
            {new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
            })}
          </Typography>
        </Box>

        {/* Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
        </Menu>
      </Box>

      {/* Center: Search */}
      <Box flex={1} mx={4}>
        <Paper
          component="form"
          sx={{
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '999px',
            border: '1px solid #e0e0e0',
            boxShadow: 1,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Tìm kiếm..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Paper>
      </Box>

      {/* Right: Notifications & Chat */}
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton>
          <Badge variant="dot" color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <IconButton>
          <ChatBubbleOutlineIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};
