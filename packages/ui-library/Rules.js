 <VerticalBarChart
          data={[
            { label: 'Not Priced', value: 30 },
            { label: 'Stale Price', value: 45 },
            { label: 'Priced/Auto', value: 15 },
            { label: 'Priced/Manual', value: 10 }
          ]}
          title="Valuation"
          colors={['#AC48C6', '#E88661', '#9FC7E9', '#93a3bc']}
          legendsProps={{
            position: 'bottom',
            isVisible: true,
          }}
          tooltipProps={{}}
        />


<BarLineChart
          data={{
            xAxislabel: 'Corporate Action',
            yAxisLeftLabel: 'Number of Actions',
            yAxisRightLabel: 'Positions Impacted',
            chartData: [
              { xAxis: 'Dividend (NNA)', yAxisLeft: 25, yAxisRight: 35 },
              { xAxis: 'Dividend (NCA)', yAxisLeft: 15, yAxisRight: 22 },
              { xAxis: 'Dividend (NEA)', yAxisLeft: 18, yAxisRight: 45 },
              { xAxis: 'Stock Split (NCA)', yAxisLeft: 22, yAxisRight: 28 },
              { xAxis: 'Rights Issue (NCA)', yAxisLeft: 30, yAxisRight: 40 },
              { xAxis: 'Merger (NEA)', yAxisLeft: 35, yAxisRight: 25 },
              { xAxis: 'Tender Offer (NCA)', yAxisLeft: 42, yAxisRight: 55 }
            ]
          }}
