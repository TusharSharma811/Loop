import {motion} from "motion/react";

export default function ChatAppSkeleton() {
  return (
    <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }}  transition={{ duration: 1 }} className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-80 p-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
            <div className="h-3 w-1/2 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-3/4 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
                <div className="h-2 w-1/2 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
              </div>
              <div className="h-3 w-8 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-10 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col">
        {/* Chat header */}
        <header className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse mr-4" />
          <div className="flex-1">
            <div className="h-4 w-1/3 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
            <div className="h-3 w-1/4 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </header>

        {/* Messages area */}
        <section className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
          {/* Alternating message bubbles */}
          <div className="max-w-2xl mx-auto space-y-4">
            {[...Array(12)].map((_, i) => {
              const incoming = i % 3 !== 0; // some variety
              return (
                <div key={i} className={`flex ${incoming ? 'justify-start' : 'justify-end'}`}>
                  <div className={`${incoming ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800'} p-3 rounded-lg shadow-sm`}>
                    <div className="h-3 w-40 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse mb-2" />
                    <div className="h-3 w-28 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Input area */}
        <footer className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="flex-1">
              <div className="h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
        </footer>
      </main>
    </motion.div>
  );
}
