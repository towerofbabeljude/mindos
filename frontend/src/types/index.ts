export interface UserProfile {
  name: string;
  academic_standing: string;
  degree_department: string;
  email?: string;
}

export interface DashboardMetrics {
  stress: number;
  sleep: number;
  workload: number;
  energy: number;
  productivity: number;
}

export interface WorkloadSummary {
  total_hours: number;
  high_priority_count: number;
  overdue_count: number;
  pending_count: number;
  daily_pressure_score: number;
}

export interface Intervention {
  id: number;
  user_id: number;
  risk_event_id?: number;
  type: string;
  title: string;
  reason: string;
  steps: string[];
  is_accepted?: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface DashboardData {
  user_name: string;
  status: 'STABLE' | 'WATCH' | 'CHANGES_DETECTED' | 'SIGNIFICANT_CHANGE';
  signal_strength: number;
  headline: string;
  explanation: string;
  metrics: DashboardMetrics;
  baselines: Record<string, number>;
  changes: string[];
  workload: WorkloadSummary;
  recent_trend: Array<{
    date: string;
    sleep: number;
    stress: number;
    workload: number;
    energy: number;
    productivity: number;
    happiness: number;
  }>;
  active_intervention?: Intervention | null;
  remind_completed_today: boolean;
  task_deadlines: string[];
  is_crunch_mode: boolean;
}

export interface AcademicTask {
  id: number;
  user_id: number;
  title: string;
  course: string;
  deadline: string;
  estimated_hours: number;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export interface CheckInPayload {
  stress: number;
  energy: number;
  sleep_hours: number;
  workload: number;
  social_connection: number;
  productivity: number;
  happiness: number;
  tags: string[];
  notes?: string;
}

export interface FeatureBaseline {
  feature_name: string;
  mean: number;
  std_dev: number;
  current_7d_avg: number;
  deviation: number;
  deviation_percent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface InsightsData {
  status: string;
  signal_strength: number;
  headline: string;
  explanation: string;
  factors: string[];
  ml_anomaly_score: number;
  is_ml_anomaly: boolean;
  feature_analysis: Record<string, FeatureBaseline>;
}

export interface ReMindSessionPayload {
  activity_type: 'focus' | 'memory' | 'reaction' | 'reset' | 'reflection' | 'sort_it' | 'card_matching' | 'dinosaur' | 'yarn_unspinning' | (string & {});
  accuracy: number;
  reaction_time?: number;
  completion_time?: number;
  score: number;
  metadata_info?: string;
}

export interface SimulationResult {
  original_workload_hours: number;
  simulated_workload_hours: number;
  original_pressure_percent: number;
  simulated_pressure_percent: number;
  relief_percent: number;
  explanation: string;
}
