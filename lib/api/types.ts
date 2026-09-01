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

// ============================================
// TAHSİLAT (COLLECTION)
// ============================================

export type Collection = {
  id: string;
  sale_id?: string | null;
  project_id: string;
  category_id?: string | null;
  amount: number;
  currency?: string;
  collection_date?: string | null;
  payment_type?: string;
  description?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// İŞLEM (TRANSACTION — birleşik gelir/gider)
// ============================================

export type TransactionKind =
  | 'firm_payment'
  | 'employee_payment'
  | 'salary_payment'
  | 'collection'
  | 'owner_payment'
  | 'kd_payment'
  | 'kd_collection'
  | 'barter';

export type TransactionType = 'expense' | 'income';

export type TransactionSource = 'expense' | 'employee' | 'income';

export type Transaction = {
  id: string;
  type: TransactionType;
  source?: TransactionSource;
  kind: TransactionKind;
  amount: number;
  date?: string | null;
  payment_type?: string | null;
  description?: string | null;
  is_paid: boolean;
  due_date?: string | null;
  project_id?: string;
  project_name?: string;
  contract_id?: string | null;
  contract_name?: string | null;
  payment_source_id?: string | null;
  payment_source_name?: string | null;
  firm_id?: string | null;
  firm_name?: string | null;
  employee_id?: string | null;
  employee_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  manual_firm_name?: string | null;
  currency?: string;
};

export type TransactionTotals = {
  expense: number;
  income: number;
  net: number;
};

export type ProjectTransactionsResponse = {
  data: Transaction[];
  meta: PaginatedResponse<unknown>['meta'];
  links: PaginatedResponse<unknown>['links'];
  totals: TransactionTotals;
  overall_totals: TransactionTotals;
  overdue: { count: number; total: number };
};

// ============================================
// SÖZLEŞME (CONTRACT)
// ============================================

export type ContractType = 'fixed' | 'unit_based' | 'material';
export type ContractStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';

export type ContractDetail = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total?: number;
  completed_quantity?: number;
};

export type Contract = {
  id: string;
  name: string;
  type: ContractType;
  status: ContractStatus;
  total_amount: number;
  paid_amount?: number;
  start_date?: string;
  end_date?: string | null;
  description?: string | null;
  manual_progress?: number | null;
  firm_id?: string | null;
  firm?: { id: string; name: string } | null;
  details?: ContractDetail[];
  created_at?: string;
  updated_at?: string;
};

export type ProjectContractsResponse = {
  data: Contract[];
  meta: PaginatedResponse<unknown>['meta'];
  links: PaginatedResponse<unknown>['links'];
  totals: { total_amount: number; paid: number };
  summary: {
    total: number;
    active: number;
    total_amount: number;
    paid: number;
  };
};

// ============================================
// MALZEME (MATERIAL)
// ============================================

export type Material = {
  id: string;
  project_id: string;
  firm_id?: string | null;
  manual_supplier_name?: string | null;
  contract_id?: string | null;
  delivery_date?: string | null;
  ticket_number?: string | null;
  is_entitlement?: boolean;
  is_return?: boolean;
  description?: string | null;
  name: string;
  unit: string;
  amount: number;
  supplier_name?: string | null;
  supplier?: string | null;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// HAKEDİŞ (ENTITLEMENT)
// ============================================

export type EntitlementStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export type EntitlementDetail = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

export type Entitlement = {
  id: string;
  user_id?: string;
  project_id: string;
  firm_id?: string | null;
  firm_name?: string | null;
  contract_id?: string | null;
  delivery_date?: string | null;
  total_amount: number;
  status: EntitlementStatus;
  supplier_id?: string | null;
  supplier_name?: string | null;
  date?: string | null;
  details?: EntitlementDetail[];
  created_at?: string;
  updated_at?: string;
};

export type ProjectEntitlementsResponse = {
  data: Entitlement[];
  meta: PaginatedResponse<unknown>['meta'];
  links: PaginatedResponse<unknown>['links'];
  totals: { total_amount: number };
  summary: {
    total: number;
    approved: number;
    total_amount: number;
    pending_amount: number;
  };
};

// ============================================
// SAHA RAPORU (SITE REPORT)
// ============================================

export type SiteReportWeather =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'foggy';

export type SiteReportStatus = 'draft' | 'submitted' | 'approved';

export type SiteReportPhoto = {
  id: string;
  image: string;
  caption?: string | null;
  order?: number;
};

export type SiteReport = {
  id: string;
  project_id: string;
  project_name?: string;
  date: string;
  work_done?: string;
  work_summary?: string;
  obstacles?: string | null;
  blockers?: string | null;
  visitors?: string | null;
  report_date?: string;
  safety_notes?: string | null;
  weather?: SiteReportWeather | null;
  temperature_min_c?: number | null;
  temperature_max_c?: number | null;
  status: SiteReportStatus;
  photos?: SiteReportPhoto[];
  created_at?: string;
  updated_at?: string;
};

export type ProjectSiteReportsResponse = {
  data: SiteReport[];
  meta: PaginatedResponse<unknown>['meta'];
  links: PaginatedResponse<unknown>['links'];
  totals: { count: number; submitted: number };
  summary: {
    total: number;
    submitted: number;
    last_report_date: string | null;
  };
};

// ============================================
// ÇİZİM (DRAWING)
// ============================================

export type DrawingStatus = 'pending' | 'running' | 'success' | 'failed';

export type Drawing = {
  id: string;
  project_id: string;
  name: string;
  file_path?: string;
  file_size?: number | null;
  status: DrawingStatus;
  created_at?: string;
  updated_at?: string;
};

// ============================================
// PROJE FİRMA (PROJECT FIRMS)
// ============================================

export type ProjectFirm = Firm & {
  contracts_count?: number;
  project_paid?: number;
};

// ============================================
// PROJE PERSONEL (PROJECT PERSONNEL)
// ============================================

export type ProjectPersonnel = Personnel & {
  project_assignment?: PersonnelAssignment;
};