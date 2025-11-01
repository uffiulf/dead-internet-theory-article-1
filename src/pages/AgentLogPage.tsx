import { Helmet } from 'react-helmet-async'
import AgentLogViewer from '../components/log/AgentLogViewer'

export default function AgentLogPage() {
  return (
    <>
      <Helmet>
        <title>Agent Log - Dead Internet Theory</title>
        <meta name="description" content="Oversikt over arbeid utført av forskjellige agenter på prosjektet" />
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <AgentLogViewer />
      </div>
    </>
  )
}

