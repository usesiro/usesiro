"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { 
  EnvelopeIcon, 
  DocumentCheckIcon, 
  CreditCardIcon, 
  PencilSquareIcon 
} from "@heroicons/react/24/outline";

export default function Notifications() {
  
  // Mock Data based on your screenshot
  const notifications = [
    {
      id: 1,
      type: "support",
      title: "New Message From Support",
      message: "Ticket #5758935 Has Been Resolved And Closed",
      time: "2 Days ago",
      icon: EnvelopeIcon,
      color: "bg-blue-50 text-blue-500"
    },
    {
      id: 2,
      type: "income",
      title: "New Income Recorded",
      message: "₦67,000 Was Received From Bethany",
      time: "10 hours ago",
      icon: DocumentCheckIcon,
      color: "bg-blue-50 text-blue-500"
    },
    {
      id: 3,
      type: "expense",
      title: "New Expense Recorded",
      message: "₦9,200 Was Paid To AEDC",
      time: "2 hours ago",
      icon: CreditCardIcon,
      color: "bg-red-50 text-red-500"
    },
    {
      id: 4,
      type: "income",
      title: "New Income Recorded",
      message: "₦67,000 Was Received From XYZ Ltd",
      time: "1 Week ago",
      icon: DocumentCheckIcon,
      color: "bg-blue-50 text-blue-500"
    },
    {
      id: 5,
      type: "categorize",
      title: "New Income Needs Categorization",
      message: "₦180,786 Received From Xyz Ltd Is Yet To Be Categorized",
      time: "1 Week ago",
      icon: PencilSquareIcon,
      color: "bg-purple-50 text-purple-500"
    },
    {
      id: 6,
      type: "categorize",
      title: "New Expense Needs Categorization",
      message: "₦18,787 Paid To Bello Is Yet To Be Categorized",
      time: "1 Week ago",
      icon: PencilSquareIcon,
      color: "bg-purple-50 text-purple-500"
    },
    {
      id: 7,
      type: "income",
      title: "New Income Recorded",
      message: "₦67,000 Was Received From Bethany",
      time: "1 Day ago",
      icon: DocumentCheckIcon,
      color: "bg-blue-50 text-blue-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        
        {/* HEADER */}
        <h1 className="text-2xl font-bold text-dark mb-6">Notifications</h1>

        {/* TABS */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="px-4 py-2 text-sm font-semibold text-primary border-b-2 border-primary">
            All
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-dark transition">
            Unread
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start transition hover:shadow-md">
              
              {/* ICON BOX */}
              <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-dark mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{item.message}</p>
                <span className="text-xs text-gray-400 font-medium">{item.time}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}