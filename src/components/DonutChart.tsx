import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
  description: string;
}

interface DonutChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  centerText?: string;
  centerValue?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  title, 
  subtitle, 
  data, 
  centerText = "Total",
  centerValue 
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayValue = centerValue || total.toString();

  const onPieEnter = (_: any, index: number) => {
    setHoveredIndex(index);
  };

  const onPieLeave = () => {
    setHoveredIndex(null);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-medium text-gray-900">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600 mb-1">{data.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: data.color }}>
              {data.value}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {percentage}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1);
          const isHovered = hoveredIndex === index;
          
          return (
            <div 
              key={index}
              className={`flex items-center cursor-pointer transition-all duration-200 ${
                isHovered ? 'transform scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className={`w-3 h-3 rounded-full mr-2 transition-all duration-200 ${
                  isHovered ? 'w-4 h-4' : ''
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <div className="text-sm">
                <span className="font-medium text-gray-900">{entry.value}</span>
                <span className="text-gray-600 ml-1">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Ne pas afficher les labels pour les petites sections
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={hoveredIndex === index ? '#ffffff' : 'none'}
                  strokeWidth={hoveredIndex === index ? 3 : 0}
                  style={{
                    filter: hoveredIndex === index ? 'brightness(1.1)' : 'none',
                    transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre du donut avec texte */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
              {displayValue}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {centerText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;