class CartList {
   constructor() {
      this.arr = [];
   }

   // Method
   _findIndex(id) {
      let index = -1;

      this.arr.forEach((obj, i) => {
         if (obj.product.id == id) {
            index = i;
         }
      });

      return index;
   }

   addProductToCart(obj) {
      this.arr.push(obj);
   }

   deleteProductFromCart(id) {
      let index = this._findIndex(id);

      if (index !== -1) {
         this.arr.splice(index, 1);
      }
   }

   updateProductInCart(obj) {
      let index = this._findIndex(obj.product.id);

      if (index !== -1) {
         this.arr[index] = obj;
      }
   }

   getProductById(id) {
      let index = this._findIndex(id);

      if (index !== -1) {
         return this.arr[index];
      }

      return null;
   }

   checkIdDuplicate(id, arr) {
      let exist = false;

      for (let i = 0; i < arr.length; i++) {
         const obj = arr[i];
         if (obj.product.id == id) {
            exist = true;
            break;
         }
      }

      if (exist) {
         return false;
      }

      return true;
   }
}

export default CartList;
