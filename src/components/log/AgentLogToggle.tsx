import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import AgentLogViewer from './AgentLogViewer'

export default function AgentLogToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
        aria-label="Vis agent log"
      >
        <FileText className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">Agent Log</span>
      </button>

      {/* Modal/Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-[100] backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full md:w-[90%] lg:w-[80%] xl:w-[70%] bg-white dark:bg-gray-900 z-[101] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Agent Log - Aktivitetsoversikt</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Lukk"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AgentLogViewer />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

