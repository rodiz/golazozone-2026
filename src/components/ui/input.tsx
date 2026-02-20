import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    const inputClass = [
      "form-input",
      icon ? "input-with-icon" : "",
      error ? "input-error" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <div className="form-input-wrap">
          {icon && (
            <span className="form-input-icon">{icon}</span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={inputClass}
            {...props}
          />
        </div>
        {error && <p className="form-error-msg">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
