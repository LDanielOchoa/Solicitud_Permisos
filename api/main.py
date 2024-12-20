from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from auth import create_access_token, verify_password, get_current_user
from database import create_connection, close_connection
from schemas import LoginRequest, LoginResponse, UserResponse, PermitRequest, EquipmentRequest, NotificationStatusUpdate, SolicitudResponse
from datetime import timedelta, datetime
from typing import List
import json


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
            INSERT INTO permit_post (code, name, tipo_novedad, description, zona)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            current_user['code'],
            current_user['name'],
            request.type,
            request.description,
            request.zona
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


@app.get("/requests")
def get_requests():
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Fetch permit requests
        cursor.execute("""
            SELECT id, code, name, telefono as phone, fecha as dates, 
                   hora as time, tipo_novedad as noveltyType, description,
                   files, time_created as createdAt, solicitud as status,
                   respuesta, notifications
            FROM permit_perms
        """)
        permit_requests = cursor.fetchall()

        # Fetch equipment requests
        cursor.execute("""
            SELECT id, code, name, tipo_novedad as type,
                   description, time_created as createdAt,
                   solicitud as status, respuesta, notifications
            FROM permit_post
        """)
        equipment_requests = cursor.fetchall()
        
        return permit_requests + equipment_requests
        
    finally:
        close_connection(connection)

@app.put("/requests/{request_id}")
def update_request(
    request_id: int,
    request: dict
):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor()
    try:
        # Try updating permit_perms first
        cursor.execute("""
            UPDATE permit_perms
            SET solicitud = %s, respuesta = %s
            WHERE id = %s
        """, (request['status'], request.get('respuesta', ''), request_id))
        
        if cursor.rowcount == 0:
            # If no rows were affected, try permit_post
            cursor.execute("""
                UPDATE permit_post
                SET solicitud = %s, respuesta = %s
                WHERE id = %s
            """, (request['status'], request.get('respuesta', ''), request_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        connection.commit()
        return {"message": "Solicitud actualizada exitosamente"}
        
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        close_connection(connection)
        
        

@app.put("/requests/{request_id}/notifications")
def update_notification_status(
    request_id: int,
    payload: NotificationStatusUpdate
):
    print("Request payload:", payload)
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor()
    try:
        # Intentar actualizar en permit_perms primero
        cursor.execute("""
            UPDATE permit_perms
            SET notifications = %s
            WHERE id = %s
        """, (payload.notification_status, request_id))
        
        if cursor.rowcount == 0:
            # Intentar en permit_post si no hubo coincidencia
            cursor.execute("""
                UPDATE permit_post
                SET notifications = %s
                WHERE id = %s
            """, (payload.notification_status, request_id))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Solicitud no encontrada")
        
        connection.commit()
        return {"message": "Estado de notificación actualizado exitosamente"}
        
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        close_connection(connection)

@app.get("/solicitudes")
def get_solicitudes(current_user: dict = Depends(get_current_user)):
    connection = create_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")
    
    cursor = connection.cursor(dictionary=True)
    try:
        # Obtener solicitudes de permisos
        cursor.execute("""
            SELECT 
                id,
                code,
                name,
                tipo_novedad,
                description,
                solicitud as status,
                respuesta,
                '' as zona,
                time_created as createdAt
            FROM permit_perms
            WHERE code = %s AND solicitud IN ('approved', 'rejected')
        """, (current_user['code'],))
        permit_requests = cursor.fetchall()

        # Obtener solicitudes de equipos
        cursor.execute("""
            SELECT 
                id,
                code,
                name,
                tipo_novedad,
                description,
                solicitud as status,
                respuesta,
                zona,
                time_created as createdAt
            FROM permit_post
            WHERE code = %s AND solicitud IN ('approved', 'rejected')
        """, (current_user['code'],))
        equipment_requests = cursor.fetchall()
        
        # Combinar todas las solicitudes
        all_requests = permit_requests + equipment_requests
        
        # Convertir datetime a string
        for request in all_requests:
            if isinstance(request['createdAt'], datetime):
                request['createdAt'] = request['createdAt'].isoformat()
        
        return JSONResponse(content=json.loads(json.dumps(all_requests, default=str)))
        
    except Exception as e:
        print("Database error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener las solicitudes: {str(e)}"
        )
    finally:
        close_connection(connection)