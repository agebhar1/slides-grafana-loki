# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.box = "opensuse/Tumbleweed.x86_64"
    config.vm.box_version = "1.0.20241025"

    config.vm.hostname = 'loki'
    config.vm.network :private_network, ip: '192.168.56.10'

    config.vm.provider "virtualbox" do |vb|
        vb.memory = 1024 * 16
        vb.cpus = 4
    end

    if Vagrant.has_plugin?("vagrant-proxyconf")
        # if required then configure the proxy
        config.proxy.enabled = false
    end

    config.vm.provision "shell", inline: $provision_privileged
    config.vm.provision "shell", inline: $provision, privileged: false

end

$provision_privileged = <<-SCRIPT
#zypper refresh
#zypper --non-interactive update
zypper --non-interactive install docker htop jq tree tmux unzip
zypper --non-interactive install git-core go1.23 make
zypper --non-interactive install libxtables12=1.8.11-1.1

systemctl enable docker
systemctl start docker
systemctl status docker

usermod -aG docker vagrant
SCRIPT

$provision = <<-SCRIPT
pushd /vagrant
test -e .env || ln -s dotenv .env || cp dotenv .env
popd

mkdir -p ~/{.docker/cli-plugins,loki,minio,postgres,prometheus,promtail/log}

#
# install Docker Compose
#
curl -L --silent https://github.com/docker/compose/releases/download/v2.33.0/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

#
# install Grafana logcli
#
curl -L --silent https://github.com/grafana/loki/releases/download/v2.9.12/logcli-linux-amd64.zip -o /tmp/logcli-linux-amd64.zip
unzip /tmp/logcli-linux-amd64.zip -d ~/.local/bin/
mv ~/.local/bin/logcli-linux-amd64 ~/.local/bin/logcli
chmod +x ~/.local/bin/logcli

#
# install Grafana xk6
#
GOBIN=~/.local/bin/ go install go.k6.io/xk6/cmd/xk6@v0.13.4

#
# build w/ loki k6 extension
#
mkdir -p src/github.com/grafana
pushd src/github.com/grafana
git clone https://github.com/grafana/xk6-loki
cd xk6-loki
git checkout 5248b47 # master/57 commits
make k6
mv k6 ~/.local/bin/k6
popd

#
# install NVM and Node.js
#
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v18.20.5

cat << 'EOF' >> ~/.bashrc

export LOKI_ADDR=http://localhost:3100
eval "$(logcli --completion-script-bash)"
EOF

#
# install MinIO client
#
MINIO_VERSION=2025-02-18T16-25-55Z

curl -L --silent --fail https://dl.min.io/client/mc/release/linux-amd64/archive/mc.RELEASE.${MINIO_VERSION} -o ~/.local/bin/mcli || \
    curl -L --silent --fail https://dl.min.io/client/mc/release/linux-amd64/mc.RELEASE.${MINIO_VERSION} -o ~/.local/bin/mcli || \
    curl -L --silent --fail https://dl.min.io/client/mc/release/linux-amd64/mc -o ~/.local/bin/mcli

chmod +x ~/.local/bin/mcli

newgrp - docker <<EOF
docker compose -f /vagrant/compose.yml up --quiet-pull --no-color --detach minio
EOF

# https://min.io/docs/minio/linux/reference/minio-mc/minio-client-settings.html
while ! mcli alias set local http://localhost:9000 admin minios3cr3t; do
    sleep 1
done

# https://min.io/docs/minio/container/administration/object-management/object-retention.html#tutorials
mcli admin user add local/ loki lokis3cr3t
mcli admin policy attach local/ readwrite --user loki
mcli mb --with-lock local/loki-data
mcli retention set --default governance 30d local/loki-data

newgrp - docker <<EOF
docker compose -f /vagrant/compose.yml down
EOF

SCRIPT
