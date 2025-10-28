import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export const currencySymbols: { [key in Currency]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
};

export const timeZones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
];

// Dynamically determine defaults based on browser settings
const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getCurrencyFromLocale = (): Currency => {
    try {
        const locale = navigator.language;
        if (locale.startsWith('en-GB')) return 'GBP';
        if (locale.startsWith('ja')) return 'JPY';
        if (['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'ie', 'at', 'be', 'cy', 'ee', 'gr', 'lv', 'lt', 'lu', 'mt', 'sk', 'si'].some(prefix => locale.startsWith(prefix))) return 'EUR';
        return 'USD'; // Default for en-US and others
    } catch (e) {
        return 'USD';
    }
};
const detectedCurrency = getCurrencyFromLocale();


interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    timeZone: string;
    setTimeZone: (tz: string) => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    isStripeConnected: boolean;
    setIsStripeConnected: (connected: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings = {
    theme: 'light' as Theme,
    timeZone: timeZones.includes(detectedTimeZone) ? detectedTimeZone : 'America/New_York',
    currency: detectedCurrency,
    isStripeConnected: false,
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('theme') as Theme;
            return savedTheme && ['light', 'dark'].includes(savedTheme) ? savedTheme : defaultSettings.theme;
        } catch {
            return defaultSettings.theme;
        }
    });
    const [timeZone, setTimeZone] = useState<string>(() => {
        try {
            const savedTimeZone = localStorage.getItem('timeZone');
            return savedTimeZone && timeZones.includes(savedTimeZone) ? savedTimeZone : defaultSettings.timeZone;
        } catch {
            return defaultSettings.timeZone;
        }
    });
    const [currency, setCurrency] = useState<Currency>(() => {
         try {
            const savedCurrency = localStorage.getItem('currency') as Currency;
            return savedCurrency && currencySymbols[savedCurrency] ? savedCurrency : defaultSettings.currency;
        } catch {
            return defaultSettings.currency;
        }
    });
    const [isStripeConnected, setIsStripeConnectedState] = useState<boolean>(() => {
        try {
            const savedStatus = localStorage.getItem('isStripeConnected');
            return savedStatus ? JSON.parse(savedStatus) : defaultSettings.isStripeConnected;
        } catch {
            return defaultSettings.isStripeConnected;
        }
    });


    useEffect(() => {
        try {
            localStorage.setItem('theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
        } catch (error) {
            console.error("Failed to save theme to localStorage", error);
        }
    }, [theme]);

    useEffect(() => {
        try {
            localStorage.setItem('timeZone', timeZone);
        } catch (error) {
            console.error("Failed to save timeZone to localStorage", error);
        }
    }, [timeZone]);

    useEffect(() => {
        try {
            localStorage.setItem('currency', currency);
        } catch (error) {
            console.error("Failed to save currency to localStorage", error);
        }
    }, [currency]);
    
     useEffect(() => {
        try {
            localStorage.setItem('isStripeConnected', JSON.stringify(isStripeConnected));
        } catch (error) {
            console.error("Failed to save Stripe status to localStorage", error);
        }
    }, [isStripeConnected]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };
    
    const setIsStripeConnected = (connected: boolean) => {
        setIsStripeConnectedState(connected);
    }

    const value = { theme, setTheme, timeZone, setTimeZone, currency, setCurrency, isStripeConnected, setIsStripeConnected };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
