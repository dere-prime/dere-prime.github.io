const username = 'dere-prime'; // Reemplaza esto con tu nombre de usuario de GitHub

async function fetchRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`);
        const repos = await response.json();
        displayRepositories(repos.slice(0, 6)); // Muestra los 6 repositorios más recientes
    } catch (error) {
        console.error('Error fetching repositories:', error);
    }
}

function displayRepositories(repos) {
    const repoList = document.getElementById('repo-list');
    const filteredRepos = repos.filter(repo => !repo.name.endsWith('.github.io'));
    
    filteredRepos.forEach(repo => {
        const repoElement = document.createElement('div');
        repoElement.className = 'repo';
        repoElement.innerHTML = `
            <h3>
				<a href="${repo.html_url}" target="_blank">${repo.name}</a>
			</h3>
            <p>${repo.description || 'No description available.'}</p>
        `;
        repoList.appendChild(repoElement);
    });
}

const text = "dere.prime";
const linkElement = document.querySelector('#header .profile-name'); // Selecciona el <a>

let index = 0;

function WriteHeaderText() {
    if (index < text.length) {
        linkElement.textContent = text.slice(0, index + 1); // Cambia solo el texto dentro del <a>
        index++;
        setTimeout(WriteHeaderText, 180);
    }
}

WriteHeaderText();
fetchRepositories();

