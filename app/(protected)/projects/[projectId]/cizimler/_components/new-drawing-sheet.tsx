/**
 * `cizimler/_components/new-drawing-sheet.tsx`
 *
 * Sprint 6.5 — Yeni çizim (DWG) yükleme drawer'ı.
 *
 * API: POST /api/drawings (multipart).
 * Çizim parse_status backend tarafında atanır (pending/running/success/failed).
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/hooks/useTranslation';
import { useCreateDrawing } from '@/hooks/use-santiyepro-api';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const ALLOWED_EXT = ['.dwg', '.dxf'];
const MAX_SIZE_MB = 50;

const drawingSchema = z.object({
  name: z.string().min(2, 'validation.minLength').max(200),
  file: z
    .custom<File | null>(
      (v) => v instanceof File,
      { message: 'Dosya seçilmedi' },
    )
    .refine((file) => file !== null && file.size <= MAX_SIZE_MB * 1024 * 1024, {
      message: `Dosya ${MAX_SIZE_MB}MB'dan büyük olamaz`,
    })
    .refine(
      (file) => {
        if (file === null) return false;
        const lower = file.name.toLowerCase();
        return ALLOWED_EXT.some((ext) => lower.endsWith(ext));
      },
      { message: 'Sadece .dwg veya .dxf dosyaları desteklenir' },
    ),
});

type DrawingFormValues = z.infer<typeof drawingSchema>;

const defaultValues: DrawingFormValues = {
  name: '',
  file: null as unknown as File,
};

export function NewDrawingSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const { t } = useTranslation();
  const createMutation = useCreateDrawing(projectId);
  const [fileLabel, setFileLabel] = useState<string>('');

  const form = useForm<DrawingFormValues>({
    resolver: zodResolver(drawingSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        file: data.file,
      });
      toast.success(t('pages.projectTabs.forms.newDrawing.success'));
      onOpenChange(false);
      form.reset(defaultValues);
      setFileLabel('');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.payload as { message?: string })?.message ?? err.message
          : err instanceof Error
            ? err.message
            : t('pages.projectTabs.forms.newDrawing.error');
      toast.error(message);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('pages.projectTabs.forms.newDrawing.title')}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <SheetBody className="flex-1 space-y-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newDrawing.name')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'pages.projectTabs.forms.newDrawing.namePlaceholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {t('pages.projectTabs.forms.newDrawing.file')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-6 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
                          <Upload className="size-4" />
                          <span>
                            {fileLabel || 'Dosya seçmek için tıklayın'}
                          </span>
                          <input
                            type="file"
                            accept=".dwg,.dxf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFileLabel(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                                onChange(file);
                                if (!form.getValues('name')) {
                                  const stem = file.name
                                    .replace(/\.[^.]+$/, '');
                                  form.setValue('name', stem);
                                }
                              }
                            }}
                            {...field}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {t('pages.projectTabs.forms.newDrawing.fileHint')}
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SheetBody>

            <SheetFooter className="border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {t('common.buttons.cancel')}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <LoaderCircleIcon className="me-1 size-4 animate-spin" />
                )}
                {createMutation.isPending
                  ? t('pages.projectTabs.forms.actions.uploading')
                  : t('common.buttons.save')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}