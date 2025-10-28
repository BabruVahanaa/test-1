import React from 'react';
import { useSettings, timeZones, currencySymbols } from '../contexts/SettingsContext';
import type { Currency } from '../contexts/SettingsContext';
import { Sun, Moon, User, Mail, Lock } from 'lucide-react';

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm">
        <div className="p-6">
            <h3 className="text-lg font-semibold text-protribe-gray-extradark dark:text-white">{title}</h3>
            <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-1">{description}</p>
        </div>
        <div className="bg-protribe-gray-extralight dark:bg-protribe-gray-800 p-6 rounded-b-lg">
            {children}
        </div>
    </div>
);

const InputRow: React.FC<{ label: string; id: string; type: string; value: string; icon: React.ReactNode; disabled?: boolean }> = ({ label, id, type, value, icon, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">{label}</label>
        <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
            <input
                type={type}
                id={id}
                name={id}
                defaultValue={value}
                disabled={disabled}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm text-protribe-gray-extradark dark:text-white placeholder-protribe-gray focus:outline-none focus:ring-2 focus:ring-protribe-green-light focus:border-protribe-teal sm:text-sm disabled:bg-gray-100 dark:disabled:bg-protribe-gray-700"
            />
        </div>
    </div>
);


const AccountsPage: React.FC = () => {
    const { theme, setTheme, timeZone, setTimeZone, currency, setCurrency } = useSettings();

    const handleThemeChange = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <SettingsCard
                title="Personal Information"
                description="Update your personal details here."
            >
                <div className="space-y-4">
                    <InputRow label="Full Name" id="name" type="text" value="Demo User" icon={<User size={16} className="text-gray-400" />} />
                    <InputRow label="Email Address" id="email" type="email" value="demo@protribe.io" icon={<Mail size={16} className="text-gray-400" />} />
                     <div>
                        <label className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light">Password</label>
                        <div className="mt-1">
                            <button className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-protribe-gray-700">
                                <Lock size={16} />
                                <span>Change Password</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                     <button className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark shadow-sm">
                        Save Changes
                    </button>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Localization"
                description="Set your preferred time zone and currency."
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Time Zone</label>
                        <select
                            id="timezone"
                            name="timezone"
                            value={timeZone}
                            onChange={(e) => setTimeZone(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal focus:border-protribe-teal sm:text-sm"
                        >
                            {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-protribe-gray-dark dark:text-protribe-gray-light mb-1">Currency</label>
                         <select
                            id="currency"
                            name="currency"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            className="w-full px-3 py-2 bg-white dark:bg-protribe-gray-900 border border-gray-300 dark:border-protribe-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-protribe-teal focus:border-protribe-teal sm:text-sm"
                        >
                            {Object.entries(currencySymbols).map(([code, symbol]) => (
                                <option key={code} value={code}>{code} ({symbol})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                title="Appearance"
                description="Customize the look and feel of the application."
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-protribe-gray-extradark dark:text-white">Interface Theme</h4>
                        <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">Select or customize your interface theme.</p>
                    </div>
                    <button onClick={handleThemeChange} className="relative inline-flex items-center h-8 w-14 rounded-full bg-protribe-gray-light dark:bg-protribe-gray-900 transition-colors">
                        <span className="sr-only">Toggle theme</span>
                        <span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white dark:bg-protribe-gray-700 flex items-center justify-center transform transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`}>
                            {theme === 'light' ? <Sun className="h-4 w-4 text-yellow-500" /> : <Moon className="h-4 w-4 text-blue-400" />}
                        </span>
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
};

export default AccountsPage;
