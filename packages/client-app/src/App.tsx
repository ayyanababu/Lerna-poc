import { DonutChart, Sortable, SortableCard } from '@myorg/ui-library-vite';
import '@myorg/ui-library-vite/style.css';
import './App.css';

function App() {
  return (
    <Sortable className="my-cards">
      <SortableCard title="Trade Capture">
        <DonutChart
          data={[
            { label: 'Successful Trades', value: 85, color: '#fed8cc' },
            { label: 'Failed Trades', value: 15, color: '#f9804e' },
          ]}
          isHalf
          hideLabels
        />
      </SortableCard>

      <SortableCard title="Trade Notification">
        <DonutChart
          data={[
            { label: 'Scheduled', value: 60, color: '#9bc5ef' },
            { label: 'Completed', value: 15, color: '#407abc' },
            { label: 'Seat', value: 25, color: '#50c1c2' },
          ]}
        />
      </SortableCard>
    </Sortable>
  );
}

export default App;
