# Menggunakan Nginx Alpine sebagai base image
FROM nginx:stable-alpine

# Set working directory 
WORKDIR /usr/share/nginx/html

# Hapus default page nginx
RUN rm -rf ./*

# Copy source code ke direktori nginx
COPY src/ .

# Expose port 80 untuk akses web
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]