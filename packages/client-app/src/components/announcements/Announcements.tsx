import { useCallback, useEffect, useRef, useState } from 'react';
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
import './announcementsStyles.css';
import MegaPhoneIcon from './icon/megaphone';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementListItem from './AnnouncementsList';
import { ANNOUNCEMENTS, VIEW_LESS, VIEW_MORE } from '../../constants/common';
import { darkPrimaryBlue, lightPrimaryBlue } from '../../themeUtils/colors';
import { AnnouncementData, ProcessedAnnouncement } from './types';
import mockdata from './mockdata';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>(
        {},
    );
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

                const containerRect = listRef.current.getBoundingClientRect();
                const newVisibleItems: Record<string, boolean> = {};

                const children = Array.from(
                    listRef.current.children,
                ) as HTMLElement[];
                children.forEach((child) => {
                    const id = child.dataset.id;
                    if (id) {
                        const childRect = child.getBoundingClientRect();

                        const isFullyVisible =
                            childRect.left >= containerRect.left - 5 &&
                            childRect.right <= containerRect.right + 5;
                        newVisibleItems[id] = isFullyVisible;
                    }
                });

                setVisibleItems(newVisibleItems);
            } else {
                setCanScrollLeft(false);
                setCanScrollRight(false);
                setVisibleItems({});
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
            <Typography
                variant="subtitle2"
                sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    lineHeight: '20px',
                    letterSpacing: '0.25px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
                color={palette.text.primary}>
                {ANNOUNCEMENTS}
            </Typography>
        </Box>
    );

    return (
        <Paper
            sx={{
                backgroundColor: palette.background.paper,
                outline: `1px solid ${alpha(palette.divider, 0.6)}`,
                width: '100%',
                borderRadius: '12px',
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

            <Box
                ref={listRef}
                className={isExpanded ? 'listContainer' : 'cardList'}
                onScroll={isExpanded ? undefined : updateScrollState}>
                {displayData.map((announcement, index) => (
                    <Box
                        key={`${announcement.id}`}
                        data-id={announcement.id}
                        sx={
                            isExpanded
                                ? {
                                      width: '100%',
                                  }
                                : {
                                      width: 'calc(50% - 17.75px)',
                                      flexShrink: 0,
                                      scrollSnapAlign: 'start',
                                      scrollMargin: '0 0 0 12px',
                                      scrollBehavior: 'smooth',
                                      transition: 'all 0.25s ease-in-out',
                                      paddingLeft: index === 0 ? '12px' : '0',
                                      paddingRight:
                                          index === processedData.length - 1
                                              ? '12px'
                                              : '0',
                                      transform: visibleItems[announcement.id]
                                          ? 'scaleY(1)'
                                          : 'scaleY(0.9)',
                                  }
                        }>
                        {isExpanded ? (
                            <AnnouncementListItem announcement={announcement} />
                        ) : (
                            <AnnouncementCard announcement={announcement} />
                        )}
                    </Box>
                ))}
            </Box>

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
        </Paper>
    );
};

export default Announcements;
