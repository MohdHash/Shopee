import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js"; // Adjust your import as necessary

$(document).ready(function () {
    const userID = localStorage.getItem('userID');

    // Open the payment modal when the checkout button is clicked
    $('#checkoutButton').on('click', function () {
        $('#paymentModal').show();
    });

    // Close the modal
    $('.close').on('click', function () {
        $('#paymentModal').hide();
    });

    // Payment option buttons
    $('.payment-option').on('click', function () {
        const paymentMethod = $(this).attr('id').replace('Option', '').toLowerCase();
        $('#paymentModal').hide();
        proceedToCheckout(paymentMethod);
    });

    function proceedToCheckout(paymentMethod) {
        // Show loading indicator
        $('#loadingIndicator').show();
        
        // Collect order details
        let orderItems = [];
        let totalAmount = 0;
    
        $('.cart-item').each(function () {
            const productId = $(this).find('.quantity-input').data('product-id');
            const quantity = parseInt($(this).find('.quantity-input').val());
            const subtotal = parseFloat($(this).find('.subtotal').text());
            
            const productName = $(this).find('div').first().text();  // Select the first <div> inside cart-item

        console.log('Product Name:', productName);  // Debugging // Debugging

            orderItems.push({
                mapValue: {
                    fields: {
                        productID: { stringValue: productId },
                        productName: { stringValue: productName},
                        quantity: { integerValue: quantity },
                        subtotal: { doubleValue: subtotal }
                    }
                }
            });
            totalAmount += subtotal;
        });
    
        // Check user's credit value if using credit payment
        if (paymentMethod === 'credit' && totalAmount > userID.creditValue) {
            alert('Insufficient credit value!');
            $('#loadingIndicator').hide();
            return;
        }
    
        // Process Order
        const orderID = `order_${Date.now()}`;
        const orderData = {
            mapValue: {
                fields: {
                    orderID: { stringValue: orderID },
                    date: { timestampValue: new Date().toISOString() },  // Firestore expects ISO timestamp format
                    totalAmount: { doubleValue: totalAmount },
                    paymentMethod: { stringValue: paymentMethod },
                    items: { arrayValue: { values: orderItems } }
                }
            }
        };
    
        // Add order to Firestore Order History
        // Step 1: Fetch existing order history for the user
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/orderHistory/${userID}`,
            method: 'GET',
            success: function (data) {
                // Check if order history exists
                let orders = [];
                if (data && data.fields && data.fields.orders && data.fields.orders.arrayValue && data.fields.orders.arrayValue.values) {
                    orders = data.fields.orders.arrayValue.values;
                }
    
                // Add new order to the orders array
                orders.push(orderData);
    
                const updatedData = {
                    fields: {
                        orders: {
                            arrayValue: {
                                values: orders
                            }
                        }
                    }
                };
    
                // Step 2: Update Order History
                $.ajax({
                    url: `${FIRESTORE_BASE_URL}/orderHistory/${userID}`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify(updatedData),
                    success: function () {
                        // Reduce stock in Products collection
                        updateProductStock(orderItems);
                    },
                    error: function (error) {
                        console.log(error.responseText);
                        $('#loadingIndicator').hide();
                    }
                });
            },
            error: function (error) {
                if (error.status === 404) {
                    // User does not exist, create new order history document
                    const initialData = {
                        fields: {
                            orders: {
                                arrayValue: {
                                    values: [orderData]
                                }
                            }
                        }
                    };
    
                    // Step 3: Create new order history document
                    $.ajax({
                        url: `${FIRESTORE_BASE_URL}/orderHistory/${userID}`,
                        method: 'PATCH',  // Use PUT to create a new document
                        contentType: 'application/json',
                        data: JSON.stringify(initialData),
                        success: function () {
                            // Reduce stock in Products collection
                            updateProductStock(orderItems);
                        },
                        error: function (error) {
                            alert("Error creating order history: " + error.responseText);
                            $('#loadingIndicator').hide();
                        }
                    });
                } else {
                    alert("Error fetching order history: " + error.responseText);
                    $('#loadingIndicator').hide();
                }
            }
        });
    }
    

    function updateProductStock(orderItems) {
        let pendingUpdates = orderItems.length;
        
        orderItems.forEach(item => {
            console.log(item);
            $.ajax({
                url: `${FIRESTORE_BASE_URL}/products/${item.mapValue.fields.productID.stringValue}`,
                method: 'GET',
                success: function (productData) {
                    const updatedQuantity = productData.fields.quantity.integerValue - item.mapValue.fields.quantity.integerValue;

                    // Update Product stock
                    $.ajax({
                        url: `${FIRESTORE_BASE_URL}/products/${item.mapValue.fields.productID.stringValue}?updateMask.fieldPaths=quantity`,
                        method: 'PATCH',
                        contentType: 'application/json',
                        data: JSON.stringify({ fields: { quantity: { integerValue: updatedQuantity } } }),
                        success: function () {
                            // Check if all updates are done
                            pendingUpdates--;
                            if (pendingUpdates === 0) {
                                // After updating all stock, delete cart items
                                clearCartItems(userID);
                            }
                        },
                        error: function (error) {
                            alert("Error updating product stock: " + error.responseText);
                            $('#loadingIndicator').hide();
                        }
                    });
                    
                },
                error: function (error) {
                    console.log(error.responseText);
                    $('#loadingIndicator').hide();
                }
            });
        });
    }


    function clearCartItems(userID) {
        const updatedCartData = {
            fields: {
                items: {
                    arrayValue: {
                        values: []
                    }
                }
            }
        };
    
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/cart/${userID}`,
            method: 'PATCH',  // Use PATCH to update the document
            contentType: 'application/json',
            data: JSON.stringify(updatedCartData),
            success: function () {
                alert('Cart cleared successfully!');
                $('#loadingIndicator').hide();
            },
            error: function (error) {
                alert("Error clearing cart: " + error.responseText);
                $('#loadingIndicator').hide();
            }
        });
    }
    
    
});