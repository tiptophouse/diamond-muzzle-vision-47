import { BlockedUsersTable } from '@/components/admin/BlockedUsersTable';
import { TelegramLayout } from '@/components/layout/TelegramLayout';

export default function BlockedUsersPage() {
  return (
    <TelegramLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <BlockedUsersTable />
      </div>
    </TelegramLayout>
  );
}
