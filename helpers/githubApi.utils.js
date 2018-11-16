export function callGitHubForTopic(repositoryURL, progress){
    // https://api.github.com/repos/octocat/Hello-World/commits
    repositoryURL = repositoryURL.replace('https://github.com/', '');
    const authorRepo = repositoryURL.split('/');
    const apiURL = `https://api.github.com/repos/${authorRepo[0]}/${authorRepo[1]}/commits`;

    return new Promise((resolve, reject) => {
        console.log("Getting informations from repository", repositoryURL);
        progress.show();

        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiURL, true);
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                progress.total(e.total);
                progress.add(e.loaded);
            }
        }
        const onError = function () {
            progress.hide();
            reject();
        };
        xhr.onerror = onError;
        xhr.onload = (e) => {
            if (xhr.status == 200) {
                const commits = JSON.parse(xhr.responseText);
                progress.hide();
                resolve(commits);
            } else {
                onError()
                reject();
            }
        };
        
        xhr.send(null);
    });
}