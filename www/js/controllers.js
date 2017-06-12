angular.module('KTU.controllers', [])

  .controller('NavCtrl', function ($scope, $ionicSideMenuDelegate, $state) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.create = function () {
      $state.go('settings');
    };
    $scope.showForm = function () {
      $state.go('eventForm');
    };
    $scope.goto = function () {
      /*$state.go('cafes');*/
      $state.go('tab.cafes');
    };
  })

  .controller('BckCtrl', function ($scope, $state, $ionicHistory, $window) {
    $scope.myGoBack = function () {
      $ionicHistory.goBack();
      // $window.history.go(-1);
    };
  })

  .controller('InfoCTRL', function ($scope, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>',
      duration: 500000
    });

    Buildings.getInfo(function (res) {
      $scope.info = res.data;
      $ionicLoading.hide();
    })

  })

  .controller('HomeCtrl', function ($rootScope, $translate, $state, $localstorage, getDirectionService, $scope, $ionicLoading, Buildings, $interval, $compile, $ionicSideMenuDelegate, $ionicBackdrop, $cordovaGeolocation, $ionicPlatform) {
    $rootScope.currentLanguage = $translate.proposedLanguage() || $translate.use();

    var processing = false;
    var HomeMapInterval;
    var data = [
      {id: '', title: "", pubDate: "", url: ''}
    ];
    $scope.temp2 = {};
    $scope.temp1 = {};
    $scope.temp3 = [];

    Buildings.getNews(function (res) {
      for (var i = 0; i < 2; i++) {
        $scope.temp1[i] = res.data[i];
      }
      //console.log($scope.temp1);
      angular.forEach($scope.temp1, function (value) {
        data.push({
          id: value.id,
          title: value.Title,
          pubDate: "",
          url: '/tab/events/news-details/description/'
        });
      });

      Buildings.getLeisure(function (res) {

        for (var i = 0; i < 2; i++) {
          $scope.temp2[i] = res.data[i];
        }

        angular.forEach($scope.temp2, function (value) {
          data.push({
            id: value.id,
            title: value.Title,
            pubDate: "",
            url: '/tab/events/leisure-details/description/'
          });
        })
      });

      Buildings.getConference(function (res) {
        for (var i = 0; i < 2; i++) {
          $scope.temp3[i] = res.data[i];
        }

        angular.forEach($scope.temp3, function (value) {
          data.push({
            id: value.id,
            title: value.Title,
            pubDate: "",
            url: '/tab/events/conference-details/description/'
          });
        })
      });
    });


    $scope.news = [];
    $scope.conf = {
      news_length: false,
      news_pos: 200, // the starting position from the right in the news container
      news_margin: 20,
      news_move_flag: true
    };

    $scope.init = function () {
      /*$http.post('the_news_file.json', null).success(function(data) {
       if (data && data.length > 0) {*/
      $scope.news = data;
      $interval($scope.news_move, 20);
      /*  }
       });*/
    };

    $scope.get_news_right = function (idx) {
      var $right = $scope.conf.news_pos;
      for (var ri = 0; ri < idx; ri++) {
        if (document.getElementById('news_' + ri)) {
          $right += $scope.conf.news_margin + angular.element(document.getElementById('news_' + ri))[0].offsetWidth;
        }
      }
      return $right + 'px';
    };

    $scope.news_move = function () {
      if ($scope.conf.news_move_flag) {
        $scope.conf.news_pos--;
        if (angular.element(document.getElementById('news_0'))[0].offsetLeft > angular.element(document.getElementById('news_strip'))[0].offsetWidth + $scope.conf.news_margin) {
          var first_new = $scope.news[0];
          $scope.news.push(first_new);
          $scope.news.shift();
          $scope.conf.news_pos += angular.element(document.getElementById('news_0'))[0].offsetWidth + $scope.conf.news_margin;
        }
      }
    };
    //geolocation Script
    var isPlatformReady = false;

    $ionicPlatform.ready(function () {

      $ionicLoading.show({
        template: '<ion-spinner  class="spinner-energized" icon="ripple"></ion-spinner><br/>Acquiring current location!',
        duration: 80000
      });
      /*var posOptions = {
       enableHighAccuracy: true,
       timeout: 50000,
       maximumAge: 0
       };*/

      /!*var watchID = navigator.geolocation.watchPosition($cordovaGeolocation.getCurrentPosition);*!/


      $scope.getHomeLocation = function () {
        isPlatformReady = true;
        if (processing)return;
        processing = true;
        getDirectionService.getPosition().then(function (position) {

          processing = false;
          $scope.lat = position.coords.latitude;
          $scope.long = position.coords.longitude;
          var myLatlng = new google.maps.LatLng($scope.lat, $scope.long);

          var contentString = "<div>I'm Here</div>";
          var compiled = $compile(contentString)($scope);

          var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(document.getElementById("map"), mapOptions);

          var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          // marker class created
          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Im here!',
            icon: 'http://chionw.stud.if.ktu.lt/img/Logo/download.png'
          });
          //marker.addListener('click', toggleBounce);

          /*function toggleBounce() {
           if (marker.getAnimation() !== null) {
           marker.setAnimation(null);
           } else {
           marker.setAnimation(google.maps.Animation.BOUNCE);
           }
           }*/

          google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker)
          });
          $scope.map = map;
          $ionicLoading.hide();

        }, function (err) {
          $ionicLoading.hide();
          alert("unable to get location:" + err.message, "Error");
          $ionicBackdrop.release();
        });
      };

      HomeMapInterval = $interval($scope.getHomeLocation, 10000);

      $scope.$on("$ionicView.enter", function (event, data) {
        // handle event
        if (isPlatformReady)
          HomeMapInterval = $interval($scope.getHomeLocation, 10000);
      });
      $scope.$on("$ionicView.leave", function (event, data) {
        // handle event
        getDirectionService.clearInterVal(HomeMapInterval);

      });

    });

  })
  .controller('BankDetailCtrl', function ($scope, $rootScope, $window, getDirectionService, $cordovaDialogs, $log, $ionicHistory, $state, $location, $ionicLoading, $interval, $compile, $ionicSideMenuDelegate, $stateParams, $ionicBackdrop, $cordovaGeolocation, $ionicPlatform, Buildings) {
    var processing = false;
    var bankDestInterval;
    $ionicPlatform.ready(function () {
      $ionicLoading.show({
        template: '<ion-spinner  class="spinner-energized" icon="ripple"></ion-spinner><br/>Acquiring current location!',
        duration: 12000
      });
      $scope.bank_Name = $stateParams.name;
      $scope.bank_has_branch = [];
      var showCord = [];
      Buildings.getBankBranch().then(function (res) {
        $scope.branch = res.data;
        angular.forEach($scope.branch.data, function (key) {
          if (key.Bank_Type == $scope.bank_Name) {
            $scope.bank_has_branch.push(key);

            showCord.push([key.Cord, key.Bank_Branch]);
          }
        });

        //geolocation Script

        getDirectionService.getPosition().then(function (position) {

          $rootScope.LatLong = {lat: position.coords.latitude, lng: position.coords.longitude};
          // $scope.myLoc = position.coords;
          // var lat = position.coords.latitude;
          // var long = position.coords.longitude;
          // var myLatlng = new google.maps.LatLng(lat, long);lemme see the controller for facul

          var mapOptions = {
            center: $rootScope.LatLong,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          var contentString = "<div><button> Take me here</button></div>";
          var compiled = $compile(contentString)($scope);
          /*alert(typeof locations);*/

          var map = new google.maps.Map(document.getElementById("map-3"), mapOptions);
          //var infowindow = new google.maps.InfoWindow();
          var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          var marker, i;

          var locations = showCord;

          for (i = 0; i < locations.length; i++) {
            var cord = (locations[i][0].toString().split(","));
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(cord[0], cord[1]),
              map: map
            });

            google.maps.event.addListener(marker, 'click', (function (marker, i) {

              return function () {
                infowindow.setContent(locations[i][1]);
                infowindow.open(map, marker);
                var duration = 2000;

                $ionicLoading.show({
                  template: '<ion-spinner  class="spinner-energized" icon="ripple"></ion-spinner><br/>Calculating Route!',
                  duration: 6000
                });

                function updateRoute() {
                  if (processing)return;
                  processing = true;
                  setTimeout(function () {
                    getDirectionService.getDirections(locations[i][0], 'map-3');
                    processing = false;
                    $scope.userDestination = locations[i][1];
                    $ionicLoading.hide();
                  }, duration);
                }

                bankDestInterval = $interval(updateRoute, 6000);
              }
            })(marker, i));
          }

          var myLocation = new google.maps.Marker({
            position: $rootScope.LatLong,
            map: map,
            title: 'Im here!',
            icon: 'http://chionw.stud.if.ktu.lt/img/Logo/download.png'
          });
          google.maps.event.addListener(myLocation, 'click', (function (myLocation) {
            return function () {
              infowindow.setContent("I am here");
              infowindow.open(map, myLocation);
            }
          })(myLocation));

          google.maps.event.addListener(myLocation, 'click', function () {
            infowindow.open(map, myLocation)
          });

          $scope.map = map;
          // console.log($scope.map)

          $ionicLoading.hide();
        }, function () {
          $ionicLoading.hide();
          var message = "Failed to Acquire Current location";
          var title = "Error";
          var button_name = "Ok";
          $cordovaDialogs.alert(message, title, button_name)
            .then(function () {
              event.preventDefault();
              $state.go('tab.banks');
            });
          $ionicBackdrop.release();
        });
      });
    });
    $scope.$on("$ionicView.leave", function () {
      getDirectionService.clearInterVal(bankDestInterval);
    });
    $scope.$on("$ionicView.afterLeave", function () {
      getDirectionService.clearInterVal(bankDestInterval);
    })
  })
  .controller('buildingsCTRL', function ($scope, $state, $translate, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>Loading Content',
      duration: 500000
    });
    $scope.hideHeader = false;
    $scope.hideSearch = true;

    // TODO: finish this

    //console.log($state.current.name);
    $scope.showSearch = function (event) {
      event.preventDefault();
      $scope.hideHeader = true;
      $scope.hideSearch = false;
    };
    $scope.removeSearch = function (event) {
      event.preventDefault();
      $scope.hideHeader = false;
      $scope.hideSearch = true;
    };
    switch ($state.current.name) {
      case 'tab.faculties':
        Buildings.getFaculty(function (res) {
          $scope.faculty = res.data;
          $ionicLoading.hide();
        });
        break;
      case 'tab.dormitories':
        Buildings.getDormitory(function (res) {
          $scope.domitory = res.data;
          //console.log($scope.faculty);
          $ionicLoading.hide();
        });
        break;
      case 'tab.SportCenter':
        Buildings.getSportCenter(function (res) {
          $scope.sport = res.data;
          //console.log($scope.faculty);
          $ionicLoading.hide();
        });
        break;
      default:
        $ionicLoading.hide();
        break;

    }

  })
  .controller('eventsCTRL', function ($scope, $state, $location, Buildings, $ionicLoading) {
    $scope.hideHeader = false;
    $scope.hideSearch = true;

    // TODO: finish this
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 5000000
    });
    //console.log($state.current.name);
    $scope.showSearch = function (event) {
      event.preventDefault();
      $scope.hideHeader = true;
      $scope.hideSearch = false;
    };
    $scope.removeSearch = function (event) {
      event.preventDefault();
      $scope.hideHeader = false;
      $scope.hideSearch = true;
    };

    switch ($state.current.name) {
      case 'tab.news-detail':
        Buildings.getNews(function (res) {
          $scope.news = res.data;
          //console.log($scope.news);
          $ionicLoading.hide();
        });
        break;
      case 'tab.leisure-detail':
        Buildings.getLeisure(function (res) {
          $scope.leisure = res.data;
          //console.log($scope.leisure);
          $ionicLoading.hide();
        });
        break;
      case 'tab.conference-detail':
        Buildings.getConference(function (res) {
          $scope.conference = res.data;
          //console.log($scope.conference);
          $ionicLoading.hide();
        });
        break;
      default:
        $ionicLoading.hide();
        break;
    }
  })
  .controller('bankCTRL', function ($scope, $state, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>',
      duration: 50000
    });

    switch ($state.current.name) {
      case'tab.banks-second':
        Buildings.getBank(function (res) {
          $scope.bank = res.data;
          $ionicLoading.hide();
        });

        Buildings.getBankBranch(function (res) {
          $scope.branch = res.data;
          $ionicLoading.hide();
        });

        break;
      default:
        $ionicLoading.hide();
        break;
    }
  })

  .controller('contactCTRL', function ($scope, Buildings, $ionicLoading, $sce) {
    $scope.hideBtnNext = true;
    $scope.hideBtnprevious = true;

    $scope.btn_count = 0;
    $scope.rowsCount = 0;
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>',
      duration: 30
    });
    $scope.getContact = function (name) {
      $scope.contact = "";
      $scope.rowsCount = 0;
      Buildings.getContactDetail(name, 0, function (res) {
        $scope.contact = res[0];
        $scope.trustedHtml = $sce.trustAsHtml($scope.contact);
      }).then(function () {
        Buildings.getContactDetail(name, 0, function (res) {
          $scope.contact = res[0];

          var d = document.getElementsByClassName("total_rows");

          for (var i = 0; i < d.length; i++) {
            $scope.rowsCount = d[i].getElementsByClassName("placeholder")[i].innerText;
          }
          $scope.reduced = $scope.rowsCount;
          $scope.rowsCount -= 10;

          if ($scope.rowsCount > 10) {
            $scope.hideBtnNext = false;
          }
          else {
            $scope.hideBtnNext = true;
          }
        })
      })
    };
    $scope.nextData = function (name, n) {
      $scope.btn_count++;
      $scope.btn_count = n + $scope.btn_count;

      if ($scope.rowsCount > 0) {
        Buildings.getContactDetail(name, $scope.btn_count, function (res) {
          $scope.contact = res[0];
          $scope.trustedHtml = $sce.trustAsHtml($scope.contact);
          if ($scope.rowsCount) {
            $scope.rowsCount -= 10;
            $scope.hideBtnprevious = false;
          }
        })
      } else {
        $scope.hideBtnNext = true;

      }
    };

    $scope.previousData = function (name, n) {
      $scope.btn_count--;
      $scope.rowsCount += 10;
      if ($scope.rowsCount == $scope.reduced) {
        $scope.hideBtnprevious = true;
      }
      if ($scope.rowsCount <= $scope.reduced) {
        Buildings.getContactDetail(name, $scope.btn_count, function (res) {
          $scope.contact = res[0];
          $scope.trustedHtml = $sce.trustAsHtml($scope.contact);
          $scope.hideBtnNext = false;
        })
      } else {
        $scope.hideBtnprevious = true;
      }
    }

  })
  .controller('helpCTRL', function ($scope, $state, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>Loading Content',
      duration: 3000000
    });

    switch ($state.current.name) {
      case 'help':
        Buildings.getAppHelp(function (res) {
          $scope.help = res.data;
          $ionicLoading.hide();
        });
        break;
      default:
        $ionicLoading.hide();
        break;
    }
  })
  .controller('cafeCTRL', function ($scope, $state, Buildings, $ionicLoading, $stateParams) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>Loading Content',
      duration: 3000000
    });

    $scope.building_Name = $stateParams.name;
    $scope.cafe_has_building = [];
    $scope.hasCafe = true;

    switch ($state.current.name) {
      case 'tab.cafes':
        Buildings.getCafe(function (res) {
          $scope.cafe = res.data;

          angular.forEach($scope.cafe, function (key, index) {
            if (key.Cafe_building == $scope.building_Name) {
              $scope.cafe_has_building.push(key);
              //console.log($scope.cafe_has_building);
            }
          });
          if ($scope.cafe_has_building.length > 0)
            $scope.hasCafe = true;
          else
            $scope.hasCafe = false;
          Buildings.getMenu(function (res) {
            $scope.menu = res.data;
            //console.log($scope.cafe);
          });
          $ionicLoading.hide();
        });


        break;
      default:
        $ionicLoading.hide();
        break;
    }


  })

  .controller('interOfficeCtrl', function ($scope, $state, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>Loading Content',
      duration: 3000000
    });
    switch ($state.current.name) {
      case 'tab.international-office':
        Buildings.internationalOffice(function (res) {
          if (res.true) {
            $scope.interoffice = res.data;
            //$ionicLoading.hide();
          }
        });

        Buildings.getOfficeInfo(function (res) {
          $scope.officeInfo = res.data[0];
          $ionicLoading.hide();
        });
        break;

      default:
        $ionicLoading.hide();
        break;
    }


  })

  .controller('FacultyDetailCtrl', function ($scope, $state, $stateParams, Buildings, $ionicLoading) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 300000
    });
    //console.log($state.current.name);
    switch ($state.current.name) {
      case 'tab.faculty-details/:id':
        Buildings.getFaculty(function (res) {
          $scope.facultyDetail = Buildings.getFullDetail($stateParams.id);
          //console.log($scope.facultyDetail);tab.faculty-details/:id
          $ionicLoading.hide();
        });
        break;

      default:
        $ionicLoading.hide();
        break;
    }


  })
  .controller('DormitoryDetailCtrl', function ($scope, $ionicLoading, $state, $stateParams, Buildings) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 3000000
    });

    switch ($state.current.name) {
      case 'tab.dormitory-details':
        Buildings.getDormitory(function (res) {
          $scope.dormitoryDetail = Buildings.getFullDetail($stateParams.id);
          //console.log($scope.facultyDetail);tab.faculty-details/:id
          $ionicLoading.hide();
        });
        break;

      default:
        $ionicLoading.hide();
        break;
    }

  })
  .controller('SportDetailCtrl', function ($scope, $ionicLoading, $state, $stateParams, Buildings) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 5000000
    });
    switch ($state.current.name) {
      case 'tab.Sport-detail':
        Buildings.getSportCenter(function (res) {
          $scope.sportDetail = Buildings.getFullDetail($stateParams.id);
          //console.log($scope.facultyDetail);tab.faculty-details/:id
          $ionicLoading.hide();
        });
        break;

      default:
        $ionicLoading.hide();
        break;
    }
  })
  .controller('HelpDetailCtrl', function ($scope, $ionicLoading, $state, $stateParams, Buildings) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 500000
    });

    Buildings.getAppHelp(function (res) {
      $scope.helpDetail = Buildings.getFullDetail($stateParams.id);
      /*console.log($scope.helpDetail);*/
      $ionicLoading.hide();
    });
  })
  .controller('CafeDetailCtrl', function ($scope, $state, $ionicLoading, $stateParams, $window, Buildings) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 5000000
    });

    switch ($state.current.name) {
      case 'tab.cafes-details':
        Buildings.getCafe(function (res) {
          $scope.cafeDetail = Buildings.getCafeDetail($stateParams.name);
          $ionicLoading.hide();
        });
        Buildings.getMenu(function (res) {
          $scope.menus = Buildings.getCafeMenu($stateParams.name);
        });
        break;

      default:
        $ionicLoading.hide();
        break;
    }
  })
  .controller('EventDetailCtrl', function ($scope, $state, $ionicLoading, $window, $stateParams, Buildings) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android" ></ion-spinner><br/>Loading Content',
      duration: 3000000
    });

    switch ($state.current.name) {
      case 'tab.inner-news-detail':
        Buildings.getNews(function (res) {
          $scope.newsDetail = Buildings.getFullDetail($stateParams.id);
          //console.log($scope.newsDetail);
          $ionicLoading.hide();
        });
        break;
      case 'tab.inner-leisure-detail':
        Buildings.getLeisure(function (res) {
          $scope.leisureDetail = Buildings.getFullDetail($stateParams.id);
          $ionicLoading.hide();
        });

        break;
      case 'tab.inner-conference-detail':
        Buildings.getConference(function (res) {
          $scope.conferenceDetail = Buildings.getFullDetail($stateParams.id);
          $ionicLoading.hide();
        });
        break;
      default:
        $ionicLoading.hide();
        break;
    }
  })
  .controller('InfoDetailCTRL', function ($scope, Buildings, $ionicLoading, $stateParams) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="android"></ion-spinner><br/>',
      duration: 500000
    });

    Buildings.getInfo(function (res) {
      $scope.infoDetail = Buildings.getFullDetail($stateParams.id);
      $ionicLoading.hide();
    })
  })


  .controller('postCtrl', function ($scope, $rootScope, Buildings, $cordovaDialogs) {
    //renders ng-model
    $scope.EventsData = {
      title: "",
      type: "",
      time: "",
      date: new Date(),
      location: "",
      desc: "",
      img: []// array base64, name, size img['name','size','base64']; do u upstand?

    };
    $scope.EventTime = {
      time: "" //this is where we take and store the time the user enters...
    };

    $scope.postData = function (data, tableName, lang) {

      Buildings.addData(data, tableName, lang, function (response) {
        if (response.true) {
          var message = "Wait for Approval";
          var title = "Successful";
          var button_name = "ok";
          $cordovaDialogs.alert(message, title, button_name)
            .then(function () {
              $scope.EventsData = { // to reset the form after submit is true..
                title: "",
                type: "",
                time: "",
                date: new Date(),
                location: "",
                desc: "",
                img: []

              };
              $scope.EventTime = {
                time: ""
              };
            });
        } else {
          var message = "Something Went Awfully Wrong. Contact us if problem continues";
          var title = "Error";
          var button_name = "ok";
          $cordovaDialogs.alert(message, title, button_name)
            .then(function () {
              // callback success
            });
        }
      })
    };


    $scope.addPost = function (tableName) {

      var myDate = $scope.EventTime.time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");//convert the time set by the user to string

      $scope.EventsData.time = myDate;//set EventsData.time to the time set by the user
      //console.log($scope.EventsData.time);

      angular.forEach($scope.EventsData, function (value, key) {
        //console.log(value);
        if (value === undefined || value === "")
          $scope.isEmptyFields = true
      });
      if (!$scope.isEmptyFields) {
        // var result = [];
        switch ($rootScope.currentLanguage) {
          case 'eng':
            $scope.postData($scope.EventsData, tableName, ($rootScope.currentLanguage));

            break;
          case 'lt':
            $scope.postData($scope.EventsData, tableName, ($rootScope.currentLanguage));

            break;
          default:
            alert("something went wrong!! Contact Admin for support");
        }
      } else {
        //console.log($scope.isEmptyFields);
        alert(" fill all the fields in the form"); //lol  i dont get it..where did u call the guy its not suppose to
      }
    }
  })

  .controller('BuildingLocationCtrl', function ($scope,$ionicLoading, $interval, getDirectionService, $rootScope, $ionicPopup, $state, $location, $stateParams) {

    $scope.buildingLocation = function (cord) {
      $scope.location_coord = cord;
      var dest = $scope.location_coord;
      $scope.map = "";
      ionic.Platform.ready(function () {
        $scope.map = getDirectionService.getDirections(dest, "map-2");
        $ionicLoading.hide();
        $state.go("tab.direction", {dest:dest});
      });
    };
  })

  .controller('WatchPosCtrl', function ($rootScope,$interval,$ionicBackdrop, $stateParams, $cordovaGeolocation, $ionicPopup, $state, $scope, $ionicLoading, getDirectionService) {
    $ionicLoading.show({
      template: '<ion-spinner  class="spinner-energized" icon="ripple"></ion-spinner><br/>Acquiring Direction, Please Wait!',
      duration: 8000000
    });

    //TODO: destroy the interval
    var buildingDirectionVal = "";
    var processing = false;

    function buildingDirection() {
      $ionicLoading.hide();
      if (processing)return;
      processing = true;
      $scope.map = getDirectionService.getDirections($stateParams.dest, "map-2");
      processing = false;
    }

    buildingDirectionVal = $interval(buildingDirection, 5000);

    $scope.$on("$ionicView.leave", function () {
      getDirectionService.clearInterVal(buildingDirectionVal);
    });
  });

//END->

