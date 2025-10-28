import React from 'react';
import { useSettings, currencySymbols } from '../../contexts/SettingsContext';
import { Session, Class, AppointmentType } from '../../contexts/EventContext';
import { Calendar, Clock, Tag, Repeat, ArrowRight } from 'lucide-react';

interface PublicServiceCardProps {
    service: Session | Class | AppointmentType;
    onBook: (service: Session | Class | AppointmentType) => void;
}

const InfoPill: React.FC<{ icon: React.ElementType, text: string | number }> = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-1.5 text-xs text-protribe-gray-dark dark:text-protribe-gray-light">
        <Icon size={14} className="flex-shrink-0" />
        <span className="truncate">{text}</span>
    </div>
);

const PublicServiceCard: React.FC<PublicServiceCardProps> = ({ service, onBook }) => {
    const { currency } = useSettings();

    const isSession = (s: any): s is Session => 'date' in s;
    const isClass = (s: any): s is Class => 'schedule' in s;
    const isAppointment = (s: any): s is AppointmentType => 'customLink' in s;

    let details;
    if (isSession(service)) {
        details = (
            <>
                <InfoPill icon={Calendar} text={new Date(service.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} />
                <InfoPill icon={Clock} text={service.duration + ' min'} />
                <InfoPill icon={Tag} text={currencySymbols[currency] + service.price} />
            </>
        );
    } else if (isClass(service)) {
        details = (
            <>
                <InfoPill icon={Repeat} text={service.schedule.days.slice(0, 3).join(', ')} />
                <InfoPill icon={Clock} text={service.duration + ' min'} />
                <InfoPill icon={Tag} text={currencySymbols[currency] + service.price} />
            </>
        );
    } else if (isAppointment(service)) {
        details = (
            <>
                <InfoPill icon={Clock} text={service.duration + ' min'} />
                <InfoPill icon={Tag} text={service.price === '0' ? 'Free' : currencySymbols[currency] + service.price} />
            </>
        );
    }

    return (
        <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
            <div className="p-5 flex-grow">
                <h3 className="font-bold text-protribe-gray-extradark dark:text-white">{service.title}</h3>
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light mt-2 h-10 line-clamp-2">{service.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {details}
                </div>
            </div>
            <div className="p-4 bg-protribe-gray-extralight dark:bg-protribe-gray-800/50 border-t border-gray-200 dark:border-protribe-gray-600">
                <button onClick={() => onBook(service)} className="w-full text-center px-4 py-2 text-sm font-semibold text-protribe-teal hover:text-protribe-green-dark transition-colors flex items-center justify-center gap-2 group">
                    View Details <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default PublicServiceCard;