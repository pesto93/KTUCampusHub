// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('KTU', ['ionic', 'ngCordova', 'ngSanitize', 'ngCookies', 'KTU.controllers', 'angularMoment', 'KTU.services', 'naif.base64', 'pascalprecht.translate'])
  .constant('API_URL', 'http://chionw.stud.if.ktu.lt/serverApi')

  .config(['$translateProvider', function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
      prefix: 'locale/locale_',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('eng');

    $translateProvider.useLocalStorage();

  }])

  .controller('LanguageController', ['$translate', '$state', '$rootScope', '$scope', function ($translate, $state, $rootScope, $scope) {
    $scope.langs = [{name: "eng"}, {name: "lt"}];
    $scope.changeLanguage = function () {
      $translate.use($scope.lng.name);
      $rootScope.currentLanguage = $scope.lng.name;
    };
  }])

  .controller('SettingsCtrl', function ($scope, $state, $interval, $log, $window, $rootScope, $localstorage, $ionicPlatform, $cordovaLocalNotification) {
    //$scope.enableNotify = false;
    var mode = $localstorage.get('mode');
    var notify = $localstorage.get('notify') || false;
    if (mode == "night-mode") {
      $rootScope.settings.nightMode = true;
    }
    if (notify == "true") {
      $rootScope.settings.notification = true;
    }

    $rootScope.changeMode = function () {
      if ($scope.settings.nightMode == true) {
        $rootScope.mode = "night-mode";
        $localstorage.set('mode', $rootScope.mode);
      } else {
        $rootScope.mode = "style";
        $localstorage.set('mode', $rootScope.mode);
      }
      //$state.go('tab.home');
      // $window.location.reload();
    };
    $ionicPlatform.ready(function () {
      if (notify == 'true') {
        $interval(function () {
          cordova.plugins.backgroundMode.configure({
            silent: true
          });
          $rootScope.setNotification();

        }, 30000);
      }

      $scope.scheduleSingleNotification = function () {
        if ($scope.settings.notification == true) {
          $rootScope.isNotify = true;
          $localstorage.set('notify', $rootScope.isNotify);
          cordova.plugins.backgroundMode.enable(); // you enabled it when true....
          // Called when background mode has been activated
          cordova.plugins.backgroundMode.onactivate = function () {
            $interval(function () {
              // Runs in the background when backgroundMode is active
              cordova.plugins.backgroundMode.configure({
                silent: true
              });
              $rootScope.setNotification();

            }, 10000);
          }
        } else {
          $rootScope.isNotify = false;
          $localstorage.set('notify', $rootScope.isNotify);
          cordova.plugins.backgroundMode.disable();
          //turn off background mode on false... lol check the doc.. ok go to moment ok.. lol

        }
      };
    });
  })

  .run(function ($ionicPlatform,$interval, $state, $window, $log, $location, Buildings, $ionicPopup, $rootScope, $translate, $localstorage) {
    $rootScope.settings = {
      nightMode: false,
      notification: false
    };

    $rootScope.mode = $localstorage.get('mode') || " ";
    $rootScope.isNotify = $localstorage.get('notify') || " ";


    if ($rootScope.mode == " " || $rootScope.mode == undefined || $rootScope.mode == "style") {
      $rootScope.mode = "style";
      $rootScope.settings.nightMode = false;
      //console.log($rootScope.mode);
    }
    if ($rootScope.isNotify == "" || $rootScope.isNotify == undefined || $rootScope.isNotify == "false") {
      $rootScope.isNotify = false;
      $rootScope.settings.notification = false;

    }
    if ($rootScope.mode == "night-mode") {
      $rootScope.settings.nightMode = true;
    }
    if ($rootScope.isNotify == "true") {
      $rootScope.settings.notification = true;
    }


    $ionicPlatform.ready(function () {
      $rootScope.currentLanguage = $translate.proposedLanguage() || $translate.use();

      //Added this: Need to check on real Device........................................................................
      if (window.cordova) {
        var duration = 3000;
        cordova.plugins.diagnostic.isLocationEnabled(
          function (enabled) {
            if (enabled)
              alert("Your GPS is enabled");
            else {
              setTimeout(function () {
                alert("Your GPS is disabled, Enable it");
                cordova.plugins.diagnostic.switchToLocationSettings();
              }, duration);
            }
          },
          function (error) {
            alert('The following error occurred:' + error);
          }
        );
      }
      //End.............................................................................................................

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          $ionicPopup.confirm({
            title: "Internet Disconnected",
            content: "The internet is disconnected on your device."
          }).then(function (result) {
            if (!result) {
              ionic.Platform.exitApp();
            }
          });
        }
      }
      $rootScope.setNotification = function () {
        var now = new Date().getTime(),
          _5_sec_from_now = new Date(now + 2 * 1000);

        var sound = device.platform == 'Android' ? 'file://sound/Police.mp3' : 'file://sound/beep.caf';

        //TODO: Check
        $rootScope.holdid = [];
        $rootScope.holdEvent = [];
        Buildings.getLeisure(function (res) {
          if (res.true) {
            $rootScope.holdLeisure = res.data;
          } else
            return;

          var tempId = $localstorage.get('leisureId') || 0;
          if (tempId == undefined) tempId = 0;
          for (var i = 0; i < res.data.length; i++) {
            $rootScope.holdEvent[i] = res.data[i];
          }
          angular.forEach($rootScope.holdEvent, function (key) {
            $rootScope.leisureId = key.id;
          });

          angular.forEach($rootScope.holdEvent, function (key) {
            if (key.id > tempId && key.status == "Approved") {

              cordova.plugins.notification.local.schedule({
                id: key.id,
                title: key.Title,
                at: _5_sec_from_now,
                sound: sound,
                icon: 'res://icon',
                smallIcon: 'res://ic_popup_reminder',
                data: {meetingId: "#123FG8"}
              });
            } else {

            }
          });
          $localstorage.set("leisureId", $rootScope.leisureId);
        });
        //TODO:  store last id inside local storage; but sometimes users can clear storage.
      };
    });

    $rootScope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        //console.log(event);
        //console.log(fromState.name);
        //console.log(toState.name);
        switch (fromState.name) {
          case "tab.home":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            //$location.path("/buildings/faculties");
            break;
          case "tab.direction":
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            //$location.path("/buildings/faculties");
            break;
          case"tab.buildings":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.banks":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.banks-second":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.events":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.news-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.inner-news-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.home") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.buildings") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.conference-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.inner-conference-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.home") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.buildings") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.leisure-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.inner-leisure-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.home") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.buildings") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.banks") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.banks-detail":
            if (toState.name == "tab.direction") {
              var to = "";
              to = "tab.buildings";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.faculties":
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.dormitories":
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.dormitory-details":
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
          case"tab.faculty-details/:id":
            if (toState.name == "tab.banks-detail") {
              var to = "";
              to = "tab.banks";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-news-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-conference-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            if (toState.name == "tab.inner-leisure-detail") {
              var to = "";
              to = "tab.events";
              event.preventDefault();
              $state.go(to);
            }
            break;
        }

        if (toState.name == "tab.banks") {

        }
      });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:
      .state('tab.buildings', {
        url: '/buildings',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/tab-KTU-building.html',
            controller: 'buildingsCTRL'
          }
        }
      })

      .state('tab.international-office', {
        url: '/buildings/international-office',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/international-office.html',
            controller: 'interOfficeCtrl'
          }
        }
      })

      .state('tab.faculties', {
        url: '/buildings/faculties',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/faculties.html',
            controller: 'buildingsCTRL'
          }
        }
      })

      .state('tab.dormitories', {
        url: '/buildings/dormitories',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/dormitories.html',
            controller: 'buildingsCTRL'
          }
        }
      })

      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('tab.banks', {
        url: '/bank',
        views: {
          'tab-banks': {
            templateUrl: 'templates/tab-bank-1.html',
            controller: 'bankCTRL'
          }
        }
      })
      .state('tab.banks-second', {
        url: '/bank/banks',
        views: {
          'tab-banks': {
            templateUrl: 'templates/tab-bank-2.html',
            controller: 'bankCTRL'
          }
        }
      })

      .state('tab.banks-detail', {
        url: '/banks/detail/:name',
        views: {
          'tab-banks': {
            templateUrl: 'templates/bank-detail.html',
            controller: 'BankDetailCtrl'
          }
        }
      })

      .state('tab.events', {
        url: '/events',
        views: {
          'tab-events': {
            templateUrl: 'templates/tab-events.html',
            controller: 'eventsCTRL'
          }
        }
      })

      .state('tab.news-detail', {
        url: '/events/news-details',
        views: {
          'tab-events': {
            templateUrl: 'templates/news-detail.html',
            controller: 'eventsCTRL'
          }
        }
      })
      .state('tab.leisure-detail', {
        url: '/events/leisure-details',
        views: {
          'tab-events': {
            templateUrl: 'templates/leisure-detail.html',
            controller: 'eventsCTRL'
          }
        }
      })
      .state('tab.conference-detail', {
        url: '/events/conference-details',
        views: {
          'tab-events': {
            templateUrl: 'templates/conference-detail.html',
            controller: 'eventsCTRL'
          }
        }
      })

      .state('tab.inner-news-detail', {
        url: '/events/news-details/description/:id',
        views: {
          'tab-events': {
            templateUrl: 'templates/inner-news-detail.html',
            controller: 'EventDetailCtrl'
          }
        }
      })
      .state('tab.inner-leisure-detail', {
        url: '/events/leisure-details/description/:id',
        views: {
          'tab-events': {
            templateUrl: 'templates/inner-leisure-detail.html',
            controller: 'EventDetailCtrl'
          }
        }
      })
      .state('tab.inner-conference-detail', {
        url: '/events/conference-details/description/:id',
        views: {
          'tab-events': {
            templateUrl: 'templates/inner-conference-detail.html',
            controller: 'EventDetailCtrl'
          }
        }
      })
      .state('tab.cafes', {
        url: '/buildings/cafes/:name',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/tab-cafes.html',
            controller: 'cafeCTRL'
          }
        }
      })

      .state('tab.cafes-details', {
        url: '/buildings/cafes-details/:name',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/cafes-detail.html',
            controller: 'CafeDetailCtrl'
          }
        }
      })

      .state('contacts', {
        url: '/contacts',
        templateUrl: 'templates/contact.html',
        controller: 'contactCTRL'
      })

      .state('settings', {
        url: '/settings',
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      })

      .state('help', {
        url: '/help',
        templateUrl: 'templates/help.html',
        controller: 'helpCTRL'
      })

      .state('help-details', {
        url: '/help/help-details/:id',
        templateUrl: 'templates/help-detail.html',
        controller: 'HelpDetailCtrl'
      })

      .state('info', {
        url: '/info',
        templateUrl: 'templates/info.html',
        controller: 'InfoCTRL'
      })

      .state('info-details', {
        url: '/info/info-details/:id',
        templateUrl: 'templates/info-detail.html',
        controller: 'InfoDetailCTRL'
      })

      .state('tab.eventForm', {
        url: '/events/add-event',
        views: {
          'tab-events': {
            templateUrl: 'templates/add-event-form.html',
            controller: 'postCtrl'
          }
        }
      })

      .state('tab.faculty-details/:id', {
        url: '/faculties/faculty-details/:id',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/faculties-detail.html',
            controller: 'FacultyDetailCtrl'
          }
        }
      })

      .state('tab.dormitory-details', {
        url: '/dormitories/dormitory-details/:id',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/dormitory-detail.html',
            controller: 'DormitoryDetailCtrl'
          }
        }
      })

      .state('tab.SportCenter', {
        url: '/sport',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/sports.html',
            controller: 'buildingsCTRL'
          }
        }
      })

      .state('tab.Sport-detail', {
        url: '/sport/sport-detail/:id',
        views: {
          'tab-buildings': {
            templateUrl: 'templates/sport-detail.html',
            controller: 'SportDetailCtrl'
          }
        }
      })

      /*state for building directions*/

      .state('tab.direction', {
        url: '/buildings/direction',
        params: {dest:null},
        views: {
          'tab-buildings': {
            templateUrl: 'templates/direction-map.html',
            controller: 'WatchPosCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

  });


//http://localhost/serverApi
//http://chionw.stud.if.ktu.lt/serverApi
//http://ktucampushub.pe.hu/serverApi
//http://ktucampus.byethost4.com/serverApi
