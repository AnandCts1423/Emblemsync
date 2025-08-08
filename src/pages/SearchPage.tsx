import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar, 
  Building2, 
  Layers,
  Download,
  Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { mockComponents } from '../data/mockComponents';
import { Component, ComponentFilters } from '../types';

const SearchPage: React.FC = () => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ComponentFilters>({
    towerName: '',
    appGroup: '',
    complexity: [],
    status: [],
    yearRange: { start: 2024, end: 2025 },
    monthRange: { start: 1, end: 12 }
  });
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  // Get unique values for filter dropdowns
  const uniqueValues = useMemo(() => ({
    towers: Array.from(new Set(mockComponents.map(c => c.towerName))),
    appGroups: Array.from(new Set(mockComponents.map(c => c.appGroup))),
    complexities: ['Simple', 'Medium', 'Complex'] as const,
    statuses: ['Released', 'In Development', 'Planned'] as const
  }), []);

  // Helper function to get month names
  const getMonthName = (month: number): string => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month - 1] || '';
  };

  // Filter components based on search and filters
  const filteredComponents = useMemo(() => {
    return mockComponents.filter(component => {
      // Text search with year and month support
      const searchLower = searchQuery.toLowerCase();
      let matchesSearch = !searchQuery;
      
      if (searchQuery) {
        // Standard text search
        const textMatch = component.towerName.toLowerCase().includes(searchLower) ||
          component.appGroup.toLowerCase().includes(searchLower) ||
          component.componentType.toLowerCase().includes(searchLower) ||
          component.description?.toLowerCase().includes(searchLower);
        
        // Year search (exact match)
        const yearMatch = component.year.toString() === searchQuery.trim();
        
        // Month search (number or name)
        const monthNumber = parseInt(searchQuery.trim());
        const monthNameMatch = getMonthName(component.month).toLowerCase().includes(searchLower);
        const monthNumberMatch = !isNaN(monthNumber) && component.month === monthNumber;
        
        // Combined search
        matchesSearch = textMatch || yearMatch || monthNameMatch || monthNumberMatch;
      }

      // Tower filter
      const matchesTower = !filters.towerName || component.towerName === filters.towerName;
      
      // App Group filter
      const matchesAppGroup = !filters.appGroup || component.appGroup === filters.appGroup;
      
      // Complexity filter
      const matchesComplexity = filters.complexity?.length === 0 || 
        filters.complexity?.includes(component.complexity);
      
      // Status filter
      const matchesStatus = filters.status?.length === 0 || 
        filters.status?.includes(component.status);

      // Year range filter
      const matchesYear = component.year >= (filters.yearRange?.start || 2024) && 
        component.year <= (filters.yearRange?.end || 2025);

      // Month range filter
      const matchesMonth = component.month >= (filters.monthRange?.start || 1) && 
        component.month <= (filters.monthRange?.end || 12);

      return matchesSearch && matchesTower && matchesAppGroup && 
             matchesComplexity && matchesStatus && matchesYear && matchesMonth;
    });
  }, [searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      towerName: '',
      appGroup: '',
      complexity: [],
      status: [],
      yearRange: { start: 2024, end: 2025 },
      monthRange: { start: 1, end: 12 }
    });
    setSearchQuery('');
  };

  const getComplexityColor = (complexity: Component['complexity']) => {
    switch (complexity) {
      case 'Simple': return colors.success;
      case 'Medium': return colors.warning;
      case 'Complex': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: Component['status']) => {
    switch (status) {
      case 'Released': return colors.success;
      case 'In Development': return colors.warning;
      case 'Planned': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 className="gradient-text" style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          marginBottom: '16px'
        }}>
          Smart Search
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: colors.textSecondary 
        }}>
          Advanced component search with powerful filtering and real-time results.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="glass-container"
        style={{ padding: '24px', marginBottom: '24px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textSecondary
              }}
            />
            <input
              type="text"
              placeholder="Search components, towers, years (2024), months (Jan, 12), app groups..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '48px', fontSize: '16px' }}
            />
            {!searchQuery && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                padding: '8px 12px',
                fontSize: '12px',
                color: colors.textSecondary,
                backgroundColor: colors.surface,
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                zIndex: 10
              }}>
                💡 Try searching: "2024", "Jan", "12", "Frontend", or tower names
              </div>
            )}
          </div>
          
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>

          {(searchQuery || Object.values(filters).some(v => 
            Array.isArray(v) ? v.length > 0 : v !== '' && 
            !(typeof v === 'object' && 'start' in v)
          )) && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              <X size={20} />
              Clear
            </button>
          )}
        </div>
        
        {/* Quick Search Suggestions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: colors.textSecondary, marginRight: '8px' }}>Quick search:</span>
          {['2024', '2025', 'Jan', 'Feb', 'Dec', 'Released'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setSearchQuery(suggestion)}
              className="btn btn-ghost"
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                height: 'auto',
                minHeight: 'auto'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="glass-container"
            style={{ padding: '24px', marginBottom: '24px' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              {/* Tower Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: colors.text
                }}>
                  <Building2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Tower
                </label>
                <select
                  className="input"
                  value={filters.towerName || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, towerName: e.target.value }))}
                >
                  <option value="">All Towers</option>
                  {uniqueValues.towers.map(tower => (
                    <option key={tower} value={tower}>{tower}</option>
                  ))}
                </select>
              </div>

              {/* App Group Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: colors.text
                }}>
                  <Layers size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  App Group
                </label>
                <select
                  className="input"
                  value={filters.appGroup || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, appGroup: e.target.value }))}
                >
                  <option value="">All Groups</option>
                  {uniqueValues.appGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Complexity Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Complexity
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {uniqueValues.complexities.map(complexity => (
                    <label key={complexity} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        checked={filters.complexity?.includes(complexity) || false}
                        onChange={(e) => {
                          const current = filters.complexity || [];
                          const updated = e.target.checked
                            ? [...current, complexity]
                            : current.filter(c => c !== complexity);
                          setFilters(prev => ({ ...prev, complexity: updated }));
                        }}
                      />
                      <span style={{ fontSize: '14px', color: getComplexityColor(complexity) }}>
                        {complexity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: colors.text
                }}>
                  Status
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {uniqueValues.statuses.map(status => (
                    <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={(e) => {
                          const current = filters.status || [];
                          const updated = e.target.checked
                            ? [...current, status]
                            : current.filter(s => s !== status);
                          setFilters(prev => ({ ...prev, status: updated }));
                        }}
                      />
                      <span style={{ fontSize: '14px', color: getStatusColor(status) }}>
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <motion.div
        className="glass-container"
        style={{ padding: '24px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              Search Results ({filteredComponents.length})
            </h3>
            {searchQuery && (
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '4px' }}>
                {/^\d{4}$/.test(searchQuery.trim()) ? `Showing components from year ${searchQuery}` :
                 /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(searchQuery.trim()) ? `Showing components from ${searchQuery}` :
                 /^\d{1,2}$/.test(searchQuery.trim()) && parseInt(searchQuery) >= 1 && parseInt(searchQuery) <= 12 ? `Showing components from month ${searchQuery}` :
                 `Searching for "${searchQuery}"`}
              </p>
            )}
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const csvContent = [
                'ID,Tower,App Group,Component,Complexity,Status,Year,Month,Description',
                ...filteredComponents.map(c => 
                  `${c.id},"${c.towerName}","${c.appGroup}","${c.componentType}",${c.complexity},${c.status},${c.year},${c.month},"${c.description || ''}"`
                )
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `emblemsight-search-results-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} />
            Export Results ({filteredComponents.length})
          </button>
        </div>

        {filteredComponents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: colors.textSecondary
          }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No components found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredComponents.map((component, index) => (
              <motion.div
                key={component.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedComponent(component)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start', 
                  marginBottom: '12px' 
                }}>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {component.componentType}
                    </h4>
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>
                      {component.towerName} • {component.appGroup}
                    </p>
                  </div>
                  <Eye size={16} color={colors.textSecondary} />
                </div>

                <p style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary, 
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}>
                  {component.description || 'No description available'}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getComplexityColor(component.complexity)}20`,
                      color: getComplexityColor(component.complexity)
                    }}>
                      {component.complexity}
                    </span>
                    <span style={{ 
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: `${getStatusColor(component.status)}20`,
                      color: getStatusColor(component.status)
                    }}>
                      {component.status}
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                    {new Date(0, component.month - 1).toLocaleString('default', { month: 'short' })} {component.year}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Component Detail Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedComponent(null)}
          >
            <motion.div
              className="glass-container"
              style={{ 
                maxWidth: '600px', 
                width: '100%', 
                padding: '32px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {selectedComponent.componentType}
                </h2>
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedComponent(null)}
                  style={{ padding: '8px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                    Tower & App Group
                  </label>
                  <p>{selectedComponent.towerName} • {selectedComponent.appGroup}</p>
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                    Description
                  </label>
                  <p>{selectedComponent.description || 'No description available'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                      Complexity
                    </label>
                    <p style={{ color: getComplexityColor(selectedComponent.complexity) }}>
                      {selectedComponent.complexity}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                      Status
                    </label>
                    <p style={{ color: getStatusColor(selectedComponent.status) }}>
                      {selectedComponent.status}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                      Release Date
                    </label>
                    <p>
                      {new Date(0, selectedComponent.month - 1).toLocaleString('default', { month: 'long' })} {selectedComponent.year}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: colors.textSecondary }}>
                      Change Type
                    </label>
                    <p>{selectedComponent.changeType}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary">Edit Component</button>
                <button className="btn btn-secondary">View History</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPage;
