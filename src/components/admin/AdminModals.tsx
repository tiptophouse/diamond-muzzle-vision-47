
import React from 'react';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';

interface AdminModalsProps {
  showUserDetails: boolean;
  selectedUser: any;
  onCloseUserDetails: () => void;
  showAddUser: boolean;
  onCloseAddUser: () => void;
  showEditUser: boolean;
  editingUser: any;
  onCloseEditUser: () => void;
}

export function AdminModals({
  showUserDetails,
  selectedUser,
  onCloseUserDetails,
  showAddUser,
  onCloseAddUser,
  showEditUser,
  editingUser,
  onCloseEditUser
}: AdminModalsProps) {
  return (
    <>
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={showUserDetails}
          onClose={onCloseUserDetails}
        />
      )}

      {showAddUser && (
        <AddUserModal
          isOpen={showAddUser}
          onClose={onCloseAddUser}
        />
      )}

      {showEditUser && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={showEditUser}
          onClose={onCloseEditUser}
        />
      )}
    </>
  );
}
