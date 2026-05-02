'use client';

import React, { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaces } from '@/context/WorkspaceContext';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical, 
  ChevronLeft,
  X,
  Edit3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Schedule, TaskStatus } from '@/types';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { workspaces, updateWorkspace, addSchedule, updateSchedule, deleteSchedule } = useWorkspaces();
  const router = useRouter();
  
  const workspace = workspaces.find((w) => w.id === id);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Schedule | null>(null);
  const [newTask, setNewTask] = useState<Omit<Schedule, 'id'>>({
    name: '',
    status: 'To Do',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Workspace not found</h2>
        <button onClick={() => router.push('/collection')} className="text-foreground/60 hover:text-foreground">
          Go back to collection
        </button>
      </div>
    );
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    addSchedule(workspace.id, newTask);
    setNewTask({
      name: '',
      status: 'To Do',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsAdding(false);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.name.trim()) return;
    updateSchedule(workspace.id, editingTask);
    setEditingTask(null);
  };

  const statusIcons = {
    'To Do': <Circle className="w-5 h-5" />,
    'In Progress': <Clock className="w-5 h-5 text-blue-500" />,
    'Done': <CheckCircle2 className="w-5 h-5 text-green-500" />,
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.push('/collection')}
            className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Collection
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-header font-extrabold tracking-tight">{workspace.name}</h1>
            <span className="px-3 py-1 bg-foreground/5 rounded-full text-xs font-bold uppercase tracking-widest opacity-40">
              {workspace.schedules.length} Tasks
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-foreground/10"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </header>

      {/* Task List */}
      <div className="space-y-4">
        {workspace.schedules.length === 0 && !isAdding && (
          <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl opacity-20">
            <p className="text-xl font-bold">No tasks yet. Click "Add Task" to start.</p>
          </div>
        )}

        <AnimatePresence mode='popLayout'>
          {workspace.schedules.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "group bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300",
                task.status === 'Done' && "opacity-60"
              )}
            >
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => {
                    const nextStatus: Record<TaskStatus, TaskStatus> = {
                      'To Do': 'In Progress',
                      'In Progress': 'Done',
                      'Done': 'To Do'
                    };
                    updateSchedule(workspace.id, { ...task, status: nextStatus[task.status] });
                  }}
                  className="hover:scale-110 transition-transform"
                >
                  {statusIcons[task.status]}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={cn(
                      "text-xl font-bold truncate",
                      task.status === 'Done' && "line-through decoration-2"
                    )}>
                      {task.name}
                    </h3>
                    <span className="text-xs font-bold opacity-30 px-2 py-0.5 border border-border rounded-md">
                      {task.status}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm opacity-60 line-clamp-1">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm font-bold opacity-40">
                    <Calendar className="w-4 h-4" />
                    {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingTask(task)}
                      className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('Delete this task?')) deleteSchedule(workspace.id, task.id);
                      }}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal Overlay */}
      <AnimatePresence>
        {(isAdding || editingTask) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAdding(false); setEditingTask(null); }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 z-[70]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-header font-bold">
                  {isAdding ? 'New Task' : 'Edit Task'}
                </h2>
                <button 
                  onClick={() => { setIsAdding(false); setEditingTask(null); }}
                  className="p-2 hover:bg-foreground/5 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={isAdding ? handleAddTask : handleUpdateTask} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Task Name</label>
                  <input
                    type="text"
                    required
                    value={isAdding ? newTask.name : editingTask?.name || ''}
                    onChange={(e) => isAdding 
                      ? setNewTask({ ...newTask, name: e.target.value })
                      : setEditingTask(editingTask ? { ...editingTask, name: e.target.value } : null)
                    }
                    className="w-full bg-foreground/5 border border-border rounded-xl p-4 font-bold focus:outline-none focus:border-foreground"
                    placeholder="What needs to be done?"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Status</label>
                    <select
                      value={isAdding ? newTask.status : editingTask?.status}
                      onChange={(e) => isAdding
                        ? setNewTask({ ...newTask, status: e.target.value as TaskStatus })
                        : setEditingTask(editingTask ? { ...editingTask, status: e.target.value as TaskStatus } : null)
                      }
                      className="w-full bg-foreground/5 border border-border rounded-xl p-4 font-bold focus:outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Due Date</label>
                    <input
                      type="date"
                      value={isAdding ? newTask.date : editingTask?.date}
                      onChange={(e) => isAdding
                        ? setNewTask({ ...newTask, date: e.target.value })
                        : setEditingTask(editingTask ? { ...editingTask, date: e.target.value } : null)
                      }
                      className="w-full bg-foreground/5 border border-border rounded-xl p-4 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2 block">Description</label>
                  <textarea
                    value={isAdding ? newTask.description : editingTask?.description || ''}
                    onChange={(e) => isAdding
                      ? setNewTask({ ...newTask, description: e.target.value })
                      : setEditingTask(editingTask ? { ...editingTask, description: e.target.value } : null)
                    }
                    className="w-full bg-foreground/5 border border-border rounded-xl p-4 font-medium focus:outline-none focus:border-foreground h-32 resize-none"
                    placeholder="Add more details..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-foreground text-background rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-foreground/10"
                >
                  {isAdding ? 'Create Task' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
