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
      <SortableCard title="Trade Capture" height={400} width={'auto'}>
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

      <SortableCard title="Trade Notification" height={400} width={'auto'}>
        <DonutChart
          data={[
            { label: 'Scheduled', value: 60, color: '#9bc5ef' },
            { label: 'Completed', value: 15, color: '#407abc' },
            { label: 'Seat', value: 25, color: '#50c1c2' },
          ]}
          timestamp={new Date().toISOString()}
        />
      </SortableCard>

      <SortableCard title="Trade Notification" height={400} width={'auto'}>
        <GroupedBarChart
          width={600}
          height={200}
          data={[
            {
              label: 'Aasdfasdf asd',
              data: {
                future: 25,
                options: 40,
                forwards: 15,
                fixedIncome: 12,
                others: 32,
              },
            },
            {
              label: 'Basdfasdf asd',
              data: {
                future: 30,
                options: 1,
                forwards: 12,
                fixedIncome: 12,
                others: 32,
              },
            },
            {
              label: 'Casdfasdf asd',
              data: {
                future: 15,
                options: 50,
                forwards: 1,
                fixedIncome: 12,
                others: 32,
              },
            },
            {
              label: 'Dasdfasdf asd',
              data: {
                future: 40,
                options: 35,
                forwards: 10,
                fixedIncome: 12,
                others: 32,
              },
            },
          ]}
          groupKeys={['future', 'options', 'forwards', 'fixedIncome', 'others']}
          colors={[
            '#9bc5ef', // future
            '#50c1c2', // options
            '#fad176', // forwards
            '#407abc', // fixedIncome
            '#93a3bc', // others
          ]}
          timestamp={new Date().toISOString()}
        />
      </SortableCard>
    </Sortable>
  );
}

export default App;