import { FIRESTORE_BASE_URL,STORAGE_URL } from "../CONSTANTS/constants.js";

$(document).ready(function(){



    fetchCategory();

    $('#productForm').on('submit',function(event){
        event.preventDefault();

        //getting form data
        const title = $('#title').val();
        const description = $('#description').val();
        const quantity = $('#quantity').val();
        const price = $('#price').val();
        const categoryID = $('#category').val();
        const imageFile = $('#imageUpload')[0].files[0];

        //uploading image to storage

        uploadImageToStorage(imageFile).then(function(imageUrl) {
            // Once image upload is successful, create product in Firestore
            createProductInFirestore(title, description, quantity, price, categoryID, imageUrl);
        }).catch(function(error) {
            console.error("Image upload failed:", error);
        });

    });
});

function fetchCategory(){

    const categoriesURL = `${FIRESTORE_BASE_URL}/categories`;
    $.ajax({
        url: categoriesURL,
        method: 'GET',
        success:function(response){
            var categories = response.documents;
            categories.forEach(function(category){
                $('#category').append('<option value="'+category.name+'">'+category.fields.categoryName.stringValue+'</option>');
            });
        }
    })
}

function uploadImageToStorage(imageFile) {
    return new Promise(function(resolve, reject) {
        const formData = new FormData();
        formData.append("file", imageFile);

        // Construct the upload URL
        const fileName = encodeURIComponent(imageFile.name);
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/shopee-cd540.appspot.com/o?uploadType=media&name=images/${fileName}`;

        $.ajax({
            url: uploadUrl,
            method: 'POST',
            data: imageFile,
            processData: false,  // Prevent jQuery from processing the data
            contentType: imageFile.type,  // Set the content type of the request to the file type
            success: function(response) {
                // Construct the download URL for the uploaded image
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/shopee-cd540.appspot.com/o/images%2F${fileName}?alt=media`;
                resolve(imageUrl);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}


// Create the product in Firestore
function createProductInFirestore(title, description, quantity, price, categoryID, imageUrl) {
    const productData = {
        fields: {
            title: { stringValue: title },
            description: { stringValue: description },
            quantity: { integerValue: quantity },
            price: { integerValue: price },
            categoryID: { referenceValue: `projects/shopee-cd540/databases/(default)/documents/categories/${categoryID}`},
            imageUrl: { stringValue: imageUrl },
            isActive:{ booleanValue : true}

        }
    };
    
    $.ajax({
        url: `${FIRESTORE_BASE_URL}/products`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(productData),
        success: function(response) {
            $('#response').text('Product added successfully!');
        },
        error: function(error) {
            $('#response').text('Error adding product: ' + error.responseText);
        }
    });
}