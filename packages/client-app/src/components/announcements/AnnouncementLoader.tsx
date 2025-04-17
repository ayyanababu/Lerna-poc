import { Box, alpha } from '@mui/material';
import { darkGrey } from '../../themeUtils/colors';

import './announcementsStyles.css';
// import {
//   cardBorderDark,
//   cardDashboardBoxShadow,
//   miniCardShadow,
// } from "../../../theme/index";

const miniCardShadow = '0px 0px 7px 0px rgba(0, 0, 0, 0.07)';
const cardDashboardBoxShadow =
    '51px 55px 21px 0px rgba(139, 187, 213, 0.00), 32px 35px 19px 0px rgba(139, 187, 213, 0.01), 18px 20px 16px 0px rgba(139, 187, 213, 0.05), 8px 9px 12px 0px rgba(139, 187, 213, 0.09), 2px 2px 7px 0px rgba(139, 187, 213, 0.10)';

const cardBorderDark = `1px solid ${alpha(darkGrey[700], 0.6)}`;

const AnnouncementLoader = () => (
    <Box
        sx={(theme) => ({
            ...(theme.palette.mode === 'dark'
                ? {
                      background: darkGrey[900],
                      border: cardBorderDark,
                  }
                : {
                      background: theme.palette.surface.main,
                      boxShadow: cardDashboardBoxShadow,
                  }),
        })}
        className="announcementsWrapper">
        <Box className="announcementsListWrapper">
            <Box
                sx={{
                    height: '20px',
                }}
                className="announcementsHeading"
            />
            <Box className="announcementsListWrapper">
                {[1, 2, 3].map((ele) => (
                    <Box
                        sx={{
                            background: (theme) => theme.palette.surface.main,
                            boxShadow: miniCardShadow,
                        }}
                        className="announcementCard"
                        key={ele}>
                        <Box sx={{ height: '19px' }} />
                    </Box>
                ))}
            </Box>
        </Box>
    </Box>
);

export default AnnouncementLoader;
