### **How to Run the Project**  

#### **1. Start the Backend (Django + ASGI)**  
Navigate to the backend directory (where the Django project is located) and run:  

```bash
uvicorn myproject.asgi:application --host 0.0.0.0 --port 8000
```

#### **2. Start the Frontend (React)**  
Go to the React project directory and run:

```bash
npm start
```
This launches the frontend development server.

#### **3. Ensure Redis is Running**  
The application requires a Redis server running on its default port. Make sure Redis is installed and running before starting the backend. 
