// Helper function to download CSV
function downloadCSV(filename, data) {
    const csv = data.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fetch Firestore data using REST API
async function fetchFirestoreData(collection) {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/shopee-cd540/databases/(default)/documents/${collection}?key=AIzaSyAoppniTxOzX0jfxzdWEDHKjnTXpYVkAlQ`);
    const data = await response.json();
    return data.documents ? data.documents : [];
}

// Fetch customer reports
async function fetchCustomerReports(fromDate, toDate) {
    const allCustomers = await fetchFirestoreData("customers");

    const cashPurchases = [];
    const creditPurchases = [];
    const purchases = await fetchFirestoreData("orderHistory");

    // Process customer data
    const allCustomersCSV = ["CustomerID,Name,Email,Mobile,CreditLimit"];
    allCustomers.forEach(customer => {
        const fields = customer.fields;
        allCustomersCSV.push(`${customer.name},${fields.email.stringValue},${fields.mobileNumber.stringValue},${fields.creditLimit.doubleValue}`);
    });

    // Process order data
    purchases.forEach(order => {
        const fields = order.fields;
        
        // Check if fields and date exist
        if (fields && fields.date && fields.date.timestampValue) {
            const orderDate = new Date(fields.date.timestampValue);
            if (orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)) {
                if (fields.items && fields.items.arrayValue && fields.items.arrayValue.values) {
                    fields.items.arrayValue.values.forEach(item => {
                        const itemData = item.mapValue.fields;
                        const orderID = fields.orderID ? fields.orderID.stringValue : null; // Ensure orderID exists
                        if (fields.paymentMethod && fields.paymentMethod.stringValue === 'cash') {
                            cashPurchases.push({ ...itemData, orderID });
                        } else {
                            creditPurchases.push({ ...itemData, orderID });
                        }
                    });
                } else {
                    console.error("Items not found in order:", order);
                }
            }
        } else {
            console.error("Date not found in order:", order);
        }
    });
    

    // Prepare CSV data for purchases
    const cashPurchasesCSV = ["OrderID,ProductID,ProductName,Quantity,Subtotal"];
    cashPurchases.forEach(purchase => {
        cashPurchasesCSV.push(`${purchase.orderID},${purchase.productID.stringValue},${purchase.productName.stringValue},${purchase.quantity.integerValue},${purchase.subtotal.doubleValue}`);
    });

    const creditPurchasesCSV = ["OrderID,ProductID,ProductName,Quantity,Subtotal"];
    creditPurchases.forEach(purchase => {
        creditPurchasesCSV.push(`${purchase.orderID},${purchase.productID.stringValue},${purchase.productName.stringValue},${purchase.quantity.integerValue},${purchase.subtotal.doubleValue}`);
    });

    // Download CSV files
    downloadCSV("all_customers_report.csv", allCustomersCSV);
    downloadCSV("cash_purchases_report.csv", cashPurchasesCSV);
    downloadCSV("credit_purchases_report.csv", creditPurchasesCSV);
}

// Fetch inventory reports
async function fetchInventoryReports() {
    const products = await fetchFirestoreData("products");

    const allProductsCSV = ["ProductID,Title,Description,CategoryID,Price,Quantity,IsActive"];
    const highStockCSV = ["ProductID,Title,Quantity"];
    const lowStockCSV = ["ProductID,Title,Quantity"];

    products.forEach(product => {
        const fields = product.fields;
        const stock = fields.quantity.integerValue;

        allProductsCSV.push(`${product.name},${fields.title.stringValue},${fields.description.stringValue},${fields.categoryID.stringValue},${fields.price.doubleValue},${stock},${fields.isActive.booleanValue}`);
        if (stock > 100) {
            highStockCSV.push(`${product.name},${fields.title.stringValue},${stock}`);
        } else if (stock < 15) {
            lowStockCSV.push(`${product.name},${fields.title.stringValue},${stock}`);
        }
    });

    // Download CSV files
    downloadCSV("current_inventory_report.csv", allProductsCSV);
    downloadCSV("high_stock_inventory_report.csv", highStockCSV);
    downloadCSV("low_stock_inventory_report.csv", lowStockCSV);
}

// Fetch sales reports
async function fetchSalesReports(fromDate, toDate) {
    const orders = await fetchFirestoreData("orderHistory");

    const allSalesCSV = ["OrderID,Date,ProductID,ProductName,Quantity,Subtotal,PaymentMethod,TotalAmount"];
    const cashSalesCSV = ["OrderID,Date,ProductID,ProductName,Quantity,Subtotal,TotalAmount"];
    const creditSalesCSV = ["OrderID,Date,ProductID,ProductName,Quantity,Subtotal,TotalAmount"];
    
    orders.forEach(order => {
        const fields = order.fields;
    
        // Check if fields and date exist
        if (fields && fields.date && fields.date.timestampValue) {
            const orderDate = new Date(fields.date.timestampValue);
    
            // Check if the order date is within the specified range
            if (orderDate >= new Date(fromDate) && orderDate <= new Date(toDate)) {
                if (fields.items && fields.items.arrayValue && fields.items.arrayValue.values) {
                    fields.items.arrayValue.values.forEach(item => {
                        const itemData = item.mapValue.fields;
    
                        // Check if itemData contains expected fields
                        if (itemData && itemData.productID && itemData.productName && itemData.quantity && itemData.subtotal) {
                            const totalAmount = fields.totalAmount ? fields.totalAmount.doubleValue : 0; // Default to 0 if not present
    
                            // Add to all sales
                            allSalesCSV.push(`${fields.orderID.stringValue},${orderDate.toISOString()},${itemData.productID.stringValue},${itemData.productName.stringValue},${itemData.quantity.integerValue},${itemData.subtotal.doubleValue},${fields.paymentMethod.stringValue},${totalAmount}`);
    
                            // Add to cash/credit sales
                            if (fields.paymentMethod && fields.paymentMethod.stringValue === 'cash') {
                                cashSalesCSV.push(`${fields.orderID.stringValue},${orderDate.toISOString()},${itemData.productID.stringValue},${itemData.productName.stringValue},${itemData.quantity.integerValue},${itemData.subtotal.doubleValue},${totalAmount}`);
                            } else {
                                creditSalesCSV.push(`${fields.orderID.stringValue},${orderDate.toISOString()},${itemData.productID.stringValue},${itemData.productName.stringValue},${itemData.quantity.integerValue},${itemData.subtotal.doubleValue},${totalAmount}`);
                            }
                        } else {
                            console.error("Expected item data not found in order:", order);
                        }
                    });
                } else {
                    console.error("Items not found in order:", order);
                }
            }
        } else {
            console.error("Date not found in order:", order);
        }
    });
    

    // Download CSV files
    downloadCSV("all_sales_report.csv", allSalesCSV);
    downloadCSV("cash_sales_report.csv", cashSalesCSV);
    downloadCSV("credit_sales_report.csv", creditSalesCSV);
}

// Event Listeners
$(document).ready(function () {
    $("#generateReportsButton").click(() => {
        const fromDate = $("#fromDate").val();
        const toDate = $("#toDate").val();

        if (fromDate && toDate) {
            fetchCustomerReports(fromDate, toDate);
            fetchInventoryReports();
            fetchSalesReports(fromDate, toDate);
        } else {
            alert("Please select both dates.");
        }
    });

    $("#customerReportButton").click(() => {
        const fromDate = $("#fromDate").val();
        const toDate = $("#toDate").val();
        fetchCustomerReports(fromDate, toDate);
    });

    $("#inventoryReportButton").click(() => {
        fetchInventoryReports();
    });

    $("#salesReportButton").click(() => {
        const fromDate = $("#fromDate").val();
        const toDate = $("#toDate").val();
        fetchSalesReports(fromDate, toDate);
    });
});
