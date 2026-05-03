'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaces } from '@/context/WorkspaceContext';
import { Trash2, Calendar, ChevronRight, Folder } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CollectionPage() {
  const { workspaces, isLoading, deleteWorkspace } = useWorkspaces();
  const router = useRouter();

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-header font-extrabold mb-4 tracking-tight">Your Collection</h1>
        <p className="text-foreground/60 max-w-xl">
          Everything you've created, organized by workspace. Access your schedules and track your progress here.
        </p>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-xl font-bold opacity-50">Loading collection...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-3xl"
        >
          <Folder className="w-16 h-16 opacity-10 mb-4" />
          <p className="text-xl font-bold opacity-30">No workspaces yet</p>
          <Link 
            href="/"
            className="mt-6 px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
          >
            Create your first workspace
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {workspaces.map((ws, idx) => (
              <motion.div
                key={ws.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-card border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-foreground/5 transition-all duration-500"
              >
                {/* Clickable Area - Card Body */}
                <div
                  onClick={() => router.push(`/workspace/${ws.id}`)}
                  className="w-full text-left p-8 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                      <Folder className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-header font-bold mb-2 group-hover:translate-x-1 transition-transform">{ws.name}</h3>
                  
                  <div className="flex items-center gap-4 text-sm font-bold opacity-40">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ws.createdAt).toLocaleDateString()}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-current" />
                    <div>{ws.schedules.length} Tasks</div>
                  </div>

                  <div className="mt-8 space-y-3">
                    {ws.schedules.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 text-sm">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.status === 'Done' ? "bg-green-500" : task.status === 'In Progress' ? "bg-blue-500" : "bg-foreground/20"
                        )} />
                        <span className="truncate font-medium opacity-60">{task.name}</span>
                      </div>
                    ))}
                    {ws.schedules.length > 3 && (
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">
                        + {ws.schedules.length - 3} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Absolute Delete Button - Always clickable, outside the main click handler */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkspace(ws.id);
                  }}
                  className="absolute top-8 right-8 p-3 text-red-500/20 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all z-20"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 pointer-events-none">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
