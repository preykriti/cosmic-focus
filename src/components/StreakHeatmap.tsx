import React from 'react';
import { ScrollView } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

type StreakHeatmapProps = {
  data: number[][];
  getColor: (value: number) => string;
};



export default function StreakHeatmap({ data, getColor }: StreakHeatmapProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg height={120} width={data.length * 18}>
        {data.map((week, wi) =>
          week.map((val, di) => (
            <Rect
              key={`${wi}-${di}`}
              x={wi * 18}
              y={di * 16}
              width={14}
              height={14}
              rx={3}
              fill={getColor(val)}
            />
          )),
        )}
      </Svg>
    </ScrollView>
  );
}
