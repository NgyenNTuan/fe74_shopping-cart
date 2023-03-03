function CallAPI() {
   this.fetchProducts = function () {
      return axios({
         url: "https://63f4913e2213ed989c458946.mockapi.io/lan7/product",
         method: "GET",
      });
      // return axios({
      //    url: "https://63df6ffd59bccf35dab344b0.mockapi.io/api/products",
      //    method: "GET",
      // });
   };
   this.getProductById = function (id) {
      return axios({
         url: `https://63df6ffd59bccf35dab344b0.mockapi.io/api/products/${id}`,
         method: "GET",
      });
   };
}

export default CallAPI;
