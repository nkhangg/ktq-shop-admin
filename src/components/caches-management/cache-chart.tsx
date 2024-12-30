import * as React from 'react';
import ReactECharts from 'echarts-for-react';

export interface ICacheChartProps {
    data: {
        value: number;
        name: string;
    }[];
}

export default function CacheChart({ data }: ICacheChartProps) {
    const option = {
        title: {
            text: 'Cache Management Chart',
            left: 'center',
            textStyle: {
                color: '#ffffff',
            },
            subtextStyle: {
                color: '#ffffff',
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/> {b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: data.map((item) => item.name),
            textStyle: {
                color: '#ffffff',
            },
        },
        series: [
            {
                name: 'Cache Types',
                type: 'pie',
                radius: '50%',
                data,

                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                itemStyle: {
                    color: (params) => {
                        const colors = ['#047857', '#ea580c', '#6d28d9'];
                        return colors[params.dataIndex];
                    },
                },
            },
        ],
    };

    return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
}
