import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        connection = mysql.connector.connect(
            host="autorack.proxy.rlwy.net",
            port=59229,
            user="root",
            password="NxEMuyuXacHdTMdCeWGOBcfsdTFIjsEJ",
            database="railway"
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

def close_connection(connection):
    if connection:
        connection.close()
