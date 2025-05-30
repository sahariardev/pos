import {createClient} from '@/lib/supabase/server'
import {NextResponse} from 'next/server'
import {hasAllRole, hasAnyRole, PRODUCTS_CREATE, PRODUCTS_EDIT} from "@/lib/accessUtil";

export async function PUT(
    request: Request,
    {params}: { params: { productId: string } }
) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || !await hasAllRole(user.email, [PRODUCTS_EDIT])) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const updatedProduct = await request.json();
    const productId = params.productId;

    const {data, error} = await supabase
        .from('products')
        .update({...updatedProduct, user_uid: user.id})
        .eq('id', productId)
        .select()

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    if (data.length === 0) {
        return NextResponse.json({error: 'Product not found or not authorized'}, {status: 404})
    }

    return NextResponse.json(data[0])
}

// export async function DELETE(
//     request: Request,
//     {params}: { params: { productId: string, orderId: string } }
// ) {
//     const supabase = createClient();
//
//     const {data: {user}} = await supabase.auth.getUser();
//
//     if (!user) {
//         return NextResponse.json({error: 'Unauthorized'}, {status: 401})
//     }
//
//     const productId = params.productId;
//     const orderId = params.orderId;
//
//     const {error} = await supabase
//         .from('products')
//         .delete()
//         .eq('id', productId)
//         .eq('user_uid', user.id)
//
//     if (error) {
//         return NextResponse.json({error: error.message}, {status: 500})
//     }
//
//     const orderDelete = await supabase
//         .from('orders')
//         .delete()
//         .eq('id', orderId)
//         .eq('user_uid', user.id)
//
//     if (orderDelete.error) {
//         return NextResponse.json({error: orderDelete.error.message}, {status: 500})
//     }
//
//     return NextResponse.json({message: 'Product and Order deleted successfully'})
// }

