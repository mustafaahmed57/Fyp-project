import React, { useState, useEffect } from 'react';

function FormBuilder({ fields, onSubmit, initialValues = {}, onFieldChange, checkDuplicate }) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let finalValue = value;

    // ✅ Only block negative values for number inputs
    if (type === 'number') {
      const numericValue = parseFloat(value);
      if (numericValue < 0) {
        finalValue = '0';
      }
    }

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'select-one') {
      const parsed = Number(value);
      finalValue = isNaN(parsed) ? value : parsed;
    }

    // ✅ Check for duplicates in email and fullName
    if (checkDuplicate && (name === 'email' || name === 'fullName')) {
      if (checkDuplicate(name, finalValue)) {
        setErrors((prev) => ({ ...prev, [name]: `${name === 'email' ? 'Email' : 'Full Name'} already exists` }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (onFieldChange) {
      onFieldChange(name, finalValue, setFormData);
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // 🔁 Double check for duplicates during submit (especially if user skips blur)
  let newErrors = {};

  fields.forEach((field) => {
    const value = formData[field.name];
    if (checkDuplicate && (field.name === 'email' || field.name === 'fullName')) {
      if (checkDuplicate(field.name, value)) {
        newErrors[field.name] = `${field.label} already exists`;
      }
    }

    // 🔒 Extra safety: no empty required fields
  if (!value && field.type !== 'checkbox' && field.type !== 'hidden' && !field.readOnly) {
  newErrors[field.name] = `${field.label} is required`;
}

  });

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return; // ❌ stop form submission if any errors exist
  }

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
                  disabled={field.readOnly} // ✅ Now supports read-only checkboxes
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
                disabled={field.disabled} // ✅ this will now properly disable the dropdown
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
                disabled={field.disabled} // ✅ This must exist!
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
                // readOnly={field.disabled}
                readOnly={field.readOnly || field.disabled}
                min={field.type === 'number' ? '0' : undefined} // HTML-level protection
                {...(field.type === 'date' && {
    min: field.min,
    max: field.max,
  })}
              />
            ) : null}

            {errors[field.name] && (
              <span className="error-text" style={{ color: 'red', fontSize: '13px' }}>
                {errors[field.name]}
              </span>
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
