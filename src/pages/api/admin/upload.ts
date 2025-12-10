import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const form = formidable({
        maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    try {
        const [fields, files] = await form.parse(req);
        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        const result = await cloudinary.uploader.upload(file.filepath, {
            folder: 'ad_campaigns',
        });

        return res.status(200).json({ url: result.secure_url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Upload failed' });
    }
}
