import { supabase } from '../lib/supabase';

export interface Product {
    id: string;
    title: string;
    level: number;
    diamonds: number;
    skins: number;
    price: number;
    image: string;
    description: string;
    featured: boolean;
    seller_id?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'sold' | 'active';
    created_at?: string;
    images?: string[];
    payment_link?: string | null;
}

export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }
        return (data || []) as Product[];
    } catch (err) {
        console.error('Exception fetching products:', err);
        return [];
    }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching featured products:', error);
            return [];
        }
        return (data || []) as Product[];
    } catch (err) {
        console.error('Exception fetching featured products:', err);
        return [];
    }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
        }
        return data as Product;
    } catch (err) {
        console.error(`Exception fetching product ${id}:`, err);
        return null;
    }
};

