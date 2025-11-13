import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { colors } from '../../constants/colors';
import { ReportData } from '../../types/reports';

const screenWidth = Dimensions.get('window').width;

interface ChartContainerProps {
  title: string;
  data: ReportData;
  type: 'line' | 'bar';
  yAxisSuffix?: string;
  showValues?: boolean;
}

export default function ChartContainer({
  title,
  data,
  type,
  yAxisSuffix = '',
  showValues = false,
}: ChartContainerProps) {
  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.light.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e2e8f0',
      strokeWidth: 1,
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets,
  };

  if (data.labels.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const chartWidth = screenWidth - 48;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartWrapper}>
        {type === 'line' ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisSuffix={yAxisSuffix}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={true}
            verticalLabelRotation={0}
            formatYLabel={(y) => `${y}`}
              segments={5}
          />
        ) : (
          <BarChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=''
            yAxisSuffix={yAxisSuffix}
            withInnerLines={false}
            showValuesOnTopOfBars={showValues}
            fromZero={true}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  chartWrapper: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 16,
    marginLeft: -24,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
});