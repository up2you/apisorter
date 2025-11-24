import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ApiForm } from '@/components/admin/ApiForm';
import prisma from '@/lib/prisma';
import { Provider } from '@prisma/client';

interface NewApiPageProps {
    providers: Provider[];
}

export default function NewApiPage({ providers }: NewApiPageProps) {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Create New API</h1>
            <ApiForm providers={providers} />
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const providers = await prisma.provider.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
    });

    return {
        props: {
            providers,
        },
    };
};
