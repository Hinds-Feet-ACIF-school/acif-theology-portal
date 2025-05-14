import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

interface StatusResponse {
  status: 'success' | 'pending' | 'failed' | 'error' | 'not_found';
  message: string;
  user?: { uid: string; email: string; cohortId?: string };
  detail_status?: string;
}

type RegistrationOutcomeType = StatusResponse['status'] | 'idle';

const RegistrationStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [registrationOutcome, setRegistrationOutcome] = useState<RegistrationOutcomeType>('idle');
  const [displayMessage, setDisplayMessage] = useState<string>('Thank you for your payment. Click below to check your registration status.');
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [hasInitiatedCheck, setHasInitiatedCheck] = useState<boolean>(false);
  const tx_ref = searchParams.get('tx_ref');
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const maxPollingAttempts = 12;
  const pollingIntervalTime = 500;

  const performStatusCheck = useCallback(async () => {
    if (!tx_ref) {
      setDisplayMessage('Invalid registration attempt. No transaction reference found.');
      setRegistrationOutcome('error');
      setIsCheckingStatus(false);
      return;
    }

    setIsCheckingStatus(true);

    try {
      const response = await apiClient.get<StatusResponse>(`/payments/registration-status?tx_ref=${tx_ref}`);
      const data = response.data;

      setDisplayMessage(data.message);
      setRegistrationOutcome(data.status); // data.status is of type StatusResponse['status']
      setPollingAttempts(prev => prev + 1);

      if (data.status !== 'pending') {
        setIsCheckingStatus(false);
      }
    } catch (error) {
      setDisplayMessage('Could not verify registration status. Please contact support.');
      setRegistrationOutcome('error');
      setIsCheckingStatus(false);
    }
  }, [tx_ref, pollingAttempts]); // pollingAttempts added to re-create callback if it changes

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (hasInitiatedCheck && registrationOutcome === 'pending' && pollingAttempts < maxPollingAttempts) {
      if (pollingAttempts === 0) {
         setDisplayMessage('Your registration is being processed. Payment confirmation pending...');
      }
      intervalId = setInterval(() => {
        performStatusCheck();
      }, pollingIntervalTime);
    } else if (hasInitiatedCheck && pollingAttempts >= maxPollingAttempts && registrationOutcome === 'pending') {
        setDisplayMessage('Verification is taking longer than expected. Please check your email or contact support if you do not receive a confirmation shortly.');
        setRegistrationOutcome('error');
        setIsCheckingStatus(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hasInitiatedCheck, registrationOutcome, pollingAttempts, performStatusCheck]);

  const handleCheckStatusClick = () => {
    setPollingAttempts(0);
    setHasInitiatedCheck(true);
    setDisplayMessage('Checking your registration status, please wait...');
    performStatusCheck();
  };

  useEffect(() => {
    if (!tx_ref) {
        setDisplayMessage('Invalid page access. No transaction reference found.');
        setRegistrationOutcome('error');
    }
  }, [tx_ref]);

  const accentColor = "#C5A467";
  const primaryTextLight = "text-[#2A0F0F]";
  const primaryTextDark = "dark:text-[#FFF8F0]";
  const secondaryTextLight = "text-[#4A1F1F]";
  const secondaryTextDark = "dark:text-[#E0D6C3]/90";

  const showInitialButton = registrationOutcome === 'idle' && !hasInitiatedCheck && !!tx_ref;
  const showProcessingLoader = hasInitiatedCheck && isCheckingStatus && registrationOutcome === 'pending';
  const showSuccessMessage = registrationOutcome === 'success';
  const showErrorMessage =
    registrationOutcome === 'failed' ||
    registrationOutcome === 'error' ||
    registrationOutcome === 'not_found' ||
    (!tx_ref && registrationOutcome !== 'idle'); // Show error if tx_ref is missing and not in initial idle state

  const showFinalActionButtons =
    (registrationOutcome === 'success' ||
     registrationOutcome === 'failed' ||
     registrationOutcome === 'error' ||
     registrationOutcome === 'not_found' ||
     (!tx_ref && registrationOutcome !== 'idle')
    ) && !isCheckingStatus;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen py-12 bg-[#FFF8F0] dark:bg-gray-950 px-4 ${primaryTextLight} ${primaryTextDark}`}>
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-900 shadow-xl rounded-lg border border-[#C5A467]/20 dark:border-[#C5A467]/30">

        {showInitialButton && (
          <>
            <h1 className={`text-2xl font-semibold font-serif mb-4`}>Payment Submitted</h1>
            <p className={`mt-4 text-md ${secondaryTextLight} ${secondaryTextDark} mb-6`}>
              {displayMessage}
            </p>
            <Button
              onClick={handleCheckStatusClick}
              className={`bg-[${accentColor}] hover:bg-[#B08F55] text-[#2A0F0F]`}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <span className="flex items-center">
                  <Loader2 className={`animate-spin -ml-1 mr-2 h-4 w-4`} />
                  Checking...
                </span>
              ) : (
                "Check My Registration Status"
              )}
            </Button>
          </>
        )}

        {showProcessingLoader && (
          <>
            <Loader2 className={`mx-auto h-12 w-12 animate-spin text-[${accentColor}] mb-6`} />
            <h1 className={`text-2xl font-semibold font-serif mb-2`}>Processing Registration</h1>
          </>
        )}

        {showSuccessMessage && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-16 w-16 text-green-500 mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className={`text-2xl font-semibold font-serif mb-2`}>Registration Successful!</h1>
          </>
        )}

        {showErrorMessage && (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" className={`mx-auto h-16 w-16 text-red-500 mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className={`text-2xl font-semibold font-serif mb-2`}>
                { !tx_ref ? "Invalid Access" : "Registration Issue" }
            </h1>
           </>
        )}

        { (registrationOutcome !== 'idle' || !tx_ref) && (
            <p className={`mt-4 text-md ${secondaryTextLight} ${secondaryTextDark}`}>
            {displayMessage}
            </p>
        )}

        { showFinalActionButtons && (
          <div className="mt-8">
            {registrationOutcome === 'success' ? (
              <Button onClick={() => navigate('/login')} className={`bg-[${accentColor}] hover:bg-[#B08F55] text-[#2A0F0F]`}>
                Proceed to Login
              </Button>
            ) : (
              <Button onClick={() => navigate('/register')} variant="outline" className={`border-[#4A1F1F]/50 dark:border-[#E0D6C3]/50 hover:text-[${accentColor}] hover:border-[${accentColor}]`}>
                Try Registration Again
              </Button>
            )}
             <Link to="/" className={`block mt-4 text-sm text-[${accentColor}] hover:underline`}>
                Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationStatusPage;