#!/bin/bash
set -e
PROJECT=$1
DEFAULT_BRANCH=$2
DIST=$3
CURRENT_BRANCH=$4
STATICS_DIRECTORY=$5

IFS='/' read -ra fields <<<"$PROJECT"
REPOSITORY_NAME="${fields[1]}"
REPOSITORY_NAME=${REPOSITORY_NAME//./-}

echo "Checking if project exists..."

# Specifically scoped for public contributors to automatically deploy to our team Cloudflare account

# Fetch the list of projects and check if the specific project exists
project_exists=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r ".result[] | select(.name == \"$REPOSITORY_NAME\") | .name")

if [ "$project_exists" == "$REPOSITORY_NAME" ]; then
  echo "Project already exists. Skipping creation..."
else
  echo "Project does not exist. Creating new project..."
  # Curl command to create a new project
  curl -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$REPOSITORY_NAME\",\"production_branch\":\"$DEFAULT_BRANCH\",\"build_config\":{\"build_command\":\"\",\"destination_dir\":\"$DIST\"}}"
fi

if [[ -z "${STATICS_DIRECTORY}" ]]; then
  # if STATICS_DIRECTORY input is unspecified then use $DIST as 
  # STATICS_DIRECTORY treating entire artifact as static-only
  STATICS_DIRECTORY=$DIST
else
  cd "$DIST"
fi

yarn install --ignore-scripts
yarn add wrangler --ignore-scripts

output=$(yarn wrangler pages deploy "$STATICS_DIRECTORY" --project-name "$REPOSITORY_NAME" --branch "$CURRENT_BRANCH" --commit-dirty=true)
output="${output//$'\n'/ }"
# Extracting URL from output only
url=$(echo "$output" | grep -o 'https://[^ ]*' | sed 's/ //g' | head -n 1)
echo "DEPLOYMENT_OUTPUT=$output" >> "$GITHUB_ENV"
echo "DEPLOYMENT_URL=$url" >> "$GITHUB_ENV"
