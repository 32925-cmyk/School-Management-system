/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Phone, User, ShieldCheck } from 'lucide-react';
import { getTransportRoutes, getStudentById } from '../../services/api';
import { TransportRoute, Student } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const StudentTransport: React.FC = () => {
  const { currentUser } = useAuth();
  const [route, setRoute] = useState<TransportRoute | null>(null);

  useEffect(() => {
    if (currentUser) {
      getTransportRoutes().then((routes) => {
        // stu-001 is assigned to rt-01
        setRoute(routes[0]);
      });
    }
  }, [currentUser]);

  if (!route) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-[#121933] animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          My Bus Transit & Route Details
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Registered campus transit line, designated morning pickup stop, vehicle number, and driver contact.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold font-['Sora'] text-neutral-900 dark:text-white">
                {route.routeName}
              </h2>
              <span className="font-mono text-xs text-neutral-400">Code: {route.routeCode}</span>
            </div>
          </div>
          <span className="font-mono font-bold text-sm text-teal-500">
            {formatPKR(route.monthlyFee)} / mo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] space-y-1">
            <span className="text-neutral-400 block text-[11px]">Assigned Bus Vehicle</span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white">{route.vehicleNumber}</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] space-y-1">
            <span className="text-neutral-400 block text-[11px]">Transit Driver</span>
            <span className="font-bold text-neutral-900 dark:text-white">{route.driverName}</span>
            <span className="font-mono text-teal-400 block">{route.driverPhone}</span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-['Sora']">
            Designated Stops & Timetable
          </h3>
          <div className="space-y-2">
            {route.stops.map((stp, idx) => (
              <div
                key={stp.id}
                className="p-3 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold font-mono text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{stp.stopName}</span>
                </div>
                <div className="text-right font-mono text-teal-400">
                  Pickup: {stp.pickupTime} AM
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
