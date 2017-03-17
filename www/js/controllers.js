angular.module('starter.controllers', ['ionic', 'ngCordova', 'ngAutocomplete', 'ngMaterial', 'ngAria', 'ngAnimate'])

.factory('cordova', function () {
  return {
	  test: function(){
		  document.addEventListener("deviceready", this.ready, false);
	  },
	  ready: function(){
		  cordova.plugins.locationAccuracy.request(onRequestSuccess, onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
		  cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
	if (!enabled) {
		cordova.plugins.diagnostic.switchToLocationSettings();
	} else {
		console.log("GPS Already enabled");
	}
});
	  }
  }
  
function onRequestFailure(error){
    console.error("Accuracy request failed: error code="+error.code+"; error message="+error.message);
    if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
        if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
            cordova.plugins.diagnostic.switchToLocationSettings();
        }
    }
}

function onRequestSuccess(success){
    console.log("Successfully requested accuracy: "+success.message);
}
})

.controller('HomeCtrl', function($scope, cordova) {
	cordova.test();
})

.controller('UPSFeedCtrl', function($scope, $http, $ionicPopup, $cordovaGeolocation, $state, $ionicLoading, $timeout){

$scope.startSerialScan = function() {
	$ionicLoading.show({
          template: 'Scanning Barcode....'
       });
    $timeout(function() {
        $ionicLoading.hide();
        window.cordova.plugins.barcodeScanner.scan(
            function (result) {
			 $scope.$apply(function () {
				$scope.upsfeed.serial = result.text; 
         });
            }
        );
    }, 2000, false);
};

$scope.startModelScan = function() {
	$ionicLoading.show({
          template: 'Scanning Barcode....'
       });
    $timeout(function() {
        $ionicLoading.hide();
        window.cordova.plugins.barcodeScanner.scan(
            function (result) {
			$scope.$apply(function () {
				$scope.upsfeed.model = result.text; 
         });
            }
        );
    }, 2000, false);
};

$scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Save UPSFeed Data',
     template: 'Do you want to save this data?'
   });
   
   var data = $scope.upsfeed;

   confirmPopup.then(function(res) {
     if(res) {
			 var permissions = cordova.plugins.permissions;
			 
			 permissions.requestPermission(permissions.ACCESS_COARSE_LOCATION, function(result) {
					var posOptions = {timeout: 20 * 1000, enableHighAccuracy: true};
				$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
				var latitude  = position.coords.latitude;
				var longitude = position.coords.longitude;
				data.latitude = latitude;
				data.longitude = longitude;
				data.registrationDate = new Date().toDateString();
				console.log(latitude + '   ' + longitude);
				
				$http.post('https://api.mlab.com/api/1/databases/upsfeed/collections/upsfeed?apiKey=9_UAQKj-nxOYlPC8e0GdQKtx-z4561vT', data).success(function (upsfeed) {
					console.log(upsfeed);
					$scope.upsfeed.serial = "";
					$scope.upsfeed.model = "";
				});
				
				}, function(err) {
					console.log("GetCurrentPosition" + err);
				});

				var watchOptions = {timeout : 10000, enableHighAccuracy: true};
				var watch = $cordovaGeolocation.watchPosition(watchOptions);

				watch.then(null,function(err) {
				console.log(err);
				},

				function(position) {
				var latitude  = position.coords.latitude;
				var longitude = position.coords.longitude;
				data.latitude = latitude;
				data.longitude = longitude;
				console.log(latitude + '' + longitude);
				}
				);
				watch.clearWatch();
        }, function(err) {
			console.log("Location Permission denied" + err);
        });
     } else {
       console.log('User clicked cancel button on the popover dialog...');
     }
   });
 };
 
$scope.reset = function() {
	$scope.upsfeed.name = '';
	$scope.upsfeed.contact = '';
	$scope.upsfeed.email = '';
	$scope.upsfeed.address = '';
	$scope.upsfeed.serial = '';
	$scope.upsfeed.model = '';
	$scope.upsfeedform.$setPristine();
}; 

})

.controller('AboutCtrl', function($scope) {

})

.controller('IonGoogleAutocompleteController', function ($scope) {
                    $scope.data = {};
})

.controller('ScanDetailCtrl', function($scope, $rootScope, $stateParams) {
      var scannedProduct = $stateParams.scannedProduct;

      $rootScope.scannedProduct = scannedProduct;
})

.controller('ModelScanCtrl', function($scope, $rootScope, $state, $ionicLoading, $timeout) {

    $scope.startScan = function() {
       $ionicLoading.show({
          template: 'Scanning Barcode....'
       });
	$scope.upsfeed = {};
    $timeout(function() {
        $ionicLoading.hide();
        window.cordova.plugins.barcodeScanner.scan(
            function (result) {
			$scope.$apply(function () {
				$scope.upsfeed.model = result.text; 
         });
            }
        );
    }, 2000, false);
}
})

.controller('SerialScanCtrl', function($scope, $rootScope, $state, $ionicLoading, $timeout) {

    $scope.startScan = function() {
       $ionicLoading.show({
          template: 'Scanning Barcode....'
       });
	$scope.upsfeed = {};
    $timeout(function() {
        $ionicLoading.hide();
        window.cordova.plugins.barcodeScanner.scan(
            function (result) {
			 $scope.$apply(function () {
				$scope.upsfeed.serial = result.text; 
         });
            }
        );
    }, 2000, false);
}
})

.controller('MapViewCtrl', function($scope, $http, $ionicPlatform, $cordovaGeolocation) {

		var GreenPinColor = "69fe75";
		
		var GreenPinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + GreenPinColor,
  new google.maps.Size(21, 34),
  new google.maps.Point(0,0),
  new google.maps.Point(10, 34));
  
  var RedPinColor = "FE7569";
var RedPinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + RedPinColor,
  new google.maps.Size(21, 34),
  new google.maps.Point(0,0),
  new google.maps.Point(10, 34));
  
  var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
  new google.maps.Size(40, 37),
  new google.maps.Point(0, 0),
  new google.maps.Point(12, 35));

	
$scope.findGeoLocationOfUPS = function() {

var posOptions = {timeout: 20 * 1000, enableHighAccuracy: true};
				$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
				var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					var mapOptions = {
      center: latLng,
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
				});
		
		$http.get('https://api.mlab.com/api/1/databases/upsfeed/collections/upsfeed?apiKey=9_UAQKj-nxOYlPC8e0GdQKtx-z4561vT').success(
        function(response) {
          response.forEach(function(doc) {
            var latitude = doc.latitude;
            var longitude = doc.longitude;
			var title = "UPS Map Data";
			var description = "Customer Name : " + doc.name + "<br>" + "UPS Serial : " + doc.serial + "<br>" + "UPS Model : " + doc.model;
            
			
		// Creating a global infoWindow object that will be reused by all markers
		var infoWindow = new google.maps.InfoWindow();

				latLng = new google.maps.LatLng(latitude, longitude);
				
				var today = new Date();
				
				var registrationDate = new Date(doc.registrationDate);
				
				var twoYearsBeforeDateFromToday = new Date(new Date().setFullYear(new Date().getFullYear() - 2));
				
				if (twoYearsBeforeDateFromToday > registrationDate) {
					// Creating a marker and putting it on the map
					var marker = new google.maps.Marker({
						position: latLng,
						map: $scope.map,
						title: title,
						icon:RedPinImage,
						shadow:pinShadow
					});
				} else {
					// Creating a marker and putting it on the map
					var marker = new google.maps.Marker({
						position: latLng,
						map: $scope.map,
						title: title,
						icon:GreenPinImage,
						shadow:pinShadow
					});
				}

			// Creating a closure to retain the correct data, notice how I pass the current data in the loop into the closure (marker, data)
			(function(marker) {

				// Attaching a click event to the current marker
				google.maps.event.addListener(marker, "click", function(e) {
					infoWindow.setContent(description);
					infoWindow.open($scope.map, marker);
				});


			})(marker);
          });
   });	
}

$scope.$on( "$ionicView.enter", function( scopes, states ) {
            if( states.fromCache && states.stateName == "tab.mapview" ) {
                $scope.findGeoLocationOfUPS();
            }
        });

$ionicPlatform.ready(function() {
		$scope.findGeoLocationOfUPS();
	});
});