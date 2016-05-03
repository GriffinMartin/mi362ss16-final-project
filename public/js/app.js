angular.module("restaurantsApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    restaurants: function(Restaurants) {
                        return Restaurants.getRestaurants();
                    }
                }
            })
            .when("/new/restaurant", {
                controller: "NewRestaurantController",
                templateUrl: "restaurant-form.html"
            })
            .when("/restaurant/:restaurantId", {
                controller: "EditRestaurantController",
                templateUrl: "restaurant.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Restaurants", function($http) {
        this.getRestaurants = function() {
            return $http.get("/restaurants").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding restaurants.");
                });
        }
        this.createRestaurant = function(restaurant) {
            return $http.post("/restaurants", restaurant).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating restaurant.");
                });
        }
        this.getRestaurant = function(restaurantId) {
            var url = "/restaurants/" + restaurantId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this restaurant.");
                });
        }
        this.editRestaurant = function(restaurant) {
            var url = "/restaurants/" + restaurant._id;
            console.log(restaurant._id);
            return $http.put(url, restaurant).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this restaurant.");
                    console.log(response);
                });
        }
        this.deleteRestaurant = function(restaurantId) {
            var url = "/restaurants/" + restaurantId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this restaurant.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(restaurants, $scope) {
        $scope.restaurants = restaurants.data;
    })
    .controller("NewRestaurantController", function($scope, $location, Restaurants) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveRestaurant = function(restaurant) {
            Restaurants.createRestaurant(restaurant).then(function(doc) {
                var restaurantUrl = "/restaurant/" + doc.data._id;
                $location.path(restaurantUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditRestaurantController", function($scope, $routeParams, Restaurants) {
        Restaurants.getRestaurant($routeParams.restaurantId).then(function(doc) {
            $scope.restaurant = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.restaurantFormUrl = "restaurant-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.restaurantFormUrl = "";
        }

        $scope.saveRestaurant = function(restaurant) {
            Restaurants.editRestaurant(restaurant);
            $scope.editMode = false;
            $scope.restaurantFormUrl = "";
        }

        $scope.deleteRestaurant = function(restaurantId) {
            Restaurants.deleteRestaurant(restaurantId);
        }
    });
