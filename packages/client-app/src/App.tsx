import {
  DonutChart,
  GroupedBarChart,
  Sortable,
  SortableCard,
} from '@my-org/ui-library';
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
          timestamp={new Date().toISOString()}
        />
      </SortableCard>

      <SortableCard title="Trade Notification">
        <DonutChart
          data={[
            { label: 'Scheduled', value: 60, color: '#9bc5ef' },
            { label: 'Completed', value: 15, color: '#407abc' },
            { label: 'Seat', value: 25, color: '#50c1c2' },
          ]}
          timestamp={new Date().toISOString()}
        />
      </SortableCard>

      <SortableCard title="Trade Notification">
        <GroupedBarChart
          data={[
            {
              label: '20-1-2025',
              data: {
                future: 45,
                options: 20,
                forwards: 20,
                fixedIncome: 1200,
                others: 123,
              },
            },
            {
              label: '20-2-2025',
              data: {
                future: 43,
                options: 22,
                forwards: 78,
                fixedIncome: 12,
                others: 32,
              },
            },
            {
              label: '20-3-2025',
              data: {
                future: 8,
                options: 42,
                forwards: 0,
                fixedIncome: 87,
                others: 78,
              },
            },
          ]}
          timestamp={new Date().toISOString()}
          colors={{
            future: '#9bc5ef',
            options: '#50c1c2',
            forwards: '#fad176',
            fixedIncome: '#407abc',
            others: '#93a3bc',
          }}
        />
      </SortableCard>
    </Sortable>
  );
}

export default App;