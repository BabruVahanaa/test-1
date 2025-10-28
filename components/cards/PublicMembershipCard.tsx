import React from 'react';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';
import { Membership } from '../../contexts/EventContext';
import { CreditCard, ArrowRight } from 'lucide-react';

interface PublicMembershipCardProps {
    membership: Membership;
    onPurchase: (membership: Membership) => void;
}

const PublicMembershipCard: React.FC<PublicMembershipCardProps> = ({ membership, onPurchase }) => {
    const { currency } = useSettings();

    return (
        <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
            <div className="p-5 flex-grow">
                 <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-lg text-protribe-gray-extradark dark:text-white">{membership.title}</h3>
                    <div className="text-right flex-shrink-0">
                        <span className="text-2xl font-bold text-protribe-teal">{currencySymbols[currency]}{membership.price}</span>
                        <span className="text-sm text-protribe-gray dark:text-protribe-gray-light block">/ {membership.billingInterval === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                </div>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-2 h-10 line-clamp-2">{membership.description}</p>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600">
                <button onClick={() => onPurchase(membership)} className="w-full text-center px-4 py-2 text-sm font-semibold text-protribe-teal hover:text-protribe-green-dark transition-colors flex items-center justify-center gap-2 group">
                    View Details <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default PublicMembershipCard;
