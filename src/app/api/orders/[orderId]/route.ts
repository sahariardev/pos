import {createClient} from '@/lib/supabase/server'
import {NextResponse} from 'next/server'
import {deleteOrder} from "@/lib/orderUtils";
import {hasAllRole, ORDER_DELETE} from "@/lib/accessUtil";

// export async function PUT(
//     request: Request,
//     {params}: { params: { orderId: string } }
// ) {
//     const supabase = createClient();
//
//     const {data: {user}} = await supabase.auth.getUser();
//
//     if (!user) {
//         return NextResponse.json({error: 'Unauthorized'}, {status: 401})
//     }
//
//     const updatedOrder = await request.json();
//     const orderId = params.orderId;
//
//     const {data, error} = await supabase
//         .from('orders')
//         .update({...updatedOrder, user_uid: user.id})
//         .eq('id', orderId)
//         .single()
//
//     if (error) {
//         return NextResponse.json({error: error.message}, {status: 500})
//     }
//
//     if (!data) {
//         return NextResponse.json({error: 'Order not found or not authorized'}, {status: 404})
//     }
//
//     return NextResponse.json({})
// }

export async function DELETE(
    request: Request,
    {params}: { params: { orderId: string } }
) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || !await hasAllRole(user.email, [ORDER_DELETE])) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const orderId = params.orderId;

    const response = await deleteOrder(orderId);

    if (response.status !== 200) {
        return NextResponse.json({error: response.message}, {status: response.status})
    }

    return NextResponse.json({message: response.message})
}
