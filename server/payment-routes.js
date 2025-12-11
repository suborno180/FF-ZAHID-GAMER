import express from 'express';
import axios from 'axios';
import { supabase } from './index.js';

const router = express.Router();

// ZiniPay Configuration
const ZINIPAY_API_KEY = process.env.ZINIPAY_API_KEY || '';
const ZINIPAY_API_URL = 'https://api.zinipay.com/v1/payment';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log('🔑 ZiniPay Config:', {
    has_api_key: !!ZINIPAY_API_KEY,
    frontend_url: FRONTEND_URL,
    backend_url: BACKEND_URL
});

// Test endpoint
router.get('/test', async (req, res) => {
    try {
        let dbStatus = 'Not configured';
        if (supabase) {
            const { data, error } = await supabase
                .from('products')
                .select('id')
                .limit(1);

            dbStatus = error ? `Error: ${error.message}` : 'Connected ✅';
        }

        res.json({
            success: true,
            message: 'ZiniPay payment routes are working',
            config: {
                has_api_key: !!ZINIPAY_API_KEY,
                frontend_url: FRONTEND_URL,
                backend_url: BACKEND_URL
            },
            database: dbStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initiate Payment
router.post('/initiate', async (req, res) => {
    try {
        const { product_id, amount, customer_email, customer_name, customer_phone, user_id } = req.body;

        console.log(`💳 Initiating ZiniPay payment for product ${product_id}`);
        console.log('Request body:', req.body);

        // Validate required fields
        if (!product_id || !amount || !customer_email || !customer_name || !user_id) {
            throw new Error('Missing required fields: product_id, amount, customer_email, customer_name, user_id');
        }

        if (!ZINIPAY_API_KEY) {
            throw new Error('ZiniPay API key not configured. Please set ZINIPAY_API_KEY in .env');
        }

        // 1. Create Order in Supabase
        let orderId;
        if (supabase) {
            try {
                const order = await createOrder(req.body);
                if (!order || !order.id) {
                    throw new Error('Failed to create order in database');
                }
                orderId = order.id;
            } catch (dbError) {
                console.error('❌ Database error:', dbError);
                throw new Error(`Database error: ${dbError.message}`);
            }
        } else {
            orderId = `temp_${Date.now()}`;
        }

        console.log('Order created with ID:', orderId);

        // 2. Prepare ZiniPay payment data
        const paymentData = {
            cus_name: customer_name,
            cus_email: customer_email,
            amount: amount.toString(),
            redirect_url: `${FRONTEND_URL}/orders?payment=success`,
            cancel_url: `${FRONTEND_URL}/orders?payment=cancelled`,
            webhook_url: `${BACKEND_URL}/api/payment/webhook`,
            metadata: {
                phone: customer_phone || '',
                order_id: orderId,
                product_id: product_id,
                user_id: user_id
            }
        };

        // 3. Call ZiniPay API
        console.log('Calling ZiniPay API...');
        const response = await axios.post(
            `${ZINIPAY_API_URL}/create`,
            paymentData,
            {
                headers: {
                    'zini-api-key': ZINIPAY_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ ZiniPay Response:', response.data);

        if (response.data.status && response.data.payment_url) {
            // Store invoice ID for verification
            if (supabase && response.data.invoiceId) {
                await supabase
                    .from('orders')
                    .update({
                        transaction_id: response.data.invoiceId,
                        payment_status: 'pending'
                    })
                    .eq('id', orderId);
            }

            res.json({
                success: true,
                payment_url: response.data.payment_url,
                order_id: orderId,
                invoice_id: response.data.invoiceId
            });
        } else {
            throw new Error(response.data.message || 'Failed to generate payment URL');
        }

    } catch (error) {
        console.error('❌ Payment Initiation Error:', error);
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to initiate payment'
        });
    }
});

// Verify Payment
router.post('/verify', async (req, res) => {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                error: 'Invoice ID is required'
            });
        }

        console.log('🔍 Verifying payment:', invoiceId);

        const response = await axios.post(
            `${ZINIPAY_API_URL}/verify`,
            { invoiceId },
            {
                headers: {
                    'zini-api-key': ZINIPAY_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Verification Response:', response.data);

        if (response.data.status === 'COMPLETED') {
            // Update order status
            if (supabase && response.data.metadata?.order_id) {
                await updateOrderStatus(response.data.metadata.order_id, 'completed', response.data.transaction_id);
            }

            res.json({
                success: true,
                data: response.data
            });
        } else {
            res.json({
                success: false,
                message: 'Payment not completed',
                data: response.data
            });
        }

    } catch (error) {
        console.error('❌ Verification Error:', error);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

// Webhook Handler
router.post('/webhook', async (req, res) => {
    try {
        console.log('📨 Webhook received:', req.body);

        const { status, invoiceId, metadata, transaction_id } = req.body;

        if (status === 'COMPLETED' && metadata?.order_id) {
            // Update order status
            await updateOrderStatus(metadata.order_id, 'completed', transaction_id || invoiceId);

            console.log('✅ Order updated via webhook:', metadata.order_id);
        } else if (status === 'FAILED' && metadata?.order_id) {
            await updateOrderStatus(metadata.order_id, 'cancelled', null);
        }

        res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('❌ Webhook Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: Create Order
async function createOrder(data) {
    try {
        const { product_id, amount, customer_name, customer_email, customer_phone, user_id } = data;

        console.log('📝 Creating order with data:', { product_id, amount, user_id });

        if (!supabase) {
            throw new Error('Supabase is not configured');
        }

        // Get product and seller info
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('seller_id, title, price')
            .eq('id', product_id)
            .single();

        if (productError || !product) {
            throw new Error(`Product not found: ${productError?.message}`);
        }

        console.log('✅ Product found:', product);

        // Create order
        const orderData = {
            product_id: product_id,
            buyer_id: user_id,
            seller_id: product.seller_id,
            status: 'pending',
            product_price: parseFloat(amount),
            total_price: parseFloat(amount),
            buyer_name: customer_name || 'Customer',
            buyer_phone: customer_phone || '01700000000',
            buyer_whatsapp: customer_phone || '01700000000',
            product_title: product.title || 'Game Account',
            payment_status: 'pending'
        };

        console.log('💾 Inserting order:', orderData);

        const { data: order, error } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (error) {
            console.error('❌ Database Insert Error:', error);
            throw new Error(`Failed to create order: ${error.message}`);
        }

        console.log('✅ Order created successfully:', order);
        return order;
    } catch (error) {
        console.error('❌ createOrder function error:', error);
        throw error;
    }
}

// Helper: Update Order Status
async function updateOrderStatus(orderId, status, transactionId) {
    if (!supabase) return;

    try {
        const updateData = {
            status: status,
            payment_status: status === 'completed' ? 'completed' : status === 'cancelled' ? 'failed' : 'pending'
        };

        if (transactionId) {
            updateData.transaction_id = transactionId;
        }

        await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        // If completed, mark product as sold
        if (status === 'completed') {
            const { data: order } = await supabase
                .from('orders')
                .select('product_id')
                .eq('id', orderId)
                .single();

            if (order) {
                await supabase
                    .from('products')
                    .update({ status: 'sold' })
                    .eq('id', order.product_id);
            }
        }

        console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
        console.error('❌ Error updating order status:', error);
    }
}

export default router;
