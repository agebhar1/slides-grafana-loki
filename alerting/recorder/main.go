package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"time"
)

func dump(w http.ResponseWriter, r *http.Request) {

	fmt.Println("=========== Request ===========")
	fmt.Printf("== %s ==\n", time.Now().Format("2006-01-02T15:04:05Z07:00"))
	fmt.Printf("%s %s %s\n", r.Method, r.RequestURI, r.Proto)
	for name, headers := range r.Header {
		for _, h := range headers {
			fmt.Printf("%s: %s\n", name, h)
		}
	}

	fmt.Println()
	body, err := io.ReadAll(r.Body)
	if err == nil {
		var prettyJSON bytes.Buffer
		if json.Indent(&prettyJSON, body, "", "  ") == nil {
			fmt.Println(prettyJSON.String())
		} else {
			fmt.Println(string(body))
		}
	}
	fmt.Println("========== [Request] ==========")

	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("1")) // required for Teams Webhook
}

func main() {
	var addr string

	flag.StringVar(&addr, "listen-address", ":8090", "listen TCP network address")
	flag.Parse()

	http.HandleFunc("/", dump)
	fmt.Printf("listen at %s\n", addr)
	_ = http.ListenAndServe(addr, nil)
}
