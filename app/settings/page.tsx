"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { useNotification } from "@/context/NotificationContext";
import MonoButton from "@/components/mono/MonoButton";
import { PencilSquareIcon, PhotoIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import SettingsSkeleton from "@/components/SettingsSkeleton";

export default function Settings() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<"Personal Info" | "Business Info" | "Subscription" | "Automation" | "Notification" | "Security" | "Audit Logs">("Personal Info");
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
    annualTurnover: "",
    fixedAssets: "",
    isProfessionalServices: false,
  });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // --- PREFERENCES STATE ---
  const [preferences, setPreferences] = useState({ emailNotifications: true, loginAlerts: true });
  const { isMuted, toggleMute } = useNotification();

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const logsPerPage = 10;

  // --- SUBSCRIPTION STATE ---
  const [subscriptionData, setSubscriptionData] = useState<{ isPro: boolean; payment: any }>({ isPro: false, payment: null });

  const tabs = ["Personal Info", "Business Info", "Subscription", "Automation", "Notification", "Security", "Audit Logs"];

  const fetchData = async () => {
    try {
      const [bizRes, payRes] = await Promise.all([
        fetch("/api/v1/business/me"),
        fetch("/api/payments/status")
      ]);
      if (bizRes.ok) {
        const fetchedData = await bizRes.json();
        setData(fetchedData);
        setFormData({
          firstName: fetchedData?.owner?.firstName || "",
          lastName: fetchedData?.owner?.lastName || "",
          email: fetchedData?.owner?.email || "",
          phone: fetchedData?.owner?.phone || "",
          businessName: fetchedData?.name || "",
          industry: fetchedData?.industry || "",
          annualTurnover: String(fetchedData?.annualTurnover || ""),
          fixedAssets: String(fetchedData?.fixedAssets || ""),
          isProfessionalServices: Boolean(fetchedData?.isProfessionalServices),
        });
        setPreferences({
          emailNotifications: fetchedData?.owner?.marketingEmails,
          loginAlerts: fetchedData?.owner?.twoFactorEnabled
        });
      }
      if (payRes.ok) {
        setSubscriptionData(await payRes.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLogsLoading(true);
    try {
      const res = await fetch("/api/v1/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs);
      }
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAuditLogs();
  }, []);

  if (loading) return <SettingsSkeleton />;

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  };

  const handleUpdateSection = async (section: "personal" | "business") => {
    setIsSaving(true);
    try {
      // Build payload based on which section is being saved
      const payload = section === "personal" 
        ? { owner: { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone } }
        : { name: formData.businessName, industry: formData.industry, annualTurnover: Number(formData.annualTurnover || 0), fixedAssets: Number(formData.fixedAssets || 0), isProfessionalServices: formData.isProfessionalServices, taxProfileCompleted: true };

      const res = await fetch("/api/v1/business/me", {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchData(); // Refresh data from server
        section === "personal" ? setIsEditingPersonal(false) : setIsEditingBusiness(false);
        showNotification("Profile updated successfully", "success");
      } else {
        const err = await res.json();
        showNotification(err.error || `Failed to update ${section} info`, "error");
      }
    } catch (error: any) {
      const msg = error.message === "Failed to fetch" || error.name === "TypeError"
        ? "Your connection has been cut off. Please check your internet and try again later."
        : error.message || "Network error. Please try again.";
      showNotification(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification("Passwords do not match!", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/auth/password", {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      });

      if (res.ok) {
        showNotification("Password updated. Please sign in again.", "success");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => router.replace("/login"), 800);
      } else {
        const result = await res.json();
        showNotification(result.error || "Failed to update password.", "error");
      }
    } catch (error: any) {
      const msg = error.message === "Failed to fetch" || error.name === "TypeError"
        ? "Your connection has been cut off. Please check your internet and try again later."
        : "Failed to update password.";
      showNotification(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(auditLogs.length / logsPerPage);
  const currentLogs = auditLogs.slice((auditLogPage - 1) * logsPerPage, auditLogPage * logsPerPage);

  if (loading) return (
    <DashboardLayout>
      <div className="p-10 text-center text-gray-400 uppercase font-bold animate-pulse">Fetching Details...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        
        {/* TABS */}
        <div className="bg-gray-100/50 p-1.5 rounded-xl flex flex-nowrap overflow-x-auto no-scrollbar gap-2 mb-8 w-full md:w-fit border border-gray-100 shadow-none scroll-smooth">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab as any); setAuditLogPage(1); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
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
                  <EditField label="Annual Turnover (NGN)" name="annualTurnover" value={formData.annualTurnover} onChange={handleInputChange} type="number" />
                  <EditField label="Fixed Assets (NGN)" name="fixedAssets" value={formData.fixedAssets} onChange={handleInputChange} type="number" />
                  <label className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 text-sm font-bold text-gray-700">
                    <input type="checkbox" name="isProfessionalServices" checked={formData.isProfessionalServices} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary" />
                    Professional services business
                  </label>
                  <EditField label="Business Type" name="type" value="Sole Business" disabled={true} note="Contact support to upgrade entity type" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="Business Name" value={data?.name} />
                  <Field label="Industry" value={data?.industry} />
                  <Field label="Annual Turnover" value={`NGN ${Number(data?.annualTurnover || 0).toLocaleString('en-NG')}`} />
                  <Field label="Fixed Assets" value={`NGN ${Number(data?.fixedAssets || 0).toLocaleString('en-NG')}`} />
                  <Field label="Professional Services" value={data?.isProfessionalServices ? "Yes" : "No"} />
                  <Field label="Type" value="Sole Business" />
                </div>
              )}
            </div>
          )}

          {/* --- SUBSCRIPTION TAB --- */}
          {activeTab === "Subscription" && (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-2xl animate-fade-in-up">
              {subscriptionData.isPro ? (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Siro Pro</h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Plan</span>
                      <span className="text-sm font-bold text-gray-900">Siro Pro — 30-day access</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Access until</span>
                      <span className="text-sm font-bold text-gray-900">
                        {subscriptionData.payment?.accessEndsAt
                          ? new Date(subscriptionData.payment.accessEndsAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : "Founder access"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Status</span>
                      <span className="text-sm font-bold text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Activated on</span>
                      <span className="text-sm font-bold text-gray-900">
                        {subscriptionData.payment?.paidAt
                          ? new Date(subscriptionData.payment.paidAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">Payment method</span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{subscriptionData.payment?.channel || "Card"}</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                      <span className="text-sm text-gray-500 font-medium">Reference</span>
                      <span className="text-xs font-mono text-gray-400">{subscriptionData.payment?.reference || "—"}</span>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-green-50/50 border border-green-100 rounded-xl">
                    <p className="text-xs text-green-700 font-medium">
                      You have full access to AI-powered imports, reconciliation, tax-readiness tools, and reporting.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No active subscription</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
                      Upgrade to Siro Pro to unlock AI imports, reconciliation, and unlimited tax reporting.
                    </p>
                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100">
                      Get 30-day access — ₦9,999
                    </a>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --- AUTOMATION TAB --- */}
          {activeTab === "Automation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center opacity-75">
                <div className="w-20 h-20 mx-auto rounded-3xl mb-6 flex items-center justify-center bg-gray-50 text-gray-400">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-1">Bank Sync</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200 mb-6">
                  Coming Soon
                </div>
                <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                  Automatic bank syncing via Open Banking is under development. You&apos;ll be able to connect your Nigerian bank account and pull transactions automatically.
                </p>
                <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed">
                  Connect Bank
                </button>
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
                <Toggle 
                  label="Sound Notifications" 
                  description="Play a subtle sound when a high-priority action is required."
                  checked={!isMuted} 
                  onChange={toggleMute} 
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
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                  <input 
                    type="password" 
                    autoComplete="new-password"
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
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary transition" 
                  />
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || isSaving}
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
              
              {/* MOBILE LIST VIEW */}
              <div className="md:hidden divide-y divide-gray-50">
                {isLogsLoading ? (
                  <div className="p-6 text-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                    Syncing Secure Logs...
                  </div>
                ) : currentLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No audit entries found
                  </div>
                ) : (
                  currentLogs.map((log) => (
                    <div key={log.id} className="p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-gray-900 uppercase">{formatAuditAction(log.action)}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest 
                          ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>{log.ip || "System Action"}</span>
                        <span>{new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Action</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLogsLoading ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">
                          Syncing Secure Logs...
                        </td>
                      </tr>
                    ) : currentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                          No audit entries found
                        </td>
                      </tr>
                    ) : (
                      currentLogs.map((log) => (
                        <tr key={log.id} className="text-sm hover:bg-gray-50/50 transition group">
                          <td className="px-8 py-5">
                            <div className="font-bold text-gray-800">{formatAuditAction(log.action)}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {log.ip || "System Action"}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest 
                              ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-gray-400 font-bold text-right text-xs">
                            {new Date(log.createdAt).toLocaleString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* PAGINATION CONTROLS */}
              {!isLogsLoading && totalPages > 1 && (
                <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                  <button 
                    onClick={() => setAuditLogPage(prev => Math.max(prev - 1, 1))}
                    disabled={auditLogPage === 1}
                    className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    Page {auditLogPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setAuditLogPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={auditLogPage === totalPages}
                    className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- HELPER COMPONENTS ---

function formatAuditAction(action: string) {
  const map: Record<string, string> = {
    "AUTH.LOGIN_SUCCESS": "User Login",
    "AUTH.LOGIN_FAILURE": "Failed Login Attempt",
    "AUTH.SIGNUP": "New Account Created",
    "TRANSACTION.CREATE": "Transaction Created",
    "TRANSACTION.BULK_UPDATE": "Bulk Transaction Update",
    "TRANSACTION.BULK_DELETE": "Transactions Deleted",
    "TRANSACTION.CLEAR_ALL": "Transaction History Cleared",
    "TRANSACTION.VAT_UPDATE": "VAT Status Modified",
    "DOCUMENT.UPLOAD": "Document Uploaded",
    "PROFILE.UPDATE": "Business Profile Updated",
    "AUTH.PASSWORD_UPDATE": "Password Changed"
  };
  return map[action] || action.replace(/[._]/g, ' ');
}

function Field({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="text-[15px] font-bold text-gray-600">{value || "Not set"}</div>
    </div>
  );
}

function EditField({ label, name, value, onChange, disabled = false, note, type = "text" }: any) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full text-sm font-bold border rounded-xl px-4 py-3.5 transition focus:outline-none 
          ${disabled ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 focus:border-primary'}`}
      />
      {note && <p className="text-[10px] text-gray-400 mt-2 font-medium">{note}</p>}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex justify-between items-center py-5 border-b border-gray-50 last:border-0 cursor-pointer group" onClick={onChange}>
      <div>
        <span className="block text-sm font-bold text-gray-600 mb-0.5">{label}</span>
        <span className="block text-xs text-gray-400">{description}</span>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-gray-200 group-hover:bg-gray-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}
