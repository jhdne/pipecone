import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity, PieChart as PieChartIcon } from 'lucide-react';

// 价格趋势图
interface PriceTrendChartProps {
  data: Array<{
    date: string;
    price: number;
    volume: number;
  }>;
  symbol: string;
}

export function PriceTrendChart({ data, symbol }: PriceTrendChartProps) {
  const formatPrice = (value: number) => `$${value.toFixed(4)}`;
  const formatVolume = (value: number) => `$${(value / 1000000).toFixed(1)}M`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          {symbol} 价格趋势
        </h3>
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          +12.5%
        </Badge>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            yAxisId="price"
            orientation="left"
            stroke="#666"
            fontSize={12}
            tickFormatter={formatPrice}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke="#666"
            fontSize={12}
            tickFormatter={formatVolume}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              name === 'price' ? formatPrice(value) : formatVolume(value),
              name === 'price' ? '价格' : '交易量'
            ]}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#e0e7ff"
            opacity={0.6}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 市场分布饼图
interface MarketDistributionProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function MarketDistributionChart({ data }: MarketDistributionProps) {
  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-purple-500" />
          市场分布
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 风险评估雷达图
interface RiskAssessmentProps {
  data: Array<{
    subject: string;
    score: number;
    fullMark: number;
  }>;
  tokenSymbol: string;
}

export function RiskAssessmentChart({ data, tokenSymbol }: RiskAssessmentProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {tokenSymbol} 风险评估
        </h3>
        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
          中等风险
        </Badge>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#666' }}
          />
          <Radar
            name={tokenSymbol}
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 相关性散点图
interface CorrelationScatterProps {
  data: Array<{
    x: number;
    y: number;
    name: string;
    marketCap: number;
  }>;
  xLabel: string;
  yLabel: string;
}

export function CorrelationScatterChart({ data, xLabel, yLabel }: CorrelationScatterProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {xLabel} vs {yLabel} 相关性
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yLabel}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name === 'x' ? xLabel : yLabel
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.name;
              }
              return '';
            }}
          />
          <Scatter 
            name="代币" 
            dataKey="y" 
            fill="#6366f1"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 综合仪表板
interface DashboardProps {
  priceData: any[];
  marketData: any[];
  riskData: any[];
  correlationData: any[];
  tokenSymbol: string;
}

export function AdvancedDashboard({ 
  priceData, 
  marketData, 
  riskData, 
  correlationData, 
  tokenSymbol 
}: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendChart data={priceData} symbol={tokenSymbol} />
        <MarketDistributionChart data={marketData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskAssessmentChart data={riskData} tokenSymbol={tokenSymbol} />
        <CorrelationScatterChart 
          data={correlationData}
          xLabel="市值"
          yLabel="24h涨跌幅"
        />
      </div>
    </div>
  );
}
