import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Calendar, Store, CreditCard } from 'lucide-react';

interface SignUpPageProps {
    onSignUp: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode, text: string }> = ({ icon, text }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
            {icon}
        </div>
        <p className="text-protribe-gray-dark mt-2">{text}</p>
    </div>
);

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSignUp();
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left Side */}
            <div className="w-full md:w-1/2 lg:w-3/5 bg-protribe-green-light flex flex-col justify-between p-8 sm:p-12 lg:p-24 text-protribe-gray-extradark">
                <div>
                    <h1 className="text-2xl font-bold text-protribe-teal mb-12">protribe</h1>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">The All-In-One Platform for Modern Coaches.</h2>
                    <p className="text-lg text-protribe-gray-dark mb-12">Stop juggling tools. Start growing your business.</p>
                    <div className="space-y-8">
                        <Feature icon={<Calendar className="h-6 w-6 text-protribe-teal"/>} text="Effortless scheduling for sessions, classes, and appointments."/>
                        <Feature icon={<Store className="h-6 w-6 text-protribe-teal"/>} text="A beautiful, customizable storefront your clients will love."/>
                        <Feature icon={<CreditCard className="h-6 w-6 text-protribe-teal"/>} text="Sell bundles and memberships to build recurring revenue."/>
                    </div>
                </div>
                 <p className="text-sm text-protribe-gray mt-8 hidden md:block">&copy; 2025 ProTribe.io. All rights reserved.</p>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center p-8 sm:p-12">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-right mb-8">
                        <p className="text-sm text-protribe-gray-dark">
                            Already have an account? <Link to="/login" className="font-medium text-protribe-teal hover:underline">Sign In</Link>
                        </p>
                    </div>
                    <h2 className="text-3xl font-bold text-protribe-gray-extradark mb-2">Create Your Account</h2>
                    <p className="text-protribe-gray-dark mb-8">Start your coaching journey with ProTribe.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="fullname" className="block text-sm font-medium text-protribe-gray-dark">Full Name</label>
                            <input type="text" id="fullname" name="fullname" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-protribe-teal focus:border-protribe-teal sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-protribe-gray-dark">Email Address</label>
                            <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-protribe-teal focus:border-protribe-teal sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-protribe-gray-dark">Password</label>
                            <div className="relative mt-1">
                                <input type={passwordVisible ? "text" : "password"} id="password" name="password" required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-protribe-teal focus:border-protribe-teal sm:text-sm" />
                                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-protribe-teal hover:bg-protribe-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-protribe-teal transition-colors">
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
                 <p className="text-sm text-center text-protribe-gray mt-8 md:hidden">&copy; 2025 ProTribe.io. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SignUpPage;