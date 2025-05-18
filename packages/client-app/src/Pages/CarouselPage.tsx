import { Box, Typography } from '@mui/material';
import { Sortable, SortableCard } from '@my-org/ui-library';
import { color } from 'd3';

export default function CarouselPage() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                boxSizing: 'border-box',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
            }}>
            <style>
                {`
                    body {
                    margin : 0px}
                    `}
            </style>
            <Box
                sx={{
                    // height: '100vh',
                    // width: '100vw',

                    height: '700px',
                    width: '1000px',
                    display: 'flex',
                    flexDirection: 'row',
                    overflowY: 'hidden',
                    overflowX: 'auto',
                    border: '10px solid oklch(70.5% 0.213 47.604)',
                    borderRadius: '12px',
                    '>div': {
                        overflowX: 'hidden',
                        flex: '0 0 100%',
                    },
                }}>
                {/* Pages */}
                {[...new Array(3).fill('asdf')].map((_, idx) => (
                    <div key={idx}>
                        <Sortable
                            sx={{
                                backgroundColor: [
                                    '#00b8d8',
                                    '#ff6569',
                                    '#1adf7a',
                                ][idx],
                                gridTemplateColumns:
                                    'repeat(3, minmax(0, 1fr))',
                                // border: '5px solid black',
                                height: '100%',
                                width: '1000px',
                                minWidth: '1000px',
                                overflowY: 'auto',
                            }}>
                            {[...new Array(9).fill('asdf')].map((_, idx2) => (
                                <SortableCard
                                    height={150}
                                    width={150}
                                    key={idx2}>
                                    <div>
                                        <Typography
                                            variant="h1"
                                            sx={{
                                                fontSize: '70px',
                                                fontWeight: 700,
                                                color: [
                                                    '#00b8d8',
                                                    '#ff6569',
                                                    '#1adf7a',
                                                ][idx],
                                            }}>
                                            Page:{idx + 1}
                                            <br />
                                            Card:{idx2}
                                        </Typography>
                                    </div>
                                </SortableCard>
                            ))}
                        </Sortable>
                    </div>
                ))}
            </Box>
        </div>
    );
}
