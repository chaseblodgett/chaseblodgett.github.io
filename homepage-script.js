
document.getElementById("search-form").addEventListener("submit", function(event) {
    // Get the input value
    var inputValue = document.getElementById("search-bar").value;

    // Encode the input value and construct the URL with the parameter
    var url = "searchpage.html?search=" + encodeURIComponent(inputValue);

    // Navigate to the new page
    window.location.href = url;

    event.preventDefault();
});

