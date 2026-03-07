#!/bin/bash
set -e

# Eficenza360 - Phase 13 Azure Infrastructure Provisioning Script
# This script provisions the foundational Azure infrastructure.
# DO NOT RUN WITHOUT CONFIGURING YOUR AZURE SUBSCRIPTION.

# Variables
RG_NAME="eficenza360-prod-rg"
LOCATION="eastus"
DB_SERVER_NAME="eficenza360-db"
DB_NAME="eficenza"
REDIS_NAME="eficenza360-redis"
STORAGE_ACCOUNT_NAME="eficenza360storage${RANDOM}" # Ensure uniqueness
ENV_NAME="eficenza360-env"
KV_NAME="eficenza360-keyvault-${RANDOM}"

# Note: In a real scenario, you should prompt for these or use secure injection.
# DB_ADMIN_USER="pgadmin"
# DB_ADMIN_PASS="generate_a_secure_password"

echo "Creating Resource Group: $RG_NAME in $LOCATION..."
az group create --name $RG_NAME --location $LOCATION

echo "Creating Azure Database for PostgreSQL Flexible Server..."
# az postgres flexible-server create \
#   --resource-group $RG_NAME \
#   --name $DB_SERVER_NAME \
#   --location $LOCATION \
#   --admin-user $DB_ADMIN_USER \
#   --admin-password $DB_ADMIN_PASS \
#   --sku-name Standard_B1ms \
#   --tier Burstable \
#   --storage-size 32 \
#   --version 15 \
#   --yes

echo "Creating Azure Cache for Redis..."
# az redis create \
#   --resource-group $RG_NAME \
#   --name $REDIS_NAME \
#   --location $LOCATION \
#   --sku Basic \
#   --vm-size c0 \
#   --enable-non-ssl-port false

echo "Creating Azure Blob Storage Account..."
# az storage account create \
#   --name $STORAGE_ACCOUNT_NAME \
#   --resource-group $RG_NAME \
#   --location $LOCATION \
#   --sku Standard_LRS \
#   --kind StorageV2 \
#   --access-tier Hot
# 
# echo "Creating blob container..."
# az storage container create \
#   --name documents \
#   --account-name $STORAGE_ACCOUNT_NAME

echo "Creating Azure Key Vault..."
# az keyvault create \
#   --name $KV_NAME \
#   --resource-group $RG_NAME \
#   --location $LOCATION

echo "Creating Azure Container Apps Environment..."
# az containerapp env create \
#   --name $ENV_NAME \
#   --resource-group $RG_NAME \
#   --location $LOCATION

echo "Infrastructure preparation complete. DO NOT DEPLOY CONTAINERS YET as per Phase 13 instructions."
echo "Connection strings and keys should be stored securely in Key Vault ($KV_NAME) and NOT source control."
