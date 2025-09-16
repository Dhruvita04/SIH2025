"use client";

import React, { useState, useEffect } from 'react';
import { MdSignalWifiOff, MdHealthAndSafety } from 'react-icons/md';

interface OfflineNotificationProps {
  show: boolean;
  onClose: () => void;
}

const OfflineNotification: React.FC<OfflineNotificationProps> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <MdSignalWifiOff className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-800 mb-1">No Internet Connection</h4>
          <p className="text-sm text-yellow-700 mb-3">
            You're being redirected to your offline health records for continued access to your medical information.
          </p>
          <div className="flex items-center text-sm text-yellow-600">
            <MdHealthAndSafety className="mr-1" />
            <span>Offline access available</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OfflineNotification;