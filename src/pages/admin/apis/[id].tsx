import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ApiForm } from '@/components/admin/ApiForm';
import prisma from '@/lib/prisma';
import { Api, Provider } from '@prisma/client';

interface EditApiPageProps {
    api: Api;
    providers: Provider[];
}

export default function EditApiPage({ api, providers }: EditApiPageProps) {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Edit API: {api.name}</h1>
            <ApiForm initialData={api} providers={providers} isEdit />
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string };

    const [api, providers] = await Promise.all([
        prisma.api.findUnique({ where: { id } }),
        prisma.provider.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    ]);

    if (!api) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            api: JSON.parse(JSON.stringify(api)),
            providers,
        },
    };
};
