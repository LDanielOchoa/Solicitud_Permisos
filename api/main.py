from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from auth import create_access_token, verify_password, get_current_user
from database import create_connection, close_connection
from schemas import LoginRequest, LoginResponse, UserResponse, PermitRequest, EquipmentRequest
from datetime import timedelta

app = FastAPI()

# Configurar CORS para permitir solicitudes del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE code = %s", (request.code,))
    user = cursor.fetchone()
    
    close_connection(connection)
    
    if not user or not verify_password(request.password, user['password']):
        raise HTTPException(status_code=400, detail="Credenciales inválidas")
    
    access_token = create_access_token(
        data={"sub": user['code']}, expires_delta=timedelta(minutes=30)
    )
    response = {"access_token": access_token, "role": user['role']}
    return JSONResponse(content=response, headers={"Access-Control-Allow-Origin": "*"})

@app.get("/auth/user", response_model=UserResponse)
def get_user_info(current_user: dict = Depends(get_current_user)):
    return {"code": current_user['code'], "name": current_user['name']}

@app.post("/permit-request")
def create_permit_request(request: PermitRequest, current_user: dict = Depends(get_current_user)):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor()
    try:
        # Print the values for debugging
        print("Inserting values:", (
            current_user['code'],
            current_user['name'],
            request.phone,
            ','.join(request.dates),
            request.time or '',
            request.noveltyType,
            request.description,
            ','.join(request.files) if request.files else ''
        ))
        
        cursor.execute("""
            INSERT INTO permit_perms 
            (code, name, telefono, fecha, hora, tipo_novedad, description, files)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user['code'],
            current_user['name'],
            request.phone,
            ','.join(request.dates),
            request.time or '',
            request.noveltyType,
            request.description,
            ','.join(request.files) if request.files else ''
        ))
        connection.commit()
        
    except Exception as e:
        connection.rollback()
        print("Database error:", str(e))
        raise HTTPException(
            status_code=500, 
            detail=f"Error al guardar la solicitud: {str(e)}"
        )
    finally:
        close_connection(connection)
    
    return {"message": "Solicitud de permiso creada exitosamente"}

@app.post("/equipment-request")
def create_equipment_request(request: EquipmentRequest, current_user: dict = Depends(get_current_user)):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor()
    try:
        cursor.execute("""
            INSERT INTO permit_post (code, name, tipo_novedad, description)
            VALUES (%s, %s, %s, %s)
        """, (
            current_user['code'],
            current_user['name'],
            request.type,
            request.description
        ))
        connection.commit()
        
    except Exception as e:
        connection.rollback()
        print("Database error:", str(e))
        raise HTTPException(
            status_code=500, 
            detail=f"Error al guardar la solicitud de equipo: {str(e)}"
        )
    finally:
        close_connection(connection)
    
    return {"message": "Solicitud de equipo creada exitosamente"}