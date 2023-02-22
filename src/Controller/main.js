let callAPI = new CallAPI();
let productList = new ProductList();

/**
 * DOM element using query
 * @param {*} query
 * @returns element
 */
let queryEle = (query) => {
   return document.querySelector(query);
};

/**
 * Set LocalStorage
 */
function setLocalStorage() {
   // Convert JSON to string
   let dataString = JSON.stringify(productList.arr);
   localStorage.setItem("PRODUCTS", dataString);
}

/**
 * Get LocalStorage
 */
function getLocalStorage() {
   let dataString = localStorage.getItem("PRODUCTS");
   // Convert string to JSON
   if (dataString) {
      productList = JSON.parse(dataString);
      // Render list product in Cart
   }
}

/**
 * Get list products from API
 */
let getListProducts = () => {
   callAPI
      .fetchProducts()
      .then((result) => {
         renderListProducts(result.data);
      })
      .catch((error) => {
         console.log(error);
      });
};

getListProducts();

/**
 * Render List products on screen
 * @param {*} data
 */
let renderListProducts = (data) => {
   let contentHTML = "";
   for (const product of data) {
      contentHTML += `
         <div class="card-product">
            <div class="card-top">
               <i class="fa-brands fa-apple"></i>
               <p class="product-stage">In Stock</p>
            </div>
            <div class="card-img">
               <img class="product-img"
                  src="${product.img}"
                  alt="">
            </div>
            <div class="card-bottom">
               <div class="product-name">
                  <h2>${product.name}</h2>
                  <button onclick="this.classList.toggle('heart')" class="btn-none">
                     <i class="fa-solid fa-heart"></i>
                  </button>
               </div>
               <div class="wrapper">
                  <h5>${product.type}</h5>
                  <p>+ ${product.desc}</p>
                  <p>+ ${product.screen}</p>
                  <p>+ Camera sau: ${product.backCamera}</p>  
                  <p>+ Camera trước: ${product.frontCamera}</p>
               </div>
               <div class="product-purchase">
                  <div class="product-price">$ ${product.price}</div>
                  <button id="addCartBtn" class="btn-p">Add
                     <i class="fa-solid fa-chevron-right"></i>
                  </button>
                  <span class="addQty">
                     <button class="btn-p">
                        <i class="fa-solid fa-chevron-left"></i>
                     </button>
                     <span class="qtyProd">1</span>
                     <button class="btn-p">
                        <i class="fa-solid fa-chevron-right"></i>
                     </button>
                  </span>
               </div>
            </div>
         </div>`;
   }
   queryEle(".list-cards").innerHTML = contentHTML;
};
