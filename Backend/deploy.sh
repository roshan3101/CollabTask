#!/bin/bash

# Comprehensive Ultra-Cheap Deployment Script
# All-in-one script for cost-optimized personal project deployment
# Target: ~$25-35/month (75-80% savings)

set +e

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
    echo -e "${GREEN}=== Ultra-Cheap Deployment Menu ===${NC}\n"
    echo "1. Build & Push Docker Image (after code changes)"
    echo "2. Deploy (Ultra-Cheap: No ALB, No NAT)"
    echo "3. Get Backend Public IP"
    echo "4. View Service Status"
    echo "5. View Logs"
    echo "6. Restart Services"
    echo "7. Run Database Migrations"
    echo "8. Cleanup Expensive Resources (ALB, NAT, Target Groups)"
    echo "9. Optimize Costs (CloudWatch retention)"
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
    
    echo "$IMAGE_TAG" > .last-image-tag
    echo -e "\n${GREEN}✓ Build complete! Tag: $IMAGE_TAG${NC}\n"
}

deploy_ultra_cheap() {
    echo -e "${GREEN}=== Ultra-Cheap Deployment ===${NC}\n"
    echo -e "${YELLOW}Configuration:${NC}"
    echo "  • No Load Balancer (direct public IP)"
    echo "  • No NAT Gateway (public subnets)"
    echo "  • Minimal resources (256 CPU, 512 MB)"
    echo "  • Single task (no redundancy)"
    echo ""
    echo -e "${YELLOW}Estimated cost: ~$25-35/month${NC}\n"
    read -p "Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        return 1
    fi
    
    if [ ! -f ".env.prod" ]; then
        echo -e "${RED}Error: .env.prod not found${NC}"
        return 1
    fi
    
    source .env.prod
    REDIS_HOST_CLEAN=$(echo $REDIS_HOST | sed 's/:6379$//')
    
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
image_uri = os.environ.get('IMAGE_URI', '')

# Backend - MINIMAL RESOURCES
task_def = {
    "family": "collabtask-backend",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
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

# Celery - MINIMAL RESOURCES
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
    
    echo -e "\n${YELLOW}[2/5] Registering task definitions...${NC}"
    aws ecs register-task-definition --cli-input-json file://task-definition-backend.json --region $AWS_REGION >/dev/null
    echo "  ✓ Backend registered"
    aws ecs register-task-definition --cli-input-json file://task-definition-celery.json --region $AWS_REGION >/dev/null
    echo "  ✓ Celery registered"
    
    echo -e "\n${YELLOW}[3/5] Getting infrastructure info...${NC}"
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=collabtask-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    PUBLIC_SUBNET_1=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=collabtask-public-1" --query 'Subnets[0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    PUBLIC_SUBNET_2=$(aws ec2 describe-subnets --filters "Name=tag:Name,Values=collabtask-public-2" --query 'Subnets[0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    # Fallback: find any public subnet
    if [ -z "$PUBLIC_SUBNET_1" ] || [ "$PUBLIC_SUBNET_1" == "None" ]; then
        PUBLIC_SUBNET_1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[?MapPublicIpOnLaunch==`true`][0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
        PUBLIC_SUBNET_2=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[?MapPublicIpOnLaunch==`true`][1].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    fi
    
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$PUBLIC_SUBNET_1" ] || [ "$PUBLIC_SUBNET_1" == "None" ]; then
        echo -e "${RED}Error: Could not find public subnets${NC}"
        echo "You need to create public subnets first"
        return 1
    fi
    
    echo "  ✓ Using public subnets: $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
    
    # Update security group
    echo -e "\n${YELLOW}[4/5] Configuring security group...${NC}"
    aws ec2 authorize-security-group-ingress \
        --group-id $ECS_SG \
        --protocol tcp \
        --port 8000 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || echo "  (Rule may already exist)"
    echo "  ✓ Security group configured"
    
    echo -e "\n${YELLOW}[5/5] Creating/updating services...${NC}"
    
    # Backend service - NO ALB, public IP
    BACKEND_EXISTS=$(aws ecs describe-services --cluster collabtask-cluster --services collabtask-backend --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null || echo "None")
    
    if [ "$BACKEND_EXISTS" == "ACTIVE" ]; then
        aws ecs update-service \
          --cluster collabtask-cluster \
          --service collabtask-backend \
          --task-definition collabtask-backend \
          --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
          --force-new-deployment \
          --region $AWS_REGION >/dev/null
        echo "  ✓ Backend service updated"
    else
        aws ecs create-service \
          --cluster collabtask-cluster \
          --service-name collabtask-backend \
          --task-definition collabtask-backend \
          --desired-count 1 \
          --launch-type FARGATE \
          --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
          --region $AWS_REGION >/dev/null
        echo "  ✓ Backend service created"
    fi
    
    # Celery service
    CELERY_EXISTS=$(aws ecs describe-services --cluster collabtask-cluster --services collabtask-celery --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null || echo "None")
    if [ "$CELERY_EXISTS" == "ACTIVE" ]; then
        aws ecs update-service \
          --cluster collabtask-cluster \
          --service collabtask-celery \
          --task-definition collabtask-celery \
          --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
          --force-new-deployment \
          --region $AWS_REGION >/dev/null
        echo "  ✓ Celery service updated"
    else
        aws ecs create-service \
          --cluster collabtask-cluster \
          --service-name collabtask-celery \
          --task-definition collabtask-celery \
          --desired-count 1 \
          --launch-type FARGATE \
          --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
          --region $AWS_REGION >/dev/null
        echo "  ✓ Celery service created"
    fi
    
    echo -e "\n${GREEN}✓ Deployment complete!${NC}\n"
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Wait 2-3 minutes for tasks to start"
    echo "2. Run option 3 to get the backend public IP"
    echo "3. Update frontend/.env.prod with the IP"
    echo ""
}

get_backend_ip() {
    echo -e "${GREEN}=== Get Backend Public IP ===${NC}\n"
    
    TASK_ARN=$(aws ecs list-tasks \
        --cluster collabtask-cluster \
        --service-name collabtask-backend \
        --query 'taskArns[0]' \
        --output text \
        --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
        echo -e "${RED}Error: No running backend tasks found${NC}"
        return 1
    fi
    
    ENI_ID=$(aws ecs describe-tasks \
        --cluster collabtask-cluster \
        --tasks $TASK_ARN \
        --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
        --output text \
        --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$ENI_ID" ] || [ "$ENI_ID" == "None" ]; then
        echo -e "${RED}Error: Could not get network interface${NC}"
        return 1
    fi
    
    PUBLIC_IP=$(aws ec2 describe-network-interfaces \
        --network-interface-ids $ENI_ID \
        --query 'NetworkInterfaces[0].Association.PublicIp' \
        --output text \
        --region $AWS_REGION 2>/dev/null || echo "")
    
    if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
        echo -e "${RED}Error: Task doesn't have a public IP${NC}"
        echo "Make sure you're using public subnets with assignPublicIp=ENABLED"
        return 1
    fi
    
    echo -e "${GREEN}Backend Public IP: $PUBLIC_IP${NC}\n"
    echo "Update your frontend/.env.prod with:"
    echo -e "${YELLOW}NEXT_PUBLIC_API_BASE_URL=http://$PUBLIC_IP:8000${NC}\n"
}

view_status() {
    echo -e "${GREEN}=== Service Status ===${NC}\n"
    aws ecs describe-services \
        --cluster collabtask-cluster \
        --services collabtask-backend collabtask-celery \
        --region $AWS_REGION \
        --query 'services[*].{Name:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' \
        --output table
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
    aws ecs update-service --cluster collabtask-cluster --service collabtask-backend --force-new-deployment --region $AWS_REGION >/dev/null
    echo "  ✓ Backend restarted"
    aws ecs update-service --cluster collabtask-cluster --service collabtask-celery --force-new-deployment --region $AWS_REGION >/dev/null
    echo "  ✓ Celery restarted"
    echo -e "\n${GREEN}✓ Services restarted${NC}\n"
}

run_migrations() {
    echo -e "${GREEN}=== Run Database Migrations ===${NC}\n"
    source .env.prod 2>/dev/null || true
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=collabtask-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    PUBLIC_SUBNET_1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[?MapPublicIpOnLaunch==`true`][0].SubnetId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=collabtask-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    
    echo "Running migration task..."
    TASK_ARN=$(aws ecs run-task \
        --cluster collabtask-cluster \
        --task-definition collabtask-backend \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_1],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
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

cleanup_expensive_resources() {
    echo -e "${GREEN}=== Cleanup Expensive Resources ===${NC}\n"
    echo -e "${YELLOW}This will delete:${NC}"
    echo "  • Application Load Balancer (saves ~$21-26/month)"
    echo "  • Target Groups (associated with ALB)"
    echo "  • NAT Gateway (saves ~$33-40/month)"
    echo ""
    echo -e "${RED}WARNING: This is irreversible!${NC}\n"
    read -p "Are you sure? Type 'DELETE' to confirm: " confirm
    if [ "$confirm" != "DELETE" ]; then
        echo "Cancelled"
        return 1
    fi
    
    # Delete ALB
    echo -e "\n${YELLOW}[1/3] Deleting Application Load Balancer...${NC}"
    ALB_ARN=$(aws elbv2 describe-load-balancers --names collabtask-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
        # Delete listeners first
        LISTENER_ARNS=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[*].ListenerArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
        for LISTENER in $LISTENER_ARNS; do
            aws elbv2 delete-listener --listener-arn $LISTENER --region $AWS_REGION 2>/dev/null
        done
        
        # Delete ALB
        aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $AWS_REGION 2>/dev/null
        echo "  ✓ ALB deleted"
    else
        echo "  (ALB not found or already deleted)"
    fi
    
    # Delete Target Groups
    echo -e "\n${YELLOW}[2/3] Deleting Target Groups...${NC}"
    TG_NAMES=("collabtask-backend-tg-ip")
    for TG_NAME in "${TG_NAMES[@]}"; do
        TG_ARN=$(aws elbv2 describe-target-groups --names $TG_NAME --query 'TargetGroups[0].TargetGroupArn' --output text --region $AWS_REGION 2>/dev/null || echo "")
        if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
            aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $AWS_REGION 2>/dev/null
            echo "  ✓ Target group $TG_NAME deleted"
        fi
    done
    
    # Delete NAT Gateway
    echo -e "\n${YELLOW}[3/3] Deleting NAT Gateway...${NC}"
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=collabtask-vpc" --query 'Vpcs[0].VpcId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    NAT_GW_ID=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --query 'NatGateways[?State==`available`].NatGatewayId' --output text --region $AWS_REGION 2>/dev/null || echo "")
    if [ -n "$NAT_GW_ID" ] && [ "$NAT_GW_ID" != "None" ]; then
        aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID --region $AWS_REGION 2>/dev/null
        echo "  ✓ NAT Gateway $NAT_GW_ID deletion initiated (takes a few minutes)"
    else
        echo "  (NAT Gateway not found or already deleted)"
    fi
    
    echo -e "\n${GREEN}✓ Cleanup complete!${NC}"
    echo -e "${YELLOW}Estimated monthly savings: $54-66${NC}\n"
}

optimize_costs() {
    echo -e "${GREEN}=== Optimize Costs ===${NC}\n"
    
    echo -e "${YELLOW}[1/2] Setting CloudWatch log retention to 7 days...${NC}"
    for LOG_GROUP in "/ecs/collabtask-backend" "/ecs/collabtask-celery"; do
        if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region $AWS_REGION --query "logGroups[?logGroupName=='$LOG_GROUP']" --output text 2>/dev/null | grep -q "$LOG_GROUP"; then
            aws logs put-retention-policy --log-group-name "$LOG_GROUP" --retention-in-days 7 --region $AWS_REGION 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "  ✓ $LOG_GROUP retention set to 7 days"
            else
                echo "  ⚠ Could not set retention for $LOG_GROUP"
            fi
        else
            echo "  ⚠ Log group $LOG_GROUP not found"
        fi
    done
    
    echo -e "\n${YELLOW}[2/2] Cost optimization summary:${NC}"
    echo "  ✓ CloudWatch logs: 7-day retention (saves ~$5-10/month)"
    echo "  ✓ ECS: Minimal resources (256 CPU, 512 MB)"
    echo "  ✓ No ALB: Direct public IP access"
    echo "  ✓ No NAT Gateway: Using public subnets"
    echo ""
    echo -e "${GREEN}Estimated monthly cost: $25-35${NC}\n"
}

full_deployment() {
    echo -e "${GREEN}=== Full Deployment ===${NC}\n"
    build_and_push
    echo ""
    deploy_ultra_cheap
}

# Main menu loop
while true; do
    show_menu
    read -p "Select option: " choice
    echo ""
    
    case $choice in
        1) build_and_push ;;
        2) deploy_ultra_cheap ;;
        3) get_backend_ip ;;
        4) view_status ;;
        5) view_logs ;;
        6) restart_services ;;
        7) run_migrations ;;
        8) cleanup_expensive_resources ;;
        9) optimize_costs ;;
        10) full_deployment ;;
        0) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}\n" ;;
    esac
    
    read -p "Press Enter to continue..."
    clear
done
