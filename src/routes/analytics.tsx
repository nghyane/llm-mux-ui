import { createFileRoute } from '@tanstack/react-router'
import { AreaChart, BarList, DonutChart } from '@tremor/react'
import { useMemo, useState } from 'react'

import { useUsageStats } from '../api/hooks/useUsage'
import { ChartSkeleton, DonutSkeleton, TableSkeleton } from '../components/features/analytics/ChartSkeleton'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Select } from '../components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import { Tabs } from '../components/ui/Tabs'
import { getProviderConfig } from '../lib/providers'
import { formatNumber } from '../lib/utils'

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
})

const DATE_RANGES = [
  { label: 'Last 24 Hours', value: '1' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
]

type ViewType = 'overview' | 'providers' | 'models'

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7')
  const [activeTab, setActiveTab] = useState<ViewType>('overview')

  const { data: usageData, isLoading, error, refetch } = useUsageStats({
    days: parseInt(dateRange),
  })

  const stats = useMemo(() => {
    if (!usageData?.summary) {
      return {
        totalRequests: 0,
        successRate: 0,
        totalTokens: 0,
        failedRequests: 0,
        tokenBreakdown: { input: 0, output: 0, reasoning: 0 }
      }
    }

    const { total_requests, success_count, tokens, failure_count } = usageData.summary
    const successRate = total_requests > 0 ? (success_count / total_requests) * 100 : 0

    return {
      totalRequests: total_requests,
      successRate,
      totalTokens: tokens.total,
      failedRequests: failure_count,
      tokenBreakdown: {
        input: tokens.input,
        output: tokens.output,
        reasoning: tokens.reasoning || 0
      }
    }
  }, [usageData])

  const chartData = useMemo(() => {
    if (!usageData?.timeline) return []
    
    const isHourly = parseInt(dateRange) <= 1
    const data = isHourly ? usageData.timeline.by_hour : usageData.timeline.by_day

    return data.map((item: any) => ({
      date: isHourly ? `${item.hour}:00` : item.day,
      Requests: item.requests,
      Tokens: item.tokens
    }))
  }, [usageData, dateRange])

  const providerStats = useMemo(() => {
    if (!usageData?.by_provider) return []
    return Object.entries(usageData.by_provider)
      .map(([key, data]) => ({
        name: key,
        ...data,
        config: getProviderConfig(key)
      }))
      .sort((a, b) => b.requests - a.requests)
  }, [usageData])

  const modelStats = useMemo(() => {
    if (!usageData?.by_model) return []
    return Object.entries(usageData.by_model)
      .map(([key, data]) => ({
        name: key,
        ...data,
        providerConfig: getProviderConfig(data.provider)
      }))
      .sort((a, b) => b.requests - a.requests)
  }, [usageData])

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-base font-semibold text-(--text-primary) mb-6">
            Usage Timeline
          </h3>
          {isLoading ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <EmptyChartState icon="bar_chart" message="No usage data available" />
          ) : (
            <AreaChart
              className="h-72 mt-4"
              data={chartData}
              index="date"
              categories={['Requests', 'Tokens']}
              colors={['indigo', 'cyan']}
              valueFormatter={formatNumber}
              showAnimation={true}
              yAxisWidth={60}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-(--text-primary) mb-4">
            Token Distribution
          </h3>
          {isLoading ? (
            <DonutSkeleton />
          ) : stats.totalTokens === 0 ? (
            <EmptyChartState icon="donut_large" message="No token data available" />
          ) : (
            <div className="space-y-6">
              <DonutChart
                className="h-48"
                data={[
                  { name: 'Input', value: stats.tokenBreakdown.input },
                  { name: 'Output', value: stats.tokenBreakdown.output },
                  { name: 'Reasoning', value: stats.tokenBreakdown.reasoning },
                ]}
                category="value"
                index="name"
                valueFormatter={formatNumber}
                colors={['blue', 'emerald', 'violet']}
                showLabel={true}
              />
              <div className="flex justify-center gap-6 text-sm text-(--text-secondary)">
                 <div className="flex flex-col items-center">
                    <span className="font-semibold text-(--text-primary)">{formatNumber(stats.tokenBreakdown.input)}</span>
                    <span className="text-xs">Input</span>
                 </div>
                 <div className="flex flex-col items-center">
                    <span className="font-semibold text-(--text-primary)">{formatNumber(stats.tokenBreakdown.output)}</span>
                    <span className="text-xs">Output</span>
                 </div>
                 {stats.tokenBreakdown.reasoning > 0 && (
                   <div className="flex flex-col items-center">
                      <span className="font-semibold text-(--text-primary)">{formatNumber(stats.tokenBreakdown.reasoning)}</span>
                      <span className="text-xs">Reasoning</span>
                   </div>
                 )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-(--text-primary) mb-4">Top Providers</h3>
          {isLoading ? <div className="h-40 animate-pulse bg-(--bg-hover) rounded-lg" /> : (
            <BarList
              data={providerStats.slice(0, 5).map(p => ({
                name: p.config.name,
                value: p.requests,
                icon: () => <Icon name="dns" size="sm" className="mr-2" /> 
              }))}
              className="mt-2"
              valueFormatter={formatNumber}
            />
          )}
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-semibold text-(--text-primary) mb-4">Top Models</h3>
           {isLoading ? <div className="h-40 animate-pulse bg-(--bg-hover) rounded-lg" /> : (
            <BarList
              data={modelStats.slice(0, 5).map(m => ({
                name: m.name,
                value: m.requests,
              }))}
              className="mt-2"
              valueFormatter={formatNumber}
            />
          )}
        </Card>
      </div>
    </div>
  )

  const renderProviders = () => (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-(--border-color)">
        <h3 className="text-lg font-semibold text-(--text-primary)">Provider Performance</h3>
        <p className="text-sm text-(--text-secondary)">Detailed breakdown by provider</p>
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead align="right">Requests</TableHead>
              <TableHead align="right">Success Rate</TableHead>
              <TableHead align="right">Tokens</TableHead>
              <TableHead align="right">Accounts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providerStats.map((provider) => {
              const successRate = provider.requests > 0 
                ? (provider.success / provider.requests) * 100 
                : 0
              
              return (
                <TableRow key={provider.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="size-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                        style={{ backgroundColor: provider.config.bgColor, color: provider.config.color }}
                      >
                         {provider.config.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-(--text-primary)">{provider.config.name}</span>
                    </div>
                  </TableCell>
                  <TableCell align="right" className="font-mono">{formatNumber(provider.requests)}</TableCell>
                  <TableCell align="right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      successRate >= 99 ? 'bg-emerald-500/10 text-emerald-500' : 
                      successRate >= 95 ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {successRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell align="right" className="font-mono text-(--text-secondary)">
                    {formatNumber(provider.tokens.total)}
                  </TableCell>
                  <TableCell align="right" className="text-(--text-secondary)">
                    {provider.accounts}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  )

  const renderModels = () => (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-(--border-color)">
        <h3 className="text-lg font-semibold text-(--text-primary)">Model Usage</h3>
        <p className="text-sm text-(--text-secondary)">Detailed usage stats per model</p>
      </div>
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead align="right">Requests</TableHead>
              <TableHead align="right">Tokens</TableHead>
              <TableHead align="right">Input</TableHead>
              <TableHead align="right">Output</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelStats.map((model) => (
              <TableRow key={`${model.provider}-${model.name}`}>
                <TableCell>
                  <span className="font-medium text-(--text-primary)">{model.name}</span>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: model.providerConfig.color }}
                      />
                      <span className="text-(--text-secondary)">{model.providerConfig.name}</span>
                   </div>
                </TableCell>
                <TableCell align="right" className="font-mono">{formatNumber(model.requests)}</TableCell>
                <TableCell align="right" className="font-mono text-(--text-secondary)">{formatNumber(model.tokens.total)}</TableCell>
                <TableCell align="right" className="font-mono text-xs text-(--text-tertiary)">{formatNumber(model.tokens.input)}</TableCell>
                <TableCell align="right" className="font-mono text-xs text-(--text-tertiary)">{formatNumber(model.tokens.output)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-(--text-primary)">
            Analytics
          </h2>
          <p className="text-(--text-secondary) mt-1">
            Monitor traffic, token usage, and performance metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select 
            options={DATE_RANGES}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-[180px]"
          />
          
          <Button variant="secondary" onClick={() => refetch()} title="Refresh Data" className="w-9 px-0">
            <Icon name="refresh" className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          label="Total Requests"
          value={formatNumber(stats.totalRequests)}
          icon="data_usage"
          isLoading={isLoading}
        />
        <AnalyticsStatCard
          label="Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          icon="check_circle"
          isLoading={isLoading}
          highlight={stats.successRate >= 99}
          variant={stats.successRate < 95 ? 'danger' : 'default'}
        />
        <AnalyticsStatCard
          label="Total Tokens"
          value={formatNumber(stats.totalTokens)}
          icon="token"
          isLoading={isLoading}
        />
        <AnalyticsStatCard
          label="Failed Requests"
          value={formatNumber(stats.failedRequests)}
          icon="error_outline"
          isLoading={isLoading}
          variant={stats.failedRequests > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="space-y-6">
        <Tabs
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as ViewType)}
          tabs={[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'providers', label: 'By Provider', icon: 'dns' },
            { id: 'models', label: 'By Model', icon: 'model_training' },
          ]}
        />

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'providers' && renderProviders()}
        {activeTab === 'models' && renderModels()}
      </div>

      {error && (
        <Card className="p-4 border-l-4 border-(--danger-text) bg-(--danger-bg) mt-4">
          <div className="flex items-start gap-3">
            <Icon name="error" className="text-(--danger-text) mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-(--danger-text)">
                Failed to load analytics data
              </p>
              <p className="text-xs text-(--text-secondary) mt-1">
                {error.message || 'An error occurred while fetching data'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-(--danger-text) hover:bg-(--danger-bg)/80">
              Retry
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

interface AnalyticsStatCardProps {
  label: string
  value: string
  icon: string
  isLoading?: boolean
  highlight?: boolean
  variant?: 'default' | 'danger'
}

function AnalyticsStatCard({ label, value, icon, isLoading, highlight, variant = 'default' }: AnalyticsStatCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-(--bg-hover) rounded animate-pulse" />
          <div className="p-2 rounded-lg bg-(--bg-hover)">
            <Icon name={icon} size="md" className="text-(--text-tertiary)" />
          </div>
        </div>
        <div className="h-8 w-32 bg-(--bg-hover) rounded animate-pulse" />
      </Card>
    )
  }

  return (
    <Card className="p-5 relative overflow-hidden group">
       <div className="absolute inset-0 bg-gradient-to-br from-transparent to-(--bg-hover)/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <p className="text-sm font-medium text-(--text-secondary)">{label}</p>
        <div className={`p-2 rounded-lg transition-colors ${
          highlight ? 'bg-emerald-500/10' : 
          variant === 'danger' ? 'bg-red-500/10' : 
          'bg-(--bg-hover)'
        }`}>
          <Icon
            name={icon}
            size="md"
            className={
              highlight ? 'text-emerald-500' : 
              variant === 'danger' ? 'text-red-500' : 
              'text-(--text-tertiary)'
            }
          />
        </div>
      </div>
      <div className="flex items-end justify-between relative z-10">
        <span className={`text-3xl font-bold tracking-tight ${
          variant === 'danger' && value !== '0' ? 'text-red-500' : 'text-(--text-primary)'
        }`}>
          {value}
        </span>
      </div>
    </Card>
  )
}

function EmptyChartState({ icon, message }: { icon: string, message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-(--text-tertiary) p-8">
      <div className="p-4 rounded-full bg-(--bg-hover) mb-4">
        <Icon name={icon} size="xl" className="opacity-50" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
