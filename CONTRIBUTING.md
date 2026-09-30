# Contributing to FinanzasMundo

¡Gracias por tu interés en contribuir a FinanzasMundo! Este documento proporciona directrices para contribuir al proyecto.

## Código de Conducta

- Sé respetuoso y considerado con otros contribuidores
- Mantén un tono profesional y constructivo
- Acepta críticas constructivas y acéptalas con gracia
- Enfócate en lo que es mejor para el proyecto

## ¿Cómo Contribuir?

### Reportar Bugs

Si encuentras un bug, por favor:

1. Busca en los issues existentes para ver si ya fue reportado
2. Si no existe, crea un nuevo issue con:
   - Título descriptivo
   - Pasos para reproducir el bug
   - Comportamiento esperado vs comportamiento actual
   - Capturas de pantalla si aplica
   - Información del entorno (OS, Node.js versión, navegador)

### Sugerir Features

Para sugerir nuevas funcionalidades:

1. Busca en los issues existentes
2. Si no existe, crea un nuevo issue con:
   - Título descriptivo
   - Descripción detallada de la funcionalidad
   - Casos de uso
   - Posibles soluciones o ideas de implementación

### Pull Requests

Antes de enviar un PR:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios con mensajes claros
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

#### Requisitos para PRs

- El código debe seguir el estilo existente
- Los commits deben tener mensajes claros
- Las nuevas features deben incluir tests
- La documentación debe actualizarse si es necesario
- El PR debe pasar todos los checks de CI

## Principios del Proyecto

Este proyecto tiene principios fundamentales que deben respetarse:

### 1. Solo Datos Verificables

- Todos los datos numéricos deben provenir de fuentes oficiales
- Cada dato debe incluir su procedencia y fecha
- No se permiten datos inventados o sin respaldo

### 2. Transparencia Total

- Cada cifra debe tener un enlace para auditoría
- La fecha de actualización debe ser visible
- El estado de la fuente (live/snapshot/sin-datos) debe ser claro

### 3. Sin Contenido Propio Disfrazado

- El contenido editorial debe ser claramente identificado
- Las descripciones y biografías pueden ser contenido propio
- Las cifras financieras siempre deben venir de fuentes oficiales

## Estilo de Código

### JavaScript/React

- Usa ES6+ features cuando sea apropiado
- Nombres de variables y funciones en español cuando se refieran al dominio del negocio
- Nombres técnicos en inglés (hooks, componentes, funciones utilitarias)
- Usa functional components y hooks
- Evita código duplicado, crea componentes reutilizables

### Backend (Node.js/Express)

- Usa async/await para código asíncrono
- Manejo de errores adecuado
- Respuestas consistentes de la API
- Documentación de endpoints en el código

## Proceso de Desarrollo

1. **Setup**: `npm run install:all`
2. **Desarrollo**: `npm run dev`
3. **Linting**: `npm run lint`
4. **Build**: `npm run build`
5. **Verificación**: `npm run check`

## Fuentes de Datos

Al agregar nuevas fuentes de datos:

1. Deben ser oficiales y verificables
2. Deben tener licencia de uso apropiada
3. Deben incluir atribución en el código
4. Deben documentar la política de caché

## Tests

- Escribe tests para nuevas funcionalidades
- Mantén los tests actualizados
- Asegúrate de que todos los tests pasen antes de enviar un PR

## Documentación

- Actualiza el README si agregas nuevas funcionalidades
- Documenta nuevas funciones en el código
- Agrega ejemplos de uso si es apropiado

## Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la Licencia MIT del proyecto.

## Preguntas

Si tienes preguntas, no dudes en abrir un issue o contactar al mantenedor.

---

¡Gracias por contribuir a FinanzasMundo! 🚀