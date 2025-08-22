function getDateString(nDate) {
  let nDateDate = nDate.getDate();
  let nDateMonth = nDate.getMonth() + 1;
  let nDateYear = nDate.getFullYear();
  if (nDateDate < 10) {
    nDateDate = "0" + nDateDate;
  }
  if (nDateMonth < 10) {
    nDateMonth = "0" + nDateMonth;
  }
  let presentDate = "" + nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}

function getDomain(tablink) {
  let url = tablink[0].url;
  return url.split("/")[2];
}

function secondsToString(seconds, compressed = false) {
  let hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  let minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  let timeString = "";
  if (hours) {
    timeString += hours + " hrs ";
  }
  if (minutes) {
    timeString += minutes + " min ";
  }
  if (seconds) {
    timeString += seconds + " sec ";
  }
  if (!compressed) {
    return timeString;
  } else {
    if (hours) {
      return `${hours}h`;
    }
    if (minutes) {
      return `${minutes}m`;
    }
    if (seconds) {
      return `${seconds}s`;
    }
  }
}

var allKeys,
  timeSpent,
  totalTimeSpent,
  sortedTimeList,
  topCount,
  topDataSet,
  topLabels;
var color = [
  "rgb(84, 105, 255)", // Blue
  "rgb(135, 85, 255)", // Lavender/Purple
  "rgb(192, 85, 255)", // Pinkish Purple
  "rgb(255, 103, 179)", // Hot Pink
  "rgb(255, 120, 120)", // Coral Red
  "rgb(255, 153, 102)", // Orange
  "rgb(255, 187, 85)", // Light Orange
  "rgb(255, 221, 102)", // Yellow
  "rgb(204, 255, 102)", // Light Lime
  "rgb(178, 255, 102)", // Lime Green
];
totalTimeSpent = 0;
var today = getDateString(new Date());

chrome.storage.local.get(today, function (storedItems) {
  if (!storedItems[today]) {
    storedItems[today] = {};
  }

  allKeys = Object.keys(storedItems[today]);
  timeSpent = [];
  sortedTimeList = [];
  for (let i = 0; i < allKeys.length; i++) {
    let webURL = allKeys[i];
    timeSpent.push(storedItems[today][webURL]);
    totalTimeSpent += storedItems[today][webURL];
    sortedTimeList.push([webURL, storedItems[today][webURL]]);
  }
  sortedTimeList.sort((a, b) => b[1] - a[1]);

  topCount = allKeys.length > 10 ? 10 : allKeys.length;

  const totalTimeElement = document.getElementById("totalTimeToday");
  if (totalTimeElement) {
    totalTimeElement.innerText = secondsToString(totalTimeSpent);
  }

  topDataSet = [];
  topLabels = [];
  for (let j = 0; j < topCount; j++) {
    topDataSet.push(sortedTimeList[j][1]);
    topLabels.push(sortedTimeList[j][0]);
  }

  const webTable = document.getElementById("webList");
  if (webTable) {
    for (let i = 0; i < allKeys.length; i++) {
      let webURL = sortedTimeList[i][0];
      let row = document.createElement("tr");
      let serialNumber = document.createElement("td");
      serialNumber.innerText = i + 1;
      let siteURL = document.createElement("td");
      siteURL.innerText = webURL;
      let siteTime = document.createElement("td");
      siteTime.innerText = secondsToString(sortedTimeList[i][1]);
      row.appendChild(serialNumber);
      row.appendChild(siteURL);
      row.appendChild(siteTime);
      webTable.appendChild(row);
    }
  }

  const chartElement = document.getElementById("pie-chart");
  if (chartElement) {
    new Chart(chartElement, {
      type: "doughnut",
      data: {
        labels: topLabels,
        datasets: [
          {
            label: "Time Spent",
            backgroundColor: color,
            data: topDataSet,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Top Visited Sites Today",
          position: "top",
          fontSize: 14,
          padding: 10,
        },
        legend: {
          display: true,
          position: "bottom",
          align: "center",
          labels: {
            boxWidth: 12,
            padding: 10,
            fontStyle: "bold",
            usePointStyle: true,
          },
        },
        circumference: 2 * Math.PI,
        rotation: -Math.PI / 2,
        layout: {
          padding: {
            bottom: 20,
          },
        },
      },
    });
  }
});

function getDateTotalTime(storedObject, date) {
  let websiteLinks = Object.keys(storedObject[date]);
  let noOfWebsites = websiteLinks.length;
  let totalTime = 0;
  for (let i = 0; i < noOfWebsites; i++) {
    totalTime += storedObject[date][websiteLinks[i]];
  }
  return totalTime;
}

var monthNames = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekTabElement = document.getElementById("weekTab");
if (weekTabElement) {
  weekTabElement.addEventListener("click", function () {
    chrome.storage.local.get(null, function (storedItems) {
      let datesList = Object.keys(storedItems);
      let noOfDays = datesList.length >= 7 ? 7 : datesList.length;
      let timeEachDay = [];
      let dateLabels = [];
      let weeksTotalTime = 0;
      datesList.sort();
      for (let i = datesList.length - noOfDays; i < datesList.length; i++) {
        let month = parseInt(datesList[i][5] + datesList[i][6]);
        let label = datesList[i][8] + datesList[i][9] + " " + monthNames[month];
        dateLabels.push(label);
        let dayTime = getDateTotalTime(storedItems, datesList[i]);
        timeEachDay.push(dayTime / 3600);
        weeksTotalTime += dayTime;
      }
      let weeklyAverage = parseInt(weeksTotalTime / noOfDays);
      weeklyAverage = secondsToString(weeklyAverage);
      let weeklyMax = Math.max.apply(Math, timeEachDay) * 3600;
      weeklyMax = secondsToString(weeklyMax);

      const weekAvgElement = document.getElementById("weekAvg");
      const weekMaxElement = document.getElementById("weekMax");
      if (weekAvgElement) weekAvgElement.innerText = weeklyAverage;
      if (weekMaxElement) weekMaxElement.innerText = weeklyMax;

      const weeklyChart = document.getElementById("pastWeek");
      if (weeklyChart) {
        let weeklyChartDetails = {};
        weeklyChartDetails["type"] = "bar";
        let dataObj = {};
        dataObj["labels"] = dateLabels;
        dataObj["datasets"] = [
          {
            label: "Time Spent (hrs)",
            backgroundColor: "rgba(128, 0, 128, 0.7)",
            borderColor: "rgba(128, 0, 128, 1)",
            borderWidth: 1,
            data: timeEachDay,
          },
        ];
        weeklyChartDetails["data"] = dataObj;
        weeklyChartDetails["options"] = {
          legend: { display: false },
          title: {
            display: true,
            text: "Time Spent Online in the Recent Past",
          },
          scales: {
            yAxes: [
              {
                scaleLabel: { display: true, labelString: "Time in Hours" },
                ticks: {
                  beginAtZero: true,
                  stepSize: 1,
                  callback: function (value) {
                    if (value === 1) return "1 hr";
                    if (value === 0) return "0";
                    return value + " hr";
                  },
                },
              },
            ],
          },
        };
        new Chart(weeklyChart, weeklyChartDetails);
      }
    });
  });
}

// Show App Limits UI when navbar link is clicked
const appLimitsNavElement = document.getElementById("appLimitsNav");
if (appLimitsNavElement) {
  appLimitsNavElement.addEventListener("click", function (e) {
    e.preventDefault();
    const smallElement = document.querySelector(".small");
    const containerElement = document.querySelector(".container");
    const appLimitsContainer = document.getElementById("appLimitsContainer");

    if (smallElement) smallElement.style.display = "none";
    if (containerElement) containerElement.style.display = "none";
    if (appLimitsContainer) appLimitsContainer.style.display = "block";
  });
}

// Back to Dashboard button
const backToDashboardBtn = document.getElementById("backToDashboardBtn");
if (backToDashboardBtn) {
  backToDashboardBtn.addEventListener("click", function () {
    const appLimitsContainer = document.getElementById("appLimitsContainer");
    const smallElement = document.querySelector(".small");
    const containerElement = document.querySelector(".container");

    if (appLimitsContainer) appLimitsContainer.style.display = "none";
    if (smallElement) smallElement.style.display = "";
    if (containerElement) containerElement.style.display = "";
  });
}

// Handle Dashboard navbar click
const dashboardNavElement = document.getElementById("dashboardNav");
if (dashboardNavElement) {
  dashboardNavElement.addEventListener("click", function (e) {
    e.preventDefault();
    const appLimitsContainer = document.getElementById("appLimitsContainer");
    const smallElement = document.querySelector(".small");
    const containerElement = document.querySelector(".container");

    if (appLimitsContainer) appLimitsContainer.style.display = "none";
    if (smallElement) smallElement.style.display = "";
    if (containerElement) containerElement.style.display = "";
  });
}

// popup scripts control the behavior of the extension's popup window
window.onload = function () {
  updateBlockedWebsitesSection();
  var blockButton = document.getElementById("blockButton");
  if (blockButton) {
    blockButton.onclick = function () {
      getWebsiteInput();
    };
  }
};

// Block or set time limit for websites
function getWebsiteInput() {
  var websiteInput = document.getElementById("websiteInput").value.trim();
  var websiteLimitInput = document.getElementById("websiteLimitInput");
  var timeLimit = websiteLimitInput ? parseInt(websiteLimitInput.value) : 0;

  // If user clicks the -Block- button without entering input -> Alert Error
  if (!websiteInput) {
    alert("Error: please enter a website URL");
  } else {
    // Normalize input (add www. if missing and no protocol)
    if (!websiteInput.includes("://") && !websiteInput.startsWith("www.")) {
      websiteInput = "www." + websiteInput;
    }

    console.log("Attempting to block:", websiteInput);
    console.log("With time limit (minutes):", timeLimit);

    // Retrieve the blockedWebsitesArray and websiteTimeLimits from Chrome browser
    chrome.storage.sync.get(
      ["blockedWebsitesArray", "websiteTimeLimits"],
      function (data) {
        var blockedWebsitesArray = data.blockedWebsitesArray || [];
        var websiteTimeLimits = data.websiteTimeLimits || {};

        console.log("Current blocked sites:", blockedWebsitesArray);

        // Check if site is already blocked or has a time limit
        const isInputInArray = blockedWebsitesArray.some(
          (item) => item.toLowerCase() === websiteInput.toLowerCase()
        );
        const hasTimeLimit = websiteTimeLimits[websiteInput] !== undefined;

        if (isInputInArray || hasTimeLimit) {
          alert("Error: This URL is already managed by the blocker");
        } else {
          // Handle based on time limit value
          if (!timeLimit || timeLimit <= 0) {
            // Permanent block - add to blockedWebsitesArray
            blockedWebsitesArray.push(websiteInput);
            console.log(`Adding ${websiteInput} to permanent blocks`);
          } else {
            // Time limited block - add to websiteTimeLimits
            websiteTimeLimits[websiteInput] = timeLimit * 60; // Store limit in seconds
            console.log(
              `Setting time limit for ${websiteInput}: ${timeLimit} minutes`
            );
          }

          // Save both arrays
          chrome.storage.sync.set(
            {
              blockedWebsitesArray: blockedWebsitesArray,
              websiteTimeLimits: websiteTimeLimits,
            },
            function () {
              console.log("Updated blocked sites:", blockedWebsitesArray);
              console.log("Updated time limits:", websiteTimeLimits);

              // Update the UI after the storage operation is complete
              updateBlockedWebsitesSection();
              document.getElementById("websiteInput").value = "";
              if (websiteLimitInput) {
                websiteLimitInput.value = "";
              }
              document.getElementById("websiteInput").focus();
            }
          );
        }
      }
    );
  }
}

// Update the Popup's 'Blocked Websites' Section to current state
function updateBlockedWebsitesSection() {
  // Retrieve the blockedWebsitesDiv
  const blockedWebsitesDiv = document.getElementById("blockedWebsitesDiv");
  // Clear the blockedWebsitesDiv by removing all its child elements
  while (blockedWebsitesDiv && blockedWebsitesDiv.firstChild) {
    blockedWebsitesDiv.removeChild(blockedWebsitesDiv.firstChild);
  }

  // Get today's date
  const today = getDateString(new Date());

  // Get the stored array of blocked websites and time limits
  chrome.storage.sync.get(
    ["blockedWebsitesArray", "websiteTimeLimits"],
    function (data) {
      const blockedWebsitesArray = data.blockedWebsitesArray || [];
      const websiteTimeLimits = data.websiteTimeLimits || {};

      // Get today's usage data for time-limited sites
      chrome.storage.local.get(today, function (todayData) {
        const todayUsage = todayData[today] || {};

        // Combine both permanent blocks and time-limited sites into one array
        const allSites = [
          ...new Set([
            ...blockedWebsitesArray,
            ...Object.keys(websiteTimeLimits),
          ]),
        ];

        // Check if the array is empty
        if (allSites && allSites.length > 0) {
          // If the array is not empty, remove the message that says 'No websites have been blocked' (if it exists)
          const nothingBlockedDiv = document.querySelector(".nothingBlocked");
          if (nothingBlockedDiv != null) {
            blockedWebsitesDiv.removeChild(nothingBlockedDiv);
          }

          // then iterate through each item in the stored array of Blocked Websites
          allSites.forEach((website, index) => {
            // Create a new div for each URL
            const websiteDiv = document.createElement("div");
            // Add class (for styling) to websiteDiv block
            websiteDiv.classList.add("websiteDiv");

            // Create div for 'website text'
            const websiteDivText = document.createElement("div");
            websiteDivText.classList.add("websiteDivText");
            websiteDivText.textContent = website;

            // Append the websiteDivText to websiteDiv
            websiteDiv.appendChild(websiteDivText);

            // Create actions container for buttons
            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("websiteActions");

            // Create the unblock button
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete"); // Add CSS class for styling
            deleteButton.dataset.website = website; // Use data attribute to store website
            deleteButton.textContent = "X";
            deleteButton.addEventListener("click", unblockURL);
            actionsDiv.appendChild(deleteButton);

            websiteDiv.appendChild(actionsDiv);

            // Check if this site has a time limit
            if (websiteTimeLimits[website]) {
              // Add time limit information
              const timeLimit = websiteTimeLimits[website];
              const timeUsed = todayUsage[website] || 0;
              const timeRemaining = Math.max(0, timeLimit - timeUsed);

              // Add reset button for time-limited sites
              const resetButton = document.createElement("button");
              resetButton.classList.add("reset-time");
              resetButton.title = "Reset time usage";
              resetButton.textContent = "↻";
              resetButton.dataset.website = website;
              resetButton.addEventListener("click", resetTimeUsage);
              actionsDiv.appendChild(resetButton);

              // Add time info display
              const timeInfoDiv = document.createElement("div");
              timeInfoDiv.classList.add("websiteTimeInfo");

              // Add appropriate styling based on time remaining
              const percentUsed = Math.min(
                100,
                Math.round((timeUsed / timeLimit) * 100)
              );
              if (percentUsed >= 90) {
                timeInfoDiv.classList.add("timeCritical");
              } else if (percentUsed >= 75) {
                timeInfoDiv.classList.add("timeWarning");
              }

              if (timeRemaining <= 0) {
                timeInfoDiv.innerHTML = `<strong>Time limit reached!</strong> (${secondsToString(
                  timeLimit
                )})`;
              } else {
                timeInfoDiv.textContent = `${secondsToString(
                  timeRemaining
                )} left of ${secondsToString(timeLimit)}`;
              }

              websiteDiv.appendChild(timeInfoDiv);
            } else {
              // Permanent block info
              const blockInfoDiv = document.createElement("div");
              blockInfoDiv.classList.add("websiteTimeInfo");
              blockInfoDiv.textContent = "Always blocked";
              websiteDiv.appendChild(blockInfoDiv);
            }

            // Append the websiteDiv to the blockedWebsitesDiv
            blockedWebsitesDiv.appendChild(websiteDiv);
          });
        } else {
          // If the array is empty, create the message element
          const nothingBlocked = document.createElement("div");
          nothingBlocked.textContent = "No websites have been blocked";
          nothingBlocked.classList.add("nothingBlocked");
          blockedWebsitesDiv.appendChild(nothingBlocked);
        }
      });
    }
  );
}

function unblockURL(event) {
  // Get the website from data attribute or id
  const website =
    event.target.dataset.website || blockedWebsitesArray[event.target.id];
  console.log("Unblocking website:", website);

  if (!website) {
    console.error("Could not determine website to unblock");
    return;
  }

  // Get the blockedWebsitesArray and websiteTimeLimits
  chrome.storage.sync.get(
    ["blockedWebsitesArray", "websiteTimeLimits"],
    function (data) {
      let blockedWebsitesArray = data.blockedWebsitesArray || [];
      let websiteTimeLimits = data.websiteTimeLimits || {};

      // Remove from blockedWebsitesArray if present
      blockedWebsitesArray = blockedWebsitesArray.filter(
        (site) => site !== website
      );

      // Remove from websiteTimeLimits if present
      if (websiteTimeLimits[website]) {
        delete websiteTimeLimits[website];
      }

      // Save the updated array back to Chrome storage
      chrome.storage.sync.set(
        {
          blockedWebsitesArray: blockedWebsitesArray,
          websiteTimeLimits: websiteTimeLimits,
        },
        function () {
          console.log("Updated block list:", blockedWebsitesArray);
          console.log("Updated time limits:", websiteTimeLimits);
          updateBlockedWebsitesSection();
        }
      );
    }
  );
}

// Reset time usage for a specific website
function resetTimeUsage(event) {
  const website = event.target.dataset.website;
  if (!website) return;

  const today = getDateString(new Date());
  console.log(`Resetting time usage for ${website}`);

  chrome.storage.local.get(today, function (data) {
    let todayData = data[today] || {};
    todayData[website] = 0;

    let update = {};
    update[today] = todayData;

    chrome.storage.local.set(update, function () {
      console.log(`Reset time usage for ${website} completed`);
      updateBlockedWebsitesSection();
    });
  });
}
