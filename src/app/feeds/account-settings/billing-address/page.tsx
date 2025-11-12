"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useGetFullProfileQuery, useUpdateAddressDetailsMutation } from "@/store/api/profileApi";
import { toast } from "react-hot-toast";
import LocationDropdowns from "@/components/ui/LocationDropdowns";
import { Country, State } from "country-state-city";

export default function BillingAddressPage() {
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile } = useGetFullProfileQuery();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressDetailsMutation();

  // Form state
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [useBusinessAddress, setUseBusinessAddress] = useState(false);

  // Sync with profile data
  useEffect(() => {
    if (profile?.addresses?.billing && Object.keys(profile.addresses.billing).length > 0) {
      const billing = profile.addresses.billing;

      setAddressLine1(billing.addressLine1 || "");
      setAddressLine2(billing.addressLine2 || "");
      setPincode(billing.pincode?.toString() || "");
      
      // Backend stores FULL NAMES, but LocationDropdowns expects ISO CODES
      // Convert full names to ISO codes
      let countryISO = "";
      let stateISO = "";
      let cityName = billing.city || "";
      
      if (billing.country) {
        // Find country by name and get its ISO code
        const countryObj = Country.getAllCountries().find(
          (c) => c.name.toLowerCase() === billing.country?.toLowerCase()
        );
        countryISO = countryObj?.isoCode || "";

        // Find state by name and get its ISO code
        if (billing.state && countryISO) {
          const stateObj = State.getStatesOfCountry(countryISO).find(
            (s) => s.name.toLowerCase() === billing.state?.toLowerCase()
          );
          stateISO = stateObj?.isoCode || "";
        }
      }
      
      setCountry(countryISO);
      setState(stateISO);
      setCity(cityName);
    }
  }, [profile]);

  // Handle checkbox to copy business address to billing address
  // Note: Following mobile APK behavior - copies from addresses.address (personal address)
  const handleUseBusinessAddress = (checked: boolean) => {
    setUseBusinessAddress(checked);

    if (checked) {
      // Check if personal address exists
      const personalAddress = profile?.addresses?.address;

      if (!personalAddress || Object.keys(personalAddress).length === 0) {
        toast.error(
          "No personal address found. Please update your address in Profile settings first.",
          { duration: 5000 }
        );
        setUseBusinessAddress(false); // Uncheck the checkbox
        return;
      }

      // Validate that we have required fields
      if (!personalAddress.addressLine1 || !personalAddress.country || !personalAddress.state || !personalAddress.city) {
        toast.error(
          "Personal address is incomplete. Please complete your address in Profile settings first.",
          { duration: 5000 }
        );
        setUseBusinessAddress(false);
        return;
      }

      // Set address lines from personal address
      setAddressLine1(personalAddress.addressLine1 || "");
      setAddressLine2(personalAddress.addressLine2 || "");
      setPincode(personalAddress.pincode?.toString() || "");

      // Convert personal address country/state names to ISO codes for dropdowns
      let addressCountryISO = "";
      let addressStateISO = "";
      let addressCityName = personalAddress.city || "";

      if (personalAddress.country) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name.toLowerCase() === personalAddress.country?.toLowerCase()
        );
        addressCountryISO = countryObj?.isoCode || "";

        if (personalAddress.state && addressCountryISO) {
          const stateObj = State.getStatesOfCountry(addressCountryISO).find(
            (s) => s.name.toLowerCase() === personalAddress.state?.toLowerCase()
          );
          addressStateISO = stateObj?.isoCode || "";
        }
      }

      setCountry(addressCountryISO);
      setState(addressStateISO);
      setCity(addressCityName);

      toast.success("Personal address copied to billing address");
    } else {
      // When unchecked, restore existing billing data or clear fields
      const existingBilling = profile?.addresses?.billing;

      if (existingBilling && existingBilling.addressLine1) {
        // Check if billing is different from personal address
        const personalAddress = profile?.addresses?.address;
        const isBillingDifferent =
          existingBilling.addressLine1 !== personalAddress?.addressLine1 ||
          existingBilling.addressLine2 !== personalAddress?.addressLine2 ||
          existingBilling.city !== personalAddress?.city ||
          existingBilling.state !== personalAddress?.state ||
          existingBilling.country !== personalAddress?.country ||
          existingBilling.pincode?.toString() !== personalAddress?.pincode?.toString();

        if (isBillingDifferent) {
          // Restore existing separate billing data
          setAddressLine1(existingBilling.addressLine1 || "");
          setAddressLine2(existingBilling.addressLine2 || "");
          setPincode(existingBilling.pincode?.toString() || "");

          // Convert to ISO codes
          let countryISO = "";
          let stateISO = "";

          if (existingBilling.country) {
            const countryObj = Country.getAllCountries().find(
              (c) => c.name.toLowerCase() === existingBilling.country?.toLowerCase()
            );
            countryISO = countryObj?.isoCode || "";

            if (existingBilling.state && countryISO) {
              const stateObj = State.getStatesOfCountry(countryISO).find(
                (s) => s.name.toLowerCase() === existingBilling.state?.toLowerCase()
              );
              stateISO = stateObj?.isoCode || "";
            }
          }

          setCountry(countryISO);
          setState(stateISO);
          setCity(existingBilling.city || "");
        } else {
          // Clear fields if billing was same as personal address
          setAddressLine1("");
          setAddressLine2("");
          setCountry("");
          setState("");
          setCity("");
          setPincode("");
        }
      } else {
        // No existing billing data, clear fields
        setAddressLine1("");
        setAddressLine2("");
        setCountry("");
        setState("");
        setCity("");
        setPincode("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!addressLine1.trim()) {
      toast.error("Address Line 1 is required");
      return;
    }

    if (!city || !state || !country) {
      toast.error("Please select City, State, and Country");
      return;
    }

    try {
      // LocationDropdowns gives us ISO codes, but backend expects FULL NAMES
      // Convert ISO codes back to full names for backend
      let countryName = "";
      let stateName = "";
      
      if (country) {
        const countryObj = Country.getCountryByCode(country);
        countryName = countryObj?.name || "";

        if (state) {
          const stateObj = State.getStateByCodeAndCountry(state, country);
          stateName = stateObj?.name || "";
        }
      }
      
      await updateAddress({
        addresses: {
          address: profile?.addresses?.address || {}, // Keep existing address
          billing: {
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(),
            city, // City is already a name
            state: stateName, // Send full state name (e.g., "Gujarat")
            country: countryName, // Send full country name (e.g., "India")
            pincode: pincode ? Number(pincode) : undefined,
          },
        },
      }).unwrap();

      toast.success("Billing address updated successfully");
      router.back();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update billing address");
      console.error("Error updating billing address:", error);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Billing Address
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Update your billing address for payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Checkbox to use business address */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="useBusinessAddress"
                checked={useBusinessAddress}
                onChange={(e) => handleUseBusinessAddress(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="useBusinessAddress" className="flex-1 cursor-pointer">
                <span className="block text-sm font-medium text-gray-900">
                  Set business address as billing address.
                </span>
                <span className="block text-xs text-gray-600 mt-1">
                  Automatically fill billing address with your personal address details
                </span>
              </label>
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address, P.O. box, company name"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  useBusinessAddress ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={useBusinessAddress}
                required
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2
              </label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  useBusinessAddress ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={useBusinessAddress}
              />
            </div>

            {/* Location Dropdowns */}
            <LocationDropdowns
              countryValue={country}
              stateValue={state}
              cityValue={city}
              onCountryChange={(value) => {
                setCountry(value);
                setState("");
                setCity("");
              }}
              onStateChange={(value) => {
                setState(value);
                setCity("");
              }}
              onCityChange={(value) => {
                setCity(value);
              }}
              disabled={useBusinessAddress}
            />

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode / ZIP Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only numbers
                  setPincode(value);
                }}
                placeholder="Enter pincode"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  useBusinessAddress ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={useBusinessAddress}
                maxLength={10}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Address
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
