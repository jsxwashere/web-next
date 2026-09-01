'use client';

import { Container } from '@/components/common/container';

/**
 * Sprint 2 — ŞantiyePro shell footer.
 * Basit, lisans + versiyon bilgisi.
 */
export function ShellFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer border-t border-border bg-background">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1 gap-2 font-normal text-sm text-muted-foreground">
            <span>
              {currentYear} &copy; ŞantiyePro — Tüm hakları saklıdır.
            </span>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            <a
              href="https://santiyepro.com.tr/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              Dokümanlar
            </a>
            <a
              href="https://santiyepro.com.tr/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              Gizlilik
            </a>
            <a
              href="https://santiyepro.com.tr/terms"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              Kullanım Şartları
            </a>
            <a
              href="https://santiyepro.com.tr/contact"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              İletişim
            </a>
          </nav>
        </div>
      </Container>
    </footer>
  );
}