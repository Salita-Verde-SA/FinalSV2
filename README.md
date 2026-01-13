# TechStore - Proyecto Final de Python

Bienvenidx al proyecto **TechStore**, donde decidimos reinventar el comercio electrónico porque, claramente, el mundo necesitaba otra tienda online. Este proyecto es el resultado de noches interminables, discusiones acaloradas y la pérdida de nuestra fe en la humanidad (y en los deadlines).

## Características

- **Catálogo de productos**: Para que puedas mirar cosas que no vas a comprar porque, seamos realistas, ¿quién tiene plata?
- **Carrito de compras**: Agregá productos, mirá el total y después cerrá la pestaña. Es como terapia, pero gratis.
- **Autenticación**: Registrate e iniciá sesión, porque queremos saber quién sos antes de ignorar tus problemas.
- **Panel de administración**: Un lugar donde los admins pueden jugar a ser dioses... hasta que algo se rompe.
- **Sistema de órdenes**: Hacé pedidos y sentite como si estuvieras en el súper, pero sin la satisfacción de llevarte algo a casa.
- **Integración con PostgreSQL y Redis**: Porque usar SQLite sería como usar cinta adhesiva para arreglar un barco que se hunde.

## Requisitos

- **Backend**:
  - Python 3.10 o superior (porque las versiones viejas son como el VHS: nostálgicas, pero inútiles).
  - PostgreSQL 15 (porque necesitamos una base de datos más robusta que tu autoestima).
  - Redis (porque guardar cosas en memoria es para amateurs).
- **Frontend**:
  - Node.js 20 o superior (porque las versiones viejas son para quienes disfrutan sufrir).
  - NPM o Yarn (elegí el que menos te haga llorar).

## Configuración

### Backend

1. Andá al directorio del backend:
   ```bash
   cd backend
   ```
2. Creá un entorno virtual e instalá las dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Configurá las variables de entorno en `.env` (basado en `.env.example`).
4. Ejecutá las migraciones:
   ```bash
   alembic upgrade head
   ```
5. Levantá el servidor:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Andá al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instalá las dependencias:
   ```bash
   npm install
   ```
3. Creá un archivo `.env` en el directorio frontend con:
   ```bash
   VITE_API_URL=http://localhost:8000
   ```
4. Levantá el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Docker (opcional)

¿Querés complicarte la vida con contenedores? Perfecto:
```bash
docker-compose up --build
```

## Estructura del Proyecto

- **backend/**: Donde FastAPI hace su magia... o al menos lo intenta.
- **frontend/**: Donde React y TailwindCSS se pelean constantemente.
- **docker-compose.yml**: Porque todo proyecto necesita un archivo que nadie entiende, pero todos fingen que sí.

## Contribuciones

¿Tenés una idea brillante? Abrí un **issue** o mandá un **pull request**. Si no es brillante, igual lo aceptamos porque, bueno, ya estamos acostumbrados a las decepciones.

---

Desarrollado por Salita Verde SA, porque "TechStore Inc." ya estaba registrado y, sinceramente, no teníamos ganas de pensar otro nombre.
