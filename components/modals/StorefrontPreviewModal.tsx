import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import PublicStorefrontPage from '../../pages/PublicStorefrontPage';

interface StorefrontPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StorefrontPreviewModal: React.FC<StorefrontPreviewModalProps> = ({ isOpen, onClose }) => {
    const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    if (!isOpen) return null;

    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px',
    };

    return (
        <div className="fixed inset-0 bg-protribe-gray-900 bg-opacity-80 z-50 flex flex-col items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="w-full max-w-7xl flex-1 flex flex-col min-h-0" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className="flex-shrink-0 h-16 bg-white dark:bg-protribe-gray-700 rounded-t-lg flex items-center justify-between px-4 shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-4 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Storefront Preview</span>
                    </div>
                    
                    {/* Device Toggles */}
                    <div className="flex items-center gap-1 p-1 bg-protribe-gray-light dark:bg-protribe-gray-800 rounded-md">
                        <button title="Desktop preview" onClick={() => setDevice('desktop')} className={`p-1.5 rounded ${device === 'desktop' ? 'bg-white dark:bg-protribe-gray-600 shadow-sm' : 'hover:bg-protribe-gray-extralight dark:hover:bg-protribe-gray-900'}`}>
                            <Monitor size={18} />
                        </button>
                        <button title="Tablet preview" onClick={() => setDevice('tablet')} className={`p-1.5 rounded ${device === 'tablet' ? 'bg-white dark:bg-protribe-gray-600 shadow-sm' : 'hover:bg-protribe-gray-extralight dark:hover:bg-protribe-gray-900'}`}>
                            <Tablet size={18} />
                        </button>
                        <button title="Mobile preview" onClick={() => setDevice('mobile')} className={`p-1.5 rounded ${device === 'mobile' ? 'bg-white dark:bg-protribe-gray-600 shadow-sm' : 'hover:bg-protribe-gray-extralight dark:hover:bg-protribe-gray-900'}`}>
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-protribe-gray-light dark:hover:bg-protribe-gray-600">
                        <X size={24} />
                    </button>
                </header>
                
                {/* Scrollable Content Wrapper */}
                <div className="flex-1 bg-protribe-gray-light dark:bg-protribe-gray-800 flex justify-center overflow-y-auto rounded-b-lg p-4 min-h-0">
                    <div
                        style={{ width: deviceWidths[device] }}
                        className="w-full bg-white dark:bg-protribe-gray-900 rounded-md shadow-lg border border-gray-300 dark:border-protribe-gray-600 transition-all duration-300 ease-in-out"
                    >
                        <PublicStorefrontPage isPreview={true} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorefrontPreviewModal;