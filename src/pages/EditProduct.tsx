import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Sell.css';

const EditProduct = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        price: '',
        description: ''
    });

    useEffect(() => {
        if (id && user) {
            fetchProduct();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .eq('seller_id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setFormData({
                    price: data.price.toString(),
                    description: data.description || ''
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    price: parseFloat(formData.price),
                    description: formData.description
                })
                .eq('id', id)
                .eq('seller_id', user.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (err: any) {
            console.error('Update Error:', err);
            setError(err.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="sell-page">
                <div className="container">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="sell-page">
            <div className="container">
                <div className="sell-header">
                    <h1>✏️ Edit Product</h1>
                    <p>Update your product details</p>
                </div>

                <div className="sell-content">
                    <form className="sell-form-modern" onSubmit={handleSubmit}>
                        {error && <div className="alert alert-error">{error}</div>}
                        {success && <div className="alert alert-success">✅ Product updated successfully!</div>}

                        <div className="form-section">
                            <h2>📝 Product Details</h2>

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
                                    placeholder="Describe your account in detail"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard')}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-submit"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
