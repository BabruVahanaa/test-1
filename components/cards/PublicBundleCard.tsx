import React from 'react';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';
import { Bundle } from '../../contexts/EventContext';
import { Package, ArrowRight } from 'lucide-react';

interface PublicBundleCardProps {
    bundle: Bundle;
    onPurchase: (bundle: Bundle) => void;
}

const PublicBundleCard: React.FC<PublicBundleCardProps> = ({ bundle, onPurchase }) => {
    const { currency } = useSettings();

    return (
        <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
            <div className="p-5 flex-grow">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-lg text-protribe-gray-extradark dark:text-white">{bundle.title}</h3>
                    <span className="text-2xl font-bold text-protribe-teal flex-shrink-0">{currencySymbols[currency]}{bundle.price}</span>
                </div>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-2 h-10 line-clamp-2">{bundle.description}</p>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600">
                <button onClick={() => onPurchase(bundle)} className="w-full text-center px-4 py-2 text-sm font-semibold text-protribe-teal hover:text-protribe-green-dark transition-colors flex items-center justify-center gap-2 group">
                    View Details <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default PublicBundleCard;
