var Observable = require("FuseJS/Observable");

// Firebase 초기화
if (typeof firebase === "undefined") {
  firebase = require('fuse-firebase');
  // Initialize Firebase
  var config = require('firebase-config');
  // firebase.database.enableLogging(true);
  firebase.initializeApp(config);
}

// Observable("") 의 "" 는 초기값
var userEmail = Observable("");
var userPassword = Observable("");
var errorMessage = Observable("");

// Email 로그인 요청
function signInWithEmail() {
 	var email = userEmail.value;
 	var password = userPassword.value;
    
  // Firebase Email 인증 요청
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(function(user) {
      // 인증 성공
      console.log("Signin successful");
      signedIn(user);
  }).catch(function(e) {
      // 인증 실패
      console.log("SignIn failed: " + e);
      onError(e, -1);
  });
};

// 로그인 성공
function signedIn(user){
    router.goto("home");    // goto() 로 이동시 history 없이 이동하므로 뒤로가기 불가
}

// 회원가입 이동 
function signUp(){
    router.push("signup");  // push() 로 이동시 history 를 가지고 이동하므로 뒤로가기 가능
}

// 에러 메시지 처리
function onError(errorMsg, errorCode) {
    console.log("ERROR(" + errorCode + "): " + errorMsg);
    errorMessage.value = errorMsg.toString();
};

module.exports = {
    userEmail: userEmail,
    userPassword: userPassword,
    errorMessage: errorMessage,

    signInWithEmail: signInWithEmail,
    signUp: signUp,
}