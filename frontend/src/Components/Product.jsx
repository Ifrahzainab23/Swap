import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../Components/RelatedProducts';
import '../assets/styles.css';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'reviews'

  const fetchProductData = async () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
      setQuantity(product.quantity || 10);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.feedback);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [productId, products]);

  const handleAddToCart = () => {
    if (!size) {
      toast.info('Please select a size');
      return;
    }
    if (quantity > 0) {
      addToCart(productData._id, size);
      setQuantity(quantity - 1);
    } else {
      toast.warn('Out of stock!');
    }
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in-duration-500 opacity-100'>
      {/* Product Display */}
      <div className='flex gap-12 sm:gap-12 sm:flex-row'>
        {/* Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex w-[19%] sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal'>
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt=''
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="Product" />
          </div>
        </div>

        {/* Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            {Array(4).fill().map((_, i) => (
              <img key={i} src={assets.star_icon} alt="Star" className="w-3.5" />
            ))}
            <img src={assets.star_dull_icon} alt="Star" className="w-3.5" />
            <p className='pl-2'>({reviews.length || 122})</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Size Selection */}
          <div className='flex flex-col gap-4 my-8'>
            <div className='flex justify-between items-center'>
              <p>Select Size</p>
              <button
                onClick={() => setShowSizeChart(true)}
                className="text-blue-500 text-sm underline"
              >
                View Size Chart
              </button>
            </div>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
            <p>Available Quantity: {quantity}</p>
          </div>

          <button
            onClick={handleAddToCart}
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'
          >
            ADD TO CART
          </button>

          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available.</p>
            <p>Easy return and exchange policy.</p>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white rounded-lg p-6 w-96'>
            <h2 className='text-lg font-medium mb-4'>Size Chart</h2>
            <table className='w-full text-sm text-left border-collapse'>
              <thead>
                <tr>
                  <th className='border px-4 py-2'>Size</th>
                  <th className='border px-4 py-2'>Chest (in)</th>
                  <th className='border px-4 py-2'>Waist (in)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: 'S', chest: '34-36', waist: '28-30' },
                  { size: 'M', chest: '38-40', waist: '32-34' },
                  { size: 'L', chest: '42-44', waist: '36-38' },
                  { size: 'XL', chest: '46-48', waist: '40-42' }
                ].map((row, index) => (
                  <tr key={index}>
                    <td className='border px-4 py-2'>{row.size}</td>
                    <td className='border px-4 py-2'>{row.chest}</td>
                    <td className='border px-4 py-2'>{row.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeChart(false)}
              className='bg-red-500 text-white px-4 py-2 mt-4 rounded-md'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Description & Reviews Tabs */}
      <div className='mt-20'>
        <div className='flex border-b'>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-3 text-sm font-medium ${
              activeTab === 'description' ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 text-sm font-medium ${
              activeTab === 'reviews' ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          {activeTab === 'description' && (
            <>
              <p>{productData.description}</p>
              <p>
                Our Swap Exchange System, a unique platform where you can trade items directly with other users!
                Whether you’re looking to refresh your wardrobe, update your gadgets, or discover new treasures, our
                system makes it easy and convenient.
              </p>
              <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
            </>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">User Feedback</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-400">No reviews yet for this product.</p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((review, index) => (
                    <li key={index} className="border p-4 rounded-md bg-gray-50">
                      <p className="text-gray-700 italic">"{review.feedback}"</p>
                      <p className="text-xs text-gray-500 text-right">– {review.userName || 'Anonymous'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className='opacity-0'>Loading...</div>
  );
};

export default Product;
