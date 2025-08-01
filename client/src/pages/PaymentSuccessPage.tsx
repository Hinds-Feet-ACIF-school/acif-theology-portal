// src/pages/PaymentSuccessPage.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const accentColor = "#C5A467";
  const primaryTextLight = "text-[#2A0F0F]";
  const primaryTextDark = "dark:text-[#FFF8F0]";
  const secondaryTextLight = "text-[#4A1F1F]";
  const secondaryTextDark = "dark:text-[#E0D6C3]/90";

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4 ${primaryTextLight} ${primaryTextDark}`}>
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-[#C5A467]/20 dark:border-[#C5A467]/30">
        
        {/* Success Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-16 w-16 text-green-500 mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <h1 className={`text-2xl font-semibold font-serif mb-2`}>Payment Successful!</h1>
        
        <p className={`mt-4 text-md ${secondaryTextLight} ${secondaryTextDark}`}>
          Thank you for your payment. Your registration is being processed, and your account will be created shortly.
        </p>

        <div className="mt-8">
          <Button onClick={() => navigate('/login')} className={`bg-[${accentColor}] hover:bg-[#B08F55] text-[#2A0F0F]`}>
            Proceed to Login
          </Button>
          <Link to="/" className={`block mt-4 text-sm text-[${accentColor}] hover:underline`}>
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;