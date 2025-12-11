export interface Order {
    id: string;
    productName: string;
    productLevel: number;
    price: number;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    orderId: string;
}

export interface Order {
    id: string;
    productName: string;
    productLevel: number;
    price: number;
    date: string;
    status: 'pending' | 'completed' | 'cancelled';
    orderId: string;
    user_id?: string;
}

import { supabase } from '../lib/supabase';

export const fetchOrders = async (userId: string) => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    // Map Supabase data to Order interface if needed, or ensure table matches
    return data.map((order: any) => ({
        id: order.id,
        productName: order.product_name,
        productLevel: order.product_level,
        price: order.price,
        date: new Date(order.created_at).toISOString().split('T')[0],
        status: order.status,
        orderId: order.order_id,
        user_id: order.user_id
    })) as Order[];
};

export const createOrder = async (order: Omit<Order, 'id' | 'date'>) => {
    const { data, error } = await supabase
        .from('orders')
        .insert({
            order_id: order.orderId,
            product_name: order.productName,
            product_level: order.productLevel,
            price: order.price,
            status: order.status,
            user_id: order.user_id
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        return null;
    }
    return data;
};
