"use client";

import React, { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";

interface LocationDropdownsProps {
  countryValue: string;
  stateValue: string;
  cityValue: string;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  disabled?: boolean;
  errors?: {
    country?: string;
    state?: string;
    city?: string;
  };
}

interface DropdownOption {
  label: string;
  value: string;
}

const LocationDropdowns: React.FC<LocationDropdownsProps> = ({
  countryValue,
  stateValue,
  cityValue,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  errors = {},
}) => {
  const [countries, setCountries] = useState<DropdownOption[]>([]);
  const [states, setStates] = useState<DropdownOption[]>([]);
  const [cities, setCities] = useState<DropdownOption[]>([]);

  // Load countries on mount
  useEffect(() => {
    const countryList = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
    }));
    setCountries(countryList);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (countryValue) {
      const stateList = State.getStatesOfCountry(countryValue).map((state) => ({
        label: state.name,
        value: state.isoCode,
      }));
      setStates(stateList);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [countryValue]);

  // Load cities when state changes
  useEffect(() => {
    if (countryValue && stateValue) {
      const cityList = City.getCitiesOfState(countryValue, stateValue).map(
        (city) => ({
          label: city.name,
          value: city.name,
        })
      );
      setCities(cityList);
    } else {
      setCities([]);
    }
  }, [countryValue, stateValue]);

  // Get display names for selected values (internal helpers)
  const getSelectedCountryLabel = (isoCode: string) => {
    const country = countries.find((c) => c.value === isoCode);
    return country?.label || isoCode;
  };

  const getSelectedStateLabel = (isoCode: string) => {
    const state = states.find((s) => s.value === isoCode);
    return state?.label || isoCode;
  };

  return (
    <div className="space-y-4">
      {/* Country Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          value={countryValue}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onStateChange(""); // Reset state
            onCityChange(""); // Reset city
          }}
          disabled={disabled}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.country ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
        )}
      </div>

      {/* State Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State <span className="text-red-500">*</span>
        </label>
        <select
          value={stateValue}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange(""); // Reset city
          }}
          disabled={disabled || !countryValue || states.length === 0}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.state ? "border-red-500" : "border-gray-300"
          } ${
            disabled || !countryValue || states.length === 0
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
          }`}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
        {errors.state && (
          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
        )}
      </div>

      {/* City Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <select
          value={cityValue}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={disabled || !stateValue || cities.length === 0}
          className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.city ? "border-red-500" : "border-gray-300"
          } ${
            disabled || !stateValue || cities.length === 0
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white"
          }`}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
        )}
      </div>
    </div>
  );
};

export default LocationDropdowns;

// Helper function to convert country name to ISO code
export const getCountryISOCode = (countryName: string): string => {
  if (!countryName) return "";
  const country = Country.getAllCountries().find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return country?.isoCode || "";
};

// Helper function to convert state name to ISO code
export const getStateISOCode = (
  countryISOCode: string,
  stateName: string
): string => {
  if (!countryISOCode || !stateName) return "";
  const state = State.getStatesOfCountry(countryISOCode).find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );
  return state?.isoCode || "";
};

// Helper function to get country name from ISO code
export const getCountryName = (isoCode: string): string => {
  if (!isoCode) return "";
  const country = Country.getCountryByCode(isoCode);
  return country?.name || "";
};

// Helper function to get state name from ISO code
export const getStateName = (
  countryISOCode: string,
  stateISOCode: string
): string => {
  if (!countryISOCode || !stateISOCode) return "";
  const state = State.getStateByCodeAndCountry(stateISOCode, countryISOCode);
  return state?.name || "";
};
