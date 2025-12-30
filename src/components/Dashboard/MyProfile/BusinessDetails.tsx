import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Award,
  Building2,
  Factory,
  FolderTree,
  Layers,
  FileText,
  Globe,
  Briefcase,
  Target,
  Trophy,
} from "lucide-react";
import { businessCategories } from "../data/businessCategories";
import {
  useUpdateProfessionDetailsMutation,
  useUpdateAddressDetailsMutation,
} from "@/store/api";
import LocationDropdowns, {
  getCountryISOCode,
  getStateISOCode,
  getCountryName,
  getStateName,
} from "../../ui/LocationDropdowns";
import { FranchiseZoneAreaDropdown } from "../../ui/FranchiseZoneAreaDropdown";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface BusinessDetailsProps {
  professionalDetails?: {
    email?: string;
    mobile?: number;
    location?: string;
    classification?: string;
    companyName?: string;
    companyWebsite?: string;
    myBusiness?: string;
    industry?: string;
    business?: string;
    businessSubcategory?: string;
    companyAddress?: string;
    businessZone?: string;
    businessArea?: string;
    businessCity?: string;
    businessState?: string;
    businessCountry?: string;
    businessPincode?: string;
    workExperience?: string;
    skills?: string[];
    achievements?: string[];
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
  isConnected?: boolean; // Whether viewer is connected to profile owner
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  professionalDetails,
  isEditing = false,
  onEditStateChange,
  formRef,
  isConnected = true, // Default to true for own profile
}) => {
  const defaultValues = {
    email: professionalDetails?.email || "",
    mobile: professionalDetails?.mobile?.toString() || "",
    location: professionalDetails?.location || "",
    classification: professionalDetails?.classification || "",
    companyName: professionalDetails?.companyName || "",
    myBusiness: professionalDetails?.myBusiness || "",
    industry: professionalDetails?.industry || "",
    business: professionalDetails?.business || "",
    businessSubcategory: professionalDetails?.businessSubcategory || "",
    companyAddress: professionalDetails?.companyAddress || "",
    businessArea: professionalDetails?.businessArea || "",
    businessCity: professionalDetails?.businessCity || "",
    businessState: professionalDetails?.businessState || "",
    businessCountry: professionalDetails?.businessCountry || "",
    businessPincode: professionalDetails?.businessPincode || "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const [updateProfessionDetails, { isLoading, error: professionError }] =
    useUpdateProfessionDetailsMutation();
  const [updateAddressDetails, { error: addressError }] =
    useUpdateAddressDetailsMutation();

  // Local state to track save errors
  const [saveError, setSaveError] = useState<string | null>(null);

  // Location dropdown states (using ISO codes)
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedPincode, setSelectedPincode] = useState<string>("");

  // Franchise Zone and Area states (ObjectIds + names)
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedZoneName, setSelectedZoneName] = useState<string>("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedAreaName, setSelectedAreaName] = useState<string>("");

  // Reset form when professionalDetails changes to include new fields
  useEffect(() => {
    if (professionalDetails) {
      reset({
        email: professionalDetails?.email || "",
        mobile: professionalDetails?.mobile?.toString() || "",
        location: professionalDetails?.location || "",
        classification: professionalDetails?.classification || "",
        companyName: professionalDetails?.companyName || "",
        myBusiness: professionalDetails?.myBusiness || "",
        industry: professionalDetails?.industry || "",
        business: professionalDetails?.business || "",
        businessSubcategory: professionalDetails?.businessSubcategory || "",
        companyAddress: professionalDetails?.companyAddress || "",
        businessArea: professionalDetails?.businessArea || "",
        businessCity: professionalDetails?.businessCity || "",
        businessState: professionalDetails?.businessState || "",
        businessCountry: professionalDetails?.businessCountry || "",
        businessPincode: professionalDetails?.businessPincode || "",
      });

      // Initialize location dropdowns with ISO codes
      const countryISO = getCountryISOCode(
        professionalDetails?.businessCountry || ""
      );
      const stateISO = getStateISOCode(
        countryISO,
        professionalDetails?.businessState || ""
      );

      setSelectedCountry(countryISO);
      setSelectedState(stateISO);
      setSelectedCity(professionalDetails?.businessCity || "");
      setSelectedPincode(professionalDetails?.businessPincode || "");

      // Initialize zone and area names (ObjectIds will be populated by dropdown)
      setSelectedZoneName(professionalDetails?.businessZone || "");
      setSelectedAreaName(professionalDetails?.businessArea || "");
    }
  }, [professionalDetails, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    // Clear previous save error
    setSaveError(null);

    try {
      // Get city/state/country names from ISO codes
      const cityName = selectedCity || "";
      const stateName = selectedState
        ? getStateName(selectedCountry, selectedState)
        : "";
      const countryName = selectedCountry
        ? getCountryName(selectedCountry)
        : "";

      // Remove old location fields from form data (we'll add them back properly)
      const { businessCity, businessState, businessCountry, businessArea, businessPincode, ...formData } =
        data;

      // Clean professional details data - remove empty strings and undefined values
      const cleanedData = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        },
        {} as Record<string, any>
      );

      // Add business location fields to professionalDetails
      // This ensures BizWin Analytics can filter by country/state/city
      cleanedData.businessCity = cityName;
      cleanedData.businessState = stateName;
      cleanedData.businessCountry = countryName;
      cleanedData.businessPincode = selectedPincode;

      // Debug logging
      console.log('💾 Saving Business Location:', {
        businessCity: cityName,
        businessState: stateName,
        businessCountry: countryName,
        businessPincode: selectedPincode,
      });

      // Prepare addresses data - only send address fields we're updating
      // Keep this for backward compatibility with other parts of the system
      const addressesData = {
        addresses: {
          address: {
            city: cityName,
            state: stateName,
            country: countryName,
          },
          billing: {}, // Empty object required by backend
        },
      };

      // Call both mutations in parallel
      await Promise.all([
        updateProfessionDetails(cleanedData).unwrap(),
        updateAddressDetails(addressesData).unwrap(),
      ]);

      onEditStateChange?.(false);
    } catch (err) {
      console.error("Failed to update business details:", err);
      // Capture and display the error
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "data" in err
            ? JSON.stringify((err as any).data?.message || err)
            : "Failed to update business details. Please try again.";
      setSaveError(errorMessage);
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    setSaveError(null); // Clear error on cancel
    onEditStateChange?.(false);
  };

  return (
    <div className="bg-white rounded-lg mb-6">
      {/* Content - Simple 2-column table layout */}
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-500" />
                Classification:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.classification || "-"}
                </span>
              ) : (
                <input
                  {...register("classification")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter classification"
                />
              )}
            </div>
          </div>

          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                Company:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.companyName || "-"}
                </span>
              ) : (
                <input
                  {...register("companyName")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter company name"
                />
              )}
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-gray-500" />
                Email{" "}
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.email && isConnected
                    ? professionalDetails.email
                    : !isConnected && !professionalDetails?.email
                      ? "-"
                      : "•••••••••@••••••••"}
                </span>
              ) : (
                <input
                  {...register("email")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter Email"
                />
              )}
            </div>
          </div>
          {/* mobile */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-gray-500" />
                Mobile
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.mobile && isConnected
                    ? professionalDetails.mobile
                    : !isConnected && !professionalDetails?.mobile
                      ? "-"
                      : "•••••••••"}
                </span>
              ) : (
                <input
                  {...register("mobile")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter mobile"
                />
              )}
            </div>
          </div>
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-gray-500" />
                Location
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.location || "-"}
                </span>
              ) : (
                <input
                  {...register("location")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter location"
                />
              )}
            </div>
          </div>

          {/* Business Category */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-gray-500" />
                Business Category:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.business || "-"}
                </span>
              ) : (
                <select
                  {...register("business")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select category</option>
                  {businessCategories.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Business Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                Business Subcategory:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.businessSubcategory || "-"}
                </span>
              ) : (
                <select
                  {...register("businessSubcategory")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select subcategory</option>
                  {(
                    businessCategories.find(
                      (cat) => cat.category === watch("business")
                    )?.subcategories || []
                  ).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Business Description */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Business Description:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {professionalDetails?.myBusiness || "-"}
                </span>
              ) : (
                <textarea
                  {...register("myBusiness")}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Enter business description"
                />
              )}
            </div>
          </div>

          {/* Industry */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                Industry:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.industry || "-"}
                </span>
              ) : (
                <input
                  {...register("industry")}
                  className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter industry"
                />
              )}
            </div>
          </div>

          {/* Business Address */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                Business Address:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600 whitespace-pre-wrap">
                  {professionalDetails?.companyAddress || "-"}
                </span>
              ) : (
                <textarea
                  {...register("companyAddress")}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  placeholder="Enter business address"
                />
              )}
            </div>
          </div>

          {/* Business Location - Country, State, City, Area, Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                Business Location:
              </span>
            </div>
            <div className="space-y-4">
              {!isEditing ? (
                <div className="text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Country: </span>
                    {professionalDetails?.businessCountry || "-"}
                  </div>
                  <div>
                    <span className="font-medium">State: </span>
                    {professionalDetails?.businessState || "-"}
                  </div>
                  <div>
                    <span className="font-medium">City: </span>
                    {professionalDetails?.businessCity || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Pincode: </span>
                    {professionalDetails?.businessPincode || "-"}
                  </div>
                </div>
              ) : (
                <>
                  <LocationDropdowns
                    countryValue={selectedCountry}
                    stateValue={selectedState}
                    cityValue={selectedCity}
                    onCountryChange={(value) => {
                      setSelectedCountry(value);
                      setSelectedState("");
                      setSelectedCity("");
                      setSelectedPincode("");
                    }}
                    onStateChange={(value) => {
                      setSelectedState(value);
                      setSelectedCity("");
                      setSelectedPincode("");
                    }}
                    onCityChange={(value) => {
                      setSelectedCity(value);
                      setSelectedPincode("");
                    }}
                    disabled={false}
                  />

                  {/* Pincode Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={selectedPincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setSelectedPincode(value);
                      }}
                      placeholder="Enter pincode"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your business location pincode
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Toast Container */}
          <ToastContainer />

          {/* Display only fields (shown only in view mode) */}
          {!isEditing && professionalDetails && (
            <>
              {professionalDetails.companyWebsite && (
                <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
                  <div>
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      Website:
                    </span>
                  </div>
                  <div>
                    <a
                      href={professionalDetails.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      {professionalDetails.companyWebsite}
                    </a>
                  </div>
                </div>
              )}

              {professionalDetails.workExperience && (
                <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
                  <div>
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      Work Experience:
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">
                      {professionalDetails.workExperience}
                    </span>
                  </div>
                </div>
              )}

              {professionalDetails.skills &&
                professionalDetails.skills.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
                    <div>
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        Skills:
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {professionalDetails.skills.join(", ")}
                      </span>
                    </div>
                  </div>
                )}

              {professionalDetails.achievements &&
                professionalDetails.achievements.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
                    <div>
                      <span className="font-medium text-gray-700 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-gray-500" />
                        Achievements:
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {professionalDetails.achievements.join(", ")}
                      </span>
                    </div>
                  </div>
                )}
            </>
          )}

          {/* Display errors from either mutation or save operation */}
          {isEditing && (professionError || addressError || saveError) && (
            <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-1 md:gap-4 py-2">
              <div></div>
              <div className="text-red-500 text-sm space-y-1">
                {professionError && (
                  <div>
                    Professional details error:{" "}
                    {typeof professionError === "object" &&
                      professionError !== null &&
                      "data" in professionError
                      ? JSON.stringify(
                        (professionError as any).data?.message ||
                        professionError
                      )
                      : String(professionError)}
                  </div>
                )}
                {addressError && (
                  <div>
                    Address details error:{" "}
                    {typeof addressError === "object" &&
                      addressError !== null &&
                      "data" in addressError
                      ? JSON.stringify(
                        (addressError as any).data?.message || addressError
                      )
                      : String(addressError)}
                  </div>
                )}
                {saveError && <div>{saveError}</div>}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

// Hook to connect BusinessDetails with Accordion edit functionality
export const useBusinessDetailsWithAccordion = (
  professionalDetails?: BusinessDetailsProps["professionalDetails"]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [updateProfessionDetails, { isLoading, error: professionError }] =
    useUpdateProfessionDetailsMutation();

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditStateChange = (editing: boolean) => {
    setIsEditing(editing);
  };

  const handleFormSave = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return {
    isEditing,
    isLoading,
    handleEdit,
    handleSave: handleFormSave,
    handleCancel,
    handleEditStateChange,
    formRef,
    // Props for BusinessDetails component
    businessDetailsProps: {
      professionalDetails,
      isEditing,
      onEditStateChange: handleEditStateChange,
      formRef,
    },
  };
};

export default BusinessDetails;
