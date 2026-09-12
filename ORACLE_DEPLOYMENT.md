# Oracle Cloud deployment

These instructions use an Ubuntu Always Free VM, Docker Compose, and Caddy. The frontend is hosted on Vercel at `https://pongmasters.obeaj.me`; Oracle hosts the API and PostgreSQL database at `https://pongmastersapi.obeaj.me`.

## VM setup

Open ports `80` and `443` in the Oracle security list and Ubuntu firewall. Install Docker, Docker Compose, Git, and Caddy as described in `../oracle_deployment_guide.md`.

## Deploy

```bash
git clone -b dev https://github.com/BEAJousama/ft_transcendence.git
cd ft_transcendence
cp .env.oracle.example .env.oracle
# Edit only the secret, database, and OAuth placeholders in .env.oracle.
set -a
. ./.env.oracle
set +a
podman-compose -f oracle-compose.yml up -d --build
```

On the Ubuntu Podman 3.4 image, PostgreSQL must use its fully qualified image name and Compose cannot wait on health checks. The included Oracle Compose file already accounts for both limitations.

This VM uses Podman behind the `docker` command, so do not pass Docker Compose's `--env-file` option. To hide Podman's compatibility notice once:

```bash
sudo touch /etc/containers/nodocker
sudo apt update
sudo apt install -y python3-pip
python3 -m pip install --user podman-compose
export PATH="$HOME/.local/bin:$PATH"

# Fix the Ubuntu 22.04 ARM Podman/CNI version warning once:
sudo apt install -y containernetworking-plugins
podman-compose -f oracle-compose.yml down || true
podman network rm ft_transcendence_ft_transcendence 2>/dev/null || true
rm -f "$HOME/.config/cni/net.d/ft_transcendence_ft_transcendence.conflist"
podman network create ft_transcendence_ft_transcendence
```

The explicit network creation prevents `podman-compose` from regenerating the incompatible CNI configuration. If the network already exists, continue without running the create command again.

Use this Caddy entry:

```text
pongmastersapi.obeaj.me {
    reverse_proxy localhost:3000
}
```

The backend listens only on `127.0.0.1:3000`; Caddy provides the public HTTPS API and WebSocket endpoint.

## Cloudflare DNS and Caddy

For the first certificate issuance, set the Cloudflare DNS record for `pongmastersapi.obeaj.me` to **DNS only** (grey cloud). It must have an `A` record pointing to the Oracle public IPv4 address. Remove any `AAAA` record unless the VM has working public IPv6. Cloudflare proxying can return `523` and prevents Let's Encrypt from reaching Caddy's HTTP-01 or TLS-ALPN challenge.

Before restarting Caddy, verify the origin locally:

```bash
curl -I http://127.0.0.1:3000
sudo ss -ltnp | grep -E ':80|:443|:3000'
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

Watch certificate issuance:

```bash
sudo journalctl -u caddy -f
```

After Caddy obtains the certificate, Cloudflare proxying may be enabled again using **Full (strict)** SSL mode. If Cloudflare still returns `523`, leave the record DNS-only and check the Oracle security list and Ubuntu firewall for TCP ports `80` and `443`.

In Vercel, set these frontend environment variables and redeploy:

```text
NEXT_PUBLIC_API_URL=https://pongmastersapi.obeaj.me
NEXT_PUBLIC_WS_URL=wss://pongmastersapi.obeaj.me
NEXT_PUBLIC_FRONTEND_URL=https://pongmasters.obeaj.me
NEXT_PUBLIC_BACK_END_URL=https://pongmastersapi.obeaj.me/
NEXT_PUBLIC_FRONT_END_URL=https://pongmasters.obeaj.me
```

Update Google and 42 OAuth callback URLs to the HTTPS values in `.env.oracle` before testing login.

`FRONTEND_URL` in `.env.oracle` must be the frontend origin (`https://pongmasters.obeaj.me`). If it is missing, OAuth login finishes on `pongmastersapi.obeaj.me` instead of the frontend. After changing it, recreate the backend container so it picks up the new value.

The backend no longer sets session cookies on the API host; the frontend stores them and `POST /api/auth/logout` clears any cookies left on the API host by older builds. Deploy the backend and frontend together.

## Updates and checks

```bash
git pull
set -a
. ./.env.oracle
set +a
podman-compose -f oracle-compose.yml up -d --build
podman-compose -f oracle-compose.yml ps
```

The Oracle Compose file uses host networking because Podman 3.4 on Ubuntu 22.04 ARM cannot reliably resolve the `db` service through its CNI network. PostgreSQL is bound to loopback port `5434`; the backend connects to `127.0.0.1:5434` and remains public only through Caddy on port `3000`.

For live backend logs, use Podman directly because this Podman version does not support the color flag emitted by `podman-compose logs`:

```bash
podman ps --filter name=backend
podman logs -f $(podman ps -q --filter name=backend | head -n 1)
```

Postgres data is stored in the named `postgres_data` volume. Do not delete it when updating containers.