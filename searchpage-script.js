function getUrlParameter(name) {
    // Use regular expression to search for the parameter in the URL
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(window.location.href);
    
    // If the parameter is found, return its value; otherwise, return null
    if (!results) return null;
    if (!results[2]) return '';
    
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Get the value of the 'search' parameter from the URL
var searchValue = getUrlParameter('search');

async function displayUserResults(){
    const url = "https://api.github.com/search/users?q=" + searchValue;
    const response = await fetch(url);
    const result = await response.json();

    const userDiv = document.getElementById("user-results");

    if(result.total_count === 0){
        const errorMsg = document.createElement("h2");
        errorMsg.className = "error-msg";
        errorMsg.textContent = "No users matching " + searchValue;
        userDiv.appendChild(errorMsg);
    }

    for(let i = 0; i < Math.min(result.total_count,3) ; i++){
        
        let newUser = document.createElement("div");
        newUser.className = "user";

        let userInfo= document.createElement("div");
        userInfo.className = "user-info";

        let name = document.createElement("h2");
        name.textContent = result.items[i].login;
        name.className = "user-name";

        userInfo.appendChild(name);

        let img = document.createElement("img");
        img.src = result.items[i].avatar_url;
        img.className = "user-image";

        userInfo.appendChild(img);
        newUser.appendChild(userInfo);

        let repos_url = result.items[i].repos_url;
        let repo_response = await fetch(repos_url);
        let repo_result = await repo_response.json();

        let repoHeader = document.createElement("h3");
        repoHeader.textContent = "Top Repositories";
        repoHeader.className = "user-repo-header";

        newUser.appendChild(repoHeader);

        let repoList = document.createElement("ul");

        for(let j = 0; j <  Math.min(3, repo_result.length); j++){

            let userRepo = document.createElement("li");
            userRepo.className = "user-repo";

            let repoLink = document.createElement("a");
            repoLink.href = repo_result[j].html_url;
            repoLink.textContent = repo_result[j].name;
            repoLink.className = "user-repo-link";

            let description = document.createElement("p");
            description.className = "user-repo-description";
            description.textContent = "→ " + repo_result[j].description;

            userRepo.appendChild(repoLink);
            userRepo.appendChild(description);
            repoList.appendChild(userRepo);
        }
        newUser.appendChild(repoList);
        userDiv.appendChild(newUser);
    }
}

async function displayRepoResults(){
    const url = "https://api.github.com/search/repositories?q=" + searchValue;
    const response = await fetch(url);
    const result = await response.json();

    const repoDiv = document.getElementById("repo-results");

    if(result.total_count === 0){
        const errorMsg = document.createElement("h2");
        errorMsg.className = "error-msg";
        errorMsg.textContent = "No repositories matching " + searchValue;
        repoDiv.appendChild(errorMsg);
    }

    for(let i = 0; i < Math.min(3, result.total_count); i++){

        let newRepo = document.createElement("div");
        newRepo.className = "repo";

        let newRepoInfo = document.createElement("div");
        newRepoInfo.className = "repo-name-owner-div";

        let nameLink = document.createElement("a");
        nameLink.href = result.items[i].html_url;

        let name = document.createElement("h2");
        name.textContent = result.items[i].name;
        nameLink.className = "repo-name";
        nameLink.appendChild(name);
        newRepoInfo.appendChild(nameLink);

        newRepo.appendChild(newRepoInfo);

        let ownerName = document.createElement("h4");
        ownerName.textContent = " by " + result.items[i].owner.login;
        ownerName.className = "repo-owner-name";
        newRepoInfo.appendChild(ownerName);

        let description = document.createElement("p");
        description.textContent = result.items[i].description;
        description.className = "repo-description";
        newRepo.appendChild(description);

        let commitHeader = document.createElement("h3");
        commitHeader.textContent = "Latest Commit";
        commitHeader.className = "repo-commit-header";
        
        newRepo.appendChild(commitHeader);

        let commit_url =  result.items[i].commits_url.match(/^(.*?)(?={)/)[1];

        console.log(commit_url);

        let commits_response = await fetch(commit_url);
        let commits_result = await commits_response.json();

        if (commits_result[0].commit && commits_result[0].commit.author) {
            let commit_author = document.createElement("p");
            commit_author.textContent = commits_result[0].commit.author.name + " | " + commits_result[0].commit.author.date.replace(/T\d{2}:\d{2}:\d{2}Z/, '');
            commit_author.className = "repo-commit-author-date";
            newRepo.appendChild(commit_author);
    
            let commit_message = document.createElement("p");
            commit_message.textContent = commits_result[0].commit.message;
            commit_message.className = "repo-commit-message";
            newRepo.appendChild(commit_message);
        } else {
            // Handle the case where commit or commit.author is undefined
            console.error("Commit information not available for repository " + result.items[i].name);
        }

        repoDiv.appendChild(newRepo);
    }
}

async function displayTopicResults(){
    const url = "https://api.github.com/search/topics?q=" + searchValue;
    const response = await fetch(url);
    const result = await response.json();

    const topicDiv = document.getElementById("topic-results");

    if(result.total_count === 0){
        const errorMsg = document.createElement("h2");
        errorMsg.className = "error-msg";
        errorMsg.textContent = "No topics matching " + searchValue;
        topicDiv.appendChild(errorMsg);
    }

    for(let i = 0; i < Math.min(3, result.total_count); i++){
        let newTopic = document.createElement("div");
        newTopic.className = "topic";

        let name = document.createElement("h2");
        name.className = "topic-name";
        name.textContent = result.items[i].name;
        newTopic.appendChild(name);

        let description = document.createElement("p");
        description.className = "topic-description";
        if(result.items[i].short_description){
            description.textContent = result.items[i].short_description;
        }
        else{
            description.className = ""
            description.textContent = "Looks like there isn't much information for this topic...";
        }

        newTopic.appendChild(description);

        let founder = document.createElement("p");
 
        if(result.items[i].created_by){
            founder.className = "topic-founder";
            founder.textContent = "Created by " + result.items[i].created_by;
        }
        else{
            founder.textContent = "Could not locate any information about this topic's founder...";
        }
        newTopic.appendChild(founder);

        let date = document.createElement("p");
        date.textContent = result.items[i].created_at.replace(/T\d{2}:\d{2}:\d{2}Z/, '');
        newTopic.appendChild(date);

        topicDiv.appendChild(newTopic);
    }
}

async function displayOrganizationResults(){

    const orgDiv = document.getElementById("organization-results");

    const url = "https://api.github.com/orgs/" + searchValue;
    const response = await fetch(url);

    if(response.status == 404){
        const errorMsg = document.createElement("h2");
        errorMsg.className = "error-msg";
        errorMsg.textContent = "No organizations matching " + searchValue;
        orgDiv.appendChild(errorMsg);
        return;
    }
    const result = await response.json();

    const newOrgDetails = document.createElement("div");
    const newOrgRepos = document.createElement("div");

    if(result.hasOwnProperty("message")){
        const errorMsg = document.createElement("h2");
        errorMsg.textContent = "There are no organizations matching your search.";
        errorMsg.className = "org-error";
        newOrgDetails.appendChild(errorMsg);

    }
    else{
        const name = document.createElement("h2");
        name.className = "org-name";
        name.textContent = result.name;
        newOrgDetails.appendChild(name);

        const image = document.createElement("img");
        image.src = result.avatar_url;
        image.href = result.html_url;
        image.className = "org-image";
        newOrgDetails.appendChild(image);

        const location = document.createElement("p");
        location.textContent = "Located in " + result.location;
        location.className = "org-location";
        newOrgDetails.appendChild(location);

        const repoHeader = document.createElement("h2");
        repoHeader.className = "org-repos-head";
        repoHeader.textContent = "Top Repositories within " + result.name;
        newOrgRepos.appendChild(repoHeader);

        const repo_url = result.repos_url;
        const repo_response = await fetch(repo_url);
        const repo_result = await repo_response.json()


        for(let i = 0; i < Math.min(3, repo_result.length); i++){
            let name_link = document.createElement("a");
            name_link.textContent = repo_result[i].name;
            name_link.href = repo_result[i].html_url;
            name_link.className = "org-repo-name";

            let description = document.createElement("p");
            description.textContent = repo_result[i].description;
            description.className = "org-repo-description";

            newOrgRepos.appendChild(name_link);
            newOrgRepos.appendChild(description);
        }

        orgDiv.appendChild(newOrgDetails);
        orgDiv.appendChild(newOrgRepos);

    }
}

displayUserResults();
displayRepoResults();
displayTopicResults();
displayOrganizationResults();