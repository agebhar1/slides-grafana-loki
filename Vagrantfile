# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.box = "Tumbleweed.x86_64"
    config.vm.box_url = "https://download.opensuse.org/tumbleweed/appliances/boxes/Tumbleweed.x86_64.json"

    config.vm.hostname = 'loki'
    config.vm.network :private_network, ip: '192.168.56.10'

    config.vm.provider "virtualbox" do |vb|
        vb.memory = 1024 * 16
        vb.cpus = 4
        vb.customize ["modifyvm", :id, "--vram", "8"]
        vb.customize ["modifyvm", :id, "--graphicscontroller", "vmsvga"]
    end

    if Vagrant.has_plugin?("vagrant-proxyconf")
        # if required then configure the proxy
        config.proxy.enabled = false
    end

    config.vm.provision "shell", inline: $provision_privileged
    config.vm.provision "shell", inline: $provision, privileged: false

end

$provision_privileged = <<-SCRIPT
zypper refresh
zypper --non-interactive update
zypper --non-interactive install docker htop jq tree tmux unzip
zypper --non-interactive install git-core go1.26 make

systemctl enable docker
systemctl start docker
systemctl status docker

usermod -aG docker vagrant
SCRIPT

$provision = <<-SCRIPT
pushd /vagrant
test -e .env || ln -s dotenv .env || cp dotenv .env
popd

mkdir -p ~/{.docker/cli-plugins,loki,postgres,prometheus,promtail/log,rustfs}

#
# install Docker Compose
#
curl -L --silent https://github.com/docker/compose/releases/download/v5.1.4/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

#
# install Grafana logcli
#
curl -L --silent https://github.com/grafana/loki/releases/download/v2.9.17/logcli-linux-amd64.zip -o /tmp/logcli-linux-amd64.zip
unzip /tmp/logcli-linux-amd64.zip -d ~/.local/bin/
mv ~/.local/bin/logcli-linux-amd64 ~/.local/bin/logcli
chmod +x ~/.local/bin/logcli

#
# install Grafana xk6
#
GOBIN=~/.local/bin/ go install go.k6.io/xk6/cmd/xk6@v1.4.6

#
# build w/ loki k6 extension
#
mkdir -p src/github.com/grafana
pushd src/github.com/grafana
git clone https://github.com/grafana/xk6-loki
cd xk6-loki
git checkout v1.0.3
make k6
mv k6 ~/.local/bin/k6
popd

#
# install NVM and Node.js
#
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v24.16.0

cat << 'EOF' >> ~/.bashrc

export LOKI_ADDR=http://localhost:3100
eval "$(logcli --completion-script-bash)"
EOF

#
# install RustFS client -- https://github.com/rustfs/cli
#
curl -L --silent https://github.com/rustfs/cli/releases/download/v0.1.21/rustfs-cli-linux-amd64-v0.1.21.tar.gz | tar --directory ~/.local/bin/ -xzf -

chmod +x ~/.local/bin/rc

cat << 'EOF' >> ~/.bashrc

source <(rc completions bash)
EOF

#
# setup Loki bucket
#
newgrp - docker <<EOF
docker compose -f /vagrant/compose.yml up --quiet-pull --no-color --detach rustfs
EOF

(
export $(grep ^RUSTFS_ /vagrant/.env | xargs)
while ! rc alias set local http://localhost:9000 ${RUSTFS_ACCESS_KEY:-rustfsadmin} ${RUSTFS_SECRET_KEY:-rustfsadmin}; do
    sleep 1
done
)

rc admin user add local loki lokis3cr3t
rc admin policy attach local readwrite --user loki
rc bucket create --with-lock local/loki-data
rc bucket lifecycle rule add local/loki-data --expiry-days 30

newgrp - docker <<EOF
docker compose -f /vagrant/compose.yml down
EOF

SCRIPT
