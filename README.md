# Mini Microservice

> A microservice designed to implement microservice architecture, utilizing Docker and Kubernetes.

## Run app using k8s

```sh
# first, create a mini-ecommerce namespace
kubectl create namespace mini-ecommerce

# start skaffold
skaffold dev
```

## Run app using Docker Compose in development mode

```sh
make dc_up_dev
```
