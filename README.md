# Talk: Grafana Loki Unleashed

From the Website of Grafana Loki:

> Like Prometheus, but for logs!

Presented at:
* DevOps Meetup Leipzig #2 - Exploring Generative AI and Unleashing Grafana Loki -- 2023/08/23
* DevOps Meetup Thüringen - DevOps meets Machine Learning & Grafana Loki -- 2023/11/21

## Slides

Slides are build with [Vite](https://vitejs.dev/) and [reveal.js](https://revealjs.com/).

```bash
$ npm install
$ npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in a browser.

## Print Slides as PDF

Open [http://localhost:5173/?print-pdf](http://localhost:5173/?print-pdf) in a Chrome and print the pages as PDF.

## Upgrade PostgreSQL ##

> [!IMPORTANT]
> Error: in 18+, these Docker images are configured to store database data in a
> format which is compatible with "pg_ctlcluster" (specifically, using
> major-version-specific directory names).  This better reflects how
> PostgreSQL itself works, and how upgrades are to be performed.
> 
>        See also docker-library/postgres#1259
> 
>        Counter to that, there appears to be PostgreSQL data in:
>          /var/lib/postgresql/data (unused mount/volume)
> 
>        This is usually the result of upgrading the Docker image without
>        upgrading the underlying database using "pg_upgrade" (which requires both
>        versions).
> 
>        The suggested container configuration for 18+ is to place a single mount
>        at /var/lib/postgresql which will then place PostgreSQL data in a
>        subdirectory, allowing usage of "pg_upgrade --link" without mount point
>        boundary issues.
>
>        See docker-library/postgres#37 for a (long)
>        discussion around this process, and suggestions for how to do so.

```bash
$ grep 'image: postgres:' compose.yml
    image: postgres:17.7
$ docker compose up postgres -d
[+] up 2/2
 ✔ Network vagrant_default      Created  0.1s
 ✔ Container vagrant-postgres-1 Created  0.0s
$ docker compose exec postgres /usr/bin/pg_dump --username postgres --dbname grafana --blobs > db.out
$ docker compose down postgres
[+] down 2/2
 ✔ Container vagrant-postgres-1 Removed  0.2s
 ✔ Network vagrant_default      Removed  0.2s
$ mv ~/postgres ~/postgres-17
$ mkdir ~/postgres
$ git pull
$ grep 'image: postgres:' compose.yml
    image: postgres:18.1
$ docker compose up postgres -d
[+] up 2/2
 ✔ Network vagrant_default      Created  0.1s
 ✔ Container vagrant-postgres-1 Created  0.0s
$ docker compose cp db.out postgres:/db.out
[+] copy 1/1
 ✔ vagrant-postgres-1 Copied db.out to vagrant-postgres-1:/db.out 0.1s
$ docker compose exec postgres /usr/bin/psql --username postgres -d grafana -X -f /db.out
$ docker compose down postgres
[+] down 2/2
 ✔ Container vagrant-postgres-1 Removed  0.5s
 ✔ Network vagrant_default      Removed  0.1s
```

## Demo

Start the virtual machine by:
```
$ vagrant up
Bringing machine 'default' up with 'virtualbox' provider...
==> default: Importing base box 'opensuse/Tumbleweed.x86_64'...
==> default: Generating MAC address for NAT networking...
…
==> default: Running provisioner: shell...
default: Running: inline script
default: Retrieving repository 'openSUSE-Tumbleweed-Non-Oss' metadata [.........done]
default: Building repository 'openSUSE-Tumbleweed-Non-Oss' cache [...done]
…
==> default: Running provisioner: shell...
default: Running: inline script
default: Archive:  /tmp/logcli-linux-amd64.zip
default:   inflating: /home/vagrant/.local/bin/logcli-linux-amd64
…
```
Start the containers by:
```
$ vagrant ssh
Have a lot of fun...
vagrant@loki:~> cd /vagrant/
vagrant@loki:/vagrant> docker compose up -d
…
```

These dashboards are available:

* [System Overview](http://192.168.56.10:3000/d/d7e9d3e6-0aad-4980-88b3-43ac8ef4acaa/system-overview?orgId=1&refresh=5s)
* [Log Queries](http://192.168.56.10:3000/d/c8f55f86-6b68-4919-a00e-fadb98b90b51/log-queries?orgId=1&refresh=5s) †
* [Metrics Queries](http://192.168.56.10:3000/d/c86dd408-9e4b-4934-ae63-0565302cc933/metric-queries?orgId=1&refresh=5s) †
* [Promtail Metrics Stage](http://192.168.56.10:3000/d/b425a9d0-8f33-489a-948e-54bbf8810d56/promtail-metrics-stage?orgId=1&refresh=5s) ‡

†: requires to generate some sample log data via [Grafana k6](https://k6.io/):
```bash
$ vagrant ssh
Have a lot of fun...
vagrant@loki:~> cd /vagrant/
vagrant@loki:/vagrant> k6 run -e FORMAT=logfmt --iterations 100 k6/script.js

          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: k6/script.js
     output: -

  scenarios: (100.00%) 1 scenario, 1 max VUs, 10m30s max duration (incl. graceful stop):
           * default: 100 iterations shared among 1 VUs (maxDuration: 10m0s, gracefulStop: 30s)


running (00m14.6s), 1/1 VUs, 13 complete and 0 interrupted iterations
default   [===>----------------------------------] 1 VUs  00m14.6s/10m0s  013/100 shared iters
…
```

‡: requires a non empty log file in `/home/vagrant/promtail/log/`, e.g.:
```bash
vagrant@loki:/vagrant> watch -n 1 'date >> /home/vagrant/promtail/log/date.log'
```
