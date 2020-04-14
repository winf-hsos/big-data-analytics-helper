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
//console.log(isAdmin);

var db = firebase.firestore();

var group = "";
var numTransactions = 0;


// Event listener for file select
document.querySelector('#inputCsvFile').addEventListener("input", csvFileChosen);

function csvFileChosen() {
  let file = document.querySelector('#inputCsvFile').files[0];

  console.log(file.type);
  console.log(file.name);
  var fileSize = file.size / 1024 / 1024;
  console.log(fileSize);

  if ((file.type == "application/vnd.ms-excel" || file.type == "text/plain" || file.type == "text/csv") && fileSize <= 1.0) {
    upload(file);
  }
  else {
    window.alert("Das ist keine CSV-Datei oder die Datei ist größer 1 MB!");
  }

}


function upload(file) {

  // Get current logged in group
  if (group !== "") {
    let path = "azure/vision/" + group + "/upload";
    firebasetools.uploadFile(path, file, uploadFinished);

    function uploadFinished() {
      console.log("Upload finished");

      // Create firestore entry
      db.collection("azure_computer_vision_requests").add({
        group: group,
        file: file.name,
        time: Date.now(),
        status: 'open',
        entries: 0
      })
        .then(function (docRef) {
          console.log("Vision Entry created: ", docRef.id);
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
    }

  }
  else {
    console.log("Error: No group found");
  }
}

async function getUsedImageQuotaForGroup(group) {

  return db.collection("azure_computer_vision_requests").where("group", "==", group).get()
    .then(snapshot => {

      var numTransactions = 0;

      snapshot.forEach(doc => {
        numTransactions += doc.data().entries;
      });

      return numTransactions;
    })
    .catch(err => {
      console.log('Error getting used image quota: ', err);
    });
}


/* LOGIN */

/* global firebasetools */

firebasetools.onLoginChanged(loginChanged);

async function loginChanged(user) {

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

    var user = firebase.auth().currentUser;
    group = user.email.split("@")[0];

    numTransactions = await getUsedImageQuotaForGroup(group);
    document.querySelector("#numTransactions").innerHTML = "Ihr habt bereits <b>" + numTransactions + "</b> von 4000 Bildern analysieren lassen.";

  }

}


function login() {
  console.log("Someone clicked login.");
  firebasetools.login();
}

function logout() {
  firebasetools.logout();

  var list = document.querySelector('#userList');

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
}
