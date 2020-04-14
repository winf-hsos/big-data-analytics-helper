/* global firebasetools firebase moment createWelcomeAlert createEmptyScreenNameAlert createUserExistsAlert createAddedScreenNameAlert createNoGroupFoundAlert
 * createCheckingForTweetsAlert createCheckingForTweetsDoneAlert createExportFinishedAlert createExportErrorAlert createExportStartedAlert
 */

// Update the ...time ago view every minute
setInterval(1000 * 60 * 5, updateView);

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

const isAdmin =
  firebasetools.getURLParameterByName("admin", window.location) || false;
console.log(isAdmin);

const db = firebase.firestore();

var groupId = "";
var remainingExportQuota;
var screenNameArray = [];
var stopListening;

function addScreenName() {
  var screenName = document.querySelector("#screenName").value;

  screenName = screenName
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")
    .trim();

  if (screenName.length == 0) {
    createEmptyScreenNameAlert();
    return;
  }

  // Remove any @-symbol prefix
  if (screenName.startsWith("@")) {
    screenName = screenName.substr(1);
  }

  var user = firebase.auth().currentUser;

  // Check if exists
  db.collection("accounts")
    .doc(groupId)
    .collection("screen_names")
    .doc(screenName)
    .get()
    .then(doc => {
      if (doc.exists) {
        // TODO: Output message modal to inform user
        console.log(
          "The screen name >" +
            screenName +
            "< already exists for user >" +
            groupId +
            "<"
        );

        createUserExistsAlert(screenName);
      } else {
        var addAccount = firebase
          .functions()
          .httpsCallable("addTwitterAccountCallable");

        addAccount({
          user_id: groupId,
          screen_name: screenName,
          user_email: user.email
        }).then(function(result) {
          var result = result.data;
          createAddedScreenNameAlert(screenName);

          // Directly start getting tweets
          getTweets(screenName);
        });
      }

      document.querySelector("#screenName").value = "";
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
}

/* global firebase */
function getTweets(screenName) {
  var toastId = createCheckingForTweetsAlert(screenName);
  var checkAccounts = firebase
    .functions()
    .httpsCallable("getAndInsertTweetsCallable");

  checkAccounts({
    user_id: groupId,
    screen_name: screenName
  }).then(function(result) {
    var result = result.data;
    createCheckingForTweetsDoneAlert(
      toastId,
      result.num_tweets,
      result.screen_name
    );
  });
}

function getScreenNamesForGroup() {
  stopListening = db
    .collection("accounts")
    .doc(groupId)
    .collection("screen_names")
    .onSnapshot(function(items) {
      screenNameArray = [];
      items.forEach(item => {
        screenNameArray.push(item.data());
      });

      updateView();
    });
}

function getGroupForUser() {
  let email = firebase.auth().currentUser.email;
  var ref = db.collection("accounts").where("users", "array-contains", email);

  return new Promise((resolve, reject) => {
    return ref.get().then(snapshot => {
      if (snapshot.empty) {
        reject("No group found for user >" + email + "<");
      }

      console.log(
        "Found >" +
          snapshot.size +
          "< group assignement for user >" +
          email +
          "<"
      );

      snapshot.forEach(doc => {
        let userObj = doc.data();
        userObj.id = doc.id;
        resolve(userObj);
      });
    });
  });
}

function updateView() {
  // Update the export button
  var exportButton = document.querySelector("#exportBtn");
  exportButton.textContent = "Export (" + remainingExportQuota + ")";

  if (remainingExportQuota > 0) {
    exportButton.removeAttribute("disabled");
  } else {
    exportButton.setAttribute("disabled", "");
  }

  firebasetools.sortArrayBy(screenNameArray, "last_updated", false);

  var list = document.querySelector("#userList");

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  screenNameArray.forEach(s => {
    var item = document.createElement("li");

    item.classList.add("list-group-item");

    if (s.num_tweets > 0) {
      item.innerHTML =
        '<i class="fas fa-check-square" style="color:green; margin-right:10px;"></i>&nbsp;';
    } else if (s.num_tweets == 0 && s.last_updated.toDate().getYear() == 0) {
      item.innerHTML =
        '<i class="fas fa-check-square" style="color:gray; margin-right:10px;"></i>&nbsp;';
    } else {
      item.innerHTML =
        '<i class="fas fa-check-square" style="color:red; margin-right:10px;"></i>&nbsp;';
    }

    item.innerHTML +=
      '<a target="_blank" href="https://twitter.com/' +
      s.screen_name +
      '">@' +
      s.screen_name +
      "</a>";

    // Delete icon
    /*
    var deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn");
    deleteBtn.classList.add("btn-light");
    deleteBtn.classList.add("btn-small");
    deleteBtn.style = "margin-left:16px";
    deleteBtn.dataset.screen_name = s.screen_name;
    deleteBtn.innerHTML =
      '<span class="fas fa-trash" style="color:#444444" data-screen_name="' +
      s.screen_name +
      '"></span>';
    
    deleteBtn.addEventListener("click", deleteScreenNameForGroup);
    item.appendChild(refreshBtn);
    */

    // Refresh button
    /*
    var refreshBtn = document.createElement("button");
    refreshBtn.classList.add("btn");
    refreshBtn.classList.add("btn-light");
    refreshBtn.classList.add("btn-small");
    refreshBtn.style = "margin-left:16px";
    refreshBtn.dataset.screen_name = s.screen_name;
    refreshBtn.innerHTML =
      '<span class="fas fa-redo" style="color:#444444" data-screen_name="' +
      s.screen_name +
      '"></span>';
    
    refreshBtn.addEventListener("click", refreshScreenName);
    item.appendChild(deleteBtn);
    */

    // Info of last update
    var timeSpan = document.createElement("span");
    timeSpan.style = "font-size:12px; margin-left:12px; color: #5a5a5a;";
    timeSpan.innerHTML = "total tweets: <b>" + s.num_tweets + "</b>&nbsp;";
    timeSpan.innerHTML += "| last updated ";

    if (s.last_updated) {
      timeSpan.innerHTML += moment(s.last_updated.toDate()).fromNow();
    } else {
      timeSpan.innerHTML += moment(s.last_updated.toDate()).fromNow();
    }

    item.appendChild(timeSpan);
    list.appendChild(item);
  });
}

function refreshScreenName(event) {
  var screenNameToRefresh = event.target.dataset.screen_name;

  db.collection("screennames")
    .doc(screenNameToRefresh)
    .update({
      marker: -1,
      status: "2_waiting",
      phase: "timeline",
      tweets: 0,
      tweets_updated: Date.now()
    })
    .catch(function(error) {
      console.error("Error removing document: ", error);
    });
}

function deleteScreenNameForGroup(event) {
  var screenNameToDelete = event.target.dataset.screen_name;

  var currentUser = firebase.auth().currentUser;
  var deleteForGroup = currentUser.email.split("@")[0];

  db.collection("screennames")
    .doc(screenNameToDelete)
    .update({
      groups: firebase.firestore.FieldValue.arrayRemove(deleteForGroup)
    })
    .catch(function(error) {
      console.error("Error removing document: ", error);
    });
}

function exportData() {
  var toastId = createExportStartedAlert();
  var exportTable = firebase.functions().httpsCallable("exportTableCallable");

  exportTable({
    user_id: groupId
  })
    .then(function(result) {
      var result = result.data;

      if (result.success === true) {
        createExportFinishedAlert(toastId);
      } else {
        createExportErrorAlert();
      }

      remainingExportQuota = result.remaining_export_quota;
      updateView();
    })
    .catch(e => {
      console.dir(e);
      createExportErrorAlert();
    });
}

async function runProcess(group, requestId) {
  const response = await fetch(
    "https://us-central1-big-data-analytics-helper.cloudfunctions.net/processData?group=" +
      group,
    {
      mode: "no-cors"
    }
  );

  // Update process request
  db.collection("processrequests")
    .doc(requestId)
    .update({ status: "done" });
}

/* LOGIN */

/* global firebasetools */

firebasetools.onLoginChanged(loginChanged);

function loginChanged(user) {
  if (!user) {
    document.querySelector("#loginRow").removeAttribute("hidden");
    document.querySelector("#inputRow").setAttribute("hidden", "");
    document.querySelector("#listRow").setAttribute("hidden", "");
  } else {
    document.querySelector("#inputRow").removeAttribute("hidden");
    document.querySelector("#listRow").removeAttribute("hidden");
    document.querySelector("#loginRow").setAttribute("hidden", "");

    getGroupForUser()
      .then(groupObj => {
        groupId = groupObj.id;
        remainingExportQuota = groupObj.remaining_export_quota;
        getScreenNamesForGroup();
        createWelcomeAlert(firebase.auth().currentUser.email, groupId);
      })
      .catch(e => {
        console.error(e);
        createNoGroupFoundAlert(firebase.auth().currentUser.email);
      });
  }
}

function login() {
  console.log("Someone clicked login.");
  firebasetools.login();
}

function logout() {
  firebasetools.logout();
  stopListening();

  var list = document.querySelector("#userList");

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}
