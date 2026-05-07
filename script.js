const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const mapElement = document.getElementById('mapa');
const muteButton = document.getElementById('mute-button');
const touchButtons = document.querySelectorAll('#touch-controls .touch-btn');

const sfx = {
    mapStart: new Audio('assets/SMB3_v2_C++_assets_audio_sfx_Map Start.ogg'),
    mapMove: new Audio('assets/SMB3_v2_C++_assets_audio_sfx_Map Move.ogg'),
    levelStart: new Audio('assets/SMB3_v2_C++_assets_audio_sfx_Level Start.ogg')
};

let isMuted = false;
let hasPlayedMapStart = false;
const infoNodeHitboxes = new Map();

Object.values(sfx).forEach((audio) => {
    audio.preload = 'auto';
    audio.volume = 0.7;
});

function updateMuteButton() {
    if (!muteButton) return;
    muteButton.textContent = isMuted ? 'MUTE: ON' : 'MUTE: OFF';
}

function setMuted(value) {
    isMuted = value;
    Object.values(sfx).forEach((audio) => {
        audio.muted = isMuted;
    });
    updateMuteButton();
}

function playSfx(audio) {
    if (isMuted || !audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
        // El navegador puede bloquear autoplay hasta la primera interaccion.
    });
}

function tryPlayMapStart() {
    if (hasPlayedMapStart || isMuted) return;
    sfx.mapStart.currentTime = 0;
    sfx.mapStart.play().then(() => {
        hasPlayedMapStart = true;
    }).catch(() => {
        // Se volvera a intentar en la siguiente interaccion del usuario.
    });
}

// 1. Define aquí las coordenadas (x, y) de cada punto de tu mapa
// Puedes obtenerlas abriendo tu imagen en Paint o Photoshop y viendo los píxeles
const nodes = {
    'start':   { x: 255, y: 245, neighbors: { right: 'node1' } },
    'node1':   { x: 390, y:245, neighbors: { left: 'start', up: 'aboutme', down: 'node5' } },
    'aboutme': { x: 390, y: 100, neighbors: { right: "node2", down:"node1"}, info: 'about-modal' },
    'node2':  { x: 560, y: 100, neighbors: { left:"aboutme", right:'sport' }},
    'sport':  { x: 710, y: 100, neighbors: { left: 'node2', down: 'node3'}, info: 'sports-modal' },
    'node3':   { x: 710, y: 235, neighbors: { up:'sport' , right:'redes', down: "hobbies" } },
    'redes': { x: 920, y: 235, neighbors: { left:'node3', up:"node4"}, info: "redes-modal"},
    'node4':   { x: 920, y: 100, neighbors: { right:'school' , down:'redes'} },
    'school':  { x: 1140, y: 100, neighbors: { left:'node4' }, info: "school-modal"},
    "hobbies": { x: 710, y: 370, neighbors: { left:'node6', up:"node3", down:"node7"}, info: "hobbies-modal"},
    'node5':   { x: 390, y: 370, neighbors: { up:'node1' , right:'node6', down:"futuro"} },
    'node6':   { x:560, y: 370, neighbors: { right:'hobbies' , left:'node5'} },
    "node7": { x: 680, y: 525, neighbors: { left:'node8' , right:'juego', up:"hobbies"} },
    'futuro':   { x: 390, y: 640, neighbors: { right:'node9' , up:'node5'}, info: "futuro-modal" },
    "node9":   { x: 580, y: 640, neighbors: { left:'futuro' , up:'node8'} },
    "node8": { x: 580, y: 525, neighbors: { right:"node7", down:"node9"} }, //ESTOY CHECANDO ESTA
    "juego": { x: 1040, y: 525, neighbors: { left:'node7' } , info: "juego-modal"},
    
};

let currentNodeKey = 'start';

function moveToDirection(direction) {
    const neighbors = nodes[currentNodeKey].neighbors;
    const nextNode = neighbors ? neighbors[direction] : null;
    if (!nextNode) return;

    currentNodeKey = nextNode;
    updatePlayerPosition();
    playSfx(sfx.mapMove);
}

function handleEnterAction() {
    if (isModalOpen) {
        closeModal();
        return;
    }

    const nodeInfo = nodes[currentNodeKey].info;
    if (nodeInfo) {
        playSfx(sfx.levelStart);
        openModal(nodeInfo);
    }
}

function handleGameAction(action) {
    tryPlayMapStart();

    if (action === 'enter') {
        handleEnterAction();
        return;
    }

    if (isModalOpen) return;
    moveToDirection(action);
}

function getMapMetrics() {
    if (!gameContainer || !mapElement) return null;

    const containerRect = gameContainer.getBoundingClientRect();
    const mapRect = mapElement.getBoundingClientRect();

    const baseWidth = mapElement.naturalWidth || mapRect.width || 1;
    const baseHeight = mapElement.naturalHeight || mapRect.height || 1;

    return {
        offsetX: mapRect.left - containerRect.left,
        offsetY: mapRect.top - containerRect.top,
        scaleX: mapRect.width / baseWidth,
        scaleY: mapRect.height / baseHeight
    };
}

function getScaledNodePosition(node) {
    const metrics = getMapMetrics();
    if (!metrics) return { x: node.x, y: node.y };

    return {
        x: metrics.offsetX + (node.x * metrics.scaleX),
        y: metrics.offsetY + (node.y * metrics.scaleY)
    };
}

function updatePlayerPosition() {
    const node = nodes[currentNodeKey];
    const scaled = getScaledNodePosition(node);
    // Ajustamos para que el centro del personaje coincida con el punto
    player.style.left = (scaled.x - (player.offsetWidth / 2)) + 'px';
    player.style.top = (scaled.y - (player.offsetHeight / 2)) + 'px';
}

// Inicializar posición
updatePlayerPosition();

// Variable para bloquear el movimiento si el modal está abierto
let isModalOpen = false;

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') handleGameAction('up');
    if (e.key === 'ArrowDown') handleGameAction('down');
    if (e.key === 'ArrowLeft') handleGameAction('left');
    if (e.key === 'ArrowRight') handleGameAction('right');
    if (e.key === 'Enter' || e.key === 'Escape') handleGameAction('enter');
});

function openModal(infoId) {
    const modal = document.getElementById('modal-container');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const data = contentData[infoId];

    if (data) {
        title.innerText = data.titulo || data.title;
        
        // Si la sección tiene un diseño único (customHTML), lo carga
        if (data.customHTML) {
            body.innerHTML = data.customHTML;
        } else {
            // Formato estándar para los que aún no diseñamos
            body.innerHTML = `
                <div class="default-modal-content clearfix">
                    ${(data.imagen || data.image) ? `<img src="${data.imagen || data.image}" class="modal-img-right">` : ''}
                    <p>${data.texto || data.body}</p>
                </div>
            `;
        }
    }

    modal.classList.remove('modal-hidden');
    isModalOpen = true;
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');
    
    if (modal) {
        modal.classList.add('modal-hidden');
    }
    
    // Limpiamos el contenido para que no se mezcle con el siguiente pop-up
    if (body) {
        body.innerHTML = '';
    }
    
    isModalOpen = false;
}

function renderInfoNodeHitboxes() {
    if (!gameContainer) return;

    Object.entries(nodes).forEach(([nodeKey, node]) => {
        if (!node.info) return;
        if (infoNodeHitboxes.has(nodeKey)) return;

        const hitbox = document.createElement('button');
        hitbox.type = 'button';
        hitbox.className = 'info-node-hitbox';
        hitbox.setAttribute('aria-label', `Abrir ${node.info}`);

        hitbox.addEventListener('click', () => {
            tryPlayMapStart();
            if (isModalOpen) return;

            currentNodeKey = nodeKey;
            updatePlayerPosition();
            playSfx(sfx.levelStart);
            openModal(node.info);
        });

        gameContainer.appendChild(hitbox);
        infoNodeHitboxes.set(nodeKey, hitbox);
    });

    updateHitboxPositions();
}

function updateHitboxPositions() {
    infoNodeHitboxes.forEach((hitbox, nodeKey) => {
        const node = nodes[nodeKey];
        if (!node) return;
        const scaled = getScaledNodePosition(node);
        hitbox.style.left = `${scaled.x}px`;
        hitbox.style.top = `${scaled.y}px`;
    });
}

function updateNodeLayout() {
    updatePlayerPosition();
    updateHitboxPositions();
}

// Usamos addEventListener para asegurar que capture el clic correctamente
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            setMuted(!isMuted);
        });
    }

    touchButtons.forEach((button) => {
        const action = button.dataset.action;
        if (!action) return;

        button.addEventListener('click', () => {
            handleGameAction(action);
        });
    });

    updateMuteButton();
    tryPlayMapStart();
    renderInfoNodeHitboxes();
    updateNodeLayout();
});

window.addEventListener('click', tryPlayMapStart, { once: true });
window.addEventListener('resize', updateNodeLayout);

if (mapElement) {
    if (mapElement.complete) {
        updateNodeLayout();
    } else {
        mapElement.addEventListener('load', updateNodeLayout);
    }
}

// También cerramos si haces clic fuera del recuadro blanco (en el fondo oscuro)
window.onclick = function(event) {
    const modal = document.getElementById('modal-container');
    if (event.target == modal) {
        closeModal();
    }
}

const contentData = {
    'about-modal': {
    titulo: "SOBRE MÍ",
    customHTML: `
        <div class="about-special-container">
            <div class="about-bg-blur"></div> 
            
            <div class="about-content-overlay">
                <img src="assets/Asunto.png" class="about-character-large">
                
                <div class="about-text-zone">
                    <p style="font-size: 1.3em; text-shadow: 2px 2px 0px #000; color: #fff;">
                        Hola, soy Paris López. Tengo 20 años y soy originario de la Ciudad de México. Actualmente vivo como foráneo para estar cerca del ITAM, donde estudio Ciencia de Datos; mi familia vive en el Estado de México, ya que por logística les resulta más cómodo estar allá. Esta etapa de vivir por mi cuenta me ha permitido enfocarme de lleno en la carrera mientras mantengo esa cercanía con los míos.<br><br>
                    </p>
                    <p>
                        
                    </p>
                </div>
            </div>
        </div>
    `
},
    'sports-modal': {
        titulo: "DEPORTES",
        customHTML: `
        <div class="sports-special-container">
            <div class="sports-bg-blur"></div>

            <div class="sports-content-overlay">
                <img src="assets/deportes.png" class="sports-photo-left" alt="Foto deportes">

                <div class="sports-text-zone">
                    <p style="font-size: 1.2em; text-shadow: 2px 2px 0px #000; color: #fff;">
                        Me apasionan los deportes, en especial el tenis y el fútbol. De niño, a los 10 años, jugaba en las fuerzas básicas del América en Coapa, pero terminé dejándolo porque mi mamá prefirió que me enfocara en la escuela. Pasé varios años practicando básquetbol y karate, hasta que en 2025 me interesó el tenis. He competido en tres torneos y, aunque aún no he ganado el primero, mi nivel ha mejorado con cada partido.
                    </p>
                </div>
            </div>
        </div>
    `
    },
    'hobbies-modal': {
        titulo: "MIS PASATIEMPOS",
        customHTML: `
        <div class="hobbies-special-container">
            <div class="hobbies-bg-blur"></div>

            <div class="hobbies-content-overlay">
                <img src="assets/hobbies.png" class="hobbies-photo-right" alt="Foto hobbies">

                <div class="hobbies-text-zone">
                    <p style="font-size: 1.2em; text-shadow: 2px 2px 0px #000; color: #fff;">
                        En mi tiempo libres, además de los deportes, disfruto mucho de la lectura y de explorar el mundo de la producción musical; me interesa aprender a mezclar y crear beats para futuras canciones, aunque prefiero quedarme detrás de los controles y no cantar. También soy fan de los videojuegos de todo tipo y me fascina el cine de terror, siendo Siniestro mi película favorita.
                    </p>
                </div>
            </div>
        </div>
    `
    },
    'redes-modal': {
        titulo: "CONTACTO",
        customHTML: `
        <div class="redes-special-container">
            <div class="redes-bg-blur"></div>

            <div class="redes-content-overlay">
                <div class="redes-list">
                    <div class="redes-item">
                        <img src="assets/red-1.png.webp" class="redes-icon-image" alt="Instagram">
                        <p>parisloru.4</p>
                    </div>

                    <div class="redes-item">
                        <img src="assets/red-2.jpg" class="redes-icon-image" alt="Facebook">
                        <p>&nbsp;</p>
                    </div>

                    <div class="redes-item">
                        <img src="assets/red-3.jpg" class="redes-icon-image" alt="WhatsApp">
                        <p>&nbsp;</p>
                    </div>

                    <div class="redes-item">
                        <img src="assets/red-4.jpg" class="redes-icon-image" alt="Outlook">
                        <p>plopezru@itam.mx</p>
                    </div>
                </div>
            </div>
        </div>
    `
    },
    'school-modal': {
        titulo: "FORMACIÓN ACADÉMICA",
        customHTML: `
        <div class="school-special-container">
            <div class="school-bg-blur"></div>

            <div class="school-content-overlay">
                <img src="assets/escuela.jpeg" class="school-photo-left-bottom" alt="Foto ITAM">

                <div class="school-text-zone">
                    <p style="font-size: 1.2em; text-shadow: 2px 2px 0px #000; color: #fff;">
                        Actualmente curso el cuarto semestre de mi carrera en el ITAM. Realicé mis estudios de preparatoria en la Prepa UP, donde tuve la gran oportunidad de involucrarme en el mundo de la tecnología de manera práctica, compitiendo en el torneo de robótica de FIRST.
                    </p>
                </div>
            </div>
        </div>
    `
    },
    "futuro-modal":{
        titulo: "METAS A FUTURO",
        customHTML: `
        <div class="future-special-container">
            <div class="future-bg-blur"></div>

            <div class="future-content-overlay">
                <img src="assets/futuro.png" class="future-photo-right" alt="Foto futuro">

                <div class="future-text-zone">
                    <p style="font-size: 1.2em; text-shadow: 2px 2px 0px #000; color: #fff;">
                        En el futuro cercano, mi meta es empezar a trabajar antes de graduarme para fortalecer mi formación y aprender a aplicar mis conocimientos en el mundo laboral real. A largo plazo, aspiro a cursar una maestría en ciberseguridad en alguna institución extranjera y formar una familia propia.
                    </p>
                </div>
            </div>
        </div>
    `
    },
    "juego-modal": {
        titulo: "CRÉDITOS",
        customHTML: `
        <div class="credits-special-container">
            <div class="credits-bg-blur"></div>

            <div class="credits-content-overlay">
                <p>
                    <strong>Idea:</strong> Se tomó como inspiracion el juego de Super Mario Bros 3.<br><br>
                    <strong>Código:</strong> Se hizo una mezcla entre código propio, generado por IA y reciclado de otros proyectos.<br><br>
                    <strong>Imágenes:</strong> Todas las imágenes fueron generadas con Nano Banana 2.<br><br>
                    <strong>Sonido:</strong> Al igual que algunas partes del código, se tomaron en cuenta proyectos en GitHub, en especial: https://github.com/Izay0i/SuperMarioBros3
                </p>
            </div>
        </div>
        `
    }
    
};