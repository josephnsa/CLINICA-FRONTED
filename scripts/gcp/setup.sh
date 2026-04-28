#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="pe-axelior-clinapp-dev"
BRANCH="release/develop"

echo "=== 1. Permisos al Cloud Build SA ==="
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/iam.serviceAccountUser"

echo "=== 2. Trigger Cloud Build FRONTEND ==="
gcloud builds triggers create github \
  --project="$PROJECT_ID" \
  --repo-name="CLINICA-FRONTED" \
  --repo-owner="josephnsa" \
  --branch-pattern="^${BRANCH}$" \
  --build-config="cloudbuild.yaml" \
  --name="frontend-deploy-release-develop" \
  --description="Deploy frontend Angular a Cloud Run"

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
echo "URL esperada frontend despues del primer deploy:"
echo "https://salud-frontend-${PROJECT_NUMBER}.us-central1.run.app"
echo ""
echo "Siguiente paso:"
echo "1) Entregar URL a Julio para DNS"
echo "2) Actualizar CORS backend con URL Cloud Run + dominio final"
