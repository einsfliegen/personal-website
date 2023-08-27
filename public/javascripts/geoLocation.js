function geoFindMe() {
    const locationInputBox = document.querySelector("#location");
    const progressBar = document.querySelector("#status-bar");

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        progressBar.style.display = 'none';
        locationInputBox.value = longitude + ", " + latitude;

    }

    function error() {
        alert("Unable to retrieve your location");
    }

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
    } else {
        progressBar.style.display = 'block';
        navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true });
    }
}

document.querySelector("#find-me").addEventListener("click", geoFindMe);
