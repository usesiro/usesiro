"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import MonoButton from "@/components/mono/MonoButton";
import { PencilSquareIcon, PhotoIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const tabs = ["Personal Info", "Business Info", "Automation", "Notification", "Security", "Audit Logs"];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/business/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
        });
        if (res.ok) setData(await res.json());
      } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400 uppercase font-bold">Fetching...</div>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-100/50 p-1.5 rounded-xl flex flex-wrap gap-2 mb-8 w-fit border border-gray-100 shadow-none">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === tab ? "bg-white text-gray-800 border border-gray-100" : "text-gray-500 hover:text-gray-800"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "Personal Info" && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-none">
              <div className="flex justify-between mb-8">
                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                <button className="text-primary text-sm font-bold border border-primary/20 px-4 py-1.5 rounded-lg">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <Field label="First Name" value={data?.owner?.firstName} />
                <Field label="Last Name" value={data?.owner?.lastName} />
                <Field label="Email" value={data?.owner?.email} />
                <Field label="Phone" value={data?.owner?.phone || "091000000"} />
              </div>
            </div>
          )}

          {activeTab === "Business Info" && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-none">
              <div className="flex justify-between mb-8">
                <h2 className="text-lg font-bold text-gray-800">Business Details</h2>
                <button className="text-primary text-sm font-bold border border-primary/20 px-4 py-1.5 rounded-lg">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <Field label="Business Name" value={data?.name} />
                <Field label="Industry" value={data?.industry} />
                <Field label="Type" value="Sole Business" />
                <Field label="TIN" value="Verified" />
              </div>
            </div>
          )}

          {activeTab === "Automation" && (
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Bank Sync</h3>
                <p className="text-xs text-gray-400 mb-6">Status: {data?.monoAccountId ? "Active" : "Disconnected"}</p>
                <MonoButton label="Connect Bank" className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold" onSuccess={() => window.location.reload()} />
              </div>
            </div>
          )}

          {activeTab === "Notification" && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-none">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Preferences</h2>
              <Toggle label="Email Notifications" checked={true} />
              <Toggle label="Login Alerts" checked={true} />
            </div>
          )}

          {activeTab === "Security" && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 max-w-lg">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Change Password</h2>
              <input type="password" placeholder="New Password" className="w-full border border-gray-100 p-3 rounded-xl mb-4 text-sm" />
              <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm">Update Password</button>
            </div>
          )}

          {activeTab === "Audit Logs" && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-none">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="text-sm">
                    <td className="px-6 py-4 font-semibold">Bank Synced</td>
                    <td className="px-6 py-4">Admin</td>
                    <td className="px-6 py-4 text-gray-400">07, Jan 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, value }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{label}</label>
      <div className="text-sm font-semibold text-gray-700">{value || "Not set"}</div>
    </div>
  );
}

function Toggle({ label, checked }: any) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-50">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className={`w-10 h-5 rounded-full relative ${checked ? 'bg-green-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full`} />
      </div>
    </div>
  );
}