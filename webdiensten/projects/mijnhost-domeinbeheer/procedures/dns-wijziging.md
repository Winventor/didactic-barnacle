# Procedure: DNS-wijziging

1. `mijnhost.sh dns get <domein>`
2. `mijnhost.sh dns backup <domein>`
3. Voorstel maken (`propose-hosting` of handmatig JSON in `fixtures/`)
4. Valideren: geen per ongeluk verwijderde MX/TXT/CAA; TTL bewust
5. `dns apply-file … --dry-run`
6. **Goedkeuring gebruiker**
7. `dns apply-file … --i-approve`
8. Controleren met `dig` (meerdere resolvers) en `dns mail-check`
9. Logboek bijwerken
