import { motion } from "motion/react";

export default function ChatAppSkeleton() {
  return (
    <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="h-screen flex bg-bg overflow-hidden">
      <aside className="w-80 p-4 border-r border-border bg-bg-secondary">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-bg-tertiary animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-3/4 rounded bg-bg-tertiary animate-pulse mb-2" />
            <div className="h-3 w-1/2 rounded bg-bg-tertiary animate-pulse" />
          </div>
        </div>
        <div className="h-10 rounded-lg bg-bg-tertiary animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-11 h-11 rounded-full bg-bg-tertiary animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-3/4 rounded bg-bg-tertiary animate-pulse mb-2" />
                <div className="h-2 w-1/2 rounded bg-bg-tertiary animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center px-5 border-b border-border bg-bg-secondary">
          <div className="w-10 h-10 rounded-full bg-bg-tertiary animate-pulse mr-3" />
          <div className="flex-1">
            <div className="h-4 w-1/3 rounded bg-bg-tertiary animate-pulse mb-2" />
            <div className="h-3 w-1/5 rounded bg-bg-tertiary animate-pulse" />
          </div>
        </header>

        <section className="flex-1 overflow-auto p-6 space-y-4 bg-bg">
          <div className="max-w-2xl mx-auto space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flex ${i % 3 !== 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="bg-bg-elevated rounded-2xl p-3 space-y-2 border border-border">
                  <div className="h-3 w-40 rounded bg-bg-tertiary animate-pulse" />
                  <div className="h-3 w-28 rounded bg-bg-tertiary animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="p-3 border-t border-border bg-bg-secondary">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-bg-tertiary animate-pulse" />
            <div className="flex-1 h-11 rounded-xl bg-bg-tertiary animate-pulse" />
            <div className="w-10 h-10 rounded-xl bg-bg-tertiary animate-pulse" />
          </div>
        </footer>
      </main>
    </motion.div>
  );
}
