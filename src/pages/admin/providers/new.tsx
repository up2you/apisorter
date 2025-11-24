import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProviderForm } from '@/components/admin/ProviderForm';

export default function NewProviderPage() {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Create New Provider</h1>
            <ProviderForm />
        </AdminLayout>
    );
}
