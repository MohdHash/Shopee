import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";
$(document).ready(function () {
    // Firestore REST API URL
    
    // Function to get all customers
    function getCustomers() {
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/customers`,
            method: 'GET',
            success: function (response) {
                populateCustomerTable(response.documents);
            },
            error: function (error) {
                console.error('Error fetching customer data:', error);
            }
        });
    }

    // Function to populate the customer table
    function populateCustomerTable(customers) {
        const customerTableBody = $('#customerTable tbody');
        customerTableBody.empty();

        customers.forEach((doc) => {
            const fields = doc.fields;
            const customerName = fields.name.stringValue;
            const phoneNumber = fields.mobileNumber.stringValue;
            const creditValue = fields.creditLimit.integerValue;
            const docId = doc.name.split('/').pop();

            const customerRow = `
                <tr>
                    <td>${customerName}</td>
                    <td>${phoneNumber}</td>
                    <td>
                        <input type="number" value="${creditValue}" id="credit-${docId}">
                    </td>
                    <td>
                        <button class="update-button" onclick="updateCredit('${docId}')">Update</button>
                    </td>
                </tr>
            `;
            customerTableBody.append(customerRow);
        });
    }

    // Function to update customer credit
    window.updateCredit = function (docId) {
        const newCreditValue = parseFloat($(`#credit-${docId}`).val());

        if (isNaN(newCreditValue)) {
            alert('Please enter a valid number for the credit value.');
            return;
        }

        $.ajax({
            url: `${FIRESTORE_BASE_URL}/customers/${docId}?updateMask.fieldPaths=creditLimit`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({
                fields: {
                    creditLimit: { integerValue: newCreditValue }
                }
            }),
            success: function () {
                showNotification();
            },
            error: function (error) {
                console.error('Error updating credit value:', error);
                alert('Failed to update credit value.');
            }
        });
    };

    // Function to show success notification
    function showNotification() {
        const notification = $('#notification');
        notification.fadeIn(400).delay(2000).fadeOut(400);
    }

    // Fetch and display customers when the page loads
    getCustomers();
});
