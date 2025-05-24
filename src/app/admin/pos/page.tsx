"use client";

import React, {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Combobox} from "@/components/ui/combobox";
import {Button} from "@/components/ui/button";
import {FilePenIcon, PrinterIcon} from "lucide-react";
import {formatDate} from "@/lib/utils";

type Product = {
    id: number;
    name: string;
    price: number;
};

type Customer = {
    id: number;
    name: string;
};

type PaymentMethod = {
    id: number;
    name: string;
};

interface POSProduct extends Product {
    quantity: number;
}

type OrderItem = {
    id: number;
    product_id: number;
    quantity: number;
    product: Product;
    price: number;
};

type Order = {
    id: number;
    customer_id: number;
    total_amount: number;
    status: "completed" | "pending" | "cancelled";
    created_at: string;
    discount: number;
    order_items: OrderItem[],
    customer: {
        name: string;
    };
};

export default function POSPage() {
    const [discount, setDiscount] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<POSProduct[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders/lastFew");
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/products");
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch("/api/customers");
            if (!response.ok) throw new Error("Failed to fetch customers");
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const response = await fetch("/api/payment-methods");
            if (!response.ok) throw new Error("Failed to fetch payment methods");
            const data = await response.json();
            setPaymentMethods(data);
            setPaymentMethod(data.filter((d: any) => d.name === 'Cash')[0]);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
        }
    };

    const handleSelectProduct = (productId: number | string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;
        if (selectedProducts.some((p) => p.id === productId)) {
            setSelectedProducts(
                selectedProducts.map((p) =>
                    p.id === productId ? {...p, quantity: p.quantity + 1} : p
                )
            );
        } else {
            setSelectedProducts([...selectedProducts, {...product, quantity: 1}]);
        }
    };

    const handleSelectCustomer = (customerId: number | string) => {
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
        }
    };

    const handleSelectPaymentMethod = (paymentMethodId: number | string) => {
        const method = paymentMethods.find((pm) => pm.id === paymentMethodId);
        if (method) {
            setPaymentMethod(method);
        }
    };

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        setSelectedProducts(
            selectedProducts.map((p) =>
                p.id === productId ? {...p, quantity: newQuantity} : p
            )
        );
    };

    const handleRemoveProduct = (productId: number) => {
        setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    };

    const total = selectedProducts.reduce(
        (sum, product) => sum + product.price * (product.quantity || 1),
        0
    );

    const handleCreateOrder = async () => {
        if (!selectedCustomer || !paymentMethod || selectedProducts.length === 0) {
            return;
        }

        const formData = selectedProducts.map(p => ({id: p.id, quantity: p.quantity, price: p.price}));
        const items = selectedProducts.map(p => ({name: p.name, quantity: p.quantity, price: p.price}));
        console.log(items);

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customerId: selectedCustomer.id,
                    paymentMethodId: paymentMethod.id,
                    products: formData,
                    total: getTotal(total, discount),
                    discount: discount,
                }),
            });

            if (!response.ok) throw new Error("Failed to create order");

            const order = await response.json();

            console.log(order);

            // Reset the form
            setSelectedProducts([]);
            setDiscount(0);
            fetchOrders();
            //print pdf

            generateAndOpenPDF({
                items: selectedProducts.map(p => ({name: p.name, quantity: p.quantity, price: p.price})),
                total: order.total_amount,
                orderId: order.id,
                discount: order.discount,
                subtotal: total,
                time: order.created_at,
            });

        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const getOrderInfo = (order: Order) => {
        const data = order.order_items.map(p => `${p.product.name} X ${p.price} X ${p.quantity}`);
        return data.join(', ');
    }
    const getTotal = (subTotal: number, discount: number) => {
        return subTotal - (subTotal * discount) / 100;
    }

    const generateAndOpenPDF = async (data: any) => {
        const {pdf} = await import('@react-pdf/renderer');
        const {ReceiptPDF} = await import('./ReceiptPDF'); // adjust path if needed

        console.log(data);
        const blob = await pdf(
            <ReceiptPDF
                items={data.items}
                total={data.total}
                orderId={data.orderId}
                discount={data.discount}
                subtotal={data.subtotal}
                time={data.time}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Sale Details</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1">
                        <Combobox
                            items={customers}
                            placeholder="Select Customer"
                            onSelect={handleSelectCustomer}
                        />
                    </div>
                    <div className="flex-1">
                        <Combobox
                            items={paymentMethods}
                            placeholder="Select Payment Method"
                            onSelect={handleSelectPaymentMethod}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                    <Combobox
                        items={products}
                        placeholder="Select Product"
                        noSelect
                        onSelect={handleSelectProduct}
                        className="!mt-5"
                    />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <input
                                            type="number"
                                            min="1"
                                            value={product.quantity || 1}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    product.id,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            className="w-16 p-1 border rounded"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {((product.quantity || 1) * product.price).toFixed(2)} BDT
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 text-right">
                        <div className="mt-2"><strong>Subtotal Total: {total.toFixed(2)} BDT</strong></div>
                        <div className="mt-2"><strong>Discount : <input
                            type="number"
                            min="0"
                            value={discount || 0}
                            onChange={(e) =>
                                setDiscount(parseInt(e.target.value))
                            }
                            className="w-16 p-1 border rounded"
                        /> </strong></div>
                        <div className="mt-2"><strong>Total: {getTotal(total, discount).toFixed(2)} BDT</strong></div>
                    </div>
                    <div className="mt-4">
                        <Button onClick={handleCreateOrder}
                                disabled={selectedProducts.length === 0 || !selectedCustomer || !paymentMethod}>
                            Create Order
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Last Five Orders</CardTitle>
                </CardHeader>
                <CardContent className="gap-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Order Info</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>{getOrderInfo(order)}</TableCell>
                                        <TableCell>{order.total_amount.toFixed(2)} BDT</TableCell>
                                        <TableCell>{formatDate(order.created_at)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {

                                                    }}
                                                >
                                                    <FilePenIcon className="w-4 h-4"/>
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        const subtotal = (order.total_amount) / (1 - (order.discount / 100));
                                                        generateAndOpenPDF({
                                                            items: order.order_items.map(p => ({
                                                                name: p.product.name,
                                                                quantity: p.quantity,
                                                                price: p.price
                                                            })),
                                                            total: order.total_amount,
                                                            orderId: order.id,
                                                            discount: order.discount,
                                                            subtotal: subtotal,
                                                            time: order.created_at,
                                                        });
                                                    }}
                                                >
                                                    <PrinterIcon className="w-4 h-4"/>
                                                    <span className="sr-only">Print</span>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
