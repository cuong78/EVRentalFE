import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-blue-100"
        >
            <Box className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center">
                <Typography variant="h2" className="font-bold text-red-500 mb-2">
                    404
                </Typography>
                <Typography variant="h5" className="mb-4 text-gray-700">
                    Oops! Page not found.
                </Typography>
                <Typography className="mb-6 text-gray-500 text-center">
                    The page you are looking for might have been removed or is temporarily unavailable.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/')}
                >
                    Go to Home
                </Button>
            </Box>
        </Box>
    );
};