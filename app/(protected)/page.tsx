/**
 * `app/(protected)/page.tsx`
 *
 * Sprint 4 — Dashboard (Pano).
 *
 * ŞantiyePro `resources/js/pages/dashboard.tsx` davranışı birebir korunur:
 *   - KPI kartları (aktif şantiyeler, toplam alacak, bu ay gider, bekleyen hakediş, en yakın ödeme)
 *   - Kritik ödemeler listesi
 *   - Son hareketler
 *
 * API'ler: GET /api/dashboard/stats + GET /api/dashboard/recent-activity
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  ChevronRight,
  Clock,
  Receipt,
  Wallet,
} from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import {
  useDashboardStats,
  useRecentActivity,
} from '@/hooks/use-santiyepro-api';
import { formatAmount, formatShortDate } from '@/lib/helpers';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'İyi geceler';
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function DashboardPage() {
  const statsQuery = useDashboardStats();
  const activityQuery = useRecentActivity(10);

  const stats = statsQuery.data?.stats;
  const activities = activityQuery.data?.activities ?? [];
  const nearest = stats?.critical_payments?.items?.[0] ?? null;

  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="flex flex-col gap-8 px-4 py-6 lg:px-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Projelerinizin bugünkü genel durumu aşağıda.
          </p>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Aktif Şantiyeler */}
        <Link
          href="/projects"
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <Building2 className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Aktif Şantiyeler
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading ? '—' : (stats?.active_projects ?? 0)}
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Devam eden projeler</span>
            <ChevronRight className="size-3.5" />
          </div>
        </Link>

        {/* Toplam Alacak */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <Wallet className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Toplam Alacak
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.total_collections ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            Tahsil edilecek
          </div>
        </div>

        {/* Bu Ay Gider */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-100 text-violet-700">
              <Receipt className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Bu Ay Gider
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.monthly_payments ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            Bu ay ödenen
          </div>
        </div>

        {/* Bekleyen Hakediş */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <Receipt className="size-5" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Bekleyen Hakediş
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsQuery.isLoading
              ? '—'
              : formatAmount(stats?.pending_progress_payments ?? 0)}
          </div>
          <div className="mt-auto text-sm font-medium text-muted-foreground">
            Sözleşme + Personel borçları
          </div>
        </div>
      </div>

      {/* En Yakın Ödeme — ayrı kart */}
      {nearest && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700">
                <Clock className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    En Yakın Ödeme
                  </span>
                  {nearest.status === 'overdue' && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                      Kritik
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xl font-bold text-foreground">
                  {formatAmount(nearest.amount ?? 0)}
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {nearest.name}
                  {nearest.date && ` · ${formatShortDate(nearest.date)}`}
                </div>
              </div>
            </div>
            {nearest.url && (
              <Link
                href={nearest.url}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Detay <ChevronRight className="size-3.5" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kritik Ödemeler + Son Hareketler */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Kritik Ödemeler */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <header className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                Kritik Ödemeler
              </h2>
            </header>
            {statsQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : stats?.critical_payments?.items?.length ? (
              <ul className="flex max-h-[400px] flex-col overflow-y-auto">
                {stats.critical_payments.items.map((payment) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted">
                        <span className="text-sm leading-none font-bold">
                          {payment.date
                            ? new Date(payment.date).getDate()
                            : '--'}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {payment.name || 'Ödeme'}
                        </span>
                        <span className="mt-0.5 block text-[13px] font-semibold text-muted-foreground">
                          {formatAmount(payment.amount)}
                        </span>
                      </span>
                      {payment.days_overdue > 0 && (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-700 uppercase">
                          {payment.days_overdue} Gün Gecikme
                        </span>
                      )}
                    </>
                  );
                  const rowBase =
                    '-mx-2 grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-md px-2 py-3';

                  return (
                    <li key={payment.id}>
                      {payment.url ? (
                        <Link
                          href={payment.url}
                          className={`${rowBase} transition-colors hover:bg-muted/50`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className={rowBase}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                title="Gecikmiş ödeme bulunmuyor"
                description="Tüm ödemeler zamanında."
              />
            )}
          </CardContent>
        </Card>

        {/* Son Hareketler */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <header className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                Son Hareketler
              </h2>
            </header>
            {activityQuery.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                title="Henüz aktivite yok"
                description="Yapılan ödemeler, tahsilatlar ve saha raporları burada listelenir."
              />
            ) : (
              <ul className="flex max-h-[400px] flex-col overflow-y-auto">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    {activity.href ? (
                      <Link
                        href={activity.href}
                        className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Receipt className="size-4 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {activity.description}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {activity.project}
                            {activity.date && ` · ${formatShortDate(activity.date)}`}
                          </span>
                        </span>
                        {activity.amount > 0 && (
                          <span
                            className={
                              'shrink-0 text-sm font-semibold ' +
                              (activity.type === 'payment'
                                ? 'text-red-600'
                                : activity.type === 'collection'
                                  ? 'text-emerald-600'
                                  : 'text-foreground')
                            }
                          >
                            {formatAmount(activity.amount)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Receipt className="size-4 text-muted-foreground" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {activity.description}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {activity.project}
                            {activity.date && ` · ${formatShortDate(activity.date)}`}
                          </span>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}