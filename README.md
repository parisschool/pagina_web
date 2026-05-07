# Paris López · Mi página web

Sitio tipo mundo de mapa (estilo retro / Mario) para presentar secciones personales: sobre mí, deportes, pasatiempos, formación, contacto, metas y créditos. Se navega con flechas y **Enter**; en móvil hay controles táctiles y sonidos opcionales con **mute**.

## Demo en vivo

- **GitHub Pages:** [https://parisschool.github.io](https://parisschool.github.io)  
  *(o la URL que tengas configurada para este repositorio en Settings → Pages)*

## Cómo verlo en tu computadora

No hace falta build ni dependencias. Con un servidor estático basta:

```bash
# Desde la carpeta del proyecto
python3 -m http.server 8080
```

Abre en el navegador: `http://localhost:8080`

*(Las rutas a `assets/` y fuentes son relativas; evita abrir `index.html` directo con `file://` si algo no carga.)*

## Controles

| Acción | Teclado | Táctil |
|--------|---------|--------|
| Mover | Flechas | Botones de dirección |
| Abrir sección | Enter | ENTER |
| Cerrar ventana | Enter / Escape | Botón × |

Los bloques de sonido respetan el botón **MUTE**.

## Estructura principal

```
index.html      # Entrada
style.css       # Estilos y modales responsivos
script.js       # Nodos del mapa, modales, audio, hitboxes
assets/         # Imágenes, sonidos (.ogg), fuentes
```

La posición del personaje y los clics en nodos “con info” se escalan con el tamaño del mapa en pantalla (`naturalWidth` / `naturalHeight` vs. tamaño renderizado).

## Stack

- HTML5, CSS3, JavaScript vanilla  
- GitHub Pages para hosting estático

## Licencia y créditos

Los créditos detallados (idea, código, imágenes, sonido) están en el modal **Créditos** dentro del sitio.

---

*Proyecto personal — Paris López.*
