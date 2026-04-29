#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="pe-axelior-clinapp-dev"
BRANCH="release/develop"

echo "=== 1. Permisos al Cloud Build SA para Firebase Hosting ==="
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/firebase.admin" \
  --condition=None

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/serviceusage.serviceUsageConsumer" \
  --condition=None

echo "=== 2. Trigger Cloud Build FRONTEND ==="
gcloud builds triggers create github \
  --project="$PROJECT_ID" \
  --repo-name="CLINICA-FRONTED" \
  --repo-owner="josephnsa" \
  --branch-pattern="^${BRANCH}$" \
  --build-config="cloudbuild.yaml" \
  --name="frontend-deploy-release-develop" \
  --description="Deploy frontend Angular a Firebase Hosting"

echo "=== 3. Trigger Cloud Build BACKEND ==="
gcloud builds triggers create github \
  --project="$PROJECT_ID" \
  --repo-name="CLINICA-BACKEND" \
  --repo-owner="josephnsa" \
  --branch-pattern="^${BRANCH}$" \
  --build-config="cloudbuild.yaml" \
  --name="backend-deploy-release-develop" \
  --description="Deploy backend Spring Boot a Cloud Run" \
  || echo "Ya existe el trigger backend o requiere reconectar el repo en GCP Console."

echo ""
echo "Setup completado."
echo "URLs esperadas frontend despues del primer deploy:"
echo "https://${PROJECT_ID}.web.app"
echo "https://${PROJECT_ID}.firebaseapp.com"
echo ""
echo "Siguiente paso:"
echo "1) Actualizar OAuth con origenes web.app/firebaseapp.com"
echo "2) Actualizar CORS backend con web.app/firebaseapp.com + dominio final"
