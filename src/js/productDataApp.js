App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: function () {
    if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("product.json", function (data) {
      var productArtifact = data;
      App.contracts.product = TruffleContract(productArtifact);
      App.contracts.product.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-register", App.getData);
  },

  getData: function (event) {
    event.preventDefault();
    var sellerCode = document.getElementById("sellerCode").value;

    if (sellerCode.length != 0) {
      var productInstance;
      //window.ethereum.enable();
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        // console.log(account);

        App.contracts.product
          .deployed()
          .then(function (instance) {
            productInstance = instance;
            return productInstance.queryProductsList(
              web3.fromAscii(sellerCode),
              {
                from: account,
              }
            );
          })
          .then(function (result) {
            console.log(result);

            /**Here we decided whether seller is registered or not based on the returned result.
             
              If seller is registered, then it has some product which have Product serial num
              
              otherwise if seller is not registered, then it does not have any product ,So by default 0 in hexadecimal is assigned to product serial number
            
             */
            var productSerialNumInHex = result[1][0];
            // var productSerialNumInAscii = web3.toAscii(productSerialNumInHex);
            // console.log("productSerialNum = ", productSerialNumInAscii);

            if (
              productSerialNumInHex !=
              "0x0000000000000000000000000000000000000000000000000000000000000000"
            ) {
              console.log("Registered Seller");

              var productIds = [];
              var productSNs = [];
              var productNames = [];
              var productBrands = [];
              var productPrices = [];
              var productStatus = [];

              for (var k = 0; k < result[0].length; k++) {
                productIds[k] = result[0][k];
              }

              for (var k = 0; k < result[1].length; k++) {
                productSNs[k] = web3.toAscii(result[1][k]);
              }

              for (var k = 0; k < result[2].length; k++) {
                productNames[k] = web3.toAscii(result[2][k]);
              }

              for (var k = 0; k < result[3].length; k++) {
                productBrands[k] = web3.toAscii(result[3][k]);
              }

              for (var k = 0; k < result[4].length; k++) {
                productPrices[k] = result[4][k];
              }

              for (var k = 0; k < result[5].length; k++) {
                productStatus[k] = web3.toAscii(result[5][k]);
              }

              var t = "";
              document.getElementById("logdata").innerHTML = t;
              for (var i = 0; i < result[0].length; i++) {
                var temptr = "<td>" + productPrices[i] + "</td>";
                if (temptr === "<td>0</td>") {
                  break;
                }

                var tr = "<tr>";
                tr += "<td>" + productIds[i] + "</td>";
                tr += "<td>" + productSNs[i] + "</td>";
                tr += "<td>" + productNames[i] + "</td>";
                tr += "<td>" + productBrands[i] + "</td>";
                tr += "<td>" + productPrices[i] + "</td>";
                tr += "<td>" + productStatus[i] + "</td>";
                tr += "</tr>";
                t += tr;
              }
              document.getElementById("logdata").innerHTML += t;
              document.getElementById("add").innerHTML = account;
            } else {
              console.log("Not Register Seller");
              alert("Seller is not Registered!!!");
              window.location.reload();
            }
          })
          .catch(function (err) {
            console.log(err.message);
          });
      });
    } else {
      console.log("Please Enter All Details!!!");
      alert("Please Enter All Details!!!");
      window.location.reload();
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
