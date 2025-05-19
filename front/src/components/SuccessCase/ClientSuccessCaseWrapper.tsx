'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; 
import SuccessCaseDetail from './SuccessCaseDetail';

export default function ClientSuccessCaseWrapper() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    // Check if we're on a success case page
    if (pathname?.startsWith('/casos-de-exito/')) {
      // Extract the case ID from the URL or data attribute
      const container = document.getElementById('success-case-container');
      if (container) {
        const id = container.getAttribute('data-case-id');
        setCaseId(id);
      } else {
        // Fallback to extracting from URL
        const id = pathname.split('/').pop();
        if (id) setCaseId(id);
      }
    }
  }, [pathname]);
  
  // If we're not on a success case page or don't have an ID, don't render anything
  if (!caseId || !pathname?.startsWith('/casos-de-exito/')) {
    return null;
  }
  
  // Render the detail component with the ID
  return <SuccessCaseDetail id={caseId} />;
} 