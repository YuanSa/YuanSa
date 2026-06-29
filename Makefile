ENV_FILE ?= .env
SITE_DIR ?= website

ifneq (,$(wildcard $(ENV_FILE)))
include $(ENV_FILE)
endif

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION

PERSONAL_WEBSITE_CACHE_CONTROL ?= public, max-age=300

AWS_ACCESS_KEY_ID := $(PERSONAL_WEBSITE_R2_ACCESS_KEY_ID)
AWS_SECRET_ACCESS_KEY := $(PERSONAL_WEBSITE_R2_SECRET_ACCESS_KEY)
AWS_DEFAULT_REGION := auto

PERSONAL_WEBSITE_R2_ENDPOINT := https://$(PERSONAL_WEBSITE_CLOUDFLARE_ACCOUNT_ID).r2.cloudflarestorage.com
PERSONAL_WEBSITE_R2_DEST := s3://$(PERSONAL_WEBSITE_R2_BUCKET)

.PHONY: deploy-website check-deploy-website

deploy-website: check-deploy-website
	aws s3 sync $(SITE_DIR)/ $(PERSONAL_WEBSITE_R2_DEST) \
		--endpoint-url $(PERSONAL_WEBSITE_R2_ENDPOINT) \
		--delete \
		--cache-control "$(PERSONAL_WEBSITE_CACHE_CONTROL)"

check-deploy-website:
	@command -v aws >/dev/null 2>&1 || (echo "Missing aws CLI. Install it with: brew install awscli"; exit 1)
	@test -d "$(SITE_DIR)" || (echo "Missing site directory: $(SITE_DIR)"; exit 1)
	@test -n "$(PERSONAL_WEBSITE_CLOUDFLARE_ACCOUNT_ID)" || (echo "Missing PERSONAL_WEBSITE_CLOUDFLARE_ACCOUNT_ID in $(ENV_FILE)"; exit 1)
	@test -n "$(PERSONAL_WEBSITE_R2_BUCKET)" || (echo "Missing PERSONAL_WEBSITE_R2_BUCKET in $(ENV_FILE)"; exit 1)
	@test -n "$(PERSONAL_WEBSITE_R2_ACCESS_KEY_ID)" || (echo "Missing PERSONAL_WEBSITE_R2_ACCESS_KEY_ID in $(ENV_FILE)"; exit 1)
	@test -n "$(PERSONAL_WEBSITE_R2_SECRET_ACCESS_KEY)" || (echo "Missing PERSONAL_WEBSITE_R2_SECRET_ACCESS_KEY in $(ENV_FILE)"; exit 1)
