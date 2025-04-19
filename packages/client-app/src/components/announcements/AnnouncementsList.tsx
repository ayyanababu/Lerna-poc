import React, { useState } from 'react';
import {
    ArrowForward,
    Newspaper as NewspaperIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { alpha, Avatar, Box, Link, Paper, Typography } from '@mui/material';
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
} from '../../themeUtils/colors/index';

import { AnnouncementListItemProps } from './types';

const AnnouncementsList: React.FC<AnnouncementListItemProps> = ({
    announcement,
}) => {
    const { isRead } = announcement;
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent =
        announcement.iconType === 'star' ? StarBorderIcon : NewspaperIcon;
    const { palette } = useTheme();

    const cardBackground =
        palette.mode === 'dark' ? darkGrey.A200 : palette.surface.main;
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
            className="announcementListItem"
            sx={{
                backgroundColor: `${cardBackground}`,
                boxShadow: `0px 0px 7px 0px ${cardShadow}`,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                },
            }}
            elevation={0}
            square
            component={Link}
            href={announcement.linkTo || '#'}
            underline="none"
            onMouseEnter={() => {
                setIsHovered(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

                    <Typography
                        variant="body1"
                        sx={{
                            color: `${
                                palette.mode === 'dark'
                                    ? darkGreen[50]
                                    : palette.text.secondary
                            }`,
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            maxHeight: '37.18px',
                            fontSize: '13px',
                            fontWeight: 400,
                            lineHeight: '18.59px',
                            letterSpacing: '0.25px',
                        }}>
                        {announcement.plainTitle}
                    </Typography>
                </Box>
                <Box
                    sx={{
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
                </Box>
            </Box>
            <Box className="listItemContentContainer">
                <Typography
                    sx={{
                        color: `${
                            palette.mode === 'dark'
                                ? darkGrey[100]
                                : lightGrey[600]
                        }`,
                        textTransform: 'capitalize',
                    }}
                    variant="overline"
                    className="cardDescription">
                    {announcement.description}
                </Typography>
            </Box>
        </Paper>
    );
};

export default AnnouncementsList;
