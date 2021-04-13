/* global firebasetools firebase moment createWelcomeAlert createEmptyScreenNameAlert createUserExistsAlert createAddedScreenNameAlert createNoGroupFoundAlert
 * createCheckingForTweetsAlert createCheckingForTweetsDoneAlert createExportFinishedAlert createExportErrorAlert createExportStartedAlert
 */

// Update the ...time ago view every minute
setInterval(1000 * 60 * 5, updateView);

const isAdmin =
  firebasetools.getURLParameterByName("admin", window.location) || false;


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
        }).then(function (result) {
          var result = result.data;
          createAddedScreenNameAlert(screenName);

          // Directly start getting tweets and profile
          getTweets(screenName);
          getProfile(screenName);
        });
      }

      document.querySelector("#screenName").value = "";
    })
    .catch(function (error) {
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
  }).then(function (result) {
    var result = result.data;
    createCheckingForTweetsDoneAlert(
      toastId,
      result.num_tweets,
      result.screen_name
    );
  });
}

function getProfile(screenName) {
  var updateProfile = firebase
    .functions()
    .httpsCallable("updateProfileForScreenNameCallable");

  updateProfile({
    groupId: groupId,
    screenName: screenName
  });
}

function getScreenNamesForGroup() {
  stopListening = db
    .collection("accounts")
    .doc(groupId)
    .collection("screen_names")
    .onSnapshot(function (items) {
      screenNameArray = [];
      items.forEach(item => {
        screenNameArray.push(item.data());
      });

      updateView();
    });
}

function getGroupsForUser() {
  let email = firebase.auth().currentUser.email;
  var ref = db.collection("accounts").where("users", "array-contains", email);

  var groups = [];

  return new Promise((resolve, reject) => {
    return ref.get().then(snapshot => {
      if (snapshot.empty) {
        reject("No group found for user >" + email + "<");
      }

      console.log(
        "Found >" +
        snapshot.size +
        "< group assignements for user >" +
        email +
        "<"
      );

      snapshot.forEach(doc => {
        let userObj = doc.data();
        userObj.id = doc.id;
        groups.push(userObj);

      });

      resolve(groups);
    });
  });
}

function updateView() {
  // Update the export button
  var exportButton = document.querySelector("#exportTweetsBtn");
  exportButton.textContent = "Export Tweets (" + remainingExportQuota + ")";

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


    // Info of last update
    var timeSpan = document.createElement("span");
    timeSpan.style = "font-size:12px; margin-left:12px; color: #5a5a5a;";
    timeSpan.innerHTML = "tweets: <b>" + s.num_tweets + "</b>&nbsp;";
    timeSpan.innerHTML += " | followers: <b>" + (s.num_followers || "-") + "</b>&nbsp;";
    timeSpan.innerHTML += "| updated ";


    if (s.last_updated) {
      timeSpan.innerHTML += moment(s.last_updated.toDate()).fromNow();
    } else {
      timeSpan.innerHTML += moment(s.last_updated.toDate()).fromNow();
    }

    timeSpan.innerHTML += ` | <a href='#' onclick='updateFollowersForScreenName("${s.screen_name}"); return false;'>update followers</a>`;
    timeSpan.innerHTML += ` | <a href='#' onclick='updateProfileForScreenName("${s.screen_name}"); return false;'>update profile</a>`;

    item.appendChild(timeSpan);

    list.appendChild(item);

  });
}



function exportTweetsData() {
  var toastId = createExportStartedAlert();
  var exportTable = firebase.functions().httpsCallable("exportTweetsTableCallable");

  exportTable({
    user_id: groupId
  })
    .then(function (result) {
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

function exportFollowersData() {
  var toastId = createExportStartedAlert();
  var exportTable = firebase.functions().httpsCallable("exportFollowersTableCallable");

  exportTable({
    user_id: groupId
  })
    .then(function (result) {
      var result = result.data;

      if (result.success === true) {
        createExportFinishedAlert(toastId);
      } else {
        createExportErrorAlert();
      }

      updateView();
    })
    .catch(e => {
      console.dir(e);
      createExportErrorAlert();
    });

}

function exportProfileData() {

  var toastId = createExportStartedAlert();
  var exportTable = firebase.functions().httpsCallable("exportProfilesTableCallable");

  exportTable({
    user_id: groupId
  })
    .then(function (result) {
      var result = result.data;

      if (result.success === true) {
        createExportFinishedAlert(toastId);
      } else {
        createExportErrorAlert();
      }

      updateView();
    })
    .catch(e => {
      console.dir(e);
      createExportErrorAlert();
    });


}


/* LOGIN */

/* global firebasetools */

firebasetools.onLoginChanged(loginChanged);

function loginChanged(user) {
  if (!user) {
    document.querySelector("#loginRow").removeAttribute("hidden");
    document.querySelector("#inputRow").setAttribute("hidden", "");
    document.querySelector("#listRow").setAttribute("hidden", "");
    document.querySelector("#noGroupRow").setAttribute("hidden", "");

  } else {

    getGroupsForUser()
      .then(groups => {
        remainingExportQuota = groups[0].remaining_export_quota;

        // Select the first group by default
        groupId = groups[0].id;

        if (groupId !== "") {
          document.querySelector("#inputRow").removeAttribute("hidden");
          document.querySelector("#listRow").removeAttribute("hidden");
          document.querySelector("#loginRow").setAttribute("hidden", "");
          document.querySelector("#noGroupRow").setAttribute("hidden", "");

          getScreenNamesForGroup();
          createWelcomeAlert(firebase.auth().currentUser.email, groups);
        }

      })
      .catch(e => {
        console.error(e);
        //createNoGroupFoundAlert(firebase.auth().currentUser.email);

        document.querySelector("#noGroupRow").removeAttribute("hidden");
        document.querySelector("#inputRow").setAttribute("hidden", "");
        document.querySelector("#listRow").setAttribute("hidden", "");
        document.querySelector("#loginRow").setAttribute("hidden", "");
      });
  }
}

function updateGroup() {
  var dropDown = document.querySelector("#groupsDropdown");
  groupId = dropDown.value;
  stopListening();
  getScreenNamesForGroup();
  updateView();
}

function login() {
  document.querySelector("#errorMessage").textContent = "";
  firebasetools.login(null, null, loginFailed, loginSuccess);
}

function loginSuccess(auth) {
  console.log("Logged in user >" + auth.user.email + "<");
}

function loginFailed(error) {

  if (error.code === "auth/invalid-email") {
    document.querySelector("#errorMessage").textContent = "Kein gültiges E-Mail Format.";
  }
  else if (error.code === "auth/wrong-password") {
    document.querySelector("#errorMessage").textContent = "Das Passwort ist ungültig.";
  }
  else if (error.code === "auth/user-not-found") {
    document.querySelector("#errorMessage").textContent = "Dieser Benutzer existiert nicht.";

  }
}

function logout() {
  if (groupId !== "") {
    stopListening();
  }
  $("#" + welcomeToastId).toast("hide");
  firebasetools.logout();


  var list = document.querySelector("#userList");

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}

function updateFollowersForScreenName(screen_name) {
  console.log("Updating followers for screen_name >" + screen_name + "<");
  console.log("Group ID: " + groupId);

  const followerRequestRef = db.collection("accounts").doc(groupId).collection("followers").doc(screen_name);

  followerRequestRef.get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        usersRef.onSnapshot((doc) => {
          doc.update({
            cursor: -1,
            status: "open",
            date_last_update_requested: firebase.firestore.FieldValue.serverTimestamp(),
            error_message: "",
            followers_fetched: 0
          })
            .catch(function (error) {
              console.error("Error adding followers update request: ", error);
            });
        });
      } else {
        followerRequestRef.set({
          cursor: -1,
          status: "open",
          date_added: firebase.firestore.FieldValue.serverTimestamp(),
          date_last_update_requested: firebase.firestore.FieldValue.serverTimestamp(),
          error_message: "",
          followers_fetched: 0
        })
      }
    });
}

function updateProfileForScreenName(screen_name) {
  console.log("Updating profile for screen_name >" + screen_name + "<");
  //console.log("Group ID: " + groupId);

  var toastId = createUpdateProfileAlert(screen_name);
  var updateProfileForScreenNameCallable = firebase.functions().httpsCallable("updateProfileForScreenNameCallable");

  updateProfileForScreenNameCallable({
    groupId: groupId,
    screenName: screen_name
  })
    .then(function (result) {
      var result = result.data;

      if (result.success === true) {
        createUpdateProfileFinishedAlert(toastId);
      } else {
        createUpdateProfileErrorAlert(toastId);
      }

      updateView();
    })
    .catch(e => {
      console.dir(e);
      createUpdateProfileErrorAlert(toastId);
    });

}
