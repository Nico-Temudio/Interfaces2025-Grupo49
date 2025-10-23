# API de Videojuegos - Interfaces 2025, TUDAI, UNICEN

## Descripción

API propuesta por la cátedra para tomar datos y utilizarlos en el sitio de juegos. Proporciona información básica, plataformas, géneros y calificaciones, imagenes, etc.

## Endpoints

### GET /api

**URL Base:** `https://vj.interfaces.jima.com.ar/api`

**Método:** GET

**Descripción:** Obtiene una lista completa de videojuegos con sus detalles básicos (versión original).

**Respuesta:** Array de objetos JSON con información básica de videojuegos.

### GET /api/v2

**URL Base:** `https://vj.interfaces.jima.com.ar/api/v2`

**Método:** GET

**Descripción:** Obtiene una lista completa de videojuegos con detalles extendidos, incluyendo imágenes optimizadas y descripciones detalladas.

**Nuevas características en v2:**
- `background_image_low_res`: Imagen optimizada (600x400) para mejor rendimiento
- `description`: Descripción detallada del videojuego (texto limpio sin HTML)

**Respuesta:** Array de objetos JSON con información extendida de videojuegos.

## Estructura de Datos

### API v1 (/api)

Cada videojuego en la respuesta tiene la siguiente estructura básica:

```json
{
  "id": 3498,
  "name": "Grand Theft Auto V",
  "released": "2013-09-17",
  "background_image": "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
  "rating": 4.47,
  "platforms": [
    {
      "id": 1,
      "name": "PC"
    },
    {
      "id": 2,
      "name": "PlayStation"
    },
    {
      "id": 3,
      "name": "Xbox"
    }
  ],
  "genres": [
    {
      "id": 4,
      "name": "Action"
    }
  ]
}
```

### API v2 (/api/v2)

Cada videojuego en la respuesta v2 incluye campos adicionales:

```json
{
  "id": 3498,
  "name": "Grand Theft Auto V",
  "released": "2013-09-17",
  "background_image": "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
  "background_image_low_res": "https://media.rawg.io/media/crop/600/400/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
  "rating": 4.47,
  "description": "Rockstar Games went bigger, since their previous installment of the series. You get the complicated and realistic world-building from Liberty City of GTA4 in the setting of lively and diverse Los Santos, from an old fan favorite GTA San Andreas. 561 different vehicles (including every transport you can operate) and the amount is rising with every update...",
  "platforms": [
    {
      "id": 1,
      "name": "PC"
    },
    {
      "id": 2,
      "name": "PlayStation"
    },
    {
      "id": 3,
      "name": "Xbox"
    }
  ],
  "genres": [
    {
      "id": 4,
      "name": "Action"
    }
  ]
}
```

### Campos

| Campo | Tipo | Versión | Descripción |
|-------|------|---------|-------------|
| `id` | number | v1, v2 | Identificador único del videojuego |
| `name` | string | v1, v2 | Nombre del videojuego |
| `released` | string | v1, v2 | Fecha de lanzamiento (formato YYYY-MM-DD) |
| `background_image` | string | v1, v2 | URL de la imagen de fondo del juego (resolución original) |
| `rating` | number | v1, v2 | Calificación promedio del juego (escala 0-5) |
| `platforms` | array | v1, v2 | Lista de plataformas donde está disponible |
| `genres` | array | v1, v2 | Lista de géneros del videojuego |
| `background_image_low_res` | string | v2 | URL de la imagen de fondo del juego (versión optimizada 600x400) |
| `description` | string | v2 | Descripción detallada del videojuego (texto limpio sin HTML) |

### Estructura de Plataformas

```json
{
  "id": 1,
  "name": "PC"
}
```

### Estructura de Géneros

```json
{
  "id": 4,
  "name": "Action"
}
```

## Ejemplo de Uso

### API v1 (/api) - JavaScript (Fetch API)

```javascript
fetch('https://vj.interfaces.jima.com.ar/api')
  .then(response => response.json())
  .then(games => {
    console.log('Juegos disponibles:', games);
    // Procesar la lista de juegos
    games.forEach(game => {
      console.log(`${game.name} - Rating: ${game.rating}`);
    });
  })
  .catch(error => {
    console.error('Error al obtener los juegos:', error);
  });
```

### API v2 (/api/v2) - JavaScript (Fetch API)

```javascript
fetch('https://vj.interfaces.jima.com.ar/api/v2')
  .then(response => response.json())
  .then(games => {
    console.log('Juegos disponibles:', games);
    // Procesar la lista de juegos con campos adicionales
    games.forEach(game => {
      console.log(`${game.name} - Rating: ${game.rating}`);
      console.log(`Descripción: ${game.description}`);
      console.log(`Imagen optimizada: ${game.background_image_low_res}`);
    });
  })
  .catch(error => {
    console.error('Error al obtener los juegos:', error);
  });
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 500 | Error interno del servidor |

## Notas para Desarrollo

- La API no requiere autenticación
- CORS está habilitado para todas las rutas
- La respuesta incluye aproximadamente 80 videojuegos populares

### Optimización de Imágenes

#### API v1 (/api)
- **`background_image`**: Imagen en resolución original para uso en vistas detalladas

#### API v2 (/api/v2)
La API v2 incluye dos versiones de cada imagen de fondo:

- **`background_image`**: Imagen en resolución original para uso en vistas detalladas
- **`background_image_low_res`**: Imagen optimizada (600x400) para uso en listas y vistas previas

**Recomendación:** Usa `background_image_low_res` para listas y vistas previas, y `background_image` para vistas detalladas del juego, hero images, etc.

## Contacto

Para consultas relacionadas con esta API en el contexto de la materia Interfaces 2025, contactar a jimartinezabadias@gmail.com o al equipo docente.
