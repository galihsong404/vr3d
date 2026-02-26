# Build Stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git and certificates
RUN apk add --no-cache git ca-certificates

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source from the current directory to the Working Directory inside the container
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Run Stage
FROM alpine:latest  

# BUG FIX: Container Escape Mitigation
# Buat user non-root (cowuser) karena menjalankan binary sebagai root di dalam wadah sangat beresiko memancing RCE.
RUN addgroup -S cowgroup && adduser -S cowuser -G cowgroup

WORKDIR /home/cowuser/

# BUG FIX: Install ca-certificates and tzdata for SSL and Timezone support
RUN apk add --no-cache ca-certificates tzdata

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .
RUN chown cowuser:cowgroup main

# Turunkan kasta hak akses container ke non-root
USER cowuser

# Expose port 8080 to the outside world
EXPOSE 8080

# Run the executable
CMD ["./main"]
