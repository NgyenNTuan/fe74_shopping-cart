class ProductList {
   constructor() {
      this.arr = [];
   }

   // Method
   _findIndex(id) {
      let index = -1;

      this.arr.forEach((prod, i) => {
         if (prod.id == id) {
            index = i;
         }
      });

      return index;
   }

   addProductList(prod) {
      this.arr.push(prod);
   }

   filterProduct(value) {
      let newList = [];

      for (const prod of this.arr) {
         if (prod.type.toLowerCase() === value.toLowerCase()) {
            newList.push(prod);
         }
      }

      return newList;
   }

   getProductById(id) {
      let index = this._findIndex(id);

      if (index !== -1) {
         return this.arr[index];
      }

      return null;
   }
}

export default ProductList;
