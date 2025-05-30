import {createClient} from "@/lib/supabase/server";

export async function deleteOrder(orderId: string) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return {
            status: 401,
            message: 'Unauthorized',
        };
    }

    const order = await getOrder(orderId);

    if (!order) {
        return {
            status: 500,
            message: 'Order Not Found',
        };
    }

    const orderDataStr = JSON.stringify(order);

    const {data: backupData, error: backupError} = await supabase
        .from('backups')
        .insert({
            old_body: orderDataStr,
            user_uid: user.id,
            record_type: 'order'
        })
        .single();

    if (backupError) {
        return {
            status: 500,
            message: 'Cannot Not Backup order Data',
        };
    }

    const {error: orderItemsError} = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

    if (orderItemsError) {
        return {
            status: 500,
            message: orderItemsError.message
        };

    }

    const {error: transactionDeleteError} = await supabase
        .from('transactions')
        .delete()
        .eq('order_id', orderId);

    if (transactionDeleteError) {
        return {
            status: 500,
            message: transactionDeleteError.message,
        };
    }

    const {error: orderError} = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

    if (orderError) {
        return {
            status: 500,
            message: orderError.message,
        };
    }

    return {
        status: 200,
        message: 'Order and related items deleted successfully',
    };
}

async function getOrder(orderId: string) {
    const supabase = createClient();

    console.log(orderId);

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
        .eq('id', orderId).single();

    if (error) {
        return null
    }

    return data;
}