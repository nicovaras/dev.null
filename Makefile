all:
	@echo "Doing all"

deploy:
	@echo "Pushing to production"
	@git push git@example.com:~/testapp master

update:
	@whoami
	@cd dev; export JEKYLL_ENV=production; bower install && bundle install && bundle exec jekyll build
	@cp -R dev/_site/* /var/www/dev.null.com.ar/
