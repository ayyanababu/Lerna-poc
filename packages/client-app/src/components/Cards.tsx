import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Paper,
    Box,
    Typography,
    IconButton,
    Link,
    Avatar,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Campaign as CampaignIcon,
    StarBorder as StarBorderIcon,
    Newspaper as NewspaperIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// --- Sample JSON Data ---
const jsonData = {
    announcements: [
        {
            id: '2023-05-10T14:30:25.123Z',
            title: 'New landing page for opterra',
            expiry: '2025-12-30',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-21',
        },
        {
            id: '2023-05-10T15:45:30.124Z',
            title: '<i>New global settings page ???</i>',
            expiry: '2025-12-30',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-22',
        },
        {
            id: '2024-05-10T16:20:15.787Z',
            title: 'An easier way to bulk import trades',
            expiry: '2025-12-24',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-23',
        },
        {
            id: '2023-05-10T16:20:15.999Z',
            title: 'New landing page for opterra',
            expiry: '2025-11-29',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-24',
        },
        {
            id: '2023-05-10T16:20:15.989Z',
            title: 'Import Transaction to one click',
            expiry: '2025-12-30',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-25',
        },
        {
            id: '2024-05-10T16:20:15.979Z',
            title: 'Security application got a brand new refresh',
            expiry: '2025-12-30',
            linkTo: '/',
            description:
                'Announcement description contains additional info and can be two lines long like this.?',
            publicationDate: '2025-03-26',
        },
        {
            id: '2023-05-10T14:31:25.123Z',
            title: 'Testing Announcemnts',
            expiry: '2025-12-30',
            linkTo: '/',
            description: 'Announcement testsing',
            publicationDate: '2025-04-10',
        },
    ],
};

// --- CSS Styles ---
const styles = `
/* Define CSS Variables */
:root {
    --Grey-dark-A-200: #31393F;
    --Semantic-Colors-Primary-Text: #E4E7EB;
    --Green-dark-50: #F1F9F1;
    --Green-dark-300: #A3D6A6;
    --Green-dark-700: #3D7040;
    --Purple-dark-300: #DFC8FD;
    --Purple-dark-700: #796297;
    --Semantic-Colors-Secondary: #C9A3FC;
    --Semantic-Colors-Primary: #90CAF9;
    --Semantic-Colors-Background: #202529;
    --Primary-blue-dark-200: #D3EAFD;
    --Primary-blue-dark-700: #567995;
    --Primary-blue-dark-800: #3A5164;
    --Icon-Button-Disabled-Opacity: 0.5;
    --Semantic-Colors-Primary-dark-Hover: #BCDFFB;
    --Outline-Color: rgba(62, 76, 89, 0.60);
    --Card-Shadow: 0px 0px 7px rgba(0, 0, 0, 0.07);
    --List-Item-Hover-Bg: rgba(255, 255, 255, 0.05);
}

.widgetContainer {
    // width: 361px;
    padding: 12px;
    background-color: var(--Semantic-Colors-Background);
    border-radius: 12px;
    outline: 1px solid var(--Outline-Color);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Important: Clips the peeking cards */
    font-family: Roboto, sans-serif;
    box-sizing: border-box;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 4px; /* Add slight padding to align buttons visually */
    box-sizing: border-box;
}

.headerTitleContainer {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--Semantic-Colors-Primary-Text);
    flex-shrink: 1; /* Allow title to shrink if needed */
    overflow: hidden;
}

.headerTitleText {
    font-size: 13px;
    font-weight: 500;
    line-height: 19.5px;
    letter-spacing: 0.25px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.headerActionsContainer {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0; /* Prevent buttons shrinking */
}

.headerIconButton {
    background-color: var(--Primary-blue-dark-700) !important;
    width: 24px;
    height: 24px;
    padding: 0 !important;
}
.headerIconButton:hover {
    background-color: var(--Primary-blue-dark-800) !important;
}
.headerIconButton:disabled {
    opacity: var(--Icon-Button-Disabled-Opacity) !important;
    background-color: var(--Primary-blue-dark-800) !important;
    cursor: not-allowed !important; /* Indicate disabled state */
}

.headerIconButton .MuiSvgIcon-root {
    color: var(--Primary-blue-dark-200) !important;
    font-size: 18px !important;
}

/* Card List (Carousel View) */
.cardList {
    display: flex;
    gap: 8px;
    margin: 0 -12px;
    padding: 8px 0px;
    box-sizing: border-box;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;

    /* Hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
}
    
.announcementCardMotionWrapper:nth-child(1) {
    padding-left: 12px; /* Align first card with header */
}
.announcementCardMotionWrapper:nth-last-child(1) {
    padding-right: 12px; /* Align last card with header */
}
.announcementCardMotionWrapper {
    scroll-margin: 0 0 0 12px; /* Align first card with header */
    transition: all 0.2s ease-in-out;
}
.cardList::-webkit-scrollbar {
    display: none;
}

/* List Container (Expanded View) */
.listContainer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 0px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
}
.listContainer::-webkit-scrollbar {
    width: 4px;
    display: block;
}
.listContainer::-webkit-scrollbar-track {
    background: transparent;
}
.listContainer::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}


.announcementCardMotionWrapper {
    flex-shrink: 0;
    scroll-snap-align: start; /* Optional: Snap alignment */
}
.announcementListItemMotionWrapper {
     width: 100%; /* Ensures list item takes full width */
}


/* Announcement Card (Carousel Item) */
.announcementCard {
    width: 164px;
    min-width: 164px;
    height: 140px;
    background-color: var(--Grey-dark-A-200);
    border-radius: 12px !important;
    box-shadow: var(--Card-Shadow) !important;
    padding: 12px !important;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
}

.cardContentContainer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    flex-grow: 1;
}

.cardIcon {
    width: 24px !important;
    height: 24px !important;
    border-radius: 6px !important;
}
.cardIcon svg {
    font-size: 16px;
}

.starIconBg {
    background-color: var(--Green-dark-300) !important;
    color: var(--Green-dark-700) !important;
}

.newspaperIconBg {
    background-color: var(--Purple-dark-300) !important;
    color: var(--Purple-dark-700) !important;
}

.cardTitle {
    font-size: 13px !important;
    font-weight: 400 !important;
    line-height: 18.59px !important;
    letter-spacing: 0.25px !important;
    color: var(--Green-dark-50) !important;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-height: 37.18px;
}

.cardDescription {
    font-size: 10px !important;
    font-weight: 400 !important;
    line-height: 16.5px !important;
    letter-spacing: 0.40px !important;
    color: var(--Semantic-Colors-Primary-Text) !important;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    max-height: 49.5px;
    flex-grow: 1;
}

/* Announcement List Item (Expanded View) */
.announcementListItem {
    width: 100%; 
    display: flex;
    gap: 8px;
    padding: 12px !important;
    position: relative;
    cursor: pointer;
    box-sizing: border-box;
    background-color: var(--Grey-dark-A-200);
    border-radius: 12px !important;
    box-shadow: var(--Card-Shadow) !important;
}

.listItemContentContainer {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
}

.listItemTitle {
    font-size: 13px !important;
    font-weight: 400 !important;
    letter-spacing: 0.25px !important;
    color: var(--Green-dark-50) !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.listItemDescription {
    font-size: 10px !important;
    font-weight: 400 !important;
    line-height: 16.5px !important;
    letter-spacing: 0.40px !important;
    color: var(--Semantic-Colors-Primary-Text) !important;

}


/* Badge positioning */
.badgeWrapperCard .MuiBadge-badge { /* Badge on Card */
    display: block !important;
    background-color: var(--Semantic-Colors-Primary) !important;
    border: 2px solid var(--Semantic-Colors-Background) !important;
    width: 12px;
    height: 12px;
    min-width: 12px;
    border-radius: 9999px;
    right: 18px !important;
    top: 18px !important;
}
.badge {
    background-color: var(--Semantic-Colors-Primary) !important;
    border: 2px solid var(--Semantic-Colors-Background) !important;
    width: 10px;
    height: 10px;
    min-width: 10px;
    border-radius: 9999px;
    right: 10px !important;
    top: 50% !important;
    margin-left: auto !important;
    margin-bottom: auto !important;
} 

.actionLink {
    font-size: 12px !important;
    font-weight: 400 !important;
    line-height: 17.16px !important;
    letter-spacing: 0.40px !important;
    color: var(--Semantic-Colors-Primary-dark-Hover) !important;
    cursor: pointer;
    align-self: flex-start;
    text-decoration: none !important;
    padding: 0 4px; /* Align with header buttons */
}
.actionLink:hover {
    text-decoration: underline !important;
}

/* Megaphone Icon specific styles */
.megaphoneIcon {
    color: var(--Semantic-Colors-Secondary);
}
`;

// --- TypeScript Interfaces ---
interface AnnouncementData {
    id: string;
    title: string;
    expiry: string; // Date string
    linkTo: string;
    description: string;
    publicationDate: string; // Date string
}

interface ProcessedAnnouncement extends AnnouncementData {
    iconType: 'star' | 'newspaper';
    plainTitle: string; // Title without HTML
}

// --- Utility Functions ---
const processAnnouncements = (
    data: AnnouncementData[],
): ProcessedAnnouncement[] => {
    const now = new Date();

    return data
        .filter((ann) => {
            try {
                const expiryDate = new Date(ann.expiry);
                return !isNaN(expiryDate.getTime()) && expiryDate >= now;
            } catch {
                return false;
            }
        })
        .sort((a, b) => {
            try {
                const dateA = new Date(a.publicationDate);
                const dateB = new Date(b.publicationDate);
                if (isNaN(dateA.getTime())) return 1;
                if (isNaN(dateB.getTime())) return -1;
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

// --- React Components ---

// Card Component (Carousel View)
interface AnnouncementCardProps {
    announcement: ProcessedAnnouncement;
}
const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
    announcement,
}) => {
    const IconComponent =
        announcement.iconType === 'star' ? StarBorderIcon : NewspaperIcon;
    const iconBgClass =
        announcement.iconType === 'star' ? 'starIconBg' : 'newspaperIconBg';

    return (
        <MotionPaper
            className="announcementCard"
            elevation={0}
            square
            layoutId={`announcement-${announcement.id}`}>
            <Box className="cardContentContainer">
                <motion.div style={{ display: 'flex' }}>
                    <MotionAvatar
                        className={`cardIcon ${iconBgClass}`}
                        layoutId={`icon-${announcement.id}`}>
                        <IconComponent fontSize="small" />
                    </MotionAvatar>

                    <motion.div
                        layoutId={`badge-${announcement.id}`}
                        className="badge"></motion.div>
                </motion.div>
                <MotionTypography
                    variant="subtitle2"
                    className="cardTitle"
                    layoutId={`title-${announcement.id}`}>
                    {announcement.plainTitle}
                </MotionTypography>
                <MotionTypography
                    variant="body2"
                    className="cardDescription"
                    layoutId={`description-${announcement.id}`}>
                    {announcement.description}
                </MotionTypography>
            </Box>
        </MotionPaper>
    );
};

// List Item Component (Expanded View)
interface AnnouncementListItemProps {
    announcement: ProcessedAnnouncement;
}
const MotionTypography = motion(Typography);
const MotionAvatar = motion(Avatar);
const MotionPaper = motion(Paper);
const AnnouncementListItem: React.FC<AnnouncementListItemProps> = ({
    announcement,
}) => {
    const IconComponent =
        announcement.iconType === 'star' ? StarBorderIcon : NewspaperIcon;
    const iconBgClass =
        announcement.iconType === 'star' ? 'starIconBg' : 'newspaperIconBg';

    //
    return (
        <MotionPaper
            className="announcementListItem"
            elevation={0}
            square
            // @ts-expect-error error will come here
            component={Link}
            href={announcement.linkTo || '#'}
            underline="none"
            layoutId={`announcement-${announcement.id}`}
            sx={{
                display: 'flex',
                flexDirection: 'column',
            }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'start',
                }}>
                <MotionAvatar
                    className={`cardIcon ${iconBgClass}`}
                    layoutId={`icon-${announcement.id}`}>
                    <IconComponent fontSize="small" />
                </MotionAvatar>

                <MotionTypography
                    variant="subtitle2"
                    className="listItemTitle"
                    layoutId={`title-${announcement.id}`}>
                    {announcement.plainTitle}
                </MotionTypography>

                <motion.div
                    layoutId={`badge-${announcement.id}`}
                    className="badge"></motion.div>
            </Box>
            <Box className="listItemContentContainer">
                <MotionTypography
                    variant="body2"
                    className="listItemDescription"
                    layoutId={`description-${announcement.id}`}>
                    {announcement.description}
                </MotionTypography>
            </Box>
        </MotionPaper>
    );
};

// Main Widget Component
export const AnnouncementsWidget: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [processedData, setProcessedData] = useState<ProcessedAnnouncement[]>(
        [],
    );
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Process data on mount
    useEffect(() => {
        const announcements = processAnnouncements(jsonData.announcements);
        setProcessedData(announcements);
    }, []);

    // Update scroll button states
    const updateScrollState = useCallback(() => {
        requestAnimationFrame(() => {
            // Ensure calculations happen after potential layout shifts
            if (!isExpanded && listRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } =
                    listRef.current;
                const tolerance = 1; // Tolerance for float calculations
                setCanScrollLeft(scrollLeft > tolerance);
                setCanScrollRight(
                    scrollLeft < scrollWidth - clientWidth - tolerance,
                );
            } else {
                // Reset button states if expanded or ref is not available
                setCanScrollLeft(false);
                setCanScrollRight(false);
            }
        });
    }, [isExpanded]);

    // Update scroll state when data loads, expansion state changes, or window resizes
    useEffect(() => {
        const timer = setTimeout(updateScrollState, 50); // Initial check after mount/state change
        window.addEventListener('resize', updateScrollState);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [processedData, isExpanded, updateScrollState]); // Re-check dependencies

    // Scroll handlers
    const handleScroll = (direction: 'left' | 'right') => {
        if (!isExpanded && listRef.current) {
            // Calculate scroll amount more dynamically
            const containerWidth = listRef.current.clientWidth;
            // Try to scroll by roughly the visible area minus a bit to show a peek
            const scrollAmount = containerWidth * 0.8; // Adjust multiplier (e.g., 0.8)
            const currentScroll = listRef.current.scrollLeft;
            const newScroll =
                direction === 'left'
                    ? currentScroll - scrollAmount
                    : currentScroll + scrollAmount;
            listRef.current.scrollLeft = newScroll;
            // Update state after scroll command (needed because scroll event might not fire immediately)
            setTimeout(updateScrollState, 400); // Slightly longer timeout for smooth scroll
        }
    };

    const handleViewAll = () => setIsExpanded(true);
    const handleViewLess = () => {
        setIsExpanded(false);
        // Use timeout to ensure the DOM is updated to collapsed state before checking scroll
        setTimeout(updateScrollState, 50);
    };

    // Always use the full processed data for rendering items
    const displayData = processedData;

    // Control "View All" visibility based on total items vs typical initial display
    const initialVisibleCount = isSmallScreen ? 2 : 3;
    const showViewAll =
        !isExpanded && processedData.length > initialVisibleCount;
    const showViewLess = isExpanded;

    return (
        <AnimatePresence>
            {/* Embed CSS Styles */}
            <style>{styles}</style>

            <MotionPaper className="widgetContainer" elevation={0} square>
                {/* Header */}
                <Box className="header">
                    <Box className="headerTitleContainer">
                        <CampaignIcon className="megaphoneIcon" />
                        <Typography
                            variant="subtitle1"
                            className="headerTitleText">
                            Announcements
                        </Typography>
                    </Box>
                    <Box className="headerActionsContainer">
                        {!isExpanded && (
                            <>
                                {canScrollLeft && (
                                    <IconButton
                                        size="small"
                                        className="headerIconButton"
                                        onClick={() => handleScroll('left')}
                                        disabled={!canScrollLeft} // Use state variable
                                        aria-label="Scroll previous announcements">
                                        <ChevronLeftIcon />
                                    </IconButton>
                                )}

                                {canScrollRight && (
                                    <IconButton
                                        size="small"
                                        className="headerIconButton"
                                        onClick={() => handleScroll('right')}
                                        disabled={!canScrollRight} // Use state variable
                                        aria-label="Scroll next announcements">
                                        <ChevronRightIcon />
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
                        {displayData.map((announcement, index) => (
                            <motion.div
                                key={index + 1}
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

                {/* Action Link */}
                {showViewAll && (
                    <Link
                        component="button"
                        variant="body2"
                        onClick={handleViewAll}
                        className="actionLink">
                        View All
                    </Link>
                )}
                {showViewLess && (
                    <Link
                        component="button"
                        variant="body2"
                        onClick={handleViewLess}
                        className="actionLink">
                        View Less
                    </Link>
                )}
            </MotionPaper>
        </AnimatePresence>
    );
};

// Example Usage (usually in your App.js or another component)
// import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
// const theme = createTheme({ /* your theme options */ });
//
// const App = () => {
//   return (
//      <ThemeProvider theme={theme}>
//        <CssBaseline />
//        <AnnouncementsWidget />
//      </ThemeProvider>
//   )
// }
// export default App;
