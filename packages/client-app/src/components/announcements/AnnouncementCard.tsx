import React, { useState } from 'react';
import {
    ArrowForward,
    Newspaper as NewspaperIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { alpha, Avatar, Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    darkGreen,
    darkGrey,
    darkPrimaryBlue,
    darkPurple,
    lightGreen,
    lightGrey,
    lightPrimaryBlue,
    lightPurple,
} from '../../themeUtils/colors';
import { Typography } from '@mui/material';

import { AnnouncementCardProps } from './types';

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
    announcement,
}) => {
    const { isRead } = announcement;
    const [isHovered, setIsHovered] = useState(false);

    const IconComponent =
        announcement.iconType === 'star' ? StarBorderIcon : NewspaperIcon;

    const { palette } = useTheme();

    const cardBackground =
        palette.mode === 'dark' ? darkGrey.A200 : palette.surface.main;
    const cardHoverBackground =
        palette.mode === 'dark' ? '#3A434B' : lightGrey[50];
    const cardShadow =
        palette.mode === 'dark'
            ? alpha(palette.common.black, 0.07)
            : alpha(palette.common.black, 0.07);

    let cardIconBg = {
        backgroundColor:
            palette.mode === 'dark' ? darkPurple[300] : lightPurple[400],
        color: palette.mode === 'dark' ? darkPurple[700] : lightPurple[50],
    };
    if (announcement.iconType === 'star') {
        cardIconBg = {
            backgroundColor:
                palette.mode === 'dark' ? darkGreen[300] : lightGreen[400],
            color: palette.mode === 'dark' ? darkGreen[700] : lightGreen[50],
        };
    }

    return (
        <Paper
            className="announcementCard"
            sx={{
                backgroundColor: `${cardBackground}`,
                boxShadow: `0px 0px 7px 0px ${cardShadow} !important`,
                '&:hover': {
                    backgroundColor: `${cardHoverBackground}`,
                    cursor: 'pointer',
                },
            }}
            elevation={0}
            square>
            <Box
                className="cardContentContainer"
                sx={{
                    '&:hover': {
                        cursor: 'pointer',
                    },
                    gap: '4px',
                }}
                onMouseEnter={() => {
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <Avatar
                        sx={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            ...cardIconBg,
                        }}>
                        <IconComponent
                            fontSize="small"
                            sx={{ fontSize: '16px' }}
                        />
                    </Avatar>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.3s ease-in-out',
                        }}>
                        {!isRead && (
                            <span
                                className="badge"
                                style={{
                                    display: 'inline-block',
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        palette.mode === 'dark'
                                            ? darkPrimaryBlue[500]
                                            : lightPrimaryBlue[500],
                                    border: `2px solid ${
                                        palette.mode === 'dark'
                                            ? palette.common.black
                                            : lightGrey[50]
                                    }`,
                                }}
                            />
                        )}
                        {isHovered && (
                            <ArrowForward
                                sx={{
                                    width: '16px',
                                    height: '16px',
                                    color: `${
                                        palette.mode === 'dark'
                                            ? lightGrey[600]
                                            : lightGrey[500]
                                    }`,
                                    transition: 'opacity 0.3s ease-in-out',
                                }}
                            />
                        )}
                    </div>
                </div>
                <Typography
                    variant="body1"
                    className="cardTitle"
                    sx={{
                        lineHeight: 'unset',
                        color: `${
                            palette.mode === 'dark'
                                ? darkGreen[50]
                                : palette.text.secondary
                        }`,
                    }}>
                    {announcement.plainTitle}
                </Typography>
                <Typography
                    sx={{
                        lineHeight: 'unset',
                        color: `${
                            palette.mode === 'dark'
                                ? darkGrey[100]
                                : lightGrey[600]
                        }`,
                        textTransform: 'none',
                    }}
                    variant="overline"
                    className="cardDescription">
                    {announcement.description}
                </Typography>
            </Box>
        </Paper>
    );
};

export default AnnouncementCard;
