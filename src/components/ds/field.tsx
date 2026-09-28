'use client';
import { forwardRef, useId } from 'react';
import { Check, Minus, type LucideIcon } from 'lucide-react';

/** Estilo base de controles de formulario: alto 42, radio 10, anillo de foco. */
export const controlClass = (error?: boolean) =>
  `flex min-h-[42px] w-full items-center rounded-btn border bg-card text-[14px] text-navy transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-focus ${
    error ? 'border-error' : 'border-line hover:border-line-strong'
  }`;

/** Etiqueta + control + ayuda/error debajo. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  htmlFor,
  className = '',
}: {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-[12.5px] font-semibold text-navy"
        >
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] text-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>
      )}
    </div>
  );
}

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'prefix'
> & {
  icon?: LucideIcon;
  /** Texto fijo antes (p. ej. "$", "+52"). */
  prefix?: React.ReactNode;
  /** Texto o nodo al final (p. ej. "min", "%", botón). */
  suffix?: React.ReactNode;
  error?: boolean | string | null;
  label?: string;
  hint?: string;
  wrapperClassName?: string;
};

/** Input con ícono/prefijo/sufijo; con `label` se envuelve en <Field>. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    icon: Icon,
    prefix,
    suffix,
    error,
    label,
    hint,
    wrapperClassName = '',
    className = '',
    id,
    required,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const control = (
    <div className={`${controlClass(!!error)} ${wrapperClassName}`}>
      {Icon && (
        <Icon size={16} className="ml-3 flex-shrink-0 text-faint" aria-hidden />
      )}
      {prefix && (
        <span className="ml-3 flex-shrink-0 font-mono text-[13px] text-muted">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={!!error || undefined}
        className={`min-w-0 flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-faint ${className}`}
        {...rest}
      />
      {suffix && (
        <span className="mr-3 flex-shrink-0 text-[13px] text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
  if (!label && typeof error !== 'string' && !hint) return control;
  return (
    <Field
      label={label}
      hint={hint}
      error={typeof error === 'string' ? error : null}
      required={required}
      htmlFor={inputId}
    >
      {control}
    </Field>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: boolean | string | null;
  }
>(function Textarea({ error, className = '', ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={!!error || undefined}
      className={`min-h-[96px] w-full resize-y rounded-btn border bg-card px-3 py-2.5 text-[14px] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary focus:shadow-focus ${
        error ? 'border-error' : 'border-line hover:border-line-strong'
      } ${className}`}
      {...rest}
    />
  );
});

/** Checkbox custom (tablas, términos). `indeterminate` para "algunos". */
export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  disabled,
  className = '',
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const on = checked || indeterminate;
  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center gap-2.5 ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      onClick={e => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
      />
      <span
        className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:shadow-focus ${
          on
            ? 'border-primary bg-primary text-white'
            : 'border-line-strong bg-card'
        }`}
      >
        {indeterminate ? (
          <Minus size={12} strokeWidth={3} />
        ) : (
          checked && <Check size={12} strokeWidth={3} />
        )}
      </span>
      {label && <span className="text-[13.5px] text-body">{label}</span>}
    </label>
  );
}
