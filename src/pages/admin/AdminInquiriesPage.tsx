import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  CheckCircle, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle,
  X
} from 'lucide-react';
import { CustomerInquiry, InquiryStatus } from '../../types';
import { storeService, getCleanWhatsAppDigits } from '../../services/storeService';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [currentStatus, setCurrentStatus] = useState<InquiryStatus>('new');
  const [loading, setLoading] = useState(true);

  const loadInquiries = async () => {
    setLoading(true);
    const list = await storeService.getInquiries();
    setInquiries(list);
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleOpenDetail = (inquiry: CustomerInquiry) => {
    setSelectedInquiry(inquiry);
    setCurrentStatus(inquiry.status);
    setAdminNote(inquiry.admin_notes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    await storeService.updateInquiryStatus(selectedInquiry.id, currentStatus, adminNote.trim());
    await loadInquiries();
    setSelectedInquiry(null);
  };

  const handleDirectWhatsAppReply = (phone: string, customerName: string) => {
    const clean = getCleanWhatsAppDigits(phone);
    if (!clean) return;
    const msg = encodeURIComponent(`Hello ${customerName}, thank you for contacting JO JO EFFECTS & CO. regarding your inquiry. How can we assist you today?`);
    window.open(`https://wa.me/${clean}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const filtered = inquiries.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      item.full_name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q) ||
      item.phone.includes(q);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
            Customer Relations
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Inquiry Management
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 rounded py-1.5 px-3 text-xs font-semibold text-[#111111]"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-bold uppercase">
            Loading inquiries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500 space-y-2">
            <p>No customer inquiries recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#111111] block">{item.full_name}</span>
                      <span className="text-[11px] text-neutral-400 block">{item.email}</span>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#D4AF62]">
                      {item.inquiry_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                      {item.message}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'responded'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {item.phone && (
                          <button
                            onClick={() => handleDirectWhatsAppReply(item.phone, item.full_name)}
                            title="Reply to customer via WhatsApp"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-semibold text-[11px]"
                        >
                          View / Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E5E7EB] w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF62] block">
                  {selectedInquiry.inquiry_type.replace('_', ' ')}
                </span>
                <h3 className="text-base font-bold text-[#111111]">
                  Inquiry from {selectedInquiry.full_name}
                </h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <p><strong>Email:</strong> {selectedInquiry.email}</p>
                <p><strong>Phone:</strong> {selectedInquiry.phone || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <span className="font-bold text-[#111111] block mb-1">Message:</span>
                <p className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                  {selectedInquiry.message}
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Update Status
                  </label>
                  <select
                    value={currentStatus}
                    onChange={e => setCurrentStatus(e.target.value as InquiryStatus)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="responded">Responded</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Record response notes..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 border border-neutral-300 text-xs font-semibold rounded text-neutral-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#111111] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
