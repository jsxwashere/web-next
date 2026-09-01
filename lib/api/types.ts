/**
 * `lib/api/types.ts`
 *
 * Sprint 4 — ŞantiyePro API tipleri.
 *
 * Backend `app/Models/*` ve `app/Http/Resources/*` ile uyumlu.
 * Sadece Sprint 4'te kullanılan (Dashboard + global sayfalar) tipler.
 */

import type {
  FirmType,
  PersonnelStatus,
  ProjectStatus,
  ProjectType,
  ReceiptStatus,
  SalaryType,
} from '@/lib/enums';

// ============================================
// STANDART YANITLAR
// ============================================

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
};

export type ValidationErrors = Record<string, string[]>;

export type QueryParams = {
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
};

// ============================================
// PROJE
// ============================================

export type Project = {
  id: string;
  name: string;
  location?: string | null;
  type: ProjectType;
  status: ProjectStatus;
  progress?: number;
  budget?: number;
  taahhut_tutar?: number;
  kdv_orani?: number;
  kar_orani?: number;
  total_units?: number;
  sold_count?: number;
  landowner_units?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// FİRMA
// ============================================

export type Firm = {
  id: string;
  name: string;
  type: FirmType;
  is_active?: boolean;
  specialty?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  tax_number?: string | null;
  tax_office?: string | null;
  notes?: string | null;
  photo?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// PERSONEL
// ============================================

export type PersonnelAssignment = {
  project: string;
  employee: string;
  project_name: string;
  is_active: boolean;
  entry_date?: string | null;
  exit_date?: string | null;
  role_at_site?: string | null;
  salary_type?: SalaryType;
  daily_wage?: number | null;
  weekly_salary?: number | null;
  monthly_salary?: number | null;
  pivot_id?: string;
};

export type Personnel = {
  id: string;
  name: string;
  tc_no?: string | null;
  sgk_no?: string | null;
  phone?: string | null;
  position?: string | null;
  custom_role?: string | null;
  role?: string | null;
  status: PersonnelStatus;
  birth_date?: string | null;
  iban?: string | null;
  address?: string | null;
  notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  assigned_project_ids?: string[];
  assignments?: PersonnelAssignment[];
  photo?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// DEKONT
// ============================================

export type ReceiptExtraction = {
  source: string;
  confidence: number;
  needs_review: boolean;
  direction?: string;
  sender?: { name: string; iban: string; bank: string };
  receiver?: { name: string; iban: string; bank: string };
  date?: string;
  amount?: number;
  currency?: string;
  description?: string;
  reference?: string;
  warnings?: string[];
};

export type ReceiptSuggestion = {
  direction?: string;
  record?: string;
  counterparty_name?: string;
  counterparty_iban?: string;
  payment_source?: string;
  entity_kind?: string;
  amount?: string;
  currency?: string;
  amount_try?: string;
  fx_rate?: number | null;
  date?: string;
  duplicate_of?: { label?: string } | null;
  warnings?: string[];
};

export type ReceiptItem = {
  id: string;
  status: ReceiptStatus;
  original_name?: string;
  file?: string;
  extraction?: ReceiptExtraction;
  suggestion?: ReceiptSuggestion;
  relation?: string;
  relation_id?: string;
  batch_key?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// DASHBOARD
// ============================================

export type DashboardDebtRow = {
  id: string;
  name: string;
  project: string | null;
  amount: number;
  currency: string;
  section: string;
};

export type DashboardCriticalItem = {
  id: string;
  date: string | null;
  name: string;
  amount: number;
  payment_type?: string | null;
  status: 'overdue' | 'upcoming' | 'pending';
  days_overdue: number;
  url: string | null;
};

export type DashboardCriticalPayments = {
  items: DashboardCriticalItem[];
  summary: {
    overdue_count: number;
    overdue_total: number;
    upcoming_count: number;
    upcoming_total: number;
    pending_total: number;
  };
};

export type DashboardStats = {
  total_projects: number;
  active_projects: number;
  total_firms: number;
  total_contracts: number;
  total_personnel: number;
  total_sales: number;
  total_payments: number;
  total_collections: number;
  total_materials: number;
  monthly_payments: number;
  monthly_collections: number;
  upcoming_payments: number;
  pending_payments: number;
  pending_progress_payments: number;
  debt_rows: DashboardDebtRow[];
  nearest_payment?: {
    id: string;
    firm_name: string;
    project_name: string;
    amount: number;
    date: string;
    days_overdue: number;
    is_overdue: boolean;
  };
  critical_payments: DashboardCriticalPayments;
};

export type DashboardRecentActivity = {
  id: string;
  type: 'payment' | 'collection' | 'site_report';
  description: string;
  project: string | null;
  date: string | null;
  amount: number;
  href: string | null;
};