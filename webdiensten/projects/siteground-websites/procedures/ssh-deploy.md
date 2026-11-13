# SSH-deploy naar SiteGround

```bash
# Poort 18765, key-based
ssh -p 18765 -i "$SITEGROUND_SSH_KEY" "$SITEGROUND_SSH_USER@$SITEGROUND_SSH_HOST"

rsync -avz -e "ssh -p 18765 -i $SITEGROUND_SSH_KEY" \
  ./theme/naam/ \
  "$SITEGROUND_SSH_USER@$SITEGROUND_SSH_HOST:/home/customer/www/DOMEIN/public_html/wp-content/themes/naam/"
```

Alleen na staging-test en goedkeuring voor productie.
