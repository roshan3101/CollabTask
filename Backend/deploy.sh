#!/bin/bash

# Comprehensive Backend Deployment Script
# Handles all deployment operations with interactive menu

set +e  # Don't exit on error in functions

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

export AWS_REGION=eu-north-1
export AWS_ACCOUNT_ID=914979267158

# Functions
show_menu() {
    echo -e "${GREEN}=== Backend Deployment Menu ===${NC}\n"
    echo "1. Build & Push Docker Image (after code changes)"
    echo "2. Update Environment Variables & Deploy"
    echo "3. Test Deployment"
    echo "4. Troubleshoot Issues"
    echo "5. View Service Status"
    echo "6. View Logs"
    echo "7. Restart Services"
    echo "8. Run Database Migrations"
    echo "9. Fix Redis Connectivity (Security Groups)"
    echo "10. Full Deployment (Build + Deploy)"
    echo "0. Exit"
    echo ""
}

build_and_push() {
    echo -e "${GREEN}=== Build and Push Docker Image ===${NC}\n"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker not found${NC}"
        return 1
    fi
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    source .env.prod
    
    if [ -z "$Repository_uri" ]; then
        echo -e "${RED}Error: Repository_uri not set in .env.prod${NC}"
        return 1
    fi
    
    REPO_URI=$Repository_uri
    IMAGE_TAG=$(date +%Y%m%d-%H%M%S)
    
    echo -e "${YELLOW}Repository: $REPO_URI${NC}"
    echo -e "${YELLOW}Tag: $IMAGE_TAG${NC}\n"
    
    echo -e "${YELLOW}[1/3] Logging in to ECR...${NC}"
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URI
    echo "  ✓ Logged in"
    
    echo -e "\n${YELLOW}[2/3] Building image...${NC}"
    docker build -f Dockerfile.production -t $REPO_URI:$IMAGE_TAG .
    echo "  ✓ Image built"
    
    echo -e "\n${YELLOW}[3/3] Pushing image...${NC}"
    docker push $REPO_URI:$IMAGE_TAG
    echo "  ✓ Image pushed"
    
    # Save tag
    echo "$IMAGE_TAG" > .last-image-tag
    echo -e "\n${GREEN}✓ Build complete! Tag: $IMAGE_TAG${NC}"
    echo -e "${YELLOW}Run option 2 to deploy with this image${NC}\n"
}

update_env_and_deploy() {
    echo -e "${GREEN}=== Update Environment & Deploy ===${NC}\n"
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Current .env.prod values:${NC}"
    echo "  POSTGRES_HOST: $(grep ^POSTGRES_HOST .env.prod | cut -d= -f2 || echo 'not set')"
    echo "  REDIS_HOST: $(grep ^REDIS_HOST .env.prod | cut -d= -f2 || echo 'not set')"
    echo "  Repository_uri: $(grep ^Repository_uri .env.prod | cut -d= -f2 || echo 'not set')"
    echo ""
    read -p "Edit .env.prod now? (y/n): " edit_env
    if [ "$edit_env" == "y" ]; then
        ${EDITOR:-nano} .env.prod
    fi
    
    source .env.prod
    REDIS_HOST_CLEAN=$(echo $REDIS_HOST | sed 's/:6379$//')
    
    # Validate
    if [ -z "$Repository_uri" ]; then
        echo -e "${RED}Error: Repository_uri not set${NC}"
        return 1
    fi
    
    if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET_KEY" ]; then
        echo -e "${RED}Error: Required secrets not set in .env.prod${NC}"
        return 1
    fi
    
    # Get image tag
    if [ -f ".last-image-tag" ]; then
        IMAGE_TAG=$(cat .last-image-tag)
        IMAGE_URI="${Repository_uri}:${IMAGE_TAG}"
        echo -e "${YELLOW}Using image tag: $IMAGE_TAG${NC}"
    else
        echo -e "${YELLOW}No recent build found. Using 'latest' tag${NC}"
        echo -e "${YELLOW}Run option 1 first to build a new image${NC}"
        IMAGE_URI="${Repository_uri}:latest"
    fi
    
    # Export for Python
    export POSTGRES_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD
    export REDIS_HOST REDIS_PORT REDIS_DB AWS_REGION CORS_ORIGINS Repository_uri
    export JWT_SECRET_KEY AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY IMAGE_URI
    
    echo -e "\n${YELLOW}[1/5] Generating task definitions...${NC}"
    python3 <<PYTHON_SCRIPT
import json
import os

postgres_host = os.environ.get('POSTGRES_HOST', '')
postgres_port = os.environ.get('POSTGRES_PORT', '5432')
postgres_db = os.environ.get('POSTGRES_DB', 'collabtask')
redis_host = os.environ.get('REDIS_HOST', '').replace(':6379', '')
redis_port = os.environ.get('REDIS_PORT', '6379')
redis_db = os.environ.get('REDIS_DB', '0')
aws_region = os.environ.get('AWS_REGION', 'eu-north-1')
cors_origins = os.environ.get('CORS_ORIGINS', '')
repository_uri = os.environ.get('Repository_uri', '')
image_uri = os.environ.get('IMAGE_URI', f"{repository_uri}:latest")

# Backend task definition
task_def = {
    "family": "collabtask-backend",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "executionRoleArn": "arn:aws:iam::914979267158:role/ecsTaskExecutionRole",
    "taskRoleArn": "arn:aws:iam::914979267158:role/ecsTaskRole",
    "containerDefinitions": [{
        "name": "backend",
        "image": image_uri,
        "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
        "environment": [
            {"name": "ENVIRONMENT", "value": "production"},
            {"name": "POSTGRES_HOST", "value": postgres_host},
            {"name": "POSTGRES_PORT", "value": postgres_port},
            {"name": "POSTGRES_DB", "value": postgres_db},
            {"name": "REDIS_HOST", "value": redis_host},
            {"name": "REDIS_PORT", "value": redis_port},
            {"name": "REDIS_DB", "value": redis_db},
            {"name": "AWS_REGION", "value": aws_region},
            {"name": "CELERY_BROKER_URL", "value": f"redis://{redis_host}:6379/0"},
            {"name": "CELERY_RESULT_BACKEND", "value": f"redis://{redis_host}:6379/0"},
            {"name": "CORS_ORIGINS", "value": cors_origins},
            {"name": "POSTGRES_USER", "value": os.environ.get('POSTGRES_USER', '')},
            {"name": "POSTGRES_PASSWORD", "value": os.environ.get('POSTGRES_PASSWORD', '')},
            {"name": "JWT_SECRET_KEY", "value": os.environ.get('JWT_SECRET_KEY', '')},
            {"name": "AWS_ACCESS_KEY_ID", "value": os.environ.get('AWS_ACCESS_KEY_ID', '')},
            {"name": "AWS_SECRET_ACCESS_KEY", "value": os.environ.get('AWS_SECRET_ACCESS_KEY', '')}
        ],
        "secrets": [],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/collabtask-backend",
                "awslogs-region": "eu-north-1",
                "awslogs-stream-prefix": "ecs"
            }
        },
        "healthCheck": {
            "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
            "interval": 30,
            "timeout": 5,
            "retries": 3,
            "startPeriod": 60
        }
    }]
}

with open('task-definition-backend.json', 'w') as f:
    json.dump(task_def, f, indent=2)

# Celery task definition
task_def_celery = {
    "family": "collabtask-celery",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::914979267158:role/ecsTaskExecutionRole",
    "taskRoleArn": "arn:aws:iam::914979267158:role/ecsTaskRole",
    "containerDefinitions": [{
        "name": "celery",
        "image": image_uri,
        "command": ["celery", "-A", "app.core.celery_app", "worker", "--loglevel=info"],
        "environment": [
            {"name": "ENVIRONMENT", "value": "production"},
            {"name": "POSTGRES_HOST", "value": postgres_host},
            {"name": "POSTGRES_PORT", "value": postgres_port},
            {"name": "POSTGRES_DB", "value": postgres_db},
            {"name": "REDIS_HOST", "value": redis_host},
            {"name": "REDIS_PORT", "value": redis_port},
            {"name": "REDIS_DB", "value": redis_db},
            {"name": "AWS_REGION", "value": aws_region},
            {"name": "CELERY_BROKER_URL", "value": f"redis://{redis_host}:6379/0"},
            {"name": "CELERY_RESULT_BACKEND", "value": f"redis://{redis_host}:6379/0"},
            {"name": "POSTGRES_USER", "value": os.environ.get('POSTGRES_USER', '')},
            {"name": "POSTGRES_PASSWORD", "value": os.environ.get('POSTGRES_PASSWORD', '')},
            {"name": "JWT_SECRET_KEY", "value": os.environ.get('JWT_SECRET_KEY', '')},
            {"name": "AWS_ACCESS_KEY_ID", "value": os.environ.get('AWS_ACCESS_KEY_ID', '')},
            {"name": "AWS_SECRET_ACCESS_KEY", "value": os.environ.get('AWS_SECRET_ACCESS_KEY', '')}
        ],
        "secrets": [],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/collabtask-celery",
                "awslogs-region": "eu-north-1",
                "awslogs-stream-prefix": "ecs"
            }
        }
    }]
}

with open('task-definition-celery.json', 'w') as f:
    json.dump(task_def_celery, f, indent=2)

print("Task definitions generated")
PYTHON_SCRIPT
    echo "  ✓ Task definitions generated"
    
    echo -e "\n${YELLOW}[2/5] Getting infrastructure info...${NC}"
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=collabtask-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    SUBNET_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=collabtask-private-1" --query 'Subnets[0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    SUBNET_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=collabtask-private-2" --query 'Subnets[0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    TG_ARN=$(aws elbv2 describe-target-groups --names collabtask-backend-tg-ip --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
        echo -e "${RED}Error: Could not find VPC${NC}"
        return 1
    fi
    echo "  ✓ Infrastructure info retrieved"
    
    echo -e "\n${YELLOW}[3/5] Registering task definitions...${NC}"
    aws ecs register-task-definition --cli-input-json file://task-definition-backend.json --region $AWS_REGION >/dev/null
    echo "  ✓ Backend registered"
    aws ecs register-task-definition --cli-input-json file://task-definition-celery.json --region $AWS_REGION >/dev/null
    echo "  ✓ Celery registered"
    
    echo -e "\n${YELLOW}[4/5] Updating services...${NC}"
    BACKEND_EXISTS=$(aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null || echo "None")
    if [ "$BACKEND_EXISTS" == "ACTIVE" ]; then
        aws ecs update-service --cluster collabtask-cluster --service collabtask-backend --task-definition collabtask-backend --force-new-deployment --region $AWS_REGION >/dev/null
        echo "  ✓ Backend updated"
    else
        aws ecs create-service --cluster collabtask-cluster --service-name collabtask-backend --task-definition collabtask-backend --desired-count 2 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" --load-balancers "targetGroupArn=$TG_ARN,containerName=backend,containerPort=8000" --health-check-grace-period-seconds 60 --region $AWS_REGION >/dev/null
        echo "  ✓ Backend created"
    fi
    
    CELERY_EXISTS=$(aws ecs describe-services --cluster collabtask-cluster --services collabtask-celery --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null || echo "None")
    if [ "$CELERY_EXISTS" == "ACTIVE" ]; then
        aws ecs update-service --cluster collabtask-cluster --service collabtask-celery --task-definition collabtask-celery --force-new-deployment --region $AWS_REGION >/dev/null
        echo "  ✓ Celery updated"
    else
        aws ecs create-service --cluster collabtask-cluster --service-name collabtask-celery --task-definition collabtask-celery --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" --region $AWS_REGION >/dev/null
        echo "  ✓ Celery created"
    fi
    
    echo -e "\n${YELLOW}[5/5] Deployment status...${NC}"
    aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend collabtask-celery --region $AWS_REGION --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' --output table
    
    echo -e "\n${GREEN}✓ Deployment complete!${NC}\n"
}

test_deployment() {
    echo -e "${GREEN}=== Test Deployment ===${NC}\n"
    
    ALB_DNS=$(aws elbv2 describe-load-balancers --names collabtask-alb --query 'LoadBalancers[0].DNSName' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$ALB_DNS" ] || [ "$ALB_DNS" == "None" ]; then
        echo -e "${RED}Error: Could not find ALB${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Service Status:${NC}"
    aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend collabtask-celery --region $AWS_REGION --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' --output table
    
    echo -e "\n${YELLOW}Target Health:${NC}"
    TG_ARN=$(aws elbv2 describe-target-groups --names collabtask-backend-tg-ip --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
        aws elbv2 describe-target-health --target-group-arn $TG_ARN --region $AWS_REGION --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State,Reason:TargetHealth.Reason}' --output table
    fi
    
    echo -e "\n${YELLOW}Health Endpoint:${NC}"
    if command -v curl &> /dev/null; then
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://$ALB_DNS/health" 2>/dev/null || echo "000")
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "${GREEN}  ✓ Health check passed (HTTP $HTTP_CODE)${NC}"
            curl -s --max-time 5 "http://$ALB_DNS/health" | head -3
        else
            echo -e "${YELLOW}  ⚠ Health check returned HTTP $HTTP_CODE${NC}"
        fi
    else
        echo "  http://$ALB_DNS/health"
    fi
    
    echo -e "\n${YELLOW}ALB DNS:${NC} $ALB_DNS"
    echo ""
}

troubleshoot() {
    echo -e "${GREEN}=== Troubleshooting ===${NC}\n"
    
    echo -e "${YELLOW}[1/5] Service Status:${NC}"
    aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend collabtask-celery --region $AWS_REGION --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' --output table
    
    echo -e "\n${YELLOW}[2/5] Running Tasks:${NC}"
    TASK_ARNS=$(aws ecs list-tasks --cluster collabtask-cluster --service-name collabtask-backend --query 'taskArns' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$TASK_ARNS" ] && [ "$TASK_ARNS" != "None" ]; then
        for TASK in $TASK_ARNS; do
            aws ecs describe-tasks --cluster collabtask-cluster --tasks $TASK --region $AWS_REGION --query 'tasks[0].{LastStatus:lastStatus,HealthStatus:healthStatus,StoppedReason:stoppedReason}' --output table
        done
    else
        echo "  No tasks running"
    fi
    
    echo -e "\n${YELLOW}[3/5] Recent Events (last 5):${NC}"
    aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend --region $AWS_REGION --query 'services[0].events[:5]' --output table
    
    echo -e "\n${YELLOW}[4/5] Target Health:${NC}"
    TG_ARN=$(aws elbv2 describe-target-groups --names collabtask-backend-tg-ip --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
        aws elbv2 describe-target-health --target-group-arn $TG_ARN --region $AWS_REGION --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State,Reason:TargetHealth.Reason}' --output table
    fi
    
    echo -e "\n${YELLOW}[5/5] Recent Logs:${NC}"
    LOG_STREAM=$(aws logs describe-log-streams --log-group-name /ecs/collabtask-backend --order-by LastEventTime --descending --max-items 1 --query 'logStreams[0].logStreamName' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$LOG_STREAM" ] && [ "$LOG_STREAM" != "None" ]; then
        echo "  Latest stream: $LOG_STREAM"
        aws logs get-log-events --log-group-name /ecs/collabtask-backend --log-stream-name "$LOG_STREAM" --limit 10 --region $AWS_REGION --query 'events[*].message' --output text 2>/dev/null | tail -10 || echo "  No logs"
    else
        echo "  No log streams found"
    fi
    
    echo ""
}

view_status() {
    echo -e "${GREEN}=== Service Status ===${NC}\n"
    aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend collabtask-celery --region $AWS_REGION --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' --output table
    
    ALB_DNS=$(aws elbv2 describe-load-balancers --names collabtask-alb --query 'LoadBalancers[0].DNSName' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$ALB_DNS" ] && [ "$ALB_DNS" != "None" ]; then
        echo -e "\n${YELLOW}ALB DNS:${NC} $ALB_DNS"
        echo -e "${YELLOW}Health Endpoint:${NC} http://$ALB_DNS/health"
    fi
    echo ""
}

view_logs() {
    echo -e "${GREEN}=== View Logs ===${NC}\n"
    echo "Select log source:"
    echo "1. Backend"
    echo "2. Celery"
    read -p "Choice: " log_choice
    
    case $log_choice in
        1) LOG_GROUP="/ecs/collabtask-backend" ;;
        2) LOG_GROUP="/ecs/collabtask-celery" ;;
        *) echo -e "${RED}Invalid choice${NC}"; return 1 ;;
    esac
    
    echo -e "\n${YELLOW}Recent logs (last 50 lines):${NC}"
    LOG_STREAM=$(aws logs describe-log-streams --log-group-name $LOG_GROUP --order-by LastEventTime --descending --max-items 1 --query 'logStreams[0].logStreamName' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -n "$LOG_STREAM" ] && [ "$LOG_STREAM" != "None" ]; then
        aws logs get-log-events --log-group-name $LOG_GROUP --log-stream-name "$LOG_STREAM" --limit 50 --region $AWS_REGION --query 'events[*].message' --output text 2>/dev/null | tail -50
    else
        echo "  No log streams found"
    fi
    echo ""
}

restart_services() {
    echo -e "${GREEN}=== Restart Services ===${NC}\n"
    
    echo "Restarting backend service..."
    aws ecs update-service --cluster collabtask-cluster --service collabtask-backend --force-new-deployment --region $AWS_REGION >/dev/null
    echo "  ✓ Backend restarted"
    
    echo "Restarting celery service..."
    aws ecs update-service --cluster collabtask-cluster --service collabtask-celery --force-new-deployment --region $AWS_REGION >/dev/null
    echo "  ✓ Celery restarted"
    
    echo -e "\n${GREEN}✓ Services restarted${NC}\n"
}

run_migrations() {
    echo -e "${GREEN}=== Run Database Migrations ===${NC}\n"
    
    source .env.prod 2>/dev/null || true
    SUBNET_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=collabtask-private-1" --query 'Subnets[0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    echo "Running migration task..."
    TASK_ARN=$(aws ecs run-task \
        --cluster collabtask-cluster \
        --task-definition collabtask-backend \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
        --overrides '{"containerOverrides":[{"name":"backend","command":["aerich","upgrade"]}]}' \
        --region $AWS_REGION \
        --query 'tasks[0].taskArn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
        echo -e "${GREEN}✓ Migration task started: $TASK_ARN${NC}"
        echo "  Check logs for migration status"
    else
        echo -e "${RED}✗ Failed to start migration task${NC}"
    fi
    echo ""
}

fix_redis() {
    echo -e "${GREEN}=== Fix Redis Connectivity ===${NC}\n"
    
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    REDIS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-redis-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$ECS_SG" ] || [ "$ECS_SG" == "None" ]; then
        echo -e "${RED}Error: Could not find ECS security group${NC}"
        return 1
    fi
    
    if [ -z "$REDIS_SG" ] || [ "$REDIS_SG" == "None" ]; then
        echo -e "${RED}Error: Could not find Redis security group${NC}"
        return 1
    fi
    
    echo "ECS Security Group: $ECS_SG"
    echo "Redis Security Group: $REDIS_SG"
    echo ""
    
    echo -e "${YELLOW}Checking Redis security group rules...${NC}"
    HAS_RULE=$(aws ec2 describe-security-groups --group-ids $REDIS_SG --region $AWS_REGION --query "SecurityGroups[0].IpPermissions[?FromPort==\`6379\` && UserIdGroupPairs[?GroupId==\`$ECS_SG\`]] | length(@)" --output text 2>/dev/null || echo "0")
    
    if [ "$HAS_RULE" == "0" ]; then
        echo -e "${YELLOW}Adding rule to allow ECS → Redis on port 6379...${NC}"
        if aws ec2 authorize-security-group-ingress --group-id $REDIS_SG --protocol tcp --port 6379 --source-group $ECS_SG --region $AWS_REGION 2>/dev/null; then
            echo -e "${GREEN}✓ Rule added${NC}"
            echo -e "${YELLOW}Restart services for changes to take effect${NC}"
        else
            echo -e "${YELLOW}⚠ Could not add rule (may need permissions or already exists)${NC}"
            echo "  Add manually: Redis SG → Inbound → Port 6379 from ECS SG"
        fi
    else
        echo -e "${GREEN}✓ Rule already exists${NC}"
    fi
    echo ""
}

full_deployment() {
    echo -e "${GREEN}=== Full Deployment ===${NC}\n"
    build_and_push
    echo ""
    update_env_and_deploy
}

# Main menu loop
while true; do
    show_menu
    read -p "Select option: " choice
    echo ""
    
    case $choice in
        1) build_and_push ;;
        2) update_env_and_deploy ;;
        3) test_deployment ;;
        4) troubleshoot ;;
        5) view_status ;;
        6) view_logs ;;
        7) restart_services ;;
        8) run_migrations ;;
        9) fix_redis ;;
        10) full_deployment ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}\n" ;;
    esac
    
    read -p "Press Enter to continue..."
    clear
done
