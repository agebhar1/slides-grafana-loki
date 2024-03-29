# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

    config.vm.box = "opensuse/Tumbleweed.x86_64"
    config.vm.box_version = "1.0.20240314"

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
zypper refresh
zypper update
zypper --non-interactive install docker htop jq tree tmux unzip
zypper --non-interactive install git-core go1.22 make

systemctl enable docker
systemctl start docker
systemctl status docker

usermod -aG docker vagrant
SCRIPT

$provision = <<-SCRIPT
pushd /vagrant
test -e .env || ln -s dotenv .env || cp dotenv .env
popd

mkdir -p ~/{loki,postgres,prometheus,promtail/log}

#
# install Docker Compose
#
curl -L --silent https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-linux-x86_64 -o ~/.local/bin/docker-compose
chmod +x ~/.local/bin/docker-compose

#
# install Grafana logcli
#
curl -L --silent https://github.com/grafana/loki/releases/download/v2.9.6/logcli-linux-amd64.zip -o /tmp/logcli-linux-amd64.zip
unzip /tmp/logcli-linux-amd64.zip -d ~/.local/bin/
mv ~/.local/bin/logcli-linux-amd64 ~/.local/bin/logcli
chmod +x ~/.local/bin/logcli

#
# install Grafana xk6
#
GOBIN=~/.local/bin/ go install go.k6.io/xk6/cmd/xk6@v0.11.0

#
# build w/ loki k6 extension
#
mkdir -p src/github.com/grafana
pushd src/github.com/grafana
git clone https://github.com/grafana/xk6-loki
cd xk6-loki
git checkout 12ba135 # master/56 commits
make k6
mv k6 ~/.local/bin/k6
popd

#
# install NVM and Node.js
#
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install v18.19.1

cat << 'EOF' >> ~/.bashrc

export LOKI_ADDR=http://localhost:3100
eval "$(logcli --completion-script-bash)"
EOF

SCRIPT
