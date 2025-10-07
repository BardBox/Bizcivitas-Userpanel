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
} from "../../../../store/api/userApi";
import LocationDropdowns, {
  getCountryISOCode,
  getStateISOCode,
  getCountryName,
  getStateName,
} from "../../ui/LocationDropdowns";

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
    businessCity?: string;
    businessState?: string;
    businessCountry?: string;
    workExperience?: string;
    skills?: string[];
    achievements?: string[];
  };
  isEditing?: boolean; // Controlled by parent (accordion)
  onEditStateChange?: (isEditing: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  professionalDetails,
  isEditing = false,
  onEditStateChange,
  formRef,
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
    businessCity: professionalDetails?.businessCity || "",
    businessState: professionalDetails?.businessState || "",
    businessCountry: professionalDetails?.businessCountry || "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const [updateProfessionDetails, { isLoading, error }] =
    useUpdateProfessionDetailsMutation();
  const [updateAddressDetails] = useUpdateAddressDetailsMutation();

  // Location dropdown states (using ISO codes)
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

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
        businessCity: professionalDetails?.businessCity || "",
        businessState: professionalDetails?.businessState || "",
        businessCountry: professionalDetails?.businessCountry || "",
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
    }
  }, [professionalDetails, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    try {
      // Remove old location fields from form data
      const { businessCity, businessState, businessCountry, ...formData } =
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

      // Prepare addresses data - only send address fields we're updating
      const addressesData = {
        addresses: {
          address: {
            city: selectedCity || "",
            state: selectedState
              ? getStateName(selectedCountry, selectedState)
              : "",
            country: selectedCountry ? getCountryName(selectedCountry) : "",
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
      // Failed to update business details
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    onEditStateChange?.(false);
  };

  return (
    <div className="bg-white rounded-lg p-2 mb-6">
      {/* Content - Simple 2-column table layout */}
      <form ref={formRef} onSubmit={handleSubmit(handleSave)}>
        <div className="space-y-3">
          {/* Classification */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-gray-500" />
                Email{" "}
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.email || "-"}
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Factory className="h-4 w-4 text-gray-500" />
                Mobile
              </span>
            </div>
            <div>
              {!isEditing ? (
                <span className="text-gray-600">
                  {professionalDetails?.mobile || "-"}
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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

          {/* Business Location - Country, State, City */}
          <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
            <div>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                Business Location:
              </span>
            </div>
            <div>
              {!isEditing ? (
                <div className="text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">City: </span>
                    {professionalDetails?.businessCity || "-"}
                  </div>
                  <div>
                    <span className="font-medium">State: </span>
                    {professionalDetails?.businessState || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Country: </span>
                    {professionalDetails?.businessCountry || "-"}
                  </div>
                </div>
              ) : (
                <LocationDropdowns
                  countryValue={selectedCountry}
                  stateValue={selectedState}
                  cityValue={selectedCity}
                  onCountryChange={setSelectedCountry}
                  onStateChange={setSelectedState}
                  onCityChange={setSelectedCity}
                  disabled={false}
                />
              )}
            </div>
          </div>

          {/* Display only fields (shown only in view mode) */}
          {!isEditing && professionalDetails && (
            <>
              {professionalDetails.companyWebsite && (
                <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
                <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
                  <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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
                  <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
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

          {error && isEditing && (
            <div className="grid grid-cols-[35%_1fr] gap-4 py-2">
              <div></div>
              <div className="text-red-500 text-sm">{String(error)}</div>
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

  const [updateProfessionDetails, { isLoading, error }] =
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
