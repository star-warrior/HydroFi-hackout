import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { productionHousesData, getUniqueValues, filterProductionHouses, getMarkerColor } from '../data/productionHouses';
import ProductionHouseModal from './ProductionHouseModal';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on project stage
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Component to handle map clicks for adding new production houses
const MapClickHandler = ({ onMapClick, isAddingMode }) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const WorldMap = () => {
  const { user } = useAuth();
  const [filteredData, setFilteredData] = useState(productionHousesData);
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    productionProcess: '',
    projectStage: '',
    endUse: '',
    search: ''
  });
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [newHouseLocation, setNewHouseLocation] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Filter options
  const countries = getUniqueValues(productionHousesData, 'country');
  const productionProcesses = getUniqueValues(productionHousesData, 'productionProcess');
  const projectStages = getUniqueValues(productionHousesData, 'projectStage');
  const endUses = getUniqueValues(productionHousesData, 'endUse');

  useEffect(() => {
    const filtered = filterProductionHouses(productionHousesData, filters);
    
    // If user is a producer, show only their own facilities
    if (user?.role === 'Green Hydrogen Producer') {
      // In a real app, this would filter by user's facilities
      setFilteredData(filtered);
    } else {
      setFilteredData(filtered);
    }
  }, [filters, user]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      city: '',
      productionProcess: '',
      projectStage: '',
      endUse: '',
      search: ''
    });
  };

  const handleMarkerClick = (house) => {
    setSelectedHouse(house);
    setShowModal(true);
  };

  const handleMapClick = (latlng) => {
    if (isAddingMode) {
      setNewHouseLocation(latlng);
      setSelectedHouse({
        id: null,
        name: '',
        city: '',
        country: '',
        startYear: new Date().getFullYear(),
        productionCapacityMW: 0,
        productionProcess: 'Water electrolysis',
        endUse: '',
        consumptionCapacityTonnes: 0,
        latitude: latlng.lat,
        longitude: latlng.lng,
        projectStage: 'Planning'
      });
      setShowModal(true);
      setIsAddingMode(false);
    }
  };

  const canEdit = (house) => {
    if (user?.role === 'Regulatory Authority') return true;
    if (user?.role === 'Green Hydrogen Producer') {
      // In a real app, check if this facility belongs to the user
      return true;
    }
    return false;
  };

  const canAdd = () => {
    return user?.role === 'Green Hydrogen Producer' || user?.role === 'Regulatory Authority';
  };

  return (
    <div className="world-map-container">
      <div className="map-header">
        <h1>Green Hydrogen Production Houses Worldwide</h1>
        <div className="map-controls">
          <button 
            className="btn btn-secondary"
            onClick={() => setSidebarVisible(!sidebarVisible)}
          >
            {sidebarVisible ? 'Hide Filters' : 'Show Filters'}
          </button>
          {canAdd() && (
            <button 
              className={`btn ${isAddingMode ? 'btn-warning' : 'btn-primary'}`}
              onClick={() => setIsAddingMode(!isAddingMode)}
            >
              {isAddingMode ? 'Cancel Adding' : 'Add New Facility'}
            </button>
          )}
        </div>
      </div>

      <div className="map-content">
        {sidebarVisible && (
          <div className="map-sidebar">
            <div className="filters-section">
              <h3>Filters & Search</h3>
              
              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search by name, city, or country..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Country:</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>City:</label>
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Production Process:</label>
                <select
                  value={filters.productionProcess}
                  onChange={(e) => handleFilterChange('productionProcess', e.target.value)}
                >
                  <option value="">All Processes</option>
                  {productionProcesses.map(process => (
                    <option key={process} value={process}>{process}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Project Stage:</label>
                <select
                  value={filters.projectStage}
                  onChange={(e) => handleFilterChange('projectStage', e.target.value)}
                >
                  <option value="">All Stages</option>
                  {projectStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>End Use:</label>
                <select
                  value={filters.endUse}
                  onChange={(e) => handleFilterChange('endUse', e.target.value)}
                >
                  <option value="">All End Uses</option>
                  {endUses.map(endUse => (
                    <option key={endUse} value={endUse}>{endUse}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>

            <div className="legend-section">
              <h3>Legend</h3>
              <div className="legend-item">
                <span className="legend-marker green"></span>
                <span>Operation</span>
              </div>
              <div className="legend-item">
                <span className="legend-marker orange"></span>
                <span>Construction</span>
              </div>
              <div className="legend-item">
                <span className="legend-marker red"></span>
                <span>Planning</span>
              </div>
              <div className="legend-item">
                <span className="legend-marker blue"></span>
                <span>Other</span>
              </div>
            </div>

            <div className="stats-section">
              <h3>Statistics</h3>
              <p>Total Facilities: {filteredData.length}</p>
              <p>Operational: {filteredData.filter(h => h.projectStage === 'Operation').length}</p>
              <p>Under Construction: {filteredData.filter(h => h.projectStage === 'Construction').length}</p>
              <p>Total Capacity: {filteredData.reduce((sum, h) => sum + h.productionCapacityMW, 0).toFixed(1)} MW</p>
            </div>
          </div>
        )}

        <div className={`map-view ${sidebarVisible ? 'with-sidebar' : 'full-width'}`}>
          {isAddingMode && (
            <div className="add-mode-notice">
              <p>Click on the map to add a new production facility</p>
            </div>
          )}
          
          <MapContainer
            center={[54.5260, 15.2551]} // Center of Europe
            zoom={4}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapClickHandler 
              onMapClick={handleMapClick} 
              isAddingMode={isAddingMode}
            />

            <MarkerClusterGroup>
              {filteredData.map((house) => (
                <Marker
                  key={house.id}
                  position={[house.latitude, house.longitude]}
                  icon={createCustomIcon(getMarkerColor(house.projectStage))}
                  eventHandlers={{
                    click: () => handleMarkerClick(house),
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h4>{house.name}</h4>
                      <p><strong>Location:</strong> {house.city}, {house.country}</p>
                      <p><strong>Capacity:</strong> {house.productionCapacityMW} MW</p>
                      <p><strong>Stage:</strong> {house.projectStage}</p>
                      <p><strong>Process:</strong> {house.productionProcess}</p>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMarkerClick(house)}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>

      {showModal && selectedHouse && (
        <ProductionHouseModal
          house={selectedHouse}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedHouse(null);
            setNewHouseLocation(null);
          }}
          canEdit={canEdit(selectedHouse)}
          isNewHouse={selectedHouse.id === null}
        />
      )}
    </div>
  );
};

export default WorldMap;
