# Talk: Grafana Loki Unleased

From the Website of Grafana Loki:

> Like Prometheus, but for logs!

Presented at:
* DevOps Meetup Leipzig #2 - Exploring Generative AI and Unleashing Grafana Loki -- 2023/08/23

## Slides

Slides are build with [Vite](https://vitejs.dev/) and [reveal.js](https://revealjs.com/).

```bash
$ npm install
$ npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in a browser.

## Print Slides as PDF

Open [http://localhost:5173/?print-pdf](http://localhost:5173/?print-pdf) in a Chrome and print the pages as PDF.

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
vagrant@loki:/vagrant> docker-compose up -d
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
