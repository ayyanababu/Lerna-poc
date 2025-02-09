import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';
import { SetStateAction } from 'react';
import './Legends.css';

export function Legends({
  colorScale,
  data,
  hideIndex,
  setHideIndex,
  setHoveredArc,
}: {
  colorScale: ReturnType<typeof scaleOrdinal<string, string>>;
  data: { label: string; value: number; color: string }[];
  hideIndex: number[];
  setHideIndex: React.Dispatch<SetStateAction<number[]>>;
  setHoveredArc: React.Dispatch<SetStateAction<string | null | undefined>>;
}) {
  return (
    <div className="legends">
      <LegendOrdinal scale={colorScale} direction="row" labelMargin="0 0 0 0">
        {(labels) => (
          <>
            {labels.map((label, index) => {
              if (index > data.length - 1) {
                return null;
              }

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: 'auto',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => {
                    setHideIndex((prev) =>
                      prev.includes(index)
                        ? prev.filter((idx) => idx !== index)
                        : [...prev, index],
                    );
                  }}
                  tabIndex={1}
                  onMouseOver={() => {
                    setHoveredArc(label.text);
                  }}
                  onMouseLeave={() => {
                    setHoveredArc(null);
                  }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      // @ts-expect-error TODO
                      backgroundColor: (colorScale(label) as string) || '#fff',
                      marginRight: 7,
                      marginTop: '2px',
                      marginBottom: 'auto',
                      borderRadius: '20px',
                    }}></div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      alignItems: 'flex-start',
                    }}>
                    <h5
                      style={{
                        margin: 0,
                        fontWeight: 'normal',
                        textDecoration: hideIndex.includes(index)
                          ? 'strike-through'
                          : 'none',
                      }}>
                      {label.datum}
                    </h5>
                    {data?.[label.index]?.value && (
                      <h3
                        style={{
                          margin: 0,
                          fontWeight: 'normal',
                        }}>
                        {data?.[label?.index]?.value}
                      </h3>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </LegendOrdinal>
    </div>
  );
}
