
import React from 'react';
import { Contact } from '../types';

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList: React.FC<ContactsListProps> = ({ contacts }) => {
  return (
    <div className="bg-brand-light-card dark:bg-brand-navy p-4 rounded-lg border border-brand-light-border dark:border-brand-gray">
      <h3 className="text-lg font-bold mb-4">Contacts</h3>
      {contacts.length > 0 ? (
        <ul>
          {contacts.map(contact => (
            <li key={contact.id} className="py-2 border-b border-brand-light-border dark:border-brand-gray">
              <p className="font-semibold">{contact.name}</p>
              <p className="text-sm text-gray-500">{contact.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No contacts to display.</p>
      )}
    </div>
  );
};

export default ContactsList;