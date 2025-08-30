import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProductionHouseModal = ({ house, isOpen, onClose, canEdit, isNewHouse }) => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(isNewHouse);
  const [formData, setFormData] = useState(house);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(house);
    setEditMode(isNewHouse);
  }, [house, isNewHouse]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.productionCapacityMW || formData.productionCapacityMW <= 0) {
      newErrors.productionCapacityMW = 'Production capacity must be greater than 0';
    }
    
    if (!formData.startYear || formData.startYear < 2000 || formData.startYear > 2050) {
      newErrors.startYear = 'Start year must be between 2000 and 2050';
    }
    
    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // In a real application, this would make an API call to save the data
    console.log('Saving production house:', formData);
    
    // Show success message
    alert(isNewHouse ? 'New production house added successfully!' : 'Production house updated successfully!');
    
    setEditMode(false);
    onClose();
  };

  const handleCancel = () => {
    if (isNewHouse) {
      onClose();
    } else {
      setFormData(house);
      setEditMode(false);
      setErrors({});
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this production house? This action cannot be undone.')) {
      // In a real application, this would make an API call to delete the data
      console.log('Deleting production house:', house.id);
      alert('Production house deleted successfully!');
      onClose();
    }
  };

  if (!isOpen) return null;

  const productionProcesses = [
    'Water electrolysis',
    'Steam methane reforming',
    'Biomass gasification',
    'Non-electrolytic',
    'Other'
  ];

  const projectStages = [
    'Planning',
    'Construction', 
    'Operation',
    'Maintenance',
    'Decommissioned'
  ];

  const endUses = [
    'Refining',
    'Industrial heat',
    'Mobility',
    'Power generation',
    'Steel',
    'Ammonia',
    'Methanol',
    'E-fuels',
    'Blending',
    'Residential heat',
    'Other industry',
    'Other'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isNewHouse ? 'Add New Production House' : editMode ? 'Edit Production House' : 'Production House Details'}
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.name}</span>
              )}
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>City *</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.city}</span>
              )}
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label>Country *</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={errors.country ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.country}</span>
              )}
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label>Start Year *</label>
              {editMode ? (
                <input
                  type="number"
                  value={formData.startYear}
                  onChange={(e) => handleInputChange('startYear', parseInt(e.target.value))}
                  min="2000"
                  max="2050"
                  className={errors.startYear ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.startYear}</span>
              )}
              {errors.startYear && <span className="error-message">{errors.startYear}</span>}
            </div>

            <div className="form-group">
              <label>Production Capacity (MW) *</label>
              {editMode ? (
                <input
                  type="number"
                  value={formData.productionCapacityMW}
                  onChange={(e) => handleInputChange('productionCapacityMW', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                  className={errors.productionCapacityMW ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.productionCapacityMW} MW</span>
              )}
              {errors.productionCapacityMW && <span className="error-message">{errors.productionCapacityMW}</span>}
            </div>

            <div className="form-group">
              <label>Production Process</label>
              {editMode ? (
                <select
                  value={formData.productionProcess}
                  onChange={(e) => handleInputChange('productionProcess', e.target.value)}
                >
                  {productionProcesses.map(process => (
                    <option key={process} value={process}>{process}</option>
                  ))}
                </select>
              ) : (
                <span className="form-value">{formData.productionProcess}</span>
              )}
            </div>

            <div className="form-group">
              <label>End Use</label>
              {editMode ? (
                <select
                  value={formData.endUse}
                  onChange={(e) => handleInputChange('endUse', e.target.value)}
                >
                  <option value="">Select end use</option>
                  {endUses.map(endUse => (
                    <option key={endUse} value={endUse}>{endUse}</option>
                  ))}
                </select>
              ) : (
                <span className="form-value">{formData.endUse || 'Not specified'}</span>
              )}
            </div>

            <div className="form-group">
              <label>Consumption Capacity (tonnes/year)</label>
              {editMode ? (
                <input
                  type="number"
                  value={formData.consumptionCapacityTonnes}
                  onChange={(e) => handleInputChange('consumptionCapacityTonnes', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                />
              ) : (
                <span className="form-value">{formData.consumptionCapacityTonnes?.toFixed(2) || 'N/A'} tonnes/year</span>
              )}
            </div>

            <div className="form-group">
              <label>Project Stage</label>
              {editMode ? (
                <select
                  value={formData.projectStage}
                  onChange={(e) => handleInputChange('projectStage', e.target.value)}
                >
                  {projectStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              ) : (
                <span className="form-value">{formData.projectStage}</span>
              )}
            </div>

            <div className="form-group">
              <label>Latitude *</label>
              {editMode ? (
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                  min="-90"
                  max="90"
                  step="0.000001"
                  className={errors.latitude ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.latitude?.toFixed(6)}</span>
              )}
              {errors.latitude && <span className="error-message">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label>Longitude *</label>
              {editMode ? (
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                  min="-180"
                  max="180"
                  step="0.000001"
                  className={errors.longitude ? 'error' : ''}
                />
              ) : (
                <span className="form-value">{formData.longitude?.toFixed(6)}</span>
              )}
              {errors.longitude && <span className="error-message">{errors.longitude}</span>}
            </div>
          </div>

          {!editMode && (
            <div className="additional-info">
              <h3>Additional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Coordinates:</strong>
                  <span>{formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}</span>
                </div>
                <div className="info-item">
                  <strong>Total Annual Capacity:</strong>
                  <span>{(formData.productionCapacityMW * 8760).toFixed(0)} MWh/year</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {editMode ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>
                {isNewHouse ? 'Add Facility' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <>
                  <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                    Edit
                  </button>
                  {user?.role === 'Regulatory Authority' && !isNewHouse && (
                    <button className="btn btn-danger" onClick={handleDelete}>
                      Delete
                    </button>
                  )}
                </>
              )}
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionHouseModal;
