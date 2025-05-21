import React, { useState, useEffect } from 'react';

function FormBuilder({ fields, onSubmit, initialValues = {}, onFieldChange }) {
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update local state
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Also notify parent if custom change handler exists
    if (onFieldChange) {
      onFieldChange(name, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({}); // Reset after submit
  };

  return (
    <form className="form-builder" onSubmit={handleSubmit}>
      <div className="form-grid">
        {fields.map((field) => (
          <div key={field.name} className={`form-group ${field.name === 'description' ? 'full-width' : ''}`}>
            <label htmlFor={field.name}>{field.label}</label>

            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {field.options.map((opt) =>
                  typeof opt === 'object' ? (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ) : (
                    <option key={opt} value={opt}>{opt}</option>
                  )
                )}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                rows="4"
                required
              />
            ) : (
              <input
                id={field.name}
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                autoComplete="off"
                required
                disabled={field.disabled}
              />
            )}
          </div>
        ))}
      </div>

      <div className="form-buttons">
        <button type="submit" className="form-btn submit">Submit</button>
        <button type="button" className="form-btn reset" onClick={() => setFormData({})}>Reset</button>
      </div>
    </form>
  );
}

export default FormBuilder;
