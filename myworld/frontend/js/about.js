const learnMoreBtn = document.getElementById("learnMoreBtn");
const moreText = document.getElementById("moreText");

learnMoreBtn.addEventListener("click", function () {

    moreText.classList.toggle("hidden");

    if (moreText.classList.contains("hidden")) {
        learnMoreBtn.textContent = "Learn More";
    } else {
        learnMoreBtn.textContent = "Show Less";
    }

});