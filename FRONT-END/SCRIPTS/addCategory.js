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
            $('#response').text('Category added Succssfully');
            // $('#categoryName').text('');
            // $('#response').text('');
        },
        error: function(error){
            $('#response').text('Error adding category: ' + error.responseText);
        }
    });
});