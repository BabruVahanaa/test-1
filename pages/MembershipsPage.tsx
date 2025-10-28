import React, { useState, useMemo } from 'react';
import InfoBox from '../components/ui/InfoBox';
import EmptyState from '../components/ui/EmptyState';
import CreateMembershipModal from '../components/modals/CreateMembershipModal';
import MembershipCard from '../components/cards/MembershipCard';
import { useEvents, Membership } from '../contexts/EventContext';

const MembershipsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [membershipToEdit, setMembershipToEdit] = useState<Membership | null>(null);

    // Get live event data from the global context
    const { sessions, classes, appointmentTypes, memberships, saveMembership, deleteMembership, togglePauseMembership } = useEvents();

    const handleSaveMembership = (membershipData: Omit<Membership, 'id' | 'status'> & { id?: number }) => {
        saveMembership(membershipData);
        setMembershipToEdit(null);
        setIsModalOpen(false);
    };

    const handleEditMembership = (membership: Membership) => {
        setMembershipToEdit(membership);
        setIsModalOpen(true);
    };
    
    const eventData = useMemo(() => ({
        sessions,
        classes,
        appointmentTypes
    }), [sessions, classes, appointmentTypes]);


    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-protribe-gray-extradark dark:text-white">Memberships</h2>
                     <button onClick={() => { setMembershipToEdit(null); setIsModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                        + Create Membership
                    </button>
                </div>
                <InfoBox title="Build Recurring Revenue with Memberships">
                    Memberships are subscriptions that grant clients ongoing access to your services. Offer different tiers (e.g., "Basic" with access to all classes, "Premium" with classes plus monthly 1-on-1s) to create predictable, recurring income for your business.
                </InfoBox>
                
                {memberships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {memberships.map(membership => (
                            <MembershipCard
                                key={membership.id}
                                membership={membership}
                                onEdit={handleEditMembership}
                                onDelete={deleteMembership}
                                onTogglePause={togglePauseMembership}
                                allEvents={eventData}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="You haven't created any memberships yet." />
                )}
            </div>

            <CreateMembershipModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMembership}
                membershipToEdit={membershipToEdit}
                availableEvents={eventData}
            />
        </>
    );
};

export default MembershipsPage;