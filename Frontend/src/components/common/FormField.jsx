function FormField({ label, id, type = "text", value, onChange, placeholder, options, className = "", ...props }) {
  if (options) {
    return (
      <label htmlFor={id} className="field-label">
        {label}
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`select-field ${className}`.trim()}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label htmlFor={id} className="field-label">
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`search-field ${className}`.trim()}
        {...props}
      />
    </label>
  );
}

export default FormField;
