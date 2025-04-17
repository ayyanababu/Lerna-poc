import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
    alpha,
    Box,
    IconButton,
    Paper,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import './announcementsStyles.css';
import MegaPhoneIcon from './icon/megaphone';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementListItem from './AnnouncementsList';
import { ANNOUNCEMENTS, VIEW_LESS, VIEW_MORE } from '../../constants/common';
import { darkPrimaryBlue, lightPrimaryBlue } from '../../themeUtils/colors';
import { AnnouncementData, ProcessedAnnouncement } from './types';
import mockdata from './mockdata';

const MotionPaper = motion(Paper);

const processAnnouncements = (
    data: AnnouncementData[],
): ProcessedAnnouncement[] => {
    const now = new Date();

    return data
        .filter((ann) => {
            try {
                const expiryDate = new Date(ann.expiry);
                return !Number.isNaN(expiryDate.getTime()) && expiryDate >= now;
            } catch {
                return false;
            }
        })
        .sort((a, b) => {
            try {
                const dateA = new Date(a.publicationDate);
                const dateB = new Date(b.publicationDate);
                if (Number.isNaN(dateA.getTime())) return 1;
                if (Number.isNaN(dateB.getTime())) return -1;
                return dateB.getTime() - dateA.getTime(); // Descending sort (Newest First)
            } catch {
                return 0;
            }
        })
        .map((ann, index) => {
            let plainTitle = ann.title;
            if (typeof document !== 'undefined') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = ann.title;
                plainTitle = tempDiv.textContent || tempDiv.innerText || '';
            } else {
                plainTitle = ann.title.replace(/<[^>]*>?/gm, '');
            }

            return {
                ...ann,
                iconType: index % 2 === 0 ? 'star' : 'newspaper',
                plainTitle,
            };
        });
};

const Announcements = () => {
    //   const {
    //     announcements,
    //     announcementsLoaded,
    //     updateAnnouncementsinDashboardSettings,
    //   } = useDashboardStore();
    const [processedData, setProcessedData] = useState<ProcessedAnnouncement[]>(
        [],
    );

    const { breakpoints, palette } = useTheme();
    const muiTheme = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const isSmallScreen = useMediaQuery(breakpoints.down('sm'));
    const initialVisibleCount = isSmallScreen ? 2 : 3;

    useEffect(() => {
        const data = processAnnouncements(mockdata);
        setProcessedData(data);
    }, []);

    const updateScrollState = useCallback(() => {
        requestAnimationFrame(() => {
            if (!isExpanded && listRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } =
                    listRef.current;
                const tolerance = 1;
                setCanScrollLeft(scrollLeft > tolerance);
                setCanScrollRight(
                    scrollLeft < scrollWidth - clientWidth - tolerance,
                );
            } else {
                setCanScrollLeft(false);
                setCanScrollRight(false);
            }
        });
    }, [isExpanded]);

    useEffect(() => {
        const timer = setTimeout(updateScrollState, 50);
        window.addEventListener('resize', updateScrollState);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [processedData, isExpanded, updateScrollState]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (!isExpanded && listRef.current) {
            const containerWidth = listRef.current.clientWidth;
            const scrollAmount = containerWidth * 0.8; // Adjust multiplier (e.g., 0.8)
            const currentScroll = listRef.current.scrollLeft;
            const newScroll =
                direction === 'left'
                    ? currentScroll - scrollAmount
                    : currentScroll + scrollAmount;
            listRef.current.scrollLeft = newScroll;
            setTimeout(updateScrollState, 10);
        }
    };

    const handleViewAll = () => setIsExpanded(true);
    const handleViewLess = () => {
        setIsExpanded(false);
        setTimeout(updateScrollState, 50);
    };

    // const markRead = (id: string) => {
    //     updateAnnouncementsinDashboardSettings(id);
    // };
    const displayData: ProcessedAnnouncement[] = processedData;

    // if (!announcementsLoaded) {
    //     return <AnnouncementLoader />;
    // }
    // if (!announcements || !announcements.length) {
    //     return null;
    // }

    const hederIconbackground =
        palette.mode === 'dark' ? darkPrimaryBlue[800] : lightPrimaryBlue[400];
    const hederIconHoverbackground =
        palette.mode === 'dark' ? darkPrimaryBlue[700] : darkPrimaryBlue[700];
    const hederIconbackText =
        palette.mode === 'dark' ? darkPrimaryBlue[200] : lightPrimaryBlue[100];

    const renderHeader = () => (
        <Box className="announcementsHeading">
            <MegaPhoneIcon
                color="secondary"
                sx={{ width: '20px', height: '20px' }}
            />
            <Typography variant="subtitle2" color={palette.text.primary}>
                {ANNOUNCEMENTS}
            </Typography>
        </Box>
    );

    return (
        <AnimatePresence>
            <MotionPaper
                sx={{
                    backgroundColor: palette.background.paper,
                    outline: `1px solid ${alpha(palette.divider, 0.6)}`,
                    width: '100%',
                }}
                className="widgetContainer"
                elevation={0}
                square>
                {/* Header */}
                <Box className="header">
                    {renderHeader()}
                    <Box className="headerActionsContainer">
                        {!isExpanded && (
                            <>
                                {canScrollLeft && (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleScroll('left')}
                                        disabled={!canScrollLeft}
                                        aria-label="Scroll previous announcements"
                                        sx={{
                                            backgroundColor: `${hederIconbackground}`,
                                            width: 24,
                                            height: 24,
                                            padding: 0,
                                            '&:hover': {
                                                backgroundColor: `${hederIconHoverbackground}`,
                                            },
                                        }}>
                                        <ChevronLeftIcon
                                            sx={{
                                                color: `${hederIconbackText}`,
                                            }}
                                        />
                                    </IconButton>
                                )}

                                {canScrollRight && (
                                    <IconButton
                                        size="small"
                                        onClick={() => handleScroll('right')}
                                        disabled={!canScrollRight}
                                        aria-label="Scroll next announcements"
                                        sx={{
                                            backgroundColor: `${hederIconbackground}`,
                                            width: 24,
                                            height: 24,
                                            padding: 0,
                                            '&:hover': {
                                                backgroundColor: `${hederIconHoverbackground}`,
                                                cursor: 'pointer',
                                            },
                                        }}>
                                        <ChevronRightIcon
                                            sx={{
                                                color: `${hederIconbackText}`,
                                            }}
                                        />
                                    </IconButton>
                                )}
                            </>
                        )}
                    </Box>
                </Box>

                {/* Announcements List/Carousel Container */}
                <LayoutGroup>
                    <Box
                        ref={listRef}
                        className={isExpanded ? 'listContainer' : 'cardList'}
                        onScroll={isExpanded ? undefined : updateScrollState}>
                        {displayData.map((announcement) => (
                            <motion.div
                                key={`${announcement.id}`}
                                className={
                                    isExpanded
                                        ? 'announcementListItemMotionWrapper'
                                        : 'announcementCardMotionWrapper'
                                }
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{
                                    y: -2,
                                    transition: {
                                        duration: 0.3,
                                    },
                                }}>
                                {isExpanded ? (
                                    <AnnouncementListItem
                                        announcement={announcement}
                                    />
                                ) : (
                                    <AnnouncementCard
                                        announcement={announcement}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </Box>
                </LayoutGroup>

                {processedData.length > initialVisibleCount && (
                    <Typography
                        variant="caption"
                        color="secondary.dark"
                        component="span"
                        onClick={isExpanded ? handleViewLess : handleViewAll}
                        sx={{
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            fontSize: '12px',
                            fontWeight: 400,
                            lineHeight: '17.16px',
                            letterSpacing: '0.40px',
                            padding: '4px 0',
                            marginTop: '4px',
                            display: 'inline-block',
                            '&:hover': {
                                opacity: 0.7,
                                textDecoration: 'underline',
                            },
                        }}
                        className="view-toggle"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (isExpanded) {
                                    handleViewLess();
                                } else {
                                    handleViewAll();
                                }
                            }
                        }}
                        aria-expanded={isExpanded}>
                        {isExpanded ? VIEW_LESS : VIEW_MORE}
                    </Typography>
                )}
            </MotionPaper>
        </AnimatePresence>
    );
};

export default Announcements;
