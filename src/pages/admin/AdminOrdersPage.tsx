import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Truck, 
  CheckCircle, 
  Clock, 
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { storeService } from '../../services/storeService';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Editing State
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('new');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('awaiting_verification');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('USPS');
  const [internalNote, setInternalNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const list = await storeService.getOrders();
    setOrders(list);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.order_status);
    setPaymentStatus(order.payment_status);
    setTrackingNumber(order.tracking_number || '');
    setCarrier(order.carrier || 'USPS');
    setInternalNote('');
    setSaveSuccess(false);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (orderStatus !== selectedOrder.order_status || internalNote.trim()) {
      await storeService.updateOrderStatus(selectedOrder.id, orderStatus, internalNote.trim());
    }

    if (paymentStatus !== selectedOrder.payment_status) {
      await storeService.updatePaymentStatus(selectedOrder.id, paymentStatus);
    }

    if (trackingNumber.trim()) {
      await storeService.updateOrderTracking(selectedOrder.id, trackingNumber.trim(), carrier);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    await loadOrders();
    
    // Refresh current modal view
    const updated = await storeService.getOrderByReference(selectedOrder.order_reference);
    if (updated) setSelectedOrder(updated);
  };

  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Reference', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Total USD', 'Payment Method', 'Payment Status', 'Fulfillment Status'];
    const rows = orders.map(o => [
      o.order_reference,
      new Date(o.created_at).toLocaleDateString(),
      `"${o.customer.full_name}"`,
      o.customer.email,
      o.customer.phone,
      `"${o.customer.address}"`,
      o.customer.city,
      o.customer.state,
      o.customer.postal_code,
      o.total_amount.toFixed(2),
      o.payment_method,
      o.payment_status,
      o.order_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jojo_orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      order.order_reference.toLowerCase().includes(q) ||
      order.customer.full_name.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      order.customer.phone.includes(q);

    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

    return matchesQuery && matchesStatus && matchesPayment;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
            Fulfillment &amp; Verification
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Order Management
          </h1>
        </div>

        <button
          onClick={exportToCSV}
          disabled={orders.length === 0}
          className="px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-neutral-50 text-neutral-800 rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-[#D4AF62]" />
          <span>Export Orders (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search ref, customer, phone..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded py-1.5 px-2 text-xs font-semibold text-[#111111]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded py-1.5 px-2 text-xs font-semibold text-[#111111]"
            >
              <option value="all">All Payments</option>
              <option value="awaiting_verification">Awaiting Verification</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-bold uppercase">
            Loading orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500 space-y-2">
            <p>No orders found matching criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPaymentFilter('all'); }}
              className="text-[#D4AF62] font-semibold"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                      {order.order_reference}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#111111] block">{order.customer.full_name}</span>
                      <span className="text-[11px] text-neutral-400 block">{order.customer.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td className="py-3 px-4 font-bold text-[#111111] tabular-nums">
                      ${order.total_amount.toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.payment_status === 'awaiting_verification'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {order.payment_status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 uppercase">
                        via {order.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.order_status === 'shipped' || order.order_status === 'delivered'
                          ? 'bg-blue-100 text-blue-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(order)}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E5E7EB] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Top Bar */}
            <div className="flex justify-between items-start pb-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Order Management
                </span>
                <h3 className="text-lg font-bold font-mono text-[#111111]">
                  {selectedOrder.order_reference}
                </h3>
                <span className="text-xs text-neutral-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md">
                Order details updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              
              {/* Customer & Shipping */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[#111111]">Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer.full_name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                <div className="pt-2 border-t border-neutral-200">
                  <h4 className="font-bold uppercase tracking-wider text-[#111111] mb-1">Shipping Address</h4>
                  <p>{selectedOrder.customer.address}</p>
                  <p>{selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.postal_code}</p>
                  <p>{selectedOrder.customer.country}</p>
                  {selectedOrder.customer.delivery_instructions && (
                    <p className="italic text-neutral-500 mt-1">Instructions: {selectedOrder.customer.delivery_instructions}</p>
                  )}
                </div>
              </div>

              {/* Order Items & Amounts */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[#111111]">Purchased Items</h4>
                <div className="divide-y divide-neutral-200 max-h-44 overflow-y-auto pr-1">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="py-2 flex justify-between">
                      <div>
                        <span className="font-semibold text-[#111111] block">{item.product_name}</span>
                        {item.variant_name && <span className="text-[11px] text-neutral-500 block">{item.variant_name}</span>}
                        <span className="text-neutral-400">Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}</span>
                      </div>
                      <span className="font-bold tabular-nums">${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-neutral-200 space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping:</span><span>${selectedOrder.shipping_fee.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-sm text-[#111111] pt-1 border-t border-neutral-200">
                    <span>Total Amount:</span>
                    <span>${selectedOrder.total_amount.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Management Form: Statuses, Tracking & Notes */}
            <form onSubmit={handleUpdateOrder} className="space-y-4 pt-4 border-t border-[#E5E7EB]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={orderStatus}
                    onChange={e => setOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
                  >
                    <option value="new">New</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
                  >
                    <option value="awaiting_verification">Awaiting Verification</option>
                    <option value="paid">Paid (Verified)</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Carrier & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    placeholder="USPS, UPS, FedEx"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 9400 1000 0000 0000 0000 00"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono"
                  />
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Add Internal Note
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  placeholder="Record customer communication, WhatsApp confirmation, or fulfillment details..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                />
                {selectedOrder.internal_notes && (
                  <div className="mt-2 p-2.5 bg-neutral-100 rounded text-[11px] text-neutral-700 font-mono whitespace-pre-wrap">
                    {selectedOrder.internal_notes}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-semibold rounded text-neutral-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded shadow-sm hover:bg-[#222222]"
                >
                  Save Order Updates
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
