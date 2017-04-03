var Observable = require("FuseJS/Observable");

var userEmail = Observable("");
var userPassword = Observable("");
var userConfirmPassword = Observable("");
var errorMessage = Observable("");

// 회원가입
function signUp(){
    var email = userEmail.value;
    var password = userPassword.value;

    // local 유효성 검사
    var localErrMsg = checkLocalValidation();
    if (localErrMsg.length > 0){
        onError(localErrMsg, 0);
        return;
    }

    // Firebase Email 을 통한 계정 생성
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(user) {
        // 성공
        console.log("Signup successful");
        signedIn(user);
    }).catch(function(e) {
        // 실패
        console.log("Signup failed: " + e);
        onError(e, -1);
    });
}

// local 유효성 검사
function checkLocalValidation(){
    if (userEmail.value.length == 0){
        return "Please Input Email adress.";
    }
    if (userEmail.value.length < 5){
        return "The Email adress is too short.";
    }
    if (userPassword.value.length < 6){
        return "Password should be at least 6 characters.";
    }
    if (userPassword.value.trim() !== userConfirmPassword.value.trim()){
        return "Password confirmation doesn't match password.";
    }
    return "";
};

// 로그인 성공
function signedIn(user){
    // console.log("user" + JSON.stringify(user));
    writeUserData(user.uid, user.email);
    router.goto("home");   
}

function writeUserData(uId, email) {
  firebase.database().ref('users/' + uId)
  .set({
    username: '',
    email: email,
    profile_picture : '',
    introduction : ''
  });
}

// 회원가입 취소
function cancel(){
    userEmail.value = "";
    userPassword.value = "";
    userConfirmPassword.value = "";
    errorMessage.value = "";
    router.goBack();
}

// 에러 메시지 처리
function onError(errorMsg, errorCode) {
    console.log("ERROR(" + errorCode + "): " + errorMsg);
    errorMessage.value = errorMsg.toString();
};

module.exports = {
    userEmail: userEmail,
    userPassword: userPassword,
    userConfirmPassword: userConfirmPassword,
    errorMessage: errorMessage,

    signUp: signUp,
    cancel: cancel
}