# Use the official Python image from the Docker Hub.
FROM python:3.11-slim

# Set the working directory in the container.
WORKDIR /app

# Copy the requirements.txt file into the container at /app.
COPY requirements.txt .

# Install the dependencies specified in requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container at /app.
COPY . .

# Expose port 8000 for the application.
EXPOSE 8000

# Run the application.
CMD ["python3", "backend.py"]

