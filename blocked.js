// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const site = urlParams.get("site");
const reason = urlParams.get("reason");
const timeUsed = urlParams.get("used");
const timeLimit = urlParams.get("limit");

// Helper function to format seconds to readable time
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let timeString = "";
  if (hours) timeString += hours + (hours === 1 ? " hour " : " hours ");
  if (minutes)
    timeString += minutes + (minutes === 1 ? " minute " : " minutes ");
  if (remainingSeconds && !hours)
    timeString +=
      remainingSeconds + (remainingSeconds === 1 ? " second" : " seconds");

  return timeString.trim();
}

// Update the UI based on parameters
document.addEventListener("DOMContentLoaded", function () {
  // Update blocked site name
  if (site) {
    document.getElementById("blockedSite").textContent = site;
  }

  // Update message and show time info for time-limited blocks
  if (reason === "timelimit" && timeLimit) {
    document.getElementById(
      "reasonMessage"
    ).textContent = `You've reached your time limit for this website today`;

    document.getElementById("timeInfoContainer").style.display = "block";
    document.getElementById("timeLimit").textContent = formatTime(
      parseInt(timeLimit)
    );
    document.getElementById("timeUsed").textContent = formatTime(
      parseInt(timeUsed || timeLimit)
    );
  }

  // Button to open extension popup
  document
    .getElementById("openExtension")
    .addEventListener("click", function () {
      // Try to open the extension popup
      if (chrome && chrome.runtime) {
        chrome.runtime.sendMessage(
          { action: "openExtension" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.log(
                "Could not open extension popup:",
                chrome.runtime.lastError
              );
            }
          }
        );
      }
    });
});

// Prevent navigation away from this page
window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
  return "";
});

// Prevent back navigation
history.pushState(null, null, location.href);
window.addEventListener("popstate", function (event) {
  history.pushState(null, null, location.href);
});

console.log("Digital Footprints blocked page loaded");
