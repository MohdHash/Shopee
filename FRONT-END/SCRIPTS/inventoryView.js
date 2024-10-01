
import { FIRESTORE_BASE_URL } from "../CONSTANTS/constants.js";
    let products=[];
    const categoryCache = {};
    let currentPage = 1;
    const productPerPage = 8;
    let totalpages = 1;
$(document).ready(function(){

    

    //fetch products and categories.

    function fetchProductsAndCategories(){
        $.ajax({
            url: `${FIRESTORE_BASE_URL}/products`,
            method: 'GET',
            success: function(response){
                console.log(response.documents);
                products = response.documents;
                populateCategoryDropdown(); // populate the dropdown;
                displayProductsPaginated(products) // show all the products;
            },
            error:function(error){
                console.log("Error fetching products" , error);
            }
        });
    }

    function displayProductsPaginated(products){
        
        totalpages = Math.ceil(products.length / productPerPage);

        console.log(totalpages);
        //slice the products to display the  products in the current page

        const startIndex = (currentPage-1) * productPerPage;
        const endIndex = startIndex + productPerPage;

        const productListPerPage = products.slice(startIndex, endIndex);

        displayProducts(productListPerPage);

        updatePaginationControls();
    }

    function updatePaginationControls(){
        // Update page info
        console.log(totalpages);
        $('#pageInfo').text(`Page ${currentPage} of ${totalpages}`);

        // Disable/enable buttons based on the current page
        $('#firstPageBtn').prop('disabled',currentPage === 1);
        $('#prevPageBtn').prop('disabled', currentPage === 1);
        $('#nextPageBtn').prop('disabled', currentPage === totalpages);
        $('#lastPageBtn').prop('disabled', currentPage === totalpages);
    }


    $('#firstPageBtn').on('click', function() {
        if (currentPage !== 1) {
            currentPage = 1;
            displayProductsPaginated(products);  // Assuming `productList` is available globally
        }
    });
    
    $('#prevPageBtn').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayProductsPaginated(products);
        }
    });
    
    $('#nextPageBtn').on('click', function() {
        if (currentPage < totalpages) {
            currentPage++;
            displayProductsPaginated(products);
        }
    });
    
    $('#lastPageBtn').on('click', function() {
        if (currentPage !== totalpages) {
            currentPage = totalpages;
            displayProductsPaginated(products);
        }
    });


    // $('#categoryDropdown').on('change', function () {
    //     const selectedCategory = $(this).val();
    //     console.log(selectedCategory);

    //     let filterdProducts = products;

    //     if(selectedCategory !== 'all'){
    //         filterdProducts = products.filter( p => {
    //             const categoryRef = p.fields.categoryID.referenceValue;
    //             const categoryID = categoryRef.split('/').pop();

    //             return categoryID === selectedCategory;
    //         })
    //     }
    //     // let filteredProducts = products;

    //     // if (selectedCategory !== 'all') {
    //     //     filteredProducts = products.filter(p => p.fields.category.stringValue === selectedCategory);
    //     // }

    //     displayProductsPaginated(filterdProducts);
    // });

    //searching the product
    // $('#searchInput').on('input', function () {
    //     const searchText = $(this).val().toLowerCase(); // get lowercase search text
    //     const filteredProducts = products.filter(p => 
    //         p.fields.title.stringValue.toLowerCase().includes(searchText)
    //     );
    //     displayProductsPaginated(filteredProducts);
    // });

    function filterProducts(){
        let filteredProducts = products;

        const searchText = $('#searchInput').val().toLowerCase(); // get lowercase search text
        const selectedCategory = $('#categoryDropdown').val();

        if(selectedCategory !== 'all'){
            filteredProducts = filteredProducts.filter( p => {
                const categoryRef = p.fields.categoryID.referenceValue;
                const categoryID = categoryRef.split('/').pop();

                return categoryID === selectedCategory;
            });
        }

        if(searchText){
            filteredProducts = filteredProducts.filter( p => {
                return p.fields.title.stringValue.toLowerCase().includes(searchText);
            })
        }
        
        displayProductsPaginated(filteredProducts);
    }

    $('#searchInput').on('input', filterProducts);
    $('#categoryDropdown').on('change',filterProducts);

    //display all the products
    function displayProducts(products){
        const tableBody = $('#inventoryTable tbody');
        tableBody.empty();

        products.forEach(product => {
            const productName = product.fields.title.stringValue;
            const productCategoryRef = product.fields.categoryID.referenceValue;
            const productPrice = product.fields.price.doubleValue;
            const productQuantity = product.fields.quantity.integerValue;
            const productImageURL = product.fields.imageUrl.stringValue;

            //extract the category ID;
            const categoryID = productCategoryRef.split('/').pop();
            console.log(categoryID);

            fetchCategoryName(categoryID)
                .then(categoryName => {
                    const row = `<tr>
                        <td>${productName}</td>
                        <td><img src="${productImageURL}" alt="${productName}"></td>
                        <td>${categoryName}</td>
                        <td>${productPrice}</td>
                        <td>${productQuantity}</td>
                    </tr>`;
                    tableBody.append(row);
                })
                .catch(error => {
                    console.log("Error fetching category", error);
                });
        });
    }

    function fetchCategoryName(categoryID){
        return new Promise((resolve , reject) =>{
            $.ajax({
                url:`${FIRESTORE_BASE_URL}/categories/${categoryID}`,
                method:'GET',
                success: function(response){
                    const categoryName = response.fields.categoryName.stringValue;
                    resolve(categoryName);
                },
                error:function(error){
                    reject(error);
                }
            });
        });
    }

    function populateCategoryDropdown(){
        const categoryDropdown = $('#categoryDropdown');
        categoryDropdown.empty();
        
        const categoryRefs = [...new Set(products.map( product => product.fields.categoryID.referenceValue))];

        categoryRefs.forEach(categoryRef =>  {
            const categoryID = categoryRef.split('/').pop();

            if(categoryCache[categoryID]){
                categoryDropdown.append(new Option(categoryCache[categoryID] , categoryID));
            }else{

                //otherwise fetch the cateory
                fetchCategoryName(categoryID)
                    .then(categoryName => {
                        console.log(categoryName);
                        categoryCache[categoryID] = categoryName;
                        categoryDropdown.append(new Option(categoryName , categoryID));
                    })
                    .catch(error => {
                        console.log("Error fetching category", error);
                    });
            }
        });
    }

    fetchProductsAndCategories();

});

