
const loginBar = document.querySelector(".login-bar");
const signUP = document.querySelector(".cadastro-bar");
const searchBar = document.querySelector(".search-bar");
const buttonSearch = searchBar.querySelector('button:nth-child(2)');
const pointButton = document.getElementById('point-button');
const closebotton = document.querySelector('.close-button');

pointButton.addEventListener("click", function() {
    sidePanel.style.display = "block";
  });
  
  document.addEventListener("click", function(event) {
    if (event.target !== sidePanel && event.target.parentNode !== sidePanel) {
      sidePanel.style.display = "none";
    }
  });
  closebotton.addEventListener("click", function() {
    closebotton.style.display = "none";
  });
