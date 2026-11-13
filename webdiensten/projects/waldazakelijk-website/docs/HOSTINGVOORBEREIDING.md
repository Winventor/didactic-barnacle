# Hostingvoorbereiding mijn.host

## Aanbevolen startpakket

Voor één professionele WordPress-site met staging en SSH:

- **WP Basic** (of hoger) — controleer actuele limieten op https://mijn.host/wordpress-hosting  
  WP Start kan voor een eenvoudige brochure-site; Basic/Expert als je staging, meer resources of groei verwacht.

## Checklist vóór bestelling (goedkeuring vereist)

- [ ] Domein gekozen of tijdelijk op tijdelijk-URL
- [ ] Pakket + looptijd akkoord
- [ ] Factuurgegevens correct in mijn.host
- [ ] Na levering: SSL, SSH poort 26 aan, SFTP-user, WP 1-klik of handmatig
- [ ] Application Password voor agents
- [ ] Staging-omgeving aanmaken
- [ ] DNS naar hosting (via domeinbeheer-project) na goedkeuring

## Credentials (Cursor Secrets — namen)

| Secret | Doel |
|--------|------|
| `MIJNHOST_API_TOKEN` | Domein/DNS |
| `WALDA_SSH_HOST` | Hostname/IP |
| `WALDA_SSH_USER` | DirectAdmin-user |
| `WALDA_SSH_KEY` of wachtwoord-secret | SSH (poort 26) |
| `WALDA_SFTP_*` | Indien apart |
| `WALDA_WP_URL` | Productie-URL |
| `WALDA_WP_APP_PASSWORD` | REST API |
