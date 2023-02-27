/**
 * 1. Tạo API Product bằng MockAPI -- OK
 * 2. Hiển thi danh sách sản phẩm -- OK -- loading effect
 * 3. Tạo ô select cho phép filter theo loại sản phẩm: iphone, samsung -- OK
 * 4. Chọn sản phẩm bỏ vào giỏ hàng -- OK
 * 5. In giỏ hàng ra ngoài màn hình -- OK
 * 6. Chỉnh sửa số lượng sản phẩm trong giở hàng và ở trên thẻ sản phẩm -- OK
 * 7. In tổng tiền -- OK
 * 8. Lưu giở hàng vào localStorage -- OK
 * 9. Khi người dùng nhấn nút thanh toán, clear giỏ hàng, set mảng giỏ hàng [] -- OK
 * 10. Remove sản phẩm khỏi giỏ hàng -- OK
 */
import CallAPI from "./../Services/CallAPI.js";
import ProductList from "./../Models/ProductList.js";
import CartList from "./../Models/CartList.js";

let callAPI = new CallAPI();
let cartList = new CartList();
let productList = new ProductList();

getLocalStorage();

/**
 * DOM element using query
 * @param {*} query
 * @returns element
 */
function queryEle(query) {
   return document.querySelector(query);
}

/**
 * Get list products from API
 */
const getListProducts = () => {
   callAPI
      .fetchProducts()
      .then((result) => {
         queryEle(".lds-ellipsis").style.display = "none";
         productList.arr = result.data;
         renderListProducts(result.data);
      })
      .catch((error) => {
         queryEle(".lds-ellipsis").style.display = "none";
         console.log(error);
      });
};

getListProducts();

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
}

const onClickCloseBtn = (modalEvent, event) =>
   modalEvent.addEventListener("click", event);

onClickCloseBtn(queryEle("#btnClose"), hideListCart);
onClickCloseBtn(queryEle(".cover"), hideListCart);
// End: Modal

/**
 * While click add product to cart
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

   // Change button qtyProd to add button
};

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
 * @param {*} data
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
               <button class="btn-p" onclick="changeQty(this, 'sub', ${obj.product.id})">
                  <i class="fa-solid fa-chevron-left"></i>
               </button>
               <span class="cart__qty">${obj.quantity}</span>
               <button class="btn-p" onclick="changeQty(this, 'add', ${obj.product.id})">
                  <i class="fa-solid fa-chevron-right"></i>
               </button>
            </span>
            <span class="cart__price">
               $ ${obj.product.price}
            </span>
            <button class="cart__delete btn-none" onclick="handleDeleteCart(${obj.product.id})">
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

var renderListPayment = (data) => {
   let contentName = "";
   let contentPrice = "";

   if (data.length !== 0) {
      data.forEach((obj) => {
         contentName += `
            <span>${obj.quantity} x ${obj.product.name}</span>`;
         if (data.length === 1) {
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

window.handlePayment = () => {
   console.log(20);
};

window.handleCancel = () => {
   queryEle(".modal-cart").style.display = "flex";
   queryEle(".payment").style.display = "none";
};

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
