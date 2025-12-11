import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, X, LogOut, Edit2, CheckCircle } from 'lucide-react';
import './UserDetailsModal.css';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'edit' | 'confirm';
}

const UserDetailsModal = ({ isOpen, onClose, onSuccess, initialMode = 'edit' }: UserDetailsModalProps) => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'edit' | 'confirm'>(initialMode);
    const [formData, setFormData] = useState({
        full_name: user?.user_metadata?.full_name || '',
        phone: '',
        whatsapp: ''
    });

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            fetchExistingDetails();
        }
    }, [isOpen, initialMode]);

    const fetchExistingDetails = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('user_details')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    whatsapp: data.whatsapp || ''
                });
            }
        } catch (err) {
            console.error('Error fetching details:', err);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const detailsToSave = {
                full_name: formData.full_name.trim(),
                phone: formData.phone.trim(),
                whatsapp: formData.whatsapp.trim(),
                updated_at: new Date().toISOString()
            };

            // Check if record exists
            const { data: existingData } = await supabase
                .from('user_details')
                .select('id')
                .eq('user_id', user?.id)
                .maybeSingle();

            let result;
            if (existingData) {
                result = await supabase
                    .from('user_details')
                    .update(detailsToSave)
                    .eq('user_id', user?.id);
            } else {
                result = await supabase
                    .from('user_details')
                    .insert({
                        user_id: user?.id,
                        ...detailsToSave
                    });
            }

            if (result.error) throw result.error;

            // If we were in edit mode, switch to confirm mode or just finish
            // But usually if we save, we are ready to proceed
            setMode('confirm'); // Switch to confirm mode after saving
        } catch (err: any) {
            console.error('Error saving details:', err);
            setError(err.message || 'Failed to save details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out? You will need to sign in again to complete your purchase.')) {
            await signOut();
            onClose();
        }
    };

    return (
        <div className="user-details-modal-overlay" onClick={onClose}>
            <div className="user-details-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>{mode === 'confirm' ? 'Confirm Details' : 'Contact Details'}</h2>
                    <p>{mode === 'confirm' ? 'Please confirm your contact details for delivery' : 'Required for purchase delivery'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                {mode === 'confirm' ? (
                    <div className="confirm-view">
                        <div className="details-summary">
                            <div className="summary-item">
                                <span className="label">Full Name:</span>
                                <span className="value">{formData.full_name}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Phone:</span>
                                <span className="value">{formData.phone}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">WhatsApp:</span>
                                <span className="value">{formData.whatsapp}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setMode('edit')}>
                                <Edit2 size={18} />
                                Edit Details
                            </button>
                            <button className="btn-submit" onClick={onSuccess}>
                                <CheckCircle size={18} />
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label htmlFor="full_name">Full Name</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="whatsapp">WhatsApp Number</label>
                            <input
                                type="tel"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="01XXXXXXXXX"
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        Save & Continue
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="modal-footer-actions">
                    <button onClick={handleLogout} className="btn-logout-link">
                        <LogOut size={14} />
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
