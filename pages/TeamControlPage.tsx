import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface TeamControlPageProps {
  users: User[];
  onViewUserTrends: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
}

const TeamControlPage: React.FC<TeamControlPageProps> = ({ users, onViewUserTrends, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddUser = () => setIsModalOpen(true);

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete \${userName} (\${userEmail})?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from users table
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) throw dbError;

      // Delete from auth (requires admin privileges or service role key)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.warn('Could not delete from auth:', authError.message);
      }

      alert(`\${userName} has been deleted successfully.`);
      
      // Call parent callback if provided
      if (onDeleteUser) {
        onDeleteUser(userId);
      }
      
      window.location.reload();
    } catch (err: any) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const form = e.currentTarget;
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const role = form.role.value || 'Sales Rep';
    const password = form.password.value || null;

    try {
      // 1. Send invite + auto-create user
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || undefined,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name, role },
        },
      });

      if (error) throw error;

      // 2. If user was created instantly (password provided), insert profile
      if (data.user && !data.user.identities?.length) {
        throw new Error('User already exists');
      }

      // 3. Insert into your users table (even if they need to confirm email)
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name,
          email,
          role,
          status: 'Active',
          company_id: 'your-company-id-here', // replace with real company_id
        });
      }

      alert(
        `Success!\n\n\${name} has been invited.\n\n` +
        (password
          ? 'They can log in immediately.'
          : 'They will receive an email to set their password.')
      );

      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert('Failed to add user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Team Control Panel</h1>
          <button
            onClick={handleAddUser}
            className="bg-brand-ink hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
          >
            + Add User
          </button>
        </div>

        {/* Table — unchanged */}
        <div className="bg-white dark:bg-brand-navy rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-brand-gray/30">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full \${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => onViewUserTrends(user.id)}
                          className="text-brand-blue hover:underline text-sm"
                        >
                          View Trends
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                          className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CLEAN, WORKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-brand-navy rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center mb-6">Add New Team Member</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input name="name" type="text" placeholder="Full Name" required className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none" />
              <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none" />
              <input name="password" type="text" placeholder="Password (optional — auto-generated if blank)" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none" />
              <select name="role" defaultValue="Sales Rep" className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-brand-blue outline-none">
                <option>Sales Rep</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="flex-1 py-3 border rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-lg shadow-lg">
                  {saving ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamControlPage;
