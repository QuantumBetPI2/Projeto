const sidePanel = document.querySelector('.side-panel');
const pointButton = document.querySelector('#point-button');
const closeButton = document.querySelector('.close-button')

// Add an event listener to the point button
pointButton.addEventListener('click', () => {
  // Toggle the side panel's visibility
  if (sidePanel.style.display === "block") {
    sidePanel.style.display = "none";
  } else {
    sidePanel.style.display = "block";
  }
});


closeButton.addEventListener('click', () => {
    if (sidePanel.style.display === "block") {
      sidePanel.style.display = "none";
    }
  })
  