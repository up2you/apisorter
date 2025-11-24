import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProviderForm } from '@/components/admin/ProviderForm';
import prisma from '@/lib/prisma';
import { Provider } from '@prisma/client';

interface EditProviderPageProps {
    provider: Provider;
}

export default function EditProviderPage({ provider }: EditProviderPageProps) {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Edit Provider: {provider.name}</h1>
            <ProviderForm initialData={provider} isEdit />
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string };
    const provider = await prisma.provider.findUnique({
        where: { id },
    });

    if (!provider) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            provider: JSON.parse(JSON.stringify(provider)),
        },
    };
};
