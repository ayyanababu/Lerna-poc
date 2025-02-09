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
                  }}
                  className="legend-item">
                  <div
                    style={{
                      // @ts-expect-error TODO
                      backgroundColor: (colorScale(label) as string) || '#fff',
                    }}
                    className="legend-dot"></div>
                  <div className="legend-label-container">
                    <h5
                      style={{
                        textDecoration: hideIndex.includes(index)
                          ? 'strike-through'
                          : 'none',
                      }}>
                      {label.datum}
                    </h5>
                    {data?.[label.index]?.value && (
                      <h3>{data?.[label?.index]?.value}</h3>
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
