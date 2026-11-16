# Publicatieprocedure PLP112

1. Feature branch + PR in Git
2. Test in Docker (`docker compose up -d`) of provider-staging
3. Checklist `agents/tester-beveiliging.md`
4. **Goedkeuring** voor productie
5. Deploy thema via SFTP/rsync/SSH; WP-CLI cache flush
6. Smoke-test productie-URL
7. Logboek `webdiensten/docs/08-wijzigingslogboek.md`
