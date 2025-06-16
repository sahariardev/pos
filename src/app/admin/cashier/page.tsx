"use client";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {EllipsisVerticalIcon, Loader2Icon} from "lucide-react";
import {useEffect, useState} from "react";
import {cn, formatDate} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarIcon} from "@radix-ui/react-icons";
import {format} from "date-fns";
import {Label} from "@/components/ui/label";

type TransactionType = "income" | "expense";


interface Transaction {
    id: number;
    description: string;
    type: TransactionType;
    category: string;
    created_at: string;
    amount: number;
    status: string;
}

function addDays(date: Date, days: number) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

export default function Cashier() {
    const [dateFrom, setDateFrom] = useState<Date>();
    const [dateTo, setDateTo] = useState<Date>();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filtertedTransaction, setFilteredTransaction] = useState<Transaction[]>([]);
    const [filteredTransactionType, setFilteredTransactionType] = useState<String>("all");
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState(false);
    const [transactionToDelete, setTransactionToDelete] =
        useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
        description: "",
        category: "",
        type: "income",
        amount: 0,
        status: "completed",
        created_at: new Date().toISOString(),
    });

    const [updatedTransaction, setUpdatedTransaction] = useState<Partial<Transaction>>({
        id: 0,
        description: "",
        category: "",
        type: "income",
        amount: 0,
        status: "completed",
        created_at: new Date().toISOString(),
    });

    const [updatedTransactionDate, setUpdatedTransactionDate] = useState<Date | undefined>(new Date());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewTransaction((prev) => ({...prev, [name]: value}));
    };

    const handleInputChangeForUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setUpdatedTransaction((prev) => ({...prev, [name]: value}));
    };

    const handleClearFilter = () => {
        setDateFrom(undefined);
        setDateTo(undefined);
        setFilteredTransaction(transactions);
    };

    const handleFilter = () => {
        let filteredData = transactions;

        if (dateFrom && dateTo) {
            filteredData = filteredData.filter((transaction) => {
                const transactionDate = new Date(transaction.created_at);
                return (
                    transactionDate >= dateFrom && transactionDate < addDays(dateTo, 1)
                );
            });
        }

        if (filteredTransactionType !== "all") {
            filteredData = filteredData.filter((transaction) => {
                return transaction.type === filteredTransactionType;
            });
        }

        setFilteredTransaction(filteredData);
    };

    const handleAddTransaction = async () => {
        try {

            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    description: newTransaction.description,
                    category: newTransaction.category,
                    type: newTransaction.type,
                    amount: newTransaction.amount,
                    status: newTransaction.status,
                    created_at: transactionDate?.toLocaleString(),
                }),
            });

            if (response.ok) {
                const addedTransaction = await response.json();
                setTransactions((prev) => [...prev, addedTransaction]);
                setFilteredTransaction((prev) => [...prev, addedTransaction]);
                setNewTransaction({
                    description: "",
                    category: "",
                    type: newTransaction.type,
                    amount: 0,
                    status: "completed",
                    created_at: new Date().toISOString(),
                });

            } else {
                console.error("Failed to add transaction");
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    const handleUpdateTransaction = async () => {
        try {

            const response = await fetch(`/api/transactions/${updatedTransaction.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: updatedTransaction.id,
                    description: updatedTransaction.description,
                    category: updatedTransaction.category,
                    type: updatedTransaction.type,
                    amount: updatedTransaction.amount,
                    status: updatedTransaction.status,
                    created_at: updatedTransactionDate?.toLocaleString(),
                })
            });

            if (response.ok) {
                setUpdatedTransaction({
                    id: 0,
                    description: "",
                    category: "",
                    type: updatedTransaction.type,
                    amount: 0,
                    status: "completed",
                    created_at: new Date().toISOString(),
                });
                setLoading(true);
                fetchTransactions();

            } else {
                console.error("Failed to add transaction");
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        }

        setEditDialogOpen(false);
    }


    const handleDeleteTransaction = async () => {
        try {
            const response = await fetch(`/api/transactions/${transactionToDelete?.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                setLoading(true);
                fetchTransactions();
            } else {
                console.error("Error deleting transaction:");
            }

        } catch (error) {
            console.error("Error deleting transaction:", error);
        }


        setIsDeleteConfirmationOpen(false)
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await fetch("/api/transactions");
            if (!response.ok) {
                throw new Error("Failed to fetch transactions");
            }
            const data = await response.json();
            setTransactions(data);
            setFilteredTransaction(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    function exportToCSV() {
        const filename = 'transaction.csv'
        const header = 'Transaction ID,Category,Description,Amount,Status,Date';

        const pritableItems = [];
        for (const transaction of filtertedTransaction) {

            const printTableItem = {
                transactionId: transaction.id,
                category: transaction.category,
                description: transaction.description,
                amount: transaction.amount,
                status: transaction.status,
                date: formatDate(transaction.created_at)
            }

            pritableItems.push(printTableItem);
        }

        const csvRows = pritableItems.map(row => Object.values(row).join(','));
        const csvString = `${header}\n${csvRows.join('\n')}`;

        const blob = new Blob([csvString], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2Icon className="mx-auto h-12 w-12 animate-spin"/>
            </div>
        );
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>

                        <div>
                            Cashier Transactions
                        </div>

                    </CardTitle>
                    <CardDescription>Manage your cashier transactions.</CardDescription>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateFrom && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon/>
                                {dateFrom ? format(dateFrom, "PPP") : <span>From date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateTo && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon/>
                                {dateTo ? format(dateTo, "PPP") : <span>From date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="w-[240px]">
                        <Select
                            defaultValue="all"
                            onValueChange={(value) =>
                                setFilteredTransactionType(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Theme"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="all">All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button className="w-24" size="sm" onClick={handleFilter}>
                        Filter
                    </Button>

                    <Button className="w-24" size="sm" onClick={handleClearFilter}>
                        Clear Filter
                    </Button>


                    <Button className="w-24" size="sm" onClick={() => exportToCSV()}>
                        Export
                    </Button>

                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead></TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtertedTransaction.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>{transaction.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={transaction.type}>{transaction.type}</Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                    <TableCell>{transaction.amount.toFixed(2)} BDT</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                transaction.status === "completed"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    aria-haspopup="true"
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <EllipsisVerticalIcon className="h-4 w-4"/>
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setUpdatedTransaction({
                                                        id: transaction.id,
                                                        description: transaction.description,
                                                        category: transaction.category,
                                                        type: transaction.type,
                                                        amount: transaction.amount,
                                                        status: transaction.status,
                                                        created_at: transaction.created_at
                                                    });

                                                    setUpdatedTransactionDate(new Date(transaction.created_at));

                                                    setEditDialogOpen(true);
                                                }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setTransactionToDelete(transaction);
                                                        setIsDeleteConfirmationOpen(true);
                                                    }}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell>New</TableCell>
                                <TableCell>
                                    <Input
                                        name="description"
                                        value={newTransaction.description}
                                        onChange={handleInputChange}
                                        placeholder="Description"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        name="category"
                                        value={newTransaction.category}
                                        onChange={handleInputChange}
                                        placeholder="Category"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={newTransaction.type}
                                        onValueChange={(value) =>
                                            setNewTransaction({
                                                ...newTransaction,
                                                type: value as TransactionType,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Theme"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal",
                                                    !transactionDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon/>
                                                {transactionDate ? format(transactionDate, "PPP") :
                                                    <span>Select Date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={transactionDate}
                                                onSelect={setTransactionDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        name="amount"
                                        type="number"
                                        value={newTransaction.amount}
                                        onChange={handleInputChange}
                                        placeholder="Amount"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={newTransaction.status}
                                        onValueChange={(value) =>
                                            setNewTransaction({
                                                ...newTransaction,
                                                status: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button onClick={handleAddTransaction}>Add</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                {/* Remove card footer */}
            </Card>
            <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditDialogOpen(false);
                        //clear form
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit transaction
                        </DialogTitle>
                        <DialogDescription>
                            Edit Transaction
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                value={updatedTransaction.description}
                                onChange={handleInputChangeForUpdate}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Category
                            </Label>
                            <Input
                                id="category"
                                name="category"
                                value={newTransaction.category}
                                onChange={handleInputChange}
                                placeholder="Category"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                defaultValue={updatedTransaction.type}
                                onValueChange={(value) =>
                                    setUpdatedTransaction({
                                        ...updatedTransaction,
                                        type: value as TransactionType,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Theme"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !updatedTransactionDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon/>
                                        {updatedTransactionDate ? format(updatedTransactionDate, "PPP") :
                                            <span>Select Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={updatedTransactionDate}
                                        onSelect={setUpdatedTransactionDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                value={updatedTransaction.amount}
                                onChange={handleInputChangeForUpdate}
                                type="number"
                                placeholder="Amopunt"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                defaultValue={updatedTransaction.status}
                                onValueChange={(value) =>
                                    setUpdatedTransaction({
                                        ...updatedTransaction,
                                        status: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleUpdateTransaction}
                        >
                            Update Transaction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={isDeleteConfirmationOpen}
                onOpenChange={setIsDeleteConfirmationOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this transaction? This action cannot
                            be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteConfirmationOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTransaction}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
