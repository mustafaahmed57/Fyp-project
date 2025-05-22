import React, { useState, useEffect } from 'react';

function FormBuilder({ fields, onSubmit, initialValues = {}, onFieldChange }) {
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let finalValue = value;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'select-one') {
      const parsed = Number(value);
      finalValue = isNaN(parsed) ? value : parsed;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (onFieldChange) {
      onFieldChange(name, finalValue, setFormData); // 🔄 optional hook to auto-fill fields
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({});
  };

  return (
    <form className="form-builder" onSubmit={handleSubmit}>
      <div className="form-grid">
        {fields.map((field) => (
          <div key={field.name} className={`form-group ${field.name === 'description' ? 'full-width' : ''}`}>
            <label htmlFor={field.name}>
              {field.label}
              {field.type === 'checkbox' && (
                <input
                  id={field.name}
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                  style={{ marginLeft: '10px' }}
                />
              )}
            </label>

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
            ) : field.type !== 'checkbox' ? (
              <input
                id={field.name}
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                autoComplete="off"
                required
                readOnly={field.disabled}
              />
            ) : null}
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
