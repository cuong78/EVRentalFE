// ErrorMessageBox.tsx
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export const ErrorMessageBox = ({ message }: { message: string }) => {
    return (
        <Box display="flex" alignItems="center" gap={1} bgcolor="#fdecea" p={1.5} borderRadius={1}>
            <ErrorOutlineIcon sx={{ color: '#d32f2f' }} />
            <Typography variant="body2" color="#d32f2f">
                {message}
            </Typography>
        </Box>
    );
};
