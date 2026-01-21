FROM golang:1.23-alpine AS builder
WORKDIR /app
# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download
# Copy source code
COPY . .
# Build binary
RUN go build -o main ./cmd/main.go
# Final stage
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates
# Copy binary dari builder
COPY --from=builder /app/main .
# Expose port
EXPOSE 8080
# Jalankan aplikasi
CMD ["./main"]