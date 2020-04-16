/* global firebasetools */
function register() {
    console.log("Register called");

    document.querySelector("#errorMessage").textContent = "";
    var result = firebasetools.register(null, null, handleError, success);

}

function success(user) {
    console.dir(user);
    console.dir(window.location);
    window.location.pathname = window.location.pathname.replace("register", "index");
}


function handleError(error) {
    console.dir(error);

    if (error.code === "auth/invalid-email") {
        document.querySelector("#errorMessage").textContent = "Kein gültiges E-Mail Format.";
    }
    else if (error.code === "auth/email-already-in-use") {
        document.querySelector("#errorMessage").textContent = "Diese E-Mail ist bereits registriert.";
    }
    else if (error.code === "auth/weak-password") {
        document.querySelector("#errorMessage").textContent = "Das Passwort muss mind. 6 Zeichen lang sein.";

    }
}
