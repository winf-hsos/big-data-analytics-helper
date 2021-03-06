var toastNo = 0;
var welcomeToastId;

function createUserExistsAlert(screenName) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 10000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
        <div class="toast-header">
          <strong class="mr-auto">ATTENTION</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
            &times;
          </button>
        </div>
        <div class="toast-body">
          The user <a href="https://twitter.com/` +
    screenName +
    `" target="_blank">` +
    screenName +
    `</a> is already in your database.
        </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createNoGroupFoundAlert(user) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", false);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `<div class="toast-header">
          <strong class="mr-auto">ERROR</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
            &times;
          </button>
        </div>
        <div class="toast-body">
          Couldn't find a group assignment for user with email ` +
    user +
    `<br><button class="mt-2 btn btn-outline-secondary btn-sm" onclick="logout()">Logout</button>` +
    `</div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createWelcomeAlert(user, groups) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", false);

  // Create groups options
  let groupOptions = "";
  for (var i = 0; i < groups.length; i++) {
    groupOptions += "<option>" + groups[i].id + "</option>";
  }

  let toastId = "toast" + toastNo++;
  welcomeToastId = toastId;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
        <div class="toast-header">
         <strong class="mr-auto">WELCOME</strong>
         <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
            &times;
          </button>
        </div>
        <div class="toast-body">
          <strong>` +
    user +
    `</strong><br>` +
    `<div class="form-group mt-2">
      <select id="groupsDropdown" class="form-control form-control-sm" id="exampleFormControlSelect1" onchange="updateGroup()">` +
    groupOptions +
    `</select>
    </div>
    <button class="mt-2 btn btn-outline-secondary btn-sm" onclick="logout()">Logout</button>
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createEmptyScreenNameAlert() {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 5000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML = `
        <div class="toast-header">
          <strong class="mr-auto">ERROR</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
            &times;
          </button>
        </div>
        <div class="toast-body">
          You must enter a screen name!
        </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createAddedScreenNameAlert(screenName) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 5000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
        <div class="toast-header">
          <strong class="mr-auto">SUCCESS</strong>
          <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
            &times;
          </button>
        </div>
        <div class="toast-body">
          Successfully added <a href="https://twitter.com/` +
    screenName +
    `" target="_blank">` +
    screenName +
    `</a> to your database` +
    `</div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createCheckingForTweetsAlert(screenName) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", false);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <div class="spinner-grow spinner-grow-sm mr-1" role="status"></div>
      <strong class="mr-auto">WORKING</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Getting tweets for <a href="https://twitter.com/"` +
    screenName +
    `">` +
    screenName +
    `</a>` +
    `</div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");

  return toastId;
}

function createUpdateProfileAlert(screenName) {

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", false);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <div class="spinner-grow spinner-grow-sm mr-1" role="status"></div>
      <strong class="mr-auto">WORKING</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Getting profile for <a href="https://twitter.com/"` +
    screenName +
    `">` +
    screenName +
    `</a>` +
    `</div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");

  return toastId;

}

function createCheckingForTweetsDoneAlert(
  originalToastId,
  numTweets,
  screenName
) {
  // Close original toast
  $("#" + originalToastId).toast("hide");

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 5000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <strong class="mr-auto">DONE</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Finished getting tweets for <a href="https://twitter.com/"` +
    screenName +
    `">` +
    screenName +
    `</a>. Found ` +
    numTweets +
    `.` +
    `</div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}


function createExportStartedAlert() {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", false);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <div class="spinner-grow spinner-grow-sm mr-1" role="status"></div>
      <strong class="mr-auto">WORKING</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Exporting data...
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");

  return toastId;
}

function createExportFinishedAlert(originalToastId) {

  // Close original toast
  $("#" + originalToastId).toast("hide");

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 5000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <strong class="mr-auto">DONE</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Finished data export. Have fun analyzing!
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}

function createUpdateProfileFinishedAlert(originalToastId) {

  // Close original toast
  $("#" + originalToastId).toast("hide");

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 5000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <strong class="mr-auto">DONE</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Finished fetching profile!
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");

}


function createExportErrorAlert() {

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 10000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <strong class="mr-auto">ERROR</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Data export failed. Ask Nicolas what to do!
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");
}


function createUpdateProfileErrorAlert(originalToastId) {

  $("#" + originalToastId).toast("hide");

  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.setAttribute("data-autohide", true);
  toast.setAttribute("data-delay", 10000);

  let toastId = "toast" + toastNo++;
  toast.setAttribute("id", toastId);
  toast.innerHTML =
    `
    <div class="toast-header">
      <strong class="mr-auto">ERROR</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
        &times;
      </button>
    </div>
    <div class="toast-body">
      Fetching profile failed. Ask Nicolas what to do!
    </div>`;

  // Add the toast
  var toastsArea = document.querySelector("#toastsArea");
  toastsArea.appendChild(toast);

  $("#" + toastId).toast("show");

}