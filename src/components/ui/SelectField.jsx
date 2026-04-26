import { ChevronDown } from 'lucide-react'
import Field from './Field'

/**
 * SelectField — wrapper chuẩn cho mọi dropdown/select trong hệ thống.
 *
 * Tự động:
 *   - Thêm custom caret icon (ChevronDown) bên phải, không bị text đè
 *   - Dùng .input-select (appearance-none + hover/focus state)
 *   - Bọc trong <Field> để label, hint, error nhất quán
 *
 * Props:
 *   label, id, required, hint, error   — forward xuống <Field>
 *   children                           — <option> elements
 *   ...rest                            — value, onChange, disabled, etc. → <select>
 */
export default function SelectField({
  label,
  id,
  required,
  hint,
  error,
  children,
  ...rest
}) {
  return (
    <Field
      label={label}
      id={id}
      required={required}
      hint={hint}
      error={error}
    >
      <div className="relative">
        <select
          id={id}
          className={error ? 'input-field-error pr-9' : 'input-select'}
          {...rest}
        >
          {children}
        </select>
        {/* Custom caret — pointer-events-none để click xuyên qua vẫn mở select */}
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>
    </Field>
  )
}
