from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# use :memory: SQLite for zero persistence database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# create the database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# create local session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# create base class for models
Base = declarative_base()

# use routes to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()