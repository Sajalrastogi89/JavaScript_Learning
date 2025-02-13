var myNinjaApp=angular.module("myNinjaApp",[]);
let a;
myNinjaApp.config(function(){
  a=10;
});

myNinjaApp.run(function(){
  console.log(a);
});

myNinjaApp.controller(function(){

})