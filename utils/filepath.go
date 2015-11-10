package utils

import "os"

func FileExists(path string) bool {
	if _, err := os.Stat(path); err == nil {
		return true
	}
	return false
}

func IsDir(path string) bool {
	if stat, err := os.Stat(path); err != nil {
		return stat.IsDir()
	}
	return false
}
