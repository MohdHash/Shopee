import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";

const userID = localStorage.getItem('userID');

if(!userID){
    alert('Please log in to view your container');
}else{
    $.ajax({
        url: `${FIRESTORE_BASE_URL}/cart/${userID}`,
        method: 'GET',
        success : function(data){
            if (data.fields && data.fields.items) {
                let total = 0;

                data.fields.items.arrayValue.values.forEach((item) => {
                    const cartItem = item.mapValue.fields;

                    const cartItemDiv = $(`
                        <div class="cart-item">
                            <img src="${cartItem.imageUrl.stringValue}" alt="${cartItem.productName.stringValue}">
                            <div>${cartItem.productName.stringValue}</div>
                            <div>Quantity: <input type="number" class="quantity-input" value="${cartItem.quantity.integerValue}" min="1" data-product-id="${cartItem.productID.stringValue}"></div>
                            <div>Subtotal: $<span class="subtotal">${cartItem.subtotal.doubleValue.toFixed(2)}</span></div>
                        </div>
                    `);

                    $('#cartItems').append(cartItemDiv);
                    total += cartItem.subtotal.doubleValue;
                });

                $('#totalPrice').text(`Total: $${total.toFixed(2)}`);
            }
        },
        error: function(error){
            console.error("Error fetching cart items:", error);
        }
    });

    $(document).on('input', '.quantity-input', function () {
        const productId = $(this).data('product-id');
        const quantityInput = $(this);
        const newQuantity = parseInt($(this).val());

        // Fetch product stock from Firestore
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/products/${productId}`,
            method: 'GET',
            success: function (productData) {
                const stockLeft = productData.fields.quantity.integerValue;
                const pricePerItem = (productData.fields.price.doubleValue || productData.fields.price.integerValue);

                if (newQuantity > stockLeft) {
                    alert('Quantity exceeds available stock!');
                    quantityInput.val(stockLeft); // Set quantity to max available stock
                } else {
                    // Update subtotal dynamically
                    const newSubtotal = pricePerItem * newQuantity;
                    quantityInput.closest('.cart-item').find('.subtotal').text(newSubtotal.toFixed(2));

                    // Recalculate total price
                    let newTotal = 0;
                    $('.subtotal').each(function () {
                        newTotal += parseFloat($(this).text());
                    });
                    $('#totalPrice').text(`Total: $${newTotal.toFixed(2)}`);
                }
            },
            error: function (error) {
                console.error("Error fetching product stock:", error);
            }
        });
    }); 
}


