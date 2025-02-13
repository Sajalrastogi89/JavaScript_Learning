var myNinjaApp = angular.module("myNinjaApp", []);
let a;
myNinjaApp.config(function () {
  a = 10;
});

myNinjaApp.run(function () {
  console.log(a);
});

myNinjaApp.controller("NinjaController", [
  "$scope",
  function ($scope) {
    $scope.myFav = "red";
    $scope.ninjas = [
      {
        fName: "Hattori",
        belt: "green",
        rate: 900,
        available: true
      },
      {
        fName: "Kasama",
        belt: "orange",
        rate: 1000,
        available: false
      },
      {
        fName: "ryi",
        belt: "blc",
        rate: 800,
        available: true
      },
    ];
  },
]);
