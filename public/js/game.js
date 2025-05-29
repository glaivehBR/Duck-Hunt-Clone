const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const somTiro = new Audio('/assets/audio/tiro.mp3');
const somAcerto = new Audio('/assets/audio/acerto.mp3');

const btnPlayMusica = document.getElementById('btnPlayMusica');


const patoSprite = new Image();
patoSprite.src = '/assets/pato.png';

const explosaoSprite = new Image();
explosaoSprite.src = '/assets/explosao.png';

const MiraSprite = new Image();
MiraSprite.src = '/assets/mira.png';

const patoMortoSprite = new Image();
patoMortoSprite.src = '/assets/pato_morto.png';


let patos = [];
let patosMortos = [];
let explosoes = [];
let score = 0;
let gameOver = false;
let tempoDeJogo = 30; // segundos
let timer;

// Cria pato
function criarPato() {
    const lado = Math.random() < 0.5 ? 'esquerda' : 'direita';
    const y = Math.random() * (canvas.height - 100) + 50;
    const speed = Math.random() * 2 + 2;
    const pato = {
        x: lado === 'esquerda' ? -60 : canvas.width + 60,
        y: y,
        dir: lado === 'esquerda' ? 1 : -1,
        speed: speed
    };
    patos.push(pato);
}

// Desenha pato
function desenharPato(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.dir === 1) {
        ctx.scale(1, 1);
    } else {
        ctx.scale(-1, 1);
    }

    ctx.drawImage(patoSprite, -30, -30, 60, 60);
    ctx.restore();
}

// Desenha pato morto
function desenharPatosMortos() {
    patosMortos.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.dir === 1) {
            ctx.scale(1, 1);
        } else {
            ctx.scale(-1, 1);
        }

        ctx.drawImage(patoMortoSprite, -30, -30, 60, 60); // ← agora usa o sprite certo

        ctx.restore();

        p.y += p.speed;
    });

    // Remove pato quando chega no chão (ajuste o valor conforme seu canvas)
    patosMortos = patosMortos.filter(p => p.y < 570);
}



// Desenha explosões
function desenharExplosoes() {
    explosoes.forEach(e => {
        ctx.drawImage(explosaoSprite, e.x - 30, e.y - 30, 60, 60);
        e.tempo--;
    });
    explosoes = explosoes.filter(e => e.tempo > 0);
}

function atualizarPatos() {
    patos.forEach(p => {
        p.x += p.speed * p.dir;
    });
    patos = patos.filter(p => {
        if (p.dir === 1) return p.x < canvas.width + 60;
        else return p.x > -60;
    });
}


function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    patos.forEach(desenharPato);
    desenharPatosMortos();
    desenharExplosoes();

    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText(`Tempo: ${tempoDeJogo}`, 10, 20);
}


function gameLoop() {
    if (gameOver) return;
    atualizarPatos();
    desenhar();
    requestAnimationFrame(gameLoop);
}


canvas.addEventListener('click', (e) => {
    somTiro.currentTime = 0;
    somTiro.play();

    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let acertou = false;

    patos.forEach((pato, index) => {
        if (
            mx > pato.x - 30 && mx < pato.x + 30 &&
            my > pato.y - 30 && my < pato.y + 30
        ) {
            // ACERTOU
            somAcerto.currentTime = 0;
            somAcerto.play();

            // Efeito
            explosoes.push({ x: pato.x, y: pato.y, tempo: 15 });
            patosMortos.push({ x: pato.x, y: pato.y, speed: 3 });

            patos.splice(index, 1);
            score++;
            document.getElementById('score').innerText = `Pontuação: ${score}`;
            acertou = true;
        }
    });
});

// Timer do jogo
function iniciarTimer() {
    timer = setInterval(() => {
        tempoDeJogo--;
        if (tempoDeJogo <= 0) {
            finalizarJogo();
        }
    }, 1000);
}

// Finaliza jogo
function finalizarJogo() {
    gameOver = true;
    clearInterval(timer);
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameover').style.display = 'block';
}

// Salvar pontuação
async function salvarScore() {
    const nome = document.getElementById('name').value.toUpperCase();
    if (nome.length !== 3) {
        alert('Digite exatamente 3 letras');
        return;
    }
    await fetch('/scoreboard/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, score: score })
    });
    window.location.href = '/scoreboard';
}

// Começa
function start() {
    setInterval(criarPato, 1000);
    iniciarTimer();
    gameLoop();
}

patoSprite.onload = start;
