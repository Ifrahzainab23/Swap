import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const form1 = new FormData();
      form1.append("name", name);
      form1.append("description", description);
      form1.append("price", price);
      form1.append("category", category);
      form1.append("subCategory", subCategory);
      form1.append("bestseller", bestseller);
      form1.append("sizes", JSON.stringify(sizes));
      if (image1) form1.append("image1", image1);
      if (image2) form1.append("image2", image2);
      if (image3) form1.append("image3", image3);
      if (image4) form1.append("image4", image4);

      const response = await axios.post(`${backendUrl}/api/product/add`, form1, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(null);
        setImage2(null);
        setImage3(null);
        setImage4(null);
        setPrice("");
        setSizes([]);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleSizeClick = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  return (
    <form onSubmit={onSubmitHandler} className="max-w-3xl w-full p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>

      {/* Image Uploads */}
      <div>
        <p className="font-medium mb-2">Upload Images</p>
        <div className="flex gap-3 flex-wrap">
          {[image1, image2, image3, image4].map((img, i) => (
            <label key={i} htmlFor={`image${i + 1}`} className="cursor-pointer">
              <img
                className="w-24 h-24 border rounded-md object-cover"
                src={img ? URL.createObjectURL(img) : assets.upload_area}
                alt={`Upload image ${i + 1}`}
              />
              <input
                type="file"
                id={`image${i + 1}`}
                hidden
                onChange={(e) =>
                  [setImage1, setImage2, setImage3, setImage4][i](e.target.files[0])
                }
              />
            </label>
          ))}
        </div>
      </div>

      {/* Product Name */}
      <div>
        <p className="mb-2 font-medium">Product Name</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Type here"
          className="w-full max-w-md px-4 py-2 border rounded-md"
        />
      </div>

      {/* Description */}
      <div>
        <p className="mb-2 font-medium">Product Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Write content here"
          className="w-full max-w-md px-4 py-2 border rounded-md resize-none"
          rows={4}
        />
      </div>

      {/* Categories, Subcategories, Price */}
      <div className="flex flex-col md:flex-row gap-4">
        <div>
          <p className="mb-2 font-medium">Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div>
          <p className="mb-2 font-medium">Subcategory</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">2_piece</option>
          </select>
        </div>
        <div>
          <p className="mb-2 font-medium">Price</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 25"
            className="px-4 py-2 border rounded-md w-32"
          />
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <p className="mb-2 font-medium">Available Sizes</p>
        <div className="flex gap-3 flex-wrap">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() => handleSizeClick(size)}
              className={`px-4 py-1 rounded-md cursor-pointer transition ${
                sizes.includes(size)
                  ? "bg-pink-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {size}
            </div>
          ))}
        </div>
      </div>

      {/* Bestseller Checkbox */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller((prev) => !prev)}
          id="bestseller"
        />
        <label htmlFor="bestseller" className="text-gray-800">
          Add to bestseller
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-black text-white px-6 py-3 mt-4 rounded-md font-semibold hover:bg-gray-800 transition"
      >
        Add Product
      </button>
    </form>
  );
};

export default Add;
