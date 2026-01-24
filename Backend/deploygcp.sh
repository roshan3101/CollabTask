#!/bin/bash

# GCP Deployment Script for CollabTask
# Uses Cloud Run (serverless) - cheapest option
# Estimated cost: ~$10-20/month for low traffic
#
# Quick start:
#   1. Run option 1: Setup GCP Project
#   2. Create Cloud SQL and Memorystore (see GCP_DEPLOYMENT.md)
#   3. Update .env.prod with GCP endpoints
#   4. Run option 8: Full Deployment

set +e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID=""  # Set your GCP project ID
REGION="europe-north1"  # Stockholm (same as AWS eu-north-1)
SERVICE_NAME="collabtask-backend"
CELERY_SERVICE_NAME="collabtask-celery"

show_menu() {
    echo -e "${GREEN}=== GCP Deployment Menu ===${NC}\n"
    echo "1. Setup GCP Project (First Time)"
    echo "2. Build & Push Docker Image to GCR"
    echo "3. Deploy Backend to Cloud Run"
    echo "4. View Service Status"
    echo "5. View Logs"
    echo "6. Get Service URL"
    echo "7. Full Deployment (Build + Deploy All)"
    echo "8. Delete Celery Service (if exists)"
    echo "0. Exit"
    echo ""
    echo -e "${YELLOW}Note: Celery workers don't run on Cloud Run (requires HTTP).${NC}"
    echo -e "${YELLOW}For async tasks, use Cloud Tasks or run tasks synchronously.${NC}\n"
}

setup_gcp() {
    echo -e "${GREEN}=== GCP Setup ===${NC}\n"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}Error: gcloud CLI not found${NC}"
        echo "Install from: https://cloud.google.com/sdk/docs/install"
        return 1
    fi
    
    echo -e "${YELLOW}Current gcloud configuration:${NC}"
    gcloud config list
    
    echo ""
    read -p "Enter your GCP Project ID: " PROJECT_ID
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}Error: Project ID required${NC}"
        return 1
    fi
    
    echo -e "\n${YELLOW}Setting up project...${NC}"
    gcloud config set project $PROJECT_ID
    gcloud config set compute/region $REGION
    
    echo -e "\n${YELLOW}Enabling required APIs...${NC}"
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable sqladmin.googleapis.com
    gcloud services enable redis.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
    
    echo -e "\n${YELLOW}Creating Artifact Registry repository...${NC}"
    gcloud artifacts repositories create collabtask-repo \
        --repository-format=docker \
        --location=$REGION \
        --description="CollabTask Docker images" 2>/dev/null || echo "  (Repository may already exist)"
    
    echo -e "\n${GREEN}✓ GCP setup complete!${NC}"
    echo -e "${YELLOW}Project ID: $PROJECT_ID${NC}"
    echo -e "${YELLOW}Region: $REGION${NC}\n"
    
    # Save to file
    echo "PROJECT_ID=$PROJECT_ID" > .gcp-config
    echo "REGION=$REGION" >> .gcp-config
}

load_gcp_config() {
    if [ -f ".gcp-config" ]; then
        source .gcp-config
    else
        echo -e "${RED}Error: GCP not configured. Run option 1 first.${NC}"
        return 1
    fi
}

build_and_push_gcp() {
    echo -e "${GREEN}=== Build and Push to GCR ===${NC}\n"
    
    load_gcp_config || return 1
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Checking Docker...${NC}"
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running.${NC}"
        echo -e "  Start Docker Desktop (Windows/Mac) or the Docker daemon (Linux), then retry.\n"
        return 1
    fi
    echo "  ✓ Docker OK"
    
    IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
    IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/collabtask-repo/collabtask-backend:$IMAGE_TAG"
    
    echo -e "${YELLOW}Building image...${NC}"
    if ! docker build -f Dockerfile.production -t $IMAGE_NAME .; then
        echo -e "${RED}✗ Docker build failed${NC}\n"
        return 1
    fi
    echo "  ✓ Image built"
    
    echo -e "\n${YELLOW}Configuring Docker for Artifact Registry...${NC}"
    gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
    
    echo -e "\n${YELLOW}Pushing image...${NC}"
    if ! docker push $IMAGE_NAME; then
        echo -e "${RED}✗ Docker push failed. Image not in Artifact Registry. Fix push errors and retry.${NC}\n"
        return 1
    fi
    echo "  ✓ Image pushed"
    
    echo "$IMAGE_NAME" > .last-gcp-image
    echo -e "\n${GREEN}✓ Build complete!${NC}"
    echo -e "${YELLOW}Image: $IMAGE_NAME${NC}\n"
}

deploy_backend_gcp() {
    echo -e "${GREEN}=== Deploy Backend to Cloud Run ===${NC}\n"
    
    load_gcp_config || return 1
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    source .env.prod
    
    # Get image
    if [ -f ".last-gcp-image" ]; then
        IMAGE_NAME=$(cat .last-gcp-image)
    else
        echo -e "${RED}Error: No image found. Run option 2 (Build & Push) first, or option 7 (Full Deployment).${NC}\n"
        return 1
    fi
    
    echo -e "${YELLOW}Verifying image exists in Artifact Registry...${NC}"
    if ! gcloud artifacts docker images describe "$IMAGE_NAME" --quiet >/dev/null 2>&1; then
        echo -e "${RED}Error: Image not found in Artifact Registry:${NC}"
        echo -e "  $IMAGE_NAME"
        echo -e "\n${YELLOW}Run option 2 (Build & Push) first, or option 7 (Full Deployment).${NC}\n"
        return 1
    fi
    echo "  ✓ Image found"
    
    # Prepare environment variables
    ENV_VARS="ENVIRONMENT=production"
    ENV_VARS="$ENV_VARS,POSTGRES_HOST=$POSTGRES_HOST"
    ENV_VARS="$ENV_VARS,POSTGRES_PORT=$POSTGRES_PORT"
    ENV_VARS="$ENV_VARS,POSTGRES_DB=$POSTGRES_DB"
    ENV_VARS="$ENV_VARS,POSTGRES_USER=$POSTGRES_USER"
    ENV_VARS="$ENV_VARS,POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    ENV_VARS="$ENV_VARS,REDIS_HOST=$REDIS_HOST"
    ENV_VARS="$ENV_VARS,REDIS_PORT=$REDIS_PORT"
    ENV_VARS="$ENV_VARS,REDIS_DB=$REDIS_DB"
    ENV_VARS="$ENV_VARS,CORS_ORIGINS=$CORS_ORIGINS"
    ENV_VARS="$ENV_VARS,JWT_SECRET_KEY=$JWT_SECRET_KEY"
    ENV_VARS="$ENV_VARS,SENDGRID_API_KEY=$SENDGRID_API_KEY"
    ENV_VARS="$ENV_VARS,FROM_EMAIL=$FROM_EMAIL"
    ENV_VARS="$ENV_VARS,FROM_NAME=$FROM_NAME"
    
    # Get Cloud SQL connection name if available
    # Strip /cloudsql/ prefix if present - Cloud Run expects just PROJECT:REGION:INSTANCE
    CLOUD_SQL_CONNECTION=""
    if [[ "$POSTGRES_HOST" == /cloudsql/* ]]; then
        CONNECTION_NAME="${POSTGRES_HOST#/cloudsql/}"
        CLOUD_SQL_CONNECTION="--add-cloudsql-instances=$CONNECTION_NAME"
    elif [[ "$POSTGRES_HOST" == *":"*":"* ]]; then
        # Already in format PROJECT:REGION:INSTANCE (has 2 colons)
        CLOUD_SQL_CONNECTION="--add-cloudsql-instances=$POSTGRES_HOST"
    fi
    
    echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
    
    gcloud run deploy $SERVICE_NAME \
        --image "$IMAGE_NAME" \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 3600 \
        --port 8000 \
        --set-env-vars "$ENV_VARS" \
        --session-affinity \
        $CLOUD_SQL_CONNECTION \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Backend deployed!${NC}"
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
        echo -e "${YELLOW}Service URL: $SERVICE_URL${NC}\n"
    else
        echo -e "${RED}✗ Deployment failed${NC}\n"
        return 1
    fi
}

deploy_celery_gcp() {
    echo -e "${GREEN}=== Deploy Celery to Cloud Run ===${NC}\n"
    
    load_gcp_config || return 1
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    source .env.prod
    
    # Get image
    if [ -f ".last-gcp-image" ]; then
        IMAGE_NAME=$(cat .last-gcp-image)
    else
        echo -e "${RED}Error: No image found. Run option 2 first.${NC}"
        return 1
    fi
    
    # Prepare environment variables
    ENV_VARS="ENVIRONMENT=production"
    ENV_VARS="$ENV_VARS,POSTGRES_HOST=$POSTGRES_HOST"
    ENV_VARS="$ENV_VARS,POSTGRES_PORT=$POSTGRES_PORT"
    ENV_VARS="$ENV_VARS,POSTGRES_DB=$POSTGRES_DB"
    ENV_VARS="$ENV_VARS,POSTGRES_USER=$POSTGRES_USER"
    ENV_VARS="$ENV_VARS,POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
    ENV_VARS="$ENV_VARS,REDIS_HOST=$REDIS_HOST"
    ENV_VARS="$ENV_VARS,REDIS_PORT=$REDIS_PORT"
    ENV_VARS="$ENV_VARS,REDIS_DB=$REDIS_DB"
    ENV_VARS="$ENV_VARS,AWS_REGION=$AWS_REGION"
    ENV_VARS="$ENV_VARS,CELERY_BROKER_URL=$CELERY_BROKER_URL"
    ENV_VARS="$ENV_VARS,CELERY_RESULT_BACKEND=$CELERY_RESULT_BACKEND"
    ENV_VARS="$ENV_VARS,JWT_SECRET_KEY=$JWT_SECRET_KEY"
    ENV_VARS="$ENV_VARS,AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
    ENV_VARS="$ENV_VARS,AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
    
    # Get Cloud SQL connection name if available
    # Strip /cloudsql/ prefix if present - Cloud Run expects just PROJECT:REGION:INSTANCE
    CLOUD_SQL_CONNECTION=""
    if [[ "$POSTGRES_HOST" == /cloudsql/* ]]; then
        CONNECTION_NAME="${POSTGRES_HOST#/cloudsql/}"
        CLOUD_SQL_CONNECTION="--add-cloudsql-instances=$CONNECTION_NAME"
    elif [[ "$POSTGRES_HOST" == *":"*":"* ]]; then
        # Already in format PROJECT:REGION:INSTANCE (has 2 colons)
        CLOUD_SQL_CONNECTION="--add-cloudsql-instances=$POSTGRES_HOST"
    fi
    
    echo -e "${YELLOW}Deploying Celery to Cloud Run...${NC}"
    
    gcloud run deploy $CELERY_SERVICE_NAME \
        --image "$IMAGE_NAME" \
        --platform managed \
        --region $REGION \
        --no-allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 5 \
        --timeout 3600 \
        --command='celery' \
        --args='-A,app.core.celery_app,worker,--loglevel=info' \
        --set-env-vars "$ENV_VARS" \
        $CLOUD_SQL_CONNECTION \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✓ Celery deployed!${NC}\n"
    else
        echo -e "${RED}✗ Deployment failed${NC}\n"
        return 1
    fi
}

view_status_gcp() {
    echo -e "${GREEN}=== Cloud Run Service Status ===${NC}\n"
    load_gcp_config || return 1
    
    echo -e "${BLUE}Backend Service:${NC}"
    gcloud run services describe $SERVICE_NAME --region $REGION --format="table(
        metadata.name,
        status.url,
        spec.template.spec.containers[0].resources.limits.memory,
        status.conditions[0].status
    )" 2>/dev/null || echo "  Service not found"
    echo ""
}

view_logs_gcp() {
    echo -e "${GREEN}=== View Cloud Run Logs ===${NC}\n"
    load_gcp_config || return 1
    
    echo -e "${YELLOW}Recent backend logs:${NC}"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
        --limit 50 \
        --format="table(timestamp,textPayload)" \
        --project $PROJECT_ID
    echo ""
}

get_service_url() {
    echo -e "${GREEN}=== Get Service URL ===${NC}\n"
    load_gcp_config || return 1
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' 2>/dev/null || echo "")
    
    if [ -n "$SERVICE_URL" ]; then
        echo -e "${GREEN}Backend URL: $SERVICE_URL${NC}\n"
        echo "Update your frontend/.env.prod with:"
        echo -e "${YELLOW}NEXT_PUBLIC_API_BASE_URL=$SERVICE_URL${NC}\n"
    else
        echo -e "${RED}Service not found. Deploy first.${NC}\n"
    fi
}

delete_celery_service() {
    echo -e "${GREEN}=== Delete Celery Service ===${NC}\n"
    load_gcp_config || return 1
    
    echo -e "${YELLOW}Deleting Celery service (if exists)...${NC}"
    gcloud run services delete $CELERY_SERVICE_NAME --region $REGION --quiet 2>/dev/null
    echo -e "${GREEN}✓ Done${NC}\n"
}

full_deployment_gcp() {
    echo -e "${GREEN}=== Full GCP Deployment ===${NC}\n"
    build_and_push_gcp || return 1
    echo ""
    deploy_backend_gcp
}

# Main menu loop
while true; do
    show_menu
    read -p "Select option: " choice
    echo ""
    
    case $choice in
        1) setup_gcp ;;
        2) build_and_push_gcp ;;
        3) deploy_backend_gcp ;;
        4) view_status_gcp ;;
        5) view_logs_gcp ;;
        6) get_service_url ;;
        7) full_deployment_gcp ;;
        8) delete_celery_service ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}\n" ;;
    esac
    
    read -p "Press Enter to continue..."
    clear
done
