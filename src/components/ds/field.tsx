'use client';
import { createContext, forwardRef, useContext, useId } from 'react';
import { Check, Minus, type LucideIcon } from 'lucide-react';

/** Estilo base de controles de formulario: alto 42, radio 10, anillo de foco. */
export const controlClass = (error?: boolean) =>
  `flex min-h-[42px] w-full items-center rounded-btn border bg-card text-[14px] text-navy transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-focus ${
    error ? 'border-error' : 'border-control hover:border-muted'
  }`;

/**
 * Lo que <Field> le pasa a su control: id (para `<label htmlFor>`) e id de la
 * ayuda/error (`aria-describedby`). Input, Textarea, Select y DatePicker lo
 * leen, así `<Field label><Select/></Field>` queda asociado sin props extra.
 */
const FieldCtx = createContext<{
  id: string;
  labelId?: string;
  describedBy?: string;
} | null>(null);
export function useFieldControl(id?: string) {
  const ctx = useContext(FieldCtx);
  return {
    id: id ?? ctx?.id,
    labelId: ctx?.labelId,
    'aria-describedby': ctx?.describedBy,
  };
}

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
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const msgId = `${id}-msg`;
  const hasMsg = !!error || !!hint;
  return (
    <div className={className}>
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="mb-1.5 block text-[12.5px] font-semibold text-navy"
        >
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <FieldCtx.Provider
        value={{
          id,
          labelId: label ? `${id}-label` : undefined,
          describedBy: hasMsg ? msgId : undefined,
        }}
      >
        {children}
      </FieldCtx.Provider>
      {error ? (
        <p id={msgId} role="alert" className="mt-1.5 text-[12px] text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={msgId} className="mt-1.5 text-[12px] text-muted">
            {hint}
          </p>
        )
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
  const ctrl = useFieldControl(id);
  const inputId = ctrl.id ?? autoId;
  const ownField = !!label || typeof error === 'string' || !!hint;
  const describedBy = ownField
    ? typeof error === 'string' || hint
      ? `${inputId}-msg`
      : undefined
    : ctrl['aria-describedby'];
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
        aria-describedby={describedBy}
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
  if (!ownField) return control;
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
>(function Textarea({ error, className = '', id, ...rest }, ref) {
  const ctrl = useFieldControl(id);
  return (
    <textarea
      ref={ref}
      id={ctrl.id}
      aria-describedby={ctrl['aria-describedby']}
      aria-invalid={!!error || undefined}
      className={`min-h-[96px] w-full resize-y rounded-btn border bg-card px-3 py-2.5 text-[14px] text-navy outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-primary focus:shadow-focus ${
        error ? 'border-error' : 'border-control hover:border-muted'
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
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /** Nombre accesible cuando no hay `label` visible (p. ej. filas de tabla). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}) {
  const on = checked || indeterminate;
  return (
    <label
      data-checkbox
      className={`relative inline-flex min-h-6 min-w-6 cursor-pointer select-none items-center gap-2.5 ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      onClick={e => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
      />
      <span
        className={`grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:shadow-focus peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
          on
            ? 'border-primary-fill bg-primary-fill text-white'
            : 'border-control bg-card'
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
