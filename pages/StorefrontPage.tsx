import React, { useState } from 'react';
import { useStorefront } from '../contexts/StorefrontContext';
import { Link, Image as ImageIcon, Copy, Eye, EyeOff, Facebook, Twitter, Instagram } from 'lucide-react';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-protribe-gray-800">
            <h3 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between bg-protribe-gray-extralight dark:bg-protribe-gray-800 p-3 rounded-md">
        <span className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{label}</span>
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-protribe-teal' : 'bg-gray-300 dark:bg-protribe-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);


const StorefrontPage: React.FC = () => {
    const { settings, setSettings } = useStorefront();
    const [slug, setSlug] = useState(settings.slug);
    const [title, setTitle] = useState(settings.title);
    const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage);
    const [socialLinks, setSocialLinks] = useState(settings.socialLinks);
    const [copied, setCopied] = useState(false);

    const storefrontUrl = `${window.location.origin}${window.location.pathname}#/store/${settings.slug}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(storefrontUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        setSettings({
            ...settings,
            slug,
            title,
            welcomeMessage,
            socialLinks
        });
        // Here you would typically show a success toast
    };
    
    const handleVisibilityToggle = (section: keyof typeof settings.sections) => {
        setSettings({
            ...settings,
            sections: {
                ...settings.sections,
                [section]: !settings.sections[section]
            }
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div className="flex justify-end">
                <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                    Save Changes
                </button>
            </div>
            
            <SettingsCard title="Your Storefront Link">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Link size={16}/></span>
                         <input
                            type="text"
                            readOnly
                            value={storefrontUrl}
                            className="w-full pl-10 pr-4 py-2 bg-protribe-gray-light dark:bg-protribe-gray-800 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-sm"
                        />
                    </div>
                    <button onClick={handleCopy} className="px-4 py-2 text-sm font-medium text-white bg-protribe-gray-dark hover:bg-protribe-gray-extradark rounded-md shadow-sm whitespace-nowrap">
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
                 <div className="mt-4">
                    <label htmlFor="slug" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Customize your URL slug</label>
                    <div className="flex items-center">
                        <span className="inline-flex items-center px-3 h-10 border border-r-0 border-gray-300 dark:border-protribe-gray-600 bg-gray-50 dark:bg-protribe-gray-800 rounded-l-md text-sm text-gray-500 dark:text-protribe-gray-light">.../store/</span>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full h-10 px-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-r-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-protribe-teal/50" />
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="Branding">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Storefront Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal/50"/>
                    </div>
                    <div>
                        <label htmlFor="welcomeMessage" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Welcome Message / Bio</label>
                        <textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={4} className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal/50 resize-none"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Logo</label>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-protribe-gray-500 rounded-md hover:border-protribe-teal dark:hover:border-protribe-teal">
                                <ImageIcon size={16}/><span>Upload Logo</span>
                            </button>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Cover Image</label>
                            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-protribe-gray-500 rounded-md hover:border-protribe-teal dark:hover:border-protribe-teal">
                                <ImageIcon size={16}/><span>Upload Cover</span>
                            </button>
                        </div>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Content Visibility">
                 <div className="space-y-2">
                    <Toggle label="Show Services (Sessions, Classes, Appointments)" enabled={settings.sections.services} onToggle={() => handleVisibilityToggle('services')} />
                    <Toggle label="Show Bundles" enabled={settings.sections.bundles} onToggle={() => handleVisibilityToggle('bundles')} />
                    <Toggle label="Show Memberships" enabled={settings.sections.memberships} onToggle={() => handleVisibilityToggle('memberships')} />
                </div>
            </SettingsCard>

            <SettingsCard title="Social Links">
                <div className="space-y-4">
                     <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Instagram</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Instagram size={16}/></span>
                            <input type="url" id="instagram" placeholder="https://instagram.com/your-profile" value={socialLinks.instagram} onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal/50"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">X / Twitter</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Twitter size={16}/></span>
                            <input type="url" id="twitter" placeholder="https://x.com/your-profile" value={socialLinks.twitter} onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal/50"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Facebook</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Facebook size={16}/></span>
                            <input type="url" id="facebook" placeholder="https://facebook.com/your-page" value={socialLinks.facebook} onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})} className="w-full pl-10 pr-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal/50"/>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};

export default StorefrontPage;