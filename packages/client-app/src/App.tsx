import {
  DonutChart,
  GroupedBarChart,
  Sortable,
  SortableCard,
} from '@my-org/ui-library';
import './App.css';

interface DataPoint {
  [key: string]: string | number; // Flexible data structure
}
interface MyDataItem extends DataPoint {
  category: string;
  group1: number;
  group2: number;
  group3: number;
}

const myData: MyDataItem[] = [
  { category: 'A', group1: 25, group2: 40, group3: 15 },
  { category: 'B', group1: 30, group2: 25, group3: 35 },
  { category: 'C', group1: 15, group2: 50, group3: 20 },
  { category: 'D', group1: 40, group2: 35, group3: 10 },
];

function App() {
  return (
    <Sortable className="my-cards">
      <SortableCard title="Trade Capture" height={400} width={400}>
        <DonutChart
          data={[
            { label: 'Successful Trades', value: 85, color: '#fed8cc' },
            { label: 'Failed Trades', value: 15, color: '#f9804e' },
          ]}
          type="semi"
          hideLabels
          timestamp={new Date().toISOString()}
        />
      </SortableCard>

      <SortableCard title="Trade Notification" height={400} width={400}>
        <DonutChart
          data={[
            { label: 'Scheduled', value: 60, color: '#9bc5ef' },
            { label: 'Completed', value: 15, color: '#407abc' },
            { label: 'Seat', value: 25, color: '#50c1c2' },
          ]}
          timestamp={new Date().toISOString()}
        />
      </SortableCard>

      <SortableCard title="Trade Notification" height={400} width={400}>
        <GroupedBarChart
          width={600}
          height={400}
          data={myData}
          groupKeys={['group1', 'group2', 'group3']}
          categoryKey="category"
        />
      </SortableCard>
    </Sortable>
  );
}

export default App;