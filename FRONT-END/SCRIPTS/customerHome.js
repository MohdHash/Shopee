import { handleLogout } from "./logoutHeader.js";
import {FIRESTORE_BASE_URL} from "../CONSTANTS/constants.js";



$(document).ready(function(){
    //logging out to remove from local storage
    $('#logoutButton').on('click', function(){
        handleLogout();
    })

    const userDATA = localStorage.getItem('userID'); // Assuming userID is stored on login
    if (!userDATA) {
        window.location.href = "index.html";  // Redirect to login if no user is found
    }

    console.log(localStorage.getItem('userID'));

    $.ajax({
        url: `${FIRESTORE_BASE_URL}/products`,
        method: 'GET',
        success: function(data) {
            data.documents.forEach((doc) => {
                const product = doc.fields;
                const productId = doc.name.split('/').pop();

                const productContainer = $('<div class="product-container"></div>');
                productContainer.append(`
                    <div class="product-image-container">
                        <img class="product-image" src="${product.imageUrl.stringValue}">
                    </div>
                    <div class="product-name limit-text-to-2-lines">${product.title.stringValue}</div>
                    <div class="product-price">₹${product.price.integerValue || product.price.doubleValue}</div>
                    <div class="product-quantity-container">
                        <select class="quantity-selector" data-product-id="${productId}">
                            ${Array.from({ length: product.quantity.integerValue }, (_, i) => `<option class="quantity-option" value="${i + 1}">${i + 1}</option>`).join('')}
                        </select>
                        ${product.quantity.integerValue <= 5 ? `<p class="hurry-up">Hurry up! Only ${product.quantity.integerValue} left!</p>` : ''}
                    </div>
                    <button class="add-to-cart-button button-primary" id="add-to-cart-button" data-product-id="${productId}">
                        Add to Cart
                    </button>
                `);
                $('#productsGrid').append(productContainer);
            });
        },
        error: function(error) {
            console.error("Error fetching products:", error);
        }
    });
    

    //Add to cart functionality:

   $(document).on('click','.add-to-cart-button',function(){
        const productId = $(this).data('product-id');
        console.log($(this).siblings('.quantity-selector'));
        const quantity = $(this).closest('.product-container').find('.quantity-selector').val();

        if (!quantity) {
            alert('Please select a quantity.');
            return;
        }
        console.log(quantity);
        console.log(productId);
        const userID = localStorage.getItem('userID');
        if(!userID){
            alert('Please login to add items to the cart');
            return;
        }

        //Preparing data to send to the firestore.
        const cartItem = {
            mapValue:{
                fields:{
                    productID : {stringValue : productId},
                    quantity : { integerValue : parseInt(quantity)},
                    productName : {stringValue : $(this).closest('.product-container').find('.product-name').text() },
                    imageUrl : { stringValue : $(this).closest('.product-container').find('.product-image').attr('src') },
                    subtotal : { doubleValue : parseFloat(quantity) * parseFloat($(this).closest('.product-container').find('.product-price').text().replace('₹', ''))}
                }
            }
            
        };

        console.log(cartItem);
        //fetching existing cart Items 
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/cart/${userID}`,
            method: 'GET',
            success: function(data) {
                let existingItems = [];
        
                // Check if cart already exists and has items
                if (data.fields && data.fields.items && data.fields.items.arrayValue && data.fields.items.arrayValue.values) {
                    existingItems = data.fields.items.arrayValue.values;
                }
        
                // Append new item to existing items
                existingItems = existingItems || []; // Ensure existingItems is always an array
                existingItems.push(cartItem);
        
                // Update Firestore with the combined array
                $.ajax({
                    url: `${FIRESTORE_BASE_URL}/cart/${userID}`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            items: {
                                arrayValue: {
                                    values: existingItems
                                }
                            }
                        }
                    }),
                    success: function() {
                        alert('Item added to cart!');
                    },
                    error: function(error) {
                        console.error("Error adding to cart:", error);
                    }
                });
            },
            error: function(error) {
                // If no document exists, the user is adding for the first time
                if (error.status === 404) {
                    // Create a new document with the cartItem
                    $.ajax({
                        url: `${FIRESTORE_BASE_URL}/cart/${userID}`,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            fields: {
                                items: {
                                    arrayValue: {
                                        values: [cartItem] // First time: initialize with the first cart item
                                    }
                                }
                            }
                        }),
                        success: function() {
                            alert('Item added to cart for the first time!');
                        },
                        error: function(error) {
                            console.error("Error creating cart for the first time:", error);
                        }
                    });
                } else {
                    console.error("Error fetching existing cart:", error);
                }
            }
        });
        
    });
});