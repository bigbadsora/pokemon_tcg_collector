#!/bin/bash

# Navigate to the backend directory and start the uvicorn server
cd backend
uvicorn main:app --reload &

# Navigate to the frontend directory and start the development server
cd ../frontend
npm run dev