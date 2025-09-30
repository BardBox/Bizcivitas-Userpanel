import { useState, useCallback } from 'react';

interface UseAccordionProps {
  defaultExpanded?: string[];
  multipleOpen?: boolean;
}

interface AccordionSection {
  key: string;
  title: string;
  content: string | string[];
}

export function useAccordion({ 
  defaultExpanded = [], 
  multipleOpen = true 
}: UseAccordionProps = {}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    defaultExpanded.forEach(key => {
      initial[key] = true;
    });
    return initial;
  });

  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => {
      if (!multipleOpen) {
        // If only one section can be open, close all others
        const newState: Record<string, boolean> = {};
        Object.keys(prev).forEach(key => {
          newState[key] = key === sectionKey ? !prev[key] : false;
        });
        return newState;
      } else {
        // Multiple sections can be open
        return {
          ...prev,
          [sectionKey]: !prev[sectionKey]
        };
      }
    });
  }, [multipleOpen]);

  const expandAll = useCallback((sections: AccordionSection[]) => {
    const newState: Record<string, boolean> = {};
    sections.forEach(section => {
      newState[section.key] = true;
    });
    setExpandedSections(newState);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSections(prev => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  }, []);

  const isExpanded = useCallback((sectionKey: string) => {
    return expandedSections[sectionKey] || false;
  }, [expandedSections]);

  return {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll,
    isExpanded
  };
}
