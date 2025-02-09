import { forwardRef, ReactNode } from 'react';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { Title } from '../Title/Title';
import './SortableCard.css';

export const SortableCard = forwardRef<
  HTMLDivElement,
  { children: ReactNode; title?: string }
>(({ children, title }, ref) => {
  return (
    <div ref={ref} className="card">
      <div className="card-header">
        <Title title={title} />

        <div className="drag-handle">
          <RxDragHandleDots2 />
        </div>
      </div>

      <div className="card-body">{children}</div>
    </div>
  );
});
