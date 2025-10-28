
import React from 'react';

interface EmptyStateProps {
    message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
    return (
        <div className="bg-white dark:bg-protribe-gray-700 border border-gray-200 dark:border-protribe-gray-600 rounded-lg shadow-sm p-12">
            <div className="text-center">
                <p className="text-sm text-protribe-gray-dark dark:text-protribe-gray-light">{message}</p>
            </div>
        </div>
    );
};

export default EmptyState;