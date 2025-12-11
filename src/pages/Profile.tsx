import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User as UserIcon, Tag, LogOut, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Profile.css';

const Profile = () => {
    const { user, loading, userRole, signOut } = useAuth();
    const [userDetails, setUserDetails] = useState({
        full_name: '',
        phone: '',
        whatsapp: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            // Always fetch fresh data from database on profile visit
            fetchUserDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchUserDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('user_details')
                .select('*')
                .eq('user_id', user?.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user details:', error);
            }

            if (data) {
                // Found existing details - ALWAYS show read-only view
                setUserDetails({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    whatsapp: data.whatsapp || ''
                });

                setIsEditing(false); // FORCE read-only view

                // Clear any drafts since we have saved data
                if (user?.id) {
                    localStorage.removeItem(`user_details_draft_${user.id}`);
                }
            } else {
                // No details found - new user needs to fill form
                setIsEditing(true);

                // Check for draft only if no saved data exists
                const draftKey = `user_details_draft_${user?.id}`;
                const draft = localStorage.getItem(draftKey);
                if (draft) {
                    try {
                        const draftData = JSON.parse(draft);
                        setUserDetails(draftData);
                        setMessage('📝 Unsaved changes recovered!');
                        setTimeout(() => setMessage(''), 3000);
                    } catch (error) {
                        console.error('Error parsing draft:', error);
                        localStorage.removeItem(draftKey);
                    }
                }
            }
        } catch (error) {
            console.error('Unexpected error fetching details:', error);
            setIsEditing(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDetails = {
            ...userDetails,
            [e.target.name]: e.target.value
        };
        setUserDetails(newDetails);

        // Save to localStorage as draft (auto-save)
        if (user?.id) {
            localStorage.setItem(`user_details_draft_${user.id}`, JSON.stringify(newDetails));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            // Always check database for existing record (most reliable)
            const { data: existingData, error: checkError } = await supabase
                .from('user_details')
                .select('id, user_id')
                .eq('user_id', user?.id)
                .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            const detailsToSave = {
                full_name: userDetails.full_name.trim(),
                phone: userDetails.phone.trim(),
                whatsapp: userDetails.whatsapp.trim(),
                updated_at: new Date().toISOString()
            };

            if (existingData) {
                // Record exists - UPDATE
                const { error } = await supabase
                    .from('user_details')
                    .update(detailsToSave)
                    .eq('user_id', user?.id);

                if (error) {
                    console.error('Update error:', error);
                    throw error;
                }
            } else {
                // Record doesn't exist - INSERT
                const { error } = await supabase
                    .from('user_details')
                    .insert({
                        user_id: user?.id,
                        ...detailsToSave
                    });

                if (error) {
                    console.error('Insert error:', error);
                    throw error;
                }
            }

            // Success - update local state
            setIsEditing(false);
            setMessage('✅ Details saved successfully!');

            // Clear draft from localStorage
            if (user?.id) {
                localStorage.removeItem(`user_details_draft_${user.id}`);
            }

            // Refresh data from database to ensure sync
            await fetchUserDetails();

            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            console.error('Error saving details:', error);
            let errorMessage = '❌ Failed to save details. ';

            if (error.code === '23505') {
                // Duplicate key - means record exists, should update instead
                errorMessage += 'Syncing data...';
                setMessage(errorMessage);
                await fetchUserDetails(); // Refresh to get correct state
                setIsEditing(true); // Allow user to try again
            } else if (error.code === 'PGRST116') {
                errorMessage += 'No permission. Please check database settings.';
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please try again.';
            }

            setMessage(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Restore from database or clear draft
        fetchUserDetails();
        setIsEditing(false);

        // Clear any draft
        if (user?.id) {
            localStorage.removeItem(`user_details_draft_${user.id}`);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        await signOut();
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-content">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="profile-content">
                        <p>Please log in to view your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    const displayName = user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User';

    const userEmail = user.email || 'No email';
    const userPhone = user.user_metadata?.phone || user.phone || 'Not provided';
    const profilePicture = user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        '/default_profile.jpg'; // Default profile picture from public folder

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-content">
                    {/* Main Bio Data Card */}
                    <div className="bio-data-card">
                        {/* Header Section */}
                        <div className="bio-header">
                            <div className="bio-avatar-section">
                                <div className="bio-avatar-wrapper">
                                    <img
                                        src={profilePicture}
                                        alt={displayName}
                                        className="bio-avatar-image"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const avatarCircle = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (avatarCircle) {
                                                avatarCircle.classList.remove('hidden');
                                            }
                                        }}
                                    />
                                    <div className="bio-avatar-circle hidden">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    {userRole && (
                                        <div className={`bio-role-badge role-${userRole}`}>
                                            {userRole === 'admin' && <Shield size={12} />}
                                            {userRole === 'seller' && <Tag size={12} />}
                                            {userRole === 'user' && <UserIcon size={12} />}
                                            <span>{userRole.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bio-identity">
                                <h1>{displayName}</h1>
                                <p className="bio-id">ID: {user.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="bio-divider"></div>

                        {/* Personal Information Section */}
                        <div className="bio-section">
                            <h3 className="bio-section-title">Personal Information</h3>
                            <div className="bio-grid">
                                <div className="bio-item">
                                    <span className="bio-label">Full Name</span>
                                    <span className="bio-value">{displayName}</span>
                                </div>
                                <div className="bio-item">
                                    <span className="bio-label">Email Address</span>
                                    <span className="bio-value">{userEmail}</span>
                                </div>
                                <div className="bio-item">
                                    <span className="bio-label">Phone Number</span>
                                    <span className="bio-value">{userPhone}</span>
                                </div>
                                <div className="bio-item">
                                    <span className="bio-label">Member Since</span>
                                    <span className="bio-value">{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bio-divider"></div>

                        {/* Contact Details Section */}
                        <div className="bio-section">
                            <div className="bio-section-header">
                                <h3 className="bio-section-title">Contact Details</h3>
                                {!isEditing && (
                                    <button className="btn-bio-edit" onClick={() => setIsEditing(true)}>
                                        <Save size={14} /> Edit
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="bio-form">
                                    <div className="bio-form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={userDetails.full_name}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={userDetails.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>WhatsApp</label>
                                            <input
                                                type="tel"
                                                name="whatsapp"
                                                value={userDetails.whatsapp}
                                                onChange={handleChange}
                                                placeholder="Enter WhatsApp number"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="bio-form-actions">
                                        <button type="button" className="btn-bio-cancel" onClick={handleCancel}>Cancel</button>
                                        <button type="submit" className="btn-bio-save" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                    {message && <div className={`bio-message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
                                </form>
                            ) : (
                                <div className="bio-grid">
                                    <div className="bio-item">
                                        <span className="bio-label">Contact Name</span>
                                        <span className="bio-value">{userDetails.full_name || 'Not provided'}</span>
                                    </div>
                                    <div className="bio-item">
                                        <span className="bio-label">Contact Phone</span>
                                        <span className="bio-value">{userDetails.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="bio-item">
                                        <span className="bio-label">WhatsApp</span>
                                        <span className="bio-value">{userDetails.whatsapp || 'Not provided'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bio-divider"></div>

                        {/* Account Actions */}
                        <div className="bio-footer">
                            <button className="btn-bio-logout" onClick={handleLogoutClick}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal">
                        <div className="logout-icon-wrapper">
                            <LogOut size={32} />
                        </div>
                        <h2>Sign Out?</h2>
                        <p>Are you sure you want to log out? You'll need to sign in again to access your account.</p>
                        <div className="logout-modal-actions">
                            <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="btn-confirm-logout" onClick={confirmLogout}>Yes, Log Out</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
