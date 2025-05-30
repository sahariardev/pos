import {createClient} from '@/lib/supabase/server'
import {NextResponse} from 'next/server'
import {hasAllRole, TRANSACTION_DELETE, TRANSACTION_EDIT} from "@/lib/accessUtil";

export async function PUT(
    request: Request,
    {params}: { params: { transactionId: string } }
) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || !await hasAllRole(user.email, [TRANSACTION_EDIT])) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const updatedTransaction = await request.json();
    const transactionId = params.transactionId;

    console.log(updatedTransaction);

    const {data, error} = await supabase
        .from('transactions')
        .update({...updatedTransaction, user_uid: user.id})
        .eq('id', transactionId)
        .select()

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    if (data.length === 0) {
        return NextResponse.json({error: 'Transaction not found or not authorized'}, {status: 404})
    }

    return NextResponse.json({})
}

export async function DELETE(
    request: Request,
    {params}: { params: { transactionId: string } }
) {
    const supabase = createClient();

    const {data: {user}} = await supabase.auth.getUser();

    if (!user || !await hasAllRole(user.email, [TRANSACTION_DELETE])) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const transactionId = params.transactionId;

    const {error} = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json({message: 'Transaction deleted successfully'})
}
