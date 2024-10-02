import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";

$('#categoryForm').on('submit', function (e) {
    e.preventDefault();
    const categoryName = $('#categoryName').val();

    var data = {
        categoryName: categoryName
    };

    $.ajax({
        url: `${FIRESTORE_BASE_URL}/categories`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            fields:{
                categoryName: {
                    stringValue: categoryName
                }
            }
        }),
        success: function (response) {
            showSuccessModal('Category added successfully!');
        },
        error: function(error){
            $('#response').addClass('error').text('Error adding category: ' + error.responseText).fadeIn();
        }
    });
});

function showSuccessModal(message) {
    const successModal = $('<div class="success-modal"></div>').text(message);
    $('body').append(successModal);
    successModal.addClass('show');
    
    setTimeout(function() {
        successModal.addClass('fade-out');
    }, 2000);  // Keep the modal visible for 2 seconds

    // Remove the modal after animation completes
    setTimeout(function() {
        successModal.remove();
    }, 2500);
}