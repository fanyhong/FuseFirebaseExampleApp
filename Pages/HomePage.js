var Observable = require("FuseJS/Observable");

var userName = Observable();
var userEmail = Observable();
var userIntroduction = Observable();
var serverMessage = Observable();
var allUsers = Observable();

var isSignOut = false;  // SignOut 요청시 Firebase 에서 SignOut 응답을 받기 전에 추가 입력 처리되는 오류를 방지하기 위한 FLAG
var user = firebase.auth().currentUser;
// console.log("user" + JSON.stringify(firebase.auth().currentUser));

// 로그아웃
function signOut() {
    isSignOut = true;
    firebase.auth().signOut()
    .then(function() {
        console.log("Signed Out");
        router.goto("splash");    
    }, function(error) {
        console.log("Sign Out Error" +  error);
        onError(error, -1);
    });
};

// 인증 관련 상태 변화에 따른 실시간 이벤트 처리
firebase.auth().onAuthStateChanged(function(user) {
    updateUserDetailsUI(user);
    if (user) {
        // User is signed in.
    } else {
        // No user is signed in.
    }
});

// UI 업데이트
function updateUserDetailsUI(user){
    if (user) {
        userEmail.value = user.email || '';
        userName.value = user.displayName || '';
        getUserIntroduction();
        getAllUsers();
        getServerMessage();
    } else {
        userEmail.value = '';
        userName.value = '';
        userIntroduction.value = '';
        user.uid = null;
    }
}

// Firebase database 로 부터 server message 읽어오기
function getServerMessage() {
    var serverMessageRef = firebase.database().ref('server_message');
    serverMessageRef.off();

    // 'value' 로 정적 스냅샷을 가져와 처리 (once() 를 사용, firebase 해당값 또는 하위 노드를 한번만 읽어옴)
    serverMessageRef.once('value', function(snapshot){
        // console.log("getServerMessage: " + snapshot.val());
        serverMessage.value = snapshot.val();
    });
}

// Firebase database 로 부터
function getUserIntroduction(){
    var userIntroductionRef = firebase.database().ref('users/' + user.uid + '/introduction');
    userIntroductionRef.off();

    // 'value' 로 정적 스냅샷을 READ (on() 리스너를 사용해 참조하고 있는 firebase 해당값 또는 하위 노드 실시간 변경을 반영)
    userIntroductionRef.once('value', function(snapshot){
        // console.log("getUserIntroduction: " + snapshot.val());
        userIntroduction.value = snapshot.val() || '';
    });
}

// 입력값 변경시 Firebase database 에 실시간 반영
function setUserIntroduction(){
    if (!isSignOut && user != null){
        var userRef = firebase.database().ref('users/' + user.uid);
        userRef.off();
        userRef.update({ introduction: userIntroduction.value || '' });
        // console.log("userIntroduction.value: " + userIntroduction.value);
    }
}

// 전체 Users 목록을 얻는 처리 (email 로 정렬)
function getAllUsers(){
    if (!isSignOut && user != null){
        var usersRef = firebase.database().ref('users');
        usersRef.off();
        usersRef.on('value', function(snapshot){
            var allUsersData = snapshot.val();
            // console.log(JSON.stringify(allUsersData).toString()); 
            var allUsersList = [];
            for (var userData in allUsersData){
                // 개별 사용자 정보를 가지는 각 key(userData) 별 JSON Object 를 allUSersList 배열에 할당
                allUsersList.push(allUsersData[userData]);
                // console.log("User Email :" + allUsersData[userData]['email']);
            }
            // 사용자별 데이터를 담은 리스트를 email 로 정렬 후 allUsers observable 에 할당
            allUsersList.sort(function (a, b) {
                return a['email'] < b['email'] ? -1 : 1;
            }); 
            allUsers.replaceAll(allUsersList);
        });
    }
}

// userName 변경시 Firebaase user 에 반영
function setUserName(){
    if (!isSignOut && user != null){
        user.updateProfile({
            displayName: userName.value || '',
        }).then(function() {
            console.log("updateProfile successful: " + user.displayName);
            copyUserNameToUsers();
        }, function(error) {
            console.log("updateProfile failed: " + error.toString());
        });
    }
}

// Name 변경시 동일한 내용을 users/[user.uid]/username 에도 업데이트
function copyUserNameToUsers(){
    var userRef = firebase.database().ref('users/' + user.uid);
    userRef.off();
    userRef.update({ username: userName.value || '' });
}

module.exports = {
    userName: userName,
    userEmail: userEmail,
    userIntroduction: userIntroduction,
    serverMessage: serverMessage,
    allUsers: allUsers,

    signOut: signOut,
    setUserName: setUserName,
    setUserIntroduction: setUserIntroduction,
    getAllUsers: getAllUsers
};



// console.log("user" + JSON.stringify(firebase.auth().currentUser));
// sample results (not real)
/*
{
    "uid":"11dBb3sNwqdOdoaAAOqiVMDraaaa",
    "displayName":"Hong Gil Dong",
    "photoURL":"https://example.com/jane-q-user/profile.jpg",
    "email":"abc@abc.abc",
    "emailVerified":false,
    "isAnonymous":false,
    "providerData":[
    {
        "uid":"abc@abc.abc",
        "displayName":"abc@abc.abc",
        "photoURL":"https://example.com/jane-q-user/profile.jpg",
        "email":"abc@abc.abc",
        "providerId":"password"
    }
    ],
    "apiKey":"AIzaSyBTuBtqsiCwsZfRoig-d_CCFv3ugzJXJaa",
    "appName":"[DEFAULT]",
    "authDomain":"helloworld-abcd.firebaseapp.com",
    "stsTokenManager":{
        "apiKey":"AIzaSyBTuBtqsiCwsZfRoig-d_CCFv3ugzJXJaa",
        "refreshToken":"aaly3UXWtl5DOcud4d3mvmr1KLvWFJu9tXiaaa-h7rxww2eUcMHYVkKi3F8pmQ5yMwsWlxG6_79SsEDaWkSC0r16QRGgVnwHoNlIieXUOiCnKoJeWF2lPCoPnAWzCgQpuwTjihCvSSK93yjXAYPxCkgzd8eod8LiIgW7MW6gL04TlON-cmymAx7Igd-8E9SE9egdcOhXDgvTVbNJ8Ol_YQUg0n6OSLVitOghJyErE_euXb9ouf6q71I",
        "accessToken":"eyJhbGciOiJSaaaiIsImtpZCI6IjJjM2I5ZmUzZGaaaaaaakMzUyNzBmODc0NmIwYzVjNDNmYzIwZjkifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaGVsbG93b3JsZC1mZDA3NyIsIm5hbWUiOiJIV0FOSEVFIEhPTkciLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9qYW5lLXEtdXNlci9wcm9maWxlLmpwZyIsImF1ZCI6ImhlbGxvd29ybGQtZmQwNzciLCJhdXRoX3RpbWUiOjE0OTA3NjcyOTAsInVzZXJfaWQiOiIxMWRCYjNzTndxZE9kb2FBQU9xaVZNRHJrYjUzIiwic3ViIjoiMTFkQmIzc053cWRPZG9hQUFPcWlWTURya2I1MyIsImlhdCI6MTQ5MDc2NzI5MCwiZXhwIjoxNDkwNzcwODkwLCJlbWFpbCI6ImZhbnlob25nQGhhbm1haWwubmV0IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImZhbnlob25nQGhhbm1haWwubmV0Il19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.jvurvh4rtaOfKuCIAjy632dWKDil9tcI_1d87Km4OdF-1i7pYgr_mtFxJjS2z_PgEbd4Km_AwZkqu2a98sSY_guNhq8fc-8aeQB9FcPPHxPxnEp3eHtvNeNbFTW2Y2fK6IWf-tYsr9n_jMOB-9SKAN02524_z3Ze3sHH7IaxHhbq3jis4ULxeqXW7QXu6UZrnAXfiLmu2oHutKie_vpE4nkHOPe8WV-_LkNWKDkdIOAQzXrGHGawKGlz8qCKixZWf_6Ld7wTqudhq_Xr22ppjchyclunrF-kbcUgYEps4z-iTSZdaMDCve17-IxUBjt5Wt0cCP5DZIuuzXwxjjIUqg",
        "expirationTime":1490770890721
    },
    "redirectEventId":null
}
*/