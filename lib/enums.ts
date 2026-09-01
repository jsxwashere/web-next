/**
 * `lib/enums.ts`
 *
 * Sprint 4 — ŞantiyePro enum tanımları (web-next'e taşınan).
 *
 * Backend enum değerleri ile birebir aynı değerleri kullanır.
 * Değişiklik tek noktadan (buradan) yapılır.
 */

export type BadgeVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'destructive';

// ============================================
// PROJE
// ============================================

export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PASSIVE: 'passive',
  IN_PROGRESS: 'in_progress',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Aktif',
  [ProjectStatus.COMPLETED]: 'Tamamlandı',
  [ProjectStatus.PASSIVE]: 'Pasif',
  [ProjectStatus.IN_PROGRESS]: 'Devam Ediyor',
};

export const ProjectStatusVariants: Record<ProjectStatus, BadgeVariant> = {
  [ProjectStatus.ACTIVE]: 'success',
  [ProjectStatus.COMPLETED]: 'info',
  [ProjectStatus.PASSIVE]: 'destructive',
  [ProjectStatus.IN_PROGRESS]: 'success',
};

export const ProjectType = {
  OWN_LAND: 'own_land',
  CONTRACT: 'contract',
  URBAN_RENEWAL: 'urban_renewal',
  CO_BUILD: 'co_build',
} as const;
export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];

export const ProjectTypeLabels: Record<ProjectType, string> = {
  [ProjectType.OWN_LAND]: 'Kendi Arsana',
  [ProjectType.CONTRACT]: 'Taahhüt',
  [ProjectType.URBAN_RENEWAL]: 'Kentsel Dönüşüm',
  [ProjectType.CO_BUILD]: 'Kat Karşılığı',
};

// ============================================
// FİRMA
// ============================================

export const FirmType = {
  PROVIDER: 'provider',
  SUBCONTRACTOR: 'subcontractor',
  WORKER: 'worker',
  INSTITUTION: 'institution',
  OTHER: 'other',
} as const;
export type FirmType = (typeof FirmType)[keyof typeof FirmType];

export const FirmTypeLabels: Record<FirmType, string> = {
  [FirmType.PROVIDER]: 'Tedarikçi',
  [FirmType.SUBCONTRACTOR]: 'Taşeron',
  [FirmType.WORKER]: 'İşçi',
  [FirmType.INSTITUTION]: 'Kurum',
  [FirmType.OTHER]: 'Diğer',
};

export const FirmTypeVariants: Record<FirmType, BadgeVariant> = {
  [FirmType.PROVIDER]: 'info',
  [FirmType.SUBCONTRACTOR]: 'warning',
  [FirmType.WORKER]: 'success',
  [FirmType.INSTITUTION]: 'secondary',
  [FirmType.OTHER]: 'secondary',
};

// ============================================
// PERSONEL
// ============================================

export const PersonnelStatus = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  LEFT: 'left',
} as const;
export type PersonnelStatus =
  (typeof PersonnelStatus)[keyof typeof PersonnelStatus];

export const PersonnelStatusLabels: Record<PersonnelStatus, string> = {
  [PersonnelStatus.ACTIVE]: 'Aktif',
  [PersonnelStatus.PASSIVE]: 'Pasif',
  [PersonnelStatus.LEFT]: 'Ayrıldı',
};

export const PersonnelStatusVariants: Record<PersonnelStatus, BadgeVariant> = {
  [PersonnelStatus.ACTIVE]: 'success',
  [PersonnelStatus.PASSIVE]: 'warning',
  [PersonnelStatus.LEFT]: 'secondary',
};

export const SalaryType = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;
export type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

export const SalaryTypeLabels: Record<SalaryType, string> = {
  [SalaryType.DAILY]: 'Günlük',
  [SalaryType.WEEKLY]: 'Haftalık',
  [SalaryType.MONTHLY]: 'Aylık',
};

// ============================================
// DEKONT
// ============================================

export const ReceiptStatus = {
  PENDING: 'pending',
  EXTRACTED: 'extracted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  FAILED: 'failed',
} as const;
export type ReceiptStatus = (typeof ReceiptStatus)[keyof typeof ReceiptStatus];

export const ReceiptStatusLabels: Record<ReceiptStatus, string> = {
  [ReceiptStatus.PENDING]: 'Okunuyor',
  [ReceiptStatus.EXTRACTED]: 'İnceleme bekliyor',
  [ReceiptStatus.ACCEPTED]: 'Kaydedildi',
  [ReceiptStatus.REJECTED]: 'Reddedildi',
  [ReceiptStatus.FAILED]: 'Okunamadı',
};

export const ReceiptStatusVariants: Record<ReceiptStatus, BadgeVariant> = {
  [ReceiptStatus.PENDING]: 'info',
  [ReceiptStatus.EXTRACTED]: 'warning',
  [ReceiptStatus.ACCEPTED]: 'success',
  [ReceiptStatus.REJECTED]: 'secondary',
  [ReceiptStatus.FAILED]: 'destructive',
};

/** Dekont kayıt türleri */
export const ReceiptRecordType = {
  SUPPLIER_PAYMENT: 'supplier_payment',
  EMPLOYEE_PAYMENT: 'employee_payment',
  OWNER_PAYMENT: 'owner_payment',
  KD_PAYMENT: 'kd_payment',
} as const;
export type ReceiptRecordType =
  (typeof ReceiptRecordType)[keyof typeof ReceiptRecordType];

export const ReceiptRecordTypeLabels: Record<ReceiptRecordType, string> = {
  [ReceiptRecordType.SUPPLIER_PAYMENT]: 'Firma Ödemesi',
  [ReceiptRecordType.EMPLOYEE_PAYMENT]: 'Personel Ödemesi',
  [ReceiptRecordType.OWNER_PAYMENT]: 'Mal Sahibi Tahsilatı',
  [ReceiptRecordType.KD_PAYMENT]: 'Kentsel Dönüşüm Tahsilatı',
};

// ============================================
// PERSONEL ROLÜ (Türkçe label haritası)
// ============================================

export const PersonnelRoleLabels: Record<string, string> = {
  worker: 'İşçi',
  foreman: 'Usta',
  lead_worker: 'Kalfa',
  site_supervisor: 'Şantiye Şefi',
  electrician: 'Elektrikçi',
  plumber: 'Tesisatçı',
  carpenter: 'Marangoz',
  painter: 'Boyacı',
  mason: 'Duvarcı',
  welder: 'Kaynakçı',
  operator_worker: 'Operatör',
  security: 'Güvenlik',
  driver: 'Şoför',
  engineer: 'Mühendis',
  usta: 'Usta',
  kalfa: 'Kalfa',
  duz_isci: 'Düz İşçi',
  santiye_sefi: 'Şantiye Şefi',
  operator: 'Operatör',
  bekci: 'Bekçi',
  kaynakci: 'Kaynakçı',
  demirci: 'Demirci',
  kalipci: 'Kalıpçı',
  boyaci: 'Boyacı',
  other: 'Diğer',
};

// ============================================
// SÖZLEŞME (CONTRACT)
// ============================================

export const ContractType = {
  FIXED: 'fixed',
  UNIT_BASED: 'unit_based',
  MATERIAL: 'material',
} as const;
export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.FIXED]: 'Sabit Fiyat',
  [ContractType.UNIT_BASED]: 'Birim Fiyatlı',
  [ContractType.MATERIAL]: 'Malzeme',
};

export const ContractTypeVariants: Record<ContractType, BadgeVariant> = {
  [ContractType.FIXED]: 'info',
  [ContractType.UNIT_BASED]: 'warning',
  [ContractType.MATERIAL]: 'secondary',
};

export const ContractStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Taslak',
  [ContractStatus.ACTIVE]: 'Aktif',
  [ContractStatus.IN_PROGRESS]: 'Devam Ediyor',
  [ContractStatus.COMPLETED]: 'Tamamlandı',
  [ContractStatus.CANCELLED]: 'İptal',
};

export const ContractStatusVariants: Record<ContractStatus, BadgeVariant> = {
  [ContractStatus.DRAFT]: 'secondary',
  [ContractStatus.ACTIVE]: 'success',
  [ContractStatus.IN_PROGRESS]: 'info',
  [ContractStatus.COMPLETED]: 'info',
  [ContractStatus.CANCELLED]: 'destructive',
};

// ============================================
// HAKEDİŞ (ENTITLEMENT)
// ============================================

export const EntitlementStatus = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type EntitlementStatus =
  (typeof EntitlementStatus)[keyof typeof EntitlementStatus];

export const EntitlementStatusLabels: Record<EntitlementStatus, string> = {
  [EntitlementStatus.PENDING]: 'Bekliyor',
  [EntitlementStatus.IN_REVIEW]: 'İncelemede',
  [EntitlementStatus.APPROVED]: 'Onaylandı',
  [EntitlementStatus.REJECTED]: 'Reddedildi',
};

export const EntitlementStatusVariants: Record<EntitlementStatus, BadgeVariant> = {
  [EntitlementStatus.PENDING]: 'warning',
  [EntitlementStatus.IN_REVIEW]: 'info',
  [EntitlementStatus.APPROVED]: 'success',
  [EntitlementStatus.REJECTED]: 'destructive',
};

// ============================================
// SAHA RAPORU (SITE REPORT)
// ============================================

export const SiteReportWeather = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  STORMY: 'stormy',
  SNOWY: 'snowy',
  FOGGY: 'foggy',
} as const;
export type SiteReportWeather =
  (typeof SiteReportWeather)[keyof typeof SiteReportWeather];

export const SiteReportWeatherLabels: Record<SiteReportWeather, string> = {
  [SiteReportWeather.SUNNY]: 'Güneşli',
  [SiteReportWeather.CLOUDY]: 'Bulutlu',
  [SiteReportWeather.RAINY]: 'Yağmurlu',
  [SiteReportWeather.STORMY]: 'Fırtınalı',
  [SiteReportWeather.SNOWY]: 'Karlı',
  [SiteReportWeather.FOGGY]: 'Sisli',
};

export const SiteReportStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
} as const;
export type SiteReportStatus =
  (typeof SiteReportStatus)[keyof typeof SiteReportStatus];

export const SiteReportStatusLabels: Record<SiteReportStatus, string> = {
  [SiteReportStatus.DRAFT]: 'Taslak',
  [SiteReportStatus.SUBMITTED]: 'Gönderildi',
  [SiteReportStatus.APPROVED]: 'Onaylandı',
};

export const SiteReportStatusVariants: Record<SiteReportStatus, BadgeVariant> = {
  [SiteReportStatus.DRAFT]: 'secondary',
  [SiteReportStatus.SUBMITTED]: 'info',
  [SiteReportStatus.APPROVED]: 'success',
};

// ============================================
// ÇİZİM (DRAWING)
// ============================================

export const DrawingStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;
export type DrawingStatus = (typeof DrawingStatus)[keyof typeof DrawingStatus];

export const DrawingStatusLabels: Record<DrawingStatus, string> = {
  [DrawingStatus.PENDING]: 'Bekliyor',
  [DrawingStatus.RUNNING]: 'İşleniyor',
  [DrawingStatus.SUCCESS]: 'Tamamlandı',
  [DrawingStatus.FAILED]: 'Başarısız',
};

export const DrawingStatusVariants: Record<DrawingStatus, BadgeVariant> = {
  [DrawingStatus.PENDING]: 'secondary',
  [DrawingStatus.RUNNING]: 'info',
  [DrawingStatus.SUCCESS]: 'success',
  [DrawingStatus.FAILED]: 'destructive',
};

// ============================================
// TAHSİLAT ÖDEME TİPİ (PAYMENT TYPE)
// ============================================

export const PaymentTypeLabels: Record<string, string> = {
  cash: 'Nakit',
  bank_transfer: 'Havale/EFT',
  check: 'Çek',
  credit_card: 'Kredi Kartı',
  promissory_note: 'Senet',
  barter: 'Takas',
  other: 'Diğer',
};

// ============================================
// TRANSACTION KIND → İNSAN OKUR KAYNAK
// ============================================

export const TransactionKindLabels: Record<string, string> = {
  firm_payment: 'Firma Ödemesi',
  employee_payment: 'Personel Ödemesi',
  salary_payment: 'Maaş',
  collection: 'Tahsilat',
  owner_payment: 'Mal Sahibi Ödemesi',
  kd_payment: 'KD Ödemesi',
  kd_collection: 'KD Tahsilatı',
  barter: 'Takas',
};