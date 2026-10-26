.PHONY: release

release:
	git push origin development
	git push --force-with-lease origin development:release
