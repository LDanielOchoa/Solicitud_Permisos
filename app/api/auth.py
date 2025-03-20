from datetime import datetime
from fastapi import HTTPException, Depends
from database import create_connection, close_connection

# Función para verificar las contraseñas (sin cifrado)
def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password

# Función para obtener la contraseña sin cifrar
def get_password_hash(password):
    return password

# Función para obtener al usuario actual
def get_current_user(user_code: str):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE code = %s", (user_code,))
    user = cursor.fetchone()
    
    close_connection(connection)
    
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
