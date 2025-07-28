import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token },
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/order/status`, {
        orderId,
        status: event.target.value,
      }, { headers: { token } });

      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error("Failed to update order status.");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Orders Overview</h2>

      {orders.map((order, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[60px_2fr_1fr] lg:grid-cols-[60px_2fr_1fr_1fr_1fr] gap-4 border bg-white shadow-sm rounded-lg p-5 mb-6 text-sm text-gray-800"
        >
          {/* Icon */}
          <img src={assets.parcel_icon} alt="Parcel" className="w-10 h-10 object-contain" />

          {/* Address & Items */}
          <div>
            <div className="mb-2">
              {order.items.map((item, idx) => (
                <p key={idx} className="text-gray-700">
                  {item.name} × {item.quantity} <span className="text-gray-500">({item.size})</span>
                  {idx < order.items.length - 1 ? ', ' : ''}
                </p>
              ))}
            </div>
            <p className="font-medium">{order.address.firstname} {order.address.lastname}</p>
            <p className="text-gray-600">{order.address.street}, {order.address.city}</p>
            <p className="text-gray-600">{order.address.state}, {order.address.country}, {order.address.zipcode}</p>
            <p className="text-gray-600">📞 {order.address.phone}</p>
          </div>

          {/* Order Details */}
          <div>
            <p className="mb-1"><strong>Items:</strong> {order.items.length}</p>
            <p className="mb-1"><strong>Method:</strong> {order.paymentMethod}</p>
            <p className="mb-1">
              <strong>Payment:</strong>
              <span className={`ml-1 font-semibold ${order.payment ? 'text-green-600' : 'text-red-600'}`}>
                {order.payment ? 'Done' : 'Pending'}
              </span>
            </p>
            <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
          </div>

          {/* Amount */}
          <div className="text-lg font-semibold text-blue-600">
            {currency.toUpperCase()} {order.amount}
          </div>

          {/* Status Select */}
          <div>
            <select
              value={order.status}
              onChange={(e) => statusHandler(e, order._id)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-white focus:outline-none"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Order;
