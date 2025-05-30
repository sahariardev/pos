import {createClient} from "@/lib/supabase/server";


export async function getAllRoles(email?: string) {
    const supabase = createClient();

    const {data, error} = await supabase
        .from('role')
        .select('*')
        .eq('email', email);


    const availableRoles = data?.map((role) => role.role);

    return availableRoles;
}

export async function hasAllRole(email?: string, roles: string[] = []): Promise<boolean> {
    if (!email || roles.length == 0) {
        return false;
    }

    const supabase = createClient();

    const {data, error} = await supabase
        .from('role')
        .select('*')
        .eq('email', email);

    if (error) {
        return false;
    }

    if (data?.length == 0) {
        return false;
    }

    const availableRoles = data?.map((role) => role.role);

    for (const role of roles) {
        if (!availableRoles?.includes(role)) {
            return false;
        }
    }

    return true;
}

export async function hasAnyRole(email?: string, roles: string[] = []): Promise<boolean> {
    if (!email || roles.length == 0) {
        return false;
    }

    const supabase = createClient();

    const {data, error} = await supabase
        .from('role')
        .select('*')
        .eq('email', email);

    if (error) {
        return false;
    }

    if (data?.length == 0) {
        return false;
    }

    console.log(data);

    const availableRoles = data?.map((role) => role.role);
    console.log("all roles", availableRoles);

    for (const role of roles) {
        if (availableRoles?.includes(role)) {
            return true;
        }
    }

    return false;
}


export const TRANSACTION_VIEW = 'TRANSACTION_VIEW';
export const TRANSACTION_EDIT = 'TRANSACTION_EDIT';
export const TRANSACTION_CREATE = 'TRANSACTION_CREATE';
export const TRANSACTION_DELETE = 'TRANSACTION_DELETE';

export const PRODUCTS_VIEW = 'PRODUCTS_VIEW';
export const PRODUCTS_EDIT = 'PRODUCTS_EDIT';
export const PRODUCTS_CREATE = 'PRODUCTS_CREATE';

export const DASHBOARD_VIEW = 'DASHBOARD_VIEW';

export const ORDER_VIEW = 'ORDER_VIEW';
export const ORDER_EDIT = 'ORDER_EDIT';
export const ORDER_CREATE = 'ORDER_CREATE';
export const ORDER_DELETE = 'ORDER_DELETE';
