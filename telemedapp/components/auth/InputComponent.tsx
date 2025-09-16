interface InputProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  additionalText?: string;
  errorText?: string;
}

const InputComponent = ({
  label,
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  additionalText,
  errorText,
}: InputProps) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={onChange}
        required={required}
        className={`input-field ${errorText ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
      />
      {additionalText && (
        <p className="text-xs text-gray-500">
          {additionalText}
        </p>
      )}
      {errorText && (
        <p className="text-xs text-red-600 font-medium">
          {errorText}
        </p>
      )}
    </div>
  );
};

export default InputComponent;
