import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Edit3, Save, X } from "lucide-react";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  editable?: boolean; // Enable edit functionality
  onEdit?: () => void; // Called when edit is clicked
  onSave?: () => void; // Called when save is clicked
  onCancel?: () => void; // Called when cancel is clicked
  isEditing?: boolean; // Is currently in edit mode
  isSaving?: boolean; // Is currently saving
  rightContent?: React.ReactNode; // For additional custom content
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  defaultOpen = false,
  editable = false,
  onEdit,
  onSave,
  onCancel,
  isEditing = false,
  isSaving = false,
  rightContent,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  // Automatically open accordion when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setOpen(true);
    }
  }, [isEditing]);

  // Handle smooth height animation
  useEffect(() => {
    if (contentRef.current) {
      if (open) {
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        // Reset to auto after animation completes
        const timer = setTimeout(() => {
          setHeight(undefined);
        }, 300);
        return () => clearTimeout(timer);
      } else {
        // First set to actual height, then to 0 for smooth closing
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [open]);

  return (
    <div className="bg-white rounded-lg shadow-sm px-2">
      <div className="w-full flex justify-between items-center py-4 px-2">
        <button
          className="flex items-center gap-3 text-left focus:outline-none flex-1"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="font-semibold text-gray-900 ">{title}</span>
        </button>

        {/* Right content area for edit buttons */}
        <div className="flex items-center gap-2 ml-4">
          {/* Built-in edit functionality */}
          {editable && (
            <>
              {!isEditing ? (
                <button
                  className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                  onClick={onEdit}
                  aria-label={`Edit ${title}`}
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    onClick={onSave}
                    disabled={isSaving}
                    title={isSaving ? "Saving..." : "Save"}
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition-colors"
                    onClick={onCancel}
                    title="Cancel"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          )}

          {/* Additional custom content */}
          {rightContent}

          {/* Dropdown arrow - moved to the end */}
          <button
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label={`${open ? "Collapse" : "Expand"} ${title}`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          height: height !== undefined ? `${height}px` : 'auto',
          overflow: 'hidden',
          transition: 'height 300ms ease-in-out',
        }}
      >
        <div className="pb-4 px-2">{children}</div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`rounded-lg shadow-sm bg-white ${className}`}>
      {children}
    </div>
  );
};
