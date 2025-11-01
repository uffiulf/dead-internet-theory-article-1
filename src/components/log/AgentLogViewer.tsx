import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GitCommit, Clock, User, CheckCircle2, AlertCircle, XCircle, Loader2, Search, Filter, FileText, MessageSquare } from 'lucide-react'

type AgentLog = {
  version: string
  project: string
  created: string
  lastUpdated: string
  entries: LogEntry[]
  statistics: {
    totalEntries: number
    totalFindings: number
    criticalFindings: number
    mediumFindings: number
    openFindings: number
    resolvedFindings: number
    byAgent: Record<string, number>
    byCategory: Record<string, number>
    byStatus: Record<string, number>
    bySeverity: Record<string, number>
  }
  openIssues: Array<{
    findingId: string
    summary: string
    priority: string
  }>
}

type LogEntry = {
  id: string
  timestamp: string
  agent: string
  agentType: string
  category: string
  title: string
  status: 'completed' | 'in-progress' | 'blocked' | 'cancelled'
  description: string
  actions: Array<{
    action: string
    result: string
    details: string
  }>
  findings: Array<{
    id: string
    severity: 'critical' | 'medium' | 'low'
    type: string
    location: string
    issue: string
    status: string
  }>
  comments: Array<{
    id: string
    timestamp: string
    agent: string
    comment: string
  }>
  filesAffected: string[]
  relatedIssues: string[]
  timeSpent?: string
  nextSteps?: string[]
}

const AGENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'quality-assurance': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  'developer': { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  'frontend': { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  'backend': { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  'devops': { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-300 dark:border-cyan-700' },
  'tester': { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' },
  'designer': { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-300 dark:border-indigo-700' },
  'project-manager': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-700' },
}

const STATUS_ICONS = {
  completed: CheckCircle2,
  'in-progress': Loader2,
  blocked: XCircle,
  cancelled: XCircle,
}

const STATUS_COLORS = {
  completed: 'text-green-600 dark:text-green-400',
  'in-progress': 'text-blue-600 dark:text-blue-400',
  blocked: 'text-red-600 dark:text-red-400',
  cancelled: 'text-gray-600 dark:text-gray-400',
}

function getAgentTypeColor(type: string) {
  return AGENT_TYPE_COLORS[type] || { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-700' }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'akk nå'
  if (diffMins < 60) return `${diffMins} min siden`
  if (diffHours < 24) return `${diffHours} timer siden`
  if (diffDays < 7) return `${diffDays} dager siden`
  
  return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AgentLogViewer() {
  const [logData, setLogData] = useState<AgentLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [filterAgentType, setFilterAgentType] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch('/agent-log.json')
      .then((res) => res.json())
      .then((data: AgentLog) => {
        setLogData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredEntries = useMemo(() => {
    if (!logData) return []
    
    return logData.entries.filter((entry) => {
      if (filterAgentType !== 'all' && entry.agentType !== filterAgentType) return false
      if (filterCategory !== 'all' && entry.category !== filterCategory) return false
      if (filterStatus !== 'all' && entry.status !== filterStatus) return false
      if (searchQuery && !entry.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !entry.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !entry.agent.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [logData, filterAgentType, filterCategory, filterStatus, searchQuery])

  const agentTypes = useMemo(() => {
    if (!logData) return []
    return Array.from(new Set(logData.entries.map((e) => e.agentType)))
  }, [logData])

  const categories = useMemo(() => {
    if (!logData) return []
    return Array.from(new Set(logData.entries.map((e) => e.category)))
  }, [logData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !logData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 p-6">
        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
        <p className="text-red-700 dark:text-red-300">Kunne ikke laste agent-log: {error || 'Ukjent feil'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Agent Log - Aktivitetsoversikt</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Oversikt over arbeid utført av forskjellige agenter. Sist oppdatert: {formatTimestamp(logData.lastUpdated)}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Totale entries</div>
          <div className="text-2xl font-bold">{logData.statistics.totalEntries}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Åpne issues</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{logData.statistics.openFindings}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kritiske funn</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{logData.statistics.criticalFindings}</div>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Løste funn</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{logData.statistics.resolvedFindings}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Søk i entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtre
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Agent-type</label>
              <select
                value={filterAgentType}
                onChange={(e) => setFilterAgentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="all">Alle</option>
                {agentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="all">Alle</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="all">Alle</option>
                <option value="completed">Fullført</option>
                <option value="in-progress">Pågående</option>
                <option value="blocked">Blokkert</option>
                <option value="cancelled">Avbrutt</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Ingen entries funnet med valgte filtre.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const agentColor = getAgentTypeColor(entry.agentType)
            const StatusIcon = STATUS_ICONS[entry.status]
            const statusColor = STATUS_COLORS[entry.status]
            const isExpanded = selectedEntry === entry.id

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border-2 ${agentColor.border} ${agentColor.bg} overflow-hidden cursor-pointer transition-all`}
                onClick={() => setSelectedEntry(isExpanded ? null : entry.id)}
              >
                {/* Entry Header (Commit-style) */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${agentColor.bg} border-2 ${agentColor.border} flex items-center justify-center`}>
                      <GitCommit className={`w-5 h-5 ${agentColor.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entry.title}</h3>
                        <StatusIcon className={`w-4 h-4 ${statusColor} ${entry.status === 'in-progress' ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {entry.agent}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${agentColor.text} ${agentColor.bg}`}>
                          {entry.agentType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700">
                          {entry.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{entry.description}</p>
                      
                      {/* Files affected (like commit files) */}
                      {entry.filesAffected && entry.filesAffected.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>{entry.filesAffected.length} fil(er) berørt</span>
                          <span className="text-gray-400 dark:text-gray-600">•</span>
                          <span>{entry.comments.length} kommentar(er)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <div className="p-4 space-y-6">
                      {/* Actions */}
                      {entry.actions && entry.actions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Handlinger utført</h4>
                          <div className="space-y-2">
                            {entry.actions.map((action, idx) => (
                              <div key={idx} className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-800">
                                <span className="font-medium">{action.action}:</span> {action.result}
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{action.details}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Findings */}
                      {entry.findings && entry.findings.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Funn og problemer</h4>
                          <div className="space-y-2">
                            {entry.findings.map((finding) => (
                              <div
                                key={finding.id}
                                className={`text-sm p-3 rounded border-l-4 ${
                                  finding.severity === 'critical'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                    : finding.severity === 'medium'
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                                }`}
                              >
                                <div className="font-medium">{finding.issue}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {finding.location} • {finding.type}
                                </div>
                                <div className="text-xs mt-1">
                                  Status: <span className="font-medium">{finding.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comments (like commit messages) */}
                      {entry.comments && entry.comments.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Kommentarer
                          </h4>
                          <div className="space-y-3">
                            {entry.comments.map((comment) => (
                              <div key={comment.id} className="text-sm p-3 rounded bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-400">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{comment.agent}</span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      {entry.nextSteps && entry.nextSteps.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Neste steg</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {entry.nextSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

