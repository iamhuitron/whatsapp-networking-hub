# Fixtures de test

Este directorio contendrá archivos `.txt` **anonimizados** que simulan
exports reales de WhatsApp, usados por los tests del parser (Fase 2).

Reglas:

- Nunca subir un `.txt` real de un chat de WhatsApp existente.
- Usar nombres ficticios (`Persona Uno`, `Ana Ejemplo`), usuarios de
  redes ficticios (`usuario_demo1`) y datos inventados no atribuibles a
  nadie real.
- Cada fixture debe cubrir un caso específico (mensajes multilínea,
  Instagram en distintos formatos, ambigüedad entre participantes, etc.)
  y su nombre de archivo debe describir qué caso cubre, p. ej.
  `multiline-messages.txt`, `instagram-formats.txt`.

Estos fixtures se agregarán en la Fase 2, una vez definido el parser
definitivo a partir del análisis de un export real anonimizado.
