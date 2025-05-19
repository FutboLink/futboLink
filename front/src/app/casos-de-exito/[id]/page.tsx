/* eslint-disable */
// @ts-nocheck

// This is a dynamic page component
export default function SuccessCasePage(props) {
  // Extract the case ID from params
  const caseId = props.params?.id;
  
  // Just render a container with data attribute
  return (
    <div id="success-case-container" data-case-id={caseId}></div>
  );
}

// Force server-side rendering for this dynamic route
export const dynamic = 'force-dynamic'; 