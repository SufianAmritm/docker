# Docker

## Basic Concepts:
        
| Term | Meaning |
| --- | --- |
| Image | A read-only package: OS layer + Node + your code. The blueprint. |
| Container | A running instance of an image. You can run many from one image. |
| Dockerfile | The recipe for building an image, one instruction per layer. |
| Layer | Each Dockerfile instruction creates one. Unchanged layers are cached, so order matters. |
| Registry | Where images are stored and pulled from (Docker Hub, GitHub Container Registry, AWS ECR). |
| Tag | A version label, like cicd-lab:1.0.0 or cicd-lab:a1b2c3d. |
| Multi-stage build | Build in one stage, copy only the output into a small final stage. | 
| Volume | Storage that survives container deletion (database files). |
| Port mapping | -p 3000:3000 connects a host port to a container port. |
| Network | Containers on the same network reach each other by service name. |
| Docker Compose | A YAML file that runs several containers together (app + database). Local development only. | 
| Matrix | Run the same job across several versions (Node 20 and 22) |
| .dockerignore | Files excluded from the build, such as node_modules and .env. |

## Main Commands:
```
docker build -t cicd-lab:dev .      # build an image from the Dockerfile
docker run -p 3000:3000 cicd-lab:dev
docker ps                           # running containers
docker logs -f <container>          # follow logs
docker exec -it <container> sh      # shell inside a running container
docker compose up --build           # start everything in compose.yaml
docker compose down -v              # stop and delete volumes too

```
## Best Practices:
### Image building

1. Use small, version-pinned base images (node:22-alpine), never latest.
2. Use multi-stage builds so build tools never reach production.
3. Order layers for caching: copy package*.json and install dependencies before copying source.
4. Always keep a .dockerignore.
5. Install production dependencies only in the final image (npm ci --omit=dev).
6. One process per container.
7. Tag with the git SHA or a semantic version, and don’t deploy latest.

### Security

1. Don’t run as root (USER node).
2. Never bake secrets into images (ENV or a copied .env). Inject them at runtime. Image layers are readable by anyone who has the image.
3. Scan images for vulnerabilities (Trivy, Docker Scout) and rebuild regularly to pick up base-image patches.
4. Keep images minimal to shrink the attack surface.
5. Use a read-only filesystem and drop unneeded capabilities where possible.

### Runtime

1. Log to stdout/stderr, not to files.
2. Add a HEALTHCHECK so the orchestrator knows whether the app works.
3. Use the exec form CMD ["node", ...] so the app receives SIGTERM and can shut down gracefully.
4. Keep containers stateless. Data goes in volumes or external services.
5. Set CPU and memory limits.
6. Use Compose for local development only. Production uses Kubernetes or ECS.