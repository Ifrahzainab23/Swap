import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { currency, backendUrl } from '../App';

const List = () => {
  const [list, setList] = useState([]);
  const token = localStorage.getItem('token');

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch product list');
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove product');
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">All Products</h2>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[60px_2fr_1fr_1fr_80px] bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-t-md border">
        <span>Image</span>
        <span>Name</span>
        <span>Category</span>
        <span>Price</span>
        <span className="text-center">Action</span>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-2">
        {list.map((item, index) => (
          <div
            key={item._id || index}
            className="grid grid-cols-[60px_2fr] md:grid-cols-[60px_2fr_1fr_1fr_80px] items-center gap-3 px-4 py-3 bg-white border rounded-md shadow-sm text-sm"
          >
            <img
              src={item.image?.[0] || '/default.png'}
              alt={item.name}
              className="w-12 h-12 object-cover rounded-md border"
            />
            <p className="text-gray-800">{item.name}</p>
            <p className="hidden md:block text-gray-600">{item.category}</p>
            <p className="hidden md:block font-medium text-green-700">
              {item.price} {currency.toUpperCase()}
            </p>
            <button
              onClick={() => removeProduct(item._id)}
              className="text-red-600 font-bold text-lg hover:scale-110 transition transform duration-150"
              title="Delete Product"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
