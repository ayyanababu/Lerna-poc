import { Box } from '@mui/material';
import {  darkGrey, lightGrey } from '../themeUtils/colors';

interface PageDotsProps {
    totalPages: number;
    activePage: number;
    scrollToPage: (index: number) => void;
}

const PageDots: React.FC<PageDotsProps> = ({ 
    totalPages, 
    activePage, 
    scrollToPage, 
}) => {
    return (
        <Box sx={{ 
            position: 'sticky',
            bottom: 20,
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            my: 2.5,
            mx: 'auto',
            py: 1.5,
            px: 2,
            backdropFilter: 'blur(40px)',
            borderRadius: 6,
            width: 'fit-content',
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#202529' : '#fafdfe',
            "&:hover > div": {
                width: "75px",
            }
        }}>
            {[...Array(totalPages)].map((_, index) => {
                const isActive = activePage === index;
                return (
                    <Box 
                        key={index}
                        onClick={() => scrollToPage(index)}
                        sx={{
                            width: isActive ? "75px" : "10px",
                            height: "10px",
                            padding: 0,
                            backgroundColor: 
                            theme => theme.palette.mode === 'dark' ? (
                                isActive ? darkGrey[400] : darkGrey[700]
                            ) : (
                                isActive ? lightGrey[600] : lightGrey[200]
                            ),
                            transition: 'all 0.25s ease-in-out',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            scale: 1,
                            '&:hover': {
                                width: "75px",
                                backgroundColor: 
                                theme => theme.palette.mode === 'dark' ?
                                darkGrey[400] : lightGrey[600],
                            },
                            '&:active': {
                                scale: 0.9,
                            }
                        }}
                    />
                );
            })}
        </Box>
    );
};

export default PageDots;