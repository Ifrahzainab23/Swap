import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../Components/Title'; // Ensure the `Title` component is correctly imported
import CartTotalSimple from '../Components/CartTotalSimple'; // Use simple version without credits
import { assets } from '../assets/assets.js';


const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  

  useEffect(() => {
    if (products.length > 0) {

    }
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems, products]);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1="YOUR" text2="CART" />
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);

          if (!productData) return null; // Handle case where product data is missing

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-4"
            >
              <div className="flex items-start gap-6">
                <img
                  className="w-16 sm:w-20"
                  src={productData.image[0]} // Ensure `image` exists and is an array
                  alt={productData.name}
                />
                <div>
                  <p className="text-xs sm:text-lg font-medium">
                    {productData.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {currency}
                      {productData.price}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  onChange={(e) =>
                    e.target.value === '' || e.target.value === '0'
                      ? null
                      : updateQuantity(item._id, item.size, Number(e.target.value))
                  }
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                  type="number"
                  min={1}
                  max={10} // Adjust max value as needed
                  defaultValue={item.quantity}
                />
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  src={assets.bin_icon} // Ensure `assets.bin_icon` is correctly defined
                  alt="Delete"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotalSimple />
          <div className="w-full text-end">
            <button
              onClick={() => {
                if (cartData.length === 0) return;
                navigate("/place-order");
              }}
              disabled={cartData.length === 0}
              className={`text-sm my-8 px-8 py-3 ${cartData.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white"
                }`}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
