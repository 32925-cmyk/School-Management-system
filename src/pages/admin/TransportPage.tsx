/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Bus,
  Plus,
  Phone,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getTransportRoutes, createTransportRoute, getStudents } from '../../services/api';
import { TransportRoute, Student } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TransportPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New route state
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('R-104');
  const [vehicleNumber, setVehicleNumber] = useState('ISB-9901 (Bus)');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+92 300 1234567');
  const [monthlyFee, setMonthlyFee] = useState(5500);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [r, s] = await Promise.all([getTransportRoutes(), getStudents()]);
    setRoutes(r);
    setStudents(s);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createTransportRoute(
        {
          routeName,
          routeCode,
          vehicleNumber,
          driverName,
          driverPhone,
          monthlyFee: Number(monthlyFee),
          stops: [
            { id: 'stp-1', stopName: 'Terminal Origin', pickupTime: '07:15', dropTime: '15:00' },
            { id: 'stp-2', stopName: 'Academy Main Gate', pickupTime: '08:05', dropTime: '14:15' },
          ],
        },
        currentUser
      );
      showSuccess('Transit Route Added', `Route ${routeCode} registered.`);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Campus Fleet & Transit Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Designated routes, vehicles, driver contacts, assigned ridership, and integrated transport fee heads.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Transit Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((rt) => {
          const assignedStudents = students.filter((s) => s.transportRouteId === rt.id);

          return (
            <div
              key={rt.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                    {rt.routeCode}
                  </span>
                  <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                    {formatPKR(rt.monthlyFee)}/mo
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {rt.routeName}
                  </h3>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-mono">
                    <Bus className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{rt.vehicleNumber}</span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-mono">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Driver: {rt.driverName}</span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{rt.driverPhone}</span>
                  </div>
                </div>

                {/* Stops */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#1A2347] space-y-1.5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Stops & Pickup Times ({rt.stops.length})
                  </span>
                  {rt.stops.map((stp) => (
                    <div
                      key={stp.id}
                      className="text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between"
                    >
                      <span className="truncate">{stp.stopName}</span>
                      <span className="font-mono text-[10px] text-neutral-400 shrink-0">{stp.pickupTime} AM</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-[#1A2347] flex items-center justify-between text-xs">
                <span className="text-neutral-400">Assigned Cohort:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-teal-400">
                  {assignedStudents.length} Students
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ROUTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Create Transit Route</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Route Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Route 4 - Chak Shahzad Corridor"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Route Code</label>
                  <input
                    type="text"
                    required
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Monthly Fee (PKR)</label>
                  <input
                    type="number"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Vehicle Details</label>
                <input
                  type="text"
                  required
                  placeholder="ISB-9901 (Air-conditioned Coaster)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Muhammad Hanif"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Driver Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="+92 300 1234567"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Register Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
