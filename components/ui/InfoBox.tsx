
import React from 'react';
import { Info } from 'lucide-react';

interface InfoBoxProps {
    title: string;
    children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, children }) => {
    return (
        <div className="bg-protribe-green-light dark:bg-protribe-green-dark/20 p-4 rounded-lg flex items-start space-x-4 mb-8">
            <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-white dark:bg-protribe-gray-700 rounded-full mt-1">
                <Info size={16} className="text-protribe-teal" />
            </div>
            <div>
                <h3 className="font-semibold text-protribe-gray-extradark dark:text-white">{title}</h3>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1">{children}</p>
            </div>
        </div>
    );
};

export default InfoBox;