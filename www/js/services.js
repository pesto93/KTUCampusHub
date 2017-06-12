angular.module('KTU.services', [])

  .factory("Buildings", function ($http, API_URL, $rootScope) {
    $rootScope.storeFaculties = [];
    return {
      /*getBuildings: function (callback) {
       return $http.post(API_URL + "/fetch.php", {
       method: "getKTUBuildings",
       lang: $rootScope.currentLanguage
       }).success(function (res) {

       return callback(res);
       })
       },*/
      internationalOffice: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getInternationalOffice",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          return callback(res);
        })
      },
      getOfficeInfo: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getOfficeInfo",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          return callback(res);
        })
      },
      getInfo: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getInfo",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getFaculty: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getFaculty",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          // console.log(res);
          return callback(res);
        })
      },
      getNews: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getNews",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getLeisure: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getLeisure",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getConference: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getConference",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getDormitory: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getDormitory",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getSportCenter: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getSportCenter",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getCafe: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getCafe",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getMenu: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getMenu",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getCafeDetail: function (name) {
        if ($rootScope.storeDetails.length > 0) {
          for (var i = 0; i < $rootScope.storeDetails.length; i++) {
            if ($rootScope.storeDetails[i].Cafe_name === name) {
              return $rootScope.storeDetails[i];
            }
          }
        }
        return null;
      },
      getCafeMenu: function (name) {
        var menu = [];
        if ($rootScope.storeDetails.length > 0) {
          for (var i = 0; i < $rootScope.storeDetails.length; i++) {
            if ($rootScope.storeDetails[i].Cafe_name === name) {
              menu[i] = $rootScope.storeDetails[i];
            }
          }
          return menu;
        }
        return null;
      },
      getContactDetail: function (name, number, callback) {
        return $http.post(API_URL + "/Contact.php", {
          method: "getContactDetail",
          name: name,
          number: number
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getBank: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getBank",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          //console.log(res);
          return callback(res);
        })
      },
      getBankBranch: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getBankBranch",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          //console.log(res);
          return res;
        })
      },
      getAppHelp: function (callback) {
        return $http.post(API_URL + "/fetch.php", {
          method: "getAppHelp",
          lang: $rootScope.currentLanguage
        }).success(function (res) {
          $rootScope.storeDetails = res.data;
          return callback(res);
        })
      },
      getFullDetail: function (id) {
        if ($rootScope.storeDetails) {
          for (var i = 0; i < $rootScope.storeDetails.length; i++) {
            if ($rootScope.storeDetails[i].id === id) {
              return $rootScope.storeDetails[i];
            }
          }
        }
        return null;
      },
      addData: function (data, tableName, lang, callback) {
        return $http.post(API_URL + "/fetch.php",
          {
            method: "add",
            data: data,
            lang: $rootScope.currentLanguage,
            table: tableName
          })
          .success(function (response) {
            //console.log("add");
            return callback(response);
          })
      }
    }
  })

  .factory('getDirectionService', function ($http,$interval, $rootScope, $cordovaGeolocation, $ionicPlatform, $ionicLoading, $cordovaDialogs, $ionicBackdrop, $state, $window) {
    var posOptions = {
      enableHighAccuracy: true,
      timeout: 1000000,
      maximumAge: 0
    };
    var watchOptions = {
      timeout: 3000,
      enableHighAccuracy: false
    };
    var watchID;

    return {
      getDirections: function (destination, map_id) {
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();

       /*$ionicLoading.show({
          template: '<ion-spinner  class="spinner-energized" icon="ripple"></ion-spinner><br/>Acquiring Direction, Please Wait!',
          duration: 1000
        });*/

        //Note: was suppose to be used for watchpos... Try in Ionic 2
        /* var watchID = navigator.geolocation.watchPosition($cordovaGeolocation.getCurrentPosition);
         navigator.geolocation.clearWatch(watchID);*/

        return $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          $rootScope.lat = position.coords.latitude;
          $rootScope.long = position.coords.longitude;

          var myLatlng = new google.maps.LatLng($rootScope.lat, $rootScope.long);
          var mapOptions = {
            center: myLatlng,
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.WALKING
          };
          // this is where we set where we need to display the map

          var map = new google.maps.Map(document.getElementById(map_id), mapOptions);
          directionsDisplay.setMap(map);
          getRoute(destination, $rootScope.lat, $rootScope.long);
          //$ionicLoading.hide();

          return map;

        }, function () {
          //$ionicLoading.hide();
          var message = "unable to get location please wait for App refresh";
          var title = "Error";
          var button_name = "Ok";
          $cordovaDialogs.alert(message, title, button_name)
            .then(function () {
              //$state.go('tab.buildings');
            });
          $ionicBackdrop.release();
        });

        function getRoute(destination, lat, long) {
          var start = lat + "," + long;
          var end = destination;
          var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.WALKING
          };
          directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(result);
            } else {
              console.log("error");
            }
          });
        }
      },
      getPosition: function () {
        return $ionicPlatform.ready().then(function () {
          return $cordovaGeolocation.getCurrentPosition(posOptions)
        })
      },
      watchPos: function () {
        return $ionicPlatform.ready().then(function () {
          return watchID = $cordovaGeolocation.watchPosition(watchOptions);
          {
            return watchID.then(null, function (err) {

            }, function (position) {
              var lat = position.coords.latitude;
              var long = position.coords.longitude;
              //console.log("i came in here again")
            })

          }
        })
      },
      clearPos: function () {
        $ionicPlatform.ready().then(function () {
          watchID.clearWatch();
        })
      },
      clearInterVal: function (intervalName) {
        $interval.cancel(intervalName);
      }
    }
  })

  .factory('$localstorage', ['$window', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      },
      remove: function (key) {
        $window.localStorage.removeItem(key);
      }
    }
  }]);

//END ->
