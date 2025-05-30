import {createClient} from '@/lib/supabase/server'
import {NextResponse} from 'next/server'
import {deleteOrder} from "@/lib/orderUtils";
import {hasAllRole, ORDER_CREATE, ORDER_EDIT, ORDER_VIEW} from "@/lib/accessUtil";

export async function GET(request: Request) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || !await hasAllRole(user.email, [ORDER_VIEW])) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const {data, error} = await supabase
        .from('orders')
        .select(`
      id,
      customer_id,
      total_amount,
      user_uid,
      status,
      created_at,
      customer:customer_id (
        name
      ),
      order_items:order_items (
        id,
        product_id,
        quantity,
        price
      )
      `)
        .order('created_at', {ascending: false})

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();


    const {customerId, paymentMethodId, products, total, discount, orderId} = await request.json();

    const requiredRoles = [ORDER_CREATE];

    if (orderId) {
        requiredRoles.push(ORDER_EDIT)
    }

    if (!user || !await hasAllRole(user.email, requiredRoles)) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    try {
        // Insert the order
        const {data: orderData, error: orderError} = await supabase
            .from('orders')
            .insert({
                customer_id: customerId,
                total_amount: total,
                user_uid: user.id,
                discount: discount || 0,
                status: 'completed'
            })
            .select('*, customer:customers(name)')
            .single();

        if (orderError) {
            throw orderError;
        }

        // Insert the order items
        const orderItems = products.map((product: { id: number, quantity: number, price: number }) => ({
            order_id: orderData.id,
            product_id: product.id,
            quantity: product.quantity,
            price: product.price
        }));

        const {error: itemsError} = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // If there's an error inserting order items, delete the order
            await supabase.from('orders').delete().eq('id', orderData.id);
            throw itemsError;
        }

        // Insert the transaction record
        const {data: transactionData, error: transactionError} = await supabase
            .from('transactions')
            .insert({
                order_id: orderData.id,
                payment_method_id: paymentMethodId,
                amount: total,
                user_uid: user.id,
                status: 'completed',
                category: 'selling',
                type: 'income',
                description: `Payment for order #${orderData.id}`
            })

        if (transactionError) {
            // If there's an error inserting the transaction, delete the order and order items
            await supabase.from('order_items').delete().eq('order_id', orderData.id);
            await supabase.from('orders').delete().eq('id', orderData.id);
            throw transactionError;
        } else {
            if (orderId) {
                const response = await deleteOrder(orderId);

                if (response.status !== 200) {
                    await supabase.from('order_items').delete().eq('order_id', orderData.id);
                    await supabase.from('transactions').delete().eq('order_id', orderData.id);
                    await supabase.from('orders').delete().eq('id', orderData.id);
                    throw new Error(response.message);
                }
            }
        }

        return NextResponse.json(orderData);
    } catch (error) {
        return NextResponse.json({error: (error as Error).message}, {status: 500});
    }
}
