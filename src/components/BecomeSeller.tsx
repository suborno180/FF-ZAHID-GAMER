import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, ShoppingCart, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './BecomeSeller.css';

interface CardProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: React.ElementType;
    buttonText: string;
    bgColorClass: string;
}

const Card = ({ title, description, onClick, icon: Icon, buttonText, bgColorClass }: CardProps) => (
    <div
        className="seller-card"
        onClick={onClick}
    >
        <div className="flex flex-col h-full">
            <div className={`seller-icon-wrapper ${bgColorClass}`}>
                <Icon className="seller-icon" />
            </div>

            <h3 className="seller-card-title">
                {title}
            </h3>

            <p className="seller-card-description">
                {description}
            </p>

            <button className={`seller-card-button ${bgColorClass}`}>
                <span className="btn-content">
                    {buttonText}
                    <ArrowRight className="btn-arrow" />
                </span>
            </button>
        </div>
    </div>
);

export function BecomeSeller() {
    const navigate = useNavigate();
    const [sellIdLink, setSellIdLink] = useState('https://wa.me/+8801234567890');

    useEffect(() => {
        fetchSellIdLink();
    }, []);

    const fetchSellIdLink = async () => {
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'sell_id_link')
                .maybeSingle();

            if (data?.value) setSellIdLink(data.value);
        } catch (error) {
            console.error('Error fetching sell ID link:', error);
        }
    };

    const handleSellToUs = () => {
        // Open the custom link set by admin
        window.open(sellIdLink, '_blank');
    };

    return (
        <section className="become-seller-section">
            <div className="seller-container">
                <div className="seller-header">
                    <h2 className="seller-title">
                        Explore Your Options
                    </h2>
                    <p className="seller-subtitle">
                        Browse premium accounts or sell your own
                    </p>
                </div>

                <div className="seller-grid">
                    <Card
                        title="আইডি কিনুন"
                        description="Discover verified premium game accounts"
                        onClick={() => navigate('/shop')}
                        icon={ShoppingCart}
                        buttonText="Buy Now"
                        bgColorClass="bg-blue"
                    />
                    <Card
                        title="আইডি বিক্রি করুন"
                        description="Turn your accounts into cash"
                        onClick={handleSellToUs}
                        icon={Handshake}
                        buttonText="Sell Now"
                        bgColorClass="bg-green"
                    />
                </div>
            </div>
        </section>
    );
}

export default BecomeSeller;
