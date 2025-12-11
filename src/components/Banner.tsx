import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Banner.css';

interface BannerSlide {
    id: string;
    imageUrl: string;
    title: string;
    link?: string; // Optional link for the banner
}

interface BannerProps {
    slides: BannerSlide[];
}

const Banner = ({ slides }: BannerProps) => {
    const [current, setCurrent] = useState(0);

    // Auto-play with loop
    useEffect(() => {
        if (slides.length === 0) return;

        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const scrollTo = useCallback((index: number) => {
        setCurrent(index);
    }, []);

    const goToPrevious = () => {
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToNext = () => {
        setCurrent((prev) => (prev + 1) % slides.length);
    };

    const handleBannerClick = (link?: string) => {
        if (link) {
            // Check if it's an external link
            if (link.startsWith('http://') || link.startsWith('https://')) {
                window.open(link, '_blank', 'noopener,noreferrer');
            } else {
                // Internal link
                window.location.href = link;
            }
        }
    };

    if (slides.length === 0) return null;

    return (
        <section className="banner-section">
            <div className="banner-container">
                {/* Slides */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`banner-slide ${index === current ? 'active' : ''} ${slide.link ? 'clickable' : ''}`}
                        onClick={() => handleBannerClick(slide.link)}
                    >
                        <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="banner-image"
                        />
                        <div className="banner-overlay" />
                        {slide.link && (
                            <div className="banner-link-indicator">
                                🔗 Click to visit
                            </div>
                        )}
                    </div>
                ))}

                {/* Previous Button */}
                <button
                    className="banner-btn banner-prev"
                    onClick={goToPrevious}
                    aria-label="Previous"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Next Button */}
                <button
                    className="banner-btn banner-next"
                    onClick={goToNext}
                    aria-label="Next"
                >
                    <ChevronRight size={20} />
                </button>

                {/* Dots */}
                <div className="banner-dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`dot ${current === i ? 'active' : ''}`}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Banner;
