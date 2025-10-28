import React from 'react';
import { X } from 'lucide-react';
import { Bundle, Membership } from '../../contexts/EventContext';
import { useCustomer } from '../../contexts/CustomerContext';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Bundle | Membership | null;
}

const isMembership = (i: any): i is Membership => i && 'billingInterval' in i;

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, item }) => {
    const { currency } = useSettings();
    const { currentCustomer } = useCustomer();

    if (!isOpen || !item) return null;

    const handlePurchase = () => {
        if (!currentCustomer) {
            // In a real app, you would prompt login
            alert("Please log in to purchase.");
            return;
        }
        // Fake purchase logic
        alert(`Thank you for purchasing ${item.title}!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-protribe-gray-700 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center p-4 border-b dark:border-protribe-gray-600">
                    <h2 className="font-bold text-protribe-gray-extradark dark:text-white">Confirm Purchase</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-protribe-gray-extradark dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.description}</p>
                    <div className="mt-4 text-3xl font-bold text-protribe-gray-extradark dark:text-white">
                        {currencySymbols[currency]}{item.price}
                        {isMembership(item) && <span className="text-base font-normal text-gray-500"> / {item.billingInterval === 'monthly' ? 'month' : 'year'}</span>}
                    </div>
                </div>
                 <div className="p-6 bg-gray-50 dark:bg-protribe-gray-800 border-t dark:border-protribe-gray-600 flex justify-end">
                    <button onClick={handlePurchase} className="px-6 py-2 bg-protribe-teal text-white font-semibold rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600" disabled={!currentCustomer}>
                        {currentCustomer ? 'Confirm and Pay' : 'Log in to Purchase'}
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default PurchaseModal;
