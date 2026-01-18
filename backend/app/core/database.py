from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Configuración para PRIVACIDAD TOTAL (RAM)
# Usamos :memory: para que los datos se borren al reiniciar
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# 2. Motor de base de datos
# check_same_thread=False es necesario para SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Clase base para los modelos
Base = declarative_base()

# 5. --- ESTA ES LA FUNCIÓN QUE FALTABA ---
# Esta función es la que usa 'routes.py' para obtener la conexión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()