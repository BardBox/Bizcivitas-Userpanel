'use client';

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchAreasAndPincodes, AreaOption } from '@/utils/areaApi';
import { toast } from 'react-toastify';

interface AreaDropdownProps {
  cityName: string;
  countryName: string;
  areaValue?: string;
  pincodeValue?: string;
  onAreaChange: (area: string) => void;
  onPincodeChange: (pincode: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

/**
 * AreaDropdown Component
 *
 * Features:
 * - Auto-fetches areas based on selected city and country
 * - Uses hybrid API system (India Post + Zipcodebase)
 * - Auto-fills pincode when area is selected
 * - Fallback to manual entry if API fails
 * - Searchable dropdown for better UX
 *
 * @example
 * <AreaDropdown
 *   cityName="Vadodara"
 *   countryName="India"
 *   areaValue={area}
 *   pincodeValue={pincode}
 *   onAreaChange={setArea}
 *   onPincodeChange={setPincode}
 *   required
 * />
 */
export const AreaDropdown: React.FC<AreaDropdownProps> = ({
  cityName,
  countryName,
  areaValue,
  pincodeValue,
  onAreaChange,
  onPincodeChange,
  disabled = false,
  error,
  required = false,
}) => {
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAreaInput, setManualAreaInput] = useState(areaValue || '');

  // Initialize selected area from props
  useEffect(() => {
    if (areaValue && areaOptions.length > 0) {
      const existingOption = areaOptions.find(opt => opt.value === areaValue);
      if (existingOption) {
        setSelectedArea(existingOption);
      }
    }
  }, [areaValue, areaOptions]);

  // Fetch areas when city or country changes
  useEffect(() => {
    if (cityName && countryName) {
      loadAreas();
    } else {
      // Reset state when city/country is cleared
      setAreaOptions([]);
      setSelectedArea(null);
      setShowManualEntry(false);
      setManualAreaInput('');
    }
  }, [cityName, countryName]);

  /**
   * Load areas from API
   */
  const loadAreas = async () => {
    setLoading(true);
    setAreaOptions([]);
    // Don't clear selectedArea here - preserve it for re-initialization
    setShowManualEntry(false);

    try {
      const areas = await fetchAreasAndPincodes(cityName, countryName);

      if (areas.length > 0) {
        setAreaOptions(areas);

        // If there's an existing areaValue, find and set it
        if (areaValue) {
          const existingOption = areas.find(opt => opt.value === areaValue);
          if (existingOption) {
            setSelectedArea(existingOption);
          } else {
            // Area value exists but not in the list - clear selection
            setSelectedArea(null);
          }
        } else {
          // No area value, clear selection
          setSelectedArea(null);
        }

        toast.success(`Found ${areas.length} areas in ${cityName}!`, {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        // No areas found, switch to manual entry
        setSelectedArea(null);
        setShowManualEntry(true);
        toast.info(`No areas found for ${cityName}. Please enter manually.`, {
          position: 'top-right',
          autoClose: 4000,
        });
      }
    } catch (error) {
      console.error('Error loading areas:', error);
      setSelectedArea(null);
      setShowManualEntry(true);
      toast.warning('Failed to load areas. Please enter manually.', {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle area selection from dropdown
   */
  const handleAreaSelection = (option: AreaOption | null) => {
    setSelectedArea(option);

    if (option) {
      // Area selected: update both area and pincode
      onAreaChange(option.value);
      onPincodeChange(option.pincode);
    } else {
      // Clear selection: switch to manual entry
      onAreaChange('');
      onPincodeChange('');
      setShowManualEntry(true);
    }
  };

  /**
   * Handle manual area input
   */
  const handleManualAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualAreaInput(value);
    onAreaChange(value);
  };

  /**
   * Switch to manual entry mode
   */
  const switchToManualEntry = () => {
    setShowManualEntry(true);
    setSelectedArea(null);
    setManualAreaInput(areaValue || '');
  };

  /**
   * Switch back to dropdown mode
   */
  const switchToDropdown = () => {
    setShowManualEntry(false);
    setManualAreaInput('');
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: error ? '#EF4444' : state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
      '&:hover': {
        borderColor: error ? '#EF4444' : '#3B82F6',
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
      '&:active': {
        backgroundColor: '#3B82F6',
      },
    }),
  };

  // Render API dropdown mode
  if (!showManualEntry && areaOptions.length > 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Area/Locality
          {required && <span className="text-red-500 ml-1">*</span>}
          {loading && <span className="text-blue-600 ml-2 text-xs">(Loading...)</span>}
        </label>

        <Select
          options={areaOptions}
          value={selectedArea}
          onChange={handleAreaSelection}
          placeholder="Select an area"
          isSearchable
          isClearable
          isDisabled={disabled || loading}
          isLoading={loading}
          styles={selectStyles}
          className="text-sm"
        />

        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>Select from suggestions or clear to enter manually</span>
          <button
            type="button"
            onClick={switchToManualEntry}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Enter manually
          </button>
        </div>
      </div>
    );
  }

  // Render manual entry mode
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Area/Locality
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type="text"
        value={manualAreaInput}
        onChange={handleManualAreaChange}
        disabled={disabled}
        placeholder="Enter area/locality (e.g., Alkapuri, Downtown)"
        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        required={required}
      />

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
        <span>
          {areaOptions.length === 0 && !loading
            ? 'API unavailable - manual entry required'
            : 'Enter area manually'}
        </span>
        {areaOptions.length > 0 && (
          <button
            type="button"
            onClick={switchToDropdown}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Use dropdown
          </button>
        )}
      </div>
    </div>
  );
};

export default AreaDropdown;
