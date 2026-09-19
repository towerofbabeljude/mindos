import {
  DashboardData,
  AcademicTask,
  CheckInPayload,
  InsightsData,
  ReMindSessionPayload,
  SimulationResult,
  Intervention
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API Error ${response.status}: ${errText}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<DashboardData>('/dashboard'),

  // User Profile
  getUserProfile: () => fetchJson<{ name: string; academic_standing: string; degree_department: string; email?: string }>('/auth/user-profile'),
  updateUserProfile: (data: { name?: string; academic_standing?: string; degree_department?: string }) =>
    fetchJson<{ name: string; academic_standing: string; degree_department: string; email?: string }>('/auth/user-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Check-ins
  submitCheckIn: (data: CheckInPayload) =>
    fetchJson<any>('/checkins', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getCheckIns: (limit = 14) => fetchJson<any[]>(`/checkins?limit=${limit}`),

  // Tasks
  getTasks: () => fetchJson<AcademicTask[]>('/tasks'),
  createTask: (task: Partial<AcademicTask>) =>
    fetchJson<AcademicTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    }),
  updateTask: (id: number, task: Partial<AcademicTask>) =>
    fetchJson<AcademicTask>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    }),
  deleteTask: (id: number) =>
    fetchJson<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE'
    }),

  // ReMind
  recordReMind: (payload: ReMindSessionPayload) =>
    fetchJson<any>('/remind/session', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getReMindHistory: () => fetchJson<any[]>('/remind/history'),

  // Insights / SilentSignals
  getInsights: () => fetchJson<InsightsData>('/analysis/insights'),

  // Interventions
  getInterventions: () => fetchJson<Intervention[]>('/interventions'),
  takeInterventionAction: (id: number, action: 'accept' | 'dismiss') =>
    fetchJson<{ status: string; action: string }>(`/interventions/${id}/action?action=${action}`, {
      method: 'POST'
    }),
  submitInterventionFeedback: (id: number, rating: number, helpful: string, feedback?: string) =>
    fetchJson<any>(`/interventions/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, helpful, feedback })
    }),

  // Simulation
  simulateWorkload: (postponedTaskIds: number[], reducedHoursPercent: number) =>
    fetchJson<SimulationResult>('/simulation/workload', {
      method: 'POST',
      body: JSON.stringify({
        postponed_task_ids: postponedTaskIds,
        reduced_hours_percent: reducedHoursPercent
      })
    }),

  // Hackathon Demo Mode
  seedDemo: (mode: 'normal' | 'stressful') =>
    fetchJson<{ message: string; mode: string }>(`/demo/seed?mode=${mode}`, {
      method: 'POST'
    })
};
