import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

interface User {
    id: string;
    email: string;
    role: 'user' | 'seller' | 'admin';
    created_at: string;
    full_name?: string;
    phone?: string;
    whatsapp?: string;
}

interface Banner {
    id: string;
    image_url: string;
    link?: string;
    active: boolean;
    created_at: string;
}

const Admin = () => {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [accountMessage, setAccountMessage] = useState('');
    const [savingMessage, setSavingMessage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [sellIdLink, setSellIdLink] = useState('');
    const [savingLinks, setSavingLinks] = useState(false);

    useEffect(() => {
        // Redirect if not admin
        if (!loading && userRole !== 'admin') {
            navigate('/');
        }
    }, [userRole, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchUsers();
            fetchAccountMessage();
            fetchBanners();
            fetchSupportLinks();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            // Fetch ALL users from public.users table
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            // Also fetch user_details to get contact info
            const { data: detailsData } = await supabase
                .from('user_details')
                .select('*');

            // Create map of details
            const detailsMap = new Map();
            if (detailsData) {
                detailsData.forEach((detail:any) => {
                    detailsMap.set(detail.user_id, detail);
                });
            }

            // Combine users with their details
            const formattedUsers: User[] = (usersData || []).map((user:any) => {
                const details = detailsMap.get(user.id);
                return {
                    id: user.id,
                    email: user.email || 'No email',
                    role: user.role || 'user',
                    created_at: user.created_at,
                    full_name: details?.full_name,
                    phone: details?.phone,
                    whatsapp: details?.whatsapp
                };
            });

            setUsers(formattedUsers);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            alert('❌ Failed to load users: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountMessage = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'account_info_message')
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setAccountMessage(data.value);
            } else {
                // Default message
                setAccountMessage('✅ Verified and secure account\n✅ Instant delivery\n✅ Full account access provided\n✅ 24/7 customer support');
            }
        } catch (error: any) {
            console.error('Error fetching account message:', error);
        }
    };

    const saveAccountMessage = async () => {
        setSavingMessage(true);
        try {
            // Check if setting exists
            const { data: existing } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', 'account_info_message')
                .maybeSingle();

            if (existing) {
                // Update existing
                const { error } = await supabase
                    .from('site_settings')
                    .update({ value: accountMessage, updated_at: new Date().toISOString() })
                    .eq('key', 'account_info_message');

                if (error) throw error;
            } else {
                // Insert new
                const { error } = await supabase
                    .from('site_settings')
                    .insert({ key: 'account_info_message', value: accountMessage });

                if (error) throw error;
            }

            alert('✅ Account information message updated successfully!');
        } catch (error: any) {
            console.error('Error saving message:', error);
            alert('❌ Failed to save message: ' + error.message);
        } finally {
            setSavingMessage(false);
        }
    };

    const fetchSupportLinks = async () => {
        try {
            // Fetch WhatsApp link
            const { data: whatsappData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'whatsapp_link')
                .maybeSingle();

            // Fetch Telegram link
            const { data: telegramData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'telegram_link')
                .maybeSingle();

            // Fetch Sell ID link
            const { data: sellIdData } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'sell_id_link')
                .maybeSingle();

            setWhatsappLink(whatsappData?.value || '+8801234567890');
            setTelegramLink(telegramData?.value || 'your_telegram');
            setSellIdLink(sellIdData?.value || 'https://wa.me/+8801234567890');
        } catch (error: any) {
            console.error('Error fetching support links:', error);
        }
    };

    const saveSupportLinks = async () => {
        setSavingLinks(true);
        try {
            // Save WhatsApp link
            const { data: whatsappExists } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', 'whatsapp_link')
                .maybeSingle();

            if (whatsappExists) {
                await supabase
                    .from('site_settings')
                    .update({ value: whatsappLink, updated_at: new Date().toISOString() })
                    .eq('key', 'whatsapp_link');
            } else {
                await supabase
                    .from('site_settings')
                    .insert({ key: 'whatsapp_link', value: whatsappLink });
            }

            // Save Telegram link
            const { data: telegramExists } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', 'telegram_link')
                .maybeSingle();

            if (telegramExists) {
                await supabase
                    .from('site_settings')
                    .update({ value: telegramLink, updated_at: new Date().toISOString() })
                    .eq('key', 'telegram_link');
            } else {
                await supabase
                    .from('site_settings')
                    .insert({ key: 'telegram_link', value: telegramLink });
            }

            // Save Sell ID link
            const { data: sellIdExists } = await supabase
                .from('site_settings')
                .select('id')
                .eq('key', 'sell_id_link')
                .maybeSingle();

            if (sellIdExists) {
                await supabase
                    .from('site_settings')
                    .update({ value: sellIdLink, updated_at: new Date().toISOString() })
                    .eq('key', 'sell_id_link');
            } else {
                await supabase
                    .from('site_settings')
                    .insert({ key: 'sell_id_link', value: sellIdLink });
            }

            alert('✅ Support links updated successfully!');
        } catch (error: any) {
            console.error('Error saving links:', error);
            alert('❌ Failed to save links: ' + error.message);
        } finally {
            setSavingLinks(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: 'user' | 'seller' | 'admin') => {
        setUpdating(userId);
        try {
            // Update role in users table
            const { error: usersError } = await supabase
                .from('users')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (usersError) throw usersError;

            // Also update in user_details if exists
            const { data: existing } = await supabase
                .from('user_details')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            if (existing) {
                await supabase
                    .from('user_details')
                    .update({ role: newRole, updated_at: new Date().toISOString() })
                    .eq('user_id', userId);
            } else {
                // Create user_details record with role
                await supabase
                    .from('user_details')
                    .insert({ user_id: userId, role: newRole });
            }

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));

            alert(`✅ Role updated to ${newRole} successfully!`);
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert(`❌ Failed to update role: ${error.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const fetchBanners = async () => {
        try {
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: true }); // Order by creation time

            if (error) throw error;
            setBanners(data || []);
        } catch (error: any) {
            console.error('Error fetching banners:', error);
        }
    };

    const uploadBanner = async (file: File) => {
        setUploadingBanner(true);
        try {
            // Check if we already have 3 banners
            const { data: existingBanners, error: fetchError } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: true });

            if (fetchError) {
                console.error('Error fetching existing banners:', fetchError);
                throw fetchError;
            }

            let oldestBanner = null;
            if (existingBanners && existingBanners.length >= 3) {
                // Get the oldest banner to replace
                oldestBanner = existingBanners[0];
            }

            // Upload to Supabase Storage - banners bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `banner-${Date.now()}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabase.storage
                .from('banners')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('banners')
                .getPublicUrl(filePath);

            if (oldestBanner) {
                // Replace oldest banner

                // Delete old file from storage
                const oldFileName = oldestBanner.image_url.split('/').pop();
                if (oldFileName) {
                    const { error: deleteError } = await supabase.storage
                        .from('banners')
                        .remove([oldFileName]);
                    if (deleteError) {
                        console.error('Error deleting old file:', deleteError);
                    }
                }

                // Update database record
                const { error: updateError } = await supabase
                    .from('banners')
                    .update({
                        image_url: publicUrl,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', oldestBanner.id)
                    .select();

                if (updateError) {
                    console.error('Update error:', updateError);
                    throw updateError;
                }

                alert('✅ Banner replaced successfully!');
            } else {
                // Insert new banner (less than 3 banners)
                const insertData = {
                    image_url: publicUrl,
                    active: true
                };

                const { error: dbError } = await supabase
                    .from('banners')
                    .insert(insertData)
                    .select();

                if (dbError) {
                    console.error('Database insert error:', dbError);
                    console.error('Error details:', JSON.stringify(dbError, null, 2));
                    throw dbError;
                }

                alert('✅ Banner uploaded successfully!');
            }

            fetchBanners();
        } catch (error: any) {
            console.error('Error uploading banner:', error);
            alert('❌ Failed to upload banner: ' + (error.message || JSON.stringify(error)));
        } finally {
            setUploadingBanner(false);
        }
    };

    const uploadBannerToSlot = async (file: File, bannerId: string) => {
        setUploadingBanner(true);
        try {
            // Upload to Supabase Storage - banners bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `banner-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('banners')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('banners')
                .getPublicUrl(fileName);

            // Get old banner to delete old file
            const oldBanner = banners.find(b => b.id === bannerId);
            if (oldBanner) {
                const oldFileName = oldBanner.image_url.split('/').pop();
                if (oldFileName) {
                    await supabase.storage.from('banners').remove([oldFileName]);
                }
            }

            // Update database record
            const { error: updateError } = await supabase
                .from('banners')
                .update({
                    image_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', bannerId);

            if (updateError) throw updateError;

            alert('✅ Banner replaced successfully!');
            fetchBanners();
        } catch (error: any) {
            console.error('Error replacing banner:', error);
            alert('❌ Failed to replace banner: ' + error.message);
        } finally {
            setUploadingBanner(false);
        }
    };

    const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('banners')
                .update({ active: !currentStatus })
                .eq('id', bannerId);

            if (error) throw error;

            setBanners(banners.map(b =>
                b.id === bannerId ? { ...b, active: !currentStatus } : b
            ));
        } catch (error: any) {
            console.error('Error toggling banner:', error);
            alert('❌ Failed to toggle banner status');
        }
    };

    const deleteBanner = async (bannerId: string, imageUrl: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            // Delete from storage (banners bucket)
            const fileName = imageUrl.split('/').pop();
            if (fileName) {
                await supabase.storage.from('banners').remove([fileName]);
            }

            // Delete from database
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', bannerId);

            if (error) throw error;

            setBanners(banners.filter(b => b.id !== bannerId));
            alert('✅ Banner deleted successfully!');
        } catch (error: any) {
            console.error('Error deleting banner:', error);
            alert('❌ Failed to delete banner');
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="container">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </div>
        );
    }

    if (userRole !== 'admin') {
        return null;
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <div>
                        <h1>Welcome Admin</h1>
                        <p className="admin-subtitle">Here's what's happening with your platform today.</p>
                    </div>
                </div>

                <div className="admin-stats">
                    <div className="stat-card stat-blue">
                        <div className="stat-top">
                            <div className="stat-icon">👥</div>
                            <div className="stat-change positive">+{users.filter(u => u.role === 'user').length > 0 ? '8' : '0'}%</div>
                        </div>
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                        <div className="stat-bar stat-bar-blue"></div>
                    </div>
                    <div className="stat-card stat-green">
                        <div className="stat-top">
                            <div className="stat-icon">$</div>
                            <div className="stat-change positive">+15%</div>
                        </div>
                        <div className="stat-value">{users.filter(u => u.role === 'seller').length}</div>
                        <div className="stat-label">Total Sellers</div>
                        <div className="stat-bar stat-bar-green"></div>
                    </div>
                    <div className="stat-card stat-purple">
                        <div className="stat-top">
                            <div className="stat-icon">👑</div>
                            <div className="stat-change positive">+12%</div>
                        </div>
                        <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
                        <div className="stat-label">Total Admins</div>
                        <div className="stat-bar stat-bar-purple"></div>
                    </div>
                    <div className="stat-card stat-orange">
                        <div className="stat-top">
                            <div className="stat-icon">👁</div>
                            <div className="stat-change negative">5%</div>
                        </div>
                        <div className="stat-value">{users.filter(u => !u.full_name).length}</div>
                        <div className="stat-label">Incomplete Profiles</div>
                        <div className="stat-bar stat-bar-orange"></div>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Product Information Settings</h2>
                    <div className="settings-card">
                        <h3>Account Information Message</h3>
                        <p className="settings-description">
                            This message will appear in the "Account Information" section on all product detail pages.
                            Use line breaks to create bullet points.
                        </p>
                        <textarea
                            className="message-textarea"
                            value={accountMessage}
                            onChange={(e) => setAccountMessage(e.target.value)}
                            rows={8}
                            placeholder="Enter account information message...&#10;Example:&#10;✅ Verified and secure account&#10;✅ Instant delivery after payment"
                        />
                        <button
                            className="btn btn-primary save-message-btn"
                            onClick={saveAccountMessage}
                            disabled={savingMessage}
                        >
                            {savingMessage ? 'Saving...' : '💾 Save Message'}
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>🖼️ Banner Management</h2>
                    <div className="settings-card">
                        <h3>Manage Banners ({banners.length}/3 slots filled)</h3>
                        <p className="settings-description">
                            Click on any slot to upload or replace a banner. Maximum 3 banners for the home page carousel.
                        </p>

                        <div className="banners-grid" style={{ marginTop: '2rem' }}>
                            {/* Create exactly 3 slots */}
                            {[0, 1, 2].map((slotIndex) => {
                                const banner = banners[slotIndex];

                                return (
                                    <div key={slotIndex} className={`banner-item-admin ${!banner ? 'banner-empty-slot' : ''}`}>
                                        <div className="banner-slot-number">Slot {slotIndex + 1}</div>

                                        {banner ? (
                                            // Filled slot with banner
                                            <>
                                                <img src={banner.image_url} alt={`Banner ${slotIndex + 1}`} style={{ width: '100%', borderRadius: '8px', marginBottom: '0.75rem' }} />

                                                {/* Banner Link Input */}
                                                <div style={{ marginBottom: '0.75rem' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                                                        🔗 Banner Link (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={banner.link || ''}
                                                        onChange={async (e) => {
                                                            const newLink = e.target.value;
                                                            try {
                                                                const { error } = await supabase
                                                                    .from('banners')
                                                                    .update({ link: newLink || null })
                                                                    .eq('id', banner.id);

                                                                if (error) throw error;

                                                                // Update local state
                                                                setBanners(banners.map(b =>
                                                                    b.id === banner.id ? { ...b, link: newLink || undefined } : b
                                                                ));
                                                            } catch (error: any) {
                                                                console.error('Error updating banner link:', error);
                                                                alert('Failed to update link');
                                                            }
                                                        }}
                                                        placeholder="https://example.com or /shop"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    />
                                                    <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                                        External: https://... | Internal: /shop, /profile
                                                    </small>
                                                </div>

                                                <div className="banner-actions">
                                                    <label className="btn btn-sm btn-primary" style={{ margin: 0, cursor: 'pointer' }}>
                                                        📤 Replace
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) uploadBannerToSlot(file, banner.id);
                                                                e.target.value = '';
                                                            }}
                                                            disabled={uploadingBanner}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                    <button
                                                        onClick={() => toggleBannerStatus(banner.id, banner.active)}
                                                        className={`btn btn-sm ${banner.active ? 'btn-success' : 'btn-secondary'}`}
                                                    >
                                                        {banner.active ? '✅ Active' : '❌ Inactive'}
                                                    </button>
                                                    <button
                                                        onClick={() => deleteBanner(banner.id, banner.image_url)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            // Empty slot
                                            <label className="empty-slot-placeholder" style={{ cursor: 'pointer' }}>
                                                <p>📷</p>
                                                <p>Click to Upload</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) uploadBanner(file);
                                                        e.target.value = '';
                                                    }}
                                                    disabled={uploadingBanner}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {uploadingBanner && (
                            <p style={{ marginTop: '1rem', textAlign: 'center', color: '#10b981' }}>⏳ Uploading banner...</p>
                        )}
                    </div>
                </div>

                <div className="settings-section">
                    <h2>📱 Support & Contact Links</h2>
                    <div className="settings-card">
                        <h3>Floating Support Button Links</h3>
                        <p className="settings-description">
                            Manage WhatsApp and Telegram links for the floating support button.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                                WhatsApp Number (with country code)
                            </label>
                            <input
                                type="text"
                                className="settings-input"
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                                placeholder="+8801234567890"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Format: +8801234567890</small>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                                Telegram Username
                            </label>
                            <input
                                type="text"
                                className="settings-input"
                                value={telegramLink}
                                onChange={(e) => setTelegramLink(e.target.value)}
                                placeholder="your_telegram"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Just the username, without @</small>
                        </div>

                        <h3 style={{ marginTop: '2rem' }}>"আইডি বিক্রি করুন" Button Link</h3>
                        <p className="settings-description">
                            Link for the "Sell Your ID" button on the home page.
                        </p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                                Sell ID Link (WhatsApp or Custom URL)
                            </label>
                            <input
                                type="text"
                                className="settings-input"
                                value={sellIdLink}
                                onChange={(e) => setSellIdLink(e.target.value)}
                                placeholder="https://wa.me/+8801234567890"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>Full URL (e.g., https://wa.me/+8801234567890 or https://t.me/username)</small>
                        </div>

                        <button
                            className="btn btn-primary save-message-btn"
                            onClick={saveSupportLinks}
                            disabled={savingLinks}
                        >
                            {savingLinks ? 'Saving...' : '💾 Save Support Links'}
                        </button>
                    </div>
                </div>

                <div className="users-section">
                    <div className="section-header-admin">
                        <h2>User Management</h2>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by Email, Name, Phone, or Role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users
                                    .filter(u => {
                                        if (!searchQuery.trim()) return true;
                                        const query = searchQuery.toLowerCase();
                                        const email = u.email.toLowerCase();
                                        const name = (u.full_name || '').toLowerCase();
                                        const phone = (u.phone || '').toLowerCase();
                                        const role = u.role.toLowerCase();

                                        return email.includes(query) ||
                                            name.includes(query) ||
                                            phone.includes(query) ||
                                            role.includes(query);
                                    })
                                    .map(u => (
                                        <tr key={u.id}>
                                            <td>{u.email}</td>
                                            <td>{u.full_name || 'Not provided'}</td>
                                            <td>{u.phone || 'Not provided'}</td>
                                            <td>
                                                <span className={`role-badge ${u.role}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                                                        disabled={updating === u.id || u.id === user?.id}
                                                        className="role-select"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="seller">Seller</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    {u.role === 'user' && (
                                                        <button
                                                            onClick={() => updateUserRole(u.id, 'seller')}
                                                            disabled={updating === u.id}
                                                            className="btn btn-sm btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                        >
                                                            Apply Seller
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
