import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('Sales Rep');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setPassword(''); // Don't pre-fill password for security
        } else {
            setName('');
            setEmail('');
            setRole('Sales Rep');
            setPassword('');
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            alert('Please fill out name and email.');
            return;
        }
        if (!user && !password) {
            alert('Password is required for new users.');
            return;
        }
        
        const userData: User = {
            id: user ? user.id : `user-${Date.now()}`,
            name,
            email,
            role,
            status: user ? user.status : 'Active',
            // Only update password if a new one is entered
            password: password ? password : user?.password,
        };
        onSave(userData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-brand-light-card dark:bg-brand-navy border border-brand-light-border dark:border-brand-gray rounded-lg shadow-xl w-full max-w-md flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-border dark:border-brand-gray">
                    <h2 className="text-xl font-bold text-brand-light-text dark:text-white">{user ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white text-2xl font-bold">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!user} placeholder={user ? 'Leave blank to keep current' : 'Set a password'} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full bg-brand-light-bg dark:bg-brand-gray/50 border border-brand-light-border dark:border-brand-gray rounded-md p-2 text-sm text-brand-light-text dark:text-white">
                            <option value="Sales Rep">Sales Rep</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>
                </form>
                <div className="flex justify-end p-4 border-t border-brand-light-border dark:border-brand-gray space-x-2">
                    <button type="button" onClick={onClose} className="bg-brand-gray text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-light-gray transition text-sm">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition text-sm">Save</button>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
