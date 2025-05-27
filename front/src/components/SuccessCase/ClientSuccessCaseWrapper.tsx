'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; 
import SuccessCaseDetail from './SuccessCaseDetail';

export default function ClientSuccessCaseWrapper() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    
    // Check if we're on a success case page
    if (pathname?.startsWith('/casos-de-exito/')) {
      try {
        // Extract the case ID from the URL or data attribute
        const container = document.getElementById('success-case-container');
        if (container) {
          const id = container.getAttribute('data-case-id');
          if (id) {
            console.log('Success case ID found from container:', id);
            setCaseId(id);
          }
        } else {
          // Fallback to extracting from URL
          const segments = pathname.split('/');
          const id = segments[segments.length - 1];
          if (id) {
            console.log('Success case ID extracted from URL:', id);
            setCaseId(id);
          }
        }
      } catch (error) {
        console.error('Error extracting case ID:', error);
      } finally {
        setIsReady(true);
      }
    } else {
      setIsReady(true);
    }
  }, [pathname]);
  
  // If we're not on a success case page or don't have an ID, don't render anything
  if (!isReady) {
    return null;
  }
  
  if (!caseId || !pathname?.startsWith('/casos-de-exito/')) {
    return null;
  }
  
  console.log('Rendering SuccessCaseDetail with ID:', caseId);
  
  // Render the detail component with the ID
  return <SuccessCaseDetail id={caseId} />;
} 