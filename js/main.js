/* Cursor */
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

/* Efeito de escrita (o do hacker e o de maquina de escrever) */

function inicializarEfeitoIntro() {
    const titulo = document.getElementById('typing-title');
    const subtitulo = document.getElementById('typing-subtitle');
    const botao = document.querySelector('.btn-intro-contato');

    if (!titulo || !subtitulo) return;

    const textoFinalTitulo = titulo.getAttribute('data-text') || "Olá, eu sou a Olívia!";
    const textoFinalSubtitulo = "Desenvolvedora Full-Stack";
    const simbolos = "X@#$*&%?§ΔΩZ+-/_[]{}";

    let progressoTitulo = 0;
    titulo.classList.add('blink-cursor');

    function decodificarTitulo() {
        if (progressoTitulo <= textoFinalTitulo.length) {
            let iteracoes = 0;

            const intervalGlitch = setInterval(() => {
                let textoIntermediario = textoFinalTitulo.slice(0, progressoTitulo);
                
                if (progressoTitulo < textoFinalTitulo.length) {
                    const simboloAleatorio = simbolos[Math.floor(Math.random() * simbolos.length)];
                    textoIntermediario += simboloAleatorio;
                }
                
                titulo.textContent = textoIntermediario;
                iteracoes++;

                if (iteracoes >= 4) {
                    clearInterval(intervalGlitch);
                    progressoTitulo++;
                    setTimeout(decodificarTitulo, 40);
                }
            }, 25);
        } else {
            titulo.classList.remove('blink-cursor');
            subtitulo.classList.add('blink-cursor');
            setTimeout(digitarSubtitulo, 400);
        }
    }


    let indexSubtitulo = 0;
    function digitarSubtitulo() {
        if (indexSubtitulo < textoFinalSubtitulo.length) {
            subtitulo.textContent += textoFinalSubtitulo.charAt(indexSubtitulo);
            indexSubtitulo++;
            setTimeout(digitarSubtitulo, 65);

            subtitulo.classList.remove('blink-cursor');
            if (botao) {
                botao.classList.add('show-btn');
            }
        }
    }

    decodificarTitulo();
}

/* Caderninho */

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

/* Carrossel - habilidades */

function inicializarGloboFisheye() {
    const container = document.querySelector('.wall-container');
    const modal = document.getElementById('skill-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');
    const rows = Array.from(document.querySelectorAll('.wall-row'));

    if (!container || rows.length === 0) return;

    let isDragging = false;
    let startX = 0;
    let dragDistance = 0;

    const rowStates = rows.map(row => {
        const itensOriginais = Array.from(row.querySelectorAll('.wall-item'));
        
        if(row.querySelectorAll('.wall-item').length > itensOriginais.length) {
            return; 
        }

        itensOriginais.forEach(item => {
            const clone1 = item.cloneNode(true);
            const clone2 = item.cloneNode(true);
            row.appendChild(clone1);
            row.insertBefore(clone2, row.firstChild);
        });

        const todosItens = Array.from(row.querySelectorAll('.wall-item'));
        const itemWidth = 82;
        const gap = 24;
        const totalWidth = todosItens.length * (itemWidth + gap);
        const larguraOriginal = itensOriginais.length * (itemWidth + gap);

        return {
            element: row,
            items: todosItens,
            totalWidth: totalWidth,
            larguraOriginal: larguraOriginal,
            baseSpeed: parseFloat(row.getAttribute('data-speed')) || 1,
            currentX: -larguraOriginal
        };
    });

    function renderizarDistorcaoFisheye() {
        const containerRect = container.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;

        rowStates.forEach(state => {
            if(!state) return;
            state.items.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                
                const distX = itemCenterX - containerCenterX;
                const maxRange = 450; 
                
                const fator = Math.max(0, 1 - Math.abs(distX) / maxRange);
                const curvatura = Math.pow(fator, 1.5);

                const escala = 0.58 + (curvatura * 0.82); 
                const opacidade = 0.08 + (curvatura * 0.92);

                const rotateY = (distX / maxRange) * 45;

                item.style.transform = `scale(${escala}) rotateY(${rotateY}deg)`;
                item.style.opacity = opacidade;
            });
        });
    }

    function animarEsteiras(dragProgress) {
        rowStates.forEach(state => {
            if(!state) return;
            state.currentX += dragProgress * state.baseSpeed;

            if (state.currentX < -state.larguraOriginal * 2) {
                state.currentX += state.larguraOriginal;
            }
            else if (state.currentX > -state.larguraOriginal) {
                state.currentX -= state.larguraOriginal;
            }

            state.element.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
        });

        renderizarDistorcaoFisheye();
    }

    function iniciarDrag(e) {
        isDragging = true;
        dragDistance = 0;
        startX = e.pageX || e.touches[0].pageX;
    }

    function moverDrag(e) {
        if (!isDragging) return;
        dragDistance++;
        
        const currentMouseX = e.pageX || e.touches[0].pageX;
        const dragProgress = currentMouseX - startX;
        startX = currentMouseX;

        requestAnimationFrame(() => animarEsteiras(dragProgress));
    }

    function pararDrag() {
        isDragging = false;
        renderizarDistorcaoFisheye();
    }

    container.addEventListener('mousedown', iniciarDrag);
    window.addEventListener('mousemove', moverDrag);
    window.addEventListener('mouseup', pararDrag);

    container.addEventListener('touchstart', iniciarDrag);
    window.addEventListener('touchmove', moverDrag, { passive: true });
    window.addEventListener('touchend', pararDrag);

    rowStates.forEach(state => {
        if(!state) return;
        state.items.forEach(item => {
            item.addEventListener('click', (e) => {
                if (dragDistance > 5) return; 

                const name = item.getAttribute('data-name');
                const imgUrl = item.getAttribute('data-img');

                if (!name || !imgUrl) return;

                modalImg.setAttribute('src', imgUrl);
                modalImg.setAttribute('alt', name);
                modalTitle.innerText = name;

                modal.classList.add('active');
            });
        });
    });

    closeModal.addEventListener('click', (e) => {
        e.stopPropagation();
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    animarEsteiras(0);
}

/* Scroll */

function animarAoScroll() {
    const secoes = document.querySelectorAll('#sobre, #projetos, #habilidades, #formacao, #contato');
    
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('show-section');
            }
        });
    }, {
        threshold: 0.15 
    });

    secoes.forEach(secao => {
        secao.classList.add('hidden-section'); 
        observador.observe(secao);
    });
}

/* Botão voltar ao topo */

function inicializarBotaoTopo() {
    const btnTopo = document.getElementById('btn-topo');
    if (btnTopo) {
        btnTopo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' 
            });
        });
    }
}

/* Tema (Claro / Escuro) */
function inicializarModoEscuro() {
    const checkboxTema = document.getElementById('checkbox-tema');
    
    if (!checkboxTema) return;

    const temaSalvo = localStorage.getItem('modo-escuro');
    
    if (temaSalvo === 'true') {
        document.body.classList.add('dark-mode');
        checkboxTema.checked = true;
    }

    checkboxTema.addEventListener('change', () => {
        if (checkboxTema.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('modo-escuro', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('modo-escuro', 'false');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarEfeitoIntro();
    carregarProjetos();        
    inicializarGloboFisheye(); 
    animarAoScroll(); 
    inicializarBotaoTopo();   
    inicializarModoEscuro(); 
});