import React from "react";
import { Building2, MapPin, Briefcase } from "lucide-react";

interface ViewOnlyBusinessDetailsProps {
  businessDetails: {
    companyName?: string;
    business?: string;
    businessSubcategory?: string;
    classification?: string;
    myBusiness?: string;
    businessAddress?: string;
    companyAddress?: string;
    businessCity?: string;
    businessState?: string;
    businessCountry?: string;
    email?: string;
    mobile?: string;
    location?: string;
  };
}

const ViewOnlyBusinessDetails: React.FC<ViewOnlyBusinessDetailsProps> = ({
  businessDetails,
}) => {
  const hasData = Object.values(businessDetails || {}).some(value => value);

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>This member hasn&apos;t added their business details yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Information */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Company Information
          </h4>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Company:</span>
              <p className="font-medium">{businessDetails?.companyName || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Business Type:</span>
              <p className="font-medium">{businessDetails?.business || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Category:</span>
              <p className="font-medium">{businessDetails?.businessSubcategory || 'Not provided'}</p>
            </div>
            {businessDetails?.classification && (
              <div>
                <span className="text-sm text-gray-500">Classification:</span>
                <p className="font-medium">{businessDetails.classification}</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Address */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Business Address
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {businessDetails?.businessAddress || businessDetails?.companyAddress ? (
              <div className="space-y-1">
                <p className="font-medium">{businessDetails?.businessAddress || businessDetails?.companyAddress}</p>
                {businessDetails?.businessCity && (
                  <p className="text-gray-600">
                    {businessDetails.businessCity}
                    {businessDetails?.businessState && `, ${businessDetails.businessState}`}
                  </p>
                )}
                {businessDetails?.businessCountry && (
                  <p className="text-gray-600">{businessDetails.businessCountry}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Business address not provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Description */}
      {businessDetails?.myBusiness && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
            About Their Business
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{businessDetails.myBusiness}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      {(businessDetails?.email || businessDetails?.mobile) && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Business Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessDetails?.email && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium break-all">{businessDetails.email}</p>
              </div>
            )}
            {businessDetails?.mobile && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-500">Phone:</span>
                <p className="font-medium">{businessDetails.mobile}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOnlyBusinessDetails;