import { supabase } from './supabase';

/**
 * Get public URL for an image in Supabase storage
 * @param bucketName - Name of the storage bucket (default: 'products')
 * @param imagePath - Path to the image file in the bucket
 * @returns Public URL string or fallback placeholder
 */
export const getStorageUrl = (imagePath: string, bucketName: string = 'products'): string => {
    if (!imagePath) {
        return 'https://via.placeholder.com/400x300?text=No+Image';
    }

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Get public URL from Supabase storage
    const { data } = supabase.storage.from(bucketName).getPublicUrl(imagePath);

    return data.publicUrl || 'https://via.placeholder.com/400x300?text=No+Image';
};

/**
 * Upload a product image to Supabase storage
 * @param file - The file object to upload
 * @returns Promise resolving to the public URL of the uploaded image
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            console.error('File size exceeds 10MB limit:', file.size);
            throw new Error('File size exceeds 10MB. Please use a smaller image.');
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            console.error('Invalid file type:', file.type);
            throw new Error('Invalid file type. Please use JPG, PNG, WEBP, or GIF.');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error('User not authenticated');
            throw new Error('You must be logged in to upload images.');
        }

        // Try to upload
        const { data, error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload failed. Full error details:', JSON.stringify(uploadError, null, 2));

            // Check specific error types
            const errorMsg = uploadError.message.toLowerCase();

            if (errorMsg.includes('policy')) {
                throw new Error('Storage policy error. Run this in Supabase SQL Editor:\n\nDROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;\nCREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'products\');');
            } else if (errorMsg.includes('bucket')) {
                throw new Error('Bucket error. Make sure "products" bucket exists and is set to PUBLIC in Supabase Dashboard.');
            } else if (errorMsg.includes('internal') || errorMsg.includes('server')) {
                throw new Error('Supabase server error. This usually means:\n1. The bucket is not PUBLIC (check Storage settings)\n2. Missing storage policies\n3. Bucket may not exist\n\nPlease check your Supabase Dashboard > Storage > products bucket');
            } else {
                throw new Error(`Upload error: ${uploadError.message}`);
            }
        }

        if (!data || !data.path) {
            throw new Error('Upload succeeded but no path returned. Please try again.');
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);

        if (!urlData || !urlData.publicUrl) {
            console.error('Failed to get public URL');
            throw new Error('Upload succeeded but could not generate public URL. Check if bucket is PUBLIC.');
        }

        return urlData.publicUrl;

    } catch (error: any) {
        console.error('Error in uploadProductImage:', error);
        throw error;
    }
};

