import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
    api: {
        bodyParser: false, // Disable body parser for file uploads
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const form = formidable({
        maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    try {
        const [fields, files] = await form.parse(req);
        let imageUrl = '';

        // Handle File Upload
        const file = files.image?.[0];
        if (file) {
            try {
                const result = await cloudinary.uploader.upload(file.filepath, {
                    folder: 'user_avatars',
                    public_id: `user_${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    overwrite: true,
                    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
                });
                imageUrl = result.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: 'Failed to upload image' });
            }
        } else if (fields.imageUrl?.[0]) {
            // Handle URL input (fallback)
            imageUrl = fields.imageUrl[0];
        }

        if (!imageUrl) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                image: imageUrl,
            },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Failed to update profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
