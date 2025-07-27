import React from 'react'
import Hero from '../Components/Hero'
import LatestCollection from '../Components/LatestCollection'
import BestSeller from '../Components/BestSeller'
import OurPolicy from '../Components/OurPolicy'
import NewsletterBox from '../Components/NewsLetterBox.jsx'
import Chatbot from '../Components/Chatbot.jsx'
import Footer from '../Components/Footer.jsx'

const Home = () => {
  return (
    <div>
      <Hero/>
  <LatestCollection/>
  <BestSeller/>
  <OurPolicy />
  <NewsletterBox />
  <Chatbot />
 
    </div>
  )
}

export default Home
