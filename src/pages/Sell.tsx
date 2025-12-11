import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadProductImage } from '../lib/storage';
import './Sell.css';

const Sell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [formData, setFormData] = useState({
        price: '',
        description: ''
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            // Combine existing files with new files
            const combinedFiles = [...selectedFiles, ...newFiles];

            if (combinedFiles.length > 4) {
                setError('You can only upload up to 4 images total.');
                // Only take first 4 images
                const limitedFiles = combinedFiles.slice(0, 4);
                setSelectedFiles(limitedFiles);
                const urls = limitedFiles.map(file => URL.createObjectURL(file));
                setPreviewUrls(urls);
            } else {
                setSelectedFiles(combinedFiles);
                const urls = combinedFiles.map(file => URL.createObjectURL(file));
                setPreviewUrls(urls);
                setError('');
            }

            // Reset input value to allow selecting same file again
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to sell an account.');
            return;
        }

        if (selectedFiles.length === 0) {
            setError('Please upload at least one image.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);
        setUploadProgress('Starting upload process...');

        try {
            // 1. Upload Images
            const imageUrls: string[] = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
                try {
                    const url = await uploadProductImage(selectedFiles[i]);
                    if (url) {
                        imageUrls.push(url);
                    } else {
                        throw new Error(`Failed to upload image ${i + 1}. Please try again.`);
                    }
                } catch (uploadError: any) {
                    throw new Error(`Image ${i + 1}: ${uploadError.message || 'Upload failed'}`);
                }
            }

            // 2. Insert into Database
            setUploadProgress('Saving product details to database...');

            // Get next product number
            const { count } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const productNumber = (count || 0) + 1;
            const productTitle = `Product ${productNumber}`;

            const productData = {
                title: productTitle,
                level: 0,
                diamonds: 0,
                skins: 0,
                price: parseFloat(formData.price),
                description: formData.description,
                seller_id: user.id,
                image: imageUrls[0], // Main image
                images: imageUrls,
                featured: false,
                status: 'active' // Ensure status is set
            };

            const { error: dbError } = await supabase
                .from('products')
                .insert(productData)
                .select();

            if (dbError) {
                console.error('Database Insert Error:', dbError);
                throw new Error(`Database Error: ${dbError.message}. (Hint: Check RLS policies for 'products' table)`);
            }

            setSuccess(true);
            setUploadProgress('Success! Your account is now listed.');

            // Clear form
            setFormData({
                price: '',
                description: ''
            });
            setSelectedFiles([]);
            setPreviewUrls([]);

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err: any) {
            console.error('Submission Error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setUploadProgress('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sell-page">
            <div className="container">
                <div className="sell-header">
                    <h1>🔥 List Your Account</h1>
                    <p>Upload your Free Fire account and start earning</p>
                </div>

                <div className="sell-content">
                    <form className="sell-form-modern" onSubmit={handleSubmit}>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">✅ Product listed successfully!</div>}
                        {uploadProgress && <div className="alert alert-info">⏳ {uploadProgress}</div>}

                        {/* Image Upload Section */}
                        <div className="form-section">
                            <h2>📸 Product Images</h2>
                            <p className="section-subtitle">Upload 1-4 images. First image will be the main display image.</p>

                            {/* Always show 4 slots grid */}
                            <div className="image-grid-container">
                                <div className="image-grid">
                                    {/* Show uploaded images */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="image-grid-item">
                                            <div className="image-wrapper">
                                                <img src={url} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="remove-btn"
                                                    title="Remove image"
                                                >
                                                    ✕
                                                </button>
                                                <div className="image-label">
                                                    {index === 0 ? '⭐ Main Image' : `Image ${index + 1}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Always show empty slots to make 4 total */}
                                    {Array.from({ length: 4 - previewUrls.length }).map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            className="image-grid-item empty-slot clickable"
                                            onClick={() => document.getElementById('images')?.click()}
                                        >
                                            <div className="empty-placeholder">
                                                <span className="plus-icon">+</span>
                                                <span className="slot-text">Add Image</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="images"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="file-input-hidden"
                            />
                        </div>

                        {/* Account Details */}
                        <div className="form-section">
                            <h2>📝 Account Details</h2>
                            <p className="section-subtitle">Product name will be auto-generated (e.g., Product 1, Product 2)</p>

                            <div className="form-group">
                                <label htmlFor="price">Price (৳) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="2500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Describe your account in detail: special items, characters, achievements, etc."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit-modern"
                            disabled={loading || selectedFiles.length === 0}
                        >
                            {loading ? '⏳ Uploading...' : '🚀 List Account Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Sell;
