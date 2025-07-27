import React, { useState } from 'react';
import Title from '../Components/Title';  
import { assets } from '../assets/assets';
import NewsletterBox from '../Components/NewsLetterBox.jsx';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // You can replace this with an API call to store the message
    console.log('Form submitted:', formData);
    setSubmitted(true);

    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div>
      {/* Title */}
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      {/* Store Info */}
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-20'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="Contact" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className='text-gray-500'>54709 Willms Station <br /> Suite 350, Lahore, Pakistan</p>
          <p className='text-gray-500'>Tel: (415) 555-0132 <br /> Email: admin@Swap.com</p>
          <p className='font-semibold text-xl text-gray-600'>Careers at Swap</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>
            Explore Jobs
          </button>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white-50 p-6 rounded-md shadow-md">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
          ></textarea>
          <button
            type="submit"
            className="bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all"
          >
            Send Message
          </button>
          {submitted && (
            <p className="text-green-600 text-sm">Thank you! Your message has been sent.</p>
          )}
        </form>
      </div>

      {/* Newsletter */}
      <NewsletterBox />
    </div>
  );
};

export default Contact;
