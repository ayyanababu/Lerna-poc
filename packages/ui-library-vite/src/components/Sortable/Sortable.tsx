import React, { useEffect, useMemo, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import './Sortable.css';

export function Sortable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [state, setState] = useState<
    {
      id: number;
    }[]
  >([]);

  const childrenArray = useMemo(() => {
    return React.Children.toArray(children);
  }, [children]);

  useEffect(() => {
    setState(
      childrenArray.map((_, index) => ({
        id: index,
      })),
    );
  }, [childrenArray]);

  return (
    <ReactSortable
      tag="div"
      list={state}
      setList={setState}
      animation={200}
      easing="cubic-bezier(1, 0, 0, 1)"
      delay={2}
      handle=".drag-handle"
      className={'sortable ' + className}>
      {state.map((item) => (
        <div key={item.id}>{childrenArray[item.id]}</div>
      ))}
    </ReactSortable>
  );
}
