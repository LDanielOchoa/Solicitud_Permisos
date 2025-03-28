import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        connection = mysql.connector.connect(
            host="junction.proxy.rlwy.net",
            port=48135,
            user="root",
            password="UfuGUdsigwumXMGkwuabYQHYPjQzWAZs",
            database="railway"
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

def close_connection(connection):
    if connection:
        connection.close()
