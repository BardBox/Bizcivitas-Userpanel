'use client';

import React, { useEffect, useState, useRef } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface Zone {
  _id: string;
  zoneName: string;
  cities?: string[];
}

interface Area {
  _id: string;
  areaName: string;
  zoneId: string;
}

interface FranchiseZoneAreaDropdownProps {
  cityName?: string;
  selectedZoneId?: string;
  selectedAreaId?: string;
  selectedAreaName?: string;
  onZoneChange: (zoneId: string, zoneName: string) => void;
  onAreaChange: (areaId: string, areaName: string) => void;
  disabled?: boolean;
  required?: boolean;
}

/**
 * FranchiseZoneAreaDropdown Component
 *
 * Allows users to select their franchise Zone and Area based on their city.
 * Zone = Collection of cities (e.g., "south east gujrat")
 * Area = Subdivision within a zone (e.g., "area1")
 *
 * @example
 * <FranchiseZoneAreaDropdown
 *   cityName="ankleshwar"
 *   selectedZoneId={zoneId}
 *   selectedAreaId={areaId}
 *   onZoneChange={(id, name) => { setZoneId(id); setZoneName(name); }}
 *   onAreaChange={(id, name) => { setAreaId(id); setAreaName(name); }}
 * />
 */
import { getAccessToken } from '../../lib/auth';

// ... existing imports

export const FranchiseZoneAreaDropdown: React.FC<FranchiseZoneAreaDropdownProps> = ({
  cityName,
  selectedZoneId,
  selectedAreaId,
  selectedAreaName,
  onZoneChange,
  onAreaChange,
  disabled = false,
  required = false,
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Fetch zones when city changes
  useEffect(() => {
    if (cityName) {
      fetchZones(cityName);
    } else {
      setZones([]);
      setAreas([]);
    }
  }, [cityName]);

  // Fetch areas when zone changes (or if we have a single zone auto-detected)
  useEffect(() => {
    const zoneIdToUse = selectedZoneId || (zones.length === 1 ? zones[0]._id : '');

    if (zoneIdToUse) {
      fetchAreas(zoneIdToUse);
    } else {
      setAreas([]);
    }
  }, [selectedZoneId, zones]);

  // Auto-select zone if only one zone is found
  useEffect(() => {
    if (zones.length === 1 && !selectedZoneId) {
      const singleZone = zones[0];
      console.log('🔄 Auto-selecting zone:', singleZone.zoneName, singleZone._id);
      onZoneChange(singleZone._id, singleZone.zoneName);
    }
  }, [zones, selectedZoneId, onZoneChange]);

  /**
   * Fetch franchise zones that contain the selected city
   */
  const fetchZones = async (city: string) => {
    if (!city || city.trim() === '') {
      setZones([]);
      return;
    }

    setLoadingZones(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      // Sanitize backend URL to prevent double /api/v1
      const cleanBaseUrl = backendUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
      const token = getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

      console.log('🔍 Fetching zones for city:', city);

      const response = await fetch(`${cleanBaseUrl}/api/v1/zones/by-city?city=${encodeURIComponent(city)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Zone fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch zones: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Zones API response:', data);

      const zonesData = data.data?.zones || [];
      setZones(zonesData);

      if (zonesData.length === 0) {
        console.warn('⚠️ No zones found for city:', city);
        // Don't show toast for empty zones, it's normal for some cities
      } else {
        console.log(`✅ Found ${zonesData.length} zone(s) for ${city}`);
      }
    } catch (error) {
      console.error('❌ Error fetching zones:', error);
      // Don't show error toast, just log it
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  };

  /**
   * Fetch franchise areas within the selected zone
   */
  const fetchAreas = async (zoneId: string) => {
    if (!zoneId || zoneId.trim() === '') {
      setAreas([]);
      return;
    }

    setLoadingAreas(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      // Sanitize backend URL to prevent double /api/v1
      const cleanBaseUrl = backendUrl.replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
      const token = getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

      console.log('🔍 Fetching areas for zone:', zoneId);

      const response = await fetch(`${cleanBaseUrl}/api/v1/areas/by-zone?zoneId=${zoneId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Area fetch failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch areas: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Areas API response:', data);

      const areasData = data.data?.areas || [];
      setAreas(areasData);

      if (areasData.length === 0) {
        console.warn('⚠️ No areas found for zone:', zoneId);
      } else {
        console.log(`✅ Found ${areasData.length} area(s)`);
      }
    } catch (error) {
      console.error('❌ Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const zoneOptions = zones.map(zone => ({
    value: zone._id,
    label: zone.zoneName,
  }));

  const areaOptions = areas.map(area => ({
    value: area._id,
    label: area.areaName,
  }));

  const selectedZone = zoneOptions.find(opt => opt.value === selectedZoneId);
  const selectedArea = areaOptions.find(opt => opt.value === selectedAreaId);

  // Capture initial selectedAreaName to survive parent's clear-on-zone-change behavior
  const initialAreaName = useRef(selectedAreaName);
  useEffect(() => {
    // Only set it if we have a value and haven't captured it yet
    if (selectedAreaName && !initialAreaName.current) {
      initialAreaName.current = selectedAreaName;
    }
  }, [selectedAreaName]);

  // Auto-select area if matched by name but ID is missing (Legacy data support)
  useEffect(() => {
    // Use current prop OR fallback to initial captured value
    const nameToUse = selectedAreaName || initialAreaName.current;

    if (areas.length > 0 && !selectedAreaId && nameToUse) {
      const matchedArea = areas.find(a =>
        a.areaName.toLowerCase().trim() === nameToUse.toLowerCase().trim()
      );
      if (matchedArea) {
        // Found the ID for the saved name, auto-select it
        onAreaChange(matchedArea._id, matchedArea.areaName);
      }
    }
  }, [areas, selectedAreaId, selectedAreaName, onAreaChange]);

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#3B82F6'
        : state.isFocused
          ? '#DBEAFE'
          : 'white',
      color: state.isSelected ? 'white' : '#1F2937',
      cursor: 'pointer',
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="space-y-4">
      {/* Franchise Zone Dropdown - Only show if multiple zones available */}
      {zones.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise Zone
            {required && <span className="text-red-500 ml-1">*</span>}
            {loadingZones && <span className="text-blue-600 ml-2 text-xs">(Loading...)</span>}
          </label>
          <Select
            options={zoneOptions}
            value={selectedZone}
            onChange={(option) => {
              if (option) {
                onZoneChange(option.value, option.label);
              } else {
                onZoneChange('', '');
                onAreaChange('', ''); // Clear area when zone is cleared
              }
            }}
            placeholder={`Select zone for ${cityName}`}
            isSearchable
            isClearable
            isDisabled={disabled || loadingZones}
            isLoading={loadingZones}
            styles={selectStyles}
            className="text-sm"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Zone is a collection of cities managed by a franchise (e.g., "south east gujrat")
          </p>
        </div>
      )}

      {/* Auto-selected Zone Display - Show if only one zone */}
      {zones.length === 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise Zone
          </label>
          <div className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
            {selectedZone ? selectedZone.label : zones[0]?.zoneName}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-selected (only one zone available for this city)
          </p>
        </div>
      )}

      {/* No Zones Found or Error State */}
      {!loadingZones && zones.length === 0 && cityName && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
          No franchise zone found for <strong>{cityName}</strong>.
          Please check the city spelling or contact support if this is an error.
        </div>
      )}

      {/* Franchise Area Dropdown - Always show when zone is selected OR only 1 zone available */}
      {(selectedZoneId || zones.length === 1) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise Area {required && <span className="text-red-500">*</span>}
            {loadingAreas && <span className="text-blue-600 ml-2 text-xs">(Loading...)</span>}
          </label>
          {areas.length > 0 || loadingAreas ? (
            <Select
              options={areaOptions}
              value={selectedArea}
              onChange={(option) => {
                if (option) {
                  onAreaChange(option.value, option.label);
                } else {
                  onAreaChange('', '');
                }
              }}
              placeholder={required ? "Select franchise area" : "Select franchise area (optional)"}
              isSearchable
              isClearable
              isDisabled={disabled || loadingAreas}
              isLoading={loadingAreas}
              styles={selectStyles}
              className="text-sm"
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
            />
          ) : (
            <div className="w-full border border-gray-300 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500">
              No areas available for this zone
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Area is a subdivision within your zone (e.g., "Jawahar Nagar")
          </p>
        </div>
      )}
    </div>
  );
};

export default FranchiseZoneAreaDropdown;
