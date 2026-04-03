import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Users, ArrowRight, ChevronLeft } from 'lucide-react'
import './ResellerDashboard.css'

const mockSalesReps = {
  week: [
    { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼', sketches: 24, converted: 18, tier: 'Gold' },
    { id: 2, name: 'Mike Chen', avatar: '👨‍💼', sketches: 19, converted: 14, tier: 'Silver' },
    { id: 3, name: 'Emma Wilson', avatar: '👩‍💼', sketches: 31, converted: 26, tier: 'Platinum' },
    { id: 4, name: 'James Roberts', avatar: '👨‍💼', sketches: 15, converted: 10, tier: 'Gold' },
  ],
  month: [
    { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼', sketches: 98, converted: 78, tier: 'Gold' },
    { id: 2, name: 'Mike Chen', avatar: '👨‍💼', sketches: 87, converted: 62, tier: 'Silver' },
    { id: 3, name: 'Emma Wilson', avatar: '👩‍💼', sketches: 112, converted: 94, tier: 'Platinum' },
    { id: 4, name: 'James Roberts', avatar: '👨‍💼', sketches: 76, converted: 54, tier: 'Gold' },
  ],
  quarter: [
    { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼', sketches: 287, converted: 231, tier: 'Gold' },
    { id: 2, name: 'Mike Chen', avatar: '👨‍💼', sketches: 265, converted: 188, tier: 'Silver' },
    { id: 3, name: 'Emma Wilson', avatar: '👩‍💼', sketches: 341, converted: 289, tier: 'Platinum' },
    { id: 4, name: 'James Roberts', avatar: '👨‍💼', sketches: 234, converted: 167, tier: 'Gold' },
  ]
}

const tierColors = {
  'Platinum': 'platinum',
  'Gold': 'gold',
  'Silver': 'silver',
}

const tierBadgeColors = {
  'Platinum': 'platinum',
  'Gold': 'gold',
  'Silver': 'silver',
}

export default function ResellerDashboard() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState('month')
  const salesReps = mockSalesReps[timeRange]

  const getConversionRate = (sketches, converted) => {
    return sketches > 0 ? Math.round((converted / sketches) * 100) : 0
  }

  const getConversionColor = (rate) => {
    if (rate >= 80) return 'high'
    if (rate >= 60) return 'medium'
    return 'low'
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="reseller-dashboard-wrapper">
      <div className="rd-header">
        <button
          onClick={() => navigate('/editor')}
          className="rd-back-btn"
        >
          <ChevronLeft size={20} />
          Back to Editor
        </button>
      </div>

      <div className="rd-content">
        <div className="rd-content-max">
          {/* Header */}
          <div className="rd-page-header">
            <h1 className="rd-page-title">Reseller Dashboard</h1>
            <p className="rd-page-subtitle">Manage your sales team and track performance</p>
          </div>

          {/* Reseller Info Card */}
          <div className="rd-info-card">
            <div className="rd-info-content">
              <div className="rd-info-left">
                <div className="rd-info-avatar">
                  SS
                </div>
                <div className="rd-info-text">
                  <h2>Sauna Solutions Inc.</h2>
                  <div className="rd-info-details">
                    <p className="rd-info-detail">
                      <span className="rd-info-detail-icon">📍</span> Portland, Oregon
                    </p>
                    <p className="rd-info-detail">
                      <span className="rd-info-detail-icon">⭐</span> Platinum Partner Tier
                    </p>
                    <p className="rd-info-detail rd-info-detail-small">Established 2019</p>
                  </div>
                </div>
              </div>
              <button className="rd-info-btn">
                <span>New Sketch</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Sales Reps Section */}
          <div className="rd-sales-section">
            {/* Section Header with Time Range Switcher */}
            <div className="rd-section-header">
              <div className="rd-section-title">
                <Users size={28} />
                <h3>Sales Representatives</h3>
              </div>

              {/* Time Range Buttons */}
              <div className="rd-time-buttons">
                {[
                  { key: 'week', label: 'Current Week' },
                  { key: 'month', label: 'Current Month' },
                  { key: 'quarter', label: 'Last 3 Months' },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={() => setTimeRange(btn.key)}
                    className={`rd-time-btn ${timeRange === btn.key ? 'rd-time-active' : ''}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sales Reps Grid */}
            <div className="rd-grid">
              {salesReps.map(rep => {
                const conversionRate = getConversionRate(rep.sketches, rep.converted)
                const conversionColor = getConversionColor(conversionRate)

                return (
                  <div key={rep.id} className="rd-rep-card">
                    {/* Rep Header */}
                    <div className="rd-rep-header">
                      <div className={`rd-rep-avatar ${tierColors[rep.tier]}`}>
                        {getInitials(rep.name)}
                      </div>
                      <div className="rd-rep-info">
                        <h4 className="rd-rep-name">{rep.name}</h4>
                        <span className={`rd-rep-tier ${tierBadgeColors[rep.tier]}`}>
                          {rep.tier}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="rd-rep-stats">
                      <div className="rd-stat">
                        <div className="rd-stat-label">
                          <span className="rd-stat-label-text">Total Sketches</span>
                          <span className="rd-stat-value">{rep.sketches}</span>
                        </div>
                      </div>

                      <div className="rd-stat">
                        <div className="rd-stat-label">
                          <span className="rd-stat-label-text">Converted</span>
                          <span className="rd-stat-value converted">{rep.converted}</span>
                        </div>
                      </div>

                      {/* Conversion Progress Bar */}
                      <div className="rd-stat">
                        <div className="rd-stat-label">
                          <span className="rd-stat-label-text">Conversion Rate</span>
                          <span className={`rd-conversion-badge ${conversionColor}`}>
                            {conversionRate}%
                          </span>
                        </div>
                        <div className="rd-progress-bar-container">
                          <div
                            className={`rd-progress-bar ${conversionColor}`}
                            style={{ width: `${conversionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="rd-rep-action-btn">
                      <TrendingUp size={16} />
                      View Details
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats Footer */}
            <div className="rd-summary">
              <div className="rd-summary-card blue">
                <p className="rd-summary-label">Total Sketches</p>
                <p className="rd-summary-value blue">
                  {salesReps.reduce((sum, rep) => sum + rep.sketches, 0)}
                </p>
              </div>
              <div className="rd-summary-card amber">
                <p className="rd-summary-label">Total Converted</p>
                <p className="rd-summary-value amber">
                  {salesReps.reduce((sum, rep) => sum + rep.converted, 0)}
                </p>
              </div>
              <div className="rd-summary-card green">
                <p className="rd-summary-label">Overall Rate</p>
                <p className="rd-summary-value green">
                  {getConversionRate(
                    salesReps.reduce((sum, rep) => sum + rep.sketches, 0),
                    salesReps.reduce((sum, rep) => sum + rep.converted, 0)
                  )}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
