ENV_FILE ?= .env
SITE_DIR ?= website

ifneq (,$(wildcard $(ENV_FILE)))
include $(ENV_FILE)
endif

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION

AWS_DEFAULT_REGION ?= auto
R2_CACHE_CONTROL ?= public, max-age=300
R2_ENDPOINT := https://$(R2_ACCOUNT_ID).r2.cloudflarestorage.com
R2_DEST := s3://$(R2_BUCKET)$(if $(R2_PREFIX),/$(R2_PREFIX))

.PHONY: deploy-website check-deploy-website

deploy-website: check-deploy-website
	aws s3 sync $(SITE_DIR)/ $(R2_DEST) \
		--endpoint-url $(R2_ENDPOINT) \
		--delete \
		--cache-control "$(R2_CACHE_CONTROL)"

check-deploy-website:
	@test -d "$(SITE_DIR)" || (echo "Missing site directory: $(SITE_DIR)"; exit 1)
	@test -n "$(R2_ACCOUNT_ID)" || (echo "Missing R2_ACCOUNT_ID in $(ENV_FILE)"; exit 1)
	@test -n "$(R2_BUCKET)" || (echo "Missing R2_BUCKET in $(ENV_FILE)"; exit 1)
	@test -n "$(AWS_ACCESS_KEY_ID)" || (echo "Missing AWS_ACCESS_KEY_ID in $(ENV_FILE)"; exit 1)
	@test -n "$(AWS_SECRET_ACCESS_KEY)" || (echo "Missing AWS_SECRET_ACCESS_KEY in $(ENV_FILE)"; exit 1)
