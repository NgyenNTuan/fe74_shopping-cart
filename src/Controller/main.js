/**
 * 1. Tạo API Product bằng MockAPI
 * 2. Hiển thi danh sách sản phẩm
 * 3. Tạo ô select cho phép filter theo loại sản phẩm: iphone, samsung
 * 4. Chọn sản phẩm bỏ vào giỏ hàng
 * 5. In giỏ hàng ra ngoài màn hình
 * 6. Chỉnh sửa số lượng sản phẩm trong giở hàng và ở trên thẻ sản phẩm
 * 7. In tổng tiền
 * 8. Lưu giở hàng vào localStorage
 * 9. Khi người dùng nhấn nút thanh toán, clear giỏ hàng, set mảng giỏ hàng []
 * 10. Remove giỏ hàng ra khỏi sản phẩm
 */
import CallAPI from "./../Services/CallAPI.js";
import Product from "./../Models/Product.js";
import ProductList from "./../Models/ProductList.js";
import CartList from "./../Models/CartList.js";

let callAPI = new CallAPI();
let cartList = new CartList();

/**
 * DOM element using query
 * @param {*} query
 * @returns element
 */
const queryEle = (query) => {
   return document.querySelector(query);
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
      cartList = JSON.parse(dataString);
      // Render list product in Cart
   }
}

/**
 * Get list products from API
 */
const getListProducts = () => {
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
const renderListProducts = (data) => {
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
                  <button id="addCartBtn" class="btn-p" onclick="handleAddCart(${product.id})">Add
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

// Start: Modal
queryEle(".btn-cart").addEventListener("click", () => {
   queryEle(".modal-cart").style.display = "flex";
   queryEle(".cover").style.display = "block";
});

queryEle("#btnClose").addEventListener("click", () => {});

function hideListCart() {
   queryEle(".modal-cart").style.display = "none";
   queryEle(".cover").style.display = "none";
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
window.handleAddCart = (id) => {
   callAPI
      .getProductById(id)
      .then((result) => {
         if (cartList.checkIdDuplicate(id, cartList.arr)) {
            let cartItem = { product: result.data, quantity: 1 };
            cartList.addProductToCart(cartItem);
         } else {
            let cartItem = {
               product: result.data,
               quantity: cartList.arr[cartList._findIndex(id)].quantity + 1,
            };
            cartList.updateProductInCart(cartItem);
         }
         changeTotalQty();
         renderCart(cartList.arr);
      })
      .catch((error) => {
         console.log(error);
      });
};

/**
 * Render quantity on cart icon
 */
const changeTotalQty = () => {
   let total = 0;

   for (const obj of cartList.arr) {
      total += obj.quantity;
   }

   queryEle(".totalQty").innerHTML = total;
};

/**
 * Render list product in cart modal
 * @param {*} data
 */
const renderCart = (data) => {
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
               <button class="btn-p">
                  <i class="fa-solid fa-chevron-left"></i>
               </button>
               <span class="cart__qty">${obj.quantity}</span>
               <button class="btn-p">
                  <i class="fa-solid fa-chevron-right"></i>
               </button>
            </span>
            <span class="cart__price">
               $ ${obj.product.price}
            </span>
            <button class="cart__delete btn-none">
               <i class="fa-solid fa-trash"></i>
            </button>
         </div>`;
   });

   queryEle(".modal-cart__body").innerHTML = contentCart;
};
