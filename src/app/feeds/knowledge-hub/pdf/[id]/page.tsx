"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";

function PDFViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const pdfUrl = searchParams.get("pdfUrl") || "";
  const title = searchParams.get("title") || "Document";

  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Document not found</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Use Google Docs viewer for better PDF rendering (same as mobile app)
  const googleDocsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Document Viewer</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          )}

          {/* Google Docs Viewer (works for PDF, Excel, Word, PPT) */}
          <iframe
            src={googleDocsViewerUrl}
            className="w-full"
            style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
            frameBorder="0"
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Alternative: Direct PDF viewer for browsers that support it */}
        {/* Uncomment this if you prefer native PDF viewer */}
        {/* <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full"
            style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
          >
            <p className="p-6 text-center">
              Your browser doesn't support PDF viewing.{" "}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download the PDF
              </a>{" "}
              to view it.
            </p>
          </object>
        </div> */}

        {/* Back to Hub Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/feeds/knowledge-hub")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse more content
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PDFViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <PDFViewerContent />
    </Suspense>
  );
}
