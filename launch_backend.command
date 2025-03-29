#!/bin/bash

# Navigate to the backend directory and start the uvicorn server
cd backend
uvicorn main:app --reload &
