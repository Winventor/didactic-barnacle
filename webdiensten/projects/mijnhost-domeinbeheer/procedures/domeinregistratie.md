# Procedure: domeinregistratie

1. `domains availability <domein>` — status, premium, trustee
2. `extensions get <tld>` — register/renew prijzen
3. Contactprofiel controleren (`GET /domains/contacts` via uitbreiding indien nodig)
4. Schriftelijk voorstel aan gebruiker (domein, prijs, looptijd, nameservers)
5. **Expliciete goedkeuring**
6. Token-scope `purchase` controleren
7. `domains order '<json>' --i-approve`
8. Status volgen via `domains get` / orders
9. DNS-template of hosting-records voorbereiden
