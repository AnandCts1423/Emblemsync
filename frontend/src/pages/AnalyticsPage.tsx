import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Calendar, Target, Zap, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AnalyticsPage: React.FC = () => {
  const { colors } = useTheme();

  // Mock analytics data
  const trendData = [
    { month: 'Jan', components: 12, releases: 8, complexity: 2.3 },
    { month: 'Feb', components: 18, releases: 12, complexity: 2.1 },
    { month: 'Mar', components: 25, releases: 15, complexity: 2.4 },
    { month: 'Apr', components: 22, releases: 18, complexity: 2.2 },
    { month: 'May', components: 35, releases: 22, complexity: 2.6 },
    { month: 'Jun', components: 28, releases: 25, complexity: 2.3 },
    { month: 'Jul', components: 42, releases: 30, complexity: 2.5 },
    { month: 'Aug', components: 38, releases: 28, complexity: 2.4 },
    { month: 'Sep', components: 45, releases: 35, complexity: 2.7 },
    { month: 'Oct', components: 52, releases: 38, complexity: 2.8 },
    { month: 'Nov', components: 48, releases: 42, complexity: 2.6 },
    { month: 'Dec', components: 55, releases: 45, complexity: 2.9 }
  ];

  const performanceData = [
    { name: 'Digital Banking', value: 85, fill: colors.primary },
    { name: 'Customer Experience', value: 72, fill: colors.accent },
    { name: 'Risk Management', value: 93, fill: colors.success },
    { name: 'Payment Systems', value: 67, fill: colors.warning }
  ];

  const velocityData = [
    { week: 'Week 1', planned: 15, completed: 12, efficiency: 80 },
    { week: 'Week 2', planned: 20, completed: 18, efficiency: 90 },
    { week: 'Week 3', planned: 18, completed: 16, efficiency: 89 },
    { week: 'Week 4', planned: 25, completed: 20, efficiency: 80 },
    { week: 'Week 5', planned: 22, completed: 21, efficiency: 95 },
    { week: 'Week 6', planned: 28, completed: 25, efficiency: 89 }
  ];

  const metrics = [
    {
      title: 'Release Velocity',
      value: '42',
      unit: 'components/month',
      change: '+12%',
      positive: true,
      icon: Zap,
      description: 'Average monthly component releases'
    },
    {
      title: 'Success Rate',
      value: '94.5%',
      unit: 'completion',
      change: '+3.2%',
      positive: true,
      icon: Target,
      description: 'Components delivered on schedule'
    },
    {
      title: 'Complexity Score',
      value: '2.6',
      unit: 'avg complexity',
      change: '+0.1',
      positive: false,
      icon: TrendingUp,
      description: 'Average component complexity rating'
    },
    {
      title: 'Time to Market',
      value: '18.5',
      unit: 'days avg',
      change: '-2.3',
      positive: true,
      icon: Calendar,
      description: 'Average development cycle time'
    }
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 className="gradient-text" style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              marginBottom: '16px'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: colors.textSecondary 
            }}>
              Deep insights into component trends, performance metrics, and development patterns.
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const analyticsData = {
                metrics,
                trendData,
                performanceData,
                velocityData,
                summary: {
                  totalDataPoints: trendData.length,
                  avgComplexity: (trendData.reduce((sum, d) => sum + d.complexity, 0) / trendData.length).toFixed(2),
                  totalComponents: trendData.reduce((sum, d) => sum + d.components, 0),
                  totalReleases: trendData.reduce((sum, d) => sum + d.releases, 0)
                },
                exportDate: new Date().toISOString()
              };
              
              const jsonContent = JSON.stringify(analyticsData, null, 2);
              const blob = new Blob([jsonContent], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `emblemsight-analytics-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            style={{ flexShrink: 0, marginTop: '8px' }}
          >
            <Download size={16} />
            Export Analytics
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="glass-container"
            style={{ padding: '24px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                background: colors.gradient,
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <metric.icon size={20} color="white" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.text }}>
                {metric.title}
              </h3>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                {metric.value}
              </span>
              <span style={{ fontSize: '1rem', color: colors.textSecondary, marginLeft: '8px' }}>
                {metric.unit}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: metric.positive ? colors.success : colors.error
              }}>
                {metric.change}
              </span>
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                vs last period
              </span>
            </div>

            <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: '1.4' }}>
              {metric.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
        gap: '32px',
        marginBottom: '40px'
      }}>
        {/* Trend Analysis */}
        <motion.div 
          className="glass-container" 
          style={{ padding: '32px' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Component & Release Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="month" stroke={colors.textSecondary} fontSize={12} />
              <YAxis stroke={colors.textSecondary} fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text
                }}
              />
              <Area 
                type="monotone" 
                dataKey="components" 
                stackId="1"
                stroke={colors.primary} 
                fill={colors.primary}
                fillOpacity={0.6}
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="releases" 
                stackId="2"
                stroke={colors.accent} 
                fill={colors.accent}
                fillOpacity={0.4}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: colors.primary }} />
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Components</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: colors.accent }} />
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Releases</span>
            </div>
          </div>
        </motion.div>

        {/* Performance Radial Chart */}
        <motion.div 
          className="glass-container" 
          style={{ padding: '32px' }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Tower Performance Score
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={performanceData}>
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={colors.primary}
                animationDuration={1500}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text
                }}
                formatter={(value) => [`${value}%`, 'Performance']}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px', 
            marginTop: '16px' 
          }}>
            {performanceData.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '2px', 
                  backgroundColor: item.fill 
                }} />
                <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Development Velocity */}
      <motion.div 
        className="glass-container" 
        style={{ padding: '32px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Development Velocity & Efficiency
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="week" stroke={colors.textSecondary} fontSize={12} />
            <YAxis yAxisId="left" stroke={colors.textSecondary} fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.textSecondary} fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="planned" 
              stroke={colors.textSecondary}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: colors.textSecondary, strokeWidth: 2, r: 4 }}
              animationDuration={1500}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="completed" 
              stroke={colors.primary}
              strokeWidth={3}
              dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
              animationDuration={1500}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="efficiency" 
              stroke={colors.success}
              strokeWidth={2}
              dot={{ fill: colors.success, strokeWidth: 2, r: 3 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '2px', 
              backgroundColor: colors.textSecondary,
              borderStyle: 'dashed'
            }} />
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>Planned</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '2px', backgroundColor: colors.primary }} />
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '2px', backgroundColor: colors.success }} />
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>Efficiency %</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
