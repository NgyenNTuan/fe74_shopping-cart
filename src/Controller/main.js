/**
 * 1. Tạo API Product bằng MockAPI -- OK
 * 2. Hiển thi danh sách sản phẩm -- OK -- loading effect
 * 3. Tạo ô select cho phép filter theo loại sản phẩm: iphone, samsung
 * 4. Chọn sản phẩm bỏ vào giỏ hàng -- OK
 * 5. In giỏ hàng ra ngoài màn hình -- OK
 * 6. Chỉnh sửa số lượng sản phẩm trong giở hàng và ở trên thẻ sản phẩm
 * 7. In tổng tiền -- OK
 * 8. Lưu giở hàng vào localStorage -- OK
 * 9. Khi người dùng nhấn nút thanh toán, clear giỏ hàng, set mảng giỏ hàng []
 * 10. Remove sản phẩm khỏi giỏ hàng -- OK
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
      renderCart(cartList.arr);
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
window.handleAddCart = (e, id) => {
   callAPI
      .getProductById(id)
      .then((result) => {
         // Add product with qty 1 to cart
         let cartItem = { product: result.data, quantity: 1 };
         cartList.addProductToCart(cartItem);

         // Display change qty button
         e.style.display = "none";
         e.parentElement.getElementsByTagName("span")[0].style.display =
            "block";

         // Show cart
         changeTotalQty();
         renderTotal();
         renderCart(cartList.arr);
      })
      .catch((error) => {
         console.log(error);
      });
};

window.changeQty = (e, t, id) => {
   if (t === "add") {
      let obj = cartList.getProductById(id);
      obj.quantity += 1;
      cartList.updateProductInCart(obj);

      // Update quantity on UI
      changeTotalQty();
      renderTotal();
      renderCart(cartList.arr);
      // renderQty(cartList.arr);
      e.parentElement.getElementsByTagName("span")[0].innerHTML = obj.quantity;
   }

   if (t === "sub") {
      let obj = cartList.getProductById(id);
      if (obj.quantity === 1) {
         cartList.deleteProductFromCart(id);

         // Update on UI
         changeTotalQty();
         renderTotal();
         renderCart(cartList.arr);
         e.parentElement.style.display = "none";
         e.parentElement.parentElement.getElementsByTagName(
            "button"
         )[0].style.display = "block";
      } else {
         obj.quantity -= 1;
         cartList.updateProductInCart(obj);

         // Update quantity on UI
         changeTotalQty();
         renderTotal();
         renderCart(cartList.arr);
         // renderQty(cartList.arr);

         e.parentElement.getElementsByTagName("span")[0].innerHTML =
            obj.quantity;
      }
   }
};

/**
 * Render quantity on cart icon
 */
const changeTotalQty = () => {
   let total = 0;

   for (const obj of cartList.arr) {
      if (obj.quantity > 0) {
         total += obj.quantity;
      }
   }

   queryEle(".totalQty").innerHTML = total;
};

/**
 *
 * @param {*} data cartList.arr
 */
const renderProductFromLocal = (data) => {
   let contentHTML = "";

   if (data.length !== 0) {
      data.forEach((obj, i) => {
         contentHTML += `
               <button class="btn-p" onclick="changeQty(this, 'sub', ${obj.product.id})">
                  <i class="fa-solid fa-chevron-left"></i>
               </button>
               <span class="qtyProd">1</span>
               <button class="btn-p" onclick="changeQty(this, 'add', ${obj.product.id})">
                  <i class="fa-solid fa-chevron-right"></i>
               </button>`;
      });

      queryEle(".list-cards").innerHTML = contentHTML;
   } else {
      getListProducts();
   }
};

window.handleDeleteCart = (id) => {
   // Delete in cart and save local
   cartList.deleteProductFromCart(id);

   // Render list cart
   // If cartList []
   if (cartList.arr.length === 0) {
      queryEle(
         ".modal-cart__body"
      ).innerHTML = `<p class="empty-cart">Looks Like You Haven't Added Any Product In The Cart</p>`;
   } else {
      renderCart(cartList.arr);
   }
   renderTotal();
   changeTotalQty();

   // Change button qtyProd to add button
};

const renderTotal = () => {
   let total = 0;
   if (cartList.arr.length !== 0) {
      for (const obj of cartList.arr) {
         total += obj.product.price * obj.quantity;
      }
   }
   queryEle(".total-price").innerHTML = total;
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
};
