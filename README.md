### **How to Run the Project**  

#### **1. Start the Backend (Django + ASGI)**  
Navigate to the backend directory (where the Django project is located) and run:  

```bash
uvicorn myproject.asgi:application --host 0.0.0.0 --port 8000
