"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import MonoButton from "@/components/mono/MonoButton";
import { PencilSquareIcon, PhotoIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Personal Info");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- EDIT MODES ---
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    industry: "",
  });

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

  // --- PREFERENCES STATE ---
  const [preferences, setPreferences] = useState({ emailNotifications: true, loginAlerts: true });

  const tabs = ["Personal Info", "Business Info", "Automation", "Notification", "Security", "Audit Logs"];

  const fetchData = async () => {
    try {
      const res = await fetch("/api/v1/business/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("siro_access_token")}` }
      });
      if (res.ok) {
        const fetchedData = await res.json();
        setData(fetchedData);
        // Pre-fill form data
        setFormData({
          firstName: fetchedData?.owner?.firstName || "",
          lastName: fetchedData?.owner?.lastName || "",
          email: fetchedData?.owner?.email || "",
          phone: fetchedData?.owner?.phone || "",
          businessName: fetchedData?.name || "",
          industry: fetchedData?.industry || "",
        });
      }
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateSection = async (section: "personal" | "business") => {
    setIsSaving(true);
    try {
      // Build payload based on which section is being saved
      const payload = section === "personal" 
        ? { owner: { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone } }
        : { name: formData.businessName, industry: formData.industry };

      const res = await fetch("/api/v1/business/me", {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchData(); // Refresh data from server
        section === "personal" ? setIsEditingPersonal(false) : setIsEditingBusiness(false);
      } else {
        const err = await res.json();
        alert(err.error || `Failed to update ${section} info`);
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("siro_access_token")}`
        },
        body: JSON.stringify({ newPassword: passwords.newPassword })
      });

      if (res.ok) {
        alert("Password updated successfully!");
        setPasswords({ newPassword: "", confirmPassword: "" });
      } else {
        alert("Failed to update password.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-10 text-center text-gray-400 uppercase font-bold animate-pulse">Fetching Details...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        
        {/* TABS */}
        <div className="bg-gray-100/50 p-1.5 rounded-xl flex flex-wrap gap-2 mb-8 w-fit border border-gray-100 shadow-none">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === tab ? "bg-white text-gray-800 border border-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          
          {/* --- PERSONAL INFO TAB --- */}
          {activeTab === "Personal Info" && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
                {!isEditingPersonal ? (
                  <button onClick={() => setIsEditingPersonal(true)} className="text-primary text-sm font-bold border border-primary/20 px-5 py-2 rounded-xl hover:bg-primary/5 transition">
                    Edit Details
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditingPersonal(false)} className="text-gray-500 text-sm font-bold border border-gray-200 px-5 py-2 rounded-xl hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button onClick={() => handleUpdateSection("personal")} disabled={isSaving} className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-50">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {isEditingPersonal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                  <EditField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <EditField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  <EditField label="Email Address" name="email" value={formData.email} onChange={handleInputChange} disabled={true} note="Email cannot be changed" />
                  <EditField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="First Name" value={data?.owner?.firstName} />
                  <Field label="Last Name" value={data?.owner?.lastName} />
                  <Field label="Email" value={data?.owner?.email} />
                  <Field label="Phone" value={data?.owner?.phone || "Not provided"} />
                </div>
              )}
            </div>
          )}

          {/* --- BUSINESS INFO TAB --- */}
          {activeTab === "Business Info" && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-800">Business Details</h2>
                {!isEditingBusiness ? (
                  <button onClick={() => setIsEditingBusiness(true)} className="text-primary text-sm font-bold border border-primary/20 px-5 py-2 rounded-xl hover:bg-primary/5 transition">
                    Edit Details
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditingBusiness(false)} className="text-gray-500 text-sm font-bold border border-gray-200 px-5 py-2 rounded-xl hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button onClick={() => handleUpdateSection("business")} disabled={isSaving} className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-50">
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {isEditingBusiness ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                  <EditField label="Business Name" name="businessName" value={formData.businessName} onChange={handleInputChange} />
                  <EditField label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} />
                  <EditField label="Business Type" name="type" value="Sole Business" disabled={true} note="Contact support to upgrade entity type" />
                  <EditField label="TIN Status" name="tin" value="Verified" disabled={true} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="Business Name" value={data?.name} />
                  <Field label="Industry" value={data?.industry} />
                  <Field label="Type" value="Sole Business" />
                  <Field label="TIN" value="Verified" />
                </div>
              )}
            </div>
          )}

          {/* --- AUTOMATION TAB --- */}
          {activeTab === "Automation" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl mb-4 flex items-center justify-center ${data?.monoAccountId ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Bank Sync</h3>
                <p className="text-sm font-medium text-gray-400 mb-6">Status: <span className={data?.monoAccountId ? "text-green-500 font-bold" : "text-gray-500"}>{data?.monoAccountId ? "Active & Linked" : "Disconnected"}</span></p>
                <MonoButton label={data?.monoAccountId ? "Reconnect Bank" : "Connect Bank"} className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition" onSuccess={() => window.location.reload()} />
              </div>
            </div>
          )}

          {/* --- NOTIFICATION TAB --- */}
          {activeTab === "Notification" && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Communication Preferences</h2>
              <p className="text-sm text-gray-500 mb-8">Manage how we contact you and what alerts you receive.</p>
              
              <div className="space-y-2">
                <Toggle 
                  label="Email Notifications" 
                  description="Receive weekly summaries and tax reminders."
                  checked={preferences.emailNotifications} 
                  onChange={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))} 
                />
                <Toggle 
                  label="Login Alerts" 
                  description="Get notified of any logins from new devices."
                  checked={preferences.loginAlerts} 
                  onChange={() => setPreferences(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))} 
                />
              </div>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === "Security" && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-xl animate-fade-in-up">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Change Password</h2>
              <p className="text-sm text-gray-500 mb-8">Ensure your account is using a long, random password to stay secure.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={!passwords.newPassword || isSaving}
                    className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {isSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- AUDIT LOGS TAB --- */}
          {activeTab === "Audit Logs" && (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-fade-in-up">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-4">Action</th>
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr className="text-sm hover:bg-gray-50/50 transition">
                    <td className="px-8 py-5 font-bold text-gray-700">Bank Synced (Mono)</td>
                    <td className="px-8 py-5 text-gray-600">Admin</td>
                    <td className="px-8 py-5 text-gray-400">Today, 10:45 AM</td>
                  </tr>
                  <tr className="text-sm hover:bg-gray-50/50 transition">
                    <td className="px-8 py-5 font-bold text-gray-700">Logged In</td>
                    <td className="px-8 py-5 text-gray-600">Admin</td>
                    <td className="px-8 py-5 text-gray-400">Today, 09:00 AM</td>
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

// --- HELPER COMPONENTS ---

function Field({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="text-[15px] font-bold text-gray-800">{value || "Not set"}</div>
    </div>
  );
}

function EditField({ label, name, value, onChange, disabled = false, note }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full text-sm font-bold border rounded-xl px-4 py-3.5 transition focus:outline-none 
          ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-800 border-gray-200 focus:border-primary'}`}
      />
      {note && <p className="text-[10px] text-gray-400 mt-2 font-medium">{note}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex justify-between items-center py-5 border-b border-gray-50 last:border-0 cursor-pointer group" onClick={onChange}>
      <div>
        <span className="block text-sm font-bold text-gray-800 mb-0.5">{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}