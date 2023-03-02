import CallAPI from "./../Services/CallAPI.js";
import ProductList from "./../Models/ProductList.js";
import CartList from "./../Models/CartList.js";

let callAPI = new CallAPI();
let cartList = new CartList();
let productList = new ProductList();

/**
 * Get list products from API
 */
const getListProducts = () => {
   callAPI
      .fetchProducts()
      .then((result) => {
         productList.arr = result.data;
         renderListProducts(result.data);
         getLocalStorage();
      })
      .catch((error) => {
         console.log(error);
      });
};

getListProducts();

/**
 * DOM element using query
 * @param {*} query
 * @returns element
 */
function queryEle(query) {
   return document.querySelector(query);
}

/**
 * Render List products on screen
 * @param {*} data
 */
function renderListProducts(data) {
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
               <div class="product-purchase" id="${product.id}">
                  <div class="product-price">$ ${product.price}</div>
                  <button class="btn-p btn-add-cart" onclick="handleAddCart(this, ${product.id})">Add
                     <i class="fa-solid fa-chevron-right"></i>
                  </button>
                  <span class="change-quantity">
                     <button class="btn-p" onclick="changeQty(this, 'sub', ${product.id})">
                        <i class="fa-solid fa-chevron-left"></i>
                     </button>
                     <span class="qtyProd">1</span>
                     <button class="btn-p" onclick="changeQty(this, 'add', ${product.id})">
                        <i class="fa-solid fa-chevron-right"></i>
                     </button>
                  </span>
               </div>
            </div>
         </div>`;
   }
   queryEle(".list-cards").innerHTML = contentHTML;
}

// Start: Modal
queryEle(".btn-cart").addEventListener("click", () => {
   queryEle(".modal-cart").style.display = "flex";
   queryEle(".cover").style.display = "block";
});

function hideListCart() {
   queryEle(".modal-cart").style.display = "none";
   queryEle(".cover").style.display = "none";
   queryEle(".payment").style.display = "none";
   queryEle(".order").style.display = "none";
}

const onClickCloseBtn = (modalEvent, event) =>
   modalEvent.addEventListener("click", event);

onClickCloseBtn(queryEle("#btnClose"), hideListCart);
onClickCloseBtn(queryEle(".cover"), hideListCart);
// End: Modal

/**
 * Click add button product to cart
 * @param {*} id
 */
window.handleAddCart = (e, id) => {
   let product = productList.getProductById(id);
   if (product) {
      // Add product with qty 1 to cart
      let cartItem = { product: product, quantity: 1 };
      cartList.addProductToCart(cartItem);

      // Display change qty button
      e.style.display = "none";
      e.parentElement.getElementsByTagName("span")[0].style.display = "block";

      // Show cart
      renderCart(cartList.arr);
      renderProductFromLocal(cartList.arr);
      setLocalStorage();
   }
};

/**
 * Change quantity product cart
 * @param {*} e this
 * @param {*} t type
 * @param {*} id product id
 */
window.changeQty = (e, t, id) => {
   if (t === "add") {
      let obj = cartList.getProductById(id);
      obj.quantity += 1;
      cartList.updateProductInCart(obj);

      // Update quantity on UI
      renderCart(cartList.arr);
      renderProductFromLocal(cartList.arr);

      // Set local
      setLocalStorage();

      e.parentElement.getElementsByTagName("span")[0].innerHTML = obj.quantity;
   }

   if (t === "sub") {
      let obj = cartList.getProductById(id);

      if (obj.quantity === 1) {
         cartList.deleteProductFromCart(id);
         setLocalStorage();

         if (cartList.arr.length !== 0) {
            // Update on UI
            renderCart(cartList.arr);
         } else {
            queryEle(
               ".modal-cart__body"
            ).innerHTML = `<p class="empty-cart">Looks Like You Haven't Added Any Product In The Cart</p>`;
         }

         renderProductFromLocal(cartList.arr);
         changeTotalQty();
         renderTotal();

         e.parentElement.style.display = "none";
         e.parentElement.parentElement.getElementsByTagName(
            "button"
         )[0].style.display = "block";
      } else {
         obj.quantity -= 1;
         cartList.updateProductInCart(obj);
         setLocalStorage();

         // Update quantity on UI
         renderCart(cartList.arr);
         renderProductFromLocal(cartList.arr);

         e.parentElement.getElementsByTagName("span")[0].innerHTML =
            obj.quantity;
      }
   }
};

/**
 * Render quantity on cart icon
 */
function changeTotalQty() {
   let total = 0;

   for (const obj of cartList.arr) {
      if (obj.quantity > 0) {
         total += obj.quantity;
      }
   }

   queryEle(".totalQty").innerHTML = total;
}

/**
 * Render data with quantity
 * @param {*} data cartList.arr
 */
function renderProductFromLocal(data) {
   let contentHTML = "";

   if (data.length !== 0) {
      for (const obj of data) {
         for (const prod of productList.arr) {
            if (prod.id === obj.product.id) {
               contentHTML = `
                  <div class="product-price">$ ${obj.product.price}</div>
                  <button class="btn-p btn-add-cart" onclick="handleAddCart(this, ${obj.product.id})" style="display: none;">Add
                     <i class="fa-solid fa-chevron-right"></i>
                  </button>
                  <span class="change-quantity" style="display: block;">
                     <button class="btn-p" onclick="changeQty(this, 'sub', ${obj.product.id})">
                        <i class="fa-solid fa-chevron-left"></i>
                     </button>
                     <span class="qtyProd">${obj.quantity}</span>
                     <button class="btn-p" onclick="changeQty(this, 'add', ${obj.product.id})">
                        <i class="fa-solid fa-chevron-right"></i>
                     </button>
                  </span>`;

               document.getElementById(obj.product.id).innerHTML = contentHTML;
            }
         }
      }
   } else {
      getListProducts();
   }
}

/**
 * Delete product when click icon delete
 * @param {*} id product id
 */
window.handleDeleteCart = (id) => {
   // Delete in cart and save local
   cartList.deleteProductFromCart(id);
   setLocalStorage();

   // Render list cart
   // If cartList []
   if (cartList.arr.length === 0) {
      queryEle(
         ".modal-cart__body"
      ).innerHTML = `<p class="empty-cart">Looks Like You Haven't Added Any Product In The Cart</p>`;
      renderListProducts(productList.arr);
   } else {
      renderCart(cartList.arr);
   }

   renderTotal();
   changeTotalQty();
   renderProductFromLocal(cartList.arr);
};

/**
 * Render total price on cart
 */
function renderTotal() {
   let total = 0;
   if (cartList.arr.length !== 0) {
      for (const obj of cartList.arr) {
         total += obj.product.price * obj.quantity;
      }
   }
   queryEle(".total-price").innerHTML = total;
}

/**
 * Render list product in cart modal
 * @param {*} data cartList.arr
 */
function renderCart(data) {
   let contentCart = "";

   data.forEach((obj) => {
      contentCart += `
         <div class="cart-item">
            <div class="cart__img">
               <img
                  src="${obj.product.img}"
                  alt="">
            </div>
            <p class="cart__name">${obj.product.name}</p>
            <span class="cart__qty--change">
               <button class="btn-p" onclick="changeQty(this, 'sub', ${
                  obj.product.id
               })">
                  <i class="fa-solid fa-chevron-left"></i>
               </button>
               <span class="cart__qty">${obj.quantity}</span>
               <button class="btn-p" onclick="changeQty(this, 'add', ${
                  obj.product.id
               })">
                  <i class="fa-solid fa-chevron-right"></i>
               </button>
            </span>
            <span class="cart__price">
               $ ${obj.product.price * obj.quantity}
            </span>
            <button class="cart__delete btn-none" onclick="handleDeleteCart(${
               obj.product.id
            })">
               <i class="fa-solid fa-trash"></i>
            </button>
         </div>`;
   });

   queryEle(".modal-cart__body").innerHTML = contentCart;
   renderTotal();
   changeTotalQty();
}

/**
 * Filter products with type: samsung, iphone, all
 */
window.onSelectFilter = () => {
   let newList = [];
   let value = queryEle("#filter-type").value;
   if (value !== "All") {
      newList = productList.filterProduct(value);
      renderListProducts(newList);
   } else {
      renderListProducts(productList.arr);
   }
};

/**
 * Clear all product from cart
 */
window.handleClearCart = () => {
   if (cartList.arr.length > 0) {
      cartList.deleteAllCart();
      setLocalStorage();
      queryEle(
         ".modal-cart__body"
      ).innerHTML = `<p class="empty-cart">Looks Like You Haven't Added Any Product In The Cart</p>`;
      renderTotal();
      changeTotalQty();
      renderListProducts(productList.arr);
   }
};

/**
 * Render info product in payment
 * @param {*} data cartLis.arr
 */
var renderListPayment = (data) => {
   let contentName = "";
   let contentPrice = "";

   if (data.length !== 0) {
      data.forEach((obj, i) => {
         contentName += `
            <span>${obj.quantity} x ${obj.product.name}</span>`;
         if (data.length === 1 || i + 1 === data.length) {
            contentPrice += `
            <span>$ ${obj.product.price}</span>`;
         } else {
            contentPrice += `
            <span>$ ${obj.product.price}</span>
            +`;
         }
      });
   }

   queryEle(".payment-item-name").innerHTML = contentName;
   queryEle(".payment-item-price").innerHTML = contentPrice;
};

/**
 * Click purchase button
 */
window.handlePurchase = () => {
   if (cartList.arr.length > 0) {
      let total = 0;

      queryEle(".payment").style.display = "block";
      queryEle(".modal-cart").style.display = "none";
      renderListPayment(cartList.arr);

      if (cartList.arr.length !== 0) {
         for (const obj of cartList.arr) {
            total += obj.product.price * obj.quantity;
         }
      }

      queryEle(".total-price-payment").innerHTML = total;
   }
};

/**
 * Click Order now button - Payment
 */
window.handlePayment = () => {
   renderOrderDetail();
   queryEle(".order").style.display = "block";
   queryEle(".payment").style.display = "none";
};

/**
 * Render order detail
 */
function renderOrderDetail() {
   let orderDetailHTML = "";

   let total = 0;
   if (cartList.arr.length !== 0) {
      for (const obj of cartList.arr) {
         total += obj.product.price * obj.quantity;
      }
   }
   const orderId = Math.floor(Math.random() * 1000);

   orderDetailHTML += `
      <div>
         <h4>your order has been placed</h4>
      </div>
      <div>Your order-id is :
         <span class="order-id">${orderId}</span>
      </div>
      <div>your order will be delivered to you in 3-5 working days</div>
      <div>
         you can pay 
         <span class="total-order">$ ${total}</span>
          by card or any online transaction method after the
         products have
         been dilivered to you
      </div>`;
   queryEle(".order-detail").innerHTML = orderDetailHTML;
}

/**
 * Click Cancel button - Payment
 */
window.handleCancel = () => {
   queryEle(".modal-cart").style.display = "flex";
   queryEle(".payment").style.display = "none";
};

/**
 * When accept order
 */
queryEle(".btn--okay-payment").addEventListener("click", () => {
   queryEle(".order").style.display = "none";
   queryEle(".thanks").style.display = "block";
   handleClearCart();
});

/**
 * Click button continue
 */
queryEle(".btn--okay-thanks").addEventListener("click", () => {
   queryEle(".thanks").style.display = "none";
   queryEle(".cover").style.display = "none";
});

/**
 * Set LocalStorage
 */
function setLocalStorage() {
   // Convert JSON to string
   let dataString = JSON.stringify(cartList.arr);
   localStorage.setItem("PRODUCTS", dataString);
}

/**
 * Get LocalStorage
 */
function getLocalStorage() {
   let dataString = localStorage.getItem("PRODUCTS");
   // Convert string to JSON
   if (dataString) {
      cartList.arr = JSON.parse(dataString);
      // Render list product in Cart
      renderCart(cartList.arr);
      renderProductFromLocal(cartList.arr);
   }
}
