'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Workspace, Schedule } from '@/types';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  createWorkspace: (name: string) => Workspace;
  updateWorkspace: (workspace: Workspace) => void;
  deleteWorkspace: (id: string) => void;
  addSchedule: (workspaceId: string, schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (workspaceId: string, schedule: Schedule) => void;
  deleteSchedule: (workspaceId: string, scheduleId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('workspaces');
    if (saved) {
      setWorkspaces(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  const createWorkspace = (name: string) => {
    const newWorkspace: Workspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'New Workspace',
      schedules: [],
      createdAt: Date.now(),
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const updateWorkspace = (updated: Workspace) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    if (activeWorkspace?.id === updated.id) {
      setActiveWorkspace(updated);
    }
  };

  const deleteWorkspace = (id: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspace?.id === id) {
      setActiveWorkspace(null);
    }
  };

  const addSchedule = (workspaceId: string, scheduleData: Omit<Schedule, 'id'>) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return { ...w, schedules: [...w.schedules, newSchedule] };
        }
        return w;
      })
    );
  };

  const updateSchedule = (workspaceId: string, updatedSchedule: Schedule) => {
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
  };

  const deleteSchedule = (workspaceId: string, scheduleId: string) => {
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
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
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
