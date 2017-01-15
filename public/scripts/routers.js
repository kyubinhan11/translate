(function () {
'use strict';

angular.module("mainApp")
.config(RoutesConfig);

RoutesConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
function RoutesConfig($stateProvider, $urlRouterProvider) {

  // Redirect to home page if no other URL matches
  $urlRouterProvider.otherwise('/');

  // *** Set up UI states ***
  $stateProvider

  // Home page
  .state('home', {
    url: '/',
    templateUrl: 'template/home.template.html',
    controller: 'MainController as mainCtrl',
    resolve: {
      arrayOfPath: ['$stateParams', function($stateParams){
                return ["ExpressEntry", "Home", 8];
      }]
    }
  })
  .state('twoParameters', {
    url: '/{category}/{numOfPara}',
    templateUrl: 'template/mainContents.template.html',
    controller: 'MainController as mainCtrl',
    resolve: {
      arrayOfPath: ['$stateParams',
            function ($stateParams) {
              // console.log([$stateParams.category, parseInt($stateParams.numOfPara)]);
              // return ["ExpressEntry", "Home"];
              // return [$stateParams.category, $stateParams.para1];
              return [$stateParams.category, parseInt($stateParams.numOfPara)];

            }]
    }
  })
  .state('threeParameters', {
    url: '/{category}/{para1}/{numOfPara}',
    templateUrl: 'template/mainContents.template.html',
    controller: 'MainController as mainCtrl',
    resolve: {
      arrayOfPath: ['$stateParams',
            function ($stateParams) {
              // console.log([$stateParams.category, $stateParams.para1, parseInt($stateParams.numOfPara)]);
              return [$stateParams.category, $stateParams.para1, parseInt($stateParams.numOfPara)];

            }]
    }
  })
  .state('fourParameters', {
    url: '/{category}/{para1}/{para2}/{numOfPara}',
    templateUrl: 'template/mainContents.template.html',
    controller: 'MainController as mainCtrl',
    resolve: {
      arrayOfPath: ['$stateParams',
            function ($stateParams) {
              // console.log([$stateParams.category, $stateParams.para1, parseInt($stateParams.numOfPara)]);
              return [$stateParams.category, $stateParams.para1, $stateParams.para2,parseInt($stateParams.numOfPara)];

            }]
    }
  });


}

})();
