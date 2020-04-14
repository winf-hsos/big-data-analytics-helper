/* global firebasetools firebase moment */
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCy8ARoMCfB6KIirmsbgDmyVBioii7ASdI",
    authDomain: "big-data-analytics-helper.firebaseapp.com",
    databaseURL: "https://big-data-analytics-helper.firebaseio.com",
    projectId: "big-data-analytics-helper",
    storageBucket: "big-data-analytics-helper.appspot.com",
    messagingSenderId: "717795010905"
};

firebasetools.initialize(config);

var isAdmin = firebasetools.getURLParameterByName("admin", window.location) || false;
console.log(isAdmin);

var db = firebase.firestore();

/* This functions runs when the "add" button is pressed */
function go() {

    var screenName = document.querySelector('#screenName').value;
    screenName = screenName.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();

    console.log("ScreenName: >" + screenName + "<");

    if (screenName.startsWith('@')) {
        screenName = screenName.substr(1);
    }

    console.log("ScreenName: >" + screenName + "<");

    var user = firebase.auth().currentUser;
    var userExtract = user.email.split("@")[0];

    // Check if exists
    db.collection("twitter_accounts").doc(screenName).get().then((doc) => {

        if (doc.exists) {
            console.log(`Screen name > ${screenName} is already in database.`);

        }
        else {

            var screenNameObj = {};
            screenNameObj.screen_name = screenName;
            screenNameObj.date_added = firebase.firestore.Timestamp.fromDate(new Date())
            screenNameObj.next_scheduled_run = firebase.firestore.Timestamp.fromDate(new Date())
            screenNameObj.since_id = 1;

            db.collection("twitter_accounts").doc(screenName).set(screenNameObj).then(() => {
                document.querySelector('#screenName').value = "";
            });
        }

    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}

var screenNameArray = [];
var stopListening;
var stopListeningForRequests;

function getScreenNamesForGroup() {

    var currentUser = firebase.auth().currentUser
    var currentUserSplit = currentUser.email.split("@")[0];

    if (currentUserSplit == "prof" && isAdmin) {

        stopListening = db.collection("screennames")
            .onSnapshot(function (items) {

                screenNameArray.length = 0;

                items.forEach((item) => {

                    screenNameArray.push(item.data());

                });

                updateView();
            });

    }

    // Not an admin user or/and not admin flag in URL
    else {

        stopListening = db.collection("screennames").where("groups", "array-contains", currentUserSplit)
            .onSnapshot(function (items) {

                screenNameArray.length = 0;

                items.forEach((item) => {

                    if (item.data().groups.includes(currentUserSplit)) {
                        screenNameArray.push(item.data());
                    }
                });

                updateView();
            });
    }
}


function listenForProcessRequests() {

    var currentUser = firebase.auth().currentUser
    var currentUserSplit = currentUser.email.split("@")[0];

    stopListeningForRequests = db.collection("processrequests").where("group", "==", currentUserSplit)
        .onSnapshot(function (items) {

            if (items.length == 0) {
                document.querySelector('#processBtn').innerHTML = 'Process Results';
                document.querySelector('#processBtn').removeAttribute('disabled');
            }

            var hasOpenRequest = false;

            items.forEach((item) => {

                var req = item.data();

                if (req.group == currentUserSplit && req.status == 'open') {
                    hasOpenRequest = true;
                }

            });


            updateView();
        });
}

function updateView() {
    firebasetools.sortArrayBy(screenNameArray, "status");

    var list = document.querySelector('#userList');

    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    screenNameArray.forEach((s) => {

        var item = document.createElement('li');

        item.classList.add('list-group-item');

        if (s.status == '4_done') {
            item.innerHTML = '<i class="fas fa-check-square" style="color:green; margin-right:10px;"></i>&nbsp;';
        }
        else if (s.status == '1_running') {
            item.innerHTML = '<i class="fas fa-running" style="color:orange; margin-right:10px;"></i>&nbsp;';
        }
        else if (s.status == '5_error') {
            item.innerHTML = '<i class="fas fa-exclamation-circle" style="color:red; margin-right:10px;"></i>&nbsp;';
        }
        else if (s.status == '2_waiting') {
            item.innerHTML = '<i class="fas fa-pause" style="color:orange; margin-right:10px;"></i>&nbsp;';
        }
        else if (s.status == '3_open') {
            item.innerHTML = '<i class="fas fa-pause" style="color:gray; margin-right:10px;"></i>&nbsp;';
        }
        else {
            item.innerHTML = '<i class="fas fa-check-square" style="color:green; margin-right:10px;"></i>&nbsp;';
        }
        item.innerHTML += '<a target="_blank" href="https://twitter.com/' + s.screen_name + '">@' + s.screen_name + '</a> (F: ' +
            (s.followers ? s.followers : '-') + ' / T: ' + (s.tweets ? s.tweets : '-') + ')';


        // Delete icon
        var deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn');
        deleteBtn.classList.add('btn-light');
        deleteBtn.classList.add('btn-small');
        deleteBtn.style = "margin-left:16px";
        deleteBtn.dataset.screen_name = s.screen_name;
        deleteBtn.innerHTML = '<span class="fas fa-trash" style="color:#444444" data-screen_name="' + s.screen_name + '"></span>';

        // Refresh button
        var refreshBtn = document.createElement('button');
        refreshBtn.classList.add('btn');
        refreshBtn.classList.add('btn-light');
        refreshBtn.classList.add('btn-small');
        refreshBtn.style = "margin-left:16px";
        refreshBtn.dataset.screen_name = s.screen_name;
        refreshBtn.innerHTML = '<span class="fas fa-redo" style="color:#444444" data-screen_name="' + s.screen_name + '"></span>';


        deleteBtn.addEventListener('click', deleteScreenNameForGroup);
        refreshBtn.addEventListener('click', refreshScreenName);

        //item.appendChild(deleteBtn);
        item.appendChild(refreshBtn);

        // Info of last update
        var timeSpan = document.createElement("span");
        timeSpan.style = "font-size:10px; margin-left:16px";
        timeSpan.innerHTML = "tweets updated ";

        if (s.tweets_updated) {
            timeSpan.innerHTML += moment(s.tweets_updated).fromNow();

        }
        else {
            timeSpan.innerHTML += moment(s.updated).fromNow();
        }

        item.appendChild(timeSpan);


        list.appendChild(item);
    })
}

function refreshScreenName(event) {
    var screenNameToRefresh = event.target.dataset.screen_name;


    db.collection("screennames").doc(screenNameToRefresh).update({
        "marker": -1,
        "status": "2_waiting",
        "phase": "timeline",
        "tweets": 0,
        "tweets_updated": Date.now()
    })
        .catch(function (error) {
            console.error("Error removing document: ", error);
        });

}

function deleteScreenNameForGroup(event) {
    var screenNameToDelete = event.target.dataset.screen_name;

    var currentUser = firebase.auth().currentUser;
    var deleteForGroup = currentUser.email.split("@")[0];

    db.collection("screennames").doc(screenNameToDelete).update({
        "groups": firebase.firestore.FieldValue.arrayRemove(deleteForGroup)
    })
        .catch(function (error) {
            console.error("Error removing document: ", error);
        });

}

function process() {

    var currentUser = firebase.auth().currentUser;
    var currentUserSplit = currentUser.email.split("@")[0];

    var request = { group: currentUserSplit, time: Date.now(), status: 'open' };


    // Add process request for group
    db.collection("processrequests").add(request).then((id) => {

        console.log("Process request was added");
        runProcess(currentUserSplit, id.id);
    });

}

async function runProcess(group, requestId) {
    const response = await fetch('https://us-central1-big-data-analytics-helper.cloudfunctions.net/processData?group=' + group, {
        mode: "no-cors"
    })

    // Update process request
    db.collection("processrequests").doc(requestId).update({ status: 'done' });

}



/* LOGIN */

/* global firebasetools */

firebasetools.onLoginChanged(loginChanged);

function loginChanged(user) {

    if (!user) {
        document.querySelector('#loginRow').removeAttribute('hidden');
        document.querySelector('#inputRow').setAttribute('hidden', '');
        document.querySelector('#listRow').setAttribute('hidden', '');


    }
    else {
        document.querySelector('#inputRow').removeAttribute('hidden');
        document.querySelector('#listRow').removeAttribute('hidden');
        document.querySelector('#loginRow').setAttribute('hidden', '');

        document.querySelector('#welcomeText').innerHTML = "Willkommen <b>" + user.email.split("@")[0] + "</b>.";

        getScreenNamesForGroup();
        listenForProcessRequests();
    }

}


function login() {
    console.log("Someone clicked login.");
    firebasetools.login();
}

function logout() {
    firebasetools.logout();
    stopListening();
    stopListeningForRequests();

    var list = document.querySelector('#userList');

    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}
