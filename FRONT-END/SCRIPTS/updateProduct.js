import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";

$(document).ready(function(){
    fetchCategories();

    $('#categorySelect').on('change', function() {
        var categoryID = $(this).val().split('/').pop();
        console.log(categoryID);
        $('#productList').empty(); // Clear the previous products list

        $.ajax({
            url: `${FIRESTORE_BASE_URL}/products`,
            method: 'GET',
            success: function(response) {
                var products = response.documents;
                products.forEach(function(product) {
                    var categoryRef = product.fields.categoryID.referenceValue;
                    var categoryDocID = categoryRef.split('/').pop();
                    if (categoryDocID == categoryID) {
                        var productID = product.name.split('/').pop();  // Get product ID
                        var productTitle = product.fields.title.stringValue;
                        var isActive = product.fields.isActive.booleanValue;


                        $('#productList').append(`
                            <div>
                                <strong>${productTitle}</strong> - ${isActive === true ? 'available' : 'disabled'}
                                <button class="editButton" data-id="${productID}" data-title="${productTitle}" data-description="${product.fields.description.stringValue}" data-stock="${product.fields.quantity.integerValue}" data-price="${product.fields.price.integerValue}">Edit</button>
                                <button class="toggleStatusButton" data-id="${productID}" data-status="${isActive}">${isActive === true ? 'Deactivate' : 'Activate'}</button>
                            </div><br>
                        `);
                    }
                });
            },
            error: function(error) {
                console.log('Error fetching products: ', error);
            }
        });
    });

    //handle edit button click:
    $(document).on('click','.editButton',function(){
        var productID = $(this).data('id');
        var title = $(this).data('title');
        var description = $(this).data('description');
        var stock = $(this).data('stock');
        var price = $(this).data('price');

        $('#productID').val(productID);
        $('#editTitle').val(title);
        $('#editDescription').val(description);
        $('#editPrice').val(price);
        $('#editStock').val(stock);

        $('#editProductForm').show();

        // handleUpdate(productID);
    });

    $('#updateProductForm').on('submit', function(event) {
        event.preventDefault();

        var productID = $('#productID').val();
        console.log(productID);

        // Build the updatedProduct object with validated fields
        const updatedProduct = {};
        const updateMask = [];

        // Collect and validate the title field
        var title = $('#editTitle').val();
        if (title && title.trim() !== '') {
            updatedProduct['title'] = { stringValue: title };
            updateMask.push('title');
        }

        // Collect and validate the description field
        var description = $('#editDescription').val();
        if (description && description.trim() !== '') {
            updatedProduct['description'] = { stringValue: description };
            updateMask.push('description');
        }

        // Collect and validate the stock field (ensure it's a valid number)
        var stock = $('#editStock').val();
        if (stock && !isNaN(stock)) {
            updatedProduct['quantity'] = { integerValue: parseInt(stock) };
            updateMask.push('quantity');
        }

        // Collect and validate the price field (ensure it's a valid number)
        var price = $('#editPrice').val();
        if (price && !isNaN(price)) {
            updatedProduct['price'] = { doubleValue: parseFloat(price) };  // Firestore treats prices as doubles
            updateMask.push('price');
        }

        // Only send the update request if we have valid fields to update
        if (updateMask.length > 0) {
            const patchData = {
                fields: updatedProduct
            };

            // Prepare the URL with individual updateMask parameters
            let updateMaskParams = updateMask.map(field => `updateMask.fieldPaths=${field}`).join('&');
            let url = `${FIRESTORE_BASE_URL}/products/${productID}?${updateMaskParams}`;
            console.log(url);

            // Make the PATCH request to Firestore
            $.ajax({
                url: url,
                method: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify(patchData),
                success: function(response) {
                    alert("Product updated successfully");
                    $('#editProductForm').hide();
                    $('#categorySelect').trigger('change');
                },
                error: function(error) {
                    console.log("Error updating product:", error);
                }
            });
        } else {
            alert("No valid fields to update");
        }
    });


    $(document).on('click', '.toggleStatusButton', function() {
        var productID = $(this).data('id');
        var currentStatus = $(this).data('status');
        var newStatus = currentStatus === true ? false : true;

        // Update product status
        var statusUpdate = {
            fields: {
                isActive: { booleanValue: newStatus }
            }
        };

        $.ajax({
            url: `${FIRESTORE_BASE_URL}/products/${productID}?updateMask.fieldPaths=isActive`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(statusUpdate),
            success: function(response) {
                alert('Product status updated successfully!');
                $('#categorySelect').trigger('change');  // Refresh product list
            },
            error: function(error) {
                console.log('Error updating status: ', error);
            }
        });
    });

    
});


function fetchCategories() {
    $.ajax({
        url: `${FIRESTORE_BASE_URL}/categories`,
        type: 'GET',
        success: function(response){
            const categories = response.documents;
            categories.forEach(function(category){
                console.log(category.name);
                $('#categorySelect').append('<option value="'+category.name+'">'+category.fields.categoryName.stringValue+'</option>');
            });
        },
        error: function(error){
            console.log("error fetching categories:" , error);
        }
    });
};


function handleUpdate(productID){

    $('#updateProductForm').on('submit', function(event){
        event.preventDefault();

        // var productID = $('#productID').val();
        console.log(productID);

        const updatedProduct = {
            fields:{
                title:{stringValue: $('#editTitle').val()},
                description:{stringValue : $('#editDescription').val()},
                quantity:{integerValue : $('#editStock').val()},
                price:{integerValue : $('#editPrie').val()}
            }
        };

        // var patchData = {
        //     document: updatedProduct,  // The actual product data with fields to update
        //     updateMask: {
        //         fieldPaths: ['title', 'description', 'stock', 'price']  // List of fields to be updated
        //     }
        // };

        
        //updating the product to the firestore
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/products/${productID}`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(updatedProduct),
            success: function(response){
                alert("Product updated Successfully");
                $('#editProductForm').hide();
                $('#categorySelect').trigger('change');
            },
            error:function(error){
                console.log("error updating product:" , error);
            }

        });
    });
};