import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CircleAlert, HelpCircle, type LucideIcon } from 'lucide-react';

// Tarayıcının window.confirm / window.alert pencereleri yerine uygulamaya uygun, ekranın ortasında açılan pencere.
// Kullanım: const dialog = useDialog();
//   if (!(await dialog.confirm({ title: 'Delete note?', message: '...', confirmLabel: 'Delete', tone: 'danger' }))) return;
//   dialog.alert({ message: getErrorMessage(err) });

type Tone = 'danger' | 'default';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  icon?: LucideIcon;
}

interface AlertOptions {
  title?: string;
  message: ReactNode;
  buttonLabel?: string;
}

interface DialogApi {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

interface OpenDialog {
  kind: 'confirm' | 'alert';
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  tone: Tone;
  icon: LucideIcon;
  resolve: (value: boolean) => void;
}

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
  return ctx;
}

export default function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<OpenDialog | null>(null);

  // Açıkken yeni pencere istenirse önceki "vazgeçildi" sayılır.
  const open = useCallback((next: OpenDialog) => {
    setDialog((prev) => {
      prev?.resolve(false);
      return next;
    });
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      confirm: (o) =>
        new Promise<boolean>((resolve) =>
          open({
            kind: 'confirm',
            title: o.title,
            message: o.message,
            confirmLabel: o.confirmLabel ?? 'Confirm',
            cancelLabel: o.cancelLabel ?? 'Cancel',
            tone: o.tone ?? 'default',
            icon: o.icon ?? (o.tone === 'danger' ? AlertTriangle : HelpCircle),
            resolve,
          })
        ),
      alert: (o) =>
        new Promise<void>((resolve) =>
          open({
            kind: 'alert',
            title: o.title ?? 'Something went wrong',
            message: o.message,
            confirmLabel: o.buttonLabel ?? 'OK',
            cancelLabel: '',
            tone: 'danger',
            icon: CircleAlert,
            resolve: () => resolve(),
          })
        ),
    }),
    [open]
  );

  const close = (result: boolean) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && <DialogWindow dialog={dialog} onClose={close} />}
    </DialogContext.Provider>
  );
}

function DialogWindow({ dialog, onClose }: { dialog: OpenDialog; onClose: (result: boolean) => void }) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    // Yıkıcı işlemlerde odak "Cancel"da başlar: yanlışlıkla Enter'a basılınca bir şey silinmesin.
    firstButtonRef.current?.focus();
    // Yakalama aşamasında dinlenir ve durdurulur: altta açık bir pencere (örn. LikesModal) varsa Esc onu da kapatmasın.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onCloseRef.current(false);
    };
    window.addEventListener('keydown', onKey, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  const { kind, tone, icon: Icon } = dialog;
  const danger = tone === 'danger';

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation">
      <div
        className="dialog-backdrop absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]"
        onClick={() => onClose(false)}
        aria-hidden="true"
      />
      <div
        role={kind === 'alert' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={dialog.message ? 'dialog-message' : undefined}
        className="dialog-in relative w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-black/5"
      >
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ring-8 ${
            danger ? 'bg-rose-100 text-rose-600 ring-rose-50' : 'bg-navy-100 text-navy-600 ring-navy-50'
          }`}
        >
          <Icon size={26} />
        </span>
        <h2 id="dialog-title" className="mt-5 text-lg font-bold text-gray-900 break-words">
          {dialog.title}
        </h2>
        {dialog.message && (
          <p id="dialog-message" className="mt-2 text-sm leading-relaxed text-gray-600 break-words">
            {dialog.message}
          </p>
        )}

        {/* Çok dar telefonlarda butonlar alt alta (onay üstte), 380px ve üstünde yan yana. Dokunmatikte buton yüksekliği 44px. */}
        <div
          className={`mt-6 flex flex-col-reverse gap-2.5 ${
            kind === 'confirm' ? 'min-[380px]:grid min-[380px]:grid-cols-2' : ''
          }`}
        >
          {kind === 'confirm' && (
            <button ref={firstButtonRef} type="button" onClick={() => onClose(false)} className="btn-secondary min-h-11">
              {dialog.cancelLabel}
            </button>
          )}
          <button
            ref={kind === 'alert' ? firstButtonRef : undefined}
            type="button"
            onClick={() => onClose(true)}
            className={`min-h-11 ${
              danger && kind === 'confirm'
                ? 'btn-primary bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600'
                : 'btn-primary'
            }`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
