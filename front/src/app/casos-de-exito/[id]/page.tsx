'use client';

import React from 'react';
import SuccessCaseDetail from '@/components/SuccessCase/SuccessCaseDetail';

type Props = {
  params: { id: string }
}

export default function SuccessCasePage({ params }: Props) {
  return <SuccessCaseDetail id={params.id} />;
}

// Tell Next.js this is a dynamic route that should be rendered on-demand
export const dynamic = 'force-dynamic'; 