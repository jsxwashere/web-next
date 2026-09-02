/**
 * `app/(protected)/projects/new/content.tsx`
 *
 * Sprint 7 — Yeni proje sihirbazı (client).
 *
 * 5 adımlı multi-step form (React Hook Form + Zod).
 * Her adım kendi validasyonunu çalıştırır; "İleri" sadece geçerli ise
 * aktif olur. Son adımda `POST /api/projects` mutation'ı çalışır ve
 * başarıda `/projects/{id}` detay sayfasına yönlendirilir.
 *
 * Step'ler `components/` altında:
 *   - step-1-basics.tsx
 *   - step-2-blocks.tsx
 *   - step-3-units.tsx
 *   - step-4-financials.tsx
 *   - step-5-review.tsx
 *
 * Davranış referansı: `.tmp-crawl/sp-deep/projeler-sihirbazi.md`
 *   - kind/details/taahhut/summary state_machine (:1185, :1194-1195)
 *   - "Hızlı Oluştur" davranışı kapsam dışı (Sprint 8+'te eklenebilir)
 *   - payload builder (:1209-1231)
 *   - "Lütfen işaretli alanları düzeltin" toast (:1260-1264)
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  LoaderCircleIcon,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateProject } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Stepper, StepperItem, StepperTrigger } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

import { BasicsStep } from './components/step-1-basics';
import { BlocksStep } from './components/step-2-blocks';
import { UnitsStep } from './components/step-3-units';
import { FinancialsStep } from './components/step-4-financials';
import { ReviewStep } from './components/step-5-review';
import {
  buildPayload,
  defaultWizardValues,
  fieldsForStep,
  WIZARD_STEPS,
  type WizardStep,
  type WizardValues,
  wizardSchema,
} from './schema';

export function NewProjectWizardContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set(),
  );

  const form = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: defaultWizardValues,
    mode: 'onBlur',
  });

  const createProject = useCreateProject();

  const currentStepIndex = useMemo(
    () => WIZARD_STEPS.findIndex((s) => s.id === currentStep),
    [currentStep],
  );

  const totalSteps = WIZARD_STEPS.length;

  const goNext = useCallback(async () => {
    const fields = fieldsForStep(currentStep) as Parameters<
      typeof form.trigger
    >[0];
    const ok = await form.trigger(fields, { shouldFocus: true });
    if (!ok) {
      toast.error(t('pages.projects.wizard.messages.fillRequired'));
      return;
    }
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    const next = WIZARD_STEPS[currentStepIndex + 1];
    if (next) {
      setCurrentStep(next.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, currentStepIndex, form, t]);

  const goBack = useCallback(() => {
    const prev = WIZARD_STEPS[currentStepIndex - 1];
    if (prev) {
      setCurrentStep(prev.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const onSubmit = useCallback(
    async (values: WizardValues) => {
      const payload = buildPayload(values);
      try {
        const res = await createProject.mutateAsync(payload);
        const newId = res?.data?.id;
        toast.success(t('pages.projects.wizard.messages.created'));
        if (newId) {
          router.push(`/projects/${newId}`);
        } else {
          router.push('/projects');
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? (err.payload as { message?: string })?.message ?? err.message
            : err instanceof Error
              ? err.message
              : t('pages.projects.wizard.messages.createFailed');
        toast.error(message);
        form.setError('root', { message });
      }
    },
    [createProject, form, router, t],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h1 className="text-base font-medium">
              {t('pages.projects.wizard.title')}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('pages.projects.wizard.subtitle')}
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <X className="size-4" />
            {t('common.buttons.cancel')}
          </Link>
        </Button>
      </header>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t('pages.projects.wizard.stepLabel', {
              current: currentStepIndex + 1,
              total: totalSteps,
            })}
          </span>
          <span className="font-medium text-foreground">
            {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <Progress
          value={((currentStepIndex + 1) / totalSteps) * 100}
          className="h-1.5"
        />
      </div>

      {/* Stepper (görsel ipucu) */}
      <Stepper
        value={currentStepIndex + 1}
        onValueChange={(step) => {
          const target = WIZARD_STEPS[step - 1]?.id;
          if (!target) return;
          // Geriye doğru serbest; ileriye doğru sadece tamamlanmış adımlara.
          const targetIdx = WIZARD_STEPS.findIndex((s) => s.id === target);
          if (targetIdx <= currentStepIndex || completedSteps.has(target)) {
            setCurrentStep(target);
          }
        }}
        className="rounded-lg border border-border bg-card p-1.5"
      >
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id);
          const isActive = step.id === currentStep;
          return (
            <StepperItem
              key={step.id}
              step={idx + 1}
              completed={isCompleted}
              className="flex-1"
            >
              <StepperTrigger
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors',
                  isActive && 'bg-primary/10',
                  !isActive && isCompleted && 'hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && !isActive && 'bg-primary/20 text-primary',
                    !isActive &&
                      !isCompleted &&
                      'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="size-3.5" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(`pages.projects.wizard.${step.titleKey}`)}
                </span>
              </StepperTrigger>
            </StepperItem>
          );
        })}
      </Stepper>

      {/* Form body */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t(`pages.projects.wizard.${currentStepTitle(currentStep)}`)}
              </CardTitle>
              <CardDescription className="text-xs">
                {t(
                  `pages.projects.wizard.fields.${currentStepDescription(currentStep)}`,
                )}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              {currentStep === 'basics' && <BasicsStep />}
              {currentStep === 'blocks' && <BlocksStep />}
              {currentStep === 'units' && <UnitsStep />}
              {currentStep === 'financials' && <FinancialsStep />}
              {currentStep === 'review' && <ReviewStep values={form.watch()} />}
            </CardContent>
          </Card>

          {form.formState.errors.root && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Sticky footer with navigation */}
          <footer className="sticky bottom-0 -mx-4 -mb-6 flex items-center justify-between gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentStepIndex === 0 || createProject.isPending}
              className="gap-1.5"
            >
              <ArrowLeft className="size-4" />
              {t('pages.projects.wizard.back')}
            </Button>

            {currentStep !== 'review' ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={createProject.isPending}
                className="gap-1.5"
              >
                {t('pages.projects.wizard.next')}
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="gap-1.5"
              >
                {createProject.isPending ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin" />
                    {t('pages.projects.wizard.saving')}
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    {t('pages.projects.wizard.save')}
                  </>
                )}
              </Button>
            )}
          </footer>
        </form>
      </Form>
    </div>
  );
}

function currentStepTitle(step: WizardStep): string {
  switch (step) {
    case 'basics':
      return 'steps.basics';
    case 'blocks':
      return 'steps.blocks';
    case 'units':
      return 'steps.units';
    case 'financials':
      return 'steps.financials';
    case 'review':
      return 'steps.review';
  }
}

function currentStepDescription(step: WizardStep): string {
  switch (step) {
    case 'basics':
      return 'blocksHelp';
    case 'blocks':
      return 'blocksHelp';
    case 'units':
      return 'unitsHelp';
    case 'financials':
      return 'budgetPlaceholder';
    case 'review':
      return 'reviewHelp';
  }
}