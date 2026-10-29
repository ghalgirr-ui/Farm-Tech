function Input({ label, id, className = "", ...props }) {
  return (
    <label htmlFor={id} className="field-label">
      {label}
      <input id={id} className={`search-field ${className}`.trim()} {...props} />
    </label>
  );
}

export default Input;
