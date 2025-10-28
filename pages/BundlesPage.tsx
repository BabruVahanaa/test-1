import React, { useState, useMemo } from 'react';
import InfoBox from '../components/ui/InfoBox';
import EmptyState from '../components/ui/EmptyState';
import CreateBundleModal from '../components/modals/CreateBundleModal';
import BundleCard from '../components/cards/BundleCard';
import { useEvents, Bundle } from '../contexts/EventContext';

const BundlesPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bundleToEdit, setBundleToEdit] = useState<Bundle | null>(null);

    // Get live event data from the global context
    const { sessions, classes, appointmentTypes, bundles, saveBundle, deleteBundle, togglePauseBundle } = useEvents();

    const handleSaveBundle = (bundleData: Omit<Bundle, 'id' | 'status'> & { id?: number }) => {
        saveBundle(bundleData);
        setBundleToEdit(null);
        setIsModalOpen(false);
    };

    const handleEditBundle = (bundle: Bundle) => {
        setBundleToEdit(bundle);
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
                    <h2 className="text-2xl font-bold text-protribe-gray-extradark dark:text-white">Bundles</h2>
                     <button onClick={() => { setBundleToEdit(null); setIsModalOpen(true); }} className="px-4 py-2 text-sm font-medium text-white bg-protribe-teal rounded-md hover:bg-protribe-green-dark">
                        + Create Bundle
                    </button>
                </div>
                <InfoBox title="Power Up Your Sales with Bundles">
                    Bundles are a powerful upselling tool. Instead of selling single sessions, you can package multiple events into a high-value program (e.g., a "6-Week Transformation" bundle). This allows you to sell a complete experience, not just appointments.
                </InfoBox>
                
                {bundles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bundles.map(bundle => (
                            <BundleCard
                                key={bundle.id}
                                bundle={bundle}
                                onEdit={handleEditBundle}
                                onDelete={deleteBundle}
                                onTogglePause={togglePauseBundle}
                                allEvents={eventData}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="You haven't created any bundles yet." />
                )}
            </div>

            <CreateBundleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveBundle}
                bundleToEdit={bundleToEdit}
                availableEvents={eventData}
            />
        </>
    );
};

export default BundlesPage;