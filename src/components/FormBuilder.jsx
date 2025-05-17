import React, { useState, useEffect } from 'react';

function FormBuilder({ fields, onSubmit, initialValues = {} }) {
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({}); // Reset after submit
  };

  return (
    <form className="form-builder" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="form-group">
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
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          )}
        </div>
      ))}

      <div className="form-buttons">
        <button type="submit" className="form-btn submit">Submit</button>
        <button type="button" className="form-btn reset" onClick={() => setFormData({})}>Reset</button>
      </div>
    </form>
  );
}

export default FormBuilder;
