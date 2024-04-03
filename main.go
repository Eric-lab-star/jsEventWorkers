package main

import (
	"net/http"
	"os"
)

func main() {
	wd, err := os.Getwd()
	if err != nil {
		panic("err")
	}
	fsys := os.DirFS(wd)
	http.ListenAndServe(":4000", http.FileServerFS(fsys))

}
