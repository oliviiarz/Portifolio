/* Cursor personalizado */
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => {
    cursor.classList.add('mouseclick');
});
document.addEventListener('mouseup', () => {
    cursor.classList.remove('mouseclick');
});

/* caderno */
const notebook = document.getElementById('notebook');

if (notebook) {
    notebook.addEventListener('click', () => {
        notebook.classList.toggle('open');
    });
}


/* API do GitHub */
const GITHUB_USERNAME = 'oliviiarz'; 

async function carregarProjetos() {
    const containerProjetos = document.getElementById('lista-projetos');
    
    if (!containerProjetos) return;
    const tagsCustomizadas = {
        'nome-do-seu-repo': 'HTML, CSS, JavaScript, Node.js',
        'projeto-faculdade': 'C, C++, Makefile'
    };

    try {
        const resposta = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=created&per_page=6&type=all`);
        
        if (!resposta.ok) throw new Error('Erro ao buscar projetos');

        const repositorios = await resposta.json();
        containerProjetos.innerHTML = '';

        for (const repo of repositorios) {
            const card = document.createElement('div');
            card.classList.add('card-projeto');

            const legendaFinal = tagsCustomizadas[repo.name] || repo.description || 'Projeto sem descrição...';

            const respostaLinguagens = await fetch(repo.languages_url);
            const linguagensObjeto = await respostaLinguagens.json();
            const listaLinguagens = Object.keys(linguagensObjeto);

            if (listaLinguagens.length === 0 && repo.language) {
                listaLinguagens.push(repo.language);
            } else if (listaLinguagens.length === 0) {
                listaLinguagens.push('HTML/CSS');
            }

            const tagsHTML = listaLinguagens.map(lang => `<span>${lang}</span>`).join(' ');

            card.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${legendaFinal}</p>
                <div class="tags-projeto">
                    ${tagsHTML}
                </div>
                <span class="hint-projeto">Clique para acessar no GitHub</span>
            `;

            containerProjetos.appendChild(card);

            card.addEventListener('click', (evento) => {
                evento.stopPropagation(); 
                window.open(repo.html_url, '_blank'); 
            });
        }

    } catch (erro) {
        console.error(erro);
        containerProjetos.innerHTML = '<p>Erro ao carregar os projetos...</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarProjetos);

