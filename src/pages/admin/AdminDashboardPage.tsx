import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Product, Order, CustomerInquiry } from '../../types';
import { storeService } from '../../services/storeService';

interface AdminDashboardPageProps {
  onNavigateAdmin: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateAdmin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [p, o, i] = await Promise.all([
        storeService.getProducts(),
        storeService.getOrders(),
        storeService.getInquiries(),
      ]);
      setProducts(p);
      setOrders(o);
      setInquiries(i);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400 font-bold uppercase tracking-wider">
        Loading Store Analytics...
      </div>
    );
  }

  // Calculate Real Statistics
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.order_status === 'new' || o.order_status === 'processing').length;
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
  const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const lowStockProducts = products.filter(p => p.stock_quantity <= 5);
  const newInquiries = inquiries.filter(i => i.status === 'new');
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
            Executive Summary
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAdmin('/admin/products/new')}
            className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (60-30-10 color discipline, tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-[#F5F5F5] rounded-lg text-[#D4AF62]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#111111] tabular-nums tracking-tight">
              ${totalSales.toFixed(2)}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">USD Revenue</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-[#F5F5F5] rounded-lg text-[#111111]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#111111] tabular-nums tracking-tight">
              {totalOrders}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Customer Orders</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-800 tabular-nums tracking-tight">
              {pendingOrders}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Awaiting Fulfillment</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <div className="p-2 bg-[#F5F5F5] rounded-lg text-[#111111]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-[#111111] tabular-nums tracking-tight">
              {totalProducts}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Published Products</span>
          </div>
        </div>

        {/* New Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">New Inquiries</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-800 tabular-nums tracking-tight">
              {newInquiries.length}
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Unread Messages</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                Recent Orders
              </h2>
              <span className="text-xs text-neutral-500">Latest customer orders from store &amp; WhatsApp</span>
            </div>
            <button
              onClick={() => onNavigateAdmin('/admin/orders')}
              className="text-xs font-bold text-[#D4AF62] hover:text-[#111111] transition-colors inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No orders received yet. Once customers checkout, orders will appear here.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-neutral-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5]">
                  {recentOrders.map(order => (
                    <tr 
                      key={order.id} 
                      onClick={() => onNavigateAdmin('/admin/orders')}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                        {order.order_reference}
                      </td>
                      <td className="py-3 px-4 text-neutral-700">
                        {order.customer.full_name}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#111111] tabular-nums">
                        ${order.total_amount.toFixed(2)} USD
                      </td>
                      <td className="py-3 px-4 uppercase text-[11px] font-semibold text-neutral-600">
                        {order.payment_method}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.order_status === 'shipped' || order.order_status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-50 text-red-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Alerts & Inventory Column */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#111111]">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Inventory Watch</h3>
              </div>
              <span className="text-[11px] text-neutral-400">{lowStockProducts.length} items</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-2">
                All catalog items have healthy stock levels.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700 font-medium truncate max-w-[170px]">
                      {prod.name}
                    </span>
                    <span className={`font-bold tabular-nums px-2 py-0.5 rounded text-[10px] ${
                      prod.stock_quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prod.stock_quantity === 0 ? 'Out of stock' : `${prod.stock_quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-2">
              Management Shortcuts
            </h3>
            
            <button
              onClick={() => onNavigateAdmin('/admin/content')}
              className="w-full text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#D4AF62] text-xs font-semibold text-neutral-700 hover:text-[#111111] transition-colors flex items-center justify-between"
            >
              <span>Edit Homepage Hero &amp; Banner</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={() => onNavigateAdmin('/admin/settings')}
              className="w-full text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#D4AF62] text-xs font-semibold text-neutral-700 hover:text-[#111111] transition-colors flex items-center justify-between"
            >
              <span>Payment Details &amp; WhatsApp Settings</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={() => onNavigateAdmin('/admin/inquiries')}
              className="w-full text-left p-2.5 rounded-lg border border-neutral-200 hover:border-[#D4AF62] text-xs font-semibold text-neutral-700 hover:text-[#111111] transition-colors flex items-center justify-between"
            >
              <span>Customer Inquiries ({newInquiries.length} New)</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
