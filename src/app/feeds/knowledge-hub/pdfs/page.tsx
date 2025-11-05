"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Loader2, Search, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useGetPDFsQuery,
  type MediaItem,
} from "../../../../../store/api/knowledgeHubApi";

export default function PDFsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pdfs = [], isLoading } = useGetPDFsQuery();

  // Filter PDFs based on search
  const filteredPDFs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pdf.fileName && pdf.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePdfClick = (media: MediaItem) => {
    router.push(
      `/feeds/knowledge-hub/pdf/${media._id}?` +
        new URLSearchParams({
          pdfUrl: media.url || "",
          title: media.title,
        }).toString()
    );
  };

  const handleDownload = (e: React.MouseEvent, media: MediaItem) => {
    e.stopPropagation();
    if (media.url) {
      window.open(media.url, "_blank");
    }
  };

  // Helper to get file extension
  const getFileExtension = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase();
    return ext || "DOC";
  };

  // Helper to get file type color
  const getFileTypeColor = (fileName?: string) => {
    if (!fileName) return "bg-blue-100 text-blue-600";
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "bg-red-100 text-red-600";
      case "doc":
      case "docx":
        return "bg-blue-100 text-blue-600";
      case "xls":
      case "xlsx":
        return "bg-green-100 text-green-600";
      case "ppt":
      case "pptx":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-white/90 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Knowledge Hub</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">
              Business Templates & Documents
            </h1>
          </div>
          <p className="text-white/90">
            {pdfs.length} document{pdfs.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        ) : filteredPDFs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No documents found" : "No documents available"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPDFs.map((pdf) => (
              <div
                key={pdf._id}
                onClick={() => handlePdfClick(pdf)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center text-center">
                  {/* File Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${getFileTypeColor(
                      pdf.fileName
                    )}`}
                  >
                    <FileText className="w-10 h-10" />
                  </div>

                  {/* File Type Badge */}
                  {pdf.fileName && (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded mb-3 ${getFileTypeColor(
                        pdf.fileName
                      )}`}
                    >
                      {getFileExtension(pdf.fileName)}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {pdf.title}
                  </h3>

                  {/* File Name */}
                  {pdf.fileName && (
                    <p className="text-xs text-gray-500 mb-1">{pdf.fileName}</p>
                  )}

                  {/* File Size */}
                  {pdf.sizeInBytes && (
                    <p className="text-xs text-gray-400 mb-3">
                      {formatFileSize(pdf.sizeInBytes)}
                    </p>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={(e) => handleDownload(e, pdf)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
