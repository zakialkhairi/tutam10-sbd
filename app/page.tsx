'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Sparkles } from 'lucide-react';
import { useWorkspaces } from '@/context/WorkspaceContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const { createWorkspace } = useWorkspaces();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!workspaceName.trim()) return;
    
    setIsCreating(true);
    const newWs = createWorkspace(workspaceName);
    
    // Smooth transition
    setTimeout(() => {
      router.push(`/workspace/${newWs.id}`);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <div className="relative inline-block mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image 
              src="/images/schedule.png" 
              alt="Schedule" 
              width={180} 
              height={180} 
              className="drop-shadow-2xl"
            />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -top-4 -right-4 bg-foreground text-background p-3 rounded-full shadow-xl"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>

        <h1 className="text-6xl font-header font-extrabold mb-6 tracking-tight">
          Ready to <span className="text-foreground/50 italic">organize</span>?
        </h1>
        <p className="text-lg opacity-60 mb-12 max-w-lg mx-auto">
          Create an isolated workspace for your next project, goal, or daily routine. Everything stays local, fast, and secure.
        </p>

        <form onSubmit={handleCreate} className="relative group max-w-md mx-auto">
          <input
            type="text"
            placeholder="Name your workspace..."
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="w-full h-16 bg-foreground/5 border-2 border-border rounded-2xl px-8 pr-32 text-xl font-bold focus:outline-none focus:border-foreground transition-all duration-300"
            autoFocus
          />
          <button
            type="submit"
            disabled={!workspaceName.trim() || isCreating}
            className="absolute right-2 top-2 h-12 px-6 bg-foreground text-background rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isCreating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                Create
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Isolated</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Local</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Private</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
