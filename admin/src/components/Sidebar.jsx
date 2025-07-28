import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdAddBox, MdList, MdShoppingCart, MdDashboard, MdSyncAlt } from 'react-icons/md';



const Sidebar = () => {
  const menuItems = [
    { to: '/dashboard', icon: <MdDashboard size={22} />, label: 'Dashboard' },
    { to: '/add', icon: <MdAddBox size={22} />, label: 'Add Item' },
    { to: '/list', icon: <MdList size={22} />, label: 'List Item' },
    { to: '/order', icon: <MdShoppingCart size={22} />, label: 'Orders' },
     { to: '/exchange', icon: <MdSyncAlt size={22} />, label: 'Exchange' },
  ];

  return (
    <div className="w-[18%] h-[10%] bg-white border-r shadow-md py-8 px-4">
      <div className="flex flex-col gap-5">
     {menuItems.map((item, index) => (
  <NavLink
    key={index}
    to={item.to}
    className={({ isActive }) =>
      `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 font-medium text-gray-700 
      ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-sm'
          : 'hover:bg-gray-100 hover:text-blue-600'
      }`
    }
  >
    {item.icon}
    <span className="hidden md:inline text-[15px]">{item.label}</span>
  </NavLink>
))}
      </div>
    </div>
  );
};

export default Sidebar;
