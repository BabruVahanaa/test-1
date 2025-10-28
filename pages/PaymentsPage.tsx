import React from 'react';
import InfoBox from '../components/ui/InfoBox';
import { useSettings } from '../contexts/SettingsContext';

const PaymentsPage: React.FC = () => {
    const { isStripeConnected, setIsStripeConnected } = useSettings();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-protribe-gray-extradark dark:text-white mb-4">Payments</h1>
            <InfoBox title="Connect to Stripe to Accept Payments">
                To start accepting online payments for your services, you'll need to connect a Stripe account. Stripe is a secure and easy way to process credit card payments from your clients.
            </InfoBox>
            <div className={`bg-white dark:bg-protribe-gray-700 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-protribe-gray-600 text-center transition-colors ${isStripeConnected ? 'border-green-500' : ''}`}>
                <h2 className="text-xl font-semibold text-protribe-gray-extradark dark:text-white">
                    {isStripeConnected ? 'Stripe is Connected' : 'Stripe is not connected'}
                </h2>
                <p className="text-protribe-gray-dark dark:text-protribe-gray-light mt-2 mb-6">
                    {isStripeConnected 
                        ? 'You can now accept credit card payments on your storefront.'
                        : 'Connect your Stripe account to enable credit card payments on your storefront.'
                    }
                </p>
                <button 
                    onClick={() => setIsStripeConnected(!isStripeConnected)}
                    className={`px-6 py-3 font-semibold text-white rounded-md hover:opacity-90 transition-opacity ${
                        isStripeConnected ? 'bg-red-600' : 'bg-blue-600'
                    }`}
                >
                    {isStripeConnected ? 'Disconnect Stripe' : 'Connect with Stripe'}
                </button>
            </div>
        </div>
    );
};

export default PaymentsPage;