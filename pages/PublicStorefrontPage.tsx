import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStorefront } from '../contexts/StorefrontContext';
import { useEvents, Session, Class, AppointmentType, Bundle, Membership } from '../contexts/EventContext';
import { useCustomer } from '../contexts/CustomerContext';
import PublicServiceCard from '../components/cards/PublicServiceCard';
import PublicBundleCard from '../components/cards/PublicBundleCard';
import PublicMembershipCard from '../components/cards/PublicMembershipCard';
import BookingModal from '../components/modals/BookingModal';
import PurchaseModal from '../components/modals/PurchaseModal';
import CustomerLoginModal from '../components/modals/CustomerLoginModal';
import CustomerSignUpModal from '../components/modals/CustomerSignUpModal';
import CustomerAccountModal from '../components/modals/CustomerAccountModal';
import { Facebook, Twitter, Instagram, User } from 'lucide-react';

interface PublicStorefrontPageProps {
    isPreview?: boolean;
}

const PublicStorefrontPage: React.FC<PublicStorefrontPageProps> = ({ isPreview = false }) => {
    const { slug } = useParams<{ slug: string }>();
    const { settings } = useStorefront();
    const { sessions, classes, appointmentTypes, bundles, memberships } = useEvents();
    const { currentCustomer } = useCustomer();

    // Sticky header state
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Modal states
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Session | Class | AppointmentType | null>(null);

    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Bundle | Membership | null>(null);
    
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
    const [isAccountModalOpen, setAccountModalOpen] = useState(false);
    
    useEffect(() => {
        if (isPreview) return; // Don't attach listener in preview mode as it's in a scroller
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isPreview]);

    const activeServices = useMemo(() => 
        [...sessions, ...classes, ...appointmentTypes].filter(s => s.status === 'active' && (isPreview || ('isPublic' in s ? s.isPublic : true))),
        [sessions, classes, appointmentTypes, isPreview]
    );

    const activeBundles = useMemo(() => bundles.filter(b => b.status === 'active'), [bundles]);
    const activeMemberships = useMemo(() => memberships.filter(m => m.status === 'active'), [memberships]);

    const handleBookClick = (service: Session | Class | AppointmentType) => {
        setSelectedService(service);
        setBookingModalOpen(true);
    };

    const handlePurchaseClick = (item: Bundle | Membership) => {
        setSelectedItem(item);
        setPurchaseModalOpen(true);
    };
    
    const SocialIcon: React.FC<{ social: 'facebook' | 'twitter' | 'instagram', className?: string }> = ({ social, className }) => {
        const icons = { facebook: Facebook, twitter: Twitter, instagram: Instagram };
        const Icon = icons[social];
        const link = settings.socialLinks[social];
        if (!link) return null;
        return (
            <a href={link} target="_blank" rel="noopener noreferrer" className={`text-white/80 hover:text-white transition-colors ${className}`}>
                <Icon size={20} />
            </a>
        );
    };
    
    const AuthButtons = ({ scrolled }: { scrolled: boolean }) => {
        if (currentCustomer) {
            const buttonClasses = scrolled
                ? 'bg-black/5 dark:bg-white/10 text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-black/10 dark:hover:bg-white/20'
                : 'bg-white/10 text-white hover:bg-white/20';
            
            return (
                 <button onClick={() => setAccountModalOpen(true)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full transition ${buttonClasses}`}>
                    <User size={16} />
                    <span>{currentCustomer.name.split(' ')[0]}</span>
                </button>
            );
        }

        const loginClasses = scrolled
            ? 'bg-transparent text-protribe-gray-dark dark:text-protribe-gray-light hover:bg-black/10 dark:hover:bg-white/10'
            : 'bg-transparent text-white hover:bg-white/10';

        const signupClasses = scrolled
            ? 'bg-protribe-teal text-white hover:bg-protribe-green-dark'
            : 'bg-white text-protribe-teal hover:bg-gray-200';

        return (
            <div className="flex items-center gap-2">
                <button onClick={() => setLoginModalOpen(true)} className={`px-4 py-2 text-sm font-medium rounded-full transition ${loginClasses}`}>
                    Log In
                </button>
                <button onClick={() => setSignUpModalOpen(true)} className={`px-4 py-2 text-sm font-medium rounded-full transition ${signupClasses}`}>
                    Sign Up
                </button>
            </div>
        );
    };

    if (!isPreview && slug !== settings.slug) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Storefront not found.</p></div>;
    }

    return (
        <div className={`bg-protribe-gray-extralight dark:bg-protribe-gray-900 ${isPreview ? 'h-full overflow-y-auto' : 'min-h-screen'}`}>
            {/* Sticky Header */}
            <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-protribe-gray-800/80 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
                <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 ${isScrolled ? 'h-16' : 'h-0 overflow-hidden'}`}>
                   <div className="flex items-center justify-between h-full">
                        <h1 className={`font-bold text-protribe-gray-extradark dark:text-white`}>{settings.title}</h1>
                        <AuthButtons scrolled={true} />
                    </div>
                </div>
            </header>
            
            <main className={isScrolled ? '' : '-mt-16'}>
                {/* Hero Section */}
                <section className="relative bg-protribe-gray-800 text-white h-[60vh] min-h-[400px] flex flex-col">
                    <img src={settings.coverImageUrl} alt="Cover" className="absolute w-full h-full object-cover opacity-40"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-protribe-gray-900/60 to-protribe-gray-900/20"></div>

                    <nav className="relative w-full max-w-6xl mx-auto px-4 pt-4 flex justify-between items-center">
                        <h1 className="text-xl font-bold text-white">{settings.title}</h1>
                        <AuthButtons scrolled={false} />
                    </nav>

                    <div className="relative flex-1 flex flex-col items-center justify-center text-center p-4">
                        <h2 className="text-4xl md:text-5xl font-bold">{settings.title}</h2>
                        <p className="mt-4 max-w-2xl text-lg text-white/90">{settings.welcomeMessage}</p>
                        <div className="flex items-center gap-6 mt-6">
                            <SocialIcon social="instagram" />
                            <SocialIcon social="twitter" />
                            <SocialIcon social="facebook" />
                        </div>
                    </div>
                </section>
                
                {/* Content Sections */}
                <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-16">
                    {settings.sections.services && activeServices.length > 0 && (
                        <section id="services">
                            <h2 className="text-3xl font-bold text-protribe-gray-extradark dark:text-white mb-6">Our Services</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeServices.map(service => <PublicServiceCard key={`${service.id}-${service.title}`} service={service} onBook={handleBookClick}/>)}
                            </div>
                        </section>
                    )}
                    {settings.sections.bundles && activeBundles.length > 0 && (
                        <section id="bundles">
                            <h2 className="text-3xl font-bold text-protribe-gray-extradark dark:text-white mb-6">Special Bundles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeBundles.map(bundle => <PublicBundleCard key={bundle.id} bundle={bundle} onPurchase={handlePurchaseClick} />)}
                            </div>
                        </section>
                    )}
                    {settings.sections.memberships && activeMemberships.length > 0 && (
                        <section id="memberships">
                            <h2 className="text-3xl font-bold text-protribe-gray-extradark dark:text-white mb-6">Memberships</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeMemberships.map(mem => <PublicMembershipCard key={mem.id} membership={mem} onPurchase={handlePurchaseClick} />)}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <footer className="bg-white dark:bg-protribe-gray-800 border-t border-gray-200 dark:border-protribe-gray-700">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-protribe-gray-dark dark:text-protribe-gray-light">
                    &copy; {new Date().getFullYear()} {settings.title}. All Rights Reserved.
                </div>
            </footer>
            
            {/* Modals */}
            <BookingModal isOpen={isBookingModalOpen} onClose={() => setBookingModalOpen(false)} service={selectedService} />
            <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} item={selectedItem} />
            <CustomerLoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onSwitchToSignUp={() => { setLoginModalOpen(false); setSignUpModalOpen(true); }} />
            <CustomerSignUpModal isOpen={isSignUpModalOpen} onClose={() => setSignUpModalOpen(false)} onSwitchToLogin={() => { setSignUpModalOpen(false); setLoginModalOpen(true); }} />
            <CustomerAccountModal isOpen={isAccountModalOpen} onClose={() => setAccountModalOpen(false)} />
        </div>
    );
};

export default PublicStorefrontPage;