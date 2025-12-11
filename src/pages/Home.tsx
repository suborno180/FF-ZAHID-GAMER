import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Banner from '../components/Banner';
import BecomeSeller from '../components/BecomeSeller';
import './Home.css';

const Home = () => {
    const [banners, setBanners] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            // Fetch Banners from Supabase
            const { data: bannersData } = await supabase
                .from('banners')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: true }); // Slot 1, 2, 3 order

            if (bannersData && bannersData.length > 0) {
                const bannerPaths = bannersData.map(b => b.image_url);
                setBanners(bannerPaths);
            } else {
                // Fallback to static banners from public folder
                const bannerPaths = [
                    '/banner1.png',
                    '/banner2.png',
                    '/banner3.png'
                ];
                setBanners(bannerPaths);
            }
        };
        loadData();
    }, []);

    // Prepare banner slides data
    const bannerSlides = banners.map((banner, index) => {
        return {
            id: `banner-${index + 1}`,
            imageUrl: banner,
            title: `Banner ${index + 1}`
        };
    });

    return (
        <div className="home">
            {/* Banner Component */}
            {bannerSlides.length > 0 && (
                <div className="container" style={{ paddingTop: '1rem' }}>
                    <Banner slides={bannerSlides} />
                </div>
            )}

            {/* Sell to Us Section */}
            <BecomeSeller />
        </div>
    );
};

export default Home;
