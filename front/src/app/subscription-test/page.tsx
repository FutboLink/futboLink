import React from 'react';
import SubsSimple from '../../components/Subs/SubsSimple';

export default function SubscriptionTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Test Page</h1>
          <p className="mt-2 text-gray-600">This page uses a simplified subscription component for testing</p>
        </div>
        
        <SubsSimple />
      </div>
    </div>
  );
} 