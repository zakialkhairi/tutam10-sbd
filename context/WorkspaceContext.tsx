'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Workspace, Schedule } from '@/types';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  addSchedule: (workspaceId: string, schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (workspaceId: string, schedule: Schedule) => Promise<void>;
  deleteSchedule: (workspaceId: string, scheduleId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async (name: string) => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    
    if (!res.ok) throw new Error('Failed to create workspace');
    
    const newWorkspace = await res.json();
    setWorkspaces((prev) => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const updateWorkspace = async (updated: Workspace) => {
    // Optimistic update
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    if (activeWorkspace?.id === updated.id) {
      setActiveWorkspace(updated);
    }
    
    await fetch(`/api/workspaces/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const deleteWorkspace = async (id: string) => {
    try {
      console.log('Deleting workspace with ID:', id);
      // Optimistic update
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspace?.id === id) {
        setActiveWorkspace(null);
      }

      const res = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete workspace');
      }
    } catch (error) {
      console.error(error);
      // Re-fetch workspaces to sync state if delete failed
      fetchWorkspaces();
    }
  };

  const addSchedule = async (workspaceId: string, scheduleData: Omit<Schedule, 'id'>) => {
    // Optimistic UI update
    const optimisticId = `temp-${Date.now()}`;
    const optimisticTask: Schedule = {
      ...scheduleData,
      id: optimisticId,
    };

    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return { ...w, schedules: [...w.schedules, optimisticTask] };
        }
        return w;
      })
    );

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
      
      if (!res.ok) throw new Error('Failed to add schedule');
      
      const newSchedule = await res.json();

      // Replace optimistic task with the real one from backend
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w.id === workspaceId) {
            return {
              ...w,
              schedules: w.schedules.map((s) => (s.id === optimisticId ? newSchedule : s)),
            };
          }
          return w;
        })
      );
    } catch (error) {
      console.error(error);
      // Revert optimistic update on error
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w.id === workspaceId) {
            return {
              ...w,
              schedules: w.schedules.filter((s) => s.id !== optimisticId),
            };
          }
          return w;
        })
      );
    }
  };

  const updateSchedule = async (workspaceId: string, updatedSchedule: Schedule) => {
    // Optimistic update
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return {
            ...w,
            schedules: w.schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)),
          };
        }
        return w;
      })
    );

    await fetch(`/api/workspaces/${workspaceId}/schedules/${updatedSchedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSchedule),
    });
  };

  const deleteSchedule = async (workspaceId: string, scheduleId: string) => {
    // Optimistic update
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return {
            ...w,
            schedules: w.schedules.filter((s) => s.id !== scheduleId),
          };
        }
        return w;
      })
    );

    await fetch(`/api/workspaces/${workspaceId}/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading,
        setActiveWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addSchedule,
        updateSchedule,
        deleteSchedule,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaces must be used within a WorkspaceProvider');
  }
  return context;
}
