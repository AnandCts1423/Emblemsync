import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Database, Users, CheckCircle, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { apiService, AnalyticsData } from '../services/api';
import RealTimeStatus from '../components/RealTimeStatus';
import RealTimeActivityFeed from '../components/RealTimeActivityFeed';
import { PieChart as RechartPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from 'recharts';

const DashboardPage: React.FC = () => {
  const { colors } = useTheme();
  const { components, loading } = useData(); // const { uploading } = useData(); // Commented out unused variable
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Real-time analytics update handler
  const handleAnalyticsUpdate = (event: CustomEvent) => {
    const updatedData = event.detail;
    setAnalyticsData(prev => ({ ...prev, ...updatedData }));
  };

  // Real-time activity handler
  const handleUserActivity = (event: CustomEvent) => {
    const activity = event.detail;
    setRecentActivities(prev => {
      const updated = [...prev, activity];
      return updated.slice(-20); // Keep last 20 activities
    });
  };

  // Setup real-time listeners
  useEffect(() => {
    window.addEventListener('analytics_update', handleAnalyticsUpdate as EventListener);
    window.addEventListener('user_activity', handleUserActivity as EventListener);
    
    return () => {
      window.removeEventListener('analytics_update', handleAnalyticsUpdate as EventListener);
      window.removeEventListener('user_activity', handleUserActivity as EventListener);
    };
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.getAnalytics();
        if (response.success && response.data) {
          setAnalyticsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    
    fetchAnalytics();
  }, []);

  // Process component data for charts
  const towerSummaries = React.useMemo(() => {
    if (!components || !Array.isArray(components) || components.length === 0) {
      return [];
    }
    
    const towerMap = new Map<string, { total: number; simple: number; medium: number; complex: number }>(); 
    
    components.forEach(component => {
      if (!component) return;
      
      const tower = component.tower || 'Unknown';
      if (!towerMap.has(tower)) {
        towerMap.set(tower, { total: 0, simple: 0, medium: 0, complex: 0 });
      }
      
      const counts = towerMap.get(tower)!;
      counts.total++;
      if (component.complexity === 'Simple') counts.simple++;
      if (component.complexity === 'Medium') counts.medium++;
      if (component.complexity === 'Complex') counts.complex++;
    });

    return Array.from(towerMap.entries()).map(([towerName, counts]) => ({
      towerName,
      ...counts
    }));
  }, [components]);

  const complexityData = React.useMemo(() => {
    if (!components || !Array.isArray(components) || components.length === 0) {
      return [];
    }
    
    const counts = { Simple: 0, Medium: 0, Complex: 0 };
    components.forEach(component => {
      if (component && component.complexity && counts[component.complexity as keyof typeof counts] !== undefined) {
        counts[component.complexity as keyof typeof counts]++;
      }
    });
    
    return [
      { name: 'Simple', value: counts.Simple, color: colors.success },
      { name: 'Medium', value: counts.Medium, color: colors.warning },
      { name: 'Complex', value: counts.Complex, color: colors.error }
    ];
  }, [components, colors]);

  const releaseData = React.useMemo(() => {
    if (!components || !Array.isArray(components) || components.length === 0) {
      return [];
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const releasesByMonth = new Map<number, number>();
    
    components.forEach(component => {
      if (component && component.releaseDate) {
        try {
          const releaseDate = new Date(component.releaseDate);
          if (!isNaN(releaseDate.getTime())) {
            const month = releaseDate.getMonth() + 1;
            const count = releasesByMonth.get(month) || 0;
            releasesByMonth.set(month, count + 1);
          }
        } catch (error) {
          // Skip invalid dates
          console.warn('Invalid release date:', component.releaseDate);
        }
      }
    });

    return months.map((month, index) => ({
      name: month,
      components: releasesByMonth.get(index + 1) || 0
    }));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  // Handle no data state
  if (components.length === 0 && !loading) {
    return (
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="gradient-text" style={{ 
            fontSize: '3rem', 
            fontWeight: '700', 
            marginBottom: '16px'
          }}>
            Component Dashboard
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: colors.textSecondary 
          }}>
            Real-time insights into component distribution, complexity, and release patterns.
          </p>
        </div>
        
        {/* No Data State */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          backgroundColor: colors.surface,
          borderRadius: '16px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.5 }}>📊</div>
          <h2 style={{ color: colors.text, marginBottom: '16px', fontSize: '1.5rem' }}>
            No Components Found
          </h2>
          <p style={{ color: colors.textSecondary, marginBottom: '32px', maxWidth: '400px' }}>
            Get started by uploading your first component data file or adding components manually.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/upload'}
            >
              Upload Data
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/view-all'}
            >
              Add Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              Component Dashboard
            </h1>
            <p style={{ 
              fontSize: '1.2rem', 
              color: colors.textSecondary 
            }}>
              Real-time insights into component distribution, complexity, and release patterns across all towers.
            </p>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const dashboardData = {
                summary: {
                  totalComponents: components.length,
                  totalTowers: towerSummaries.length,
                  complexityBreakdown: complexityData,
                  releaseTimeline: releaseData
                },
                towerSummaries,
                exportDate: new Date().toISOString()
              };
              
              const jsonContent = JSON.stringify(dashboardData, null, 2);
              const blob = new Blob([jsonContent], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `emblemsight-dashboard-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            style={{ flexShrink: 0, marginTop: '8px' }}
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        {/* Summary Cards */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}
        >
          {towerSummaries.map((tower, index) => (
            <motion.div
              key={tower.towerName}
              className="card"
              whileHover={{ y: -4 }}
              style={{ position: 'relative' }}
            >
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: colors.text
              }}>
                {tower.towerName}
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700' }}>{tower.total}</span>
                <span style={{ fontSize: '14px', color: colors.textSecondary }}>Components</span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: colors.success }}>
                    {tower.simple || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>Simple</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: colors.warning }}>
                    {tower.medium || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>Medium</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: colors.error }}>
                    {tower.complex || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>Complex</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '32px' 
        }}>
          {/* Complexity Distribution */}
          <motion.div variants={itemVariants} className="glass-container" style={{ padding: '32px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Complexity Distribution
            </h3>
            {complexityData && complexityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartPieChart>
                  <Pie
                    data={complexityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {complexityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    active={false}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            backgroundColor: colors.surface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.text,
                            padding: '8px'
                          }}>
                            <p>{`${payload[0].name}: ${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartPieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 300, 
                color: colors.textSecondary 
              }}>
                No data available
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
              {complexityData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: item.color 
                  }} />
                  <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Release Timeline */}
          <motion.div variants={itemVariants} className="glass-container" style={{ padding: '32px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Release Timeline
            </h3>
            {releaseData && releaseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={releaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis 
                    dataKey="name" 
                    stroke={colors.textSecondary}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={colors.textSecondary}
                    fontSize={12}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{
                            backgroundColor: colors.surface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.text,
                            padding: '8px'
                          }}>
                            <p style={{ margin: 0 }}>{`${label}: ${payload[0].value} components`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="components" 
                    fill={colors.primary}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 300, 
                color: colors.textSecondary 
              }}>
                No release data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Tower Performance Chart */}
        <motion.div variants={itemVariants} className="glass-container" style={{ padding: '32px' }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Tower Component Breakdown
          </h3>
          {towerSummaries && towerSummaries.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={towerSummaries} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis 
                  dataKey="towerName" 
                  stroke={colors.textSecondary}
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke={colors.textSecondary} fontSize={12} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          backgroundColor: colors.surface,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.text,
                          padding: '8px'
                        }}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="simple" stackId="a" fill={colors.success} radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill={colors.warning} radius={[0, 0, 0, 0]} />
                <Bar dataKey="complex" stackId="a" fill={colors.error} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 400, 
              color: colors.textSecondary 
            }}>
              No tower data available
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px', 
                backgroundColor: colors.success 
              }} />
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Simple</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px', 
                backgroundColor: colors.warning 
              }} />
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Medium</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px', 
                backgroundColor: colors.error 
              }} />
              <span style={{ fontSize: '14px', color: colors.textSecondary }}>Complex</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
