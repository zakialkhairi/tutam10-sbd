export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Schedule {
  id: string;
  name: string;
  status: TaskStatus;
  date: string;
  description: string;
}

export interface Workspace {
  id: string;
  name: string;
  schedules: Schedule[];
  createdAt: number;
}
